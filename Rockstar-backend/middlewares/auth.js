// Rockstar-backend/middlewares/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Adjust path if necessary
const ErrorHandler = require("../utils/errorHandler"); // Adjust path if necessary
const catchAsyncErrors = require("./catchAsyncErrors"); // Adjust path if necessary (relative to this file)

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // Check for token in cookies (common for web apps)
  let token = req.cookies.token;

  // Fallback: Check for token in Authorization header (common for APIs, like Bearer token)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    if (!req.user) {
      return next(new ErrorHandler("User not found for this token", 401));
    }
    next();
  } catch (error) {
    // Handle specific JWT errors like expired token, invalid token etc.
    return next(new ErrorHandler("Invalid or Expired Token. Please Login again.", 401));
  }
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user ? req.user.role : 'Guest'} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
