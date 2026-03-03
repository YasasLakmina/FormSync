# FormSync Schema API

NestJS backend for FormSync Component 1 - Intelligent Schema Definition & AI Integration.

## Features

- **Plugin Architecture**: Extensible parsers, validators, and LLM providers
- **REST API**: Full CRUD + conversion, validation, and AI enhancement
- **PostgreSQL**: Schema storage with versioning
- **Redis**: Result caching for performance
- **OpenAPI**: Interactive API documentation at `/api/docs`

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with examples
npm run prisma:seed

# Start development server
npm run dev

# Run tests
npm test
```

## Environment Variables

See `../../.env.example` for required configuration.

## API Documentation

Start the server and visit: http://localhost:3000/api/docs

## Plugin Development

### Format Parser Plugin

Implement `FormatParserPlugin` from `@formsync/plugins`:

```typescript
import { FormatParserPlugin, ParseResult } from '@formsync/plugins';

export class MyParserPlugin implements FormatParserPlugin {
  readonly name = 'my-parser';
  
  canParse(input: string): boolean {
    // Detection logic
  }
  
  async parse(input: string): Promise<ParseResult> {
    // Conversion logic
  }
  
  getSupportedFormats(): string[] {
    return ['myformat'];
  }
}
```

Register in `src/plugins/plugins.module.ts`.

### Validator Plugin

Similar pattern for `SchemaValidatorPlugin`.

### LLM Provider Plugin

Similar pattern for `LLMProviderPlugin`.

## Database Schema

- **User**: User accounts
- **Schema**: JSON Schema storage with metadata
- **SchemaVersion**: Version history

## Caching Strategy

Redis caches:
- Conversion results (1 hour TTL)
- Validation results 
- AI enhancement results

Clear cache: `redis.clearPattern('convert:*')`
