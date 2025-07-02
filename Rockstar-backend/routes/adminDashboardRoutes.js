const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');

// --- Multer Configuration ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the resolved path
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage: storage });
// --- End Multer Configuration ---


// --- ADMIN ROUTES ---

// Dashboard Stats
router.get('/dashboard', isAuthenticatedUser, authorizeRoles('admin'), getDashboardStats);

// Product Management
router.post(
    '/products',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    upload.array('images', 5), // 'images' is the field name in your form/formData
    createProduct
);
router.put(
    '/products/:id',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    upload.array('images', 5), // Allow images on update too
    updateProduct
);
router.delete('/products/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

// Order Management
router.get('/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.put('/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
router.delete('/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);


module.exports = router;
