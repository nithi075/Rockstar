const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        default: 0.0,
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
        maxLength: [2000, 'Product description cannot exceed 2000 characters']
    },
    images: [
        {
            public_id: {
                type: String
            },
            url: {
                type: String,
                required: [true, 'Image URL is required']
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select a category for this product'],
        enum: {
            values: [
                'Electronics', 'Cameras', 'Laptops', 'Accessories', 'Headphones',
                'Food', 'Books', 'Clothes/Shoes', 'Beauty/Health', 'Sports',
                'Outdoor', 'Home', 'T-Shirts', 'Mobiles', 'Watches', 'Jewelry'
            ],
            message: 'Please select a valid category'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller']
    },
    sizes: [
        {
            size: {
                type: String,
                required: [true, 'Size is required'],
                enum: {
                    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'N/A'],
                    message: 'Invalid size value'
                },
                default: 'N/A' // Consider if 'N/A' should be a default or only present if no specific size
            },
            stock: {
                type: Number,
                required: [true, 'Stock for size is required'],
                min: [0, 'Stock cannot be negative'],
                default: 0
            },
            _id: false
        }
    ],
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
                required: true,
                min: [1, 'Minimum rating is 1'],
                max: [5, 'Maximum rating is 5']
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    ratings: {
        type: Number,
        default: 0
    },
    user: { // This is the user who CREATED the product (e.g., admin)
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true // Still required, handled in controller
    },
    customId: {
        type: String,
        unique: true,
        sparse: true,
        maxLength: [50, 'Custom ID cannot exceed 50 characters'],
        trim: true
    },
    importDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to calculate total stock
productSchema.virtual('totalStock').get(function () {
    if (this.sizes && this.sizes.length > 0) {
        return this.sizes.reduce((acc, size) => acc + size.stock, 0);
    }
    return 0;
});

// Pre-save middleware to recalculate reviews/ratings
productSchema.pre('save', function (next) {
    if (this.isModified('reviews')) {
        this.numOfReviews = this.reviews.length;
        if (this.numOfReviews > 0) {
            const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
            this.ratings = totalRating / this.numOfReviews;
        } else {
            this.ratings = 0;
        }
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);