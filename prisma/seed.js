const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const [adminPwd, analystPwd, viewerPwd] = await Promise.all([
    bcrypt.hash('admin123', 12),
    bcrypt.hash('analyst123', 12),
    bcrypt.hash('viewer123', 12),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@example.com', password: adminPwd, role: 'ADMIN' },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@example.com' },
    update: {},
    create: { name: 'Analyst User', email: 'analyst@example.com', password: analystPwd, role: 'ANALYST' },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: { name: 'Viewer User', email: 'viewer@example.com', password: viewerPwd, role: 'VIEWER' },
  });

  // Create sample records across 3 months
  const records = [
    { amount: 5000, type: 'INCOME',  category: 'Salary',     date: new Date('2024-01-15'), note: 'January salary',  userId: admin.id },
    { amount: 1200, type: 'EXPENSE', category: 'Rent',       date: new Date('2024-01-01'), note: 'Monthly rent',    userId: admin.id },
    { amount: 320,  type: 'EXPENSE', category: 'Food',       date: new Date('2024-01-10'),                          userId: admin.id },
    { amount: 5000, type: 'INCOME',  category: 'Salary',     date: new Date('2024-02-15'), note: 'February salary', userId: admin.id },
    { amount: 1200, type: 'EXPENSE', category: 'Rent',       date: new Date('2024-02-01'),                          userId: admin.id },
    { amount: 250,  type: 'EXPENSE', category: 'Transport',  date: new Date('2024-02-20'),                          userId: admin.id },
    { amount: 2000, type: 'INCOME',  category: 'Investment', date: new Date('2024-03-05'), note: 'Dividend payout', userId: analyst.id },
    { amount: 150,  type: 'EXPENSE', category: 'Utilities',  date: new Date('2024-03-10'),                          userId: admin.id },
    { amount: 5000, type: 'INCOME',  category: 'Salary',     date: new Date('2024-03-15'), note: 'March salary',    userId: admin.id },
    { amount: 400,  type: 'EXPENSE', category: 'Food',       date: new Date('2024-03-22'),                          userId: admin.id },
  ];

  for (const record of records) {
    await prisma.record.create({ data: record });
  }

  console.log('Seed complete.');
  console.log('Demo credentials:');
  console.log('  ADMIN    — admin@example.com    / admin123');
  console.log('  ANALYST  — analyst@example.com  / analyst123');
  console.log('  VIEWER   — viewer@example.com   / viewer123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
