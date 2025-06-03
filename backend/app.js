const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDatabase = require('./config/connectDatabase'); // Path to your DB connection function

// Load environment variables as early as possible
// Ensure your .env file is named 'config.env' and is inside the 'config' folder
// OR if your .env is simply named '.env' and is in the project root, use dotenv.config();
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Connect to database
connectDatabase();

// --- Middlewares ---
// Apply JSON body parser once, for all incoming requests
app.use(express.json());

// Apply CORS middleware once.
// Using a single origin for now. If you need multiple, use an array:
// origin: ['https://nithi-cart-front.onrender.com', 'https://another-frontend.onrender.com'],
app.use(cors());

// --- Test API Root ---
app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

// --- Import and Use Routes ---
// Import your route files after middlewares are set up.
// Make sure these paths are correct relative to your app.js
const productRoutes = require('./routes/product'); // Assuming 'product.js'
const orderRoutes = require('./routes/order');     // Assuming 'order.js'

// Define API routes with their base paths
app.use('/api/v1', productRoutes); // All product routes will be under /api/v1 (e.g., /api/v1/products)
app.use('/api/v1', orderRoutes);   // All order routes will be under /api/v1 (e.g., /api/v1/order/new)


// --- Error Handling Middleware ---
// This should always be the last middleware in your app.js file,
// after all routes and other middlewares.
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the full stack trace for debugging purposes

    let message = 'Something went wrong on the server.';
    let statusCode = 500;

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        message = `Validation Error: ${messages.join(', ')}`;
        statusCode = 400;
    }
    // MongoDB duplicate key error (e.g., for unique fields like product name, user email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate ${field} entered: ${err.keyValue[field]}. Please use a different value.`;
        statusCode = 400;
    }
    // CastError (e.g., invalid ObjectId format)
    if (err.name === 'CastError') {
        message = `Resource not found or invalid ID: ${err.path}`;
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined, // Provide basic error message in prod, full in dev
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Provide stack only in dev
    });
});


// --- Start Server ---
// Only one app.listen() call is needed.
const PORT = process.env.PORT || 8000; // Use 8000 as a default if PORT is not set in .env
app.listen(PORT, () => {
    console.log(`Server listening to Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`); // Default to 'development' if NODE_ENV is not set
});