# FormSync - Component 1: Intelligent Schema Definition & AI Integration

> Part of a research project for schema-driven form automation

FormSync Component 1 is an intelligent schema creation and enhancement engine that provides both technical and non-technical users with powerful tools to create, validate, and AI-enhance JSON Schema Draft-7 schemas.

## 🎯 Project Overview

This component is **Component 1** of a 4-component research system:

1. **Intelligent Schema Definition & AI Integration** (This component)
2. Schema-based Frontend Form Builder
3. Data Mapping Engine with AI Test Case Generation
4. Schema-driven Backend Generator

### What This Component Does

- ✅ **Dual-path interface**: Technical users use Monaco Editor, non-technical users use a drag-and-drop builder
- ✅ **Multi-format support**: Converts JSON, YAML, and XML to JSON Schema Draft-7
- ✅ **Plugin architecture**: Extensible parser, validator, and LLM provider plugins
- ✅ **AI enhancement**: Uses OpenAI GPT to improve schemas with better naming, validations, and accessibility
- ✅ **Validation engine**: Ajv JSON Schema validation + WCAG accessibility checks
- ✅ **Version control**: Full schema versioning with PostgreSQL
- ✅ **Caching**: Redis-based result caching for performance

## 🏗️ Architecture

```
formsync/
├── apps/
│   ├── schema-api/          # NestJS Backend API
│   │   ├── src/
│   │   │   ├── plugins/     # Parser, Validator, LLM implementations
│   │   │   ├── schema/      # Schema CRUD & endpoints
│   │   │   ├── prisma/      # Database service
│   │   │   └── redis/       # Cache service
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   └── schema-ui/           # React Frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── TechnicalEditor.tsx    # Monaco Editor view
│       │   │   └── TemplateBuilder.tsx    # Visual form builder
│       │   ├── stores/      # Zustand state management
│       │   └── api/         # API client
│       └── vite.config.ts
│
└── packages/
    └── plugins/             # Shared TypeScript interfaces
        └── src/
            ├── interfaces/  # FormatParser, Validator, LLM interfaces
            └── PluginRegistry.ts
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database
- Redis server
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone and install dependencies**

```bash
cd formsync
npm install
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST` & `REDIS_PORT`: Redis connection
- `OPENAI_API_KEY`: Your OpenAI API key

3. **Set up database**

```bash
cd apps/schema-api
npx prisma migrate dev
npx prisma db seed
```

4. **Start development servers**

```bash
# From project root
npm run dev
```

This starts:
- **Backend API**: http://localhost:3000
- **Frontend UI**: http://localhost:5173
- **API Docs**: http://localhost:3000/api/docs

## 📚 API Endpoints

### Conversion
- `POST /schema/convert` - Convert JSON/YAML/XML to JSON Schema

### AI Enhancement
- `POST /schema/enhance` - Enhance schema using AI

### Validation
- `POST /schema/validate` - Validate schema against rules

### CRUD
- `POST /schema` - Create new schema
- `GET /schema/:id` - Get schema by ID
- `PUT /schema/:id` - Update schema (creates new version)
- `GET /schema` - List all schemas
- `DELETE /schema/:id` - Delete schema

## 🎨 Frontend Features

### Technical Editor

- **Monaco Editor** with syntax highlighting for JSON, YAML, XML
- **Format auto-detection** and conversion
- **Live validation** with error/warning/info severity levels
- **AI enhancement** with diff viewer showing all changes
- **One-click actions**: Convert, Enhance, Validate

### Template Builder

- **Visual form builder** for non-technical users
- **Field configuration**: type, title, description, validation, accessibility
- **Generate JSON Schema** from form definition
- **Preview** of all configured fields

## 🔌 Plugin System

### Available Plugins

**Format Parsers:**
- `JsonParserPlugin` - Parse and infer JSON schemas
- `YamlParserPlugin` - Parse YAML to JSON Schema
- `XmlParserPlugin` - Parse XML to JSON Schema

**Validators:**
- `AjvValidatorPlugin` - JSON Schema Draft-7 validation
- `WcagValidatorPlugin` - Accessibility compliance checks

**LLM Providers:**
- `OpenAILLMPlugin` - GPT-4 schema enhancement

### Adding Custom Plugins

1. Implement the relevant interface (`FormatParserPlugin`, `SchemaValidatorPlugin`, or `LLMProviderPlugin`)
2. Register in `apps/schema-api/src/plugins/plugins.module.ts`

## 🧪 Testing

```bash
# Backend tests
cd apps/schema-api
npm test

# Frontend tests
cd apps/schema-ui
npm test
```

## 📦 Technology Stack

### Backend
- **NestJS** - Modular TypeScript framework
- **Prisma** - Type-safe ORM for PostgreSQL
- **Redis** - Caching layer
- **OpenAI** - AI-powered enhancements
- **Ajv** - JSON Schema validation
- **js-yaml** - YAML parsing
- **fast-xml-parser** - XML parsing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Monaco Editor** - Code editor
- **Zustand** - State management
- **Axios** - HTTP client

## 🔬 Research Context

This component serves as the **schema definition and AI integration layer** for a comprehensive form automation research project. The output (JSON Schema Draft-7) is consumed by:

- **Component 2**: Backend API Generator (auto-generates REST/GraphQL APIs)
- **Component 3**: Frontend Form Renderer (renders dynamic forms from schemas)
- **Component 4**: Data Mapping Layer (routes form submissions to external systems)

## 📝 Example Usage

### Convert YAML to JSON Schema

```typescript
POST /schema/convert
{
  "input": "name: string\nage: number",
  "format": "yaml"
}
```

### Enhance Schema with AI

```typescript
POST /schema/enhance
{
  "schema": { /* your JSON Schema */ },
  "focusAreas": ["naming", "accessibility", "validation"]
}
```

### Validate Schema

```typescript
POST /schema/validate
{
  "schema": { /* your JSON Schema */ }
}
```

## 🤝 Contributing

This is a research project. For questions or suggestions, please contact the project maintainer.

## 📄 License

MIT License - See LICENSE file for details

---

**FormSync Component 1** - Empowering both technical and non-technical users to create better schemas with AI assistance.
