require('dotenv').config();
const express = require('express');
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
    console.log(`🚀 Notification Service listening on port ${PORT}`);
});

// BACKGROUND TASKS
connectRabbitMQ().catch(err => console.log("RabbitMQ pending..."));
