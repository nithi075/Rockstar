const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create a new order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cartItems, customerInfo } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new ErrorHandler("No cart items provided", 400));
  }

  const bulkOps = cartItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.product,
        [`stock.${item.size}`]: { $gte: item.quantity },
      },
      update: {
        $inc: {
          [`stock.${item.size}`]: -item.quantity,
        },
      },
    },
  }));

  const bulkWriteResult = await Product.bulkWrite(bulkOps, { ordered: true });

  const order = await Order.create({
    user: req.user._id, // ✅ Save the user ID from the token
    cartItems,
    customerInfo,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// Get all orders (admin)
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find()
    .populate("cartItems.product", "name price image")
    .populate("user", "name email"); // ✅ Populate user info

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get a single order by ID
exports.getOrderById = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("cartItems.product", "name price image")
    .populate("user", "name email");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Update order status
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  order.status = req.body.status || order.status;

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated",
  });
});

// Delete order
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted",
  });
});
