const nodemailer = require('nodemailer');

// Configure this with your real SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        // Only attempt to send if credentials are provided, otherwise just log it
        if (!process.env.EMAIL_USER || process.env.EMAIL_PASS === 'your-app-password') {
            console.log('--- DEVELOPMENT MODE: Email Simulation ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${html}`);
            console.log('-----------------------------------------');
            return true;
        }

        const mailOptions = {
            from: `"ISOR Digital" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email Sending Error:', error);
        return false;
    }
};

const templates = {
    enrollment: (name, id) => ({
        subject: 'Enrollment Received - ISOR Digital',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #064e3b;">Welcome to ISOR, ${name}!</h2>
                <p>Your membership enrollment has been received successfully.</p>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold; color: #166534;">Your Membership ID: ${id}</p>
                </div>
                <p>Status: <strong>Awaiting Approval</strong></p>
                <p>Our administrators are currently reviewing your payment proof. You will receive another email once your membership is activated.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply.</p>
            </div>
        `
    }),
    approved: (name, id) => ({
        subject: 'Membership Approved - ISOR Digital',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #064e3b;">Congratulations ${name}!</h2>
                <p>Your ISOR membership has been officially <strong>Approved and Activated</strong>.</p>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold; color: #166534;">Membership ID: ${id}</p>
                </div>
                <p>You can now log in to your account and access all member features.</p>
                <a href="http://localhost:3000/login" style="display: inline-block; background: #b47c1c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Login to Portal</a>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">Welcome aboard!</p>
            </div>
        `
    }),
    rejected: (name, reason) => ({
        subject: 'Membership Enrollment Update - ISOR Digital',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #991b1b;">Enrollment Update</h2>
                <p>Hello ${name}, we have reviewed your enrollment application.</p>
                <p>Unfortunately, your application could not be approved at this time.</p>
                <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> Invalid payment proof or incomplete details.</p>
                </div>
                <p>Please contact the ISOR office or try registering again with valid transaction details.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">ISOR Administration Team</p>
            </div>
        `
    })
};

module.exports = { sendEmail, templates };
