import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { FieldModel, ThemeConfig } from '@formsync/formgen-core';

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

    const handleThemeUpdate = (updates: Partial<ThemeConfig>) => {
        dispatch({
            type: 'UPDATE_THEME',
            payload: updates,
        });
    }

    if (!selectedField) {
        // --- Theme Editor ---
        return (
            <div className="panel">
                <div className="panel-header">Global Theme Settings</div>
                <div className="panel-content">
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                        Customize the look and feel of your form.
                    </p>

                    {/* Primary Color */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="field-label">Primary Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={state.form.theme.primaryColor || '#000000'}
                                onChange={(e) => handleThemeUpdate({ primaryColor: e.target.value })}
                                style={{ cursor: 'pointer', height: '36px', width: '36px', border: 'none', padding: 0 }}
                            />
                            <span className="text-muted">{state.form.theme.primaryColor}</span>
                        </div>
                    </div>

                    {/* Border Radius */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="field-label">Border Radius: {state.form.theme.radius}px</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={state.form.theme.radius || 4}
                            onChange={(e) => handleThemeUpdate({ radius: parseInt(e.target.value) })}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>

                    {/* Font Family */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="field-label">Typography</label>
                        <select
                            className="field-input-mock"
                            style={{ pointerEvents: 'auto', padding: '0 0.5rem' }}
                            value={state.form.theme.fontFamily || 'sans-serif'}
                            onChange={(e) => handleThemeUpdate({ fontFamily: e.target.value })}
                        >
                            <option value="Inter, sans-serif">Inter (Default)</option>
                            <option value="'Courier New', monospace">Monospace</option>
                            <option value="'Times New Roman', serif">Serif</option>
                            <option value="Arial, sans-serif">Arial</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    // --- Field Editor ---
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
