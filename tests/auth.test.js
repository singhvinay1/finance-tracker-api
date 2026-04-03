const request = require('supertest');

// Mock Prisma before requiring app so the module cache picks up the mock
jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Auth — POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registers a new user and returns a JWT', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'uuid-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'VIEWER',
      createdAt: new Date().toISOString(),
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.error).toBe(false);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('returns 422 for invalid input (short name, bad email, weak password)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'T',
      email: 'not-an-email',
      password: '123',
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe(true);
    expect(res.body.details).toBeDefined();
  });

  it('returns 409 if email is already registered', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'uuid-1', email: 'test@example.com' });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(true);
  });
});

describe('Auth — POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 for unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
  });

  it('returns 422 when password field is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
    });

    expect(res.status).toBe(422);
  });

  it('returns 401 without exposing whether email exists (same message)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res1 = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: 'wrong' });

    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'x@x.com', status: 'ACTIVE', password: 'hashed' });
    const res2 = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: 'wrongpassword' });

    // Both should say 401 with the same message — prevents user-enumeration
    expect(res1.status).toBe(401);
    expect(res2.status).toBe(401);
    expect(res1.body.message).toBe(res2.body.message);
  });
});
