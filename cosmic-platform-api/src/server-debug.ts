// src/server-debug.ts - Progressive loading test
import Fastify from 'fastify';

console.log('🔍 Step 1: Starting progressive server test...');

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    } : undefined
  }
});

console.log('✅ Step 2: Fastify initialized');

// Test 1: Basic plugins
async function testBasicPlugins() {
  try {
    console.log('🔍 Step 3: Testing basic plugins...');
    
    await fastify.register(require('@fastify/cors'), {
      origin: ['http://localhost:3000'],
      credentials: true
    });
    console.log('✅ CORS registered');

    await fastify.register(require('@fastify/cookie'), {
      secret: 'test-secret'
    });
    console.log('✅ Cookie registered');

    await fastify.register(require('@fastify/jwt'), {
      secret: 'test-jwt-secret'
    });
    console.log('✅ JWT registered');

  } catch (error) {
    console.error('❌ Plugin registration failed:', error.message);
    throw error;
  }
}

// Test 2: Database connection
async function testDatabase() {
  try {
    console.log('🔍 Step 4: Testing database connection...');
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

// Test 3: Auth routes import
async function testAuthImports() {
  try {
    console.log('🔍 Step 5: Testing auth imports...');
    
    // Test auth.routes import
    const { authRoutes } = await import('./features/auth/auth.routes');
    console.log('✅ Auth routes imported');
    
    return authRoutes;
  } catch (error) {
    console.error('❌ Auth import failed:', error.message);
    throw error;
  }
}

// Progressive test
async function progressiveTest() {
  try {
    await testBasicPlugins();
    await testDatabase();
    const authRoutes = await testAuthImports();
    
    console.log('🔍 Step 6: Registering auth routes...');
    await fastify.register(authRoutes, { prefix: '/auth' });
    console.log('✅ Auth routes registered');
    
    console.log('🔍 Step 7: Starting server...');
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🎉 FULL SERVER WORKING!');
    
  } catch (error) {
    console.error('❌ Progressive test failed at step:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Health endpoint
fastify.get('/health', async () => {
  return { status: 'progressive test ok' };
});

progressiveTest();