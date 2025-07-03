const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { cartItems, customerInfo } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    // Check stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const sizeStock = product.sizes.find((s) => s.size === item.size);
      if (!sizeStock || sizeStock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} - Size ${item.size}`,
        });
      }
    }

    // Update stock
    const bulkOps = cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product, "sizes.size": item.size },
        update: { $inc: { "sizes.$.quantity": -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    // Create order
    const order = await Order.create({ cartItems, customerInfo });
    res.status(201).json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Failed to create order", error });
  }
};

// Get all orders (admin) with pagination
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("cartItems.product", "name price images");

    res.status(200).json({
      success: true,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "cartItems.product",
      "name price images"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ message: "Failed to get order", error });
  }
};

// Update order status (admin)
exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: "Failed to update order", error });
  }
};

// Delete order (admin)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // OPTIONAL: Restore stock if needed
    // for (const item of order.cartItems) {
    //   await Product.updateOne(
    //     { _id: item.product, "sizes.size": item.size },
    //     { $inc: { "sizes.$.quantity": item.quantity } }
    //   );
    // }

    await order.remove();
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ message: "Failed to delete order", error });
  }
};
