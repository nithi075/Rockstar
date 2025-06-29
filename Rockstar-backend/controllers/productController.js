const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create Product (Admin only)
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
});

// Get All Products (with optional search, filter, pagination)
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
        ? {
              name: { $regex: req.query.keyword, $options: 'i' },
          }
        : {};

    const products = await Product.find({ ...keyword })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ ...keyword });

    res.status(200).json({
        success: true,
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
    });
});

// Get Single Product
exports.getProductById = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }
    res.status(200).json({ success: true, product });
});

// Update Product (Admin only)
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({ success: true, product });
});

// Delete Product (Admin only)
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    await product.remove();
    res.status(200).json({ success: true, message: 'Product deleted' });
});
