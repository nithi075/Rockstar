class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Capture stack trace and exclude constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;