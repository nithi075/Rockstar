const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel'); // Ensure this matches your product model file
const mongoose = require('mongoose'); // Needed for mongoose.Types.ObjectId.isValid

exports.createOrder = async (req, res, next) => {
    console.log("Received order request body:", JSON.stringify(req.body, null, 2));

    const { cartItems: incomingCartItems, customerInfo } = req.body;

    // --- 1. Initial Input Validation ---
    if (!incomingCartItems || !Array.isArray(incomingCartItems) || incomingCartItems.length === 0) {
        console.log("Validation failed: Invalid or empty cart items provided.");
        return res.status(400).json({ success: false, message: 'Invalid or empty cart items provided.' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.address || !customerInfo.phone) {
        console.log("Validation failed: Customer information (name, address, phone) is required.");
        return res.status(400).json({ success: false, message: 'Customer information (name, address, phone) is required.' });
    }

    let totalAmount = 0;
    const itemsForOrder = [];
    const bulkOperations = []; // To store direct Mongoose bulk write operations for stock updates

    try {
        console.log("Starting stock validation and total calculation...");

        // --- 2. Validate Cart Items, Check Stock, and Prepare Data/Updates ---
        for (const incomingItem of incomingCartItems) {
            console.log("Processing incoming cart item:", incomingItem);

            // Basic validation for each item's structure
            if (
                !incomingItem.product ||
                typeof incomingItem.product !== 'string' ||
                !mongoose.Types.ObjectId.isValid(incomingItem.product) ||
                !incomingItem.name ||
                incomingItem.price === undefined || // Check for undefined first
                isNaN(parseFloat(incomingItem.price)) ||
                incomingItem.quantity === undefined || // Check for undefined first
                isNaN(parseInt(incomingItem.quantity, 10)) ||
                parseInt(incomingItem.quantity, 10) <= 0
            ) {
                console.log("Validation failed: Invalid item structure in cart. Item:", incomingItem);
                return res.status(400).json({ success: false, message: 'Invalid item structure in cart.' });
            }

            const productId = incomingItem.product;
            const requestedQty = parseInt(incomingItem.quantity, 10);
            const itemSize = incomingItem.size; // This can be undefined if product doesn't have sizes

            // Fetch the product from the database
            const product = await productModel.findById(productId);
            if (!product) {
                console.log(`Product not found: ${productId}`);
                return res.status(404).json({ success: false, message: `Product not found for ID: ${productId}` });
            }

            // Ensure product price is a valid number from the DB
            // It's best practice for your product schema to store price as a Number,
            // but parsing here acts as a safeguard.
            const actualProductPrice = parseFloat(product.price);
            if (isNaN(actualProductPrice)) {
                console.log(`Invalid product price for ${product.name} (ID: ${product._id}).`);
                return res.status(500).json({ success: false, message: `Invalid product price stored for ${product.name}.` });
            }

            let availableStock = 0;

            // Determine current stock for the specific size or general stock
            if (product.sizes && Array.isArray(product.sizes) && itemSize) {
                const sizeData = product.sizes.find(s => s.size === itemSize);
                if (sizeData) {
                    availableStock = typeof sizeData.stock === 'string' ? parseInt(sizeData.stock, 10) : sizeData.stock;
                    if (isNaN(availableStock)) availableStock = 0; // Default to 0 if parsing fails
                } else {
                    console.log(`Warning: Size '${itemSize}' not found for product ${product.name}. Assuming 0 stock.`);
                    availableStock = 0;
                }
            } else {
                // If no sizes or itemSize not provided, use top-level stock
                availableStock = typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock;
                if (isNaN(availableStock)) availableStock = 0; // Default to 0 if parsing fails
            }

            // --- Stock Check ---
            if (availableStock < requestedQty) {
                console.log(`Insufficient stock for ${product.name} (Size: ${itemSize || 'N/A'}). Only ${availableStock} available, requested ${requestedQty}.`);
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name} (Size: ${itemSize || 'N/A'}). Only ${availableStock} available.` });
            }

            // Add item details to the list for the order document
            itemsForOrder.push({
                product: product._id, // Store actual product ID from DB
                name: product.name,
                price: actualProductPrice,
                quantity: requestedQty,
                size: itemSize || undefined, // Store size if provided, otherwise undefined
            });
            totalAmount += actualProductPrice * requestedQty;

            // --- CRITICAL SECTION: Constructing the update operation for stock ---
            const updateOperation = {
                updateOne: {
                    filter: { _id: productId }, // Filter for the main product document
                    update: { $inc: {} }        // Initialize $inc object
                }
            };

            // Check if item has a size and product has a 'sizes' array in its schema
            if (itemSize && product.sizes && Array.isArray(product.sizes)) {
                // If a size is specified, update the stock within the 'sizes' array using arrayFilters
                updateOperation.updateOne.update.$inc["sizes.$[elem].stock"] = -requestedQty;
                updateOperation.updateOne.arrayFilters = [{ 'elem.size': itemSize }];
            } else {
                // If no size is specified or product doesn't use a 'sizes' array (or no matching size),
                // update the top-level 'stock' field.
                updateOperation.updateOne.update.$inc.stock = -requestedQty;
            }

            bulkOperations.push(updateOperation); // Add to bulk operations array

        } // End of for loop for cart items

        console.log("Validated items for order:", JSON.stringify(itemsForOrder, null, 2));
        console.log("Calculated total amount:", totalAmount.toFixed(2));
        console.log("Customer Info to be saved:", customerInfo);

        // --- 3. Create the Order in the Database ---
        console.log("Attempting to create order in database...");
        const order = await orderModel.create({
            cartItems: itemsForOrder,
            amount: totalAmount.toFixed(2), // Ensure this matches the Number type in schema (Mongoose will cast from string)
            status: 'pending',
            customerInfo: customerInfo
        });
        console.log("Order creation successful! Order ID:", order._id);
        console.log("Newly created order object (full response from DB):", JSON.stringify(order, null, 2));

        // --- 4. Update Product Stock (Atomic Bulk Operation) ---
        console.log("Attempting to update product stock using bulkWrite operations...");
        if (bulkOperations.length > 0) {
            // Using ordered: true (default) is generally recommended for stock management
            // to ensure sequential application and fail fast if an update fails.
            const bulkResult = await productModel.bulkWrite(bulkOperations, { ordered: true });
            console.log("Bulk stock update result:", bulkResult);
            // You can inspect bulkResult.modifiedCount to verify successful updates
        } else {
            console.log("No stock update operations to perform (cartItems was empty after validation).");
        }
        console.log("All product stocks initiated for update.");


        // --- 5. Send Success Response ---
        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order
        });

    } catch (error) {
        // --- 6. Centralized Error Handling ---
        console.error('*** UNCAUGHT ERROR DURING ORDER CREATION PROCESS ***');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${messages.join(', ')}`
            });
        } else if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid ID format provided in cart items or request parameters.`
            });
        } else if (error instanceof mongoose.mongo.MongoBulkWriteError) {
            // Handle bulk write errors specifically
            console.error("MongoDB BulkWrite Error:", error.writeErrors);
            let errorMessage = 'Failed to update product stock. Some updates may have failed.';
            if (error.writeErrors && error.writeErrors.length > 0) {
                // You can customize this message to be more specific if needed
                errorMessage = `Stock update error: ${error.writeErrors[0].errmsg || error.writeErrors[0].message}`;
            }
            return res.status(500).json({
                success: false,
                message: errorMessage,
                details: error.writeErrors // Send details of failed writes
            });
        }
        // Generic server error for any other unhandled exceptions
        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
};

// --- Other Order Controller functions ---

// Get Single Order API - /api/v1/order/:id
exports.getSingleOrder = async (req, res, next) => {
    try {
        // Populate product details (name, price, images)
        const order = await orderModel.findById(req.params.id).populate('cartItems.product', 'name price images'); 

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found with that ID.'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Error fetching single order:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Order ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching order.',
            error: error.message
        });
    }
};

// Get All Orders API - /api/v1/admin/orders (Admin route, often requires authentication/authorization)
exports.getAllOrders = async (req, res, next) => {
    try {
        // You might want to add pagination or filters here for larger datasets
        const orders = await orderModel.find().populate('cartItems.product', 'name price'); // Populate product details

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders.',
            error: error.message
        });
    }
};

// Update Order Status API - /api/v1/admin/order/:id (Admin route)
exports.updateOrder = async (req, res, next) => {
    try {
        let order = await orderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found for update." });
        }

        // Only allow updating status for simplicity, or specific fields
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: "Status field is required for order update." });
        }
        order.status = status;

        // Save the updated order
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order updated successfully!",
            order
        });
    } catch (error) {
        console.error("Error updating order:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Order ID format for update." });
        } else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ success: false, message: "Failed to update order.", error: error.message });
    }
};

// Delete Order API - /api/v1/admin/order/:id (Admin route)
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await orderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found for deletion." });
        }

        // IMPORTANT CONSIDERATION:
        // You might want to handle stock reversal here if an order is cancelled/deleted.
        // This is complex and depends on your business logic (e.g., only if status is 'pending' or 'cancelled').
        // For simplicity, this example just deletes the order without reversing stock.
        // If implementing stock reversal:
        // for (const item of order.cartItems) {
        //     if (item.size) {
        //         await productModel.updateOne(
        //             { _id: item.product, 'sizes.size': item.size },
        //             { $inc: { 'sizes.$.stock': item.quantity } }
        //         );
        //     } else {
        //         await productModel.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        //     }
        // }

        await order.deleteOne();

        res.status(200).json({
            success: true,
            message: "Order deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting order:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Order ID format for deletion." });
        }
        res.status(500).json({ success: false, message: "Failed to delete order.", error: error.message });
    }
};
