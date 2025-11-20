import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { FieldModel } from '@formsync/formgen-core';

export const RightPanel: React.FC = () => {
    const { state, dispatch } = useBuilder();
    const selectedField = state.form.fields.find((f) => f.id === state.selectedFieldId);

    const handleUpdate = (updates: Partial<FieldModel>) => {
        if (!selectedField) return;
        dispatch({
            type: 'UPDATE_FIELD',
            payload: { fieldId: selectedField.id, updates },
        });
    };

    const handleUiUpdate = (key: string, value: any) => {
        if (!selectedField) return;
        handleUpdate({
            ui: { ...selectedField.ui, [key]: value },
        });
    };

    if (!selectedField) {
        return (
            <div className="panel">
                <div className="panel-header">Properties</div>
                <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="text-muted">Select a field to view properties</span>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="panel-header">Properties: {selectedField.key}</div>
            <div className="panel-content">
                {/* Label */}
                <div style={{ marginBottom: '1rem' }}>
                    <label className="field-label">Label</label>
                    <input
                        className="field-input-mock"
                        style={{ pointerEvents: 'auto' }}
                        value={selectedField.label}
                        onChange={(e) => handleUpdate({ label: e.target.value })}
                    />
                </div>

                {/* Type (Read-only for now) */}
                <div style={{ marginBottom: '1rem' }}>
                    <label className="field-label">Type</label>
                    <div className="field-input-mock" style={{ padding: '0.5rem', background: '#f5f5f5' }}>
                        {selectedField.type}
                    </div>
                </div>

                {/* Required */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={selectedField.required}
                            onChange={(e) => handleUpdate({ required: e.target.checked })}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Required Field
                    </label>
                </div>

                {/* Placeholder */}
                <div style={{ marginBottom: '1rem' }}>
                    <label className="field-label">Placeholder</label>
                    <input
                        className="field-input-mock"
                        style={{ pointerEvents: 'auto' }}
                        value={selectedField.ui?.placeholder || ''}
                        onChange={(e) => handleUiUpdate('placeholder', e.target.value)}
                        placeholder="e.g. Enter your name..."
                    />
                </div>

                {/* Help Text */}
                <div style={{ marginBottom: '1rem' }}>
                    <label className="field-label">Help Text</label>
                    <textarea
                        className="field-input-mock"
                        style={{ pointerEvents: 'auto', height: '60px', padding: '0.5rem', resize: 'vertical' }}
                        value={selectedField.ui?.helpText || ''}
                        onChange={(e) => handleUiUpdate('helpText', e.target.value)}
                        placeholder="Description below the field..."
                    />
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <small className="text-muted">Debug ID: {selectedField.id}</small>
                </div>
            </div>
        </div>
    );
};
