// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Or 'bcrypt' if you're using the C++ bindings version
const jwt = require('jsonwebtoken'); // IMPORTANT: Ensure 'jsonwebtoken' is imported here!
const crypto = require('crypto'); // For password reset tokens (used in getResetPasswordToken)

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Your Name'],
        maxLength: [30, 'Name cannot exceed 30 characters'],
        minLength: [4, 'Name should have more than 4 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please Enter Your Email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please Enter Your Password'],
        minLength: [8, 'Password should be greater than 8 characters'],
        select: false, // Important: Don't return password field by default when querying user
    },
    avatar: {
        public_id: {
            type: String,
            // required: true, // Uncomment if avatar is mandatory
        },
        url: {
            type: String,
            // required: true, // Uncomment if avatar is mandatory
        },
    },
    role: {
        type: String,
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// ----------------------------------------------------------------------
// IMPORTANT: PASSWORD HASHING BEFORE SAVING (Pre-save hook)
// This hashes the password whenever a user is created or their password is changed.
userSchema.pre('save', async function(next) {
    // Only re-hash if the password field has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt (cost factor 10)
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
});

// ----------------------------------------------------------------------
// IMPORTANT: METHOD TO COMPARE PASSWORD (Used in login)
// This method is called in your userController.js to verify the password.
userSchema.methods.comparePassword = async function(enteredPassword) {
    // 'enteredPassword' is the plaintext password from the frontend
    // 'this.password' is the hashed password from the database (retrieved with select('+password'))
    return await bcrypt.compare(enteredPassword, this.password);
};

// ----------------------------------------------------------------------
// JWT TOKEN (Used for session management after successful login)
// Make sure this method is correctly defined as 'getJWTToken' (case-sensitive)
userSchema.methods.getJWTToken = function() {
    console.log('getJWTToken: Inside getJWTToken method.');
    console.log('getJWTToken: JWT_SECRET from env:', process.env.JWT_SECRET ? 'Defined' : 'UNDEFINED');
    console.log('getJWTToken: JWT_EXPIRE from env:', process.env.JWT_EXPIRE ? 'Defined' : 'UNDEFINED');

    // Ensure _id exists, though it should if user is from DB
    if (!this._id) {
        console.error("ERROR: User ID is missing when generating JWT!");
        // You might want to throw an error here or handle it gracefully
        return null; // Or throw new Error("User ID is required for JWT");
    }

    try {
        const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        console.log('getJWTToken: Successfully generated JWT.');
        return token;
    } catch (error) {
        console.error('getJWTToken: Error generating JWT:', error.message);
        // This is important for finding errors in jwt.sign
        throw error; // Re-throw to be caught by catchAsyncErrors
    }
};

// ----------------------------------------------------------------------
// Generating Password Reset Token (for 'Forgot Password' functionality)
// This uses the 'crypto' built-in Node.js module.
userSchema.methods.getResetPasswordToken = function() {
    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and add to userSchema
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);