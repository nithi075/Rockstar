// Rockstar-backend/routes/admin.js

const express = require('express');
const router = express.Router();

// Import the controller function for the dashboard stats
const { getDashboardStats } = require('../controllers/adminDashboardController'); // Adjust path if necessary

// Import authentication and authorization middleware from your auth.js file
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth'); // Ensure this path is correct

// Admin Dashboard Route
// This route is protected by:
// 1. isAuthenticatedUser: Ensures a user is logged in (has a valid token).
// 2. authorizeRoles('admin'): Ensures the logged-in user has the 'admin' role.
//    This is your "isAdmin" check.
router.route('/admin/dashboard').get(
    isAuthenticatedUser,
    authorizeRoles('admin'), // This middleware checks if the user's role is 'admin'
    getDashboardStats
);

// You would add other admin-specific routes here, protected similarly:
// router.route('/admin/products/new').post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);
// router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
// router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder);


module.exports = router;
