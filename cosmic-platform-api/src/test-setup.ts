// src/test-setup.ts
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'cosmic-test-secret-key-for-testing-access-tokens';
process.env.JWT_REFRESH_SECRET = 'cosmic-test-refresh-secret-key-for-testing-refresh-tokens';
process.env.DATABASE_URL = 'postgresql://cosmic_user:Gokcel67@localhost:5432/cosmic_platform_test';

export {};