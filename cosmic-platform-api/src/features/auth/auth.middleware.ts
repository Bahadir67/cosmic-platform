// src/features/auth/auth.middleware.ts - CORRECTED
import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTUtil } from '../../utils/jwt';
import { PrismaClient } from '@prisma/client';

// Extend FastifyRequest to include userId
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

const jwtUtil = new JWTUtil();
const prisma = new PrismaClient();

/**
 * 🔐 Authentication Middleware
 * Verifies JWT token and extracts user ID
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Authentication required',
        message: 'Please provide a valid access token.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify access token
    const payload = await jwtUtil.verifyAccessToken(token);
    const userId = payload.userId;

    // Check if user still exists
    const user = await prisma.starSystem.findUnique({
      where: { id: userId },
      select: { id: true, emailVerified: true }
    });

    if (!user) {
      return reply.status(401).send({
        error: 'User not found',
        message: 'The user associated with this token no longer exists.'
      });
    }

    // Add userId to request for use in route handlers
    request.userId = userId;

  } catch (error) {
    return reply.status(401).send({
      error: 'Invalid token',
      message: 'The provided access token is invalid or expired.'
    });
  }
}

/**
 * ✅ Email Verified Middleware
 * Ensures user has verified their email address
 */
export async function emailVerifiedMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.userId;

    if (!userId) {
      return reply.status(401).send({
        error: 'Authentication required',
        message: 'Please authenticate first.'
      });
    }

    const user = await prisma.starSystem.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    });

    if (!user || !user.emailVerified) {
      return reply.status(403).send({
        error: 'Email verification required',
        message: 'Please verify your email address to access this feature.'
      });
    }

  } catch (error) {
    return reply.status(500).send({
      error: 'Verification check failed',
      message: 'Unable to verify email status.'
    });
  }
}

/**
 * ⚡ Rate Limiter Configuration Objects
 * These will be registered at the server level, not in middleware
 */
export const rateLimitConfigs = {
  // Registration: 3 attempts per hour
  register: {
    max: 3,
    timeWindow: 60 * 60 * 1000, // 1 hour
    keyGenerator: (request: FastifyRequest) => {
      return request.ip || 'unknown';
    },
    errorResponseBuilder: () => {
      return {
        error: 'Registration rate limit exceeded',
        message: 'Too many registration attempts. Please try again in 1 hour.',
        retryAfter: '1 hour'
      };
    }
  },

  // Login: 5 attempts per 15 minutes
  login: {
    max: 5,
    timeWindow: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (request: FastifyRequest) => {
      return request.ip || 'unknown';
    },
    errorResponseBuilder: () => {
      return {
        error: 'Login rate limit exceeded',
        message: 'Too many login attempts. Please try again in 15 minutes.',
        retryAfter: '15 minutes'
      };
    }
  },

  // Password reset: 3 attempts per hour
  passwordReset: {
    max: 3,
    timeWindow: 60 * 60 * 1000, // 1 hour
    keyGenerator: (request: FastifyRequest) => {
      return request.ip || 'unknown';
    },
    errorResponseBuilder: () => {
      return {
        error: 'Password reset rate limit exceeded',
        message: 'Too many password reset attempts. Please try again in 1 hour.',
        retryAfter: '1 hour'
      };
    }
  },

  // Email verification: 5 attempts per hour
  emailVerification: {
    max: 5,
    timeWindow: 60 * 60 * 1000, // 1 hour
    keyGenerator: (request: FastifyRequest) => {
      return request.ip || 'unknown';
    },
    errorResponseBuilder: () => {
      return {
        error: 'Email verification rate limit exceeded',
        message: 'Too many verification attempts. Please try again in 1 hour.',
        retryAfter: '1 hour'
      };
    }
  },

  // General: 10 requests per minute
  general: {
    max: 10,
    timeWindow: 60 * 1000, // 1 minute
    keyGenerator: (request: FastifyRequest) => {
      return request.ip || 'unknown';
    },
    errorResponseBuilder: () => {
      return {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again in 1 minute.',
        retryAfter: '1 minute'
      };
    }
  }
};