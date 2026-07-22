const nodemailer = require('nodemailer');

// Set up a transport. Using ethereal for testing, but typically you'd use SMTP creds here.
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'dummy@ethereal.email', // Replace with real email
        pass: 'dummy_pass' // Replace with real password
    }
});

// A robust way to mock if credentials are not working
function sendEmail(to, subject, text, html) {
    if (!to) return;
    
    const mailOptions = {
        from: '"Notice Board" <noreply@tribunals.go.ke>',
        to: to,
        subject: subject,
        text: text,
        html: html || text
    };

    // Log it instead of actually failing on fake credentials
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL MOCK] Body: ${text}`);
    
    // Attempt sending if needed, but for dummy creds we skip to avoid crash
    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) console.error("Error sending email: ", error);
    //     else console.log("Email sent: ", info.messageId);
    // });
}

module.exports = { sendEmail };
