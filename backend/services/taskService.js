import prisma from '../config/database.js';

import { getCache, setCache, deleteCachePattern } from '../config/redis.js';

// Cache TTL constants — unchanged
const STATS_TTL   = 60;   // task stats expire after 60 seconds
const SUMMARY_TTL = 300;  // AI summary expires after 5 minutes

// Cache key generators — unchanged
const statsKey   = (userId) => `stats:${userId}`;
const summaryKey = (userId) => `summary:${userId}`;

// Invalidate user cache — unchanged
const invalidateUserCache = async (userId) => {
    await deleteCachePattern(statsKey(userId));
    await deleteCachePattern(summaryKey(userId));
};

// ─── Helper: Convert Prisma enum values to frontend-friendly format ──────
const priorityReverseMap = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

const formatTaskForFrontend = (task) => {
    if (!task) return null;
    return {
        ...task,
        id:       task.id,   // Postgres native id (string cuid)
        _id:      task.id,   // BACKWARDS COMPAT: frontend uses task._id → map it to task.id
        priority: priorityReverseMap[task.priority] || task.priority,
    };
};

// 1. Create task service
export const createTaskService = async (data, userId) => {
    // get data
    const { title, description, priority, dueDate } = data;

    // Validate required fields
    if (!title || !dueDate) {
        throw new Error('Task title and dueDate is mandatory');
    }

    // Map priority string to Prisma enum format
    const priorityMap = { Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH' };
    const prismaPrority = priorityMap[priority] || 'MEDIUM';

    // create task
    const task = await prisma.task.create({
        data: {
            title: title.trim(),
            description: description ? description.trim() : '',
            priority: prismaPrority,
            dueDate: new Date(dueDate), 
            ownerId: userId,            
        }
    });

    // Convert the Prisma enum back to the friendly format the frontend expects
    // e.g., 'HIGH' → 'High'  (so the frontend doesn't break)
    const formattedTask = formatTaskForFrontend(task);

    // Invalidate Redis cache (task changed)
    await invalidateUserCache(userId);

    return formattedTask;
};

// 2. Get task service
export const getTaskService = async (query, userId) => {

    // get data
    const { priority, completed, sortBy, sortOrder, search } = query;
    const where = { ownerId: userId }; // CHANGED: was owner:userId → ownerId:userId

     // Add priority filter
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
        where.priority = priorityReverseMap[priority] || priority.toUpperCase();
        // Prisma enum needs uppercase: 'High' → 'HIGH'
        where.priority = { Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH' }[priority];
    }

    // Add completed filter
    if (completed !== undefined) {
        if (completed === 'true')  where.completed = true;
        if (completed === 'false') where.completed = false;
    }

     // ad search filter
     if (search) {
        where.OR = [
            { title:       { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    // fetch tasks 
    const rawTasks = await prisma.task.findMany({ where });

    //Convert Prisma enum back to frontend-friendly format for all tasks
    let tasks = rawTasks.map(formatTaskForFrontend);

    // redis stats caching
    let stats;
    const cachedStats = await getCache(statsKey(userId));

    if (cachedStats) {
        console.log(`[Redis] Cache HIT  → stats:${userId}`);
        stats = cachedStats;
    } else {
        console.log(`[Redis] Cache MISS → stats:${userId}`);
        stats = await getUserTaskStats(userId); 
        await setCache(statsKey(userId), stats, STATS_TTL);
    }

    // sorting logic
     let order = 1;
    if (sortBy && sortOrder === 'desc') order = -1;

    if (sortBy === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        tasks.sort((a, b) => {
            const weightA = priorityWeight[a.priority || 'Low'];
            const weightB = priorityWeight[b.priority || 'Low'];
            return (weightA - weightB) * order;
        });
    } else if (sortBy === 'dueDate') {
        tasks.sort((a, b) => (new Date(a.dueDate) - new Date(b.dueDate)) * order);
    } else if (sortBy === 'createdAt') {
        tasks.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * order);
    } else if (sortBy === 'title') {
        tasks.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()) * order);
    } else {
        // Default: sort by createdAt ascending
        tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return { tasks, stats };
};

// 3. Get task by ID service
export const getTaskByIdService = async (id, userId) => {
    // Find task that belongs to this user
    const task = await prisma.task.findFirst({
        where: {
            id: id,
            ownerId: userId  // CHANGED: was owner:userId → ownerId:userId
        }
    });

    if (!task) {
        throw new Error('Task not found or unauthorized');
    }

    return formatTaskForFrontend(task);
};

// 4. Update task service
export const updateTaskService = async (id, body, userId) => {
    // get data
    const { title, description, priority, dueDate, completed } = body;

    // Build the update data object — only include fields that were provided
    const updateData = {};
    if (title       !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority    !== undefined) {

        // CHANGED: convert priority to Prisma enum format
        updateData.priority = { Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH' }[priority] || priority;
    }
    if (dueDate     !== undefined) updateData.dueDate     = new Date(dueDate);
    if (completed   !== undefined) updateData.completed   = completed;

    // First verify the task exists and belongs to this user (security check)
    const existingTask = await prisma.task.findFirst({
        where: { id: id, ownerId: userId }
    });

    if (!existingTask) {
        throw new Error('Task not found or unauthorized');
    }

    // Update the task
    const updatedTask = await prisma.task.update({
        where: { id: id },
        data: updateData,
    });

    // Invalidate Redis cache
    await invalidateUserCache(userId);

    return formatTaskForFrontend(updatedTask);
};

// 5. Delete task service
export const deleteTaskService = async (id, userId) => {
   
    // Verify ownership first
    const existingTask = await prisma.task.findFirst({
        where: { id: id, ownerId: userId }
    });

    if (!existingTask) {
        throw new Error('Task not found or unauthorized');
    }

    // Delete the task
    const deletedTask = await prisma.task.delete({ where: { id: id } });

    // Invalidate Redis cache
    await invalidateUserCache(userId);

    return formatTaskForFrontend(deletedTask);
};

// 6. Get user tasks stats
const getUserTaskStats = async (userId) => {

    // Count totals in parallel for performance
    const [total, completed, highCount, mediumCount, lowCount, dueTodayCount] = await Promise.all([

        // Total tasks for this user
        prisma.task.count({ where: { ownerId: userId } }),

        // Completed tasks count
        prisma.task.count({ where: { ownerId: userId, completed: true } }),

        // High priority tasks count
        prisma.task.count({ where: { ownerId: userId, priority: 'HIGH' } }),

        // Medium priority tasks count
        prisma.task.count({ where: { ownerId: userId, priority: 'MEDIUM' } }),

        // Low priority tasks count
        prisma.task.count({ where: { ownerId: userId, priority: 'LOW' } }),

        // Due today count
        // Now we use Prisma date range filtering (start and end of today)
        prisma.task.count({
            where: {
                ownerId: userId,
                dueDate: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),   // start of today
                    lte: new Date(new Date().setHours(23, 59, 59, 999)) // end of today
                }
            }
        }),
    ]);

    return {
        total,
        completed,
        pending: total - completed,
        highPriority: highCount,
        mediumPriority: mediumCount,
        lowPriority: lowCount,
        dueToday: dueTodayCount,
    };
};

// 7. Get stats service 
export const getUserTaskStatsService = async (userId) => {
    const cachedStats = await getCache(statsKey(userId));

    if (cachedStats) {
        console.log(`[Redis] Cache HIT  → stats:${userId} (stats endpoint)`);
        return cachedStats;
    }

    console.log(`[Redis] Cache MISS → stats:${userId} (stats endpoint)`);
    const stats = await getUserTaskStats(userId);
    await setCache(statsKey(userId), stats, STATS_TTL);

    return stats;
}; 

// 8. Find task by title (used by ai chat to identify tasks by name)
export const findTaskByTitleService = async (userId, titleQuery) => {
    if (!titleQuery) return null;

    const cleanTitle = titleQuery.trim();

    // First try: exact match (case-insensitive)
    let task = await prisma.task.findFirst({
        where: {
            ownerId: userId,
            title: { equals: cleanTitle, mode: 'insensitive' }
        }
    });

    // Second try: partial match (contains)
    if (!task) {
        task = await prisma.task.findFirst({
            where: {
                ownerId: userId,
                title: { contains: cleanTitle, mode: 'insensitive' }
            }
        });
    }

    return task ? formatTaskForFrontend(task) : null;
};

// Export key generators so geminiService.js can use the same Redis keys
export { statsKey, summaryKey, SUMMARY_TTL };