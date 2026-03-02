import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { FieldModel } from '../types';

interface FieldRendererProps {
    field: FieldModel;
    selectedFieldId: string | null;
    dispatch: any;
    theme: any;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, selectedFieldId, dispatch, theme }) => {
    const overrides = field.ui?.styleOverrides;
    const fieldStyles: React.CSSProperties = {
        marginBottom: '1.5rem',
        cursor: 'pointer',
        // @ts-ignore - Dynamic CSS variables
        '--field-label-color': overrides?.labelColor,
        '--field-input-text-color': overrides?.inputTextColor,
        '--field-bg-color': overrides?.backgroundColor,
        '--field-border-color': overrides?.borderColor,
        '--color-primary': overrides?.focusColor || theme.colors.primary,
    };

    const isSelected = selectedFieldId === field.id;

    if (field.type === 'group') {
        return (
            <fieldset
                key={field.id}
                className={`field-group ${isSelected ? 'selected' : ''}`}
                style={{ ...fieldStyles, border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius, 4px)', padding: '1rem' }}
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SELECT_FIELD', payload: field.id }); }}
            >
                <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: overrides?.labelColor || theme.colors.text }}>
                    {field.label}
                </legend>
                {field.children?.map(child => (
                    <FieldRenderer key={child.id} field={child} selectedFieldId={selectedFieldId} dispatch={dispatch} theme={theme} />
                ))}
            </fieldset>
        );
    }

    return (
        <div
            key={field.id}
            className={`field-item ${isSelected ? 'selected' : ''}`}
            style={fieldStyles}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SELECT_FIELD', payload: field.id }); }}
        >
            <label className="field-label" style={{ marginBottom: '0.5rem' }}>
                {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="field-input-mock" style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', color: field.ui?.placeholder ? '#999' : 'transparent', fontStyle: 'italic' }}>
                {field.ui?.placeholder || 'Input...'}
            </div>
            {field.ui?.helpText && (
                <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                    {field.ui.helpText}
                </small>
            )}
        </div>
    );
};

export const Canvas: React.FC = () => {
    const { state, dispatch } = useBuilder();
    const { form, selectedFieldId } = state;

    const orderedFields = form.layout.order
        .map(id => form.fields.find(f => f.id === id))
        .filter((f): f is FieldModel => !!f);

    const densityMap: Record<string, string> = { compact: '8px', normal: '12px', comfortable: '16px' };

    const themeStyles = {
        '--color-primary': form.theme.colors.primary,
        '--color-bg': form.theme.colors.background,
        '--color-surface': form.theme.colors.surface,
        '--color-text': form.theme.colors.text,
        '--color-muted': form.theme.colors.muted,
        '--color-border': form.theme.colors.border,
        '--color-error': form.theme.colors.error,
        '--color-input-bg': form.theme.colors.inputBackground,
        '--border-radius': `${form.theme.radius}px`,
        '--spacing-unit': densityMap[form.theme.density] || '12px',
        '--font-family': form.theme.typography.fontFamily,
        '--font-size-base': `${form.theme.typography.baseFontSize}px`,
    } as React.CSSProperties;

    return (
        <div className="canvas-area" onClick={() => dispatch({ type: 'SELECT_FIELD', payload: null })}>
            <div className="form-preview" style={themeStyles} onClick={(e) => e.stopPropagation()}>
                <h1 className="form-title">{form.meta?.title || form.name}</h1>
                {form.meta?.description && (
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>{form.meta.description}</p>
                )}
                {orderedFields.map((field) => (
                    <FieldRenderer key={field.id} field={field} selectedFieldId={selectedFieldId} dispatch={dispatch} theme={form.theme} />
                ))}
                {orderedFields.length === 0 && (
                    <div className="text-muted" style={{ textAlign: 'center', padding: '4rem', border: '2px dashed #eee' }}>
                        Form is empty.
                    </div>
                )}
                <div style={{ marginTop: '2rem' }}>
                    <button style={{ width: '100%', padding: 'calc(var(--spacing-unit, 12px) * 1.25)', backgroundColor: form.submit?.color || 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius, 4px)', fontSize: '1rem', fontWeight: 500, cursor: 'pointer' }}>
                        {form.submit?.text || 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};
