const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure this matches your file's case (User or user)
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.error("Auth Error: No token found in header."); // Added log
    return next(new ErrorHandler("Login first to access this resource. (No token in header)", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth: Token decoded:", decoded); // Added log

    if (!decoded || !decoded.id) {
      console.error("Auth Error: Decoded token has no ID or is invalid.", decoded); // Added log
      return next(new ErrorHandler("Invalid token payload.", 401));
    }

    // Check if User model is loaded correctly before calling findById
    if (!User || typeof User.findById !== 'function') {
        console.error("Auth Error: User model not properly loaded or findById is not a function."); // Added log
        return next(new ErrorHandler("Server configuration error: User model unavailable.", 500));
    }

    req.user = await User.findById(decoded.id);
    console.log("Auth: User found:", req.user ? req.user.email : "User not found for ID " + decoded.id); // Added log

    if (!req.user) {
      console.error("Auth Error: No user found for decoded ID:", decoded.id); // Added log
      return next(new ErrorHandler("User associated with token not found.", 401));
    }

    next();
  } catch (error) {
    console.error("Auth Error: Token verification failed or database error:", error.message); // Added log
    return next(new ErrorHandler("Invalid or Expired Token. Please login again.", 401));
  }
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) { // Explicitly check for req.user before accessing its properties
      console.error("Auth Error: req.user is undefined in authorizeRoles."); // Added log
      return next(
        new ErrorHandler("Authentication failed or user data missing. Please login.", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      console.error(`Auth Error: Role '${req.user.role}' not allowed.`); // Added log
      return next(
        new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource.`, 403)
      );
    }
    next();
  };
};
