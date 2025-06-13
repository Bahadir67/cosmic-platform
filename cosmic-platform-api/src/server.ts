// src/server.ts - PRODUCTION VERSION
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './features/auth/auth.routes';

/**
 * 🌌 Cosmic Platform API Server
 * Federated social platform with cosmic metaphors
 */

// Initialize Fastify with optimized logger configuration
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

/**
 * Global error handler for the Fastify server
 * Provides appropriate error responses based on environment and error type
 */
fastify.setErrorHandler((error, request, reply) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log error details
  fastify.log.error({
    error: error.message,
    stack: isDevelopment ? error.stack : undefined,
    url: request.url,
    method: request.method
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
    message: isDevelopment ? error.message : 'An error occurred'
  });
});

/**
 * Register Fastify plugins with security and performance configurations
 */
async function registerPlugins() {
  // CORS support for frontend integration
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

  // JWT support for authentication
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

  // Rate limiting for API protection
  await fastify.register(require('@fastify/rate-limit'), {
    global: true,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000') // 15 minutes
  });
}

/**
 * Register API routes and endpoints
 */
async function registerRoutes() {
  // Health check endpoint for monitoring
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

  // API information endpoint
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

  // 404 handler for undefined routes
  fastify.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      availableRoutes: [
        'GET /',
        'GET /health',
        'POST /auth/register',
        'POST /auth/login',
        'GET /auth/me',
        'POST /auth/refresh',
        'POST /auth/logout'
      ]
    });
  });
}

/**
 * Graceful shutdown handler for clean server termination
 */
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

// Process handlers for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Start the Cosmic Platform API server
 */
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