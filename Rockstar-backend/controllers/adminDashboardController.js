const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/User');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

exports.getDashboardStats = catchAsyncErrors(async (req, res) => {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('cartItems.product');

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