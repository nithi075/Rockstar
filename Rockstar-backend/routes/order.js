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

// Create a new order (customer only)
router.post('/order/new', isAuthenticatedUser, createOrder);

// Get single order by ID (customer or admin)
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);

// =======================
// 🔐 Admin Routes
// =======================

// Get all orders with pagination, search, and filters (admin only)
router.get(
  '/admin/orders',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  getAllOrders
);

// Update order status (admin only)
ro
