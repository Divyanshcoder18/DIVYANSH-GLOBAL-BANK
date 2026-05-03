const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Mount all auth routes with the expected prefix
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: "AUTH_SERVICE_UP", timestamp: new Date() });
});

module.exports = app;
