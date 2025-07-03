const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    cartItems,
    customerInfo,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    cartItems,
    customerInfo,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderStatus: "Processing",
    paidAt: Date.now(),
  });

  // Reduce stock per item size
  const bulkOps = cartItems.map(item => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: {
          [`stock.${item.size}`]: -item.quantity,
        }
      }
    }
  }));

  await Product.bulkWrite(bulkOps);

  res.status(201).json({
    success: true,
    order,
  });
});

// Get single order by ID
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('cartItems.product', 'name price image')
    .lean();

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get all orders (admin)
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments();

  const orders = await Order.find()
    .populate('cartItems.product', 'name price image')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    orders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
  });
});

// Update order status by admin
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
    order,
  });
});

// Update any order (optional for future)
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  Object.assign(order, req.body);
  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

// Delete order (admin only)
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

// Get logged-in user's orders (optional)
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ "customerInfo.email": req.user.email })
    .populate('cartItems.product', 'name price image')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});
