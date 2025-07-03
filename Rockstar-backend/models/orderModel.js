const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { // <--- THIS IS THE MISSING FIELD
        type: mongoose.Schema.ObjectId,
        ref: 'User', // IMPORTANT: 'User' must match the name you used when defining your User model (e.g., mongoose.model('User', userSchema))
        required: true,
    },
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pinCode: { type: Number, required: true },
        phoneNo: { type: Number, required: true },
    },
    orderItems: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true }, // Assuming image URL is stored directly
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product', // IMPORTANT: 'Product' must match your Product model name
                required: true,
            },
        },
    ],
    paymentInfo: {
        id: { type: String, required: true },
        status: { type: String, required: true },
    },
    itemsPrice: {
        type: Number,
        default: 0,
        required: true,
    },
    taxPrice: {
        type: Number,
        default: 0,
        required: true,
    },
    shippingPrice: {
        type: Number,
        default: 0,
        required: true,
    },
    totalPrice: {
        type: Number,
        default: 0,
        required: true,
    },
    orderStatus: { // You might have 'status' or 'orderStatus'
        type: String,
        required: true,
        default: 'Processing',
    },
    deliveredAt: Date, // Timestamp for delivery
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema); 
