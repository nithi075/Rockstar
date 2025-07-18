const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logout } = require('../controllers/userController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);

module.exports = router;
