const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// User creates a new order
router.post("/new", isAuthenticatedUser, createOrder);

// Admin routes
router.get("/admin", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.get("/:id", isAuthenticatedUser, getOrderById);
router.put("/:id", isAuthenticatedUser, authorizeRoles("admin"
