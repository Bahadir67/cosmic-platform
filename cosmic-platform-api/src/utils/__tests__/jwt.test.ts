// src/utils/__tests__/jwt.test.ts
import { JWTUtil, JWTPayload, TokenError, TokenExpiredError, InvalidTokenError } from '../jwt';
import jwt from 'jsonwebtoken';

// Mock test data
const mockUser = {
  userId: 'cosmic_user_123',
  username: 'starexplorer',
  email: 'star@cosmic.dev'
};

// Set environment variables for testing
process.env.JWT_SECRET = 'cosmic-test-secret-key-for-testing-access-tokens';
process.env.JWT_REFRESH_SECRET = 'cosmic-test-refresh-secret-key-for-testing-refresh-tokens';

describe('JWTUtil', () => {
  
  describe('Token Generation', () => {
    test('should generate valid access token', () => {
      const token = JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(50);
      
      // Decode to check structure
      const decoded = JWTUtil.decodeToken(token) as JWTPayload;
      expect(decoded.userId).toBe(mockUser.userId);
      expect(decoded.username).toBe(mockUser.username);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.type).toBe('access');
      expect(decoded.tokenId).toBeDefined();
    });

    test('should generate valid refresh token', () => {
      const token = JWTUtil.generateRefreshToken(mockUser.userId, mockUser.username, mockUser.email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = JWTUtil.decodeToken(token) as JWTPayload;
      expect(decoded.userId).toBe(mockUser.userId);
      expect(decoded.type).toBe('refresh');
    });

    test('should generate valid email verification token', () => {
      const token = JWTUtil.generateEmailVerifyToken(mockUser.userId, mockUser.email);
      
      expect(token).toBeDefined();
      const decoded = JWTUtil.decodeToken(token) as JWTPayload;
      expect(decoded.userId).toBe(mockUser.userId);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.type).toBe('email_verify');
    });

    test('should generate valid password reset token', () => {
      const token = JWTUtil.generatePasswordResetToken(mockUser.userId, mockUser.email);
      
      expect(token).toBeDefined();
      const decoded = JWTUtil.decodeToken(token) as JWTPayload;
      expect(decoded.userId).toBe(mockUser.userId);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.type).toBe('password_reset');
    });

    test('should generate unique token IDs', () => {
      const token1 = JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      const token2 = JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      
      const decoded1 = JWTUtil.decodeToken(token1) as JWTPayload;
      const decoded2 = JWTUtil.decodeToken(token2) as JWTPayload;
      
      expect(decoded1.tokenId).not.toBe(decoded2.tokenId);
    });
  });

  describe('Token Verification', () => {
    test('should verify valid access token', () => {
      const token = JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      const payload = JWTUtil.verifyAccessToken(token);
      
      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.username).toBe(mockUser.username);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('access');
    });

    test('should verify valid refresh token', () => {
      const token = JWTUtil.generateRefreshToken(mockUser.userId, mockUser.username, mockUser.email);
      const payload = JWTUtil.verifyRefreshToken(token);
      
      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.type).toBe('refresh');
    });

    test('should verify valid email verify token', () => {
      const token = JWTUtil.generateEmailVerifyToken(mockUser.userId, mockUser.email);
      const payload = JWTUtil.verifyEmailVerifyToken(token);
      
      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('email_verify');
    });

    test('should verify valid password reset token', () => {
      const token = JWTUtil.generatePasswordResetToken(mockUser.userId, mockUser.email);
      const payload = JWTUtil.verifyPasswordResetToken(token);
      
      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('password_reset');
    });

    test('should reject invalid token signature', () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwidXNlcm5hbWUiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTcwMzI3MjgwMCwiZXhwIjoxNzAzMjczNzAwfQ.fake_signature';
      
      expect(() => {
        JWTUtil.verifyAccessToken(fakeToken);
      }).toThrow('Invalid access token');
    });

    test('should reject wrong token type for verification', () => {
      const refreshToken = JWTUtil.generateRefreshToken(mockUser.userId, mockUser.username, mockUser.email);
      
      expect(() => {
        JWTUtil.verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type for access verification');
    });
  });

  describe('Token Expiry', () => {
    test('should detect expired token', () => {
      // Create expired token manually
      const expiredPayload = {
        userId: mockUser.userId,
        username: mockUser.username,
        email: mockUser.email,
        tokenId: 'test-id',
        type: 'access' as const,
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };
      
      const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET!);
      
      expect(() => {
        JWTUtil.verifyAccessToken(expiredToken);
      }).toThrow('Access token has expired');
    });

    test('should correctly identify expired tokens', () => {
      const expiredPayload = {
        userId: mockUser.userId,
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };
      
      const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET!);
      expect(JWTUtil.isTokenExpired(expiredToken)).toBe(true);
    });

    test('should correctly identify valid tokens', () => {
      const token = JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      expect(JWTUtil.isTokenExpired(token)).toBe(false);
    });

    test('should get correct token expiry date', () => {
      const token = JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      const expiry = JWTUtil.getTokenExpiry(token);
      
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry!.getTime()).toBeGreaterThan(Date.now());
      
      // Should expire in approximately 15 minutes (900 seconds)
      const timeDiff = expiry!.getTime() - Date.now();
      expect(timeDiff).toBeGreaterThan(800000); // 13+ minutes
      expect(timeDiff).toBeLessThan(1000000); // Less than 17 minutes
    });
  });

  describe('Bearer Token Extraction', () => {
    test('should extract valid bearer token', () => {
      const token = 'some.jwt.token';
      const authHeader = `Bearer ${token}`;
      
      const extracted = JWTUtil.extractBearerToken(authHeader);
      expect(extracted).toBe(token);
    });

    test('should return null for invalid format', () => {
      expect(JWTUtil.extractBearerToken('InvalidFormat token')).toBeNull();
      expect(JWTUtil.extractBearerToken('Bearer')).toBeNull();
      expect(JWTUtil.extractBearerToken('Bearer token extra')).toBeNull();
      expect(JWTUtil.extractBearerToken('')).toBeNull();
      expect(JWTUtil.extractBearerToken(undefined)).toBeNull();
    });

    test('should handle edge cases', () => {
      expect(JWTUtil.extractBearerToken('Bearer ')).toBe('');
      expect(JWTUtil.extractBearerToken('bearer token')).toBeNull(); // lowercase
    });
  });

  describe('Token Pair Operations', () => {
    test('should create valid token pair', () => {
      const tokenPair = JWTUtil.createTokenPair(mockUser.userId, mockUser.username, mockUser.email);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.accessTokenExpiry).toBeInstanceOf(Date);
      expect(tokenPair.refreshTokenExpiry).toBeInstanceOf(Date);
      
      // Verify both tokens
      const accessPayload = JWTUtil.verifyAccessToken(tokenPair.accessToken);
      const refreshPayload = JWTUtil.verifyRefreshToken(tokenPair.refreshToken);
      
      expect(accessPayload.userId).toBe(mockUser.userId);
      expect(refreshPayload.userId).toBe(mockUser.userId);
      expect(accessPayload.type).toBe('access');
      expect(refreshPayload.type).toBe('refresh');
    });

    test('should refresh access token using refresh token', () => {
      const originalPair = JWTUtil.createTokenPair(mockUser.userId, mockUser.username, mockUser.email);
      
      // Wait a moment to ensure different timestamps
      const refreshedTokens = JWTUtil.refreshAccessToken(originalPair.refreshToken);
      
      expect(refreshedTokens.accessToken).toBeDefined();
      expect(refreshedTokens.accessToken).not.toBe(originalPair.accessToken);
      expect(refreshedTokens.accessTokenExpiry).toBeInstanceOf(Date);
      
      // Verify new access token
      const payload = JWTUtil.verifyAccessToken(refreshedTokens.accessToken);
      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.username).toBe(mockUser.username);
      expect(payload.email).toBe(mockUser.email);
    });

    test('should fail to refresh with invalid refresh token', () => {
      const accessToken = JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      
      expect(() => {
        JWTUtil.refreshAccessToken(accessToken); // Using access token instead of refresh
      }).toThrow('Invalid token type for refresh verification');
    });
  });

  describe('Error Handling', () => {
    test('should throw error when JWT_SECRET is missing', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => {
        JWTUtil.generateAccessToken(mockUser.userId, mockUser.username, mockUser.email);
      }).toThrow('JWT_SECRET environment variable is required');
      
      // Restore
      process.env.JWT_SECRET = originalSecret;
    });

    test('should throw error when JWT_REFRESH_SECRET is missing', () => {
      const originalSecret = process.env.JWT_REFRESH_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      
      expect(() => {
        JWTUtil.generateRefreshToken(mockUser.userId, mockUser.username, mockUser.email);
      }).toThrow('JWT_REFRESH_SECRET environment variable is required');
      
      // Restore
      process.env.JWT_REFRESH_SECRET = originalSecret;
    });

    test('should handle malformed tokens gracefully', () => {
      expect(JWTUtil.decodeToken('invalid.token')).toBeNull();
      expect(JWTUtil.decodeToken('')).toBeNull();
      expect(JWTUtil.decodeToken('not-a-jwt')).toBeNull();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    test('should handle complete authentication flow', () => {
      // 1. User registers/logs in - create token pair
      const tokenPair = JWTUtil.createTokenPair(mockUser.userId, mockUser.username, mockUser.email);
      
      // 2. Extract token from request header
      const authHeader = `Bearer ${tokenPair.accessToken}`;
      const extractedToken = JWTUtil.extractBearerToken(authHeader);
      expect(extractedToken).toBe(tokenPair.accessToken);
      
      // 3. Verify access token for protected route
      const accessPayload = JWTUtil.verifyAccessToken(extractedToken!);
      expect(accessPayload.userId).toBe(mockUser.userId);
      
      // 4. Access token expires - use refresh token
      const refreshedTokens = JWTUtil.refreshAccessToken(tokenPair.refreshToken);
      const newAccessPayload = JWTUtil.verifyAccessToken(refreshedTokens.accessToken);
      expect(newAccessPayload.userId).toBe(mockUser.userId);
    });

    test('should handle email verification flow', () => {
      // 1. Generate email verification token
      const emailToken = JWTUtil.generateEmailVerifyToken(mockUser.userId, mockUser.email);
      
      // 2. User clicks email link with token
      const payload = JWTUtil.verifyEmailVerifyToken(emailToken);
      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('email_verify');
    });

    test('should handle password reset flow', () => {
      // 1. Generate password reset token
      const resetToken = JWTUtil.generatePasswordResetToken(mockUser.userId, mockUser.email);
      
      // 2. User clicks reset link with token
      const payload = JWTUtil.verifyPasswordResetToken(resetToken);
      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('password_reset');
    });
  });
});

