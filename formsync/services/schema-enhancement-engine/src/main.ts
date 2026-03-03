/**
 * Main entry point for the NestJS application
 * 
 * Bootstraps the NestJS app with global configuration:
 * - CORS enabled for frontend communication
 * - Global validation pipes for DTO validation
 * - Swagger/OpenAPI documentation
 */

// Register tsconfig paths for module resolution
import 'tsconfig-paths/register';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (allow all localhost ports in development)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Allow all localhost origins in development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // In production, use env variable
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Global validation pipe for automatic DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
    })
  );

  // Swagger/OpenAPI documentation setup
  const config = new DocumentBuilder()
    .setTitle('FormSync Schema API')
    .setDescription(
      'Component 1: Intelligent Schema Definition & AI Integration API\n\n' +
      'This API provides endpoints for schema conversion, validation, AI enhancement, and CRUD operations.'
    )
    .setVersion('1.0')
    .addTag('schema', 'Schema CRUD operations')
    .addTag('conversion', 'Format conversion endpoints')
    .addTag('validation', 'Schema validation endpoints')
    .addTag('ai', 'AI-powered schema enhancement')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.SCHEMA_ENGINE_PORT || 3010;
  await app.listen(port);

  console.log(`🚀 FormSync Schema API running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
