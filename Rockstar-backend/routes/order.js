// routes/order.js

const express = require('express');
const router = express.Router();

const {
    newOrder,
    getAllOrders,
    getSingleOrder,
    updateOrder, // This is the function we're calling
    deleteOrder,
    myOrders
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Customer Routes
router.post('/new', isAuthenticatedUser, newOrder);
router.get('/:id', isAuthenticatedUser, getSingleOrder);
router.get('/me', isAuthenticatedUser, myOrders);

// Admin Routes
router.get('/', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders); // Path is now '/' for all orders
router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder); // <--- THIS IS THE KEY CHANGE for update
router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
