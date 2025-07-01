const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, isAdmin } = require("../middlewares/auth");

router.post("/order/new", createOrder);
router.get("/orders", isAuthenticatedUser, isAdmin("admin"), getAllOrders);
router.get("/orders/:id", isAuthenticatedUser, isAdmin("admin"), getSingleOrder);

module.exports = router;
