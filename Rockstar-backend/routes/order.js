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

// 🔒 USER ROUTES
router.post("/order/new", isAuthenticatedUser, newOrder);
router.get("/order/:id", isAuthenticatedUser, getSingleOrder);
router.get("/orders/me", isAuthenticatedUser, myOrders);

// 🔐 ADMIN ROUTES
router.get(
  "/orders/admin/orders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllOrders
);

router.put(
  "/orders/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateOrder
);

router.put(
  "/orders/:id/deliver",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  markOrderAsDelivered
);

router.delete(
  "/orders/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteOrder
);

module.exports = router;
