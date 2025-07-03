const express = require('express');
const router = express.Router();
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder, // Assuming this can handle status updates if updateOrderStatusAdmin is not separate
    deleteOrder,
    updateOrderStatusAdmin // Make sure this function exists in your controller if you use it
} = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// User routes (assuming these are already in place and correct)
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// --- ADMIN ROUTES ---
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// ADDED: Route to get a single order for admin
router.route("/admin/orders/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);

// Corrected: Path for updating order status (e.g., mark as delivered)
// Use updateOrderStatusAdmin if you have a dedicated controller for it, otherwise use updateOrder
router.route("/admin/orders/:id/deliver").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatusAdmin || updateOrder); // Adjust as per your controller logic

// Admin delete order
router.route("/admin/orders/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);


module.exports = router;
