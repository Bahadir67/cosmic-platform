// src/schemas/__tests__/auth.schemas.test.ts
import {
  RegisterSchema,
  LoginSchema,
  EmailVerificationSchema,
  PasswordResetRequestSchema,
  PasswordResetSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
  CreateContentSchema,
  UpdateContentSchema,
  CreatePlanetSchema,
  UpdatePlanetSchema,
  CreateBridgeSchema,
  CreateGalaxySchema,
  UpdateGalaxySchema,
  JoinGalaxySchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  CreateReactionSchema,
  PaginationSchema,
  SearchSchema,
  ContentFilterSchema,
  FileUploadSchema,
  validateRequest,
  validateRequestAsync,
  ValidationUtils
} from '../auth.schemas';

describe('Authentication Schemas', () => {
  
  describe('RegisterSchema', () => {
    const validRegisterData = {
      username: 'starexplorer',
      email: 'star@cosmic.dev',
      password: 'CosmicPass123!',
      displayName: 'Star Explorer',
      bio: 'Exploring the cosmic universe'
    };

    test('should validate valid registration data', () => {
      const result = RegisterSchema.parse(validRegisterData);
      expect(result).toEqual({
        ...validRegisterData,
        username: 'starexplorer', // lowercase
        email: 'star@cosmic.dev'   // lowercase
      });
    });

    test('should reject invalid username formats', () => {
      const invalidUsernames = [
        'ab',           // too short
        'user with spaces', // contains spaces
        'user@symbol',  // contains @
        'a'.repeat(31), // too long
        ''              // empty
      ];

      invalidUsernames.forEach(username => {
        expect(() => RegisterSchema.parse({
          ...validRegisterData,
          username
        })).toThrow();
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user.domain.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(() => RegisterSchema.parse({
          ...validRegisterData,
          email
        })).toThrow();
      });
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'short',        // too short
        'nouppercase1!', // no uppercase
        'NOLOWERCASE1!', // no lowercase
        'NoNumbers!',   // no numbers
        'NoSpecial123', // no special characters
        'a'.repeat(130) // too long
      ];

      weakPasswords.forEach(password => {
        expect(() => RegisterSchema.parse({
          ...validRegisterData,
          password
        })).toThrow();
      });
    });

    test('should validate without optional fields', () => {
      const minimalData = {
        username: 'staruser',
        email: 'star@cosmic.dev',
        password: 'ValidPass123!'
      };

      const result = RegisterSchema.parse(minimalData);
      expect(result.displayName).toBeUndefined();
      expect(result.bio).toBeUndefined();
    });

    test('should reject extra fields', () => {
      expect(() => RegisterSchema.parse({
        ...validRegisterData,
        extraField: 'not allowed'
      })).toThrow();
    });

    test('should trim and lowercase username and email', () => {
      const testData = {
        username: '  starexplorer  ',
        email: '  star@cosmic.dev  ',
        password: 'CosmicPass123!',
        displayName: 'Star Explorer',
        bio: 'Exploring the cosmic universe'
      };

      const result = RegisterSchema.parse(testData);

      expect(result.username).toBe('starexplorer');
      expect(result.email).toBe('star@cosmic.dev');
    });
  });

  describe('LoginSchema', () => {
    const validLoginData = {
      email: 'user@cosmic.dev',
      password: 'anypassword'
    };

    test('should validate valid login data', () => {
      const result = LoginSchema.parse(validLoginData);
      expect(result.email).toBe('user@cosmic.dev');
      expect(result.password).toBe('anypassword');
    });

    test('should reject invalid email in login', () => {
      expect(() => LoginSchema.parse({
        ...validLoginData,
        email: 'invalid-email'
      })).toThrow();
    });

    test('should reject empty password', () => {
      expect(() => LoginSchema.parse({
        ...validLoginData,
        password: ''
      })).toThrow();
    });

    test('should not validate password strength in login', () => {
      // Login should accept any non-empty password (validation is for registration)
      const result = LoginSchema.parse({
        ...validLoginData,
        password: 'weak'
      });
      expect(result.password).toBe('weak');
    });
  });

  describe('PasswordResetSchema', () => {
    test('should validate password reset data', () => {
      const data = {
        token: 'valid_reset_token',
        newPassword: 'NewCosmicPass123!'
      };

      const result = PasswordResetSchema.parse(data);
      expect(result.token).toBe('valid_reset_token');
      expect(result.newPassword).toBe('NewCosmicPass123!');
    });

    test('should reject weak new password', () => {
      expect(() => PasswordResetSchema.parse({
        token: 'valid_token',
        newPassword: 'weak'
      })).toThrow();
    });
  });
});

