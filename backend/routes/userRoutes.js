import express from 'express';

import{
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUser,
    updateUserPassword,
    deleteUser,
    verifyEmail
} from "../controllers/userController.js";

import { authMiddleware } from '../middlewares/auth.js';

// create an expres router
const userRouter = express.Router();


// public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/verify-email', verifyEmail);


// private routes (auth middleware required)
userRouter.post('/logout', authMiddleware, logoutUser);
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateUser);
userRouter.put('/password', authMiddleware, updateUserPassword);
userRouter.delete('/delete', authMiddleware, deleteUser);


export default userRouter;