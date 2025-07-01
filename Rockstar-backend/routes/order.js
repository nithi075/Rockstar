const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
} = require("../controllers/orderController");
const { isAuthenticatedUser, isAdmin } = require("../middlewares/auth");

// Public - customer creates order
router.post("/order/new", createOrder);

// Admin routes
router.get("/admin/orders", isAuthenticatedUser, isAdmin("admin"), getAllOrders);
router.get("/admin/orders/:id", isAuthenticatedUser, isAdmin("admin"), getOrderById);

module.exports = router;
