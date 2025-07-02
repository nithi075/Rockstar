// models/productModel.js (Option 1: public_id IS REQUIRED)

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // Basic product information
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    images: [
        {
            public_id: { // This is the unique identifier from your image hosting (e.g., Cloudinary)
                type: String,
                required: true // <--- UNCOMMENTED: public_id is now REQUIRED
            },
            url: { // The actual URL of the image
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Electronics', 'Cameras', 'Laptops', 'Accessories', 'Headphones',
                'Food', 'Books', 'Clothes/Shoes', 'Beauty/Health', 'Sports',
                'Outdoor', 'Home', 'T-Shirts', 'Mobiles'
            ],
            message: 'Please select correct category for product'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        // maxLength is for strings, not numbers. Remove or change to max if needed for value.
        // For numbers, 'max' validator is appropriate for the value itself.
        // maxLength: [5, 'Product stock cannot exceed 5 characters'], // Consider removing this line
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    ratings: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    customId: {
        type: String,
        unique: true,
        sparse: true
    },
    sizes: [
        {
            size: {
                type: String,
                required: true,
                enum: ['S', 'M', 'L', 'XL', 'XXL', 'XS']
            },
            stock: {
                type: Number,
                required: true,
                min: 0,
                default: 0
            }
        }
    ],
    importDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
