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

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Apex Digital Portfolio" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #f8fafc;">
                    <div style="background: linear-gradient(to right, #2563eb, #10b981); padding: 24px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Apex Digital Portfolio</h1>
                        <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Educational IT Simulation</p>
                    </div>
                    <div style="padding: 32px; background: white;">
                        ${html}
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                        <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
                            This is an automated log from the Apex Digital Portfolio project. 
                            This is a simulated environment for demonstration purposes.
                        </p>
                    </div>
                    <div style="background: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
                        &copy; 2026 Apex Digital Portfolio | Developer Project by Divyansh
                    </div>
                </div>
            `,
        });
        console.log('[NOTIFY] Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('[NOTIFY] Email delivery failed:', error.message);
    }
};

const sendTransactionEmail = async (type, data) => {
    const { amount, userEmail, from, to, timestamp } = data;
    const formattedAmount = `₹${amount.toLocaleString()}`;
    const dateStr = new Date(timestamp || Date.now()).toLocaleString();

    let subject = `Apex Portfolio: Simulation Update (${type})`;
    let bodyContent = '';

    if (type === 'DEPOSIT') {
        bodyContent = `
            <h2 style="color: #0d9488;">Simulation Credits Added</h2>
            <p style="color: #334155; font-size: 16px;">New demo credits have been added to your simulation profile.</p>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0d9488;">+ ${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${dateStr}</td></tr>
            </table>
        `;
    } else if (type === 'WITHDRAWAL') {
        bodyContent = `
            <h2 style="color: #dc2626;">Simulation Credits Removed</h2>
            <p style="color: #334155; font-size: 16px;">Demo credits have been removed from your simulation profile.</p>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">- ${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${dateStr}</td></tr>
            </table>
        `;
    } else if (type === 'TRANSFER') {
        bodyContent = `
            <h2 style="color: #2563eb;">Simulation Transfer Sent</h2>
            <p style="color: #334155; font-size: 16px;">Your simulated transfer to profile <b>${to}</b> has been recorded.</p>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2563eb;">- ${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Recipient ID:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${to}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${dateStr}</td></tr>
            </table>
        `;
    }

    if (userEmail && bodyContent) {
        await sendEmail(userEmail, subject, bodyContent);
    }
};

module.exports = { sendTransactionEmail };
