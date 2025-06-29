const express = require('express');
const router = express.Router();
const multer = require('multer'); // Import multer
const path = require('path');     // Import path
const fs = require('fs');         // Import fs (for ensuring directory)

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { createProduct } = require('../controllers/productController'); // <--- IMPORT createProduct controller

// --- Multer Configuration for this route ---
// Ensure the uploads directory exists relative to the server.js root or project root
const uploadDir = path.join(__dirname, '../uploads'); // Go up one level from 'routes', then into 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // recursive: true creates parent folders if they don't exist
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // This path is relative to the directory where your main server.js is executed
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent collisions
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });
// --- End Multer Configuration ---


// --- ADMIN ROUTES ---

// Existing Dashboard Route
router.get('/dashboard', isAuthenticatedUser, authorizeRoles('admin'), getDashboardStats);

// NEW: Route for creating products
// Frontend hits /api/v1/admin/products with POST
router.post(
    '/products', // <--- This matches the '/products' part after '/api/v1/admin'
    isAuthenticatedUser,
    authorizeRoles('admin'),
    upload.array('images', 5), // Multer middleware to handle image uploads (max 5 images)
    createProduct // Your controller function that handles product creation logic
);

module.exports = router;