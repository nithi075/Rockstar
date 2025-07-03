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

router.post('/order/new', isAuthenticatedUser, createOrder);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);

// =======================
// 🔐 Admin Routes
// =======================

router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
