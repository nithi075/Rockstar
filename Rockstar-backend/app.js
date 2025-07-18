// app.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // For checking/creating upload directory

// Declare 'server' variable here so it's accessible globally for graceful shutdown
let server;

// --- Load environment variables FIRST ---
// Ensure this path is correct relative to where app.js is run
dotenv.config({ path: './config/config.env' });

// --- Global Uncaught Exception Handler (Synchronous Errors) ---
// This should be at the very top, before any other code that might throw synchronous errors
process.on('uncaughtException', (err) => {
    console.error(`❌ Uncaught Exception Error: ${err.message}`);
    console.error('Stack Trace:', err.stack);
    console.error('Shutting down the server due to uncaught exception');
    // 'server' is now declared, so this check works
    if (server) {
        server.close(() => {
            process.exit(1); // Exit with failure code
        });
    } else {
        process.exit(1); // Exit immediately if server not yet initialized
    }
});

// --- Database Connection ---
const connectDatabase = require('./config/connectDatabase');
connectDatabase(); // Call to connect to MongoDB

// --- Initialize Express App ---
const app = express();

// --- Core Middleware ---
app.use(express.json({ limit: '10mb' })); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parses URL-encoded request bodies
app.use(cookieParser()); // Parses cookies attached to the client request object

// --- CORS Configuration ---
// Crucial for allowing cross-origin requests from your frontend
app.use(cors({
    origin: [
        process.env.FRONTEND_URL, // From your .env file
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://rockstar-dashboard.onrender.com' // Your deployed frontend URL
    ],
    credentials: true, // Allow cookies (especially httpOnly) to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
}));

// --- Serve Static Files ---
// This makes files in 'public' and 'uploads' directories accessible via URL
// Ensure 'public' and 'uploads' directories exist at your project root.
app.use('/static', express.static(path.join(__dirname, 'public')));

// Create 'uploads' directory if it doesn't exist (for multer)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadDir}`);
}
app.use('/uploads', express.static(uploadDir));


// --- API Routes ---
// THESE ARE THE CORRECTED PATHS based on your latest instructions and file names:
app.use('/api/v1/products', require('./routes/product'));            // Uses routes/product.js
app.use('/api/v1/orders', require('./routes/order'));                // Uses routes/order.js
app.use('/api/v1/users', require('./routes/userRoutes'));            // Uses routes/userRoutes.js (This was always consistent)
app.use('/api/v1/admin', require('./routes/adminDashboardRoutes'));  // Uses routes/adminDashboardRoutes.js (As per your last confirmation)


// --- Health Check Route (Good for deployment monitoring) ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy and running!' });
});

// --- Global Error Handling Middleware ---
// This MUST be the last middleware added to the Express app.
const errorMiddleware = require('./middlewares/error');
app.use(errorMiddleware);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
// Capture the server instance returned by app.listen() for graceful shutdown
server = app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
    console.log(`JWT Secret (from env): ${process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED'}`);
    console.log(`FRONTEND_URL (from env): ${process.env.FRONTEND_URL ? 'Loaded' : 'NOT LOADED'}`);
});

// --- Global Unhandled Promise Rejection Handler (Asynchronous Errors) ---
// Handles errors in Promises that are not caught by a .catch() block
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection Error: ${err.message}`);
    console.error('Stack Trace:', err.stack);
    console.error('Shutting down the server due to unhandled promise rejection');
    // 'server' is now declared, so this check works
    if (server) {
        server.close(() => {
            process.exit(1); // Exit with failure code
        });
    } else {
        process.exit(1); // Exit immediately if server not yet initialized
    }
});
