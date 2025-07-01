const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// CREATE ORDER
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { cartItems, customerInfo } = req.body;

  if (!cartItems || !customerInfo) {
    return next(new ErrorHandler("Cart items and customer info are required", 400));
  }

  const bulkOps = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const stockItem = product.stock.find((s) => s.size === item.size);
    if (!stockItem || stockItem.quantity < item.quantity) {
      return next(new ErrorHandler(`Not enough stock for ${product.name} (${item.size})`, 400));
    }

    stockItem.quantity -= item.quantity;

    bulkOps.push({
      updateOne: {
        filter: { _id: product._id, "stock.size": item.size },
        update: { $inc: { "stock.$.quantity": -item.quantity } },
      },
    });
  }

  await Product.bulkWrite(bulkOps);

  const order = await Order.create({
    cartItems,
    customerInfo,
    createdAt: Date.now(),
  });

  res.status(201).json({ success: true, order });
});

// GET ALL ORDERS
exports.getAllOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find().populate("cartItems.product", "name image price");
  res.status(200).json({ success: true, orders });
});

// GET SINGLE ORDER
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("cartItems.product", "name image price");

  if (!order) {
    return next(new ErrorHandler("Order not found", 400));
  }

  res.status(200).json({ success: true, order });
});
