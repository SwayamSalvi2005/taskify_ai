import express from 'express';
import { chatWithGemini, getTaskSummary } from '../controllers/geminiController.js';
import { authMiddleware } from '../middlewares/auth.js';


const geminiRouter = express.Router();

// all gemini routes require auth middleware
geminiRouter.use(authMiddleware);

// chat with ai
geminiRouter.post('/chat', chatWithGemini);

// get ai summary
geminiRouter.get('/summary', getTaskSummary);


export default geminiRouter;