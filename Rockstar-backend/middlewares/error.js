const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Mongoose bad ObjectId error (CastError)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error (e.g., duplicate email or customId)
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue).join(', ')} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = `Json Web Token is invalid, try again `;
        err = new ErrorHandler(message, 401);
    }

    // JWT EXPIRE error
    if (err.name === 'TokenExpiredError') {
        const message = `Json Web Token is Expired, Try again `;
        err = new ErrorHandler(message, 401);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
};