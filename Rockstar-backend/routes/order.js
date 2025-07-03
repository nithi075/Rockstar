// routes/order.js

const express = require('express');
const router = express.Router();

const {
    newOrder,
    getAllOrders,
    getSingleOrder,
    updateOrder,
    deleteOrder,
    myOrders
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Customer Routes
router.post('/new', isAuthenticatedUser, newOrder); // Path now just '/new' (relative to /api/v1/orders)
router.get('/:id', isAuthenticatedUser, getSingleOrder); // Path now just '/:id'
router.get('/me', isAuthenticatedUser, myOrders); // Path now just '/me'

// Admin Routes
router.get('/', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders); // Path now just '/'
router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder); // <--- CHANGE IS HERE!
router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder); // <--- CONSIDER THIS CHANGE TOO!

module.exports = router;
