const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // THIS is critical for populate()
        required: true,
      },
      name: String,
      price: Number,
      quantity: Number,
      size: String,
    },
  ],
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
