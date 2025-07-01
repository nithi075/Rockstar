const jwt = require('jsonwebtoken'); // Import jsonwebtoken once
const User = require('../models/User'); // Import User model once (ensure 'User' matches your file's casing, e.g., 'user.js' vs 'User.js')
const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Checks if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    // 1. Check if the Authorization header is present and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // 2. Extract the token from the "Bearer <token>" string
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token is found in the header, return 401
    if (!token) {
        return next(new ErrorHandler('Login first to access this resource. (No token in header)', 401));
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user associated with the decoded ID and attach to request
        req.user = await User.findById(decoded.id);
        
        // If user not found, even if token is valid, something is off
        if (!req.user) {
            return next(new ErrorHandler('User not found with this token. Please login again.', 401));
        }

        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        // Handle cases where token is invalid (e.g., malformed, expired, invalid signature)
        return next(new ErrorHandler('Invalid or Expired Token. Please login again.', 401));
    }
});

// Handling user roles for authorization
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Ensure req.user exists and its role is included in the allowed roles
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
