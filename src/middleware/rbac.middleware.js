const { error } = require('../utils/response');

/**
 * Factory that returns a middleware enforcing one of the allowed roles.
 * Usage: authorize('ADMIN') or authorize('ANALYST', 'ADMIN')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return error(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { authorize };
