/**
 * Test Suite: Template Generators
 * 
 * Purpose: Verifies scaffolding logic building the boilerplate files 
 * (index.html, package.json, main.tsx, vite configs etc.) surrounding the primary React app wrapper.
 * 
 * Best Practice: Utilizing beforeAll avoids reconstructing static templates recursively making tests highly performant. 
 */
import {
    generatePackageJson,
    generateViteConfig,
    generateTsConfig,
    generateTsConfigNode,
    generateIndexHtml,
    generateMainTsx,
    generateIndexCss,
    generateReadme,
} from '../generators/templates';
import { flatFormModel } from './fixtures';

describe('Template Generators', () => {

    /**
     * Test Group: package.json logic validation
     */
    describe('generatePackageJson', () => {
        let parsed: any;

        // Arrange: Parse precisely once
        beforeAll(() => {
            parsed = JSON.parse(generatePackageJson(flatFormModel));
        });

        it('generates valid JSON with the correct project name mapping', () => {
            // Assert: Check JSON integrity
            expect(parsed.name).toBe('contact-form');
        });

        it('sets the project type to module', () => {
            // Assert: Node requirements for Vite
            expect(parsed.type).toBe('module');
        });

        it('includes essential react dependencies', () => {
            // Assert: Ensures npm install commands correctly inject core React packages into local modules
            expect(parsed.dependencies.react).toBeDefined();
            expect(parsed.dependencies['react-dom']).toBeDefined();
        });

        it('includes necessary build scripts for Vite', () => {
            // Assert: Map CLI execution handlers logically
            expect(parsed.scripts.dev).toBe('vite');
            expect(parsed.scripts.build).toBe('tsc && vite build');
            expect(parsed.scripts.preview).toBe('vite preview');
        });
    });

    /**
     * Test Group: Vite.config scaffolding verification
     */
    describe('generateViteConfig', () => {
        it('imports define config from vite', () => {
            expect(generateViteConfig()).toContain("import { defineConfig } from 'vite'");
        });

        it('includes the react plugin', () => {
            expect(generateViteConfig()).toContain("import react from '@vitejs/plugin-react'");
            expect(generateViteConfig()).toContain("plugins: [react()]");
        });
    });

    /**
     * Test Group: tsconfig.json schema configurations
     */
    describe('generateTsConfig', () => {
        let parsed: any;
        beforeAll(() => {
            parsed = JSON.parse(generateTsConfig());
        });

        it('targets ES2020', () => {
            expect(parsed.compilerOptions.target).toBe('ES2020');
        });

        it('sets jsx format to react-jsx', () => {
            expect(parsed.compilerOptions.jsx).toBe('react-jsx');
        });

        it('includes the src directory', () => {
            expect(parsed.include).toContain('src');
        });

        it('references the node config file', () => {
            expect(parsed.references[0].path).toBe('./tsconfig.node.json');
        });
    });

    /**
     * Test Group: tsconfig.node transpiler scaffolding checks
     */
    describe('generateTsConfigNode', () => {
        let parsed: any;
        beforeAll(() => {
            parsed = JSON.parse(generateTsConfigNode());
        });

        it('enables composite compilation', () => {
            expect(parsed.compilerOptions.composite).toBe(true);
        });

        it('includes the vite config file', () => {
            expect(parsed.include).toContain('vite.config.ts');
        });
    });

    /**
     * Test Group: index.html entry validation
     */
    describe('generateIndexHtml', () => {
        let html: string;
        beforeAll(() => {
            html = generateIndexHtml(flatFormModel);
        });

        it('includes html5 doctype', () => {
            expect(html).toContain('<!doctype html>');
        });

        it('sets the correct title from the form model', () => {
            expect(html).toContain('<title>Contact Us</title>');
        });

        it('includes the root div', () => {
            // Assert: Verify React mounting root container mapping
            expect(html).toContain('<div id="root"></div>');
        });

        it('injects the entry script for main.tsx', () => {
            // Assert: Verify Vite compilation scripts align correctly
            expect(html).toContain('<script type="module" src="/src/main.tsx"></script>');
        });
    });

    /**
     * Test Group: main.tsx App loading setup mappings
     */
    describe('generateMainTsx', () => {
        it('imports React and ReactDOM', () => {
            const code = generateMainTsx();
            expect(code).toContain("import React from 'react'");
            expect(code).toContain("import ReactDOM from 'react-dom/client'");
        });

        it('renders the App component in StrictMode', () => {
            const code = generateMainTsx();
            expect(code).toContain("<React.StrictMode>");
            expect(code).toContain("<App />");
        });

        it('imports the root CSS file', () => {
            expect(generateMainTsx()).toContain("import './index.css'");
        });
    });

    /**
     * Test Group: Index CSS logic formatting (variables and theming rules)
     */
    describe('generateIndexCss', () => {
        let css: string;
        beforeAll(() => css = generateIndexCss(flatFormModel));

        it('injects primary CSS root variables from the theme', () => {
            // Assert: Maps explicit config variables onto correct system colors variables
            expect(css).toContain('--color-primary: #3b82f6;');
            expect(css).toContain('--color-text: #111827;');
        });

        it('includes styling for the form container', () => {
            expect(css).toContain('.form-container {');
        });

        it('includes accessible focus rings styling', () => {
            // Assert: Ensures proper WCAG boundaries via structural classes
            expect(css).toContain('.field-input:focus-visible {');
        });

        it('includes error state styling', () => {
            expect(css).toContain('.field-error {');
            expect(css).toContain('.field-input[aria-invalid="true"] {');
        });

        it('supports dark mode CSS block', () => {
            expect(css).toContain('@media (prefers-color-scheme: dark)');
        });

        it('provides density spacing configuration', () => {
            // Assert: Validating spacing configuration logic checks density logic rules correctly
            expect(css).toContain('--spacing-unit:');
        });

        it('provides screen reader utility classes', () => {
            expect(css).toContain('.sr-only {');
        });
    });

    /**
     * Test Group: Markdown schema mappings documentation checks
     */
    describe('generateReadme', () => {
        let readme: string;
        beforeAll(() => readme = generateReadme(flatFormModel));

        it('includes the project name', () => {
            expect(readme).toContain('# Contact Form');
        });

        it('includes the meta data if available', () => {
            expect(readme).toContain('- **Title**: Contact Us');
            expect(readme).toContain('- **Description**: Please fill out the form below.');
        });

        it('provides basic npm instructions', () => {
            expect(readme).toContain('npm install');
            expect(readme).toContain('npm run dev');
        });
    });
});
