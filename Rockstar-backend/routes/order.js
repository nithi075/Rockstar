// routes/order.js

const express = require('express');
const router = express.Router();

const {
  // Corrected imports to match exports from orderController.js
  newOrder,         // Was createOrder
  getAllOrders,
  getSingleOrder,
  updateOrder,      // Was updateOrderStatus
  deleteOrder,
  myOrders          // Added this import as it's an exported function
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Customer Routes
router.post('/order/new', isAuthenticatedUser, newOrder);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);
router.get('/orders/me', isAuthenticatedUser, myOrders); // Added route for user's own orders

// Admin Routes
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
