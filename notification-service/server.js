require('dotenv').config();
const express = require('express');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// FAST HEALTH CHECK (Minimal response size for cron-job.org)
app.get('/', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => res.status(200).send('UP'));

const PORT = process.env.PORT || 10000;

// FAST STARTUP: Listen immediately
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Notification Service listening on port ${PORT}`);
});

// BACKGROUND TASKS
connectRabbitMQ().catch(err => console.log("RabbitMQ pending..."));
