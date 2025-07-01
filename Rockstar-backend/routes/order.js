const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrderById,
  getAllOrders,       // Admin route
  deleteOrder,        // Admin route
  updateOrderStatus,  // Admin route
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// ----------------- Public Routes -----------------

// Create a new order
router.post('/', isAuthenticatedUser, createOrder);

// Get a single order by ID
router.get('/:id', isAuthenticatedUser, getOrderById);

// ----------------- Admin Routes -----------------

// Get all orders (admin)
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

// Delete an order by ID (admin)
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

// Update order status (admin)
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);

module.exports = router;
