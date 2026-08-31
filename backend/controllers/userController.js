import {
    loginService,
    registerService,
    updateUserService,
    updatePasswordService,
    deleteUserService,
    verifyEmailService
} from "../services/userService.js"


// 1. REGISTER USER
export const registerUser = async (req, res, next) => {
    try {
        const data = await registerService(req.body)

        res.status(201).json({
            success: true,
            message: data.message,
            user: data.user,
            token: data.token // this might be undefined now, which is fine
        });
    }
    catch (error) {
        next(error)
    }
}

// 1.5 VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        const data = await verifyEmailService(token);

        res.status(200).json({
            success: true,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
}


// 2. LOGIN USER
export const loginUser = async (req, res, next) => {
    try {
        const data = await loginService(req.body);

        res.status(200).json({
            success: true,
            message: 'Login was successful',
            user: data.user,
            token: data.token
        });
    }
    catch (error) {
        next(error)
    }
}


// 3. LOGOUT USER
export const logoutUser = async (req, res, next) => {
    return res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
}


// 4. GET CURRENT USER
export const getCurrentUser = async (req, res, next) => {
    // req.user is attached by authMiddleware — password is included but we sanitize in service
    // We strip the password here before sending to client
    const { password, ...safeUser } = req.user;

    res.status(200).json({
        success: true,
        user: safeUser
    })
}


// 5. UPDATE USER
export const updateUser = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id  (Postgres 'id' vs MongoDB '_id')
        const user = await updateUserService(req.user.id, req.body);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });
    }
    catch (error) {
        next(error)
    }
}


// 6. UPDATE USER PASSWORD
export const updateUserPassword = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const data = await updatePasswordService(req.user.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    }
    catch (error) {
        next(error)
    }
}


// 7. DELETE USER
export const deleteUser = async (req, res, next) => {
    try {
        // CHANGED: req.user._id → req.user.id
        const data = await deleteUserService(req.user.id, req.body);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    }
    catch (error) {
        next(error);
    }
}