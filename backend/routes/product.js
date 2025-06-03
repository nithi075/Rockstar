const express = require('express');
const router = express.Router();

// Correct path to your product controller
const { 
    getAllProducts, 
    getSingleProduct, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController'); 

// Public routes
router.route('/products').get(getAllProducts); // CORRECT: Pass function reference, not result of calling it
router.route('/product/:id').get(getSingleProduct); // CORRECT: Pass function reference

// Private/Admin routes (assuming you will add authentication/authorization middleware later)
router.route('/product/new').post(createProduct);
router.route('/product/:id')
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;