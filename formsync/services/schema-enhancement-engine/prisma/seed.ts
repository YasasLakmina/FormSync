/**
 * Database Seed Script
 * 
 * Populates the database with example schemas for testing and demonstration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user (password: "demo1234" - bcrypt hash)
  const user = await prisma.user.upsert({
    where: { email: 'demo@formsync.com' },
    update: {},
    create: {
      email: 'demo@formsync.com',
      name: 'Demo User',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "demo1234"
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Example Schema 1: User Profile Form
  const userProfileSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'User Profile',
    description: 'A schema for user profile information',
    type: 'object',
    properties: {
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
      email: {
        type: 'string',
        title: 'Email Address',
        format: 'email',
        description: 'Contact email address',
      },
      age: {
        type: 'integer',
        title: 'Age',
        minimum: 18,
        maximum: 120,
      },
      phoneNumber: {
        type: 'string',
        title: 'Phone Number',
        pattern: '^[+]?[0-9]{10,15}$',
      },
      address: {
        type: 'object',
        title: 'Address',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
          zipCode: { type: 'string', pattern: '^[0-9]{5}$' },
        },
        required: ['city', 'country'],
      },
    },
    required: ['firstName', 'lastName', 'email'],
  };

  await prisma.schema.upsert({
    where: { id: 'user-profile-schema' },
    update: {},
    create: {
      id: 'user-profile-schema',
      name: 'User Profile Form',
      description: 'Standard user profile information schema',
      content: userProfileSchema,
      sourceFormat: 'json',
      tags: ['user', 'profile', 'form'],
      status: 'validated',
      userId: user.id,
      version: 1,
    },
  });

  await prisma.schemaVersion.create({
    data: {
      schemaId: 'user-profile-schema',
      version: 1,
      content: userProfileSchema,
      changeLog: 'Initial version',
    },
  });

  console.log('✅ Created User Profile schema');

  // Example Schema 2: Product Catalog
  const productSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Product',
    description: 'E-commerce product schema',
    type: 'object',
    properties: {
      sku: {
        type: 'string',
        title: 'SKU',
        description: 'Stock Keeping Unit',
        pattern: '^[A-Z0-9-]{8,}$',
      },
      name: {
        type: 'string',
        title: 'Product Name',
        minLength: 3,
        maxLength: 200,
      },
      description: {
        type: 'string',
        title: 'Description',
        maxLength: 2000,
      },
      price: {
        type: 'number',
        title: 'Price',
        minimum: 0,
        exclusiveMinimum: true,
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
      categories: {
        type: 'array',
        title: 'Categories',
        items: { type: 'string' },
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
    },
    required: ['sku', 'name', 'price', 'currency'],
  };

  await prisma.schema.upsert({
    where: { id: 'product-schema' },
    update: {},
    create: {
      id: 'product-schema',
      name: 'Product Catalog',
      description: 'Schema for e-commerce product data',
      content: productSchema,
      sourceFormat: 'json',
      tags: ['product', 'ecommerce', 'catalog'],
      status: 'published',
      userId: user.id,
      version: 1,
    },
  });

  await prisma.schemaVersion.create({
    data: {
      schemaId: 'product-schema',
      version: 1,
      content: productSchema,
      changeLog: 'Initial version',
    },
  });

  console.log('✅ Created Product Catalog schema');

  // Example Schema 3: Event Registration
  const eventSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Event Registration',
    description: 'Schema for event registration forms',
    type: 'object',
    properties: {
      eventId: {
        type: 'string',
        title: 'Event ID',
        format: 'uuid',
      },
      attendeeName: {
        type: 'string',
        title: 'Attendee Name',
        minLength: 2,
      },
      email: {
        type: 'string',
        title: 'Email',
        format: 'email',
      },
      ticketType: {
        type: 'string',
        title: 'Ticket Type',
        enum: ['standard', 'vip', 'student', 'early-bird'],
        default: 'standard',
      },
      dietaryRestrictions: {
        type: 'array',
        title: 'Dietary Restrictions',
        items: {
          type: 'string',
          enum: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'none'],
        },
      },
      specialNeeds: {
        type: 'string',
        title: 'Special Accessibility Needs',
        description: 'Please describe any accessibility requirements',
        maxLength: 500,
      },
      registrationDate: {
        type: 'string',
        title: 'Registration Date',
        format: 'date-time',
      },
    },
    required: ['eventId', 'attendeeName', 'email', 'ticketType'],
  };

  await prisma.schema.upsert({
    where: { id: 'event-registration-schema' },
    update: {},
    create: {
      id: 'event-registration-schema',
      name: 'Event Registration Form',
      description: 'Schema for event registration with accessibility support',
      content: eventSchema,
      sourceFormat: 'json',
      tags: ['event', 'registration', 'accessibility'],
      status: 'enhanced',
      userId: user.id,
      version: 1,
    },
  });

  await prisma.schemaVersion.create({
    data: {
      schemaId: 'event-registration-schema',
      version: 1,
      content: eventSchema,
      changeLog: 'Initial version with accessibility features',
    },
  });

  console.log('✅ Created Event Registration schema');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
