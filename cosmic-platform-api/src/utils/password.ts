// src/utils/password.ts - FIXED
import bcrypt from 'bcrypt';

/**
 * 🔐 Password Utility
 * Handles password hashing and verification using bcrypt
 */
export class PasswordUtil {
  private readonly saltRounds = 12;

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
  }

  /**
   * Verify a password against its hash
   * @param password - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns True if password matches, false otherwise
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Failed to verify password: ${error.message}`);
    }
  }

  /**
   * Check password strength
   * @param password - Password to check
   * @returns Strength score (0-100) and requirements
   */
  checkPasswordStrength(password: string): {
    score: number;
    requirements: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
      special: boolean;
    };
    feedback: string[];
  } {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const score = Math.min(100, (metRequirements / 5) * 100);

    const feedback: string[] = [];
    if (!requirements.length) feedback.push('Password must be at least 8 characters long');
    if (!requirements.uppercase) feedback.push('Add at least one uppercase letter');
    if (!requirements.lowercase) feedback.push('Add at least one lowercase letter');
    if (!requirements.number) feedback.push('Add at least one number');
    if (!requirements.special) feedback.push('Add at least one special character');

    return {
      score,
      requirements,
      feedback
    };
  }

  /**
   * Generate a random secure password
   * @param length - Length of password (default: 16)
   * @returns Generated secure password
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + special;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}