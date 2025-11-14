# Backend-DTO Generator

A schema-driven backend generator component for Spring Boot.

## Overview

This library takes a platform-agnostic JSON schema and generates a complete backend persistence layer including:
- **JPA Entities**: Mapped to PostgreSQL tables.
- **DTOs**: With Jakarta Bean Validation constraints and security annotations.
- **Repositories**: Spring Data JPA interfaces.
- **Services**: Basic CRUD operations with injection safety logic.
- **Security Artifacts**: Custom annotations for PII and XSS (@NoHtml) protection.

## Usage

### 1. Installation
\`\`\`bash
npm install
npm run build
\`\`\`

### 2. Programmatic Usage
\`\`\`typescript
import { generateBackendFromSchema, EntitySchema } from 'backend-dto';

const schema: EntitySchema = {
    entityName: 'User',
    packageName: 'com.example.demo',
    fields: [
        { name: 'username', type: 'STRING', nullable: false, minLength: 5 }
    ]
};

const result = await generateBackendFromSchema(schema);
console.log(result.model.content); // Generated Java code
\`\`\`
