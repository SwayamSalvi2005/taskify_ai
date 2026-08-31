import cron from 'node-cron';
import prisma from '../config/database.js';

import { sendTaskNotificationEmail } from '../services/emailService.js';

// Run start of every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running task notification cron job...');
    
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // 1. Find tasks due in less than 24 hours that are incomplete and haven't had a reminder sent
        const upcomingTasks = await prisma.task.findMany({
            where: {
                completed: false,
                reminderSent: false,
                dueDate: {
                    lte: tomorrow,
                    gt: now
                },
                owner: {
                    isVerified: true // Only send emails to verified users
                }
            },
            include: { owner: true }
        });
        // for each upcoming task send reminder emial
        for (const task of upcomingTasks) {
            await sendTaskNotificationEmail(task.owner.email, task.title, 'reminder');
            await prisma.task.update({
                where: { id: task.id },
                data: { reminderSent: true }
            });
        }

        // 2. Find overdue tasks
        const overdueTasks = await prisma.task.findMany({
            where: {
                completed: false,
                failureSent: false,
                dueDate: {
                    lt: now
                },
                owner: {
                    isVerified: true
                }
            },
            include: { owner: true }
        });
        // send overdue email
        for (const task of overdueTasks) {
            await sendTaskNotificationEmail(task.owner.email, task.title, 'failed');
            await prisma.task.update({
                where: { id: task.id },
                data: { failureSent: true }
            });
        }

        console.log(`Cron job finished. Sent ${upcomingTasks.length} reminders and ${overdueTasks.length} overdue notices.`);
    } catch (error) {
        console.error('Error in task notification cron job:', error);
    }
});
