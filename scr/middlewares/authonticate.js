const DescopeClient = require('@descope/node-sdk').default;
const config = require('../config/config');
const descopeClient = DescopeClient({
  projectId: config.DESCOPEP_PROJECT_ID,
  managementKey: config.DESCOPE_MANAGEMENT_KEY,
});

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided', status: false });
  }

  const token = authHeader.split(' ')[1];
  try {
    const verificationResponse = await descopeClient.validateJwt(token);
    if (verificationResponse) {
      req.user = verificationResponse; // Attach user data to the request object
      next();
    } else {
      return res.status(401).json({ msg: 'Token is not valid', status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({ msg: 'Token verification failed', status: false });
  }
};

module.exports = authenticate;