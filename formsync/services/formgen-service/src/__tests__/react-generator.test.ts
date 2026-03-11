/**
 * Test Suite: React Generator
 * 
 * Purpose: Verifies the `generateAppTsx` logic which maps the intermediate `FormModel` schema
 * down into valid, accessible, and correctly structured React (JSX/TSX) code strings.
 * 
 * Best Practice: Tests are structured logically by feature (Document Structure, Form Lifecycle,
 * Specific Field Types, Accessibility, Properties, Groups, and multi-step Wizard forms).
 */
import { generateAppTsx } from '../generators/react-generator';
import {
    emptyFormModel,
    flatFormModel,
    groupedFormModel,
    wizardFormModel,
    exhaustiveFieldsModel,
    complexNestedModel
} from './fixtures';

describe('React Generator (generateAppTsx)', () => {

    /**
     * Group: Basic Document Structure
     * Tests the overarching structural requirements for the React file to compile correctly.
     */
    describe('Basic Document Structure', () => {
        it('sets up correct imports', () => {
            // Act
            const code = generateAppTsx(flatFormModel);
            // Assert: The appropriate React hooks and form events must be present
            expect(code).toContain("import React, { FormEvent, useState } from 'react';");
        });

        it('maintains the main App component shell', () => {
            const code = generateAppTsx(flatFormModel);
            // Assert: Verify standard functional component definitions exist
            expect(code).toContain('function App() {');
            expect(code).toContain('export default App;');
        });

        it('generates standard state definitions for errors', () => {
            const code = generateAppTsx(flatFormModel);
            // Assert: Verifies the useState hook for field errors is initialized empty
            expect(code).toContain("const [errors, setErrors] = useState<Record<string, string>>({});");
        });

        it('renders the screen reader live region status block', () => {
            const code = generateAppTsx(flatFormModel);
            // Assert: A polite aria region is critical for announcing validation messages post-submission
            expect(code).toContain('role="status"');
            expect(code).toContain('aria-live="polite"');
            expect(code).toContain('{statusMessage}');
        });

        it('injects meta descriptions if provided', () => {
            const code = generateAppTsx(flatFormModel);
            // Assert: Verifies metadata maps correctly to standard paragraph headers
            expect(code).toContain('<p className="form-description">Please fill out the form below.</p>');
        });

        it('escapes html safely to prevent XSS injections in descriptions', () => {
            // Arrange: Create a malicious payload
            const maliciousModel = {
                ...flatFormModel,
                meta: { description: '<script>alert("XSS")</script>' }
            };
            // Act
            const code = generateAppTsx(maliciousModel);
            // Assert: Ensure injection characters are appropriately escaped to HTML entities
            expect(code).not.toContain('<script>alert("XSS")</script>');
            expect(code).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        });
    });

    /**
     * Group: Form Lifecycle and Submission
     * Tests standard lifecycle handlers associated with <form> submission and empty states.
     */
    describe('Form Lifecycle and Submission', () => {
        it('creates standard form wrapping with onSubmit handler', () => {
            const code = generateAppTsx(flatFormModel);
            // Assert: Native browser validation logic (noValidate) must be disabled for custom validation
            expect(code).toContain('<form onSubmit={handleSubmit} noValidate>');
        });

        it('supports custom submit button text', () => {
            const code = generateAppTsx(flatFormModel);
            // Assert: Maps the config `submit.text` correctly
            expect(code).toContain('Send Message');
        });

        it('creates accurate static FIELD_ID_MAP', () => {
            const code = generateAppTsx(exhaustiveFieldsModel);
            // Assert: A static dictionary mapping keys to DOM ids must exist to smoothly route focus errors
            expect(code).toContain('const FIELD_ID_MAP: Record<string, string> = {');
            expect(code).toContain("'textF': 'textF'");
            expect(code).toContain("'password': 'passwordF'");
        });

        it('handles empty forms with an empty state UI and NO form element', () => {
            const code = generateAppTsx(emptyFormModel);
            // Assert: An empty scheme should not render a `<form>` at all
            expect(code).toContain('<div className="empty-state">Form is empty.</div>');
            expect(code).not.toContain('<form');
        });
    });

    /**
     * Group: Accessibility Logic
     * Directly asserts the accessibility hooks generated during transpilation.
     */
    describe('Accessibility logic', () => {
        it('links fields to error spans via aria-errormessage', () => {
            const code = generateAppTsx(exhaustiveFieldsModel);
            // Assert: Inputs correctly map to the sibling error span.
            expect(code).toContain('aria-errormessage="textF-error"');
        });

        it('assigns aria-invalid correctly', () => {
            const code = generateAppTsx(exhaustiveFieldsModel);
            // Assert: Dynamic evaluation strings generated properly for screen reader notification
            expect(code).toContain("aria-invalid={errors['textF'] ? 'true' : 'false'}");
        });
    });

    /**
     * Group: Specific Support for Field Types
     * Exhaustively exercises boolean edge cases formatting each schema supported field type.
     */
    describe('Specific Support for Field Types', () => {
        let exhaustCode: string;

        // Setup exhaustive generation once for performance
        beforeAll(() => {
            exhaustCode = generateAppTsx(exhaustiveFieldsModel);
        });

        it('correctly produces simple text inputs', () => {
            expect(exhaustCode).toContain('type="text"');
            expect(exhaustCode).toContain('name="textF"');
        });

        it('correctly produces email inputs', () => {
            expect(exhaustCode).toContain('type="email"');
            expect(exhaustCode).toContain('name="emailF"');
        });

        it('correctly produces password inputs', () => {
            expect(exhaustCode).toContain('type="password"');
            expect(exhaustCode).toContain('name="password"');
        });

        it('correctly maps WCAG auto-complete tokens to inputs', () => {
            // Assert: Checks if WCAG mappings are inferred safely from schema keys
            expect(exhaustCode).toContain('autoComplete="current-password"');
            expect(exhaustCode).toContain('autoComplete="new-password"');
        });

        it('produces number inputs', () => {
            expect(exhaustCode).toContain('type="number"');
            expect(exhaustCode).toContain('name="numberF"');
        });

        it('generates textarea structure instead of standard input', () => {
            // Assert: Ensure it uses a tag structure `<textarea></textarea>` instead of `<input />`
            expect(exhaustCode).toContain('<textarea');
            expect(exhaustCode).toContain('></textarea>');
            expect(exhaustCode).toContain('name="textareaF"');
        });

        it('provides correctly structured checkbox fields', () => {
            expect(exhaustCode).toContain('type="checkbox"');
            expect(exhaustCode).toContain('name="checkboxF"');
            // Assert: Custom visual wrappers are necessary for checkboxes to align correctly
            expect(exhaustCode).toContain('className="field-item checkbox-item"');
        });

        it('generates select drop downs with dynamic options', () => {
            // Assert: Checks `<select>` elements inject `<option>` children correctly from constraint params
            expect(exhaustCode).toContain('<select');
            expect(exhaustCode).toContain('name="selectF"');
            expect(exhaustCode).toContain('<option value="Option A">Option A</option>');
            expect(exhaustCode).toContain('<option value="Option B">Option B</option>');
        });

        it('generates date inputs without placeholder (as date inputs visually handle this natively)', () => {
            expect(exhaustCode).toContain('type="date"');
            expect(exhaustCode).toContain('name="dateF"');

            // Assert: Placeholders on native date inputs trigger console warnings in React; ensure exclusion
            const dateBlock = exhaustCode.split('id="dateF"')[1].split('/>')[0];
            expect(dateBlock).not.toContain('placeholder');
        });
    });

    /**
     * Group: Field Properties & UI Logic
     * Focuses on attributes mapped directly related to look, feel, and explicit definitions.
     */
    describe('Field Properties & UI Logic', () => {
        let exhaustCode: string;
        beforeAll(() => {
            exhaustCode = generateAppTsx(exhaustiveFieldsModel);
        });

        it('injects required indicators for required fields', () => {
            // Assert: A span containing an asterisk should be rendered if the field constraint explicitly requires the input
            expect(exhaustCode).toContain('Text Field<span className="required" aria-hidden="true">*</span>');
        });

        it('skips required indicators for optional fields', () => {
            // Assert: Email fields marked as not required have no asterisk span
            expect(exhaustCode).toContain('Email Field\n');
        });

        it('includes custom placeholders strings if specified', () => {
            expect(exhaustCode).toContain('placeholder="text"');
        });

        it('computes fallback placeholder strings dynamically based on label', () => {
            // Assert: Fallback to a grammatically correct schema template when specific placeholders are absent
            expect(exhaustCode).toContain('placeholder="Enter email field..."');
        });

        it('injects help text correctly with aria connections', () => {
            expect(exhaustCode).toContain('<small id="checkboxF-help" className="field-help-text"');
            expect(exhaustCode).toContain('Check this</small>');
        });

        it('injects custom inline style overrides as css variables', () => {
            // Assert: Check that style params natively map inline style configs properly into style attributes
            expect(exhaustCode).toContain("'--field-label-color': 'red'");
            expect(exhaustCode).toContain("'--field-bg-color': 'blue'");
            expect(exhaustCode).toContain("'--field-border-color': 'green'");
            expect(exhaustCode).toContain("'--field-input-text-color': 'white'");
            expect(exhaustCode).toContain("'--color-primary': 'yellow'");
        });
    });

    /**
     * Group: Groups and Hierarchy
     * Validates nested schemas structure translating into valid DOM fieldsets.
     */
    describe('Groups and Hierarchy', () => {
        it('creates fieldset wraps for single layer groups', () => {
            const code = generateAppTsx(groupedFormModel);
            // Assert: Native screen readers rely on grouping structures using fieldset+legend semantics
            expect(code).toContain('<fieldset className="field-group"');
            expect(code).toContain('<legend className="field-legend"');
            expect(code).toContain('>Personal Information</legend>');
        });

        it('properly places children fields inside group tags', () => {
            const code = generateAppTsx(groupedFormModel);
            const groupBlock = code.split('<fieldset')[1].split('</fieldset>')[0];
            // Assert: Verifies positional integrity
            expect(groupBlock).toContain('name="firstName"');
            expect(groupBlock).toContain('name="lastName"');
        });

        it('supports deeply nested grouped fields recursively', () => {
            const code = generateAppTsx(complexNestedModel);
            const parts = code.split('<fieldset');
            // Assert: Check if all depth layers were properly scaffolded iteratively
            expect(parts.length).toBe(3);
            expect(code).toContain('>Root Level</legend>');
            expect(code).toContain('>Sub Level</legend>');
            expect(code).toContain('name="deepInput"');
        });

        it('traverses deep hierarchies to build FIELD_ID_MAP', () => {
            const code = generateAppTsx(complexNestedModel);
            // Assert: Deeply nested inputs must still retain mapping values globally available for focus route errors
            expect(code).toContain("'deepInput': 'deepInput'");
        });
    });

    /**
     * Group: Multi-step layout wizard support
     * Multi-Step forms handle UI isolation uniquely differing logic radically from standard generation.
     */
    describe('Multi-step layout wizard support', () => {
        it('transforms groups of fields to specific HTML section elements', () => {
            const code = generateAppTsx(wizardFormModel);
            // Assert: Each step maps independently isolating fields behind UI blocks
            expect(code).toContain('<section className="form-section">');
        });

        it('includes section step numbers mapping visually to their sequence', () => {
            const code = generateAppTsx(wizardFormModel);
            // Assert: The step sequences 1 and 2 render correctly sequentially
            expect(code).toContain('<span className="section-number">1</span>');
            expect(code).toContain('<span className="section-number">2</span>');
        });

        it('places step specific fields inside correct sequential steps', () => {
            const code = generateAppTsx(wizardFormModel);
            const parts = code.split('<section');

            const step1Html = parts[1].split('</section>')[0];
            // Assert: Integrity check mapping ensuring specific variables never overlap outside their expected schema layout index boundaries
            expect(step1Html).toContain('name="step1field"');
            expect(step1Html).not.toContain('name="step2field"');

            const step2Html = parts[2].split('</section>')[0];
            expect(step2Html).toContain('name="step2field"');
            expect(step2Html).not.toContain('name="step1field"');
        });

        it('places unassigned fields into every step section if stepIndex is undefined', () => {
            const code = generateAppTsx(wizardFormModel);
            const parts = code.split('<section');

            const step1Html = parts[1].split('</section>')[0];
            // Assert: Ensures global fields always overlap across steps continuously displaying correctly
            expect(step1Html).toContain('name="unassignedField"');

            const step2Html = parts[2].split('</section>')[0];
            expect(step2Html).toContain('name="unassignedField"');
        });
    });
});
