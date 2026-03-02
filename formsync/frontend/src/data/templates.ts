/**
 * Schema Templates Library
 * 
 * Pre-built, production-ready JSON Schema templates
 * for common use cases
 */

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  category: 'form' | 'api' | 'database' | 'general';
  schema: any;
  tags: string[];
  icon?: string;
}

export const schemaTemplates: SchemaTemplate[] = [
  // Form Templates
  {
    id: 'user-registration',
    name: 'User Registration Form',
    description: 'Complete user registration with email, password, and profile fields',
    category: 'form',
    tags: ['authentication', 'signup', 'user'],
    icon: '👤',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'User Registration',
      description: 'User registration form schema',
      properties: {
        username: {
          type: 'string',
          title: 'Username',
          description: 'Unique username for the account',
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_-]+$',
        },
        email: {
          type: 'string',
          title: 'Email Address',
          format: 'email',
          description: 'Valid email address',
        },
        password: {
          type: 'string',
          title: 'Password',
          minLength: 8,
          description: 'Strong password with at least 8 characters',
        },
        confirmPassword: {
          type: 'string',
          title: 'Confirm Password',
          description: 'Must match the password field',
        },
        firstName: {
          type: 'string',
          title: 'First Name',
          minLength: 1,
          maxLength: 50,
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
          minLength: 1,
          maxLength: 50,
        },
        dateOfBirth: {
          type: 'string',
          title: 'Date of Birth',
          format: 'date',
        },
        agreedToTerms: {
          type: 'boolean',
          title: 'I agree to the Terms and Conditions',
          const: true,
        },
      },
      required: ['username', 'email', 'password', 'confirmPassword', 'agreedToTerms'],
    },
  },

  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    category: 'form',
    tags: ['contact', 'support', 'inquiry'],
    icon: '✉️',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'Contact Form',
      properties: {
        name: {
          type: 'string',
          title: 'Full Name',
          minLength: 2,
          maxLength: 100,
        },
        email: {
          type: 'string',
          title: 'Email Address',
          format: 'email',
        },
        phone: {
          type: 'string',
          title: 'Phone Number',
          pattern: '^[0-9+\\s()-]+$',
        },
        subject: {
          type: 'string',
          title: 'Subject',
          minLength: 5,
          maxLength: 200,
        },
        message: {
          type: 'string',
          title: 'Message',
          minLength: 10,
          maxLength: 2000,
        },
        preferredContact: {
          type: 'string',
          title: 'Preferred Contact Method',
          enum: ['email', 'phone'],
          default: 'email',
        },
      },
      required: ['name', 'email', 'subject', 'message'],
    },
  },

  // E-Commerce Templates
  {
    id: 'product-catalog',
    name: 'E-Commerce Product',
    description: 'Product listing with pricing, inventory, and categories',
    category: 'general',
    tags: ['ecommerce', 'product', 'catalog'],
    icon: '🛍️',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'Product',
      properties: {
        name: {
          type: 'string',
          title: 'Product Name',
          minLength: 3,
          maxLength: 200,
        },
        description: {
          type: 'string',
          title: 'Description',
          maxLength: 5000,
        },
        sku: {
          type: 'string',
          title: 'SKU',
          description: 'Stock Keeping Unit',
          pattern: '^[A-Z0-9-]+$',
        },
        price: {
          type: 'number',
          title: 'Price',
          minimum: 0,
          multipleOf: 0.01,
        },
        currency: {
          type: 'string',
          title: 'Currency',
          enum: ['USD', 'EUR', 'GBP', 'JPY'],
          default: 'USD',
        },
        inStock: {
          type: 'boolean',
          title: 'In Stock',
          default: true,
        },
        quantity: {
          type: 'integer',
          title: 'Quantity Available',
          minimum: 0,
        },
        categories: {
          type: 'array',
          title: 'Categories',
          items: {
            type: 'string',
          },
          minItems: 1,
        },
        images: {
          type: 'array',
          title: 'Product Images',
          items: {
            type: 'string',
            format: 'uri',
          },
        },
        brand: {
          type: 'string',
          title: 'Brand',
        },
        weight: {
          type: 'number',
          title: 'Weight (kg)',
          minimum: 0,
        },
      },
      required: ['name', 'sku', 'price', 'categories'],
    },
  },

  // API Templates
  {
    id: 'api-user-profile',
    name: 'API User Profile',
    description: 'RESTful API user profile response schema',
    category: 'api',
    tags: ['api', 'user', 'profile', 'rest'],
    icon: '🔌',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'User Profile API Response',
      properties: {
        id: {
          type: 'string',
          title: 'User ID',
          format: 'uuid',
        },
        username: {
          type: 'string',
          title: 'Username',
        },
        email: {
          type: 'string',
          title: 'Email',
          format: 'email',
        },
        profile: {
          type: 'object',
          title: 'Profile Information',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            avatar: { type: 'string', format: 'uri' },
            bio: { type: 'string', maxLength: 500 },
            location: { type: 'string' },
          },
        },
        settings: {
          type: 'object',
          title: 'User Settings',
          properties: {
            emailNotifications: { type: 'boolean', default: true },
            theme: { type: 'string', enum: ['light', 'dark'], default: 'light' },
            language: { type: 'string', default: 'en' },
          },
        },
        createdAt: {
          type: 'string',
          title: 'Account Creation Date',
          format: 'date-time',
        },
        lastLogin: {
          type: 'string',
          title: 'Last Login',
          format: 'date-time',
        },
      },
      required: ['id', 'username', 'email', 'createdAt'],
    },
  },

  // Database Templates
  {
    id: 'database-user-model',
    name: 'Database User Model',
    description: 'User table schema for database design',
    category: 'database',
    tags: ['database', 'user', 'model', 'table'],
    icon: '🗄️',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'User Table Schema',
      properties: {
        id: {
          type: 'integer',
          title: 'Primary Key',
          description: 'Auto-incrementing primary key',
        },
        uuid: {
          type: 'string',
          title: 'UUID',
          format: 'uuid',
          description: 'Unique identifier for external use',
        },
        email: {
          type: 'string',
          title: 'Email',
          format: 'email',
          description: 'Unique email address',
        },
        passwordHash: {
          type: 'string',
          title: 'Password Hash',
          description: 'Hashed password (bcrypt)',
        },
        role: {
          type: 'string',
          title: 'User Role',
          enum: ['admin', 'moderator', 'user', 'guest'],
          default: 'user',
        },
        status: {
          type: 'string',
          title: 'Account Status',
          enum: ['active', 'suspended', 'deleted'],
          default: 'active',
        },
        emailVerified: {
          type: 'boolean',
          title: 'Email Verified',
          default: false,
        },
        createdAt: {
          type: 'string',
          title: 'Created At',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          title: 'Updated At',
          format: 'date-time',
        },
      },
      required: ['id', 'uuid', 'email', 'passwordHash', 'createdAt'],
    },
  },

  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Blog post with title, content, author, and metadata',
    category: 'general',
    tags: ['blog', 'content', 'cms'],
    icon: '📝',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'Blog Post',
      properties: {
        title: {
          type: 'string',
          title: 'Post Title',
          minLength: 5,
          maxLength: 200,
        },
        slug: {
          type: 'string',
          title: 'URL Slug',
          pattern: '^[a-z0-9-]+$',
        },
        content: {
          type: 'string',
          title: 'Post Content',
          description: 'Markdown or HTML content',
          minLength: 100,
        },
        excerpt: {
          type: 'string',
          title: 'Excerpt',
          maxLength: 300,
        },
        author: {
          type: 'object',
          title: 'Author',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
          required: ['id', 'name'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          items: { type: 'string' },
        },
        publishedAt: {
          type: 'string',
          title: 'Published Date',
          format: 'date-time',
        },
        status: {
          type: 'string',
          title: 'Status',
          enum: ['draft', 'published', 'archived'],
          default: 'draft',
        },
        featured: {
          type: 'boolean',
          title: 'Featured Post',
          default: false,
        },
      },
      required: ['title', 'slug', 'content', 'author'],
    },
  },

  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Event registration form with attendee details',
    category: 'form',
    tags: ['event', 'registration', 'booking'],
    icon: '🎫',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'Event Registration',
      properties: {
        eventId: {
          type: 'string',
          title: 'Event ID',
        },
        attendeeName: {
          type: 'string',
          title: 'Attendee Name',
          minLength: 2,
        },
        attendeeEmail: {
          type: 'string',
          title: 'Email',
          format: 'email',
        },
        ticketType: {
          type: 'string',
          title: 'Ticket Type',
          enum: ['general', 'vip', 'student', 'early-bird'],
        },
        numberOfTickets: {
          type: 'integer',
          title: 'Number of Tickets',
          minimum: 1,
          maximum: 10,
        },
        dietaryRequirements: {
          type: 'string',
          title: 'Dietary Requirements',
        },
        specialNeeds: {
          type: 'string',
          title: 'Special Needs/Accessibility',
        },
        emergencyContact: {
          type: 'object',
          title: 'Emergency Contact',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            relationship: { type: 'string' },
          },
          required: ['name', 'phone'],
        },
      },
      required: ['eventId', 'attendeeName', 'attendeeEmail', 'ticketType', 'numberOfTickets'],
    },
  },
];

/**
 * Get all templates
 */
export const getAllTemplates = (): SchemaTemplate[] => {
  return schemaTemplates;
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: SchemaTemplate['category']): SchemaTemplate[] => {
  return schemaTemplates.filter((t) => t.category === category);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): SchemaTemplate | undefined => {
  return schemaTemplates.find((t) => t.id === id);
};

/**
 * Search templates by name or tags
 */
export const searchTemplates = (query: string): SchemaTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return schemaTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
