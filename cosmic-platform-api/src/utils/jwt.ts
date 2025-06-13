// src/utils/jwt.ts - FIXED with instance methods
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// JWT Payload Interface
interface JWTPayload {
  userId: string;
  username?: string;
  email: string;
  tokenId: string;
  type: 'access' | 'refresh' | 'email_verify' | 'password_reset';
  iat?: number;
  exp?: number;
}

// Unique ID Generator
function generateUniqueId(): string {
  return nanoid(21);
}

/**
 * 🔐 JWT Utility Class
 * Handles JSON Web Token generation and verification for Cosmic Platform
 */
export class JWTUtil {
  private readonly ACCESS_TOKEN_EXPIRES = '15m';
  private readonly REFRESH_TOKEN_EXPIRES = '7d';
  private readonly EMAIL_TOKEN_EXPIRES = '24h';
  private readonly RESET_TOKEN_EXPIRES = '1h';

  /**
   * Generate Access Token (15 minutes)
   */
  async generateAccessToken(userId: string): Promise<string> {
    const payload: JWTPayload = {
      userId,
      email: '', // Will be filled if needed
      tokenId: generateUniqueId(),
      type: 'access'
    };

    return jwt.sign(payload, this.getAccessSecret(), {
      expiresIn: this.ACCESS_TOKEN_EXPIRES,
      issuer: 'cosmic-platform',
      audience: 'cosmic-users'
    });
  }

  /**
   * Generate Refresh Token (7 days)
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const payload: JWTPayload = {
      userId,
      email: '', // Will be filled if needed
      tokenId: generateUniqueId(),
      type: 'refresh'
    };

    return jwt.sign(payload, this.getRefreshSecret(), {
      expiresIn: this.REFRESH_TOKEN_EXPIRES,
      issuer: 'cosmic-platform',
      audience: 'cosmic-users'
    });
  }

  /**
   * Generate Email Verification Token (24 hours)
   */
  async generateEmailToken(email: string): Promise<string> {
    const payload: JWTPayload = {
      userId: '', // Not needed for email verification
      email,
      tokenId: generateUniqueId(),
      type: 'email_verify'
    };

    return jwt.sign(payload, this.getAccessSecret(), {
      expiresIn: this.EMAIL_TOKEN_EXPIRES,
      issuer: 'cosmic-platform',
      audience: 'cosmic-users'
    });
  }

  /**
   * Generate Password Reset Token (1 hour)
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    const payload: JWTPayload = {
      userId: '', // Not needed for password reset
      email,
      tokenId: generateUniqueId(),
      type: 'password_reset'
    };

    return jwt.sign(payload, this.getAccessSecret(), {
      expiresIn: this.RESET_TOKEN_EXPIRES,
      issuer: 'cosmic-platform',
      audience: 'cosmic-users'
    });
  }

  /**
   * Verify Access Token
   */
  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const verified = jwt.verify(token, this.getAccessSecret(), {
        issuer: 'cosmic-platform',
        audience: 'cosmic-users'
      }) as JWTPayload;

      if (verified.type !== 'access') {
        throw new Error('Invalid token type for access verification');
      }

      return verified;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Verify Refresh Token
   */
  async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      const verified = jwt.verify(token, this.getRefreshSecret(), {
        issuer: 'cosmic-platform',
        audience: 'cosmic-users'
      }) as JWTPayload;

      if (verified.type !== 'refresh') {
        throw new Error('Invalid token type for refresh verification');
      }

      return verified;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Verify Email Verification Token
   */
  async verifyEmailToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.getAccessSecret(), {
        issuer: 'cosmic-platform',
        audience: 'cosmic-users'
      }) as JWTPayload;

      if (decoded.type !== 'email_verify') {
        throw new Error('Invalid token type for email verification');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Email verification token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid email verification token');
      }
      throw error;
    }
  }

  /**
   * Verify Password Reset Token
   */
  async verifyPasswordResetToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.getAccessSecret(), {
        issuer: 'cosmic-platform',
        audience: 'cosmic-users'
      }) as JWTPayload;

      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type for password reset');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Password reset token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid password reset token');
      }
      throw error;
    }
  }

  /**
   * Extract Token from Authorization Header
   */
  extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Decode Token Without Verification (for inspection)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Check if Token is Expired
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  }

  /**
   * Get Token Expiry Date
   */
  getTokenExpiry(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  }

  /**
   * Create Token Pair (Access + Refresh)
   */
  async createTokenPair(userId: string) {
    return {
      accessToken: await this.generateAccessToken(userId),
      refreshToken: await this.generateRefreshToken(userId),
      accessTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  // Private helper methods
  private getAccessSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  private getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    return secret;
  }
}

// Error Classes for Better Error Handling
export class TokenError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export class TokenExpiredError extends TokenError {
  constructor(message = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenError extends TokenError {
  constructor(message = 'Invalid token') {
    super(message, 'INVALID_TOKEN');
  }
}

export class MissingTokenError extends TokenError {
  constructor(message = 'No token provided') {
    super(message, 'MISSING_TOKEN');
  }
}