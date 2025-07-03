const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Helper to update stock
const updateStock = async (cartItems, increment = false) => {
  const bulkOps = cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: {
          [`stock.${item.size}`]: increment ? item.quantity : -item.quantity,
        },
      },
    },
  }));
  await Product.bulkWrite(bulkOps);
};

// @desc Create new order
exports.createOrder = async (req, res) => {
  try {
    const { cartItems, customerInfo } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "No items in cart" });
    }

    // Validate stock availability
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const currentStock = product.stock[item.size] || 0;
      if (currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} - Size ${item.size}`,
        });
      }
    }

    // Reduce stock
    await updateStock(cartItems);

    const order = await Order.create({
      user: req.user._id,
      cartItems,
      customerInfo,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all orders (Admin) with pagination
exports.getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .populate("cartItems.product", "name price image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single order (Customer or Admin)
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("cartItems.product", "name price image");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only allow owner or admin to view
    if (!req.user.roles.includes("admin") && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = req.body.status || order.status;
    await order.save();

    res.status(200).json({ success: true, message: "Order status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete order (Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Optionally restore stock
    // await updateStock(order.cartItems, true);

    await order.remove();

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
