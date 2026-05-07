const mongoose = require('mongoose');

const bankConnectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserFresh",
        required: true,
        index: true
    },
    bankName: {
        type: String,
        required: true,
        enum: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank']
    },
    accountNumber: {
        type: String,
        required: true
    },
    upiPin: {
        type: String, // Hashed 6-digit PIN
        required: true
    },
    balance: {
        type: Number,
        default: 25000.00
    }
}, { timestamps: true });

const BankConnectionModel = mongoose.models.BankConnection || mongoose.model("BankConnection", bankConnectionSchema);
module.exports = BankConnectionModel;
