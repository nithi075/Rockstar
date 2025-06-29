// controllers/userController.js

const User = require('../models/User'); // Your User model
const ErrorHandler = require('../utils/errorHandler'); // Your custom error handler
const catchAsyncErrors = require('../middlewares/catchAsyncErrors'); // Your async error wrapper
const sendToken = require('../utils/sendToken'); // Your JWT token sending utility

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Password hashing happens automatically in User.js pre('save') hook
    const user = await User.create({
        name,
        email,
        password, // This plaintext password will be hashed by the pre-save hook in User.js
    });

    sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    console.log('--- Login Attempt ---');
    console.log('Received email:', email);

    if (!email || !password) {
        console.log('Login Failed: Missing email or password.');
        return next(new ErrorHandler('Please Enter Email & Password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    console.log('User found in DB (or null if not found):', user ? user.email : 'No user found');

    if (!user) {
        console.log('Login Failed: User not found with email:', email);
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    console.log('Password comparison result (isPasswordMatched):', isPasswordMatched);

    if (!isPasswordMatched) {
        console.log('Login Failed: Password did not match for user:', user.email);
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // --- CRITICAL DEBUGGING POINT ---
    console.log('Login Successful for user:', user.email);
    console.log('Attempting to send token...');

    sendToken(user, 200, res); // <--- The error is likely occurring inside this function or immediately after it.
    console.log('sendToken function completed.'); // This line might not log if sendToken crashes before it returns.
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    // Clear the token cookie
    res.cookie('token', null, {
        expires: new Date(Date.now()), // Immediately expire
        httpOnly: true,
        // Ensure sameSite and secure flags match your environment (production vs development)
        sameSite: 'Lax', // or 'None' if cross-domain with `secure: true`
        secure: process.env.NODE_ENV === 'production' // Only send over HTTPS in production
    });

    res.status(200).json({
        success: true,
        message: 'Logged Out',
    });
});