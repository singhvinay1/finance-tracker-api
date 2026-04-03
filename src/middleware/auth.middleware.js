const { verify } = require('../utils/jwt');
const { error } = require('../utils/response');
const prisma = require('../config/prisma');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verify(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.status === 'INACTIVE') {
      return error(res, 'User not found or account is inactive', 401);
    }

    req.user = user;
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { authenticate };
