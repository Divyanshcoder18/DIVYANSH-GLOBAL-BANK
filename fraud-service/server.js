require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// FAST HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

const PORT = process.env.PORT || 10000;

// FAST STARTUP: Listen immediately
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fraud Service listening on port ${PORT}`);
});

// BACKGROUND TASKS
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Fraud Service DB Connected"))
    .catch(err => console.error("❌ Fraud DB Error:", err));

connectRabbitMQ().catch(err => console.log("RabbitMQ pending..."));
