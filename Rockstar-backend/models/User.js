const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
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

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function() {
    console.log('getJWTToken: Inside getJWTToken method.');
    console.log('getJWTToken: JWT_SECRET from env:', process.env.JWT_SECRET ? 'Defined' : 'UNDEFINED');
    console.log('getJWTToken: JWT_EXPIRE from env:', process.env.JWT_EXPIRE ? 'Defined' : 'UNDEFINED');

    if (!this._id) {
        console.error("ERROR: User ID is missing when generating JWT!");
        throw new Error("User ID is required for JWT"); // Throwing to catchAsyncErrors
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

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

// IMPORTANT: This must be 'User' for consistency
module.exports = mongoose.model('User', userSchema);
