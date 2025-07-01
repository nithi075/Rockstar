// routes/order.js

const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/auth"); // ✅ Correct import

const router = express.Router();

router.post("/order/new", isAuthenticatedUser, newOrder);

router.get("/order/:id", isAuthenticatedUser, getSingleOrder);

router.get("/orders/me", isAuthenticatedUser, myOrders);

// ✅ Use authorizeRoles instead of isAdmin
router.get(
  "/admin/orders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllOrders
);

router.put(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateOrder
);

router.delete(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteOrder
);

module.exports = router;
