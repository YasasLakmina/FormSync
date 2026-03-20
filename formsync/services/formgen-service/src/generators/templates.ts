/**
 * Template strings for generated React project files
 *
 * These templates define the boilerplate files for a standalone Vite + React app.
 * Keep templates minimal and clean - users should be able to read and modify them easily.
 */

import { FormModel } from '../types';

/**
 * Generate package.json for the exported React app
 */
export function generatePackageJson(formModel: FormModel): string {
  const projectName = formModel.name.toLowerCase().replace(/\s+/g, '-');

  return JSON.stringify({
    name: projectName,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0'
    },
    devDependencies: {
      '@types/react': '^18.2.66',
      '@types/react-dom': '^18.2.22',
      '@vitejs/plugin-react': '^4.2.1',
      typescript: '^5.2.2',
      vite: '^5.2.0'
    }
  }, null, 2);
}

/**
 * Generate vite.config.ts
 */
export function generateViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5170,
    strictPort: true,
  },
})
`;
}

/**
 * Generate tsconfig.json
 */
export function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }]
  }, null, 2);
}

/**
 * Generate tsconfig.node.json
 */
export function generateTsConfigNode(): string {
  return JSON.stringify({
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true
    },
    include: ['vite.config.ts']
  }, null, 2);
}

/**
 * Generate index.html
 */
export function generateIndexHtml(formModel: FormModel): string {
  const title = formModel.meta?.title || formModel.name;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

/**
 * Generate main.tsx (React entry point)
 */
export function generateMainTsx(): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
}

/**
 * Generate global CSS with theme variables.
 * This mirrors the styling approach from Canvas.tsx.
 */
export function generateIndexCss(formModel: FormModel): string {
  const { theme } = formModel;
  const densityMap: Record<string, string> = {
    compact: '8px',
    normal: '12px',
    comfortable: '16px',
  };

  return `/* CSS Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
}

/* Theme CSS Variables */
:root {
  ${generateCssVariables(getLightColors(formModel))}
  
  --border-radius: ${theme.radius}px;
  --spacing-unit: ${densityMap[theme.density] || '12px'};
  
  --font-family: ${theme.typography.fontFamily};
  --font-size-base: ${theme.typography.baseFontSize}px;
}

/* Dark Mode (System) */
@media (prefers-color-scheme: dark) {
  :root {
    ${generateCssVariables(getDarkColors(formModel))}
  }
}

/* Dark Mode (Manual) */
.dark-mode {
  ${generateCssVariables(getDarkColors(formModel))}
}

/* Form Container */
#root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.form-container {
  max-width: 600px;
  width: 100%;
  /* Card/surface — distinct from page background (--color-bg on body) */
  background: var(--color-surface);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid color-mix(in srgb, var(--color-border) 65%, transparent);
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.form-description {
  color: var(--color-muted);
  margin-bottom: 2rem;
}

/* Field Styling */
.field-item {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--field-label-color, var(--color-text));
}

.field-label .required {
  color: var(--color-error);
  margin-left: 0.25rem;
}

.field-input {
  width: 100%;
  padding: calc(var(--spacing-unit) * 1.25);
  border: 1px solid var(--field-border-color, var(--color-border));
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: var(--font-family);
  background-color: var(--field-bg-color, var(--color-input-bg));
  color: var(--field-input-text-color, var(--color-text));
  transition: all 0.2s ease;
}

input[type="checkbox"].field-input {
  width: auto;
  margin-right: 0.5rem;
  padding: 0;
  cursor: pointer;
}

/* :focus-visible targets keyboard nav only — mouse users won't see the ring.
   We keep the outline visible for High Contrast / forced-colors mode (WCAG 2.4.11). */
.field-input:focus {
  outline: 2px solid transparent;
}
.field-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.field-input::placeholder {
  color: var(--color-muted);
}

.field-help-text {
  display: block;
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-top: 0.25rem;
}

