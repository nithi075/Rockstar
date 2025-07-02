const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Correct path and casing
const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) { // Fallback to cookie if not in header
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorHandler('User not found associated with this token. Please login again.', 401));
        }

        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or Expired Token. Please login again.', 401));
    }
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role (${req.user ? req.user.role : 'unassigned'}) is not allowed to access this resource.`,
                    403
                )
            );
        }
        next();
    };
};
