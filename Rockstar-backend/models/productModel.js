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
// PASSWORD HASHING BEFORE SAVING (Pre-save hook)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ----------------------------------------------------------------------
// METHOD TO COMPARE PASSWORD (Used in login)
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ----------------------------------------------------------------------
// JWT TOKEN (Used for session management after successful login)
userSchema.methods.getJWTToken = function() {
    console.log('getJWTToken: Inside getJWTToken method.');
    console.log('getJWTToken: JWT_SECRET from env:', process.env.JWT_SECRET ? 'Defined' : 'UNDEFINED');
    console.log('getJWTToken: JWT_EXPIRE from env:', process.env.JWT_EXPIRE ? 'Defined' : 'UNDEFINED');

    if (!this._id) {
        console.error("ERROR: User ID is missing when generating JWT!");
        return null;
    }

    try {
        const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        console.log('getJWTToken: Successfully generated JWT.');
        return token;
    } catch (error) {
        console.error('getJWTToken: Error generating JWT:', error.message);
        throw error;
    }
};

// ----------------------------------------------------------------------
// Generating Password Reset Token (for 'Forgot Password' functionality)
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
