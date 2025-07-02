// Rockstar-backend/controllers/adminDashboardController.js

const Product = require('../models/productModel'); // Adjust path if necessary
const Order = require('../models/orderModel');     // Adjust path if necessary
const User = require('../models/User');           // Adjust path if necessary (User.js)
const catchAsyncErrors = require('../middlewares/catchAsyncErrors'); // Adjust path if necessary

// Get Dashboard Statistics for Admin Panel
exports.getDashboardStats = catchAsyncErrors(async (req, res, next) => {
    // 1. Get Total Product Count
    const totalProducts = await Product.countDocuments();

    // 2. Get Total Order Count
    const totalOrders = await Order.countDocuments();

    // 3. Get Total User Count
    const totalUsers = await User.countDocuments();

    // 4. Get Recent Orders (e.g., last 5)
    // IMPORTANT: Double-check your orderModel.js schema.
    // If your order items are stored in an array field named 'orderItems'
    // and each item has a 'product' reference, then 'orderItems.product' is correct.
    // If you named it 'cartItems' in your Order schema, then change this to 'cartItems.product'.
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 }) // Sort by latest first
        .limit(5)                // Limit to 5 recent orders
        .populate('user', 'name email') // Populate the user who placed the order
        .populate({              // Populate product details within order items
            path: 'orderItems.product', // This path needs to match your Order schema's structure
            select: 'name price images' // Select relevant product fields for display
        });

    // You might also want to calculate total revenue, out of stock products, etc.
    // Example for total revenue:
    // const orders = await Order.find({ orderStatus: 'Delivered' }); // Or all orders
    // let totalRevenue = 0;
    // orders.forEach(order => {
    //     totalRevenue += order.totalPrice;
    // });


    res.status(200).json({
        success: true,
        data: {
            totalProducts,
            totalOrders,
            totalUsers,
            recentOrders,
            // totalRevenue // If you add this calculation
        },
    });
});
