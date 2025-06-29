// backend/controllers/orderController.js

const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel'); // Keep if you need to update product stock, etc.
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// ========== CREATE ORDER ==========
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    // TODO: Implement the actual createOrder logic here.
    // This would typically involve:
    // 1. Validating req.body (cartItems, customerInfo, shippingAddress, paymentInfo, etc.)
    // 2. Calculating total price and handling taxes/shipping costs.
    // 3. Optionally decreasing product stock (if applicable, for each item in cartItems).
    // 4. Creating the order in the database.
    // 5. Sending a response with the new order.

    // Example of how you might start:
    const { cartItems, shippingInfo, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!cartItems || cartItems.length === 0 || !shippingInfo || !paymentInfo) {
        return next(new ErrorHandler('Missing required order details', 400));
    }

    // You might loop through cartItems here to update product stock
    // for (const item of cartItems) {
    //     const product = await productModel.findById(item.product);
    //     if (product) {
    //         // Assuming stock per size
    //         if (product.stockBySizes && item.size && product.stockBySizes[item.size] !== undefined) {
    //             if (product.stockBySizes[item.size] < item.quantity) {
    //                 return next(new ErrorHandler(`Not enough stock for ${product.name} (${item.size})`, 400));
    //             }
    //             product.stockBySizes[item.size] -= item.quantity;
    //         } else if (product.stock !== undefined) { // Fallback for general stock if not size-based
    //             if (product.stock < item.quantity) {
    //                 return next(new ErrorHandler(`Not enough stock for ${product.name}`, 400));
    //             }
    //             product.stock -= item.quantity;
    //         }
    //         await product.save({ validateBeforeSave: false }); // Save updated stock
    //     }
    // }

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
    // Populate product details for items in the cart
    const order = await orderModel.findById(req.params.id)
        .populate({
            path: 'cartItems.product', // Path to the product reference in cartItems
            select: 'name price images stockBySizes', // Select fields to include from the product
        })
        .populate({
            path: 'user', // Populate user details if order has a user reference
            select: 'name email', // Select fields to include from the user
        });

    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }
    res.status(200).json({ success: true, order });
});

// ========== GET ALL ORDERS (Admin) ==========
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    // Optionally populate product details and user info for each order
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
        totalAmount, // Useful for dashboard stats
        orders
    });
});

// ========== UPDATE ORDER STATUS TO DELIVERED (Admin Specific) ==========
// This function handles the specific action of marking an order as 'Delivered'.
exports.updateOrderStatusToDelivered = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found with this ID', 404));
    }

    // Prevent changing status if already delivered or cancelled (good practice)
    if (order.status === 'Delivered') {
        return next(new ErrorHandler('Order has already been delivered', 400));
    }
    if (order.status === 'Cancelled') {
      return next(new ErrorHandler('Cannot mark a cancelled order as delivered', 400));
    }
    // You might also want to check for 'Processing' or 'Shipped' before allowing 'Delivered'
    // if (order.status !== 'Shipped' && order.status !== 'Processing') {
    //     return next(new ErrorHandler('Order must be in Shipped or Processing state to be delivered', 400));
    // }


    order.status = 'Delivered';
    order.deliveredAt = Date.now(); // Add a timestamp for when it was delivered

    // Save the updated order. { validateBeforeSave: false } can be used if you're only changing status
    // and don't want to re-run full schema validation, but use with caution.
    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Order status updated to Delivered successfully!',
        order,
    });
});


// ========== UPDATE ORDER STATUS (Admin Generic) ==========
// This function can be used for other general status updates (e.g., 'Processing', 'Shipped', 'Cancelled').
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    const { status } = req.body; // Expects the new status in the request body
    if (!status) {
        return next(new ErrorHandler('Status is required in request body', 400));
    }

    // Optional: Add more robust validation or business logic for status transitions here
    // For example, prevent changing from 'Delivered' to 'Processing'
    // if (order.status === 'Delivered' && status !== 'Delivered') {
    //     return next(new ErrorHandler('Cannot change status of a delivered order', 400));
    // }

    order.status = status;
    // If status is not 'Delivered', clear deliveredAt if it exists
    if (status !== 'Delivered' && order.deliveredAt) {
        order.deliveredAt = undefined;
    }

    await order.save({ validateBeforeSave: false }); // Use validateBeforeSave: false carefully

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, order });
});


// ========== DELETE ORDER (Admin) ==========
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }
    // Using deleteOne() from Mongoose 6+
    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
});