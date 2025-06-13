// src/features/auth/auth.routes.ts - CORRECTED
import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { 
  authMiddleware, 
  emailVerifiedMiddleware, 
  rateLimitConfigs 
} from './auth.middleware';

/**
 * 🌌 Cosmic Platform Authentication Routes
 * Handles user authentication, registration, and session management
 */
export async function authRoutes(fastify: FastifyInstance) {
  const authController = new AuthController();

  // 🌟 PUBLIC ROUTES (No authentication required)
  
  // User registration with email verification
  fastify.post('/register', {
    config: {
      rateLimit: rateLimitConfigs.register
    },
    handler: authController.register.bind(authController)
  });

  // User login with JWT token generation
  fastify.post('/login', {
    config: {
      rateLimit: rateLimitConfigs.login
    },
    handler: authController.login.bind(authController)
  });

  // Refresh access token using refresh token
  fastify.post('/refresh', {
    handler: authController.refreshToken.bind(authController)
  });

  // User logout (invalidate tokens)
  fastify.post('/logout', {
    handler: authController.logout.bind(authController)
  });

  // Email verification handler
  fastify.get('/verify-email', {
    config: {
      rateLimit: rateLimitConfigs.emailVerification
    },
    handler: authController.verifyEmail.bind(authController)
  });

  // Password reset request
  fastify.post('/forgot-password', {
    config: {
      rateLimit: rateLimitConfigs.passwordReset
    },
    handler: authController.forgotPassword.bind(authController)
  });

  // Password reset completion
  fastify.post('/reset-password', {
    config: {
      rateLimit: rateLimitConfigs.passwordReset
    },
    handler: authController.resetPassword.bind(authController)
  });

  // 🔐 PROTECTED ROUTES (Authentication required)
  
  // Get current user profile
  fastify.get('/me', {
    preHandler: [authMiddleware],
    handler: authController.getCurrentUser.bind(authController)
  });

  // Update user profile (requires verified email)
  fastify.put('/profile', {
    preHandler: [authMiddleware, emailVerifiedMiddleware],
    handler: authController.updateProfile.bind(authController)
  });

  // Change password (requires verified email)
  fastify.post('/change-password', {
    preHandler: [authMiddleware, emailVerifiedMiddleware],
    handler: authController.changePassword.bind(authController)
  });

  // 📊 ADMIN/DEBUG ROUTES (Development only)
  if (process.env.NODE_ENV === 'development') {
    // Get all users (debug only)
    fastify.get('/debug/users', {
      preHandler: [authMiddleware],
      handler: async (request: any, reply: any) => {
        try {
          const users = await authController.prisma.starSystem.findMany({
            select: {
              id: true,
              username: true,
              email: true,
              emailVerified: true,
              createdAt: true,
              lastLoginAt: true
            }
          });
          
          return reply.send({
            message: 'Debug: All users',
            users,
            total: users.length
          });
        } catch (error) {
          return reply.status(500).send({
            error: 'Failed to fetch users',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });
  }
}