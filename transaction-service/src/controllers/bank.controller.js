const BankConnection = require('../models/bank.model.js');
const crypto = require('crypto');

function hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex');
}

async function linkBank(req, res) {
    const { bankName, upiPin } = req.body;
    const userId = req.user.id || req.user._id;

    if (!bankName || !upiPin || upiPin.length !== 6) {
        return res.status(400).json({ success: false, message: "Please select a bank and enter a valid 6-digit PIN" });
    }

    try {
        const hashedPin = hashPin(upiPin);

        // Generate a realistic masked account number
        const phone = req.user.phone || "8894004117";
        const lastDigits = phone.slice(-4);
        const accountNumber = `XXXX XXXX ${lastDigits}`;

        const newLink = await BankConnection.create({
            user: userId,
            bankName,
            accountNumber,
            upiPin: hashedPin,
            balance: 25000.00 // Simulated starting balance
        });

        res.status(201).json({ success: true, message: "Bank linked successfully!", data: newLink });
    } catch (error) {
        console.error("Link Bank Error:", error.message);
        res.status(500).json({ success: false, message: "Server error linking bank account" });
    }
}

async function getLinkedBanks(req, res) {
    const userId = req.user.id || req.user._id;
    try {
        const banks = await BankConnection.find({ user: userId });
        res.status(200).json({ success: true, data: banks });
    } catch (error) {
        console.error("Get Linked Banks Error:", error.message);
        res.status(500).json({ success: false, message: "Server error fetching linked bank accounts" });
    }
}

async function checkBalance(req, res) {
    const { bankId, upiPin } = req.body;

    if (!bankId || !upiPin) {
        return res.status(400).json({ success: false, message: "Bank ID and UPI PIN are required" });
    }

    try {
        const bank = await BankConnection.findById(bankId);
        if (!bank) return res.status(404).json({ success: false, message: "Linked bank not found" });

        const hashedEnteredPin = hashPin(upiPin);
        if (hashedEnteredPin !== bank.upiPin) {
            return res.status(400).json({ success: false, message: "Incorrect 6-digit UPI PIN" });
        }

        res.status(200).json({ success: true, balance: bank.balance });
    } catch (error) {
        console.error("Check Balance Error:", error.message);
        res.status(500).json({ success: false, message: "Server error checking balance" });
    }
}

module.exports = {
    linkBank,
    getLinkedBanks,
    checkBalance
};
