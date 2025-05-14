const nodemailer = require('nodemailer');
const config = require('../config/config'); // Ensure your config file has the email configuration
const generateToken = require('./emailGenerateToken');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: config.SMTP.EMAIL_HOST, // e.g., 'smtp.gmail.com'
    port: config.SMTP.EMAIL_PORT, // e.g., 587
    secure: config.SMTP.EMAIL_SECURE, // true for 465, false for other ports
    auth: {
        user: config.SMTP.EMAIL_USER, // your email
        pass: config.SMTP.EMAIL_PASS  // your email password or application-specific password
    }
});

// Function to send a verification email
const sendVerificationEmail = async (userEmail, verificationToken) => {
    try {
        const verificationToken = generateToken(userEmail); // Generate the JWT token
        const verificationUrl = `${config.FRONTEND_URL}verify?token=${verificationToken}`;

        // Set up email data with Unicode symbols
        const mailOptions = {
            from: config.EMAIL_USER,
            to: userEmail,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: ${verificationUrl}`,
            html: `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">Verify Email</a></p>`
        };
        // Send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        return { msg: 'Verification email sent successfully.', status: true };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { msg: 'Failed to send verification email.', status: false, error: error.message };
    }
};

module.exports = sendVerificationEmail;
