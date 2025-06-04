const productModel = require('../models/productModel'); // Ensure this path is correct

// @desc    Get all products
// @route   GET /api/v1/products (with pagination, search, category filter, and latest sorting)
// @access  Public
exports.getAllProducts = async (req, res, next) => {
    try {
        const query = {}; // Base query object for filtering

        // 1. Handle Keyword Search
        if (req.query.keyword) {
            query.name = { $regex: req.query.keyword, $options: 'i' };
        }

        // 2. Handle Category Filtering
        if (req.query.category) {
            // Case-insensitive matching for the category field
            query.category = new RegExp(`^${req.query.category}$`, 'i');        }

        // 3. Handle Price Filtering (if applicable)
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = parseFloat(req.query.maxPrice);
            }
        }

        // --- Pagination Logic ---
        const currentPage = parseInt(req.query.page) || 1;
        // Default limit for products per page. This will determine how many
        // products are sent from the backend. For "New Arrivals", you might
        // want to ensure you get enough for your frontend's display (e.g., 8 to 12).
        const productsPerPage = parseInt(req.query.limit) || 20; // Default 12 products per page
        const skip = (currentPage - 1) * productsPerPage;

        // Count total products matching the current filter (before pagination)
        const totalProducts = await productModel.countDocuments(query);

        // Find products matching the query, apply sorting, then pagination
        // IMPORTANT: Sorting by importDate in descending order for "New Arrivals"
        const products = await productModel.find(query)
                                          .limit(productsPerPage)
                                          .skip(skip)
                                          .sort({ importDate: -1 }); // Sort by newest importDate

        res.status(200).json({
            success: true,
            count: products.length,        // Number of products on the current page
            totalProducts: totalProducts,  // Total number of products matching the query (for pagination)
            products
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not fetch products.',
            error: error.message // Include error message for debugging in dev environment
        });
    }
};

// @desc    Get Single Product
// @route   GET /api/v1/product/:id
// @access  Public
exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found with that ID.'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Error fetching single product:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Product ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching product.',
            error: error.message
        });
    }
};

// @desc    Create Product
// @route   POST /api/v1/product/new
// @access  Private (e.g., Admin)
exports.createProduct = async (req, res, next) => {
    try {
        // When a new product is created, its importDate will automatically be set to Date.now
        // by the Mongoose schema default.
        const product = await productModel.create(req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully!",
            product
        });
    } catch (error) {
        console.error("Error creating product:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${messages.join(', ')}`
            });
        } else if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({
                success: false,
                message: `Duplicate field value entered for ${Object.keys(error.keyValue)[0]}: ${Object.values(error.keyValue)[0]}. Please use another value.`
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to create product.",
            error: error.message
        });
    }
};

// @desc    Update Product
// @route   PUT /api/v1/product/:id
// @access  Private (e.g., Admin)
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found for update." });
        }

        // When a product is updated, you might want to consider if its importDate
        // should also be updated. For "New Arrivals" meaning "most recently added to store",
        // updating importDate on every product update might not be desired.
        // If an update *means* it's a new arrival (e.g., re-stocked), you'd explicitly
        // set req.body.importDate = new Date(); before calling findByIdAndUpdate.
        // As per the current schema, importDate only defaults on *creation*.
        product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,           // Return the modified document rather than the original
            runValidators: true, // Run Mongoose validators on update
            useFindAndModify: false // Recommended to avoid deprecated function
        });

        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Product ID format for update." });
        } else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: `Validation Error: ${messages.join(', ')}` });
        } else if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({
                success: false,
                message: `Duplicate field value entered for ${Object.keys(error.keyValue)[0]}: ${Object.values(error.keyValue)[0]}. Please use another value.`
            });
        }
        res.status(500).json({ success: false, message: "Failed to update product.", error: error.message });
    }
};

// @desc    Delete Product
// @route   DELETE /api/v1/product/:id
// @access  Private (e.g., Admin)
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found for deletion." });
        }

        await product.deleteOne(); // Mongoose 6+ prefers deleteOne() on the document itself

        res.status(200).json({
            success: true,
            message: "Product deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Product ID format for deletion." });
        }
        res.status(500).json({ success: false, message: "Failed to delete product.", error: error.message });
    }
};