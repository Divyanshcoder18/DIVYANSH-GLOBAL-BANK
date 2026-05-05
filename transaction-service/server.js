require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = require('./src/app.js');
const { connectRabbitMQ } = require('./src/utils/producer.js');

const PORT = process.env.PORT || 10000;

// FAST STARTUP: Listen immediately
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Transaction Service listening on port ${PORT}`);
});

// BACKGROUND TASKS: Don't block the listener
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-system')
    .then(() => {
        console.log("✅ Transaction Service Database Connected");
        connectRabbitMQ();
    })
    .catch((err) => console.error("❌ Transaction Service DB Error:", err));
