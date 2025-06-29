const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logout } = require('../controllers/userController'); // New user controller
const { isAuthenticatedUser } = require('../middlewares/auth');

// Register and Login
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout); // Added logout route

// You can add routes for getting user profile or updating it here
// router.get('/me', isAuthenticatedUser, getUserProfile);
// router.put('/me/update', isAuthenticatedUser, updateProfile);

module.exports = router;