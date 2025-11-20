import React from 'react';
import { useBuilder } from '../context/BuilderContext';

export const Canvas: React.FC = () => {
    const { state, dispatch } = useBuilder();
    const { form, selectedFieldId } = state;

    // Derive ordered fields
    const orderedFields = form.layout.order
        .map(id => form.fields.find(f => f.id === id))
        .filter(f => !!f);

    // Apply Theme
    const densityMap = {
        compact: '8px',
        normal: '12px',
        comfortable: '16px',
    };

    const themeStyles = {
        // Colors
        '--color-primary': form.theme.colors.primary,
        '--color-bg': form.theme.colors.background,
        '--color-surface': form.theme.colors.surface,
        '--color-text': form.theme.colors.text,
        '--color-muted': form.theme.colors.muted,
        '--color-border': form.theme.colors.border,
        '--color-error': form.theme.colors.error,

        // Geometry
        '--border-radius': `${form.theme.radius}px`,
        '--spacing-unit': densityMap[form.theme.density] || '12px',

        // Typography
        '--font-family': form.theme.typography.fontFamily,
        '--font-size-base': `${form.theme.typography.baseFontSize}px`,
    } as React.CSSProperties;

    return (
        <div className="canvas-area">
            <div className="form-preview" style={themeStyles}>
                <h1 className="form-title">{form.meta?.title || form.name}</h1>
                {form.meta?.description && (
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>
                        {form.meta.description}
                    </p>
                )}

                {orderedFields.map((field) => (
                    <div
                        key={field.id}
                        className={`field-item ${selectedFieldId === field.id ? 'selected' : ''}`}
                        style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'SELECT_FIELD', payload: field.id });
                        }}
                    >
                        <label className="field-label" style={{ marginBottom: '0.5rem' }}>
                            {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                        </label>

                        {/* Enhanced Placeholder Input Render */}
                        <div className="field-input-mock" style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 0.5rem',
                            color: field.ui?.placeholder ? '#999' : 'transparent',
                            fontStyle: 'italic'
                        }}>
                            {field.ui?.placeholder || 'Input...'}
                        </div>

                        {field.ui?.helpText && (
                            <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                                {field.ui.helpText}
                            </small>
                        )}
                    </div>
                ))}

                {orderedFields.length === 0 && (
                    <div className="text-muted" style={{ textAlign: 'center', padding: '4rem', border: '2px dashed #eee' }}>
                        Form is empty.
                    </div>
                )}
            </div>
        </div>
    );
};
