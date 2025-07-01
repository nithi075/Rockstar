const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// ========== CREATE ORDER ==========
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        cartItems,
        shippingInfo,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

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
        paidAt: Date.now(),
        user: req.user._id,
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

    res.status(200).json({
        success: true,
        order,
    });
});

// ========== GET ALL ORDERS (Admin) ==========
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await orderModel.find()
        .populate({
            path: 'cartItems.product',
            select: 'name price images stockBySizes'
        })
        .populate({
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
        orders,
    });
});

// ========== UPDATE ORDER STATUS TO DELIVERED ==========
exports.updateOrderStatusToDelivered = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found with this ID', 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Order has already been delivered', 400));
    }

    if (order.orderStatus === 'Cancelled') {
        return next(new ErrorHandler('Cannot mark a cancelled order as delivered', 400));
    }

    order.orderStatus = 'Delivered';
    order.deliveredAt = Date.now();

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Order marked as Delivered successfully!',
        order,
    });
});

// ========== UPDATE ORDER STATUS (Generic Admin) ==========
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return next(new ErrorHandler('Status is required in request body', 400));
    }

    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    order.orderStatus = status;

    // Reset deliveredAt if status is not Delivered
    if (status !== 'Delivered' && order.deliveredAt) {
        order.deliveredAt = undefined;
    }

    // Set deliveredAt if status is changed to Delivered
    if (status === 'Delivered' && !order.deliveredAt) {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        order,
    });
});

// ========== DELETE ORDER ==========
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
    });
});
