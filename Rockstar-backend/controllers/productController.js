const Product = require('../models/productModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
        ? { name: { $regex: req.query.keyword, $options: 'i' } }
        : {};

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

    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const sortOptions = {};
    sortOptions[sortField] = sortOrder;

    const totalCount = await Product.countDocuments(query);

    const products = await Product.find(query)
        .sort(sortOptions)
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

exports.getProductById = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }
    res.status(200).json({ success: true, product });
});

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler('User not authenticated for product creation', 401));
    }
    req.body.user = req.user._id;

    // Handle images if uploaded via multer
    if (req.files && req.files.length > 0) {
        // You would typically upload these to a cloud storage service like Cloudinary
        // For simplicity, here we'll just store paths if req.files exists
        // In a real app, you'd process req.files and get secure URLs/public_ids
        req.body.images = req.files.map(file => ({
            public_id: file.filename, // Or a proper ID from Cloudinary
            url: `/uploads/${file.filename}` // Or URL from Cloudinary
        }));
    } else {
        // If no files, ensure images array is empty or remove it if not required
        req.body.images = []; // Or handle based on your model's requirements
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        // Handle image updates (if new files are uploaded during update)
        if (req.files && req.files.length > 0) {
             // You might want to delete old images from storage first
             const newImages = req.files.map(file => ({
                public_id: file.filename,
                url: `/uploads/${file.filename}`
             }));
             // Append new images or replace existing ones based on your logic
             req.body.images = [...(req.body.images || []), ...newImages];
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({ success: true, product });

    } catch (error) {
        console.error("Error in updateProduct:", error);
        return next(new ErrorHandler(`Product update failed: ${error.message || 'Unknown error'}`, 500));
    }
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // In a real app, you'd also delete associated images from cloud storage

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted' });
});