// Integration test helper for manual testing
export const testJWTIntegration = () => {
  console.log('🧪 JWT Integration Test Starting...\n');
  
  const testUser = {
    userId: 'cosmic_123',
    username: 'teststar',
    email: 'test@cosmic.dev'
  };
  
  try {
    // 1. Create token pair
    console.log('1️⃣ Creating token pair...');
    const tokens = JWTUtil.createTokenPair(testUser.userId, testUser.username, testUser.email);
    console.log('✅ Token pair created');
    console.log(`   Access Token: ${tokens.accessToken.substring(0, 50)}...`);
    console.log(`   Refresh Token: ${tokens.refreshToken.substring(0, 50)}...`);
    console.log(`   Access Expires: ${tokens.accessTokenExpiry}`);
    console.log(`   Refresh Expires: ${tokens.refreshTokenExpiry}\n`);
    
    // 2. Verify access token
    console.log('2️⃣ Verifying access token...');
    const accessPayload = JWTUtil.verifyAccessToken(tokens.accessToken);
    console.log('✅ Access token verified');
    console.log(`   User ID: ${accessPayload.userId}`);
    console.log(`   Username: ${accessPayload.username}`);
    console.log(`   Token ID: ${accessPayload.tokenId}\n`);
    
    // 3. Refresh access token
    console.log('3️⃣ Refreshing access token...');
    const refreshed = JWTUtil.refreshAccessToken(tokens.refreshToken);
    console.log('✅ Access token refreshed');
    console.log(`   New Access Token: ${refreshed.accessToken.substring(0, 50)}...`);
    console.log(`   New Expires: ${refreshed.accessTokenExpiry}\n`);
    
    // 4. Test email verification token
    console.log('4️⃣ Testing email verification...');
    const emailToken = JWTUtil.generateEmailVerifyToken(testUser.userId, testUser.email);
    const emailPayload = JWTUtil.verifyEmailVerifyToken(emailToken);
    console.log('✅ Email verification token works');
    console.log(`   Email: ${emailPayload.email}\n`);
    
    console.log('🎉 All JWT tests passed successfully!');
    
  } catch (error) {
    console.error('❌ JWT test failed:', error);
  }
};