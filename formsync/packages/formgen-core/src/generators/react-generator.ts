/**
 * React Component Generator
 * 
 * Converts FormModel to a React component (App.tsx).
 * This mirrors the rendering logic from Canvas.tsx to ensure visual parity.
 */

import { FormModel, FieldModel } from '../models/form-model';

/**
 * Generate the complete App.tsx file
 */
export function generateAppTsx(formModel: FormModel): string {
  const { fields, layout, theme, meta, submit } = formModel;

  // Get fields in correct order
  const orderedFields = layout.order
    .map(id => fields.find(f => f.id === id))
    .filter((f): f is FieldModel => !!f);

  const fieldComponents = orderedFields.map(field => generateFieldComponent(field, theme)).join('\n\n');

  const hasFields = orderedFields.length > 0;
  const title = meta?.title || formModel.name;
  const description = meta?.description;
  const submitText = submit?.text || 'Submit';
  const submitColor = submit?.color;

  return `import React, { FormEvent } from 'react';

function App() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);
    // Add your form submission logic here
  };

  return (
    <div className="form-container">
      <h1 className="form-title">${escapeHtml(title)}</h1>
      ${description ? `<p className="form-description">${escapeHtml(description)}</p>` : ''}

      ${hasFields ? `<form onSubmit={handleSubmit}>
        ${fieldComponents}

        <button 
          type="submit" 
          className="submit-button"
          ${submitColor ? `style={{ '--submit-bg-color': '${submitColor}' } as React.CSSProperties}` : ''}
        >
          ${escapeHtml(submitText)}
        </button>
      </form>` : `<div className="empty-state">
          Form is empty.
        </div>`}
    </div>
  );
}

export default App;
`;
}

/**
 * Generate JSX for a single field
 * Handles different field types and applies style overrides
 */
function generateFieldComponent(field: FieldModel, theme: any): string {
  const { id, key, type, label, required, ui } = field;
  const placeholder = ui?.placeholder || '';
  const helpText = ui?.helpText;
  const overrides = ui?.styleOverrides;

  // Build style object if there are overrides
  const hasStyleOverrides = overrides && Object.keys(overrides).length > 0;
  const styleObject = hasStyleOverrides ? `
          '--field-label-color': '${overrides.labelColor || ''}',
          '--field-input-text-color': '${overrides.inputTextColor || ''}',
          '--field-bg-color': '${overrides.backgroundColor || ''}',
          '--field-border-color': '${overrides.borderColor || ''}',
          '--color-primary': '${overrides.focusColor || theme.colors.primary}',
        `.trim() : '';

  const fieldStyle = hasStyleOverrides ? `style={{ ${styleObject} } as React.CSSProperties}` : '';

  if (type === 'group') {
    const children = field.children || [];
    const childComponents = children.map(child => generateFieldComponent(child, theme)).join('\n');

    return `<fieldset className="field-group" ${fieldStyle} style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '4px', 
            padding: '1rem', 
            marginBottom: '1.5rem' 
        }}>
          <legend className="field-legend" style={{ 
            padding: '0 0.5rem', 
            fontWeight: 600 
          }}>${escapeHtml(label)}</legend>
          ${childComponents}
        </fieldset>`;
  }

  // Generate input element based on field type
  let inputElement: string;

  switch (type) {
    case 'textarea':
      inputElement = `<textarea
            name="${key}"
            id="${id}"
            className="field-input"
            placeholder="${escapeHtml(placeholder)}"
            ${required ? 'required' : ''}
          />`;
      break;

    case 'select':
      const options = field.constraints?.enum || [];
      inputElement = `<select
            name="${key}"
            id="${id}"
            className="field-input"
            ${required ? 'required' : ''}
          >
            <option value="">${escapeHtml(placeholder) || 'Select...'}</option>
            ${options.map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('\n            ')}
          </select>`;
      break;

    case 'checkbox':
      inputElement = `<input
            type="checkbox"
            name="${key}"
            id="${id}"
            className="field-input"
            style={{ width: 'auto', marginRight: '0.5rem' }}
          />`;
      break;

    default:
      // text, email, password, number, date
      inputElement = `<input
            type="${type}"
            name="${key}"
            id="${id}"
            className="field-input"
            placeholder="${escapeHtml(placeholder)}"
            ${required ? 'required' : ''}
          />`;
  }

  // For Checkbox, render input before label or wrapping differently?
  // Current design is generic wrapper. Let's keep it consistent for now.

  const isCheckbox = type === 'checkbox';

  if (isCheckbox) {
    return `        <div className="field-item checkbox-item" ${fieldStyle} style={{ display: 'flex', alignItems: 'center' }}>
           ${inputElement}
           <label htmlFor="${id}" className="field-label" style={{ marginBottom: 0 }}>
             ${escapeHtml(label)}
             ${required ? '<span className="required">*</span>' : ''}
           </label>
           ${helpText ? `<small className="field-help-text" style={{ marginLeft: 'auto' }}>${escapeHtml(helpText)}</small>` : ''}
         </div>`;
  }

  return `        <div className="field-item" ${fieldStyle}>
          <label htmlFor="${id}" className="field-label">
            ${escapeHtml(label)}
            ${required ? '<span className="required">*</span>' : ''}
          </label>
          ${inputElement}
          ${helpText ? `<small className="field-help-text">${escapeHtml(helpText)}</small>` : ''}
        </div>`;
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
