const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById
} = require("../controllers/orderController");

const { isAuthenticatedUser, isAdmin } = require("../middlewares/auth");

// Routes
router.post("/order/new", createOrder); // Public
router.get("/admin/orders", isAuthenticatedUser, isAdmin("admin"), getAllOrders); // Admin
router.get("/order/:id", isAuthenticatedUser, isAdmin("admin"), getOrderById);    // Admin

module.exports = router;
