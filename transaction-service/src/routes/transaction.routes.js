const express = require('express');
const router = express.Router();
const { createtransfer, gethistory, createdeposit, createwithdraw, upiWebhook, createUpiIntent, checkDepositStatus, createInstamojoPayment, instamojoWebhook } = require('../controllers/transaction.controller.js');
const { createOrder, verifyPayment, verifyPaymentP2P, razorpayWebhook, initiateRealPayout, initiateRealP2PTransfer } = require('../controllers/payment.controller.js');
const { authmiddleware } = require('../middleware/auth.middleware.js');

// Standardized routes PROTECTED by authentication
router.post('/transfer', authmiddleware, createtransfer);
router.get('/history/:accountId', authmiddleware, gethistory);
router.post('/deposit', authmiddleware, createdeposit);
router.post('/deposit/upi-intent', authmiddleware, createUpiIntent);
router.post('/deposit/instamojo', authmiddleware, createInstamojoPayment);
router.get('/deposit/status/:client_txn_id', authmiddleware, checkDepositStatus);
router.post('/withdraw', authmiddleware, createwithdraw);

// Razorpay Payment & Payout Routes
router.post('/payment/order', authmiddleware, createOrder);
router.post('/payment/payout', authmiddleware, initiateRealPayout);
router.post('/payment/payout/p2p', authmiddleware, initiateRealP2PTransfer);
router.post('/payment/verify', authmiddleware, verifyPayment);
router.post('/payment/verify/p2p', authmiddleware, verifyPaymentP2P);

// Webhook Route (No Auth Middleware - Called by Razorpay)
router.post('/payment/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

// Generic UPI Webhook Route (No Auth - Called by UPIGateway/UPIAPI)
router.post('/webhook/upi', upiWebhook);

// Instamojo Webhook Route (No Auth - Called by Instamojo)
router.post('/webhook/instamojo', express.urlencoded({ extended: true }), instamojoWebhook);

module.exports = router;
