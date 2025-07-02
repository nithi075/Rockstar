// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorMiddleware = require('./middlewares/error');

const app = express();

// --- Core Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- CORS Configuration ---
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://rockstar-dashboard.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Serve Static Files ---
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/v1/products', require('./routes/product'));
app.use('/api/v1/orders', require('./routes/order'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/admin', require('./routes/adminDashboardRoutes'));

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy and running!' });
});

// --- Global Error Handling Middleware ---
app.use(errorMiddleware);

module.exports = app; // Export the configured Express app
