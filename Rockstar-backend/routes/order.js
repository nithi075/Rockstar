const express = require("express");
const router = express.Router();

const {
    createOrder,
    getAllOrders,
    getSingleOrder,
    deleteOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// User routes
router.post("/", isAuthenticatedUser, createOrder);
router.get("/:id", isAuthenticatedUser, getSingleOrder);

// Admin routes
router.get("/", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.delete("/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
