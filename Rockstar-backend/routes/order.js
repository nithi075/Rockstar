const express = require('express');
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getSingleOrder
} = require('../controllers/orderController');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

router.post('/order/new', createOrder); // Public or protected depending on use case

// Admin routes
router.get('/admin/orders', isAuthenticatedUser, isAdmin('admin'), getAllOrders);
router.get('/admin/orders/:id', isAuthenticatedUser, isAdmin('admin'), getSingleOrder);

module.exports = router;
