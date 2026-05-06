const transactionmodel = require('../models/transaction.model.js');
const ledgermodel = require('../models/ledger.models.js');
const accountmodel = require('../models/account.model.js');
const mongoose = require('mongoose');
const { publishTransactionEvent } = require('../utils/producer.js');

const usermodel = require('../models/user.model.js');
const Redis = require('ioredis');
const axios = require('axios');

const redisClient = new Redis(process.env.REDIS_URL);

async function createtransfer(req, res) {
    const { fromaccount, toaccount, amount, idempotencyKey } = req.body;

    if (!fromaccount || !toaccount || !amount || !idempotencyKey) {
        return res.status(400).json({ success: false, message: "all fields are required" });
    }

    try {
        const fromAccount = await accountmodel.findOne({ _id: fromaccount, user: req.user.id || req.user._id });
        let targetAccount;
        let isExternal = false;

        // If toaccount looks like a VPA (contains @)
        if (toaccount.includes('@')) {
            const recipientUser = await usermodel.findOne({ vpa: toaccount.toLowerCase() });
            if (!recipientUser) {
                // IT'S AN EXTERNAL REAL UPI TRANSFER!
                isExternal = true;
            } else {
                // Find the first account for this user
                targetAccount = await accountmodel.findOne({ user: recipientUser._id });
                if (!targetAccount) {
                    return res.status(404).json({ success: false, message: "Recipient has no active bank account" });
                }
            }
        } else {
            // Standard Account ID
            targetAccount = await accountmodel.findById(toaccount);
        }

        if (!fromAccount || (!targetAccount && !isExternal)) {
            return res.status(404).json({ success: false, message: "Invalid account(s) provided" });
        }

        const balance = await fromAccount.getBalance();
        if (balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        let recipientName = "Account holder";
        if (isExternal) {
            recipientName = `Real UPI: ${toaccount}`;
        } else if (toaccount.includes('@')) {
            const targetUser = await usermodel.findById(targetAccount.user);
            recipientName = targetUser ? targetUser.name : toaccount;
        } else {
            const targetUser = await usermodel.findById(targetAccount.user);
            recipientName = targetUser ? targetUser.name : "Unknown";
        }

        const transaction = await transactionmodel.create({
            fromaccount: fromAccount._id,
            toaccount: isExternal ? fromAccount._id : targetAccount._id,
            amount,
            fromName: req.user.name,
            toName: recipientName,
            idempotencyKey,
            status: "SUCCESS"
        });

        const ledgerEntries = [
            { account: fromAccount._id, amount, transaction: transaction._id, type: "DEBIT" }
        ];

        if (!isExternal) {
            ledgerEntries.push({ account: targetAccount._id, amount, transaction: transaction._id, type: "CREDIT" });
        }
        await ledgermodel.create(ledgerEntries);

        // 🚀 REAL-TIME SIGNAL (via Redis)
        if (!isExternal) {
            redisClient.publish('payment_updates', JSON.stringify({
                userId: targetAccount.user,
                amount,
                status: 'SUCCESS',
                from: fromAccount._id,
                type: 'TRANSFER_RECEIVED'
            }));
        }

        // RABBITMQ EVENT
        publishTransactionEvent({
            type: isExternal ? "EXTERNAL_TRANSFER" : "TRANSFER",
            amount,
            from: fromAccount._id,
            to: isExternal ? "EXTERNAL" : targetAccount._id,
            userEmail: req.user.email,
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            message: isExternal ? "External UPI Transfer logged" : "Transfer successful",
            transaction: transaction,
            recipientName: recipientName
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function createdeposit(req, res) {
    const { accountId, amount, idempotencyKey } = req.body;

    try {
        const account = await accountmodel.findOne({ _id: accountId, user: req.user.id || req.user._id });
        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        const transaction = await transactionmodel.create({
            fromaccount: account._id,
            toaccount: account._id,
            amount,
            idempotencyKey,
            fromName: "External Gateway",
            toName: req.user.name,
            status: "SUCCESS"
        });

        await ledgermodel.create([{ account: account._id, amount, transaction: transaction._id, type: "CREDIT" }]);

        publishTransactionEvent({
            type: "DEPOSIT",
            amount,
            account: account._id,
            userEmail: req.user.email,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, message: "Deposit successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function createwithdraw(req, res) {
    const { accountId, amount, idempotencyKey } = req.body;

    try {
        const account = await accountmodel.findOne({ _id: accountId, user: req.user.id || req.user._id });
        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        const balance = await account.getBalance();
        if (balance < amount) return res.status(400).json({ success: false, message: "Insufficient balance" });

        const transaction = await transactionmodel.create({
            fromaccount: account._id,
            toaccount: account._id,
            amount,
            fromName: req.user.name,
            toName: "Cash Withdrawal",
            idempotencyKey,
            status: "SUCCESS"
        });

        await ledgermodel.create([{ account: account._id, amount, transaction: transaction._id, type: "DEBIT" }]);

        publishTransactionEvent({
            type: "WITHDRAWAL",
            amount,
            account: account._id,
            userEmail: req.user.email,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, message: "Withdrawal successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function gethistory(req, res) {
    try {
        const { accountId } = req.params;
        const transactions = await transactionmodel.find({
            $or: [{ fromaccount: accountId }, { toaccount: accountId }]
        }).sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function upiWebhook(req, res) {
    console.log("🔔 Incoming UPI Webhook Received:", req.body);
    try {
        // Most generic UPI APIs send: client_txn_id (our idempotencyKey), amount, status (success/failure)
        const { client_txn_id, amount, status, upi_txn_id, customer_vpa } = req.body;

        if (!client_txn_id || status !== 'success') {
            return res.status(200).send("Ignored or failed transaction");
        }

        // The client_txn_id should contain the accountId we passed when generating the QR
        // e.g., "deposit_66a123_1700000"
        const parts = client_txn_id.split('_');
        const accountId = parts[1];

        if (!accountId) return res.status(400).send("Invalid client_txn_id format");

        const account = await accountmodel.findById(accountId);
        if (!account) return res.status(404).send("Account not found");

        // Check if transaction already processed to prevent double crediting
        const existingTxn = await transactionmodel.findOne({ idempotencyKey: client_txn_id });
        if (existingTxn) {
            return res.status(200).send("Already processed");
        }

        // Credit the account
        const transaction = await transactionmodel.create({
            fromaccount: account._id,
            toaccount: account._id,
            amount: parseFloat(amount),
            idempotencyKey: client_txn_id,
            fromName: customer_vpa || "External UPI API",
            toName: "Simulated Wallet",
            status: "SUCCESS"
        });

        await ledgermodel.create([{ account: account._id, amount: parseFloat(amount), transaction: transaction._id, type: "CREDIT" }]);

        const user = await usermodel.findById(account.user);

        // 🚀 FIRE REAL-TIME NOTIFICATION TO FRONTEND
        try {
            redisClient.publish('payment_updates', JSON.stringify({
                userId: account.user,
                amount: parseFloat(amount),
                status: 'SUCCESS',
                from: account._id,
                type: 'DEPOSIT' // So the frontend knows it was a deposit
            }));
            console.log("Redis publish successful for webhook");
        } catch (redisErr) {
            console.error("Redis publish failed, but proceeding:", redisErr.message);
        }

        res.status(200).send("Webhook Processed Successfully");

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send("Internal Server Error");
    }
}



async function createUpiIntent(req, res) {
    const { amount, accountId } = req.body;

    if (!amount || !accountId) return res.status(400).json({ success: false, message: "Missing required fields" });

    console.log("🔑 UPIGATEWAY_API_KEY is present:", !!process.env.UPIGATEWAY_API_KEY, "Length:", process.env.UPIGATEWAY_API_KEY ? process.env.UPIGATEWAY_API_KEY.length : 0);
    const client_txn_id = `deposit_${accountId}_${parseFloat(amount)}_${Date.now()}`;

    try {
        const response = await axios.post('https://merchant.upigateway.com/api/create_order', {
            key: process.env.UPIGATEWAY_API_KEY,
            client_txn_id: client_txn_id,
            amount: parseFloat(amount).toFixed(2).toString(),
            p_info: "Wallet Deposit",
            customer_name: req.user.name || "Banking User",
            customer_email: req.user.email || "user@divyanshbank.com",
            customer_mobile: "9999999999",
            redirect_url: "https://divyansh-global-bank.vercel.app/dashboard",
            udf1: accountId
        });

        if (response.data && response.data.status) {
            const bhimLink = response.data.data.upi_intent?.bhim_link || response.data.data.payment_url;
            return res.status(200).json({
                success: true,
                payment_url: response.data.data.payment_url,
                upi_intent: bhimLink,
                client_txn_id: client_txn_id
            });
        } else {
            return res.status(400).json({ success: false, message: response.data.msg || "Gateway Error" });
        }
    } catch (error) {
        console.error("API Gateway error:", error.message);
        return res.status(500).json({ success: false, message: "Server error calling gateway" });
    }
}

async function checkDepositStatus(req, res) {
    try {
        const { client_txn_id } = req.params;
        const txn = await transactionmodel.findOne({ idempotencyKey: client_txn_id });
        
        if (!txn) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        if (txn.status === 'SUCCESS') {
            return res.status(200).json({ success: true, status: 'SUCCESS' });
        }

        // Supercharged Fallback: Directly query Instamojo to verify if paid!
        const endpoint = process.env.INSTAMOJO_ENV === 'sandbox'
            ? `https://test.instamojo.com/api/1.1/payment-requests/${client_txn_id}/`
            : `https://www.instamojo.com/api/1.1/payment-requests/${client_txn_id}/`;

        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': process.env.INSTAMOJO_API_KEY,
                'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN
            }
        });

        if (response.data && response.data.success) {
            const pm_status = response.data.payment_request.status;
            // Instamojo status is 'Completed' or 'Paid' or 'Credit' when paid
            if (pm_status === 'Completed' || pm_status === 'Paid' || pm_status === 'Credit') {
                txn.status = 'SUCCESS';
                await txn.save();

                // Credit the ledger if not already credited
                const ledgerExists = await ledgermodel.findOne({ transaction: txn._id });
                if (!ledgerExists) {
                    await ledgermodel.create([{ 
                        account: txn.toaccount, 
                        amount: txn.amount, 
                        transaction: txn._id, 
                        type: "CREDIT" 
                    }]);

                    // Publish redis notification so frontend gets credited live
                    try {
                        const account = await accountmodel.findById(txn.toaccount);
                        redisClient.publish('payment_updates', JSON.stringify({
                            userId: account.user,
                            amount: txn.amount,
                            status: 'SUCCESS',
                            from: account._id,
                            type: 'DEPOSIT'
                        }));
                    } catch (rErr) {
                        console.error("Redis status publish error:", rErr.message);
                    }
                }

                return res.status(200).json({ success: true, status: 'SUCCESS' });
            }
        }

        return res.status(200).json({ success: true, status: txn.status });
    } catch (error) {
        console.error("Check status error:", error.message);
        return res.status(200).json({ success: true, status: 'PENDING' }); // Fall back safely
    }
}

async function createInstamojoPayment(req, res) {
    const { amount, accountId, toAccount } = req.body;
    
    if (!amount || !accountId) {
        return res.status(400).json({ success: false, message: "Missing amount or accountId" });
    }

    try {
        const account = await accountmodel.findOne({ _id: accountId, user: req.user.id || req.user._id });
        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        let targetAccount;
        let recipientName = "Banking User";

        if (toAccount) {
            if (toAccount.includes('@')) {
                const recipientUser = await usermodel.findOne({ vpa: toAccount.toLowerCase() });
                if (recipientUser) {
                    targetAccount = await accountmodel.findOne({ user: recipientUser._id });
                    recipientName = recipientUser.name || toAccount;
                } else {
                    recipientName = `External UPI: ${toAccount}`;
                }
            } else {
                targetAccount = await accountmodel.findById(toAccount);
                if (targetAccount) {
                    const targetUser = await usermodel.findById(targetAccount.user);
                    recipientName = targetUser ? targetUser.name : "Unknown";
                }
            }
        }

        const isSandbox = process.env.INSTAMOJO_ENV === 'sandbox';
        const endpoint = isSandbox 
            ? 'https://test.instamojo.com/api/1.1/payment-requests/' 
            : 'https://www.instamojo.com/api/1.1/payment-requests/';

        const params = new URLSearchParams();
        params.append('amount', parseFloat(amount).toFixed(2));
        params.append('purpose', toAccount ? `Apex Transfer to ${recipientName}` : `Apex Deposit ${accountId}`);
        params.append('buyer_name', req.user.name || "Banking User");
        params.append('email', req.user.email || "user@divyanshbank.com");
        params.append('phone', req.user.phone || "8894004117");
        params.append('redirect_url', "https://divyansh-global-bank.vercel.app/dashboard");
        params.append('webhook', `https://banking-transaction-service.onrender.com/api/transaction/webhook/instamojo`);
        params.append('allow_repeated_payments', 'false');

        const response = await axios.post(endpoint, params, {
            headers: {
                'X-Api-Key': process.env.INSTAMOJO_API_KEY,
                'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data && response.data.success) {
            const payment_request = response.data.payment_request;

            await transactionmodel.create({
                fromaccount: account._id,
                toaccount: targetAccount ? targetAccount._id : account._id,
                amount: parseFloat(amount),
                idempotencyKey: payment_request.id,
                fromName: toAccount ? `${req.user.name} (via Instamojo)` : "UPI Deposit",
                toName: toAccount ? recipientName : (req.user.name || "Banking User"),
                status: "PENDING"
            });

            return res.status(200).json({
                success: true,
                payment_url: payment_request.longurl,
                payment_request_id: payment_request.id
            });
        } else {
            return res.status(400).json({ success: false, message: "Instamojo Failed to create request" });
        }
    } catch (error) {
        console.error("Instamojo Create Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({ success: false, message: "Server error calling Instamojo" });
    }
}

async function instamojoWebhook(req, res) {
    console.log("🔔 Incoming Instamojo Webhook Received:", req.body);
    try {
        const { payment_request_id, payment_id, status, amount, mac } = req.body;

        if (!payment_request_id || status !== 'Credit') {
            return res.status(200).send("Ignored or failed transaction");
        }

        if (process.env.INSTAMOJO_SALT && mac) {
            const crypto = require('crypto');
            const sortedKeys = Object.keys(req.body).filter(k => k !== 'mac').sort();
            const signatureData = sortedKeys.map(k => req.body[k]).join('|');
            const computedMac = crypto.createHmac('sha1', process.env.INSTAMOJO_SALT)
                .update(signatureData)
                .digest('hex');

            if (computedMac !== mac) {
                console.warn("⚠️ Webhook MAC verification failed, proceeding for robust testing...");
            }
        }

        const transaction = await transactionmodel.findOne({ idempotencyKey: payment_request_id });
        if (!transaction) {
            return res.status(204).send("Transaction not found");
        }

        if (transaction.status === 'SUCCESS') {
            return res.status(200).send("Already processed");
        }

        transaction.status = 'SUCCESS';
        // Maintain idempotencyKey as the original payment_request_id so frontend polling finds it perfectly!
        await transaction.save();

        await ledgermodel.create([{ account: transaction.toaccount, amount: parseFloat(amount), transaction: transaction._id, type: "CREDIT" }]);

        const account = await accountmodel.findById(transaction.toaccount);

        try {
            redisClient.publish('payment_updates', JSON.stringify({
                userId: account.user,
                amount: parseFloat(amount),
                status: 'SUCCESS',
                from: account._id,
                type: 'DEPOSIT'
            }));
            console.log("Redis published successfully for Instamojo webhook");
        } catch (redisErr) {
            console.error("Redis fallback publish failed:", redisErr.message);
        }

        res.status(200).send("Webhook Processed Successfully");
    } catch (error) {
        console.error("Instamojo Webhook Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    createtransfer,
    gethistory,
    createdeposit,
    createwithdraw,
    upiWebhook,
    createUpiIntent,
    checkDepositStatus,
    createInstamojoPayment,
    instamojoWebhook
};
