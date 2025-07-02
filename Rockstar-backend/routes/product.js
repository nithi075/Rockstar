const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    createProduct, // This is now handled in adminRoutes due to multer
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes (Protected by authentication and authorization middleware)
// The actual creation, update, delete product routes will be handled via /api/v1/admin/products
// These specific routes here are left for clarity, but the admin ones are moved to adminRoutes.js
// If you want all product management under '/api/v1/products', uncomment these:
// router.post('/', isAuthenticatedUser, authorizeRoles('admin'), createProduct);
// router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
// router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
