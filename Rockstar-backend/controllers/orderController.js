const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const mongoose = require("mongoose");

// CREATE ORDER
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cartItems, customerInfo } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new ErrorHandler("No cart items provided", 400));
  }

  const bulkUpdates = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const sizeStock = product.stock.find(s => s.size === item.size);
    if (!sizeStock || sizeStock.quantity < item.quantity) {
      return next(new ErrorHandler(`Insufficient stock for ${product.name} size ${item.size}`, 400));
    }

    bulkUpdates.push({
      updateOne: {
        filter: { _id: product._id, "stock.size": item.size },
        update: { $inc: { "stock.$.quantity": -item.quantity } }
      }
    });
  }

  if (bulkUpdates.length > 0) {
    await Product.bulkWrite(bulkUpdates);
  }

  const newOrder = await Order.create({ cartItems, customerInfo });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order: newOrder
  });
});

// GET ALL ORDERS (ADMIN)
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({})
    .populate("cartItems.product", "name price image");

  res.status(200).json({
    success: true,
    orders,
  });
});

// GET SINGLE ORDER
exports.getOrderById = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("cartItems.product", "name price image");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});
