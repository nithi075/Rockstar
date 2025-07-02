// Rockstar-backend/middlewares/isAdmin.js

const ErrorHandler = require('../utils/errorHandler'); // Adjust path if necessary
const catchAsyncErrors = require('./catchAsyncErrors'); // Adjust path if necessary

exports.isAdmin = catchAsyncErrors(async (req, res, next) => {
    // Assuming req.user is populated by isAuthenticatedUser middleware
    if (!req.user || req.user.role !== 'admin') {
        return next(new ErrorHandler(`Role: ${req.user ? req.user.role : 'Guest'} is not allowed to access this resource`, 403));
    }
    next();
});
