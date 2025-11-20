import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { FieldModel, ThemeConfig } from '@formsync/formgen-core';

const THEME_PRESETS = {
    light: {
        primary: '#3b82f6',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#111827',
        muted: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        inputBackground: '#ffffff',
    },
    dark: {
        primary: '#60a5fa',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        muted: '#9ca3af',
        border: '#374151',
        error: '#f87171',
        inputBackground: '#374151',
    }
};

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
                    <div className="settings-row">
                        <div className="settings-group">
                            <label className="control-label">Mode</label>
                            <select
                                className="control-input"
                                value={state.form.theme.mode}
                                onChange={(e) => {
                                    const newMode = e.target.value as 'light' | 'dark';
                                    handleThemeUpdate({
                                        mode: newMode,
                                        colors: THEME_PRESETS[newMode] // Apply preset
                                    });
                                }}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div className="settings-group">
                            <label className="control-label">Density</label>
                            <select
                                className="control-input"
                                value={state.form.theme.density}
                                onChange={(e) => handleThemeUpdate({ density: e.target.value as any })}
                            >
                                <option value="compact">Compact</option>
                                <option value="normal">Normal</option>
                                <option value="comfortable">Comfortable</option>
                            </select>
                        </div>
                    </div>

                    <h4 className="settings-section-title">Palette</h4>

                    {/* Colors Grid */}
                    <div className="settings-grid">
                        <div className="settings-group">
                            <label className="control-label">Primary</label>
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    className="color-picker"
                                    value={state.form.theme.colors.primary}
                                    onChange={(e) => handleColorUpdate('primary', e.target.value)}
                                />
                                <span className="color-value">{state.form.theme.colors.primary}</span>
                            </div>
                        </div>
                        <div className="settings-group">
                            <label className="control-label">Background</label>
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    className="color-picker"
                                    value={state.form.theme.colors.background}
                                    onChange={(e) => handleColorUpdate('background', e.target.value)}
                                />
                                <span className="color-value">{state.form.theme.colors.background}</span>
                            </div>
                        </div>
                        <div className="settings-group">
                            <label className="control-label">Surface</label>
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    className="color-picker"
                                    value={state.form.theme.colors.surface}
                                    onChange={(e) => handleColorUpdate('surface', e.target.value)}
                                />
                                <span className="color-value">{state.form.theme.colors.surface}</span>
                            </div>
                        </div>
                        <div className="settings-group">
                            <label className="control-label">Text</label>
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    className="color-picker"
                                    value={state.form.theme.colors.text}
                                    onChange={(e) => handleColorUpdate('text', e.target.value)}
                                />
                                <span className="color-value">{state.form.theme.colors.text}</span>
                            </div>
                        </div>
                        <div className="settings-group">
                            <label className="control-label">Input Bg</label>
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    className="color-picker"
                                    value={state.form.theme.colors.inputBackground}
                                    onChange={(e) => handleColorUpdate('inputBackground', e.target.value)}
                                />
                                <span className="color-value">{state.form.theme.colors.inputBackground}</span>
                            </div>
                        </div>
                    </div>

                    <h4 className="settings-section-title">Typography & Shape</h4>

                    {/* Border Radius */}
                    <div className="settings-group">
                        <label className="control-label">Border Radius: {state.form.theme.radius}px</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            className="range-input"
                            value={state.form.theme.radius || 4}
                            onChange={(e) => handleThemeUpdate({ radius: parseInt(e.target.value) })}
                        />
                    </div>

                    {/* Font Family */}
                    <div className="settings-group">
                        <label className="control-label">Font Family</label>
                        <select
                            className="control-input"
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
                    <div className="settings-group">
                        <label className="control-label">Base Size: {state.form.theme.typography.baseFontSize}px</label>
                        <input
                            type="range"
                            min="12"
                            max="24"
                            className="range-input"
                            value={state.form.theme.typography.baseFontSize}
                            onChange={(e) => handleThemeUpdate({
                                typography: { ...state.form.theme.typography, baseFontSize: parseInt(e.target.value) }
                            })}
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
                <div className="settings-group">
                    <label className="control-label">Label</label>
                    <input
                        className="control-input"
                        value={selectedField.label}
                        onChange={(e) => handleUpdate({ label: e.target.value })}
                    />
                </div>

                {/* Type (Read-only) */}
                <div className="settings-group">
                    <label className="control-label">Type</label>
                    <div className="control-input" style={{ background: '#f5f5f5', color: '#666' }}>
                        {selectedField.type}
                    </div>
                </div>

                {/* Required */}
                <div className="settings-group">
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
                <div className="settings-group">
                    <label className="control-label">Placeholder</label>
                    <input
                        className="control-input"
                        value={selectedField.ui?.placeholder || ''}
                        onChange={(e) => handleUiUpdate('placeholder', e.target.value)}
                        placeholder="e.g. Enter your name..."
                    />
                </div>

                {/* Help Text */}
                <div className="settings-group">
                    <label className="control-label">Help Text</label>
                    <textarea
                        className="control-input"
                        style={{ height: '80px', resize: 'vertical', paddingTop: '0.5rem' }}
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
