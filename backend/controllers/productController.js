const Product = require('../models/productModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Optional: For local file deletion (if you implement deleting old images)
// const fs = require('fs');
// const path = require('path');
// const util = require('util');
// const unlinkFile = util.promisify(fs.unlink); // Promisify for async/await

// --- Get All Products (Public & Admin) ---
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

// --- Get Single Product by ID (Public & Admin) ---
exports.getProductById = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }
    res.status(200).json({ success: true, product });
});

// --- Create Product (Admin Only) ---
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    // Assuming req.user is populated by isAuthenticatedUser middleware
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler('User not authenticated for product creation', 401));
    }
    req.body.user = req.user._id;

    let productImages = [];
    // Handle images if uploaded via multer
    if (req.files && req.files.length > 0) {
        // In a real app with Cloudinary/S3, you'd upload files here
        // and get back actual public_ids and secure URLs.
        productImages = req.files.map(file => ({
            public_id: file.filename, // Using filename as public_id for local storage
            url: `/uploads/${file.filename}` // Local URL
        }));
    }
    // If no files are uploaded, productImages will be an empty array,
    // which is fine if your schema allows an empty 'images' array.
    req.body.images = productImages;

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
});

// --- Update Product (Admin Only) ---
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found for update.", 404));
    }

    // Create a mutable copy of req.body to safely manipulate image data
    const updateData = { ...req.body };

    // --- Image Handling Logic for Update ---
    // This logic handles three scenarios for images during an update:
    // 1. New image files are uploaded via multer (req.files).
    // 2. The frontend explicitly sends an 'images' array in req.body (e.g., existing images, or new URLs).
    // 3. No image-related data is sent, meaning existing images should be preserved.

    if (req.files && req.files.length > 0) {
        // Scenario 1: New image files are uploaded.
        // You might want to delete old images from storage here first (if replacing all).
        // Example for local storage:
        // for (const img of product.images) {
        //     try {
        //         await unlinkFile(path.join(__dirname, '../uploads', img.public_id));
        //     } catch (err) {
        //         console.warn(`Failed to delete old image file: ${img.public_id}`, err);
        //     }
        // }

        const newUploadedImages = req.files.map(file => ({
            public_id: file.filename, // Replace with Cloudinary public_id if used
            url: `/uploads/${file.filename}` // Replace with Cloudinary URL if used
        }));

        // Combine existing images (if sent in req.body.images) with newly uploaded ones.
        // This assumes frontend sends all images (existing + new non-file ones) in req.body.images,
        // and new files are appended. Adjust this logic if you want to completely replace.
        updateData.images = [...(req.body.images || []), ...newUploadedImages];

    } else if (updateData.images !== undefined) {
        // Scenario 2: No new files are uploaded, but 'images' field is explicitly present in req.body.
        // This implies the frontend is explicitly managing the image array (e.g., reordering, removing some existing images).
        // We trust the frontend to send the complete, desired state of the 'images' array here.
        // Mongoose validators will apply to this array. Frontend MUST send valid public_id and url for each.
        // If the frontend sends an empty array here, and your schema requires images, it will fail validation.
        // No explicit action needed here as `updateData.images` already holds the value from `req.body.images`.

    } else {
        // Scenario 3: No new files are uploaded AND 'images' field is NOT present in req.body.
        // This indicates that images are NOT being updated by this request.
        // To preserve the existing images on the product document, we explicitly delete 'images' from updateData.
        // This prevents `findByIdAndUpdate` from trying to overwrite the valid existing images with an empty or malformed array.
        delete updateData.images;
    }

    // You might have a `maxLength` validator on a `Number` type field like `stock` in your schema.
    // If so, it causes validation errors. Remove it or change to `max`.
    // Example: `stock: { type: Number, max: [99999, 'Stock cannot exceed 99999'], default: 0 }`

    // Perform the update
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,           // Return the modified document rather than the original
        runValidators: true, // Run Mongoose validators on update (essential for catching schema violations)
        useFindAndModify: false // Recommended to avoid deprecated function
    });

    res.status(200).json({
        success: true,
        message: "Product updated successfully!",
        product
    });
});

// --- Delete Product (Admin Only) ---
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found for deletion.", 404));
    }

    // Optional: Delete associated image files from local storage (or Cloudinary)
    // Example for local storage:
    // for (const image of product.images) {
    //     try {
    //         await unlinkFile(path.join(__dirname, '../uploads', image.public_id));
    //     } catch (err) {
    //         console.warn(`Could not delete old image file: ${image.public_id}. Error: ${err.message}`);
    //     }
    // }
    // If using Cloudinary, use Cloudinary's destroy method here for each image's public_id.

    await product.deleteOne(); // Mongoose 6+ prefers deleteOne() on the document itself

    res.status(200).json({
        success: true,
        message: "Product deleted successfully!"
    });
});
