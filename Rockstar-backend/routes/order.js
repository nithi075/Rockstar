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

// Create new order (User)
router.post("/new", isAuthenticatedUser, createOrder);

// Get all orders (Admin)
router.get("/admin", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// Get order by ID (User/Admin)
router.get("/:id", isAuthenticatedUser, getOrderById);

// Update order status (Admin)
router.put("/:id", isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus);

// Delete order (Admin)
router.delete("/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
