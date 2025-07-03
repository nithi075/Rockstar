const express = require('express');
const router = express.Router();

const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    updateOrderStatusAdmin
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// --------------------- USER ROUTES ---------------------

// Create a new order
router.route("/order/new").post(isAuthenticatedUser, newOrder);

// Get a single order (for logged-in user)
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

// Get all orders for logged-in user
router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// --------------------- ADMIN ROUTES ---------------------

// Get all orders (admin)
router.route("/admin/orders").get(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getAllOrders
);

// Get single order (admin)
router.route("/admin/orders/:id").get(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getSingleOrder
);

// Update order status to "Delivered" (admin)
router.route("/admin/orders/:id/deliver").put(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateOrderStatusAdmin // Make sure this function is defined in your controller
);

// Delete order (admin)
router.route("/admin/orders/:id").delete(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    deleteOrder
);

module.exports = router;
