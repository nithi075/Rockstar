const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDatabase = require('./config/connectDatabase');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Connect to MongoDB
connectDatabase();

// --- Middleware Setup ---
app.use(express.json()); // For parsing JSON bodies
app.use(cors());         // Enable CORS for cross-origin frontend access

// ✅ Serve static files from /public (optional)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve uploaded images from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Test Route ---
app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

// --- API Routes ---
const productRoutes = require('./routes/product'); // e.g., /api/v1/products
const orderRoutes = require('./routes/order');     // e.g., /api/v1/order

app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);

    let message = 'Something went wrong on the server.';
    let statusCode = 500;

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        message = `Validation Error: ${messages.join(', ')}`;
        statusCode = 400;
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate ${field} entered: ${err.keyValue[field]}. Please use a different value.`;
        statusCode = 400;
    }

    if (err.name === 'CastError') {
        message = `Resource not found or invalid ID: ${err.path}`;
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
