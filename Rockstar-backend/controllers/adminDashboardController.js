const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/User'); // Correct path and casing
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

exports.getDashboardStats = catchAsyncErrors(async (req, res) => {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments(); // This should now work with consistent 'User' model

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('cartItems.product'); // This should now work with consistent 'Product' model

    res.status(200).json({
        success: true,
        data: {
            totalProducts,
            totalOrders,
            totalUsers,
            recentOrders
        }
    });
});
