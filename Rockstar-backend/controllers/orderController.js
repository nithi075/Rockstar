const Order = require('../models/orderModel'); // Adjust path if necessary
const Product = require('../models/productModel'); // Adjust path if necessary
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create new order with product image enrichment
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  // Enrich orderItems with product image
  const enrichedOrderItems = await Promise.all(orderItems.map(async (item) => {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ErrorHandler(`Product not found with ID ${item.product}`, 404);
    }

    return {
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      size: item.size,
      image: product.images[0], // ✅ include image URL here
      product: product._id,
    };
  }));

  const order = await Order.create({
    shippingInfo,
    orderItems: enrichedOrderItems, // ✅ enriched items with image
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});
