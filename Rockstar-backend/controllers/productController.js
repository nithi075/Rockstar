const Product = require('../models/productModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler'); // Make sure you have this utility

// @desc    Get all products
// @route   GET /api/v1/products (with pagination, search, category filter, and latest sorting)
// @access  Public
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
        ? { name: { $regex: req.query.keyword, $options: 'i' } }
        : {};

    // --- Added Category and Price Filtering from your previous attempts ---
    const query = { ...keyword };

    if (req.query.category) {
        query.category = new RegExp(`^${req.query.category}$`, 'i');
    }

    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) {
            query.price.$gte = parseFloat(req.query.minPrice);
        }
        if (req.query.maxPrice) {
            query.price.$lte = parseFloat(req.query.maxPrice);
        }
    }
    // --- End Category and Price Filtering ---


    const totalCount = await Product.countDocuments(query); // Use the combined query

    const products = await Product.find(query) // Use the combined query
        .sort({ createdAt: -1 }) // Sort by creation date for "latest" products
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        products,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
    });
});

// @desc    Get Single Product
// @route   GET /api/v1/product/:id
// @access  Public
exports.getProductById = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }
    res.status(200).json({ success: true, product });
});

// @desc    Create Product
// @route   POST /api/v1/product/new (or /api/v1/products)
// @access  Private (e.g., Admin)
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    // CRITICAL FIX: Assign the authenticated user's ID to the product
    // This assumes `isAuthenticatedUser` middleware populates `req.user`
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler('User not authenticated for product creation', 401));
    }
    req.body.user = req.user._id;

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
});

// @desc    Update Product
// @route   PUT /api/v1/product/:id (or /api/v1/products/:id)
// @access  Private (e.g., Admin)
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    try { // <--- START OF ADDED TRY BLOCK
        let product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        // Handle image updates if applicable (not explicitly handled in this snippet)
        // If your frontend sends images in req.body and not as form-data, ensure your model
        // can handle direct assignment or you have separate logic for them here.

        // Update the product fields from req.body
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the modified document rather than the original
            runValidators: true, // Run Mongoose validators on update
            useFindAndModify: false, // Recommended to avoid deprecated function
        });

        res.status(200).json({ success: true, product });

    } catch (error) { // <--- START OF ADDED CATCH BLOCK
        console.error("Error in updateProduct:", error); // <--- CRUCIAL LOGGING LINE
        return next(new ErrorHandler(`Product update failed: ${error.message || 'Unknown error'}`, 500));
    }
});

// @desc    Delete Product
// @route   DELETE /api/v1/product/:id (or /api/v1/products/:id)
// @access  Private (e.g., Admin)
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Ensure only the owner/admin can delete their products if user field is present
    // if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    //    return next(new ErrorHandler(`User is not authorized to delete this product`, 403));
    // }

    await product.deleteOne(); // Use deleteOne for Mongoose 6+
    res.status(200).json({ success: true, message: 'Product deleted' });
});
