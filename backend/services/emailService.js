// switched to brevo http api — render blocks smtp so nodemailer/resend don't work
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendMail = async (to, subject, html) => {
    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: { name: 'Taskify AI', email: 'taskifyai2026@gmail.com' },
            to: [{ email: to }],
            subject,
            htmlContent: html
        })
    });

    if (!res.ok) {
        const err = await res.json();
        console.error('Error sending email:', err);
        throw new Error(err.message || 'Failed to send email');
    }

    console.log(`Email sent to ${to}: ${subject}`);
};

// sends the verify email after registration
export const sendVerificationEmail = async (userEmail, token) => {
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

    await sendMail(userEmail, 'Verify Your Taskify AI Account', html);
};

// sends reminder or overdue notice for tasks
export const sendTaskNotificationEmail = async (userEmail, taskTitle, type) => {
    let subject, message, color;

    if (type === 'reminder') {
        subject = `Reminder: "${taskTitle}" is due tomorrow!`;
        message = `Don't forget! Your task <b>"${taskTitle}"</b> is due in less than 24 hours. Keep up the good work!`;
        color = '#EAB308';
    } else if (type === 'failed') {
        subject = `Overdue: "${taskTitle}" deadline missed`;
        message = `Uh oh! It looks like you missed the deadline for your task <b>"${taskTitle}"</b>. Don't worry, you can still complete it!`;
        color = '#EF4444';
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; border-left: 5px solid ${color};">
            <h2 style="color: #333;">Task Update</h2>
            <p style="font-size: 16px; color: #333;">${message}</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </div>
        </div>
    `;

    await sendMail(userEmail, subject, html);
};
