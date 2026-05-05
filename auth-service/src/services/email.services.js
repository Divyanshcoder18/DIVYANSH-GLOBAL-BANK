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

const sendEmail = async (to, subject, text, html) => {
    if (!process.env.EMAIL_USER || !process.env.REFRESH_TOKEN) {
        console.log("[EMAIL] Skipping: Missing credentials");
        return;
    }

    try {
        const info = await Promise.race([
            transporter.sendMail({
                from: `"Apex Digital Portfolio" <${process.env.EMAIL_USER}>`,
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
    const subj = "Welcome to Apex Digital Portfolio!";
    const text = `Hello ${name}, thank you for exploring my IT Portfolio simulation!`;
    const html = `<h1>Hello ${name},</h1><p>Welcome to <b>Apex Digital Portfolio</b>. Your simulation profile is now active! Feel free to explore the features.</p>`;
    
    sendEmail(useremail, subj, text, html);
}

module.exports = { sendregiseremail }; 
