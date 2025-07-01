const jwt = require('jsonwebtoken'); // Only one import for jsonwebtoken
const User = require('../models/User'); // Only one import for User (ensure 'User' matches your file's casing)
const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Checks if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token; // Declare token once

    // This block handles extracting the token from the Authorization header (Bearer token)
    // This is the intended "CRUCIAL CHANGE" part
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token was found after attempting extraction, return 401
    // This is a consolidated check
    if (!token) {
        return next(new ErrorHandler('Login first to access this resource. (No token in header)', 401));
    }

    // This try-catch block handles token verification and user lookup
    // It is the correct and consolidated version of this logic
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user and attach to request
        req.user = await User.findById(decoded.id);
        
        // Optional: Add a check if user was actually found, even if token was valid
        if (!req.user) {
            return next(new ErrorHandler('User not found associated with this token. Please login again.', 401));
        }

        next(); // Proceed to the next middleware/route if everything is successful
    } catch (error) {
        // This catch block handles errors from jwt.verify (e.g., expired, invalid)
        return next(new ErrorHandler('Invalid or Expired Token. Please login again.', 401));
    }
});

// Handling user roles for authorization
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // This condition checks if the user is authenticated (req.user exists) AND
        // if their role is among the allowed roles for this resource.
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role (${req.user ? req.user.role : 'unassigned'}) is not allowed to access this resource.`,
                    403
                )
            );
        }
        next(); // Proceed if authorized
    };
};
