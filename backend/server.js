import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // for frontend and backend talk
import morgan from 'morgan';  // logger 
import helmet from 'helmet';  // security
import rateLimit from 'express-rate-limit';

// get user routes
import userRouter from './routes/userRoutes.js';
// get task routes
import taskRouter from './routes/taskRoutes.js';
import geminiRouter from './routes/geminiRoutes.js';

// start cron jobs
import './jobs/cronJobs.js';

// PostgreSQL / Prisma — no explicit connect() needed.
// Prisma connects automatically on the first query and manages its own pool.
// The prisma singleton is imported in config/database.js and shared across services.
import { connectRedis } from './config/redis.js';
// error handler
import { errorHandler } from './middlewares/errorHandler.js';

// env
dotenv.config();

// create exprese app
const app = express();
const PORT = process.env.PORT || 5000;


// cors configuration
const allowedOrigin = process.env.CLIENT_URL;
app.use(cors({
    origin: allowedOrigin,
    credentials: true  // allows headers and cookies to be passed between
}));


// middlewares
app.use(express.json({ limit: '10mb' })); // body parser middleware
app.use(morgan('dev'));                    // logging middleware in dev format
app.use(helmet());                        // security middleware



// Rate limiter logic (applies to all api routes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // time window - 15 min
    max: 100,                  // max no. of requests allowed per IP
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after some time'
    },
    standardHeaders: true,
    legacyHeaders: false,
});


// this limiter is for signin / signup routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many signin/signup attempts, please try again after an hour'
    }
});


// Apply rate limiters
app.use('/api', limiter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);


// Note: No connectDB() call needed!
// Prisma connects to Neon (PostgreSQL) automatically on first query.

//  Connect Redis 
connectRedis();


// API Routes
app.use('/api/user', userRouter);     // user routes
app.use('/api/tasks', taskRouter);    // task routes
app.use('/api/gemini', geminiRouter); // geminiAI routes


// test route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Taskify API is working successfully',
        timestamp: new Date().toISOString()
    });
});


// 404 error handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Error 404! route not found'
    });
});


// Global error handler middleware
app.use(errorHandler);


// listen the port
app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
});