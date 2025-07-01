const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const {
    createOrder,
    getSingleOrder,
    getAllOrders,
    updateOrderStatusToDelivered,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// --- User Route ---
router.post('/new', isAuthenticatedUser, createOrder);

// --- Admin Routes ---
// Place this specific route BEFORE the generic /:id route
router.put(
    '/:id/deliver',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    updateOrderStatusToDelivered
);

router.get('/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleOrder);
router.get('/', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
