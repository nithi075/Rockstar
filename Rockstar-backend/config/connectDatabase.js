const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("Trying to connect to MongoDB:", process.env.DB_URI);
        await mongoose.connect(process.env.DB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;