const Product = require('../models/productModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// You might also need to import something for deleting local files if you want to clean up old images
// const fs = require('fs');
// const util = require('util');
// const unlinkFile = util.promisify(fs.unlink);

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
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler('User not authenticated for product creation', 401));
    }
    req.body.user = req.user._id;

    let productImages = [];
    // Handle images if uploaded via multer
    if (req.files && req.files.length > 0) {
        // IMPORTANT: In a production app with Cloudinary, you'd upload files here
        // and get back actual public_ids and secure URLs.
        // For local storage, we're using filename as public_id.
        productImages = req.files.map(file => ({
            public_id: file.filename, // Using filename as public_id for local storage
            url: `/uploads/${file.filename}` // Local URL
        }));
    }

    // Assign the processed images array to req.body.images
    req.body.images = productImages;

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
});

// --- Update Product (Admin Only) ---
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Create a new object for update data to avoid directly modifying req.body
    const updateData = { ...req.body };

    // --- Handle image updates ---
    let newImages = [];

    // Case 1: New files are uploaded via multer
    if (req.files && req.files.length > 0) {
        // You might want to delete old images from storage here
        // if they are being replaced. This depends on your frontend logic
        // (e.g., if the frontend sends an empty `images` array in req.body
        // when new files are uploaded, implying full replacement).

        newImages = req.files.map(file => ({
            public_id: file.filename, // Again, this should be Cloudinary public_id
            url: `/uploads/${file.filename}` // Again, this should be Cloudinary URL
        }));
        // Merge the new uploaded images with any existing images that the frontend sent in req.body.images
        // This assumes frontend sends all images (existing + new non-file ones) in req.body.images
        updateData.images = [...(req.body.images || []), ...newImages];

    } else if (updateData.images !== undefined) {
        // Case 2: No new files are uploaded, but 'images' field is explicitly sent in req.body.
        // This means the frontend intends to update the images array (e.g., reordering, deleting existing,
        // or sending new images by URL instead of file upload).
        // It's crucial that any images sent here (existing or new) conform to the schema (have public_id).
        // If frontend sends an empty array here and schema requires images, it will fail.
        // The frontend must send back the full, desired state of the images array.
        // We simply use whatever the frontend provides for 'images'.
        // Validation will happen on `runValidators: true`.
        // No explicit action needed here beyond what `updateData = {...req.body}` already did.

    } else {
        // Case 3: No new files are uploaded AND 'images' field is NOT present in req.body.
        // This implies images are NOT being updated.
        // We explicitly remove 'images' from updateData so findByIdAndUpdate does not touch the images array,
        // preserving the existing, valid images on the product document.
        delete updateData.images;
    }

    // Perform the update
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true, // Return the modified document rather than the original
        runValidators: true, // Run schema validators on this update operation
        useFindAndModify: false, // Use native MongoDB driver findOneAndUpdate, avoids deprecation warning
    });

    res.status(200).json({ success: true, product });
});

// --- Delete Product (Admin Only) ---
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // In a real app with local storage, you would delete the associated image files from the 'uploads' directory
    // Example (requires 'fs' and 'util'):
    // for (const image of product.images) {
    //     try {
    //         await unlinkFile(path.join(__dirname, '../uploads', image.public_id)); // Assuming public_id is filename
    //     } catch (err) {
    //         console.warn(`Could not delete old image file: ${image.public_id}. Error: ${err.message}`);
    //     }
    // }
    // If using Cloudinary, you'd use Cloudinary's destroy method here for each image's public_id.

    await product.deleteOne(); // Mongoose 6+ uses deleteOne(), remove() is deprecated
    res.status(200).json({ success: true, message: 'Product deleted' });
});
