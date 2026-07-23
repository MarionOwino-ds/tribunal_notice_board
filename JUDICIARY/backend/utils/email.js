const nodemailer = require('nodemailer');

const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    } : undefined
};

const transporter = smtpConfig.host ? nodemailer.createTransport(smtpConfig) : null;

function sendEmail(to, subject, text, html) {
    if (!to) return;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Notice Board" <noreply@tribunals.go.ke>',
        to: to,
        subject: subject,
        text: text,
        html: html || text
    };

    if (transporter) {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email send failed:', error.message);
            } else {
                console.log(`Email sent to ${to}: ${info.messageId}`);
            }
        });
        return;
    }

    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL MOCK] Body: ${text}`);
}

module.exports = { sendEmail };
