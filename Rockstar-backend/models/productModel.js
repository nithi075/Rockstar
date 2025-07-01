const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required for a cart item']
  },
  name: {
    type: String,
    required: [true, 'Product name is required for a cart item']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required for a cart item']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required for a cart item'],
    min: [1, 'Quantity must be at least 1']
  },
  size: {
    type: String
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  cartItems: {
    type: [cartItemSchema],
    required: [true, 'Cart items cannot be empty for an order']
  },
  amount: {
    type: Number,
    required: [true, 'Order amount is required']
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    address: {
      type: String,
      required: [true, 'Customer address is required']
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required']
    }
    // Optionally: add email
    // email: {
    //   type: String,
    //   required: [true, 'Customer email is required'],
    //   match: [/.+\@.+\..+/, 'Please enter a valid email address']
    // }
  }
}, { timestamps: true }); // Adds createdAt and updatedAt

const orderModel = mongoose.model('Order', orderSchema);
module.exports = orderModel;
