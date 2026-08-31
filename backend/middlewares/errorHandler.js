import { Prisma } from '@prisma/client'; 


export const errorHandler = (err, req, res, next) => {
    // default error values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorDetails = null;

    console.error('❌ Error:', err.message); // log for debugging


    // 1. Prisma UNIQUE CONSTRAINT violation
    // Happens when you try to register with an email that already exists.
    
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        statusCode = 409;
        const field = err.meta?.target?.[0] || 'field'; // which column caused the conflict
        message = `Duplicate value for ${field}. Please use another value.`;
        errorDetails = err.message;
    }

    // 2. Prisma RECORD NOT FOUND ────────────────────────────────────────
    // Happens when prisma.task.update/delete is called with an id that doesn't exist.
    else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
    }

    //  3. Prisma VALIDATION ERROR
    // Happens when data passed to Prisma doesn't match the schema (e.g. wrong type)
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Validation Error';
        errorDetails = err.message;
    }

    //  4. JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
    }

    // ─── 5. Custom/service errors (throw new Error('...')) 
    // These are the errors we throw manually in services like 'Task not found'
    else if (err instanceof Error && err.statusCode === undefined) {
        statusCode = 400;
        message = err.message;
    }

    // 6. Errors with explicit status code
    else if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // 7. Final response
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(errorDetails && { details: errorDetails }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};