const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');

const app = express();

// MANUAL CORS AND LOGGING
app.use((req, res, next) => {
    console.log(`[AUTH] ${req.method} request to ${req.url} from ${req.headers.origin}`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    // Handle Preflight (OPTIONS) instantly
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount all auth routes to handle both prefixed and direct requests
app.use('/api/auth', authRoutes);
app.use('/', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: "AUTH_SERVICE_UP", timestamp: new Date() });
});

module.exports = app;
