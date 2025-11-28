# @formsync/plugins

Shared TypeScript interfaces and base classes for FormSync plugin system.

## Exports

### Interfaces

- `FormatParserPlugin` - Convert various formats to JSON Schema
- `SchemaValidatorPlugin` - Validate JSON Schemas
- `LLMProviderPlugin` - AI-powered schema enhancement

### Classes

- `BasePlugin` - Abstract base class with common functionality
- `PluginRegistry` - Singleton registry for plugin management

## Usage

```typescript
import { PluginRegistry, FormatParserPlugin } from '@formsync/plugins';

// Get registry instance
const registry = PluginRegistry.getInstance();

// Register a plugin
registry.registerParser(myParserPlugin);

// Auto-detect parser
const parser = registry.detectParser(input);
```

## Development

```bash
npm install
npm run build
```

The package is used by both the backend and frontend via workspace linking.
