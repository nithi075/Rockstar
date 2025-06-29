const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');

exports.isAdmin = catchAsyncErrors((req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return next(new ErrorHandler('Access denied! Admins only.', 403));
});
