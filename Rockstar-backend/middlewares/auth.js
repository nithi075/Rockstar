// Rockstar-backend/middlewares/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Corrected: Path matches 'User.js' file name
const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    // 1. Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to token in HTTP cookie (common for browser-based apps after login)
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decodedData.id);

        if (!req.user) {
            // This can happen if a user is deleted but their token is still valid.
            return next(new ErrorHandler('User associated with this token no longer exists. Please login again.', 401));
        }

        next();
    } catch (error) {
        // More specific error messages for JWT issues
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler('Session expired. Please login again.', 401));
        } else if (error.name === 'JsonWebTokenError') {
            return next(new ErrorHandler('Invalid token. Please login again.', 401));
        } else {
            return next(new ErrorHandler('Authentication failed. Please login again.', 401));
        }
    }
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Ensure req.user exists and has a role before checking
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Access Denied: Your role (${req.user ? req.user.role : 'unassigned'}) is not allowed to access this resource.`,
                    403
                )
            );
        }
        next();
    };
};
