// Rockstar-backend/routes/adminDashboardRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// --- VERIFY THESE CONTROLLER IMPORT PATHS ---
// Based on your screenshot, these should be 'productControll' and 'orderControl'
const { getDashboardStats } = require('../controllers/adminDashboardController'); // Confirmed this is correct now
const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController'); // <-- Make sure it's 'productControll' if that's your filename!
const { getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');     // <-- Make sure it's 'orderControl' if that's your filename!
// --- END VERIFICATION ---


// --- Multer Configuration (assuming this is correct) ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); },
});
const upload = multer({ storage: storage });
// --- End Multer Configuration ---


// --- ADMIN ROUTES (These are the routes your backend expects) ---

// Dashboard Stats
router.get('/dashboard', isAuthenticatedUser, authorizeRoles('admin'), getDashboardStats);

// Product Management (Expected by backend at /api/v1/admin/products and /api/v1/admin/products/:id)
router.post(
    '/products', // This means POST /api/v1/admin/products
    isAuthenticatedUser,
    authorizeRoles('admin'),
    upload.array('images', 5),
    createProduct
);
router.put(
    '/products/:id', // This means PUT /api/v1/admin/products/:id
    isAuthenticatedUser,
    authorizeRoles('admin'),
    upload.array('images', 5),
    updateProduct
);
router.delete('/products/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct); // This means DELETE /api/v1/admin/products/:id

// Order Management (Expected by backend at /api/v1/admin/orders and /api/v1/admin/orders/:id)
router.get('/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders); // This means GET /api/v1/admin/orders
router.put('/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder); // This means PUT /api/v1/admin/orders/:id
router.delete('/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder); // This means DELETE /api/v1/admin/orders/:id


module.exports = router;
