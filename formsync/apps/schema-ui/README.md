# FormSync Schema UI

React frontend for FormSync Component 1 - Intelligent Schema Definition & AI Integration.

## Features

- **Dual Interface**: Technical Editor (Monaco) + Template Builder (Visual)
- **Monaco Editor**: Syntax highlighting for JSON/YAML/XML
- **Live Validation**: Real-time error/warning display
- **AI Integration**: One-click schema enhancement
- **Modern UI**: Tailwind CSS + shadcn/ui components

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Components

### TechnicalEditor

Monaco Editor integration with format conversion, AI enhancement, and validation.

### TemplateBuilder

Visual form builder for non-technical users with field configuration UI.

### State Management

Zustand store (`stores/schemaStore.ts`) manages:
- Schema CRUD operations
- Conversion results
- Validation results
- AI enhancements

### API Client

Axios client (`api/schemaApi.ts`) communicates with the backend at `http://localhost:3000`.

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:3000
```

## UI Components

Based on shadcn/ui:
- Button
- Card
- Tabs
- Label
- (Extensible - add more as needed)

## Styling

Tailwind CSS with custom theme defined in `tailwind.config.js`.

Dark mode support via CSS variables.
