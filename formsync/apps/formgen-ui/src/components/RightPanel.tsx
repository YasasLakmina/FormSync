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

    const handleColorUpdate = (key: keyof ThemeConfig['colors'], value: string) => {
        handleThemeUpdate({
            colors: {
                ...state.form.theme.colors,
                [key]: value
            }
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

                    {/* Mode & Density */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="field-label">Mode</label>
                            <select
                                className="field-input-mock"
                                style={{ pointerEvents: 'auto', padding: '0 0.5rem' }}
                                value={state.form.theme.mode}
                                onChange={(e) => handleThemeUpdate({ mode: e.target.value as any })}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Density</label>
                            <select
                                className="field-input-mock"
                                style={{ pointerEvents: 'auto', padding: '0 0.5rem' }}
                                value={state.form.theme.density}
                                onChange={(e) => handleThemeUpdate({ density: e.target.value as any })}
                            >
                                <option value="compact">Compact</option>
                                <option value="normal">Normal</option>
                                <option value="comfortable">Comfortable</option>
                            </select>
                        </div>
                    </div>

                    <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #eee' }}>Palette</h4>

                    {/* Colors Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="field-label">Primary</label>
                            <input
                                type="color"
                                style={{ width: '100%', height: '36px', cursor: 'pointer' }}
                                value={state.form.theme.colors.primary}
                                onChange={(e) => handleColorUpdate('primary', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="field-label">Background</label>
                            <input
                                type="color"
                                style={{ width: '100%', height: '36px', cursor: 'pointer' }}
                                value={state.form.theme.colors.background}
                                onChange={(e) => handleColorUpdate('background', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="field-label">Surface</label>
                            <input
                                type="color"
                                style={{ width: '100%', height: '36px', cursor: 'pointer' }}
                                value={state.form.theme.colors.surface}
                                onChange={(e) => handleColorUpdate('surface', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="field-label">Text</label>
                            <input
                                type="color"
                                style={{ width: '100%', height: '36px', cursor: 'pointer' }}
                                value={state.form.theme.colors.text}
                                onChange={(e) => handleColorUpdate('text', e.target.value)}
                            />
                        </div>
                    </div>

                    <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #eee' }}>Typography & Shape</h4>

                    {/* Border Radius */}
                    <div style={{ marginBottom: '1rem' }}>
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
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="field-label">Font Family</label>
                        <select
                            className="field-input-mock"
                            style={{ pointerEvents: 'auto', padding: '0 0.5rem' }}
                            value={state.form.theme.typography.fontFamily}
                            onChange={(e) => handleThemeUpdate({
                                typography: { ...state.form.theme.typography, fontFamily: e.target.value }
                            })}
                        >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="'Courier New', monospace">Monospace</option>
                            <option value="'Times New Roman', serif">Serif</option>
                            <option value="Arial, sans-serif">Arial</option>
                        </select>
                    </div>

                    {/* Base Font Size */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="field-label">Base Size: {state.form.theme.typography.baseFontSize}px</label>
                        <input
                            type="range"
                            min="12"
                            max="24"
                            value={state.form.theme.typography.baseFontSize}
                            onChange={(e) => handleThemeUpdate({
                                typography: { ...state.form.theme.typography, baseFontSize: parseInt(e.target.value) }
                            })}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // --- Field Editor (Unchanged) ---
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
