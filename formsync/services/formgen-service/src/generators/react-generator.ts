/**
 * React Component Generator
 *
 * Converts FormModel to a React component (App.tsx).
 * This mirrors the rendering logic from Canvas.tsx to ensure visual parity.
 */

import { FormModel, FieldModel } from '../types';

/**
 * Generate the complete App.tsx file
 */
export function generateAppTsx(formModel: FormModel): string {
  const { fields, layout, theme, meta, submit } = formModel;

  // Get top-level fields in layout order
  const orderedFields = layout.order
    .map(id => fields.find(f => f.id === id))
    .filter((f): f is FieldModel => !!f);

  const hasFields = orderedFields.length > 0;
  const title = meta?.title || formModel.name;
  const description = meta?.description;
  const submitText = submit?.text || 'Submit';
  const submitColor = submit?.color;

  // Build the form body — grouped into step sections when wizard mode is on
  let formBody: string;
  if (hasFields && layout.steps && layout.steps.length > 0) {
    // Render each wizard step as a <section> with a heading
    const sections = layout.steps.map((step, stepIdx) => {
      // Fields for this step: either assigned to this step OR unassigned (stepIndex === undefined)
      const stepFields = orderedFields.filter(
        f => f.stepIndex === stepIdx || f.stepIndex === undefined
      );
      const fieldComponents = stepFields
        .map(f => generateFieldComponent(f, theme))
        .join('\n\n');
      return `<section className="form-section">
          <h2 className="section-title">
            <span className="section-number">${stepIdx + 1}</span>
            ${escapeHtml(step.title)}
          </h2>
          <div className="section-fields">
            ${fieldComponents}
          </div>
        </section>`;
    }).join('\n\n        ');

    formBody = `<form onSubmit={handleSubmit} noValidate>
        ${sections}

        <button
          type="submit"
          className="submit-button"
          ${submitColor ? `style={{ '--submit-bg-color': '${submitColor}' } as React.CSSProperties}` : ''}
        >
          ${escapeHtml(submitText)}
        </button>
      </form>`;
  } else if (hasFields) {
    // Flat form — no wizard steps
    const fieldComponents = orderedFields
      .map(f => generateFieldComponent(f, theme))
      .join('\n\n');
    formBody = `<form onSubmit={handleSubmit} noValidate>
        ${fieldComponents}

        <button
          type="submit"
          className="submit-button"
          ${submitColor ? `style={{ '--submit-bg-color': '${submitColor}' } as React.CSSProperties}` : ''}
        >
          ${escapeHtml(submitText)}
        </button>
      </form>`;
  } else {
    formBody = `<div className="empty-state">Form is empty.</div>`;
  }

  // Build a static key → DOM-id map so the generated form can auto-focus
  // the first invalid field without needing React refs.
  const allFields = collectAllFields(orderedFields);
  const fieldIdMapEntries = allFields
    .map((f: FieldModel) => `  '${f.key}': '${f.id}'`)
    .join(',\n');

  return `import React, { FormEvent, useState } from 'react';

// Maps every field's form key to its DOM id.
// Generated at build time — do not edit manually.
const FIELD_ID_MAP: Record<string, string> = {
${fieldIdMapEntries}
};

function App() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Drives the aria-live announcement region — screen readers read this after submit.
  const [statusMessage, setStatusMessage] = useState<string>('');

  const validate = (data: Record<string, FormDataEntryValue>): Record<string, string> => {
    const errs: Record<string, string> = {};
    // Add field-level validation here — key matches the field 'name' attribute.
    // Example: if (!data['email']) errs['email'] = 'Email is required.';
    return errs;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const errs = validate(data);
    setErrors(errs);
    const errorCount = Object.keys(errs).length;
    if (errorCount > 0) {
      // Announce a summary to screen readers via the polite live region.
      setStatusMessage(
        errorCount === 1
          ? '1 error found. Please review the highlighted field.'
          : errorCount + ' errors found. Please review the highlighted fields.'
      );
      // Move focus AND scroll to the first invalid field.
      const firstErrorKey = Object.keys(errs)[0];
      const firstErrorId = FIELD_ID_MAP[firstErrorKey];
      if (firstErrorId) {
        const el = document.getElementById(firstErrorId) as HTMLElement | null;
        el?.focus();
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    // Clear any prior status message on a clean submission.
    setStatusMessage('');
    console.log('Form submitted:', data);
    // Add your form submission logic here
  };

  return (
    <div className="form-container">
      {/* Visually hidden — screen readers announce statusMessage when it changes. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMessage}
      </div>

      <h1 className="form-title">${escapeHtml(title)}</h1>
      ${description ? `<p className="form-description">${escapeHtml(description)}</p>` : ''}

      ${formBody}
    </div>
  );
}

export default App;
`;
}


