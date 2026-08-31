import jwt from 'jsonwebtoken';
import prisma from '../config/database.js'; 

export const authMiddleware = async (req, res, next) => {

    try {
        let token;

        // Extract token from 'Authorization: Bearer <token>' header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // or if in from cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Token not found in either place
        else {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed, please provide a valid token'
            });
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token is missing'
            });
        }

        // Verify the JWT and extract the user id
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by id from the token
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id }
        });

        // user not found
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User with this token no longer exists'
            });
        }

        //attach user to req object
        req.user = user;
        next();

    } catch (error) {
        next(error);
    }
};