// orderController.js

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHander = require('../utils/errorHandler'); // Assuming you have this
const catchAsyncErrors = require('../middleware/catchAsyncErrors'); // Assuming you have this

// 1. Create New Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems, // Renamed from cartItems to orderItems as per common practice in MERN for orders
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  // Validate that orderItems is not empty
  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorHander("No order items found", 400));
  }

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id, // Assuming req.user is set by your auth middleware
  });

  // Decrease product stock for each item
  for (const item of order.orderItems) {
    await updateStock(item.product, item.quantity); // Assuming item.product is the product _id
  }

  res.status(201).json({
    success: true,
    order,
  });
});

// Helper function to update product stock
async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);

  if (!product) {
    // This case should ideally be handled before order creation
    // or signify a deleted product after order.
    console.warn(`Product with ID ${productId} not found for stock update.`);
    return;
  }

  product.stock -= quantity;

  // Ensure stock doesn't go below zero (though frontend should prevent this)
  if (product.stock < 0) {
    product.stock = 0;
  }

  await product.save({ validateBeforeSave: false }); // Bypass validation if stock goes to 0 or less
}


// 2. Get Single Order Details -- Admin or the User who placed it
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email") // Populate user details
    .populate({ // Populate product details within order items
      path: 'orderItems.product',
      select: 'name price images stock' // Select necessary product fields, including images
    });

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  // Check if the user is an admin OR the user who placed the order
  if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHander(`You are not authorized to view this order`, 403));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// 3. Get Logged In User Orders (My Orders)
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .populate({
      path: 'orderItems.product',
      select: 'name images price' // Select images for user's order view
    })
    .sort({ createdAt: -1 }); // Latest orders first

  res.status(200).json({
    success: true,
    orders,
  });
});

// 4. Get All Orders -- ADMIN
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user", "name email") // Populate user who placed the order
    .populate({ // Populate product details within order items
      path: 'orderItems.product',
      select: 'name images price' // <--- CRITICAL: Select 'images' from the Product model
    })
    .sort({ createdAt: -1 }); // Latest orders first

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// 5. Update Order Status -- ADMIN
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.status === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400));
  }

  // If status is "Shipped", we should not decrease stock again.
  // We only decrease stock when the order is created or when it transitions to 'Shipped' for the first time.
  // The provided `newOrder` already handles stock reduction, so we skip it here.
  // If you want to deduct stock only on 'Shipped' status, remove stock update from `newOrder` and add it here.

  order.status = req.body.status; // Set new status from request body

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order, // Return the updated order for frontend to reflect
  });
});


// 6. Delete Order -- ADMIN
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  await order.deleteOne(); // Use deleteOne() for Mongoose 6+

  res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});
