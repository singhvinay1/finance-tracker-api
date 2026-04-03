const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { sign } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

const register = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || 'VIEWER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = sign({ id: user.id, role: user.role });
  return { user, token };
};

const login = async ({ email, password }) => {
  // Look up by email — same error message for missing user vs wrong password
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);
  if (user.status === 'INACTIVE') throw new AppError('Account is inactive', 403);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = sign({ id: user.id, role: user.role });
  const { password: _omit, ...safeUser } = user;
  return { user: safeUser, token };
};

module.exports = { register, login };
