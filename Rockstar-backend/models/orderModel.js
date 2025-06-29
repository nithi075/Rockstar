const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    cartItems: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Added required: true
        name: { type: String, required: true }, // Added required: true
        size: String,
        price: { type: Number, required: true }, // Added required: true
        quantity: { type: Number, required: true } // Added required: true
    }],
    customerInfo: { // This might be for guest checkouts, or just redundant if user field exists
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        address: { type: String, required: true }
    },
    // Add the user field to link orders to a specific user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This must match the name you use when defining your User model: mongoose.model('User', userSchema)
        required: true // An order should generally belong to a user
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled']
    },
    deliveredAt: { // Add this if you want to track delivery date in the model
        type: Date,
    }
}, { timestamps: true }); // timestamps: true automatically adds createdAt and updatedAt

module.exports = mongoose.model('Order', orderSchema);