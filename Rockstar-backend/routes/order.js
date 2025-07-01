// backend/routes/order.js

const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth'); // Assuming you have these

const {
    createOrder,
    getSingleOrder,
    getAllOrders,
    updateOrderStatusToDelivered, // <-- This is the new function you need to import
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// --- User Routes ---
// Users can create orders
router.post('/new', isAuthenticatedUser, createOrder);
// Users can get their own orders (assuming user ID is fetched from req.user)
// router.get('/me', isAuthenticatedUser, getMyOrders);

// --- Admin Routes ---
// Admin can get a single order by ID
router.get('/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleOrder);

// Admin can get all orders
router.get('/', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders); // For OrderList.jsx

// Admin can update a general order status (e.g., Processing -> Shipped, Shipped -> Delivered)
// Note: This is a more generic update status route. The /:id/deliver route is more specific.
router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);

// Admin can specifically mark an order as delivered
// This is the route that resolves your 404 for the "Mark as Delivered" button
router.put(
    '/:id/deliver', // Matches PUT http://localhost:5000/api/v1/orders/YOUR_ORDER_ID/deliver
    isAuthenticatedUser,
    authorizeRoles('admin'),
    updateOrderStatusToDelivered // This controller handles marking as delivered
);

// Admin can delete an order
router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);


module.exports = router;
