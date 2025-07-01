const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const {
  createOrder,
  getAllOrders,
  getOrderById,
  deleteOrder
} = require('../controllers/orderController');

router.post('/orders', createOrder);
router.get('/orders', isAuthenticatedUser, isAdmin('admin'), getAllOrders);
router.get('/orders/:id', isAuthenticatedUser, isAdmin('admin'), getOrderById);
router.delete('/orders/:id', isAuthenticatedUser, isAdmin('admin'), deleteOrder);

module.exports = router;
