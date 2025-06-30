
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/connectDatabase');
const errorMiddleware = require('./middlewares/error');

dotenv.config({ path: './config/config.env' }); // Make sure this is at the very top, before any other imports that might use process.env
console.log('Server starting. JWT_EXPIRE loaded:', process.env.JWT_EXPIRE);
connectDB();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration with credentials - This is good!
app.use(cors({
    origin: [process.env.FRONTEND_URL,'http://localhost:5173' , 'http://localhost:5174' ,'http://localhost:5175','https://rockstar-dashboard.onrender.com'], // Allow both values if they are different
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static files (e.g., uploaded images)
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// API Routes
app.use('/api/v1/products', require('./routes/product'));
app.use('/api/v1/orders', require('./routes/order'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/admin', require('./routes/adminDashboardRoutes'));

// Health Check Route (optional but good practice)
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy and running!' });
});

// Global Error Handling Middleware - MUST BE LAST
app.use(errorMiddleware);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections (e.g., MongoDB connection errors not caught by try/catch)
process.on('unhandledRejection', (err) => {
    console.error(`❌ Error: ${err.message}`);
    console.error('Shutting down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1); // Exit with failure code
    });
});

// Handle uncaught exceptions (e.g., synchronous errors not caught by try/catch)
process.on('uncaughtException', (err) => {
    console.error(`❌ Error: ${err.message}`);
    console.error('Shutting down the server due to uncaught exception');
    server.close(() => {
        process.exit(1); // Exit with failure code
    });
});
