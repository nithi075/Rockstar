const express = require('express');
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// =======================
// 🛒 Customer Routes
// =======================

// Create a new order (customer)
router.post('/order/new', isAuthenticatedUser, createOrder);

// Get single order (admin or customer)
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);

// =======================
// 🔐 Admin Routes
// =======================

// Get all orders
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

// Update order status
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);

// Delete an order
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
