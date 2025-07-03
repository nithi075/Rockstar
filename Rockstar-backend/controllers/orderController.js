const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// Create New Order
exports.createOrder = async (req, res) => {
    try {
        const { cartItems, customerInfo } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "No items in cart." });
        }

        // Validate & update stock
        for (const item of cartItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
            }

            const sizeStock = product.stock.find(s => s.size === item.size);
            if (!sizeStock || sizeStock.quantity < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name} (${item.size})` });
            }

            sizeStock.quantity -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            cartItems,
            customerInfo,
            totalAmount: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        });

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Orders with Pagination (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'cartItems.product',
                select: 'name price images'
            });

        const totalOrders = await Order.countDocuments();

        res.status(200).json({
            success: true,
            orders,
            totalOrders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Order
exports.getSingleOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate({
            path: 'cartItems.product',
            select: 'name price images'
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.status = status || order.status;
        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Order (Admin)
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Optionally restore stock
        for (const item of order.cartItems) {
            const product = await Product.findById(item.product);
            if (product) {
                const sizeStock = product.stock.find(s => s.size === item.size);
                if (sizeStock) {
                    sizeStock.quantity += item.quantity;
                    await product.save();
                }
            }
        }

        await order.remove();

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
