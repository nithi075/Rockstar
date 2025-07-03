const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const mongoose = require('mongoose');

// ---------------- CREATE ORDER ----------------
exports.createOrder = async (req, res, next) => {
  console.log("Received order request body:", JSON.stringify(req.body, null, 2));

  const { cartItems: incomingCartItems, customerInfo } = req.body;

  if (!incomingCartItems || !Array.isArray(incomingCartItems) || incomingCartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty cart items provided.' });
  }

  if (!customerInfo || !customerInfo.name || !customerInfo.address || !customerInfo.phone) {
    return res.status(400).json({ success: false, message: 'Customer information (name, address, phone) is required.' });
  }

  let totalAmount = 0;
  const itemsForOrder = [];
  const bulkOperations = [];

  try {
    for (const incomingItem of incomingCartItems) {
      if (
        !incomingItem.product ||
        typeof incomingItem.product !== 'string' ||
        !mongoose.Types.ObjectId.isValid(incomingItem.product) ||
        !incomingItem.name ||
        incomingItem.price === undefined ||
        isNaN(parseFloat(incomingItem.price)) ||
        incomingItem.quantity === undefined ||
        isNaN(parseInt(incomingItem.quantity, 10)) ||
        parseInt(incomingItem.quantity, 10) <= 0
      ) {
        return res.status(400).json({ success: false, message: 'Invalid item structure in cart.' });
      }

      const productId = incomingItem.product;
      const requestedQty = parseInt(incomingItem.quantity, 10);
      const itemSize = incomingItem.size;

      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found for ID: ${productId}` });
      }

      const actualProductPrice = parseFloat(product.price);
      if (isNaN(actualProductPrice)) {
        return res.status(500).json({ success: false, message: `Invalid product price stored for ${product.name}.` });
      }

      let availableStock = 0;

      if (product.sizes && Array.isArray(product.sizes) && itemSize) {
        const sizeData = product.sizes.find(s => s.size === itemSize);
        if (sizeData) {
          availableStock = typeof sizeData.stock === 'string' ? parseInt(sizeData.stock, 10) : sizeData.stock;
          if (isNaN(availableStock)) availableStock = 0;
        } else {
          availableStock = 0;
        }
      } else {
        availableStock = typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock;
        if (isNaN(availableStock)) availableStock = 0;
      }

      if (availableStock < requestedQty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name} (Size: ${itemSize || 'N/A'}). Only ${availableStock} available.` });
      }

      itemsForOrder.push({
        product: product._id,
        name: product.name,
        price: actualProductPrice,
        quantity: requestedQty,
        size: itemSize || undefined,
      });

      totalAmount += actualProductPrice * requestedQty;

      const updateOperation = {
        updateOne: {
          filter: { _id: productId },
          update: { $inc: {} }
        }
      };

      if (itemSize && product.sizes && Array.isArray(product.sizes)) {
        updateOperation.updateOne.update.$inc["sizes.$[elem].stock"] = -requestedQty;
        updateOperation.updateOne.arrayFilters = [{ 'elem.size': itemSize }];
      } else {
        updateOperation.updateOne.update.$inc.stock = -requestedQty;
      }

      bulkOperations.push(updateOperation);
    }

    const order = await orderModel.create({
      cartItems: itemsForOrder,
      amount: totalAmount.toFixed(2),
      status: 'pending',
      customerInfo
    });

    if (bulkOperations.length > 0) {
      await productModel.bulkWrite(bulkOperations, { ordered: true });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};

// ---------------- GET SINGLE ORDER ----------------
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate('cartItems.product', 'name price images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with that ID.' });
    }

    res.status(200).json({ success: true, order });

  } catch (error) {
    console.error("Error fetching single order:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Order ID format.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error while fetching order.' });
  }
};

// ---------------- GET ALL ORDERS (Admin) ----------------
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await orderModel.countDocuments();

    const orders = await orderModel.find()
      .populate('cartItems.product', 'name price images') // ✅ populate images too
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

// ---------------- UPDATE ORDER STATUS ----------------
exports.updateOrder = async (req, res, next) => {
  try {
    let order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for update." });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status field is required for order update." });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully!",
      order
    });

  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

// ---------------- DELETE ORDER ----------------
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for deletion." });
    }

    await order.deleteOne();

    res.status(200).json({ success: true, message: "Order deleted successfully!" });

  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order." });
  }
};
