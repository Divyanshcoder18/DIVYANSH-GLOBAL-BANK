const jwt = require('jsonwebtoken');
const usermodel = require('../models/user.model.js');
const tokenblacklistmodel = require('../models/blacklistmodel.js');

async function authmiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = req.cookies.token || (authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader));

    if (!token) {
        console.log("❌ [USER-SERVICE] Auth Failed: No token");
        return res.status(401).json({ message: "unauthorized access", debug: "no_token" });
    }

    try {
        const isblacklisted = await tokenblacklistmodel.findOne({ token });
        if (isblacklisted) {
            console.log("❌ [USER-SERVICE] Auth Failed: Token blacklisted");
            return res.status(401).json({ message: "unauthorized access", debug: "token_blacklisted" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'divu123');
        const user = await usermodel.findOne({ _id: decoded.id });

        if (!user) {
            console.log(`❌ [USER-SERVICE] Auth Failed: User ${decoded.id} not found in DB`);
            return res.status(401).json({ message: "unauthorized access", debug: "user_not_found_in_db" });
        }

        console.log(`✅ [USER-SERVICE] Auth Success: User ${user.email}`);
        req.user = user;
        next();
    } catch (error) {
        console.log("❌ [USER-SERVICE] Auth Failed: JWT Verify Error", error.message);
        return res.status(401).json({ message: "unauthorized access", debug: `jwt_error: ${error.message}` });
    }
}

module.exports = { authmiddleware };
