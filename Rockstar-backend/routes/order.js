const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getSingleOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// Create new order
router.post("/order/new", createOrder);

// Admin: Get all orders
router.get("/orders", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// Admin: Get one order by ID
router.get("/orders/:id", isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);

module.exports = router;
