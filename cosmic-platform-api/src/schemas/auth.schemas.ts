// src/schemas/auth.schemas.ts
import { z } from 'zod';

// Common validation patterns
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email format')
  .min(3, 'Email must be at least 3 characters')
  .max(320, 'Email must be less than 320 characters');

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

const displayNameSchema = z
  .string()
  .min(1, 'Display name cannot be empty')
  .max(50, 'Display name must be less than 50 characters')
  .trim()
  .optional();

const bioSchema = z
  .string()
  .max(500, 'Bio must be less than 500 characters')
  .trim()
  .optional();

// Authentication Schemas

export const RegisterSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
}).strict();

export const LoginSchema = z.object({
  identifier: z.string()
    .min(1, 'Username or email is required')
    .trim()
    .toLowerCase(), // Can be username or email
  password: z.string().min(1, 'Password is required'),
}).strict();

export const EmailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
}).strict();

export const PasswordResetRequestSchema = z.object({
  email: emailSchema,
}).strict();

export const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
}).strict();

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
}).strict();

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
}).strict();

export const UpdateProfileSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema,
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
}).strict();

// Content Schemas

const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters')
  .trim();

const bodySchema = z
  .string()
  .max(50000, 'Content body must be less than 50,000 characters')
  .trim()
  .optional();

const tagsSchema = z
  .array(
    z.string()
      .min(1, 'Tag cannot be empty')
      .max(30, 'Tag must be less than 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Tags can only contain letters, numbers, hyphens, and underscores')
      .toLowerCase()
      .trim()
  )
  .max(10, 'Maximum 10 tags allowed')
  .optional()
  .default([]);

const mediaUrlsSchema = z
  .array(z.string().url('Invalid media URL'))
  .max(5, 'Maximum 5 media files allowed')
  .optional()
  .default([]);

const visibilitySchema = z
  .enum(['public', 'galaxy', 'private'], {
    errorMap: () => ({ message: 'Visibility must be public, galaxy, or private' })
  })
  .default('public');

const planetTypeSchema = z
  .enum(['mercury', 'venus', 'mars', 'jupiter', 'earth', 'kronos'], {
    errorMap: () => ({ message: 'Invalid planet type' })
  });

const contentTypeSchema = z
  .enum(['layer', 'satellite'], {
    errorMap: () => ({ message: 'Content type must be layer or satellite' })
  });

export const CreateContentSchema = z.object({
  planetId: z.string().cuid('Invalid planet ID').optional(),
  contentType: contentTypeSchema,
  title: titleSchema,
  body: bodySchema,
  tags: tagsSchema,
  mediaUrls: mediaUrlsSchema,
  visibility: visibilitySchema,
}).strict();

export const UpdateContentSchema = z.object({
  title: titleSchema.optional(),
  body: bodySchema,
  tags: tagsSchema,
  mediaUrls: mediaUrlsSchema,
  visibility: visibilitySchema.optional(),
}).strict();

// Planet Schemas

export const CreatePlanetSchema = z.object({
  planetType: planetTypeSchema,
  name: z.string()
    .min(1, 'Planet name is required')
    .max(50, 'Planet name must be less than 50 characters')
    .trim(),
  description: z.string()
    .max(500, 'Planet description must be less than 500 characters')
    .trim()
    .optional(),
  colorScheme: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color scheme must be a valid hex color')
    .optional(),
}).strict();

