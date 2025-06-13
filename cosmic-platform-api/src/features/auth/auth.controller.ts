// src/features/auth/auth.controller.ts - PRODUCTION VERSION
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { JWTUtil } from '../../utils/jwt';
import { PasswordUtil } from '../../utils/password';
import { EmailService } from '../../services/email.service';
import {
  RegisterSchema,
  LoginSchema,
  EmailVerificationSchema,
  PasswordResetRequestSchema,
  PasswordResetSchema,
  ChangePasswordSchema,
  UpdateProfileSchema
} from '../../schemas/auth.schemas';

/**
 * 🌌 Cosmic Platform Authentication Controller
 * Handles all authentication-related operations for the cosmic platform
 */
export class AuthController {
  public prisma: PrismaClient;
  private jwtUtil: JWTUtil;
  private passwordUtil: PasswordUtil;
  private emailService: EmailService;

  constructor() {
    this.prisma = new PrismaClient();
    this.jwtUtil = new JWTUtil();
    this.passwordUtil = new PasswordUtil();
    this.emailService = new EmailService();
  }

  /**
   * Registers a new user in the cosmic platform
   * @param request - Fastify request with registration data
   * @param reply - Fastify reply object
   * @returns User registration response with verification email
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = RegisterSchema.parse(request.body);
      const { username, email, password, displayName, bio } = validatedData;

      // Check if user already exists
      const existingUser = await this.prisma.starSystem.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.username === username) {
          return reply.status(409).send({
            error: 'Username already exists',
            message: 'This username is already taken. Please choose another one.'
          });
        }
        if (existingUser.email === email) {
          return reply.status(409).send({
            error: 'Email already exists',
            message: 'An account with this email already exists.'
          });
        }
      }

      // Hash password
      const hashedPassword = await this.passwordUtil.hashPassword(password);

      // Generate email verification token
      const emailVerifyToken = await this.jwtUtil.generateEmailToken(email);

      // Create user
      const user = await this.prisma.starSystem.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
          display_name: displayName || username,
          bio: bio || '',
          email_verify_token: emailVerifyToken,
          email_verified: false
        },
        select: {
          id: true,
          username: true,
          email: true,
          display_name: true,
          email_verified: true,
          created_at: true
        }
      });

      // Send verification email
      try {
        await this.emailService.sendWelcomeEmail(email, displayName || username, emailVerifyToken);
      } catch (emailError) {
        console.error('Email sending failed during registration:', emailError);
        // Don't fail registration if email fails
      }

      return reply.status(201).send({
        message: 'Registration successful. Please verify your email.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          emailVerified: user.email_verified,
          createdAt: user.created_at
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid registration data',
          details: error.errors
        });
      }

      return reply.status(500).send({
        error: 'Registration Failed',
        message: 'Unable to create account. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Authenticates user and returns JWT tokens
   * @param request - Fastify request with login credentials
   * @param reply - Fastify reply object
   * @returns User data and access token
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = LoginSchema.parse(request.body);
      const { identifier, password } = validatedData;

      // Find user by username or email
      const user = await this.prisma.starSystem.findFirst({
        where: {
          OR: [
            { username: identifier },
            { email: identifier }
          ]
        }
      });

      if (!user) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Username or password is incorrect.'
        });
      }

      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        const remainingTime = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
        return reply.status(423).send({
          error: 'Account locked',
          message: `Account is temporarily locked. Try again in ${remainingTime} minutes.`
        });
      }

      // Verify password
      const isValidPassword = await this.passwordUtil.verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        // Increment failed attempts
        const failedAttempts = (user.failed_login_attempts || 0) + 1;
        const lockAccount = failedAttempts >= 5;

        await this.prisma.starSystem.update({
          where: { id: user.id },
          data: {
            failed_login_attempts: failedAttempts,
            locked_until: lockAccount ? new Date(Date.now() + 30 * 60 * 1000) : null // 30 minutes
          }
        });

        if (lockAccount) {
          return reply.status(423).send({
            error: 'Account locked',
            message: 'Too many failed attempts. Account locked for 30 minutes.'
          });
        }

        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Username or password is incorrect.'
        });
      }

      // Check email verification
      if (!user.email_verified) {
        return reply.status(403).send({
          error: 'Email not verified',
          message: 'Please verify your email address before logging in.'
        });
      }

      // Generate tokens
      const accessToken = await this.jwtUtil.generateAccessToken(user.id);
      const refreshToken = await this.jwtUtil.generateRefreshToken(user.id);

      // Update login info and reset failed attempts
      await this.prisma.starSystem.update({
        where: { id: user.id },
        data: {
          last_login_at: new Date(),
          failed_login_attempts: 0,
          locked_until: null
        }
      });

      // Save refresh token to database
      await this.prisma.session.create({
        data: {
          user: {
            connect: { id: user.id }
          },
          refresh_token: refreshToken,
          token_id: `refresh_${Date.now()}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      // Set refresh token as httpOnly cookie
      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return reply.send({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          emailVerified: user.email_verified
        },
        accessToken
      });

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid login data',
          details: error.errors
        });
      }

      return reply.status(500).send({
        error: 'Login Failed',
        message: 'Unable to log in. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Generates new access token using refresh token
   * @param request - Fastify request with refresh token in cookies
   * @param reply - Fastify reply object
   * @returns New access token
   */
  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        return reply.status(401).send({
          error: 'No refresh token',
          message: 'Refresh token not provided.'
        });
      }

      // Verify refresh token
      const payload = await this.jwtUtil.verifyRefreshToken(refreshToken);
      const userId = payload.userId;

      // Check if session exists and is valid
      const session = await this.prisma.session.findFirst({
        where: {
          user: { id: userId },
          refresh_token: refreshToken,
          expires_at: { gt: new Date() }
        }
      });

      if (!session) {
        return reply.status(401).send({
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or expired.'
        });
      }

      // Generate new access token
      const accessToken = await this.jwtUtil.generateAccessToken(userId);

      return reply.send({
        message: 'Token refreshed successfully',
        accessToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      return reply.status(401).send({
        error: 'Token refresh failed',
        message: 'Unable to refresh token.'
      });
    }
  }

  /**
   * Invalidates refresh token and clears user session
   * @param request - Fastify request with refresh token in cookies
   * @param reply - Fastify reply object
   * @returns Logout confirmation
   */
  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (refreshToken) {
        // Delete session from database
        await this.prisma.session.deleteMany({
          where: { refresh_token: refreshToken }
        });
      }

      // Clear refresh token cookie
      reply.clearCookie('refreshToken');

      return reply.send({
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Logout error:', error);
      return reply.status(500).send({
        error: 'Logout failed',
        message: 'Unable to log out properly.'
      });
    }
  }

  /**
   * Verifies user email address using verification token
   * @param request - Fastify request with verification token in query
   * @param reply - Fastify reply object
   * @returns Email verification result
   */
  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = EmailVerificationSchema.parse(request.query);
      const { token } = validatedData;

      // Verify email token
      const payload = await this.jwtUtil.verifyEmailToken(token);
      const email = payload.email;

      // Find and update user
      const user = await this.prisma.starSystem.findFirst({
        where: {
          email,
          email_verify_token: token
        }
      });

      if (!user) {
        return reply.status(400).send({
          error: 'Invalid verification token',
          message: 'Email verification token is invalid or expired.'
        });
      }

      if (user.email_verified) {
        return reply.send({
          message: 'Email already verified',
          user: {
            username: user.username,
            email: user.email,
            emailVerified: true
          }
        });
      }

      // Update user as verified
      await this.prisma.starSystem.update({
        where: { id: user.id },
        data: {
          email_verified: true,
          email_verify_token: null
        }
      });

      return reply.send({
        message: 'Email verified successfully',
        user: {
          username: user.username,
          email: user.email,
          emailVerified: true
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      return reply.status(400).send({
        error: 'Email verification failed',
        message: 'Unable to verify email. Token may be invalid or expired.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Sends password reset email to user
   * @param request - Fastify request with email address
   * @param reply - Fastify reply object
   * @returns Password reset request confirmation
   */
  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = PasswordResetRequestSchema.parse(request.body);
      const { email } = validatedData;

      const user = await this.prisma.starSystem.findUnique({
        where: { email }
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return reply.send({
          message: 'If an account with this email exists, a password reset link has been sent.'
        });
      }

      // Generate password reset token
      const resetToken = await this.jwtUtil.generatePasswordResetToken(email);

      // Update user with reset token
      await this.prisma.starSystem.update({
        where: { id: user.id },
        data: {
          password_reset_token: resetToken,
          password_reset_expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      // Send password reset email
      try {
        await this.emailService.sendPasswordResetEmail(email, user.display_name, resetToken);
      } catch (emailError) {
        console.error('Password reset email failed:', emailError);
      }

      return reply.send({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid email format',
          details: error.errors
        });
      }

      return reply.status(500).send({
        error: 'Password reset failed',
        message: 'Unable to process password reset request.'
      });
    }
  }

  /**
   * Resets user password using reset token
   * @param request - Fastify request with reset token and new password
   * @param reply - Fastify reply object
   * @returns Password reset confirmation
   */
  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = PasswordResetSchema.parse(request.body);
      const { token, newPassword } = validatedData;

      // Verify reset token
      const payload = await this.jwtUtil.verifyPasswordResetToken(token);
      const email = payload.email;

      // Find user with valid reset token
      const user = await this.prisma.starSystem.findFirst({
        where: {
          email,
          password_reset_token: token,
          password_reset_expires: { gt: new Date() }
        }
      });

      if (!user) {
        return reply.status(400).send({
          error: 'Invalid reset token',
          message: 'Password reset token is invalid or expired.'
        });
      }

      // Hash new password
      const hashedPassword = await this.passwordUtil.hashPassword(newPassword);

      // Update user password and clear reset token
      await this.prisma.starSystem.update({
        where: { id: user.id },
        data: {
          password_hash: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
          failed_login_attempts: 0,
          locked_until: null
        }
      });

      // Invalidate all existing sessions
      await this.prisma.session.deleteMany({
        where: { user: { id: user.id } }
      });

      return reply.send({
        message: 'Password reset successful. Please log in with your new password.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid password reset data',
          details: error.errors
        });
      }

      return reply.status(400).send({
        error: 'Password reset failed',
        message: 'Unable to reset password. Token may be invalid or expired.'
      });
    }
  }

  /**
   * Returns current authenticated user information
   * @param request - Fastify request with userId from auth middleware
   * @param reply - Fastify reply object
   * @returns Current user data
   */
  async getCurrentUser(request: any, reply: FastifyReply) {
    try {
      const userId = request.userId;

      if (!userId) {
        return reply.status(401).send({
          error: 'Authentication required',
          message: 'User ID not found in request.'
        });
      }

      const user = await this.prisma.starSystem.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          display_name: true,
          bio: true,
          avatar_url: true,
          email_verified: true,
          created_at: true,
          last_login_at: true
        }
      });

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: 'Current user not found.'
        });
      }

      return reply.send({
        message: 'Current user retrieved successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          bio: user.bio,
          avatar: user.avatar_url,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      return reply.status(500).send({
        error: 'Failed to get user',
        message: 'Unable to retrieve current user information.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Updates user profile information
   * @param request - Fastify request with profile data and userId from auth middleware
   * @param reply - Fastify reply object
   * @returns Updated user profile
   */
  async updateProfile(request: any, reply: FastifyReply) {
    try {
      const userId = request.userId;
      const validatedData = UpdateProfileSchema.parse(request.body);

      const updatedUser = await this.prisma.starSystem.update({
        where: { id: userId },
        data: validatedData,
        select: {
          id: true,
          username: true,
          email: true,
          display_name: true,
          bio: true,
          avatar_url: true,
          email_verified: true
        }
      });

      return reply.send({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          displayName: updatedUser.display_name,
          bio: updatedUser.bio,
          avatar: updatedUser.avatar_url,
          emailVerified: updatedUser.email_verified
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid profile data',
          details: error.errors
        });
      }

      return reply.status(500).send({
        error: 'Profile update failed',
        message: 'Unable to update profile.'
      });
    }
  }

  /**
   * Changes user password with current password verification
   * @param request - Fastify request with current and new passwords, userId from auth middleware
   * @param reply - Fastify reply object
   * @returns Password change confirmation
   */
  async changePassword(request: any, reply: FastifyReply) {
    try {
      const userId = request.userId;
      const validatedData = ChangePasswordSchema.parse(request.body);
      const { currentPassword, newPassword } = validatedData;

      // Get current user
      const user = await this.prisma.starSystem.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: 'Current user not found.'
        });
      }

      // Verify current password
      const isValidPassword = await this.passwordUtil.verifyPassword(currentPassword, user.password_hash);

      if (!isValidPassword) {
        return reply.status(401).send({
          error: 'Invalid current password',
          message: 'Current password is incorrect.'
        });
      }

      // Hash new password
      const hashedPassword = await this.passwordUtil.hashPassword(newPassword);

      // Update password
      await this.prisma.starSystem.update({
        where: { id: userId },
        data: { password_hash: hashedPassword }
      });

      // Invalidate all sessions except current one
      const currentRefreshToken = request.cookies.refreshToken;
      await this.prisma.session.deleteMany({
        where: {
          user: { id: userId },
          refresh_token: { not: currentRefreshToken }
        }
      });

      return reply.send({
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid password change data',
          details: error.errors
        });
      }

      return reply.status(500).send({
        error: 'Password change failed',
        message: 'Unable to change password.'
      });
    }
  }
}