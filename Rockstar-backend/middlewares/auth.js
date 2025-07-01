const jwt = require("jsonwebtoken");
const User = require('../models/User');
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// 🔐 Middleware to check if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    if (!req.user) {
      return next(new ErrorHandler("User no longer exists", 401));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});

// 🛡️ Middleware to check if user is an admin
exports.isAdmin = (requiredRole = "admin") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (req.user.role !== requiredRole) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};
