const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");

// CREATE order
exports.createOrder = async (req, res) => {
  try {
    const { cartItems, customerInfo, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Reduce stock
    for (const item of cartItems) {
      const product = await productModel.findById(item.product);
      if (!product) continue;

      const sizeStock = product.size.find(s => s.size === item.size);
      if (!sizeStock || sizeStock.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name} (${item.size})` });
      }

      sizeStock.stock -= item.quantity;
      await product.save();
    }

    const order = await orderModel.create({
      cartItems,
      customerInfo,
      totalAmount,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate("cartItems.product", "name price images");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// GET order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("cartItems.product", "name price images");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order details" });
  }
};
