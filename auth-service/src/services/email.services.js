require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// No transporter.verify() here anymore - it causes startup hangs!

const sendEmail = async (to, subject, text, html) => {
    // If we don't have credentials, don't even try - prevents timeouts!
    if (!process.env.EMAIL_USER || !process.env.REFRESH_TOKEN) {
        console.log("[EMAIL] Skipping: Missing credentials");
        return;
    }

    try {
        // Set a strict 3-second timeout so it never clogs the server!
        const info = await Promise.race([
            transporter.sendMail({
                from: `"Apex Global Bank" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html,
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Email Timeout')), 3000))
        ]);
        console.log('[EMAIL] Message sent:', info.messageId);
    } catch (error) {
        console.error('[EMAIL] Silently ignored error:', error.message);
    }
};

async function sendregiseremail(useremail, name) {
    const subj = "Welcome to Apex Global Bank!";
    const text = `Hello ${name}, your journey with Apex Global Bank begins today!`;
    const html = `<h1>Hello ${name},</h1><p>Welcome to <b>Apex Global Bank</b>. Your digital account is now active!</p>`;
    
    // We don't await here to ensure zero-blockage
    sendEmail(useremail, subj, text, html);
}

module.exports = { sendregiseremail }; 
