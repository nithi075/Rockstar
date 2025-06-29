// utils/sendToken.js

const sendToken = (user, statusCode, res) => {
    console.log('sendToken: Generating JWT token...');
    const token = user.getJWTToken(); // This is where the error 'user.getJwtToken is not a function' was happening
                                      // But you fixed that, so now this should work.

    console.log('sendToken: JWT token generated. Token:', token ? 'Generated (not null)' : 'Null');

    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Convert days to milliseconds
        ),
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production'
    };

    console.log('sendToken: Cookie options created. Expires:', options.expires);
    console.log('sendToken: process.env.COOKIE_EXPIRE:', process.env.COOKIE_EXPIRE);


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
