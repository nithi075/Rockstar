const express = require('express');
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getSingleOrder
} = require('../controllers/orderController');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

// Customer creates an order (public or optionally protected)
router.post('/order/new', createOrder);

// Admin can view all orders and specific order details
router.get('/admin/orders', isAuthenticatedUser, isAdmin('admin'), getAllOrders);
router.get('/admin/orders/:id', isAuthenticatedUser, isAdmin('admin'), getSingleOrder);

module.exports = router;
