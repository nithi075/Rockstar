// In your adminDashboardRoutes.js (if you used isAdmin)
const { isAuthenticatedUser } = require('../middlewares/auth'); // You'd still need this
const { isAdmin } = require('../middlewares/isAdmin'); // New import

router.get(
    '/dashboard',
    isAuthenticatedUser,
    isAdmin, // <<< This is your new middleware
    getDashboardStats
);
