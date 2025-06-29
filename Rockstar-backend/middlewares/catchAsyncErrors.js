module.exports = (func) => (req, res, next) => {
    // This wraps an async function, ensuring any unhandled promise rejections
    // are caught and passed to the Express error handling middleware.
    Promise.resolve(func(req, res, next)).catch(next);
};