const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  markOrderAsDelivered,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// 🧾 PUBLIC/USER ROUTES
router.post("/order/new", isAuthenticatedUser, newOrder); // Create new order
router.get("/order/:id", isAuthenticatedUser, getSingleOrder); // Get single order by ID
router.get("/orders/me", isAuthenticatedUser, myOrders); // Get logged-in user's orders

// 🔐 ADMIN ROUTES
router.get(
  "/admin/orders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllOrders
); // Get all orders

router.put(
  "/admin/orders/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateOrder
); // Update order status

router.put(
  "/admin/orders/:id/deliver",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  markOrderAsDelivered
); // Mark order as delivered

router.delete(
  "/admin/orders/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteOrder
); // Delete order

module.exports = router;
