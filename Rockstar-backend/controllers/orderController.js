const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cartItems, customerInfo } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new ErrorHandler("No items in cart", 400));
  }

  const order = await orderModel.create({
    cartItems,
    customerInfo,
    createdAt: Date.now(),
  });

  // Update stock
  for (const item of cartItems) {
    const product = await productModel.findById(item.product);
    if (!product) continue;

    const sizeStock = product.stock.find((s) => s.size === item.size);
    if (sizeStock && sizeStock.quantity >= item.quantity) {
      sizeStock.quantity -= item.quantity;
      await product.save();
    } else {
      return next(
        new ErrorHandler(
          `Insufficient stock for ${product.name} - ${item.size}`,
          400
        )
      );
    }
  }

  res.status(201).json({ success: true, order });
});

// Get all orders
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await orderModel.find().populate("cartItems.product", "name price image");
  res.status(200).json({ success: true, orders });
});

// Get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id).populate("cartItems.product", "name price image");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({ success: true, order });
});
