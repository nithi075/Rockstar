// Rockstar-backend/routes/order.js

const express = require('express');
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController'); // Adjust path if necessary

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth'); // Changed to 'middlewares'

// Public route for creating an order (assuming user is authenticated)
// Make sure newOrder is indeed a function being imported
router.route('/order/new').post(isAuthenticatedUser, newOrder);

// Get a single order (accessible by user for their own order, or by admin)
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);

// Get all orders for the authenticated user
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

// ADMIN Routes
router.route('/admin/orders')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

router.route('/admin/orders/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder) // Handles status updates (including 'Delivered')
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

// You had a specific route for '/orders/:id/deliver'.
// You can keep it if you want a distinct endpoint, but the `updateOrder`
// controller already handles setting the status to 'Delivered'.
// If you want to keep it, it would look like this:
// router.route('/orders/:id/deliver').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder);


module.exports = router;
