// config/database.js
const mongoose = require('mongoose');

const connectDatabase = () => {
    // This connects to MongoDB using the URI provided in the DB_URI environment variable.
    // The DB_URI variable should contain the full connection string
    // (e.g., 'mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&appName=YourApp').
    // DO NOT add options like useNewUrlParser, useUnifiedTopology, or 'w' here in the code
    // if they are already part of your DB_URI string.
    mongoose.connect(process.env.DB_URI)
        .then(() => {
            // Updated log message for consistency
            console.log(`✅ MongoDB Connected with Server: ${mongoose.connection.host}`);
        })
        .catch((err) => {
            // Updated log message for consistency
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
            // It's crucial to exit the process if the database connection fails on startup
            // as the application cannot function without it.
            process.exit(1);
        });
};

module.exports = connectDatabase;