/* Accessible error message — hidden when empty, visible when there is an error */
.field-error {
  display: block;
  min-height: 1.25rem; /* reserve space so the layout doesn't jump */
  font-size: 0.8rem;
  color: var(--color-error);
  margin-top: 0.2rem;
}

/* Visual treatment for invalid inputs — mirrors aria-invalid="true" */
.field-input[aria-invalid="true"] {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.field-input[aria-invalid="true"]:focus {
  outline: none;
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
}

/* Screen-reader-only utility — visually hidden but fully accessible to AT.
   Used by the aria-live status region. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Grouped fields — theme-aware fieldset */
.field-group {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.field-legend {
  padding: 0 0.5rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: calc(var(--spacing-unit) * 1.25);
  background-color: var(--submit-bg-color, var(--color-primary));
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
  margin-top: 2rem;
}

.submit-button:hover {
  opacity: 0.9;
}

.submit-button:active {
  opacity: 0.8;
}

/* Visible keyboard focus ring for the submit button (WCAG 2.4.11). */
.submit-button:focus {
  outline: 2px solid transparent;
}

.submit-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 25%, transparent);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-muted);
}

/* Wizard Step Sections */
.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}
.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.25rem;
}

.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.section-fields {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
`;
}

/**
 * Generate README.md
 */
export function generateReadme(formModel: FormModel): string {
  const projectName = formModel.name;

  return `# ${projectName}

This form was generated from FormSync Form Builder.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

## Form Details

- **Name**: ${projectName}
- **Version**: ${formModel.version}
${formModel.meta?.title ? `- **Title**: ${formModel.meta.title}` : ''}
${formModel.meta?.description ? `- **Description**: ${formModel.meta.description}` : ''}

## ZIP export (builder palette parity)

Exported React and wired POST payloads align with the builder **field types**: text through calculated/repeater/typeahead, plus **unknown** (fallback).

- **Files**: uploaded files are sent as **Base64 / data URL strings inside JSON** (not multipart). Expect practical limits on payload size from browsers and servers.
- **Rich text**: exported as a **textarea** (HTML string). Bundle a rich-text library if you need WYSIWYG.
- **Repeater**: values serialize as **arrays of objects** (indexed names like \`items.0.field\` → JSON arrays after submit wiring).
- **Typeahead**: optional async URL must allow **CORS** from your dev origin; placeholder is \`{query}\`.

### Manual smoke checklist

1. Export fullstack ZIP with **group + repeater + file + calculated** fields; run frontend and POST to generated API.
2. Confirm repeater rows produce a JSON **array** at the expected path.
3. Confirm a small image/PDF file round-trips as Base64 in the JSON body (size stays reasonable).

## Customization

- Edit \`src/App.tsx\` to modify the form structure
- Edit \`src/index.css\` to customize styling
- Theme colors are defined as CSS variables in \`index.css\`

## Tech Stack

- React 18
- TypeScript
- Vite
`;
}

// --- Helpers ---

const THEME_DEFAULTS = {
  light: {
    primary: '#3b82f6',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    inputBackground: '#ffffff',
  },
  dark: {
    primary: '#60a5fa',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    muted: '#9ca3af',
    border: '#374151',
    error: '#f87171',
    inputBackground: '#374151',
  }
};

function getLightColors(form: FormModel) {
  return form.theme.schemes?.light
    || (form.theme.mode === 'light' ? form.theme.colors : THEME_DEFAULTS.light);
}

function getDarkColors(form: FormModel) {
  return form.theme.schemes?.dark
    || (form.theme.mode === 'dark' ? form.theme.colors : THEME_DEFAULTS.dark);
}

function generateCssVariables(colors: any) {
  return `
  --color-primary: ${colors.primary};
  --color-bg: ${colors.background};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
  --color-muted: ${colors.muted};
  --color-border: ${colors.border};
  --color-error: ${colors.error};
  --color-input-bg: ${colors.inputBackground};`.trim();
}
