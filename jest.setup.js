// Runs before every test file — inject env vars without needing a .env file
process.env.JWT_SECRET = 'test-secret-key-for-jest-only';
process.env.JWT_EXPIRES_IN = '1d';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
