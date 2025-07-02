const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public routes for products
// These routes are mounted under '/api/v1/products' in app.js
// So, a request to '/api/v1/products/' will match router.get('/')
// A request to '/api/v1/products/:id' will match router.get('/:id')
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes for products
// These routes are mounted under '/api/v1/products' in app.js
// So, a request to '/api/v1/products/admin/product/:id' will match router.delete('/admin/product/:id')
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin'), createProduct);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);


module.exports = router;
