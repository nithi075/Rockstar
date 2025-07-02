// Rockstar-backend/controllers/orderController.js

const Order = require('../models/orderModel'); // Adjust path if necessary
const Product = require('../models/productModel'); // Adjust path if necessary
const ErrorHandler = require('../utils/errorHandler'); // Adjust path if necessary
const catchAsyncErrors = require('../middlewares/catchAsyncErrors'); // Changed to 'middlewares'

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

// 1. Create New Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems, // IMPORTANT: Ensure frontend sends an array named 'orderItems'
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    // Validate that orderItems is not empty
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
        user: req.user._id, // Assuming req.user is set by your auth middleware
    });

    // Decrease product stock for each item
    for (const item of order.orderItems) {
        // Check if item.product exists (it should be an ObjectId if populated correctly)
        if (item.product) {
            await updateStock(item.product, item.quantity); // Assuming item.product is the product _id
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
        .populate("user", "name email") // Populate user details
        .populate({ // Populate product details within order items
            path: 'orderItems.product', // Path to the product reference in orderItems array
            select: 'name price images stock' // Select necessary product fields, including images
        });

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    // Check if the user is an admin OR the user who placed the order
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
            path: 'orderItems.product', // CRITICAL: Path to the product reference in orderItems array
            select: 'name images price' // CRITICAL: Select 'images' from the Product model
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
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    // Use order.orderStatus for consistency with your schema
    // Prevent status updates if already delivered or cancelled
    if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
        return next(new ErrorHandler(`Order has already been ${order.orderStatus}. No further updates allowed.`, 400));
    }

    // If the status is changing to 'Delivered', set deliveredAt timestamp
    // Use req.body.status as sent from the frontend
    if (req.body.status === "Delivered" && order.orderStatus !== "Delivered") {
        order.deliveredAt = Date.now();
    }

    // Update the orderStatus field in your Mongoose model
    order.orderStatus = req.body.status; // Set new status from request body

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
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.deleteOne(); // Use deleteOne() for Mongoose 6+

    res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});
