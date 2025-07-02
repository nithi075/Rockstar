const express = require('express');
const router = express.Router();

const {
    createOrder,
    getSingleOrder,
    getAllOrders, // This is now handled in adminRoutes
    updateOrder,  // This is now handled in adminRoutes
    deleteOrder,  // This is now handled in adminRoutes
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public routes
router.post('/order/new', createOrder);
router.get('/order/:id', getSingleOrder);

// The admin routes for orders will be managed through adminRoutes.js for clarity
// If you want all order management under '/api/v1/orders', uncomment these:
// router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
// router.route('/admin/order/:id')
//   .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
//   .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);


module.exports = router;
