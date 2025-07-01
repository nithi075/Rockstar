const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const mongoose = require('mongoose');

// Create new order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        cartItems,
        customerInfo,
        totalAmount,
    } = req.body;

    // Check stock for each item
    for (const item of cartItems) {
        const product = await productModel.findById(item.product);
        if (!product) {
            return next(new ErrorHandler(`Product not found: ${item.product}`, 404));
        }

        const sizeStock = product.stockBySizes.find(s => s.size === item.size);
        if (!sizeStock || sizeStock.quantity < item.quantity) {
            return next(new ErrorHandler(`Insufficient stock for ${product.name} size ${item.size}`, 400));
        }
    }

    // Create order
    const order = await orderModel.create({
        user: req.user._id,
        cartItems,
        customerInfo,
        totalAmount,
        paidAt: Date.now(),
    });

    // Decrease stock
    for (const item of cartItems) {
        await productModel.updateOne(
            { _id: item.product, "stockBySizes.size": item.size },
            { $inc: { "stockBySizes.$.quantity": -item.quantity } }
        );
    }

    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order,
    });
});

// Get all orders (admin)
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await orderModel
        .find()
        .populate("user", "name email")
        .populate("cartItems.product", "name price images");

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get single order by ID
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel
        .findById(req.params.id)
        .populate("cartItems.product", "name price images")
        .populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    // Allow only admin or owner
    if (
        req.user.role !== "admin" &&
        order.user._id.toString() !== req.user._id.toString()
    ) {
        return next(new ErrorHandler("Access denied: You can only view your own orders", 403));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// Delete order (admin)
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    await orderModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    });
});
