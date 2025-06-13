// src/services/email.service.ts
import { Resend } from 'resend';

// Email template interfaces
interface EmailUser {
  username: string;
  email: string;
  displayName?: string;
}

interface EmailVerificationData {
  user: EmailUser;
  verificationToken: string;
  verificationUrl: string;
}

interface PasswordResetData {
  user: EmailUser;
  resetToken: string;
  resetUrl: string;
}

interface WelcomeEmailData {
  user: EmailUser;
  loginUrl: string;
}

export class EmailService {
  private resend: Resend;
  private fromAddress: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    this.resend = new Resend(apiKey);
    this.fromAddress = process.env.EMAIL_FROM || 'noreply@cosmic-platform.dev';
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Send Welcome Email to New Users
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const htmlContent = this.generateWelcomeEmailHTML(data);
    const textContent = this.generateWelcomeEmailText(data);

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: data.user.email,
        subject: '🌌 Welcome to Cosmic Platform - Your Universe Awaits!',
        html: htmlContent,
        text: textContent,
      });
    } catch (error) {
      throw new Error(`Failed to send welcome email: ${error}`);
    }
  }

  /**
   * Send Email Verification
   */
  async sendEmailVerification(data: EmailVerificationData): Promise<void> {
    const htmlContent = this.generateVerificationEmailHTML(data);
    const textContent = this.generateVerificationEmailText(data);

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: data.user.email,
        subject: '🌟 Activate Your Star System - Cosmic Platform',
        html: htmlContent,
        text: textContent,
      });
    } catch (error) {
      throw new Error(`Failed to send verification email: ${error}`);
    }
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordReset(data: PasswordResetData): Promise<void> {
    const htmlContent = this.generatePasswordResetHTML(data);
    const textContent = this.generatePasswordResetText(data);

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: data.user.email,
        subject: '🔐 Restore Your Cosmic Access - Password Reset',
        html: htmlContent,
        text: textContent,
      });
    } catch (error) {
      throw new Error(`Failed to send password reset email: ${error}`);
    }
  }

  // HTML Email Templates

  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    const displayName = data.user.displayName || data.user.username;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Cosmic Platform</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.3"/><circle cx="80" cy="30" r="1.5" fill="white" opacity="0.4"/><circle cx="40" cy="70" r="1" fill="white" opacity="0.3"/><circle cx="90" cy="80" r="1" fill="white" opacity="0.5"/></svg>');
        }
        .cosmic-title {
            font-size: 32px;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
        }
        .cosmic-subtitle {
            font-size: 16px;
            margin: 10px 0 0 0;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .greeting {
            font-size: 24px;
            color: #fbbf24;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #e5e7eb;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #1a1a2e;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 10px 20px rgba(251, 191, 36, 0.3);
            transition: transform 0.3s ease;
        }
        .features {
            margin: 40px 0;
            text-align: left;
        }
        .feature {
            margin: 15px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            border-left: 4px solid #6366f1;
        }
        .feature-title {
            font-weight: bold;
            color: #fbbf24;
            margin-bottom: 5px;
        }
        .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="cosmic-title">🌌 Cosmic Platform</h1>
            <p class="cosmic-subtitle">Every mind is a universe. Every share is a trace.</p>
        </div>
        
        <div class="content">
            <div class="greeting">Welcome, ${displayName}! 🌟</div>
            
            <div class="message">
                Your star system has been successfully created in the Cosmic Platform universe! 
                You're now part of a federated community where ideas connect like bridges between stars.
            </div>
            
            <a href="${data.loginUrl}" class="cta-button">🚀 Enter Your Universe</a>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-title">🪐 Create Your Planets</div>
                    Organize content across Mercury (identity), Venus (personal), Mars (academic), 
                    Jupiter (professional), and Earth (values).
                </div>
                
                <div class="feature">
                    <div class="feature-title">🌉 Build Bridges</div>
                    Connect your ideas with meaningful relationships and watch knowledge networks grow.
                </div>
                
                <div class="feature">
                    <div class="feature-title">🌌 Join Galaxies</div>
                    Collaborate with like-minded star systems in autonomous communities.
                </div>
                
                <div class="feature">
                    <div class="feature-title">🤖 Aether AI</div>
                    Get intelligent insights and content recommendations powered by ethical AI.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent to ${data.user.email}</p>
            <p>© 2024 Cosmic Platform - Open Source & Federated</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateVerificationEmailHTML(data: EmailVerificationData): string {
    const displayName = data.user.displayName || data.user.username;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate Your Star System</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .cosmic-title {
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .greeting {
            font-size: 24px;
            color: #fbbf24;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #e5e7eb;
        }
        .activation-box {
            background: rgba(16, 185, 129, 0.1);
            border: 2px solid #10b981;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }
        .token-info {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 20px;
        }
        .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="cosmic-title">🌟 Activate Your Star System</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${displayName}! ✨</div>
            
            <div class="message">
                Your cosmic journey is almost complete! Click the button below to verify your email 
                and activate your star system in the Cosmic Platform universe.
            </div>
            
            <div class="activation-box">
                <p><strong>⚡ Email Verification Required</strong></p>
                <p>This link will expire in 24 hours for security reasons.</p>
                
                <a href="${data.verificationUrl}" class="cta-button">
                    🔗 Verify Email Address
                </a>
            </div>
            
            <div class="message">
                Once verified, you'll be able to:
                <br>• Create content across your planets
                <br>• Build bridges with other star systems  
                <br>• Join galaxy communities
                <br>• Access Aether AI insights
            </div>
            
            <div class="token-info">
                Having trouble? Copy and paste this link into your browser:<br>
                <a href="${data.verificationUrl}" style="color: #10b981; word-break: break-all;">
                    ${data.verificationUrl}
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>This verification was requested for ${data.user.email}</p>
            <p>© 2024 Cosmic Platform - Secure & Private</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generatePasswordResetHTML(data: PasswordResetData): string {
    const displayName = data.user.displayName || data.user.username;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restore Your Cosmic Access</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .cosmic-title {
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .greeting {
            font-size: 24px;
            color: #fbbf24;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #e5e7eb;
        }
        .reset-box {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
        }
        .security-note {
            background: rgba(251, 191, 36, 0.1);
            border-left: 4px solid #fbbf24;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: left;
        }
        .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="cosmic-title">🔐 Password Reset Request</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${displayName}! 🌟</div>
            
            <div class="message">
                We received a request to reset your password for your Cosmic Platform account. 
                If you made this request, click the button below to create a new password.
            </div>
            
            <div class="reset-box">
                <p><strong>🔑 Reset Your Password</strong></p>
                <p>This link will expire in 1 hour for security reasons.</p>
                
                <a href="${data.resetUrl}" class="cta-button">
                    🛡️ Reset Password
                </a>
            </div>
            
            <div class="security-note">
                <strong>⚠️ Security Notice:</strong><br>
                • If you didn't request this reset, please ignore this email<br>
                • Your password remains unchanged until you complete the reset<br>
                • This link can only be used once<br>
                • Consider using a strong, unique password
            </div>
            
            <div class="message">
                Having trouble? Copy and paste this link into your browser:<br>
                <a href="${data.resetUrl}" style="color: #ef4444; word-break: break-all;">
                    ${data.resetUrl}
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>This reset was requested for ${data.user.email}</p>
            <p>© 2024 Cosmic Platform - Your Security Matters</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Text Email Templates (fallback)

  private generateWelcomeEmailText(data: WelcomeEmailData): string {
    const displayName = data.user.displayName || data.user.username;
    
    return `
🌌 COSMIC PLATFORM - WELCOME!

Hello ${displayName}!

Welcome to Cosmic Platform! Your star system has been successfully created.

Every mind is a universe. Every share is a trace.

🚀 Get Started: ${data.loginUrl}

What you can do:
🪐 Create content across different planets (Mercury, Venus, Mars, Jupiter, Earth)
🌉 Build meaningful bridges between ideas
🌌 Join galaxy communities
🤖 Get AI insights from Aether

This email was sent to: ${data.user.email}

© 2024 Cosmic Platform - Open Source & Federated
`;
  }

  private generateVerificationEmailText(data: EmailVerificationData): string {
    const displayName = data.user.displayName || data.user.username;
    
    return `
🌟 ACTIVATE YOUR STAR SYSTEM

Hello ${displayName}!

Please verify your email address to complete your Cosmic Platform registration.

Verification Link: ${data.verificationUrl}

This link expires in 24 hours for security.

Once verified, you'll have full access to all platform features.

Email: ${data.user.email}
© 2024 Cosmic Platform
`;
  }

  private generatePasswordResetText(data: PasswordResetData): string {
    const displayName = data.user.displayName || data.user.username;
    
    return `
🔐 PASSWORD RESET REQUEST

Hello ${displayName}!

You requested a password reset for your Cosmic Platform account.

Reset Link: ${data.resetUrl}

This link expires in 1 hour for security.

If you didn't request this reset, please ignore this email.

Email: ${data.user.email}
© 2024 Cosmic Platform
`;
  }

  /**
   * Helper method to generate verification URL
   */
  static generateVerificationUrl(baseUrl: string, token: string): string {
    return `${baseUrl}/auth/verify-email?token=${token}`;
  }

  /**
   * Helper method to generate password reset URL
   */
  static generatePasswordResetUrl(baseUrl: string, token: string): string {
    return `${baseUrl}/auth/reset-password?token=${token}`;
  }

  /**
   * Helper method to generate login URL
   */
  static generateLoginUrl(baseUrl: string): string {
    return `${baseUrl}/auth/login`;
  }
}