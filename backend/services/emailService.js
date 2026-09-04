import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

//  create conncept for gmail that actually sends the email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper to send emails
const sendMail = async (to, subject, html) => {
    try {
        // create email optons object
        const mailOptions = {
            from: `"Taskify AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        // acutually sends the email
        await transporter.sendMail(mailOptions);

        console.log(`Email sent to ${to}: ${subject}`);

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// helper fuction to send verify emial
export const sendVerificationEmail = async (userEmail, token) => {
    
    // create verfication email using token
    const FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">Welcome to Taskify AI!</h2>
            <p style="font-size: 16px; color: #333;">Please verify your email address to complete your registration and unlock your account.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify My Account</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">If you did not create an account, you can safely ignore this email.</p>
        </div>
    `;

    // send the email 
    await sendMail(userEmail, 'Verify Your Taskify AI Account', html);
};

// helper fuction to send task due notfication
export const sendTaskNotificationEmail = async (userEmail, taskTitle, type) => {
    let subject, message, color;

    if (type === 'reminder') {
        subject = `Reminder: "${taskTitle}" is due tomorrow!`;
        message = `Don't forget! Your task <b>"${taskTitle}"</b> is due in less than 24 hours. Keep up the good work!`;
        color = '#EAB308'; // Yellow
    } else if (type === 'failed') {
        subject = `Overdue: "${taskTitle}" deadline missed`;
        message = `Uh oh! It looks like you missed the deadline for your task <b>"${taskTitle}"</b>. Don't worry, you can still complete it!`;
        color = '#EF4444'; // Red
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; border-left: 5px solid ${color};">
            <h2 style="color: #333;">Task Update</h2>
            <p style="font-size: 16px; color: #333;">${message}</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </div>
        </div>
    `;

    // send the email
    await sendMail(userEmail, subject, html);
};
