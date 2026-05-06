const transactionmodel = require('../models/transaction.model.js');
const ledgermodel = require('../models/ledger.models.js');
const accountmodel = require('../models/account.model.js');
const mongoose = require('mongoose');
const { publishTransactionEvent } = require('../utils/producer.js');

const usermodel = require('../models/user.model.js');
const Redis = require('ioredis');

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
        redisClient.publish('payment_updates', JSON.stringify({
            userId: account.user,
            amount: parseFloat(amount),
            status: 'SUCCESS',
            from: account._id,
            type: 'DEPOSIT' // So the frontend knows it was a deposit
        }));

        res.status(200).send("Webhook Processed Successfully");

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { createdeposit, createtransfer, gethistory, createwithdraw, upiWebhook };
