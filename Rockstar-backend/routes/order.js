const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, isAdmin } = require("../middlewares/auth");

// Create Order (for customers)
router.post("/create", createOrder);

// Get all orders (for admin)
router.get("/admin/orders", isAuthenticatedUser, isAdmin("admin"), getAllOrders);

// Get single order (for admin or user)
router.get("/:id", isAuthenticatedUser, getSingleOrder);

// Update Order (admin only)
router.put("/:id", isAuthenticatedUser, isAdmin("admin"), updateOrder);

// Delete Order (admin only)
router.delete("/:id", isAuthenticatedUser, isAdmin("admin"), deleteOrder);

module.exports = router;
