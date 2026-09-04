import prisma from '../config/database.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { sendVerificationEmail } from './emailService.js';


// helper function to generat jwt token
const generateToken = (userID) => {
    return jwt.sign(
        { id: userID },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};


// helper fuction to strip the password
const sanitizeUser = (user) => {
    // remove pass and put rest in safeUser
    const { password, ...safeUser } = user;
    return {
        ...safeUser,
        _id: user.id, // because frontend uses user._id → map to user.id
    };
};

// helper function to build standar auth response
export const sendAuthResponse = (user) =>{
    const token = generateToken(user.id); 
    return { token, user: sanitizeUser(user) }; // remove the pass from user
}


// 1. Register user service
export const registerService = async ({ name, email, password }) => {

    // check if fields are present
    if (!name || !email || !password) {
        throw new Error('Please provide name, email and password');
    }

    // validate email format
    if (!validator.isEmail(email)) {
        throw new Error('Please provide a valid email');
    }

    // validate password strength
    if (!validator.isStrongPassword(password, {
        minLength: 8, minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 0
    })) {
        throw new Error('Password should be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Normalize email
    const normalEmail = email.toLowerCase().trim();

    // throw error if user already exits
    const existingUser = await prisma.user.findUnique({ where: { email: normalEmail } });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // hash the pass
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create the new user
    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalEmail,
            password: hashedPassword, // store the hash not the raw password
            isVerified: false
        }
    });

    // generate verify jwt token and send the email
    const verifyToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    ); 
    await sendVerificationEmail(user.email, verifyToken);

    return { 
        user: sanitizeUser(user),  // removed the pass
        message: 'Registration successful. Please check your email to verify your account.' 
    };
};


// 2. Login user service
export const loginService = async ({ email, password }) => {
    // check if fields exist
    if (!email || !password) {
        throw new Error('Please provide email and password');
    }

    // validate email format
    if (!validator.isEmail(email)) {
        throw new Error('Please provide a valid email');
    }

    // Normalize email
    const normalEmail = email.toLowerCase().trim();

    // find the user by email
    const user = await prisma.user.findUnique({where: {email: normalEmail}});

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // compare the entered password with stores pass hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // if user is not verified
    if (!user.isVerified) {
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    // send the response
    return sendAuthResponse(user);
};


// 2.5 verify email service  (was missing — caused the startup crash)
export const verifyEmailService = async (token) => {
    if (!token) {
        throw new Error('Verification token is missing');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            throw new Error('User not found');
        }

        // already verified, just let them log in
        if (user.isVerified) {
            return { message: 'Email is already verified. You can log in.' };
        }

        // mark as verified
        await prisma.user.update({
            where: { id: decoded.id },
            data: { isVerified: true }
        });

        return { message: 'Email verified successfully! You can now log in.' };
    } catch (error) {
        throw new Error('Invalid or expired verification token');
    }
};


// 3. Update user email,name service
export const updateUserService = async (userID, { name, email }) => {

    
    if (!name || !email) {
        throw new Error('Please enter name and email');
    }

    const normalEmail = email.toLowerCase().trim();

    // check if email is alreasy taken by any other user
    const existingUser = await prisma.user.findFirst({
        where: {
            email: normalEmail,
            NOT: { id: userID } // exclude the current user
        }
    });

    // throw error is alreays in use
    if (existingUser) {
        throw new Error('Email already in use');
    }

    // update the user credentials
     const updatedUser = await prisma.user.update({
        where: { id: userID },
        data: {
            name: name.trim(),
            email: normalEmail,
        }
    });

    return sanitizeUser(updatedUser); // return user without password
};


// 4. Update user password
export const updatePasswordService = async (userId, { currentPassword, newPassword }) => {
   
    if (!currentPassword || !newPassword) {
        throw new Error('Please provide both current and new password');
    }

    //validate new password strength
    if (!validator.isStrongPassword(newPassword, {
        minLength: 8, minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 0
    })) {
        throw new Error('Password should be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    //get the user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // verify current passwrod
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // updatea user with new password
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return sendAuthResponse(updatedUser);


};


// 5. Delete user service
export const deleteUserService = async (userID, { currentPassword, confirmMessage }) => {

    
    if (!currentPassword) {
        throw new Error('Please provide password');
    }
    if (confirmMessage !== 'DELETE') {
        throw new Error('Type "DELETE" to continue');
    }

    // get user
    const user = await prisma.user.findUnique({ where: { id: userID } });

    if (!user) {
        throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new Error('Incorrect password');
    }

    // Delete user — tasks are also deleted automatically via CASCAD
    await prisma.user.delete({ where: { id: userID } });

    return;
};
