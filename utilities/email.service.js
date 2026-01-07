const nodemailer = require('nodemailer');

// 1. Configure the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

const sendTempPasswordEmail = async (userEmail, tempPassword, firstName) => {
    const mailOptions = {
        from: `"Carkeyper Admin" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome to Carkeyper - Account Credentials',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #0d9488;">Hello ${firstName},</h2>
                <p>Your account has been created by the administrator. Please use the following temporary password to log in to the mobile portal:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 24px; font-weight: bold; background: #f0fdfa; color: #0d9488; padding: 10px 20px; border: 1px dashed #0d9488; border-radius: 8px;">
                        ${tempPassword}
                    </span>
                </div>
                <p><strong>Note:</strong> You will be prompted to change this password immediately upon your first login for security reasons.</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendTempPasswordEmail };