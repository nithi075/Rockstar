const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Corrected path
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// Middleware to check if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);

  if (!req.user) {
    return next(new ErrorHandler("User not found", 404));
  }

  next();
});

// Middleware to check for admin role
exports.isAdmin = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role || "unknown"} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
