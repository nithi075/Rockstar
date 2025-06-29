// utils/sendToken.js

const sendToken = (user, statusCode, res) => {
    console.log('sendToken: Generating JWT token...');
    const token = user.getJWTToken();

    console.log('sendToken: JWT token generated. Token:', token ? 'Generated (not null)' : 'Null');

    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to milliseconds
        ),
        httpOnly: true,
        // *** CRITICAL CHANGES BELOW ***
        // For cross-origin requests (frontend on different domain/subdomain than backend)
        // AND when using HTTPS (like on Render), both of these are REQUIRED.
        sameSite: 'None', // Allow cookie to be sent on cross-site requests
        secure: true,     // Cookie only sent over HTTPS (required when sameSite: 'None')
        // You could also use: secure: process.env.NODE_ENV === 'production' ? true : false,
        // but since Render is always HTTPS in production, setting it to true is safer.
    };

    console.log('sendToken: Cookie options created. Expires:', options.expires);
    console.log('sendToken: process.env.COOKIE_EXPIRE:', process.env.COOKIE_EXPIRE);
    console.log('sendToken: Cookie sameSite:', options.sameSite); // Add these logs for verification
    console.log('sendToken: Cookie secure:', options.secure);

    // Check if essential env vars are defined for debugging
    if (!process.env.JWT_SECRET) console.error("ERROR: JWT_SECRET is not defined in .env!");
    if (!process.env.JWT_EXPIRE) console.error("ERROR: JWT_EXPIRE is not defined in .env!");
    if (!process.env.COOKIE_EXPIRE) console.error("ERROR: COOKIE_EXPIRE is not defined in .env!");

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    });

    console.log('sendToken: Response sent successfully.');
};

module.exports = sendToken;
