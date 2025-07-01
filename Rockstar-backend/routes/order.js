const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/order/new", createOrder);
router.get("/orders", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.get("/orders/:id", isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);

module.exports = router;
