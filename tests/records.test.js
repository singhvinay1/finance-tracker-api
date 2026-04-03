const request = require('supertest');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn() },
  record: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { sign } = require('../src/utils/jwt');

const adminUser   = { id: 'a1', name: 'Admin',   email: 'admin@test.com',   role: 'ADMIN',   status: 'ACTIVE' };
const analystUser = { id: 'a2', name: 'Analyst',  email: 'analyst@test.com', role: 'ANALYST', status: 'ACTIVE' };
const viewerUser  = { id: 'a3', name: 'Viewer',   email: 'viewer@test.com',  role: 'VIEWER',  status: 'ACTIVE' };

const adminToken   = sign({ id: adminUser.id,   role: adminUser.role });
const analystToken = sign({ id: analystUser.id, role: analystUser.role });
const viewerToken  = sign({ id: viewerUser.id,  role: viewerUser.role });

const sampleRecord = {
  id: 'r1', amount: '1000.00', type: 'INCOME', category: 'Salary',
  date: new Date('2024-01-15'), userId: adminUser.id,
};

beforeEach(() => jest.clearAllMocks());

// ── POST /api/records ─────────────────────────────────────────────────────────
describe('POST /api/records', () => {
  it('creates a record when called by ADMIN', async () => {
    prisma.user.findUnique.mockResolvedValue(adminUser);
    prisma.record.create.mockResolvedValue(sampleRecord);

    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 1000, type: 'INCOME', category: 'Salary', date: '2024-01-15' });

    expect(res.status).toBe(201);
    expect(res.body.error).toBe(false);
  });

  it('returns 403 for VIEWER', async () => {
    prisma.user.findUnique.mockResolvedValue(viewerUser);

    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 1000, type: 'INCOME', category: 'Salary', date: '2024-01-15' });

    expect(res.status).toBe(403);
  });

  it('returns 403 for ANALYST', async () => {
    prisma.user.findUnique.mockResolvedValue(analystUser);

    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ amount: 1000, type: 'INCOME', category: 'Salary', date: '2024-01-15' });

    expect(res.status).toBe(403);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/records')
      .send({ amount: 1000, type: 'INCOME', category: 'Salary', date: '2024-01-15' });

    expect(res.status).toBe(401);
  });

  it('returns 422 for negative amount', async () => {
    prisma.user.findUnique.mockResolvedValue(adminUser);

    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -500, type: 'INCOME', category: 'Salary', date: '2024-01-15' });

    expect(res.status).toBe(422);
  });
});

// ── GET /api/records ──────────────────────────────────────────────────────────
describe('GET /api/records', () => {
  it('returns records for VIEWER (read-only access)', async () => {
    prisma.user.findUnique.mockResolvedValue(viewerUser);
    prisma.record.findMany.mockResolvedValue([sampleRecord]);
    prisma.record.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.records).toHaveLength(1);
  });

  it('returns records for ANALYST', async () => {
    prisma.user.findUnique.mockResolvedValue(analystUser);
    prisma.record.findMany.mockResolvedValue([]);
    prisma.record.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 401 for unauthenticated request', async () => {
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(401);
  });
});

// ── DELETE /api/records/:id ───────────────────────────────────────────────────
describe('DELETE /api/records/:id', () => {
  it('soft-deletes the record for ADMIN', async () => {
    prisma.user.findUnique.mockResolvedValue(adminUser);
    prisma.record.findFirst.mockResolvedValue(sampleRecord);
    prisma.record.update.mockResolvedValue({ ...sampleRecord, isDeleted: true });

    const res = await request(app)
      .delete('/api/records/r1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(prisma.record.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isDeleted: true } })
    );
  });

  it('returns 403 for VIEWER', async () => {
    prisma.user.findUnique.mockResolvedValue(viewerUser);

    const res = await request(app)
      .delete('/api/records/r1')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });
});
