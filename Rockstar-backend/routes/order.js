const express = require('express');
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getSingleOrder
} = require('../controllers/orderController');

// Corrected: Use authorizeRoles instead of isAdmin
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Create order (accessible publicly or authenticated user)
router.post('/order/new', createOrder);

// Admin-only routes
// Corrected: Replaced isAdmin('admin') with authorizeRoles('admin')
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.get('/admin/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleOrder);

module.exports = router;
