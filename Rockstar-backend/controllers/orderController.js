const Order = require('../models/orderModel'); // Adjust path if necessary
const Product = require('../models/productModel'); // Adjust path if necessary
const ErrorHandler = require('../utils/errorHandler'); // Adjust path if necessary
const catchAsyncErrors = require('../middlewares/catchAsyncErrors'); // Changed to 'middlewares'

// Helper function to update product stock
async function updateStock(productId, quantity) {
    const product = await Product.findById(productId);

    if (!product) {
        console.warn(`Product with ID ${productId} not found for stock update.`);
        return;
    }

    product.stock -= quantity;

    if (product.stock < 0) {
        product.stock = 0;
    }

    await product.save({ validateBeforeSave: false });
}

// 1. Create New Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems, // This array MUST contain 'image' for each item from the frontend
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
        orderItems, // Mongoose will save this directly IF the 'image' field is present in the incoming data
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id, // Assuming req.user is set by your auth middleware
    });

    for (const item of order.orderItems) {
        if (item.product) {
            await updateStock(item.product, item.quantity);
        } else {
            console.warn(`Order item missing product ID: ${item.name}`);
        }
    }

    res.status(201).json({
        success: true,
        order,
    });
});


// 2. Get Single Order Details -- Admin or the User who placed it
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email") // Correct: Populates user details
        .populate({
            path: 'orderItems.product',
            select: 'name price images stock' // Correct: Selects images from the Product model
        });

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler(`You are not authorized to view this order`, 403));
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
            select: 'name images price' // Correct: Selects images from the Product model
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders,
    });
});

// 4. Get All Orders -- ADMIN
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()
        .populate("user", "name email") // Correct: Populates user details
        .populate({
            path: 'orderItems.product',
            select: 'name images price' // Correct: Selects images from the Product model
        })
        .sort({ createdAt: -1 });

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
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
        return next(new ErrorHandler(`Order has already been ${order.orderStatus}. No further updates allowed.`, 400));
    }

    if (req.body.status === "Delivered" && order.orderStatus !== "Delivered") {
        order.deliveredAt = Date.now();
    }

    order.orderStatus = req.body.status;

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        order,
    });
});


// 6. Delete Order -- ADMIN
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});
