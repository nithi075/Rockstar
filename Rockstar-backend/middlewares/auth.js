const jwt = require('jsonwebtoken');

const User = require('../models/User'); // Assuming your User model path

const catchAsyncErrors = require('./catchAsyncErrors');

const ErrorHandler = require('../utils/errorHandler');

// Checks if user is authenticated

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

// <--- CRUCIAL CHANGE STARTS HERE --->

let token;



// 1. Check if the Authorization header is present

if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    // 2. Extract the token from the "Bearer <token>" string

    token = req.headers.authorization.split(' ')[1];

}



// If no token is found in the header, return 401

if (!token) {

    return next(new ErrorHandler('Login first to access this resource. (No token in header)', 401));

}

// <--- CRUCIAL CHANGE ENDS HERE --->



try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();

} catch (error) {

    // Handle cases where token is invalid (e.g., malformed, expired, invalid signature)

    return next(new ErrorHandler('Invalid or Expired Token. Please login again.', 401));

}

});

// Handling user roles

exports.authorizeRoles = (...roles) => {

return (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role)) { // Added !req.user check for robustness

        return next(new ErrorHandler(`Role (${req.user ? req.user.role : 'unassigned'}) is not allowed to access this resource.`, 403));

    }

    next();

};

};

