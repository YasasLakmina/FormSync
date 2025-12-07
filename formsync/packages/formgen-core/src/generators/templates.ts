/**
 * Template strings for generated React project files
 * 
 * These templates define the boilerplate files for a standalone Vite + React app.
 * Keep templates minimal and clean - users should be able to read and modify them easily.
 */

import { FormModel } from '../models/form-model';

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
 * Generate global CSS with theme variables
 * This mirrors the styling approach from Canvas.tsx
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
  background: var(--color-surface);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-muted);
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