export const UpdatePlanetSchema = z.object({
  name: z.string()
    .min(1, 'Planet name is required')
    .max(50, 'Planet name must be less than 50 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(500, 'Planet description must be less than 500 characters')
    .trim()
    .optional(),
  colorScheme: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color scheme must be a valid hex color')
    .optional(),
  isActive: z.boolean().optional(),
}).strict();

// Bridge Schemas

const bridgeTypeSchema = z
  .enum(['reference', 'inspiration', 'contrast', 'update', 'debate'], {
    errorMap: () => ({ message: 'Invalid bridge type' })
  });

export const CreateBridgeSchema = z.object({
  fromContentId: z.string().cuid('Invalid source content ID'),
  toContentId: z.string().cuid('Invalid target content ID'),
  bridgeType: bridgeTypeSchema,
  description: z.string()
    .max(500, 'Bridge description must be less than 500 characters')
    .trim()
    .optional(),
  strength: z.number()
    .min(0, 'Bridge strength must be between 0 and 1')
    .max(1, 'Bridge strength must be between 0 and 1')
    .default(1.0),
}).strict()
.refine(data => data.fromContentId !== data.toContentId, {
  message: 'Cannot create bridge from content to itself',
  path: ['toContentId']
});

// Galaxy Schemas

const governanceTypeSchema = z
  .enum(['democratic', 'meritocratic', 'consensus', 'anarchy'], {
    errorMap: () => ({ message: 'Invalid governance type' })
  })
  .default('democratic');

const galaxyRoleSchema = z
  .enum(['member', 'moderator', 'admin'], {
    errorMap: () => ({ message: 'Invalid galaxy role' })
  })
  .default('member');

export const CreateGalaxySchema = z.object({
  name: z.string()
    .min(3, 'Galaxy name must be at least 3 characters')
    .max(50, 'Galaxy name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Galaxy name can only contain letters, numbers, spaces, hyphens, and underscores')
    .trim(),
  description: z.string()
    .max(1000, 'Galaxy description must be less than 1000 characters')
    .trim()
    .optional(),
  isPublic: z.boolean().default(true),
  governanceType: governanceTypeSchema,
}).strict();

export const UpdateGalaxySchema = z.object({
  name: z.string()
    .min(3, 'Galaxy name must be at least 3 characters')
    .max(50, 'Galaxy name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Galaxy name can only contain letters, numbers, spaces, hyphens, and underscores')
    .trim()
    .optional(),
  description: z.string()
    .max(1000, 'Galaxy description must be less than 1000 characters')
    .trim()
    .optional(),
  isPublic: z.boolean().optional(),
  governanceType: governanceTypeSchema.optional(),
}).strict();

export const JoinGalaxySchema = z.object({
  galaxyId: z.string().cuid('Invalid galaxy ID'),
}).strict();

export const UpdateGalaxyMemberSchema = z.object({
  role: galaxyRoleSchema,
}).strict();

// Comment Schemas

export const CreateCommentSchema = z.object({
  contentId: z.string().cuid('Invalid content ID'),
  body: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
  parentId: z.string().cuid('Invalid parent comment ID').optional(),
}).strict();

export const UpdateCommentSchema = z.object({
  body: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
}).strict();

// Reaction Schemas

const reactionTypeSchema = z
  .enum(['like', 'love', 'mind_blown', 'insightful', 'helpful', 'disagree'], {
    errorMap: () => ({ message: 'Invalid reaction type' })
  });

export const CreateReactionSchema = z.object({
  contentId: z.string().cuid('Invalid content ID'),
  reactionType: reactionTypeSchema,
}).strict();

// Query Parameter Schemas

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
}).strict();

export const SearchSchema = z.object({
  q: z.string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query must be less than 100 characters')
    .trim()
    .optional(),
  tags: z.string()
    .transform(str => str ? str.split(',').map(tag => tag.trim().toLowerCase()) : [])
    .optional(),
  contentType: contentTypeSchema.optional(),
  planetType: planetTypeSchema.optional(),
  visibility: visibilitySchema.optional(),
  sortBy: z.enum(['created', 'updated', 'popularity', 'relevance']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).merge(PaginationSchema);

export const ContentFilterSchema = z.object({
  starSystemId: z.string().cuid('Invalid star system ID').optional(),
  planetId: z.string().cuid('Invalid planet ID').optional(),
  galaxyId: z.string().cuid('Invalid galaxy ID').optional(),
  contentType: contentTypeSchema.optional(),
  visibility: visibilitySchema.optional(),
  tags: z.string()
    .transform(str => str ? str.split(',').map(tag => tag.trim().toLowerCase()) : [])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
}).merge(PaginationSchema)
.refine(data => {
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom <= data.dateTo;
  }
  return true;
}, {
  message: 'Date from must be before date to',
  path: ['dateTo']
});

// File Upload Schemas

export const FileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be less than 255 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters'),
  mimetype: z.string()
    .regex(/^(image|video|audio|application)\/.+/, 'Invalid file type'),
  size: z.number()
    .int()
    .min(1, 'File size must be greater than 0')
    .max(50 * 1024 * 1024, 'File size cannot exceed 50MB'), // 50MB limit
}).strict();

// Validation helper functions

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw error;
  }
}

export function validateRequestAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const result = validateRequest(schema, data);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// Custom validation utilities

export const ValidationUtils = {
  /**
   * Check if username is available (to be used with database check)
   */
  isUsernameFormat: (username: string): boolean => {
    return usernameSchema.safeParse(username).success;
  },

  /**
   * Check if email format is valid
   */
  isEmailFormat: (email: string): boolean => {
    return emailSchema.safeParse(email).success;
  },

  /**
   * Check if password meets requirements
   */
  isPasswordStrong: (password: string): boolean => {
    return passwordSchema.safeParse(password).success;
  },

  /**
   * Get password strength score (0-100)
   */
  getPasswordStrength: (password: string): number => {
    let score = 0;
    
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    
    return Math.min(score, 100);
  },

  /**
   * Sanitize HTML content
   */
  sanitizeHtml: (html: string): string => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .trim();
  },

  /**
   * Clean and validate tags
   */
  cleanTags: (tags: string[]): string[] => {
    return tags
      .filter(tag => tag.trim().length > 0)
      .map(tag => tag.toLowerCase().trim())
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      .slice(0, 10); // Max 10 tags
  }
};

// Type exports for use in controllers
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type CreateContentRequest = z.infer<typeof CreateContentSchema>;
export type UpdateContentRequest = z.infer<typeof UpdateContentSchema>;
export type CreatePlanetRequest = z.infer<typeof CreatePlanetSchema>;
export type CreateGalaxyRequest = z.infer<typeof CreateGalaxySchema>;
export type SearchRequest = z.infer<typeof SearchSchema>;
export type ContentFilterRequest = z.infer<typeof ContentFilterSchema>;