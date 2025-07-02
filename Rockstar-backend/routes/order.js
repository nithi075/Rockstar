const express = require('express');
const router = express.Router();

const {
    createOrder,
    getSingleOrder,
    getAllOrders,
    updateOrder,
    deleteOrder,
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public routes for orders
router.post('/order/new', isAuthenticatedUser, createOrder); // Added isAuthenticatedUser as typically creating an order requires being logged in
router.get('/order/:id', isAuthenticatedUser, getSingleOrder); // Added isAuthenticatedUser as typically viewing an order requires being logged in

// Admin routes for orders
// These routes are mounted under '/api/v1/orders' in app.js
// So, a request to '/api/v1/orders/admin/orders' will match router.get('/admin/orders')
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);


module.exports = router;
