const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes.js');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const mongoose = require('mongoose');

// Simple mount at root (Gateway handles the prefix)
app.use('/', authRoutes);

app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED";
    res.json({ 
        status: "AUTH_SERVICE_UP", 
        database: dbStatus,
        timestamp: new Date() 
    });
});

module.exports = app;
