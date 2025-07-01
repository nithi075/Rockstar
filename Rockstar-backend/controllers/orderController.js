const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const mongoose = require('mongoose');

// Create Order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cartItems, customerInfo } = req.body;

  if (!cartItems || !customerInfo) {
    return next(new ErrorHandler("Missing cart items or customer info", 400));
  }

  // Validate stock and build bulk operations
  const bulkOperations = [];

  for (const item of cartItems) {
    const product = await productModel.findById(item.product);

    if (!product) return next(new ErrorHandler("Product not found", 404));
    if (!product.stock[item.size] || product.stock[item.size] < item.quantity) {
      return next(new ErrorHandler(`Insufficient stock for ${product.name} (Size: ${item.size})`, 400));
    }

    bulkOperations.push({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { [`stock.${item.size}`]: -item.quantity } }
      }
    });
  }

  await productModel.bulkWrite(bulkOperations);

  const order = await orderModel.create({
    cartItems,
    customerInfo,
    createdAt: new Date()
  });

  res.status(201).json({ success: true, order });
});

// Get All Orders
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await orderModel.find().populate('cartItems.product', 'name price image');
  res.status(200).json({ success: true, orders });
});

// Get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id).populate('cartItems.product', 'name price image');

  if (!order) return next(new ErrorHandler("Order not found", 404));
  res.status(200).json({ success: true, order });
});
