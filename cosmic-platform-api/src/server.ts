// src/server.ts - Fixed Pino Logger Configuration
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './features/auth/auth.routes';


// Initialize Fastify with correct logger configuration
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

// Initialize Prisma client
const prisma = new PrismaClient();

fastify.setErrorHandler((error, request, reply) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // LOG EVERYTHING in development
  console.error('🚨 DETAILED ERROR INFORMATION:');
  console.error('Request URL:', request.url);
  console.error('Request Method:', request.method);
  console.error('Error Name:', error.name);
  console.error('Error Message:', error.message);
  console.error('Error Code:', error.code);
  console.error('Error Status:', error.statusCode);
  console.error('Error Stack:', error.stack);
  console.error('Request Body:', request.body);
  console.error('---END ERROR DETAILS---');
  
  fastify.log.error({
    error: error.message,
    stack: isDevelopment ? error.stack : undefined,
    url: request.url,
    method: request.method,
    body: request.body
  });

  // Return detailed error in development
  if (isDevelopment) {
    return reply.status(error.statusCode || 500).send({
      error: error.name || 'Error',
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: isDevelopment ? error.validation : undefined
    });
  }

  // Rate limiting errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: error.headers?.['retry-after'] || '15 minutes'
    });
  }

  // JWT errors
  if (error.message.includes('jwt') || error.message.includes('token')) {
    return reply.status(401).send({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }

  // Database errors
  if (error.message.includes('Prisma') || error.message.includes('database')) {
    return reply.status(500).send({
      error: 'Database Error',
      message: 'A database error occurred'
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Bad Request',
    message: isDevelopment ? error.message : 'An error occurred',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Test endpoint - add this to server.ts

// Add this debug endpoint to server.ts after other routes

// Debug auth controller imports
fastify.get('/debug/auth', async (request, reply) => {
  console.log('🔍 Debug auth endpoint called');
  
  try {
    console.log('Testing imports...');
    
    // Test AuthController import
    const { AuthController } = await import('./features/auth/auth.controller');
    console.log('✅ AuthController imported');
    
    // Test schemas import
    const { RegisterSchema } = await import('./schemas/auth.schemas');
    console.log('✅ RegisterSchema imported');
    
    // Test utilities
    const { JWTUtil } = await import('./utils/jwt');
    const { PasswordUtil } = await import('./utils/password');
    console.log('✅ Utils imported');
    
    // Test services
    const { EmailService } = await import('./services/email.service');
    console.log('✅ EmailService imported');
    
    // Test creating controller instance
    const authController = new AuthController();
    console.log('✅ AuthController instance created');
    
    // Test Prisma connection
    await authController.prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Prisma connection working');
    
    return {
      status: 'All auth components working',
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('❌ Auth debug error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return reply.status(500).send({
      error: 'Auth debug failed',
      message: error.message,
      stack: error.stack
    });
  }
});

// Minimal registration test
fastify.post('/debug/register', async (request, reply) => {
  console.log('🔍 Debug registration called');
  console.log('Request body:', request.body);
  
  try {
    // Import and test validation
    const { RegisterSchema } = await import('./schemas/auth.schemas');
    console.log('🔍 Testing validation...');
    
    const validatedData = RegisterSchema.parse(request.body);
    console.log('✅ Validation passed:', validatedData);
    
    return {
      message: 'Validation successful',
      data: validatedData
    };
    
  } catch (error) {
    console.error('❌ Debug registration error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return reply.status(500).send({
      error: 'Debug registration failed',
      message: error.message,
      stack: error.stack
    });
  }
});

// Add this to server.ts - Direct controller test
fastify.post('/debug/direct-register', async (request, reply) => {
  console.log('🔍 Direct controller register test');
  console.log('Request body:', request.body);
  
  try {
    // Import AuthController
    const { AuthController } = await import('./features/auth/auth.controller');
    console.log('✅ AuthController imported');
    
    // Create instance
    const authController = new AuthController();
    console.log('✅ AuthController instance created');
    
    // Call register method directly
    console.log('🔍 Calling register method directly...');
    const result = await authController.register(request as any, reply as any);
    
    console.log('✅ Register method completed');
    return result;
    
  } catch (error) {
    console.error('❌ Direct controller error:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Stack:', error.stack);
    
    return reply.status(500).send({
      error: 'Direct controller test failed',
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
});

fastify.get('/test', async (request, reply) => {
  console.log('🧪 Test endpoint called');
  return { message: 'Test working', timestamp: new Date() };
});


// Register plugins
async function registerPlugins() {
  // CORS support
  await fastify.register(require('@fastify/cors'), {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : process.env.FRONTEND_URL || false,
    credentials: true
  });

  // Cookie support for refresh tokens
  await fastify.register(require('@fastify/cookie'), {
    secret: process.env.JWT_REFRESH_SECRET || 'fallback-cookie-secret',
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  });

  // JWT support
  await fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'fallback-jwt-secret',
    cookie: {
      cookieName: 'refreshToken',
      signed: false
    }
  });

  // Security headers
  await fastify.register(require('@fastify/helmet'), {
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  });

  // Rate limiting
  await fastify.register(require('@fastify/rate-limit'), {
    global: true,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000') // 15 minutes
  });
}

// Routes
async function registerRoutes() {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return reply.send({
        status: 'healthy',
        message: 'Cosmic Platform API is operational',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Authentication routes
  await fastify.register(authRoutes, { prefix: '/auth' });

  // API info endpoint
  fastify.get('/', async (request, reply) => {
    return reply.send({
      name: 'Cosmic Platform API',
      version: '1.0.0',
      description: 'Federated social platform with cosmic metaphors',
      documentation: '/docs',
      health: '/health',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      availableRoutes: [
        'GET /',
        'GET /health',
        'POST /auth/register',
        'POST /auth/login',
        'GET /auth/me'
      ]
    });
  });
}

// Graceful shutdown
async function gracefulShutdown() {
  try {
    fastify.log.info('Starting graceful shutdown...');
    
    // Close database connection
    await prisma.$disconnect();
    fastify.log.info('Database disconnected');
    
    // Close Fastify server
    await fastify.close();
    fastify.log.info('Server closed');
    
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Process handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function start() {
  try {
    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Test database connection
    await prisma.$connect();
    fastify.log.info('🗄️ Database connected successfully');

    // Start listening
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log(`
🌌 COSMIC PLATFORM API STARTED
🚀 Server running on: http://localhost:${port}
🏥 Health check: http://localhost:${port}/health
🔐 Auth endpoints: http://localhost:${port}/auth/*
📊 Environment: ${process.env.NODE_ENV || 'development'}
🗄️ Database: Connected
⚡ Ready to explore the cosmos!
    `);
    
  } catch (error) {
    fastify.log.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize server
start();