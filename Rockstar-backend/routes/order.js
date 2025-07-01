const express = require('express');
const router = express.Router();
const {
    createOrder,
    getSingleOrder,
    getAllOrders,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController'); // Ensure this path is correct

// Route for creating a new order
// IMPORTANT: This route now uses '/order/new' as per your backend route definition.
// Ensure your frontend also calls this specific '/api/v1/order/new' endpoint.
router.route('/order/new').post(createOrder);

// Routes for fetching, updating, and deleting orders
router.route('/order/:id').get(getSingleOrder); // Get a single order by ID
router.route('/admin/orders').get(getAllOrders); // Get all orders (admin access)
router.route('/admin/order/:id')
    .put(updateOrder)   // Update order status (admin access)
    .delete(deleteOrder); // Delete an order (admin access)

module.exports = router;
