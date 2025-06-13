// src/services/__tests__/email.service.test.ts
import { EmailService } from '../email.service';

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn()
      }
    }))
  };
});

// Mock test data
const mockUser = {
  username: 'starexplorer',
  email: 'test@cosmic.dev',
  displayName: 'Star Explorer'
};

const mockVerificationData = {
  user: mockUser,
  verificationToken: 'cosmic_verify_token_123',
  verificationUrl: 'http://localhost:3000/auth/verify-email?token=cosmic_verify_token_123'
};

const mockPasswordResetData = {
  user: mockUser,
  resetToken: 'cosmic_reset_token_456',
  resetUrl: 'http://localhost:3000/auth/reset-password?token=cosmic_reset_token_456'
};

const mockWelcomeData = {
  user: mockUser,
  loginUrl: 'http://localhost:3000/auth/login'
};

// Set test environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    RESEND_API_KEY: 'test_resend_api_key',
    EMAIL_FROM: 'test@cosmic-platform.dev',
    FRONTEND_URL: 'http://localhost:3000'
  };
  jest.clearAllMocks();
});

afterEach(() => {
  process.env = originalEnv;
});

describe('EmailService', () => {
  
  describe('Constructor and Configuration', () => {
    test('should initialize with valid API key', () => {
      expect(() => new EmailService()).not.toThrow();
    });

    test('should throw error when RESEND_API_KEY is missing', () => {
      delete process.env.RESEND_API_KEY;
      
      expect(() => new EmailService()).toThrow(
        'RESEND_API_KEY environment variable is required'
      );
    });

    test('should use default email address when EMAIL_FROM is not set', () => {
      delete process.env.EMAIL_FROM;
      const service = new EmailService();
      expect(service).toBeDefined();
    });

    test('should use default frontend URL when FRONTEND_URL is not set', () => {
      delete process.env.FRONTEND_URL;
      const service = new EmailService();
      expect(service).toBeDefined();
    });
  });

  describe('sendWelcomeEmail', () => {
    let emailService: EmailService;
    let mockSend: jest.Mock;

    beforeEach(() => {
      emailService = new EmailService();
      mockSend = (emailService as any).resend.emails.send;
    });

    test('should send welcome email successfully', async () => {
      mockSend.mockResolvedValue({ id: 'email_123' });

      await emailService.sendWelcomeEmail(mockWelcomeData);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@cosmic-platform.dev',
        to: mockUser.email,
        subject: '🌌 Welcome to Cosmic Platform - Your Universe Awaits!',
        html: expect.stringContaining('Welcome, Star Explorer!'),
        text: expect.stringContaining('Welcome to Cosmic Platform')
      });
    });

    test('should include user display name in welcome email', async () => {
      mockSend.mockResolvedValue({ id: 'email_123' });

      await emailService.sendWelcomeEmail(mockWelcomeData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain('Welcome, Star Explorer!');
      expect(sentEmail.text).toContain('Hello Star Explorer!');
    });

    test('should fallback to username when display name is not provided', async () => {
      mockSend.mockResolvedValue({ id: 'email_123' });
      
      const dataWithoutDisplayName = {
        ...mockWelcomeData,
        user: { ...mockUser, displayName: undefined }
      };

      await emailService.sendWelcomeEmail(dataWithoutDisplayName);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain('Welcome, starexplorer!');
    });

    test('should include login URL in welcome email', async () => {
      mockSend.mockResolvedValue({ id: 'email_123' });

      await emailService.sendWelcomeEmail(mockWelcomeData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain(mockWelcomeData.loginUrl);
      expect(sentEmail.text).toContain(mockWelcomeData.loginUrl);
    });

    test('should throw error when sending fails', async () => {
      mockSend.mockRejectedValue(new Error('Resend API error'));

      await expect(emailService.sendWelcomeEmail(mockWelcomeData))
        .rejects.toThrow('Failed to send welcome email');
    });
  });

  describe('sendEmailVerification', () => {
    let emailService: EmailService;
    let mockSend: jest.Mock;

    beforeEach(() => {
      emailService = new EmailService();
      mockSend = (emailService as any).resend.emails.send;
    });

    test('should send verification email successfully', async () => {
      mockSend.mockResolvedValue({ id: 'email_456' });

      await emailService.sendEmailVerification(mockVerificationData);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@cosmic-platform.dev',
        to: mockUser.email,
        subject: '🌟 Activate Your Star System - Cosmic Platform',
        html: expect.stringContaining('Activate Your Star System'),
        text: expect.stringContaining('ACTIVATE YOUR STAR SYSTEM')
      });
    });

    test('should include verification URL in email', async () => {
      mockSend.mockResolvedValue({ id: 'email_456' });

      await emailService.sendEmailVerification(mockVerificationData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain(mockVerificationData.verificationUrl);
      expect(sentEmail.text).toContain(mockVerificationData.verificationUrl);
    });

    test('should include security warning about 24-hour expiry', async () => {
      mockSend.mockResolvedValue({ id: 'email_456' });

      await emailService.sendEmailVerification(mockVerificationData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain('24 hours');
      expect(sentEmail.text).toContain('24 hours');
    });

    test('should throw error when verification email fails', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));

      await expect(emailService.sendEmailVerification(mockVerificationData))
        .rejects.toThrow('Failed to send verification email');
    });
  });

  describe('sendPasswordReset', () => {
    let emailService: EmailService;
    let mockSend: jest.Mock;

    beforeEach(() => {
      emailService = new EmailService();
      mockSend = (emailService as any).resend.emails.send;
    });

    test('should send password reset email successfully', async () => {
      mockSend.mockResolvedValue({ id: 'email_789' });

      await emailService.sendPasswordReset(mockPasswordResetData);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@cosmic-platform.dev',
        to: mockUser.email,
        subject: '🔐 Restore Your Cosmic Access - Password Reset',
        html: expect.stringContaining('Password Reset Request'),
        text: expect.stringContaining('PASSWORD RESET REQUEST')
      });
    });

    test('should include reset URL in email', async () => {
      mockSend.mockResolvedValue({ id: 'email_789' });

      await emailService.sendPasswordReset(mockPasswordResetData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain(mockPasswordResetData.resetUrl);
      expect(sentEmail.text).toContain(mockPasswordResetData.resetUrl);
    });

    test('should include security warnings', async () => {
      mockSend.mockResolvedValue({ id: 'email_789' });

      await emailService.sendPasswordReset(mockPasswordResetData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain('1 hour');
      expect(sentEmail.html).toContain('Security Notice');
      expect(sentEmail.html).toContain('ignore this email');
      expect(sentEmail.text).toContain('1 hour');
    });

    test('should throw error when password reset email fails', async () => {
      mockSend.mockRejectedValue(new Error('API timeout'));

      await expect(emailService.sendPasswordReset(mockPasswordResetData))
        .rejects.toThrow('Failed to send password reset email');
    });
  });

  describe('HTML Template Generation', () => {
    let emailService: EmailService;

    beforeEach(() => {
      emailService = new EmailService();
    });

    test('should generate valid HTML for welcome email', async () => {
      const mockSend = (emailService as any).resend.emails.send;
      mockSend.mockResolvedValue({ id: 'test' });

      await emailService.sendWelcomeEmail(mockWelcomeData);

      const html = mockSend.mock.calls[0][0].html;
      
      // Check HTML structure
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
      
      // Check cosmic styling
      expect(html).toContain('background: linear-gradient');
      expect(html).toContain('Cosmic Platform');
      expect(html).toContain('🌌');
      
      // Check content
      expect(html).toContain('Star Explorer');
      expect(html).toContain('Create Your Planets');
      expect(html).toContain('Build Bridges');
      expect(html).toContain('Join Galaxies');
    });

    test('should generate valid HTML for verification email', async () => {
      const mockSend = (emailService as any).resend.emails.send;
      mockSend.mockResolvedValue({ id: 'test' });

      await emailService.sendEmailVerification(mockVerificationData);

      const html = mockSend.mock.calls[0][0].html;
      
      expect(html).toContain('Activate Your Star System');
      expect(html).toContain('Verify Email Address');
      expect(html).toContain(mockVerificationData.verificationUrl);
      expect(html).toContain('🌟');
    });

    test('should generate valid HTML for password reset email', async () => {
      const mockSend = (emailService as any).resend.emails.send;
      mockSend.mockResolvedValue({ id: 'test' });

      await emailService.sendPasswordReset(mockPasswordResetData);

      const html = mockSend.mock.calls[0][0].html;
      
      expect(html).toContain('Password Reset Request');
      expect(html).toContain('Reset Password');
      expect(html).toContain(mockPasswordResetData.resetUrl);
      expect(html).toContain('🔐');
      expect(html).toContain('Security Notice');
    });
  });

  describe('Text Template Generation', () => {
    let emailService: EmailService;

    beforeEach(() => {
      emailService = new EmailService();
    });

    test('should generate plain text version for welcome email', async () => {
      const mockSend = (emailService as any).resend.emails.send;
      mockSend.mockResolvedValue({ id: 'test' });

      await emailService.sendWelcomeEmail(mockWelcomeData);

      const text = mockSend.mock.calls[0][0].text;
      
      expect(text).toContain('COSMIC PLATFORM - WELCOME!');
      expect(text).toContain('Star Explorer');
      expect(text).toContain(mockWelcomeData.loginUrl);
      expect(text).not.toContain('<');
      expect(text).not.toContain('>');
    });

    test('should generate plain text version for verification email', async () => {
      const mockSend = (emailService as any).resend.emails.send;
      mockSend.mockResolvedValue({ id: 'test' });

      await emailService.sendEmailVerification(mockVerificationData);

      const text = mockSend.mock.calls[0][0].text;
      
      expect(text).toContain('ACTIVATE YOUR STAR SYSTEM');
      expect(text).toContain(mockVerificationData.verificationUrl);
      expect(text).not.toContain('<');
    });

    test('should generate plain text version for password reset email', async () => {
      const mockSend = (emailService as any).resend.emails.send;
      mockSend.mockResolvedValue({ id: 'test' });

      await emailService.sendPasswordReset(mockPasswordResetData);

      const text = mockSend.mock.calls[0][0].text;
      
      expect(text).toContain('PASSWORD RESET REQUEST');
      expect(text).toContain(mockPasswordResetData.resetUrl);
      expect(text).not.toContain('<');
    });
  });

  describe('Static Helper Methods', () => {
    const baseUrl = 'https://cosmic-platform.dev';
    const token = 'test_token_123';

    test('should generate correct verification URL', () => {
      const url = EmailService.generateVerificationUrl(baseUrl, token);
      expect(url).toBe(`${baseUrl}/auth/verify-email?token=${token}`);
    });

    test('should generate correct password reset URL', () => {
      const url = EmailService.generatePasswordResetUrl(baseUrl, token);
      expect(url).toBe(`${baseUrl}/auth/reset-password?token=${token}`);
    });

    test('should generate correct login URL', () => {
      const url = EmailService.generateLoginUrl(baseUrl);
      expect(url).toBe(`${baseUrl}/auth/login`);
    });
  });

  describe('Integration Scenarios', () => {
    let emailService: EmailService;
    let mockSend: jest.Mock;

    beforeEach(() => {
      emailService = new EmailService();
      mockSend = (emailService as any).resend.emails.send;
    });

    test('should handle complete user registration flow', async () => {
      mockSend.mockResolvedValue({ id: 'test_email' });

      // Step 1: Send welcome email
      await emailService.sendWelcomeEmail(mockWelcomeData);
      
      // Step 2: Send verification email
      await emailService.sendEmailVerification(mockVerificationData);

      expect(mockSend).toHaveBeenCalledTimes(2);
      
      // Check welcome email
      const welcomeCall = mockSend.mock.calls[0][0];
      expect(welcomeCall.subject).toContain('Welcome');
      
      // Check verification email  
      const verificationCall = mockSend.mock.calls[1][0];
      expect(verificationCall.subject).toContain('Activate');
    });

    test('should handle password reset flow', async () => {
      mockSend.mockResolvedValue({ id: 'test_email' });

      await emailService.sendPasswordReset(mockPasswordResetData);

      const resetCall = mockSend.mock.calls[0][0];
      expect(resetCall.subject).toContain('Password Reset');
      expect(resetCall.html).toContain('reset');
      expect(resetCall.html).toContain('1 hour');
    });

    test('should handle multiple emails with different users', async () => {
      mockSend.mockResolvedValue({ id: 'test_email' });

      const user2 = {
        username: 'cosmicuser2',
        email: 'user2@cosmic.dev',
        displayName: 'Cosmic User 2'
      };

      // Send emails to different users
      await emailService.sendWelcomeEmail({ ...mockWelcomeData });
      await emailService.sendWelcomeEmail({ 
        ...mockWelcomeData, 
        user: user2 
      });

      expect(mockSend).toHaveBeenCalledTimes(2);
      
      // Check first email
      expect(mockSend.mock.calls[0][0].to).toBe(mockUser.email);
      expect(mockSend.mock.calls[0][0].html).toContain('Star Explorer');
      
      // Check second email
      expect(mockSend.mock.calls[1][0].to).toBe(user2.email);
      expect(mockSend.mock.calls[1][0].html).toContain('Cosmic User 2');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    let emailService: EmailService;
    let mockSend: jest.Mock;

    beforeEach(() => {
      emailService = new EmailService();
      mockSend = (emailService as any).resend.emails.send;
    });

    test('should handle network timeouts', async () => {
      mockSend.mockRejectedValue(new Error('Request timeout'));

      await expect(emailService.sendWelcomeEmail(mockWelcomeData))
        .rejects.toThrow('Failed to send welcome email');
    });

    test('should handle invalid email addresses gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Invalid email format'));

      const invalidEmailData = {
        ...mockWelcomeData,
        user: { ...mockUser, email: 'invalid-email' }
      };

      await expect(emailService.sendWelcomeEmail(invalidEmailData))
        .rejects.toThrow('Failed to send welcome email');
    });

    test('should handle empty user data', async () => {
      mockSend.mockResolvedValue({ id: 'test' });

      const emptyUserData = {
        ...mockWelcomeData,
        user: { username: '', email: 'test@cosmic.dev', displayName: '' }
      };

      await emailService.sendWelcomeEmail(emptyUserData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toBeDefined();
      expect(sentEmail.text).toBeDefined();
    });

    test('should handle very long URLs', async () => {
      mockSend.mockResolvedValue({ id: 'test' });

      const longUrlData = {
        ...mockVerificationData,
        verificationUrl: 'http://localhost:3000/auth/verify-email?token=' + 'x'.repeat(500)
      };

      await emailService.sendEmailVerification(longUrlData);

      const sentEmail = mockSend.mock.calls[0][0];
      expect(sentEmail.html).toContain(longUrlData.verificationUrl);
    });
  });
});

// Manual integration test helper
export const testEmailIntegration = async () => {
  console.log('📧 Email Service Integration Test Starting...\n');
  
  try {
    const emailService = new EmailService();
    console.log('✅ Email service initialized');
    
    const testUser = {
      username: 'teststar',
      email: 'test@cosmic.dev',
      displayName: 'Test Star'
    };
    
    console.log('📧 Testing URL generation...');
    const verifyUrl = EmailService.generateVerificationUrl('http://localhost:3000', 'test_token');
    const resetUrl = EmailService.generatePasswordResetUrl('http://localhost:3000', 'reset_token');
    const loginUrl = EmailService.generateLoginUrl('http://localhost:3000');
    
    console.log(`✅ Verification URL: ${verifyUrl}`);
    console.log(`✅ Reset URL: ${resetUrl}`);
    console.log(`✅ Login URL: ${loginUrl}\n`);
    
    // Note: Actual email sending would require valid RESEND_API_KEY
    console.log('🎉 Email service integration test completed!');
    console.log('💡 To test actual email sending, set RESEND_API_KEY in .env');
    
  } catch (error) {
    console.error('❌ Email service test failed:', error);
  }
};