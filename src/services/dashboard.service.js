const prisma = require('../config/prisma');

/**
 * Aggregate total income, total expense, net balance, and a per-category breakdown.
 */
const getSummary = async () => {
  const [income, expense, categoryStats] = await Promise.all([
    prisma.record.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME', isDeleted: false },
    }),
    prisma.record.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENSE', isDeleted: false },
    }),
    prisma.record.groupBy({
      by: ['category', 'type'],
      _sum: { amount: true },
      where: { isDeleted: false },
      orderBy: { _sum: { amount: 'desc' } },
    }),
  ]);

  const totalIncome = Number(income._sum.amount) || 0;
  const totalExpense = Number(expense._sum.amount) || 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    categoryBreakdown: categoryStats.map((c) => ({
      category: c.category,
      type: c.type,
      total: Number(c._sum.amount) || 0,
    })),
  };
};

/**
 * Month-over-month revenue and expense trends via raw SQL aggregation.
 * Groups by calendar month and record type so the frontend can build charts.
 */
const getTrends = async () => {
  const rows = await prisma.$queryRaw`
    SELECT
      TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
      type,
      SUM(amount)::FLOAT                            AS total
    FROM   "Record"
    WHERE  "isDeleted" = false
    GROUP  BY DATE_TRUNC('month', date), type
    ORDER  BY DATE_TRUNC('month', date) ASC
  `;

  return rows;
};

module.exports = { getSummary, getTrends };
