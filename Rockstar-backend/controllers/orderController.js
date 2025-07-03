const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// ============================
// Create New Order (User)
// ============================
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cartItems, customerInfo } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new ErrorHandler("No cart items provided", 400));
  }

  // Validate & Update stock for each item
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

  const result = await Product.bulkWrite(bulkOps, { ordered: true });

  // Create Order
  const order = await Order.create({
    user: req.user._id,
    cartItems,
    customerInfo,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// ============================
// Get All Orders (Admin) with Pagination
// ============================
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments();
  const orders = await Order.find()
    .populate("cartItems.product", "name price image")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    orders,
  });
});

// ============================
// Get Single Order by ID
// ============================
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

// ============================
// Update Order Status (Admin)
// ============================
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  const { status } = req.body;
  order.status = status || order.status;

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated",
  });
});

// ============================
// Delete Order (Admin)
// ============================
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
