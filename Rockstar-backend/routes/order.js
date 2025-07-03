// routes/order.js

const express = require('express');
const router = express.Router();
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    updateOrderStatusAdmin, // Make sure this is exported in orderController.js
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// 🧑‍💻 USER ROUTES
router.post("/order/new", isAuthenticatedUser, newOrder);
router.get("/order/:id", isAuthenticatedUser, getSingleOrder);
router.get("/orders/me", isAuthenticatedUser, myOrders);

// 🔐 ADMIN ROUTES
router.get("/admin/orders", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.get("/admin/orders/:id", isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);

// ✅ FIXED: Make sure the handler exists
router.put("/admin/orders/:id/deliver", isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatusAdmin);

// ✅ Optional: Allow admins to delete orders
router.delete("/admin/orders/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
