const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productModel", // Ensure this matches your actual model
        required: true,
      },
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
    },
  ],
  customerInfo: {
    name: String,
    email: String,
    address: String,
    phone: String,
  },
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("orderModel", orderSchema);
