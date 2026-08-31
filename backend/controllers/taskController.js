import {
    createTaskService,
    getTaskService,
    getTaskByIdService,
    updateTaskService,
    deleteTaskService,
    getUserTaskStatsService
} from '../services/taskService.js'


// 1. CREATE TASK
export const createTask = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const task = await createTaskService(req.body, req.user.id);

        return res.status(201).json({
            success: true,
            message: 'Task successfully created',
            task: task
        });
    }
    catch (error) {
        next(error);
    }
};


// 2. GET TASK
export const getTask = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const result = await getTaskService(req.query, req.user.id);

        return res.status(200).json({
            success: true,
            tasks: result.tasks,
            stats: result.stats
        });
    }
    catch (error) {
        next(error);
    }
}


// 3. GET TASK BY ID
export const getTaskById = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const task = await getTaskByIdService(req.params.id, req.user.id);

        return res.status(200).json({
            success: true,
            task: task
        });
    }
    catch (error) {
        next(error);
    }
}


// 4. UPDATE TASK
export const updateTask = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const task = await updateTaskService(
            req.params.id,
            req.body,
            req.user.id  // CHANGED: was req.user._id
        );

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            updatedtask: task
        });
    }
    catch (error) {
        next(error);
    }
}


// 5. DELETE TASK
export const deleteTask = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const task = await deleteTaskService(req.params.id, req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Task successfully deleted',
            deletedTask: task
        });
    }
    catch (error) {
        next(error);
    }
};


// 6. GET TASK STATS
export const getUserTaskStats = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const stats = await getUserTaskStatsService(req.user.id);

        return res.status(200).json({
            success: true,
            stats: stats
        });
    }
    catch (error) {
        next(error);
    }
};