const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public routes
// GET /api/v1/products - Get all products (with pagination, search, category)
router.get('/', getAllProducts);
// GET /api/v1/products/:id - Get a single product by ID
router.get('/:id', getProductById);


// Admin routes (Protected by authentication and authorization middleware)
// These routes will be prefixed by whatever is used in server.js (e.g., /api/v1/admin/product)

// POST /api/v1/admin/product - Create a new product
router.post('/admin/product', isAuthenticatedUser, authorizeRoles('admin'), createProduct);
// PUT /api/v1/admin/product/:id - Update an existing product
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
// DELETE /api/v1/admin/product/:id - Delete a product
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
