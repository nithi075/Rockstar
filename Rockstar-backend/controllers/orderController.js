// backend/controllers/orderController.js

const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel'); // Keep if you need to update product stock, etc.
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// ========== CREATE ORDER ==========
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    const { cartItems, shippingInfo, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!cartItems || cartItems.length === 0 || !shippingInfo || !paymentInfo) {
        return next(new ErrorHandler('Missing required order details', 400));
    }

    const order = await orderModel.create({
        cartItems,
        shippingInfo,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(), // Or based on actual payment confirmation
        user: req.user.id, // Assuming you have user ID from authentication middleware
    });

    res.status(201).json({
        success: true,
        message: 'Order created successfully!',
        order,
    });
});

// ========== GET SINGLE ORDER ==========
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id)
        .populate({
            path: 'cartItems.product',
            select: 'name price images stockBySizes',
        })
        .populate({
            path: 'user',
            select: 'name email',
        });

    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }
    res.status(200).json({ success: true, order });
});

// ========== GET ALL ORDERS (Admin) ==========
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await orderModel.find().populate({
        path: 'cartItems.product',
        select: 'name price images stockBySizes'
    }).populate({
      path: 'user',
      select: 'name email'
    });

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });
});

// ========== UPDATE ORDER STATUS TO DELIVERED (Admin Specific) ==========
exports.updateOrderStatusToDelivered = catchAsyncErrors(async (req, res, next) => {
    try { // <--- Added try block
        const order = await orderModel.findById(req.params.id);

        if (!order) {
            return next(new ErrorHandler('Order not found with this ID', 404));
        }

        if (order.status === 'Delivered') {
            return next(new ErrorHandler('Order has already been delivered', 400));
        }
        if (order.status === 'Cancelled') {
          return next(new ErrorHandler('Cannot mark a cancelled order as delivered', 400));
        }

        order.status = 'Delivered';
        order.deliveredAt = Date.now();

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Order status updated to Delivered successfully!',
            order,
        });
    } catch (error) { // <--- Added catch block
        console.error("Error in updateOrderStatusToDelivered:", error); // <-- Crucial for logging!
        return next(new ErrorHandler('Failed to update order status to Delivered.', 500));
    }
});


// ========== UPDATE ORDER STATUS (Admin Generic) ==========
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    try { // <--- Added try block
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return next(new ErrorHandler('Order not found', 404));
        }

        const { status } = req.body;
        if (!status) {
            return next(new ErrorHandler('Status is required in request body', 400));
        }

        order.status = status;
        if (status !== 'Delivered' && order.deliveredAt) {
            order.deliveredAt = undefined;
        }

        await order.save({ validateBeforeSave: false });

        res.status(200).json({ success: true, message: Order status updated to ${status}, order });
    } catch (error) { // <--- Added catch block
        console.error("Error in updateOrderStatus (generic):", error); // <-- Crucial for logging!
        return next(new ErrorHandler('Failed to update order status (generic).', 500));
    }
});


// ========== DELETE ORDER (Admin) ==========
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }
    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
});
