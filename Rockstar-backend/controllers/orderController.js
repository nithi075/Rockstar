const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// ------------------ USER ROUTES ------------------

// Create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        user: req.user._id,
        paidAt: Date.now()
    });

    // Update stock for each product/variant
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        if (item.size && product.stock && product.stock[item.size] !== undefined) {
            product.stock[item.size] = Math.max(0, product.stock[item.size] - item.quantity);
        } else {
            product.stock = Math.max(0, product.stock - item.quantity);
        }

        await product.save({ validateBeforeSave: false });
    }

    res.status(201).json({
        success: true,
        order
    });
});

// Get single order (User or Admin)
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate("orderItems.product", "name price image");

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order
    });
});

// Get logged-in user's orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
        .populate("orderItems.product", "name price image");

    res.status(200).json({
        success: true,
        orders
    });
});

// ------------------ ADMIN ROUTES ------------------

// Get all orders (admin) with pagination
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
        .populate("user", "name email")
        .populate("orderItems.product", "name price image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        orders,
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
    });
});

// Update order status (admin)
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

// Delete order (admin)
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    // Optional: restore stock when deleting
    for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        if (item.size && product.stock && product.stock[item.size] !== undefined) {
            product.stock[item.size] += item.quantity;
        } else {
            product.stock += item.quantity;
        }

        await product.save({ validateBeforeSave: false });
    }

    await order.remove();

    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    });
});
