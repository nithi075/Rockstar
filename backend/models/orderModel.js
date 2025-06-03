const mongoose = require('mongoose');

// Define the sub-schema for individual items within the cartItems array
const cartItemSchema = new mongoose.Schema({
    // 'product' here refers to the _id of the Product document
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // This is a reference to your Product model
        required: [true, 'Product ID is required for a cart item']
    },
    name: { // The name of the product at the time of order
        type: String,
        required: [true, 'Product name is required for a cart item']
    },
    price: { // The price of the product at the time of order
        type: Number, // Recommended: Use Number for currency values for arithmetic
        required: [true, 'Product price is required for a cart item']
    },
    quantity: { // The quantity of this specific product in the order
        type: Number,
        required: [true, 'Quantity is required for a cart item'],
        min: [1, 'Quantity must be at least 1']
    },
    size: { // Include size if you're tracking it per item in an order
        type: String,
        // You might want to make this required if all your products have sizes
        // or add an enum for valid sizes if it's a fixed set.
        // enum: ['S', 'M', 'L', 'XL', 'XXL'] // Example if you have fixed sizes
    }
}, { _id: false }); // Do not create an _id for each cart item sub-document

const orderSchema = new mongoose.Schema({
    cartItems: {
        type: [cartItemSchema], // This makes cartItems an array of documents conforming to cartItemSchema
        required: [true, 'Cart items cannot be empty for an order']
    },
    amount: { // Total amount of the order
        type: Number, // **Strongly recommended to be Number for currency**
        required: [true, 'Order amount is required']
    },
    status: {
        type: String,
        default: 'pending', // Default status for new orders
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] // Good practice to use enum
    },
    createdAt: {
        type: Date,
        default: Date.now // Store as UTC; convert to IST on the frontend for display
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
    }
});

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;