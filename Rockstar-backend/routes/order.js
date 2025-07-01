const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
} = require('../controllers/orderController');

const { isAuthenticatedUser } = require('../middlewares/auth');

// Customer routes
router.post('/order', createOrder);

// Admin routes
router.get('/orders', isAuthenticatedUser, getAllOrders);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);

module.exports = router;
