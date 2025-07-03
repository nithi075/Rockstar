const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Helper function to update stock
async function updateStock(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) return;
    product.stock -= quantity;
    if (product.stock < 0) product.stock = 0;
    await product.save({ validateBeforeSave: false });
}

// 1. Create New Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return next(new ErrorHandler("No order items found in the request.", 400));
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
        user: req.user._id,
    });

    for (const item of order.orderItems) {
        if (item.product) await updateStock(item.product, item.quantity);
    }

    res.status(201).json({ success: true, order });
});

// 2. Get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate({
            path: 'orderItems.product',
            select: 'name price images stock'
        });

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Not authorized to view this order", 403));
    }

    res.status(200).json({ success: true, order });
});

// 3. Get Logged In User Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
        .populate({
            path: 'orderItems.product',
            select: 'name images price'
        })
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
});

// ✅ 4. Get All Orders — Admin with image flattening
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()
        .populate("user", "name email")
        .populate({
            path: 'orderItems.product',
            select: 'name images price'
        })
        .sort({ createdAt: -1 });

    let totalAmount = 0;

    const updatedOrders = orders.map(order => {
        totalAmount += order.totalPrice;
        const updatedItems = order.orderItems.map(item => ({
            ...item._doc,
            image: item.product?.images?.[0] || null,
            name: item.product?.name,
            price: item.product?.price,
        }));
        return {
            ...order._doc,
            orderItems: updatedItems,
        };
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders: updatedOrders,
    });
});

// ✅ 5. Update Order Status
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order not found", 404));
    if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
        return next(new ErrorHandler(`Order already ${order.orderStatus}`, 400));
    }

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    order.orderStatus = req.body.status;
    await order.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, order });
});

// ✅ 6. Mark as Delivered (new endpoint)
exports.markOrderAsDelivered = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order not found", 404));
    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Order is already delivered", 400));
    }

    order.orderStatus = "Delivered";
    order.deliveredAt = Date.now();
    await order.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: "Order marked as delivered" });
});

// 7. Delete Order
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order not found", 404));
    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order deleted" });
});
