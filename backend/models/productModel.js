const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // Basic product information
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true, // Remove whitespace from both ends of a string
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        // You might want to adjust maxLength for price, as it refers to string length.
        // For numbers, consider min/max validators instead.
        // maxLength: [5, 'Product price cannot exceed 5 characters'], // Consider removing or changing this for numbers
        default: 0.0,
        min: [0, 'Price cannot be negative'] // Example: min price validation
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    images: [
        {
            public_id: { // If you integrate with a cloud storage like Cloudinary
                type: String,
                // required: true // Make required if you enforce images
            },
            url: { // The actual URL of the image
                type: String,
                required: true // Image URL should be required
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        // Example of allowed categories, you can expand this
        enum: {
            values: [
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home',
                'T-Shirts', // Added based on your sample data
                'Mobiles'
            ],
            message: 'Please select correct category for product'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller']
    },
    stock: { // Overall stock, if not managed by sizes
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [5, 'Product stock cannot exceed 5 characters'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: { // Reference to the User model if you have one
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
    ratings: { // Average rating calculated from reviews
        type: Number,
        default: 0
    },
    user: { // User who created this product (e.g., admin)
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // --- Custom fields from your data ---
    customId: { // Your unique product identifier, e.g., "rockstarZippedColarTshirt06"
        type: String,
        unique: true, // Ensure customId is unique
        sparse: true // Allows null values, but ensures uniqueness for non-null values
    },
    sizes: [ // If products have different sizes with different stock levels
        {
            size: {
                type: String,
                required: true,
                enum: ['S', 'M', 'L', 'XL', 'XXL', 'XS'] // Example sizes
            },
            stock: {
                type: Number,
                required: true,
                min: 0,
                default: 0
            }
        }
    ],
    // --- The crucial importDate field ---
    importDate: {
        type: Date, // <--- THIS IS THE KEY: It must be a BSON Date type
        default: Date.now // Automatically sets the current date/time on creation
    }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

module.exports = mongoose.model('Product', productSchema);