describe('Content Schemas', () => {
  
  describe('CreateContentSchema', () => {
    const validContentData = {
      contentType: 'layer' as const,
      title: 'My Cosmic Thoughts',
      body: 'This is the content body',
      tags: ['cosmic', 'thoughts', 'space'],
      mediaUrls: ['https://example.com/image.jpg'],
      visibility: 'public' as const
    };

    test('should validate valid content data', () => {
      const result = CreateContentSchema.parse(validContentData);
      expect(result.title).toBe('My Cosmic Thoughts');
      expect(result.tags).toEqual(['cosmic', 'thoughts', 'space']);
    });

    test('should reject invalid content type', () => {
      expect(() => CreateContentSchema.parse({
        ...validContentData,
        contentType: 'invalid'
      })).toThrow();
    });

    test('should reject too many tags', () => {
      expect(() => CreateContentSchema.parse({
        ...validContentData,
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`)
      })).toThrow();
    });

    test('should reject invalid tag format', () => {
      expect(() => CreateContentSchema.parse({
        ...validContentData,
        tags: ['valid-tag', 'invalid tag with spaces']
      })).toThrow();
    });

    test('should reject too many media URLs', () => {
      expect(() => CreateContentSchema.parse({
        ...validContentData,
        mediaUrls: Array.from({ length: 6 }, () => 'https://example.com/file.jpg')
      })).toThrow();
    });

    test('should reject invalid media URLs', () => {
      expect(() => CreateContentSchema.parse({
        ...validContentData,
        mediaUrls: ['not-a-url', 'https://valid.com/image.jpg']
      })).toThrow();
    });

    test('should validate minimal content', () => {
      const minimal = {
        contentType: 'satellite' as const,
        title: 'Minimal Content'
      };

      const result = CreateContentSchema.parse(minimal);
      expect(result.title).toBe('Minimal Content');
      expect(result.tags).toEqual([]);
      expect(result.mediaUrls).toEqual([]);
      expect(result.visibility).toBe('public');
    });
  });

  describe('CreatePlanetSchema', () => {
    const validPlanetData = {
      planetType: 'venus' as const,
      name: 'My Venus Planet',
      description: 'Personal content and thoughts',
      colorScheme: '#6366f1'
    };

    test('should validate valid planet data', () => {
      const result = CreatePlanetSchema.parse(validPlanetData);
      expect(result.planetType).toBe('venus');
      expect(result.name).toBe('My Venus Planet');
    });

    test('should reject invalid planet type', () => {
      expect(() => CreatePlanetSchema.parse({
        ...validPlanetData,
        planetType: 'pluto'
      })).toThrow();
    });

    test('should reject invalid color scheme', () => {
      expect(() => CreatePlanetSchema.parse({
        ...validPlanetData,
        colorScheme: 'blue' // should be hex
      })).toThrow();

      expect(() => CreatePlanetSchema.parse({
        ...validPlanetData,
        colorScheme: '#gggggg' // invalid hex
      })).toThrow();
    });

    test('should validate without optional fields', () => {
      const minimal = {
        planetType: 'mercury' as const,
        name: 'Mercury'
      };

      const result = CreatePlanetSchema.parse(minimal);
      expect(result.name).toBe('Mercury');
      expect(result.description).toBeUndefined();
    });
  });

  describe('CreateBridgeSchema', () => {
    const validBridgeData = {
      fromContentId: 'cuid_content_1',
      toContentId: 'cuid_content_2',
      bridgeType: 'reference' as const,
      description: 'This references that content',
      strength: 0.8
    };

    test('should validate valid bridge data', () => {
      const result = CreateBridgeSchema.parse(validBridgeData);
      expect(result.bridgeType).toBe('reference');
      expect(result.strength).toBe(0.8);
    });

    test('should reject self-referencing bridge', () => {
      expect(() => CreateBridgeSchema.parse({
        ...validBridgeData,
        toContentId: validBridgeData.fromContentId
      })).toThrow();
    });

    test('should reject invalid strength values', () => {
      expect(() => CreateBridgeSchema.parse({
        ...validBridgeData,
        strength: -0.1
      })).toThrow();

      expect(() => CreateBridgeSchema.parse({
        ...validBridgeData,
        strength: 1.1
      })).toThrow();
    });

    test('should use default strength', () => {
      const { strength, ...dataWithoutStrength } = validBridgeData;
      const result = CreateBridgeSchema.parse(dataWithoutStrength);
      expect(result.strength).toBe(1.0);
    });
  });
});

describe('Galaxy Schemas', () => {
  
  describe('CreateGalaxySchema', () => {
    const validGalaxyData = {
      name: 'Cosmic Explorers',
      description: 'A community of space enthusiasts',
      isPublic: true,
      governanceType: 'democratic' as const
    };

    test('should validate valid galaxy data', () => {
      const result = CreateGalaxySchema.parse(validGalaxyData);
      expect(result.name).toBe('Cosmic Explorers');
      expect(result.governanceType).toBe('democratic');
    });

    test('should reject invalid galaxy name', () => {
      expect(() => CreateGalaxySchema.parse({
        ...validGalaxyData,
        name: 'ab' // too short
      })).toThrow();

      expect(() => CreateGalaxySchema.parse({
        ...validGalaxyData,
        name: 'Invalid@Name' // invalid character
      })).toThrow();
    });

    test('should use default values', () => {
      const minimal = { name: 'Test Galaxy' };
      const result = CreateGalaxySchema.parse(minimal);
      expect(result.isPublic).toBe(true);
      expect(result.governanceType).toBe('democratic');
    });
  });
});

describe('Query and Search Schemas', () => {
  
  describe('PaginationSchema', () => {
    test('should validate pagination parameters', () => {
      const data = { page: '2', limit: '50' };
      const result = PaginationSchema.parse(data);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    test('should use default values', () => {
      const result = PaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    test('should reject invalid pagination', () => {
      expect(() => PaginationSchema.parse({ page: '0' })).toThrow();
      expect(() => PaginationSchema.parse({ limit: '101' })).toThrow();
    });
  });

  describe('SearchSchema', () => {
    test('should validate search parameters', () => {
      const data = {
        q: 'cosmic exploration',
        tags: 'space,science,astronomy',
        contentType: 'layer',
        sortBy: 'popularity',
        page: '2'
      };

      const result = SearchSchema.parse(data);
      expect(result.q).toBe('cosmic exploration');
      expect(result.tags).toEqual(['space', 'science', 'astronomy']);
      expect(result.sortBy).toBe('popularity');
    });

    test('should handle empty tags gracefully', () => {
      const result = SearchSchema.parse({ tags: '' });
      expect(result.tags).toEqual([]);
    });
  });

  describe('ContentFilterSchema', () => {
    test('should validate date range', () => {
      const validData = {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      };

      const result = ContentFilterSchema.parse(validData);
      expect(result.dateFrom).toBeInstanceOf(Date);
      expect(result.dateTo).toBeInstanceOf(Date);
    });

    test('should reject invalid date range', () => {
      expect(() => ContentFilterSchema.parse({
        dateFrom: '2024-12-31',
        dateTo: '2024-01-01'
      })).toThrow();
    });
  });
});

describe('Validation Helper Functions', () => {
  
  describe('validateRequest', () => {
    test('should validate and return parsed data', () => {
      const data = {
        email: 'test@cosmic.dev',
        password: 'ValidPass123!'
      };

      const result = validateRequest(LoginSchema, data);
      expect(result.email).toBe('test@cosmic.dev');
    });

    test('should throw formatted error for invalid data', () => {
      const data = {
        email: 'invalid-email',
        password: ''
      };

      expect(() => validateRequest(LoginSchema, data)).toThrow('Validation failed');
    });
  });

  describe('validateRequestAsync', () => {
    test('should resolve with valid data', async () => {
      const data = {
        email: 'test@cosmic.dev',
        password: 'password'
      };

      const result = await validateRequestAsync(LoginSchema, data);
      expect(result.email).toBe('test@cosmic.dev');
    });

    test('should reject with validation error', async () => {
      const data = { email: 'invalid' };

      await expect(validateRequestAsync(LoginSchema, data))
        .rejects.toThrow('Validation failed');
    });
  });
});

describe('ValidationUtils', () => {
  
  describe('Username validation', () => {
    test('should validate correct username formats', () => {
      const validUsernames = ['user123', 'star_explorer', 'cosmic-user'];
      validUsernames.forEach(username => {
        expect(ValidationUtils.isUsernameFormat(username)).toBe(true);
      });
    });

    test('should reject invalid username formats', () => {
      const invalidUsernames = ['ab', 'user@name', 'user with spaces'];
      invalidUsernames.forEach(username => {
        expect(ValidationUtils.isUsernameFormat(username)).toBe(false);
      });
    });
  });

  describe('Email validation', () => {
    test('should validate correct email formats', () => {
      const validEmails = ['user@domain.com', 'test.email@cosmic.dev'];
      validEmails.forEach(email => {
        expect(ValidationUtils.isEmailFormat(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = ['invalid-email', '@domain.com', 'user@'];
      invalidEmails.forEach(email => {
        expect(ValidationUtils.isEmailFormat(email)).toBe(false);
      });
    });
  });

  describe('Password strength', () => {
    test('should validate strong passwords', () => {
      const strongPasswords = ['StrongPass123!', 'Complex$Pass99'];
      strongPasswords.forEach(password => {
        expect(ValidationUtils.isPasswordStrong(password)).toBe(true);
      });
    });

    test('should reject weak passwords', () => {
      const weakPasswords = ['weak', 'nouppercase123!', 'NOLOWERCASE123!'];
      weakPasswords.forEach(password => {
        expect(ValidationUtils.isPasswordStrong(password)).toBe(false);
      });
    });

    test('should calculate password strength score', () => {
      expect(ValidationUtils.getPasswordStrength('weak')).toBeLessThan(50);
      expect(ValidationUtils.getPasswordStrength('StrongPass123!')).toBeGreaterThan(80);
      expect(ValidationUtils.getPasswordStrength('VeryComplexP@ssw0rd!')).toBe(100);
    });
  });

  describe('HTML sanitization', () => {
    test('should remove dangerous script tags', () => {
      const maliciousHtml = '<p>Safe content</p><script>alert("xss")</script>';
      const sanitized = ValidationUtils.sanitizeHtml(maliciousHtml);
      expect(sanitized).toBe('<p>Safe content</p>');
      expect(sanitized).not.toContain('script');
    });

    test('should remove iframe tags', () => {
      const htmlWithIframe = '<p>Content</p><iframe src="malicious.com"></iframe>';
      const sanitized = ValidationUtils.sanitizeHtml(htmlWithIframe);
      expect(sanitized).toBe('<p>Content</p>');
    });

    test('should remove javascript: URLs', () => {
      const maliciousLink = '<a href="javascript:alert(1)">Link</a>';
      const sanitized = ValidationUtils.sanitizeHtml(maliciousLink);
      expect(sanitized).not.toContain('javascript:');
    });

    test('should remove event handlers', () => {
      const htmlWithEvents = '<button onclick="alert(1)">Click</button>';
      const sanitized = ValidationUtils.sanitizeHtml(htmlWithEvents);
      expect(sanitized).not.toContain('onclick');
    });
  });

  describe('Tag cleaning', () => {
    test('should clean and deduplicate tags', () => {
      const messyTags = ['  Space  ', 'COSMIC', 'space', 'astronomy', 'Space'];
      const cleaned = ValidationUtils.cleanTags(messyTags);
      expect(cleaned).toEqual(['space', 'cosmic', 'astronomy']);
    });

    test('should limit to 10 tags', () => {
      const tooManyTags = Array.from({ length: 15 }, (_, i) => `tag${i}`);
      const cleaned = ValidationUtils.cleanTags(tooManyTags);
      expect(cleaned).toHaveLength(10);
    });

    test('should remove empty tags', () => {
      const tagsWithEmpty = ['valid', '', '   ', 'another'];
      const cleaned = ValidationUtils.cleanTags(tagsWithEmpty);
      expect(cleaned).toEqual(['valid', 'another']);
    });
  });
});

describe('File Upload Schema', () => {
  
  test('should validate file upload data', () => {
    const fileData = {
      filename: 'cosmic-image.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 1024 // 1MB
    };

    const result = FileUploadSchema.parse(fileData);
    expect(result.filename).toBe('cosmic-image.jpg');
    expect(result.mimetype).toBe('image/jpeg');
  });

  test('should reject files that are too large', () => {
    const oversizedFile = {
      filename: 'large-file.mp4',
      mimetype: 'video/mp4',
      size: 60 * 1024 * 1024 // 60MB
    };

    expect(() => FileUploadSchema.parse(oversizedFile)).toThrow();
  });

  test('should reject invalid filenames', () => {
    const invalidFile = {
      filename: 'file with spaces.jpg',
      mimetype: 'image/jpeg',
      size: 1024
    };

    expect(() => FileUploadSchema.parse(invalidFile)).toThrow();
  });

  test('should reject invalid mime types', () => {
    const invalidMimeFile = {
      filename: 'document.txt',
      mimetype: 'text/executable', // invalid - should be text/plain
      size: 1024
    };

    expect(() => FileUploadSchema.parse(invalidMimeFile)).toThrow();
  });
});

describe('Security and Edge Cases', () => {
  
  test('should handle unicode characters in usernames', () => {
    expect(() => RegisterSchema.parse({
      username: 'user🌌star',
      email: 'test@cosmic.dev',
      password: 'ValidPass123!'
    })).toThrow(); // Should reject unicode in username
  });

  test('should handle very long email addresses', () => {
    const longEmail = 'a'.repeat(310) + '@cosmic.dev'; // Over 320 char limit
    expect(() => RegisterSchema.parse({
      username: 'testuser',
      email: longEmail,
      password: 'ValidPass123!'
    })).toThrow();
  });

  test('should handle empty string attacks', () => {
    expect(() => CreateContentSchema.parse({
      contentType: 'layer',
      title: '', // Empty title should fail
    })).toThrow();
  });

  test('should handle null injection attempts', () => {
    expect(() => RegisterSchema.parse({
      username: 'user\0name',
      email: 'test@cosmic.dev',
      password: 'ValidPass123!'
    })).toThrow();
  });

  test('should handle SQL injection patterns', () => {
    const sqlInjection = "'; DROP TABLE users; --";
    expect(() => CreateCommentSchema.parse({
      contentId: 'cuid_content_1',
      body: sqlInjection
    })).not.toThrow(); // Should parse but will be sanitized later
  });
});

// Performance tests
describe('Validation Performance', () => {
  
  test('should validate large datasets efficiently', () => {
    const startTime = Date.now();
    
    // Validate 1000 user registrations
    for (let i = 0; i < 1000; i++) {
      RegisterSchema.parse({
        username: `user${i}`,
        email: `user${i}@cosmic.dev`,
        password: 'ValidPass123!'
      });
    }
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
  });

  test('should handle complex nested validation quickly', () => {
    const complexData = {
      contentType: 'layer' as const,
      title: 'Complex Content',
      body: 'A'.repeat(10000), // Large body
      tags: Array.from({ length: 10 }, (_, i) => `tag${i}`),
      mediaUrls: Array.from({ length: 5 }, () => 'https://example.com/file.jpg'),
      visibility: 'public' as const
    };

    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      CreateContentSchema.parse(complexData);
    }
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(100); // Should be very fast
  });
});