/**
 * Generate JSX for a single field.
 * Handles different field types and applies style overrides as CSS custom properties.
 *
 * Design:
 *  - Style overrides become CSS vars scoped to the field wrapper (--field-label-color etc.)
 *  - A buildStyle() helper merges layout props + override vars into ONE style={} attribute
 *    to avoid the invalid-JSX duplicate-style-attribute pitfall.
 *  - Only non-empty override values emit a CSS var entry (no empty strings polluting styles).
 */
/** WCAG 1.3.5 — maps field keys to HTML autocomplete tokens so password
 *  managers and assistive technology can identify the purpose of each input. */
const AUTO_COMPLETE_MAP: Record<string, string> = {
  name: 'name', firstName: 'given-name', lastName: 'family-name',
  email: 'email', phone: 'tel', mobile: 'tel',
  password: 'current-password', newPassword: 'new-password',
  street: 'street-address', city: 'address-level2', state: 'address-level1',
  zip: 'postal-code', country: 'country-name',
  organisation: 'organization', company: 'organization',
};

function generateFieldComponent(field: FieldModel, theme: any): string {
  const { id, key, type, label, required, ui } = field;
  // date/number inputs don't benefit from placeholder — omit it to keep markup clean.
  const explicitPlaceholder = ui?.placeholder;
  const computedPlaceholder = explicitPlaceholder ?? `Enter ${label.toLowerCase()}...`;
  const placeholder = type === 'date' ? '' : computedPlaceholder;
  const helpText = ui?.helpText;
  const overrides = ui?.styleOverrides as Record<string, string> | undefined;
  // Look up autoComplete token for this field key (WCAG 1.3.5).
  const autoComplete = AUTO_COMPLETE_MAP[key] ?? '';

  // Collect per-field CSS custom property entries (only truthy values)
  const overrideVars: string[] = overrides
    ? [
      overrides.labelColor && `'--field-label-color': '${overrides.labelColor}'`,
      overrides.inputTextColor && `'--field-input-text-color': '${overrides.inputTextColor}'`,
      overrides.backgroundColor && `'--field-bg-color': '${overrides.backgroundColor}'`,
      overrides.borderColor && `'--field-border-color': '${overrides.borderColor}'`,
      overrides.focusColor && `'--color-primary': '${overrides.focusColor}'`,
    ].filter(Boolean) as string[]
    : [];

  /**
   * Build a single style={{...}} attribute string that merges:
   *  - Any extra layout properties (border, padding, display, …)
   *  - The per-field CSS custom property overrides
   * Returns an empty string when there is nothing to emit.
   */
  const buildStyle = (extra: string[] = []): string => {
    const all = [...extra, ...overrideVars];
    return all.length > 0
      ? `style={{ ${all.join(', ')} } as React.CSSProperties}`
      : '';
  };

  // ── group ──────────────────────────────────────────────────────────────────
  if (type === 'group') {
    const children = field.children || [];
    const childComponents = children
      .map(child => generateFieldComponent(child, theme))
      .join('\n');
    const groupExtra = [
      `border: '1px solid #e5e7eb'`,
      `borderRadius: '4px'`,
      `padding: '1rem'`,
      `marginBottom: '1.5rem'`,
    ];
    return `<fieldset className="field-group" ${buildStyle(groupExtra)}>
          <legend className="field-legend" style={{ padding: '0 0.5rem', fontWeight: 600 }}>${escapeHtml(label)}</legend>
          ${childComponents}
        </fieldset>`;
  }

  // ── input element ──────────────────────────────────────────────────────────
  let inputElement: string;
  // Build aria attributes shared across input types
  // - aria-required: explicitly declares the field as required for AT
  // - aria-describedby: links to help text and/or error message spans
  // - aria-invalid: evaluated at runtime via {errors['key'] ? 'true' : 'false'}
  // - aria-errormessage: points to the error span when invalid
  const describedByParts: string[] = [];
  if (helpText) describedByParts.push(`${id}-help`);
  describedByParts.push(`${id}-error`);
  const ariaDescribedBy = `aria-describedby="${describedByParts.join(' ')}"`;
  const ariaRequired = required ? `aria-required="true"` : '';
  const ariaInvalid = `aria-invalid={errors['${key}'] ? 'true' : 'false'}`;
  const ariaErrMsg = `aria-errormessage="${id}-error"`;

  const autoCompleteAttr = autoComplete ? `autoComplete="${autoComplete}"` : '';

  switch (type) {
    case 'textarea':
      inputElement = `<textarea
            name="${key}"
            id="${id}"
            className="field-input"
            ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}
            ${required ? 'required' : ''}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
            ${autoCompleteAttr}
          ></textarea>`;
      break;
    case 'select': {
      const options = field.constraints?.enum || [];
      inputElement = `<select
            name="${key}"
            id="${id}"
            className="field-input"
            ${required ? 'required' : ''}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
            ${autoCompleteAttr}
          >
            <option value="">${escapeHtml(placeholder) || 'Select...'}</option>
            ${options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('\n            ')}
          </select>`;
      break;
    }
    case 'checkbox':
      // Checkboxes use aria-checked semantics; aria-required still applies.
      // autoComplete is not applicable to checkboxes — omitted intentionally.
      inputElement = `<input
            type="checkbox"
            name="${key}"
            id="${id}"
            className="field-input"
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />`;
      break;
    default:
      // text, email, password, number, date
      inputElement = `<input
            type="${type}"
            name="${key}"
            id="${id}"
            className="field-input"
            ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}
            ${required ? 'required' : ''}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
            ${autoCompleteAttr}
          />`;
  }

  // ── checkbox wrapper ─────────────────────────────────────────────────────
  // Checkboxes render the label after the input; error lives below the group
  if (type === 'checkbox') {
    const checkboxExtra = [`display: 'flex'`, `alignItems: 'center'`, `flexWrap: 'wrap'`];
    return `<div className="field-item checkbox-item" ${buildStyle(checkboxExtra)}>
          ${inputElement}
          <label htmlFor="${id}" className="field-label" style={{ marginBottom: 0 }}>
            ${escapeHtml(label)}${required ? '<span className="required" aria-hidden="true">*</span>' : ''}
          </label>
          ${helpText ? `<small id="${id}-help" className="field-help-text" style={{ marginLeft: 'auto' }}>${escapeHtml(helpText)}</small>` : ''}
          <span
            id="${id}-error"
            className="field-error"
            role="alert"
            aria-live="polite"
          >
            {errors['${key}']}
          </span>
        </div>`;
  }

  // ── standard field wrapper ───────────────────────────────────────────────
  return `<div className="field-item" ${buildStyle()}>
          <label htmlFor="${id}" className="field-label">
            ${escapeHtml(label)}${required ? '<span className="required" aria-hidden="true">*</span>' : ''}
          </label>
          ${inputElement}
          ${helpText ? `<small id="${id}-help" className="field-help-text">${escapeHtml(helpText)}</small>` : ''}
          <span
            id="${id}-error"
            className="field-error"
            role="alert"
            aria-live="polite"
          >
            {errors['${key}']}
          </span>
        </div>`;
}

/**
 * Recursively collect every leaf field (including group children) so we can
 * build a complete key → id mapping used by FIELD_ID_MAP in the App component.
 */
function collectAllFields(fields: FieldModel[]): FieldModel[] {
  const result: FieldModel[] = [];
  for (const f of fields) {
    if (f.type === 'group' && f.children && f.children.length > 0) {
      result.push(...collectAllFields(f.children));
    } else {
      result.push(f);
    }
  }
  return result;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
