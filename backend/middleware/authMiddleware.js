const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided."
    });
  }
  
  try {
    const actualToken = token.split(" ")[1];
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

// ROLE AUTHORIZATION
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission."
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};