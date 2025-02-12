const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Remove 'Bearer' prefix from token if present
  const tokenWithoutBearer = token.replace('Bearer ', '');

  try {
    // Verify token and decode user data
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded user data to request
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateUser;

