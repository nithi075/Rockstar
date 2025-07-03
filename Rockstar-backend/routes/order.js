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

// ---- USER ROUTES ----
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// ---- ADMIN ROUTES ----
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.route("/admin/orders/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);
router.route("/admin/orders/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

// Use whichever function you implemented in your controller
router.route("/admin/orders/:id/deliver").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatusAdmin);

module.exports = router;
