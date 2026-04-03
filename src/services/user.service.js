const prisma = require('../config/prisma');
const { AppError } = require('../utils/errors');

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
};

const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  return { users, total, page, limit, pages: Math.ceil(total / limit) };
};

const updateStatus = async (id, status) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({ where: { id }, data: { status }, select: SAFE_SELECT });
};

const updateRole = async (id, role) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({ where: { id }, data: { role }, select: SAFE_SELECT });
};

module.exports = { getAllUsers, updateStatus, updateRole };
