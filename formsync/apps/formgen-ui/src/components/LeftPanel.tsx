import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { FieldModel } from '@formsync/formgen-core';

export const LeftPanel: React.FC = () => {
    const { state, dispatch } = useBuilder();

    // Sort fields based on layout order (if present)
    const orderedFields = state.form.layout.order
        .map((id) => state.form.fields.find((f) => f.id === id))
        .filter((f): f is FieldModel => !!f);

    // Also include any fields not in layout order (fallback)
    const unlistedFields = state.form.fields.filter(
        f => !state.form.layout.order.includes(f.id)
    );

    const displayFields = [...orderedFields, ...unlistedFields];

    return (
        <div className="panel">
            <div className="panel-header">Field Explorer</div>
            <div className="panel-content">
                <div className="text-muted" style={{ marginBottom: '1rem' }}>
                    {displayFields.length} Fields Defined
                </div>

                {displayFields.map((field) => (
                    <div
                        key={field.id}
                        className={`field-item ${state.selectedFieldId === field.id ? 'selected' : ''}`}
                        onClick={() => dispatch({ type: 'SELECT_FIELD', payload: field.id })}
                    >
                        <div className="field-label">{field.label}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Type: {field.type} | Key: {field.key}
                        </div>
                    </div>
                ))}

                {displayFields.length === 0 && (
                    <div className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>
                        No fields found in model.
                    </div>
                )}
            </div>
        </div>
    );
};
