const prisma = require('../config/prisma');
const { AppError } = require('../utils/errors');

const createRecord = async (data, userId) => {
  return prisma.record.create({
    data: { ...data, amount: data.amount, date: new Date(data.date), userId },
  });
};

const getRecords = async ({ page = 1, limit = 10, type, category, startDate, endDate }) => {
  const skip = (page - 1) * limit;

  const where = { isDeleted: false };
  if (type) where.type = type;
  if (category) where.category = { contains: category, mode: 'insensitive' };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.record.count({ where }),
  ]);

  return { records, total, page, limit, pages: Math.ceil(total / limit) };
};

const updateRecord = async (id, data) => {
  const record = await prisma.record.findFirst({ where: { id, isDeleted: false } });
  if (!record) throw new AppError('Record not found', 404);

  const updateData = { ...data };
  if (data.date) updateData.date = new Date(data.date);

  return prisma.record.update({ where: { id }, data: updateData });
};

// Soft delete — preserves the audit trail
const deleteRecord = async (id) => {
  const record = await prisma.record.findFirst({ where: { id, isDeleted: false } });
  if (!record) throw new AppError('Record not found', 404);
  return prisma.record.update({ where: { id }, data: { isDeleted: true } });
};

module.exports = { createRecord, getRecords, updateRecord, deleteRecord };
