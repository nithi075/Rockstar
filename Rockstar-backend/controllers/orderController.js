const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const mongoose = require('mongoose');

// @desc    Create New Order
// @route   POST /api/v1/order
// @access  Public or Authenticated
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    const { cartItems, customerInfo } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return next(new ErrorHandler('Cart items are required.', 400));
    }

    if (!customerInfo?.name || !customerInfo?.address || !customerInfo?.phone) {
        return next(new ErrorHandler('Customer information is incomplete.', 400));
    }

    let totalAmount = 0;
    const itemsForOrder = [];
    const bulkUpdates = [];

    for (const item of cartItems) {
        const { product, size, quantity } = item;

        if (
            !mongoose.Types.ObjectId.isValid(product) ||
            !item.name || isNaN(item.price) || !quantity || quantity <= 0
        ) {
            return next(new ErrorHandler('Invalid cart item structure.', 400));
        }

        const productDoc = await Product.findById(product);
        if (!productDoc) {
            return next(new ErrorHandler(`Product not found: ${product}`, 404));
        }

        const actualPrice = parseFloat(productDoc.price);
        let availableStock = 0;

        if (size && Array.isArray(productDoc.sizes)) {
            const sizeObj = productDoc.sizes.find(s => s.size === size);
            availableStock = sizeObj?.stock || 0;

            if (availableStock < quantity) {
                return next(new ErrorHandler(`Insufficient stock for ${productDoc.name} (Size: ${size})`, 400));
            }

            bulkUpdates.push({
                updateOne: {
                    filter: { _id: product },
                    update: { $inc: { 'sizes.$[elem].stock': -quantity } },
                    arrayFilters: [{ 'elem.size': size }]
                }
            });
        } else {
            availableStock = productDoc.stock;
            if (availableStock < quantity) {
                return next(new ErrorHandler(`Insufficient stock for ${productDoc.name}`, 400));
            }

            bulkUpdates.push({
                updateOne: {
                    filter: { _id: product },
                    update: { $inc: { stock: -quantity } }
                }
            });
        }

        totalAmount += actualPrice * quantity;

        itemsForOrder.push({
            product,
            name: productDoc.name,
            price: actualPrice,
            quantity,
            size: size || undefined,
        });
    }

    const order = await Order.create({
        cartItems: itemsForOrder,
        amount: totalAmount.toFixed(2),
        status: 'pending',
        customerInfo
    });

    if (bulkUpdates.length > 0) {
        await Product.bulkWrite(bulkUpdates, { ordered: true });
    }

    res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order
    });
});

// @desc    Get Single Order
// @route   GET /api/v1/order/:id
// @access  Public/Admin
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('cartItems.product', 'name price images');
    if (!order) return next(new ErrorHandler('Order not found.', 404));

    res.status(200).json({ success: true, order });
});

// @desc    Get All Orders
// @route   GET /api/v1/admin/orders
// @access  Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find().populate('cartItems.product', 'name price');
    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

// @desc    Update Order Status
// @route   PUT /api/v1/admin/order/:id
// @access  Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const { status } = req.body;
    if (!status) return next(new ErrorHandler('Status is required.', 400));

    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler('Order not found.', 404));

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: 'Order updated successfully.', order });
});

// @desc    Delete Order
// @route   DELETE /api/v1/admin/order/:id
// @access  Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler('Order not found.', 404));

    await order.deleteOne();

    res.status(200).json({ success: true, message: 'Order deleted successfully.' });
});
