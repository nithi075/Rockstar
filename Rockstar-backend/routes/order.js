const express = require('express');
const router = express.Router();

const {
  createOrder,
  getSingleOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// PUBLIC ROUTES
router.post('/order/new', createOrder);
router.get('/order/:id', getSingleOrder);

// ADMIN ROUTES (Protected)
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router
  .route('/admin/order/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
