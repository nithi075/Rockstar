const express = require('express');
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getSingleOrder
} = require('../controllers/orderController');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

// Create order (accessible publicly or authenticated user)
router.post('/order/new', createOrder);

// Admin-only routes
router.get('/admin/orders', isAuthenticatedUser, isAdmin('admin'), getAllOrders);
router.get('/admin/orders/:id', isAuthenticatedUser, isAdmin('admin'), getSingleOrder);

module.exports = router;
