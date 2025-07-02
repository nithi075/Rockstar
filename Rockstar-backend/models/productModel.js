const mongoose = require('mongoose');

// Sub-schema for product reviews
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // IMPORTANT: This 'User' MUST match the name used in mongoose.model('User', ...)
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Sub-schema for product sizes and their stock (if your product has sizes)
const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        required: [true, 'Size name is required (e.g., S, M, L, XL)'],
        uppercase: true, // Standardize size names
        trim: true,
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity for this size is required'],
        default: 0,
        min: [0, 'Stock cannot be negative'],
    },
}, { _id: false }); // No _id for sub-documents in the sizes array

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter product Name'],
        trim: true, // Removes whitespace from both ends of a string
        maxLength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please Enter product Description'],
    },
    price: {
        type: Number,
        required: [true, 'Please Enter product Price'],
        maxLength: [8, 'Price cannot exceed 8 digits'], // Example, adjust as needed
        default: 0.0,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    category: {
        type: String,
        required: [true, 'Please Enter Product Category'],
    },
    // If products have multiple sizes with different stock, use this.
    // If products just have one general stock, use the 'stock' field below.
    sizes: {
        type: [sizeSchema], // Array of size objects
        // Not required if all products have a single 'stock' field
        // If required, you'd add: required: [true, 'At least one size with stock is required']
    },
    // General stock for products that don't have different sizes,
    // or as a fallback if 'sizes' array is empty/not used for a product.
    // Make sure your controller logic correctly prioritizes 'sizes.stock' over 'stock'.
    stock: {
        type: Number,
        required: [true, 'Please Enter product Stock'],
        maxLength: [4, 'Stock cannot exceed 4 digits'], // Example, adjust as needed
        default: 0,
        min: [0, 'Stock cannot be negative'],
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [reviewSchema], // Array of review documents
    user: { // The user who created this product (admin)
        type: mongoose.Schema.ObjectId,
        ref: 'User', // IMPORTANT: This 'User' MUST match the name used in mongoose.model('User', ...)
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// IMPORTANT: This must be 'Product' for consistency with orderModel and controllers
module.exports = mongoose.model('Product', productSchema);
