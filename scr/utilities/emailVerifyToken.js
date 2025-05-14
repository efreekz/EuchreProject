const jwt = require('jsonwebtoken');
const config = require('../config/config'); // Ensure your config file has the secret key

// Middleware to verify and decode JWT token
const verifyToken = (token, ignoreExpiration = false) => {

    if (!token) {
        return false
    }

    try {
        const options = ignoreExpiration ? { ignoreExpiration: true } : {};
        const decoded = jwt.verify(token, config.jwt.secret, options); // Verify and decode the token
       return decoded
    } catch (error) {
        if(error.message== 'jwt expired'){
            return {msg:error.message, status : false, code : 400}
        }
        return error.message
    }
};

module.exports = verifyToken;
