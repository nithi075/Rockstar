const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create a new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const { cartItems, customerInfo, totalAmount } = req.body;

  const order = await Order.create({
    cartItems,
    customerInfo,
    totalAmount,
  });

  // Reduce stock per size
  for (const item of cartItems) {
    const product = await Product.findById(item.product);

    if (!product || !product.sizes[item.size]) {
      return next(new ErrorHandler(`Product or size not found`, 404));
    }

    if (product.sizes[item.size] < item.quantity) {
      return next(new ErrorHandler(`Not enough stock for ${item.name}`, 400));
    }

    product.sizes[item.size] -= item.quantity;
    await product.save();
  }

  res.status(201).json({
    success: true,
    order,
  });
});

// Get all orders (Admin)
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().populate("cartItems.product", "name price image");

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get a single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("cartItems.product", "name price image");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Update order status to Delivered (Admin)
exports.updateOrderStatusAdmin = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Order already delivered", 400));
  }

  order.orderStatus = "Delivered";
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order marked as delivered",
  });
});

// Update an order (optional)
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (!updatedOrder) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order: updatedOrder,
  });
});

// Delete an order
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});
