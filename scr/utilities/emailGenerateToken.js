const jwt = require('jsonwebtoken');
const config = require('../config/config'); // Ensure your config file has the secret key

// Function to generate JWT token
const generateToken = (email) => {
    const payload = { email };
    const secret = config.jwt.secret; // Your secret key
    const options = { expiresIn: '5m' }; // Token expires in 5 minutes

    const token = jwt.sign(payload, secret, options);
    return token;
};

module.exports = generateToken;
