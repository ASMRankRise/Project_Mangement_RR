const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      //get from the auth middleware req.user.role
      return res.status(403).json({
        message: "You are not allowed to access this resource",
      });
    }

    next();
  };
};

module.exports = requireRole;
