// src/features/auth/auth.controller.ts - FULL VERSION
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
 * Handles all authentication-related operations
 */
export class AuthController {
  public prisma: PrismaClient;
  private jwtUtil: JWTUtil;
  private passwordUtil: PasswordUtil;
  private emailService: EmailService;

  constructor() {
    console.log('🔍 AuthController constructor called');
    this.prisma = new PrismaClient();
    this.jwtUtil = new JWTUtil();
    this.passwordUtil = new PasswordUtil();
    this.emailService = new EmailService();
  }

  /**
   * 📝 User Registration
   * Creates new user account with email verification
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    console.log('🔍 FULL REGISTER METHOD CALLED');
    console.log('Request body:', request.body);
    
    try {
      console.log('🔍 Testing validation...');
      const validatedData = RegisterSchema.parse(request.body);
      console.log('✅ Validation passed');
      
      const { username, email, password, displayName, bio } = validatedData;

      console.log('🔍 Checking for existing user...');
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
        console.log('❌ User already exists');
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
      console.log('✅ No existing user found');

      console.log('🔍 Hashing password...');
      // Hash password
      const hashedPassword = await this.passwordUtil.hashPassword(password);
      console.log('✅ Password hashed');

      console.log('🔍 Generating email verification token...');
      // Generate email verification token
      const emailVerifyToken = await this.jwtUtil.generateEmailToken(email);
      console.log('✅ Email token generated');

      console.log('🔍 Creating user in database...');
      // Create user
      const user = await this.prisma.starSystem.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
          display_name: displayName || username, // Fixed: snake_case
          bio: bio || '',
          email_verify_token: emailVerifyToken, // Fixed: snake_case
          email_verified: false // Fixed: snake_case
        },
        select: {
          id: true,
          username: true,
          email: true,
          display_name: true, // Fixed: snake_case
          email_verified: true, // Fixed: snake_case
          created_at: true // Fixed: snake_case
        }
      });
      console.log('✅ User created successfully');

      console.log('🔍 Sending welcome email...');
      // Send verification email
      try {
        await this.emailService.sendWelcomeEmail(email, displayName || username, emailVerifyToken);
        console.log('✅ Welcome email sent');
      } catch (emailError) {
        console.log('⚠️ Email sending failed, but user created:', emailError.message);
        // Don't fail registration if email fails
      }

      return reply.status(201).send({
        message: 'Registration successful. Please verify your email.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name, // Convert back to camelCase for response
          emailVerified: user.email_verified,
          createdAt: user.created_at
        }
      });

    } catch (error) {
      console.error('❌ Full registration error:', error.message);
      console.error('❌ Stack:', error.stack);
      
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
   * 🔐 User Login
   * Authenticates user and returns JWT tokens
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    console.log('🔍 LOGIN METHOD CALLED');
    console.log('Request body:', request.body);
    
    try {
      console.log('🔍 Validating login data...');
      const validatedData = LoginSchema.parse(request.body);
      const { identifier, password } = validatedData;
      console.log('✅ Validation passed, identifier:', identifier);

      console.log('🔍 Finding user in database...');
      // Find user by username or email
      const user = await this.prisma.starSystem.findFirst({
        where: {
          OR: [
            { username: identifier },
            { email: identifier }
          ]
        }
      });
      console.log('✅ Database query complete:', user ? 'User found' : 'User not found');
      
      if (user) {
        console.log('User details:', {
          id: user.id,
          username: user.username,
          email: user.email,
          email_verified: user.email_verified,
          failed_login_attempts: user.failed_login_attempts,
          locked_until: user.locked_until
        });
      }

      if (!user) {
        console.log('❌ User not found');
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Username or password is incorrect.'
        });
      }

      console.log('🔍 Checking account lock...');
      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        const remainingTime = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
        console.log('❌ Account locked for', remainingTime, 'minutes');
        return reply.status(423).send({
          error: 'Account locked',
          message: `Account is temporarily locked. Try again in ${remainingTime} minutes.`
        });
      }
      console.log('✅ Account not locked');

      console.log('🔍 Verifying password...');
      // Verify password
      const isValidPassword = await this.passwordUtil.verifyPassword(password, user.password_hash);
      console.log('✅ Password verification result:', isValidPassword);

      if (!isValidPassword) {
        console.log('❌ Invalid password');
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

      console.log('🔍 Checking email verification...');
      // Check email verification
      if (!user.email_verified) {
        console.log('❌ Email not verified');
        return reply.status(403).send({
          error: 'Email not verified',
          message: 'Please verify your email address before logging in.'
        });
      }
      console.log('✅ Email verified');

      console.log('🔍 Generating tokens...');
      // Generate tokens
      const accessToken = await this.jwtUtil.generateAccessToken(user.id);
      const refreshToken = await this.jwtUtil.generateRefreshToken(user.id);
      console.log('✅ Tokens generated');

      console.log('🔍 Updating login info...');
      // Update login info and reset failed attempts
      await this.prisma.starSystem.update({
        where: { id: user.id },
        data: {
          last_login_at: new Date(),
          failed_login_attempts: 0,
          locked_until: null
        }
      });
      console.log('✅ Login info updated');

      console.log('🔍 Creating session...');
      // Save refresh token to database
      await this.prisma.session.create({
        data: {
          user: {
            connect: { id: user.id } // Connect to existing user
          },
          refresh_token: refreshToken,
          token_id: `refresh_${Date.now()}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
      console.log('✅ Session created');

      console.log('🔍 Setting cookie...');
      // Set refresh token as httpOnly cookie
      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      console.log('✅ Cookie set');

      console.log('✅ LOGIN SUCCESSFUL');
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
      console.error('❌ Login error:', error.message);
      console.error('❌ Stack:', error.stack);
      
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
   * 🔄 Refresh Token
   * Generates new access token using refresh token
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
          user: { id: userId }, // Use relation
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
   * 🚪 User Logout
   * Invalidates refresh token and clears session
   */
  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (refreshToken) {
        // Delete session from database
        await this.prisma.session.deleteMany({
          where: { refresh_token: refreshToken } // Fixed: snake_case
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
   * ✅ Email Verification
   * Verifies user email address
   */
  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    console.log('🔍 Email verification called');
    console.log('Query params:', request.query);
    
    try {
      console.log('🔍 Parsing query params...');
      const validatedData = EmailVerificationSchema.parse(request.query);
      const { token } = validatedData;
      console.log('✅ Query validation passed, token:', token.substring(0, 50) + '...');

      console.log('🔍 Verifying JWT token...');
      // Verify email token
      const payload = await this.jwtUtil.verifyEmailToken(token);
      const email = payload.email;
      console.log('✅ JWT verification passed, email:', email);

      console.log('🔍 Finding user in database...');
      // Find and update user
      const user = await this.prisma.starSystem.findFirst({
        where: {
          email,
          email_verify_token: token // Fixed: snake_case
        }
      });
      console.log('✅ Database query complete:', user ? 'User found' : 'User not found');

      if (!user) {
        console.log('❌ User not found or token mismatch');
        return reply.status(400).send({
          error: 'Invalid verification token',
          message: 'Email verification token is invalid or expired.'
        });
      }

      if (user.email_verified) {
        console.log('✅ Email already verified');
        return reply.send({
          message: 'Email already verified',
          user: {
            username: user.username,
            email: user.email,
            emailVerified: true
          }
        });
      }

      console.log('🔍 Updating user as verified...');
      // Update user as verified
      await this.prisma.starSystem.update({
        where: { id: user.id },
        data: {
          email_verified: true, // Fixed: snake_case
          email_verify_token: null // Fixed: snake_case
        }
      });
      console.log('✅ User updated successfully');

      return reply.send({
        message: 'Email verified successfully',
        user: {
          username: user.username,
          email: user.email,
          emailVerified: true
        }
      });

    } catch (error) {
      console.error('❌ Email verification error:', error.message);
      console.error('❌ Stack:', error.stack);
      return reply.status(400).send({
        error: 'Email verification failed',
        message: 'Unable to verify email. Token may be invalid or expired.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 🔒 Forgot Password
   * Sends password reset email
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
          passwordResetToken: resetToken,
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(email, user.displayName, resetToken);

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
   * 🔓 Reset Password
   * Resets user password using reset token
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
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() }
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
          passwordResetToken: null,
          passwordResetExpires: null,
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      });

      // Invalidate all existing sessions
      await this.prisma.session.deleteMany({
        where: { userId: user.id }
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
   * 👤 Get Current User
   * Returns current user information (protected route)
   */
  async getCurrentUser(request: any, reply: FastifyReply) {
    try {
      const userId = request.userId;

      const user = await this.prisma.starSystem.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          bio: true,
          avatar: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true
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
        user
      });

    } catch (error) {
      console.error('Get current user error:', error);
      return reply.status(500).send({
        error: 'Failed to get user',
        message: 'Unable to retrieve current user information.'
      });
    }
  }

  /**
   * ✏️ Update Profile
   * Updates user profile information (protected route)
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
          displayName: true,
          bio: true,
          avatar: true,
          emailVerified: true
        }
      });

      return reply.send({
        message: 'Profile updated successfully',
        user: updatedUser
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
   * 🔐 Change Password
   * Changes user password (protected route)
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
          user: { id: userId }, // Use relation
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