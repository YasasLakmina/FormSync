import React from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useBuilder, findFieldInTree, createField, collectAllFieldKeys } from '../context/BuilderContext';
import { FieldModel, FieldType, ThemeConfig, ConditionRule, ConditionOperator, FieldConditions } from '../types';

/** Field types that can be added as repeater column / row content (nested repeaters omitted — unsupported in export). */
const REPEATER_CHILD_TYPES: { type: FieldType; label: string }[] = [
    { type: 'text', label: 'Text' },
    { type: 'email', label: 'Email' },
    { type: 'password', label: 'Password' },
    { type: 'number', label: 'Number' },
    { type: 'date', label: 'Date' },
    { type: 'select', label: 'Dropdown' },
    { type: 'textarea', label: 'Text area' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'file', label: 'File' },
    { type: 'richtext', label: 'Rich text' },
    { type: 'signature', label: 'Signature' },
    { type: 'typeahead', label: 'Typeahead' },
    { type: 'calculated', label: 'Calculated' },
];

const THEME_PRESETS = {
    light: {
        primary: '#6366f1', background: '#ffffff', surface: '#f8fafc',
        text: '#1e293b', muted: '#64748b', border: '#e2e8f0', error: '#ef4444', inputBackground: '#ffffff',
    },
    dark: {
        primary: '#818cf8', background: '#0f172a', surface: '#1e293b',
        text: '#f1f5f9', muted: '#94a3b8', border: '#334155', error: '#f87171', inputBackground: '#1e293b',
    },
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const Group: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="settings-group">
        <label className="control-label">{label}</label>
        {children}
    </div>
);

const Divider: React.FC<{ title: string }> = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0 0.75rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
    </div>
);

// ─── Condition Builder ────────────────────────────────────────────────────────

const OPERATORS: { value: ConditionOperator; label: string }[] = [
    { value: 'eq', label: 'equals' },
    { value: 'neq', label: 'not equals' },
    { value: 'gt', label: 'greater than' },
    { value: 'lt', label: 'less than' },
    { value: 'gte', label: 'greater or equal' },
    { value: 'lte', label: 'less or equal' },
    { value: 'contains', label: 'contains' },
    { value: 'in', label: 'one of (comma-sep)' },
    { value: 'notEmpty', label: 'is not empty' },
];

const ConditionBuilder: React.FC<{
    fields: FieldModel[];
    conditions: FieldConditions | undefined;
    onChange: (c: FieldConditions | undefined) => void;
}> = ({ fields, conditions, onChange }) => {
    const rules = conditions?.rules ?? [];

    const addRule = () =>
        onChange({ rules: [...rules, { fieldKey: fields[0]?.key ?? '', operator: 'notEmpty' as ConditionOperator }] });

    const removeRule = (i: number) => {
        const next = rules.filter((_, idx) => idx !== i);
        onChange(next.length === 0 ? undefined : { rules: next });
    };

    const updateRule = (i: number, patch: Partial<ConditionRule>) =>
        onChange({ rules: rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

    const sel: React.CSSProperties = {
        fontSize: '0.78rem', padding: '3px 5px',
        border: '1px solid #e2e8f0', borderRadius: 4, flex: '1 1 auto', minWidth: 0,
    };

    return (
        <div>
            {rules.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    No conditions — always visible.
                </p>
            ) : (
                rules.map((rule, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 5, padding: '0.5rem', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <select value={rule.fieldKey} onChange={(e) => updateRule(i, { fieldKey: e.target.value })} style={sel}>
                                {fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                            </select>
                            <select value={rule.operator} onChange={(e) => updateRule(i, { operator: e.target.value as ConditionOperator })} style={sel}>
                                {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            {rule.operator !== 'notEmpty' && (
                                <input
                                    value={rule.value !== undefined ? String(rule.value) : ''}
                                    onChange={(e) => updateRule(i, { value: e.target.value })}
                                    placeholder="value"
                                    style={{ ...sel, flex: '0 0 70px' }}
                                />
                            )}
                            <button onClick={() => removeRule(i)} style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>
                                ×
                            </button>
                        </div>
                    </div>
                ))
            )}
            <button
                onClick={addRule}
                style={{ width: '100%', padding: '0.4rem', border: '1px dashed #c7d2fe', borderRadius: 5, background: '#f5f3ff', color: '#4338ca', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500 }}
            >
                + Add condition
            </button>
            {rules.length > 1 && <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.25rem' }}>All rules must match (AND).</p>}
        </div>
    );
};

// ─── Color Row ────────────────────────────────────────────────────────────────

const ColorRow: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
    <div className="settings-group">
        <label className="control-label">{label}</label>
        <div className="color-input-wrapper">
            <input type="color" className="color-picker" value={value} onChange={(e) => onChange(e.target.value)} />
            <span className="color-value">{value}</span>
        </div>
    </div>
);

// ─── Generate Code footer (theme panel + field inspector) ───────────────────

const GenerateCodeFooter: React.FC<{
    onGenerate?: () => void;
    isGenerating: boolean;
}> = ({ onGenerate, isGenerating }) => (
    <div className="panel-footer">
        <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !onGenerate}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.6rem 1rem' }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            {isGenerating ? 'Generating…' : 'Generate Code'}
        </button>
    </div>
);

// ─── Right Panel ──────────────────────────────────────────────────────────────

interface RightPanelProps {
    onGenerate?: () => void;
    isGenerating?: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({
    onGenerate,
    isGenerating = false,
}) => {
    const { state, dispatch, isWizardMode } = useBuilder();
    // Search recursively so group child fields are also found
    const selectedField = state.selectedFieldId
        ? findFieldInTree(state.form.fields, state.selectedFieldId)
        : undefined;

    const handleUpdate = (updates: Partial<FieldModel>) => {
        if (!selectedField) return;
        dispatch({ type: 'UPDATE_FIELD', payload: { fieldId: selectedField.id, updates } });
    };

    // Dispatch a single ui key change — the reducer deep-merges ui, so
    // this won't overwrite other ui keys (x-ui, x-conditions, helpText, etc.)
    const handleUiUpdate = (key: string, value: unknown) => {
        if (!selectedField) return;
        dispatch({
            type: 'UPDATE_FIELD',
            payload: { fieldId: selectedField.id, updates: { ui: { [key]: value } as FieldModel['ui'] } },
        });
    };

    // x-ui is nested inside ui.  We need to merge into the existing x-ui object.
    // Read the LATEST value straight from state (stale-closure safe).
    const handleXUIUpdate = (patch: Record<string, unknown>) => {
        if (!selectedField) return;
        const currentXUI = state.form.fields.find((f) => f.id === selectedField.id)?.ui?.['x-ui'] ?? {};
        handleUiUpdate('x-ui', { ...currentXUI, ...patch });
    };

    const addRepeaterColumnField = (type: FieldType) => {
        if (!selectedField || selectedField.type !== 'repeater') return;
        if (type === 'repeater') return;
        const keys = collectAllFieldKeys(state.form.fields);
        const stepIndex = isWizardMode ? state.activeStep : undefined;
        const newChild = createField(type, stepIndex, keys);
        const nextChildren = [...(selectedField.children ?? []), newChild];
        dispatch({
            type: 'UPDATE_FIELD',
            payload: { fieldId: selectedField.id, updates: { children: nextChildren } },
        });
        dispatch({ type: 'SELECT_FIELD', payload: newChild.id });
    };

    const removeRepeaterColumn = (parentRepeaterId: string, childId: string) => {
        dispatch({ type: 'REMOVE_FIELD', payload: childId });
        dispatch({ type: 'SELECT_FIELD', payload: parentRepeaterId });
    };

    const moveRepeaterColumn = (parentRepeaterId: string, fromIndex: number, delta: -1 | 1) => {
        const parent = findFieldInTree(state.form.fields, parentRepeaterId);
        if (!parent || parent.type !== 'repeater') return;
        const children = [...(parent.children ?? [])];
        const toIndex = fromIndex + delta;
        if (toIndex < 0 || toIndex >= children.length) return;
        const [row] = children.splice(fromIndex, 1);
        children.splice(toIndex, 0, row);
        dispatch({
            type: 'UPDATE_FIELD',
            payload: { fieldId: parentRepeaterId, updates: { children } },
        });
    };

    const handleThemeUpdate = (updates: Partial<ThemeConfig>) =>
        dispatch({ type: 'UPDATE_THEME', payload: updates });

    const handleColorUpdate = (key: keyof ThemeConfig['colors'], value: string) =>
        handleThemeUpdate({ colors: { ...state.form.theme.colors, [key]: value } });

    // ── Global theme panel ─────────────────────────────────────────────────────

    if (!selectedField) {
        return (
            <div className="panel">
                <div className="panel-header">Theme Settings</div>
                <div className="panel-content">
                    <div className="settings-row">
                        <Group label="Mode">
                            <select
                                className="control-input"
                                value={state.form.theme.mode}
                                onChange={(e) => {
                                    const newMode = e.target.value as 'light' | 'dark';
                                    const cur = state.form.theme.mode;
                                    const updatedSchemes = { ...(state.form.theme.schemes ?? { light: THEME_PRESETS.light, dark: THEME_PRESETS.dark }), [cur]: state.form.theme.colors };
                                    const newColors = updatedSchemes[newMode] ?? THEME_PRESETS[newMode];
                                    handleThemeUpdate({ mode: newMode, colors: newColors, schemes: updatedSchemes });
                                }}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </Group>
                        <Group label="Density">
                            <select className="control-input" value={state.form.theme.density} onChange={(e) => handleThemeUpdate({ density: e.target.value as ThemeConfig['density'] })}>
                                <option value="compact">Compact</option>
                                <option value="normal">Normal</option>
                                <option value="comfortable">Comfortable</option>
                            </select>
                        </Group>
                    </div>

                    <Divider title="Palette" />
                    <div className="settings-grid">
                        {(['primary', 'background', 'surface', 'text', 'inputBackground'] as const).map((key) => (
                            <ColorRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} value={state.form.theme.colors[key]} onChange={(v) => handleColorUpdate(key, v)} />
                        ))}
                    </div>

                    <Divider title="Typography & Shape" />
                    <Group label={`Border Radius: ${state.form.theme.radius}px`}>
                        <input type="range" min="0" max="20" className="range-input" value={state.form.theme.radius ?? 4} onChange={(e) => handleThemeUpdate({ radius: parseInt(e.target.value) })} />
                    </Group>
                    <Group label="Font Family">
                        <select className="control-input" value={state.form.theme.typography.fontFamily} onChange={(e) => handleThemeUpdate({ typography: { ...state.form.theme.typography, fontFamily: e.target.value } })}>
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="'DM Sans', sans-serif">DM Sans</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Courier New', monospace">Monospace</option>
                            <option value="'Times New Roman', serif">Serif</option>
                        </select>
                    </Group>
                    <Group label={`Base Size: ${state.form.theme.typography.baseFontSize}px`}>
                        <input type="range" min="12" max="24" className="range-input" value={state.form.theme.typography.baseFontSize} onChange={(e) => handleThemeUpdate({ typography: { ...state.form.theme.typography, baseFontSize: parseInt(e.target.value) } })} />
                    </Group>

                    <Divider title="Submit Button" />
                    <Group label="Button Text">
                        <input className="control-input" value={state.form.submit?.text ?? 'Submit'} onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { ...state.form, submit: { ...state.form.submit, text: e.target.value } } })} />
                    </Group>
                </div>

                <GenerateCodeFooter onGenerate={onGenerate} isGenerating={isGenerating} />
            </div>
        );
    }

    // ── Field editor ──────────────────────────────────────────────────────────

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xui = (selectedField.ui?.['x-ui'] as any) ?? {};
    const colSpan = xui.colSpan ?? 12;
    const otherFields = state.form.fields.filter((f) => f.id !== selectedField.id);

    return (
        <div className="panel">
            <div className="panel-header">
                {selectedField.label}
                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#94a3b8', fontWeight: 400, marginTop: 1 }}>{selectedField.type}</div>
            </div>
            <div className="panel-content">

                {/* Basics */}
                <Group label="Label">
                    <input className="control-input" value={selectedField.label} onChange={(e) => handleUpdate({ label: e.target.value })} />
                </Group>
                <div className="settings-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#374151' }}>
                        <input type="checkbox" checked={selectedField.required} onChange={(e) => handleUpdate({ required: e.target.checked })} />
                        Required
                    </label>
                </div>
                <Group label="Placeholder">
                    <input className="control-input" value={selectedField.ui?.placeholder ?? ''} onChange={(e) => handleUiUpdate('placeholder', e.target.value)} placeholder={`Enter ${selectedField.label.toLowerCase()}…`} />
                </Group>
                <Group label="Help Text">
                    <textarea className="control-input" style={{ height: '56px', resize: 'vertical', paddingTop: '0.5rem' }} value={selectedField.ui?.helpText ?? ''} onChange={(e) => handleUiUpdate('helpText', e.target.value)} placeholder="Describe this field…" />
                </Group>

                {selectedField.type === 'repeater' && (
                    <>
                        <Divider title="Repeater columns" />
                        <p style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: 1.45 }}>
                            Each field below is one table column (data table) or one block inside each repeated card (stacked cards). End users only add rows at runtime, not new columns.
                        </p>
                        {(selectedField.children ?? []).length === 0 ? (
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.45rem' }}>No columns yet — add a field type below.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.55rem' }}>
                                {(selectedField.children ?? []).map((c, idx, arr) => (
                                    <div
                                        key={c.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.25rem 0.35rem',
                                            borderRadius: 5,
                                            border: `1px solid ${state.selectedFieldId === c.id ? 'rgba(99,102,241,0.45)' : '#e2e8f0'}`,
                                            background: state.selectedFieldId === c.id ? 'rgba(99,102,241,0.07)' : '#fff',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            <button
                                                type="button"
                                                title="Move up"
                                                disabled={idx === 0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveRepeaterColumn(selectedField.id, idx, -1);
                                                }}
                                                style={{
                                                    padding: 0,
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                                    color: idx === 0 ? '#cbd5e1' : '#64748b',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                <ChevronUp size={14} strokeWidth={2} aria-hidden />
                                            </button>
                                            <button
                                                type="button"
                                                title="Move down"
                                                disabled={idx === arr.length - 1}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveRepeaterColumn(selectedField.id, idx, 1);
                                                }}
                                                style={{
                                                    padding: 0,
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: idx === arr.length - 1 ? 'not-allowed' : 'pointer',
                                                    color: idx === arr.length - 1 ? '#cbd5e1' : '#64748b',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                <ChevronDown size={14} strokeWidth={2} aria-hidden />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => dispatch({ type: 'SELECT_FIELD', payload: c.id })}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.25rem 0.35rem',
                                                fontSize: '0.75rem',
                                                border: 'none',
                                                borderRadius: 4,
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                color: '#334155',
                                                minWidth: 0,
                                            }}
                                        >
                                            <span style={{ fontWeight: state.selectedFieldId === c.id ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                                            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace', flexShrink: 0, marginLeft: 6 }}>{c.type}</span>
                                        </button>
                                        <button
                                            type="button"
                                            title="Remove column"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeRepeaterColumn(selectedField.id, c.id);
                                            }}
                                            style={{
                                                padding: '0.25rem',
                                                border: 'none',
                                                borderRadius: 4,
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                color: '#94a3b8',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            aria-label={`Remove ${c.label}`}
                                        >
                                            <Trash2 size={15} strokeWidth={2} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Add column</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem' }}>
                            {REPEATER_CHILD_TYPES.map(({ type, label }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => addRepeaterColumnField(type)}
                                    className="control-input"
                                    style={{
                                        padding: '0.35rem 0.25rem',
                                        fontSize: '0.68rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 5,
                                        background: '#f8fafc',
                                        color: '#475569',
                                    }}
                                >
                                    + {label}
                                </button>
                            ))}
                        </div>

                        <Divider title="Repeater layout" />
                        <Group label="Row layout">
                            <select
                                className="control-input"
                                value={(selectedField.ui as { displayMode?: string } | undefined)?.displayMode === 'table' ? 'table' : 'cards'}
                                onChange={(e) => handleUiUpdate('displayMode', e.target.value)}
                            >
                                <option value="cards">Stacked cards</option>
                                <option value="table">Data table</option>
                            </select>
                            <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.4 }}>
                                Use stacked cards for tall rows or a data table for dense grids; exports match this choice. Submit payloads use JSON arrays (your API must accept them). Nested repeaters inside a repeater are not supported in React or static HTML export.
                            </p>
                        </Group>
                    </>
                )}

                {/* Dropdown options — visible for select fields */}
                {(selectedField.type === 'select') && (
                    <>
                        <Divider title="Dropdown Options" />
                        <div style={{ marginBottom: '0.5rem' }}>
                            {(selectedField.constraints?.enum ?? []).length === 0 ? (
                                <p style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.4)', marginBottom: '0.4rem' }}>No options yet — add some below.</p>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                                    {(selectedField.constraints?.enum ?? []).map((opt, i) => (
                                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 5, padding: '2px 8px', fontSize: '0.78rem', color: '#000000' }}>
                                            {opt}
                                            <button
                                                onClick={() => {
                                                    const next = (selectedField.constraints?.enum ?? []).filter((_, idx) => idx !== i);
                                                    handleUpdate({ constraints: { ...selectedField.constraints, enum: next } });
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', padding: 0, lineHeight: 1, fontSize: '0.9rem' }}
                                            >×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <input
                                    className="control-input"
                                    placeholder="Add option…"
                                    style={{ flex: 1 }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = (e.currentTarget.value ?? '').trim();
                                            if (!val) return;
                                            const current = selectedField.constraints?.enum ?? [];
                                            if (!current.includes(val)) {
                                                handleUpdate({ constraints: { ...selectedField.constraints, enum: [...current, val] } });
                                            }
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <button
                                    style={{ padding: '0 0.75rem', background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 5, cursor: 'pointer', color: '#6366f1', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}
                                    onClick={(e) => {
                                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                        const val = (input?.value ?? '').trim();
                                        if (!val) return;
                                        const current = selectedField.constraints?.enum ?? [];
                                        if (!current.includes(val)) {
                                            handleUpdate({ constraints: { ...selectedField.constraints, enum: [...current, val] } });
                                        }
                                        input.value = '';
                                    }}
                                >+ Add</button>
                            </div>
                        </div>
                    </>
                )}

                {/* Step assignment */}
                {isWizardMode && state.form.layout.steps && state.form.layout.steps.length > 0 && (
                    <>
                        <Divider title="Step Assignment" />
                        <Group label="Assign to step">
                            <select className="control-input" value={selectedField.stepIndex ?? ''} onChange={(e) => handleUpdate({ stepIndex: e.target.value === '' ? undefined : parseInt(e.target.value) })}>
                                <option value="">All steps</option>
                                {state.form.layout.steps.map((step, i) => (
                                    <option key={step.id} value={i}>Step {i + 1}: {step.title}</option>
                                ))}
                            </select>
                        </Group>
                    </>
                )}

                {/* Grid layout */}
                <Divider title="Grid Layout" />
                <Group label={`Column span: ${colSpan} / 12`}>
                    <input type="range" min="1" max="12" className="range-input" value={colSpan} onChange={(e) => handleXUIUpdate({ colSpan: parseInt(e.target.value) })} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, marginTop: '0.4rem' }}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} style={{ height: 6, borderRadius: 2, background: i < colSpan ? 'var(--color-primary, #6366f1)' : '#e5e7eb', transition: 'background 0.1s' }} />
                        ))}
                    </div>
                </Group>

                {/* Conditional visibility */}
                <Divider title="Conditional Visibility" />
                {otherFields.length === 0 ? (
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Add more fields to configure conditions.</p>
                ) : (
                    <ConditionBuilder fields={otherFields} conditions={selectedField.ui?.['x-conditions']} onChange={(c) => handleUiUpdate('x-conditions', c)} />
                )}

                {/* Calculated fields */}
                {selectedField.type === 'calculated' && (
                    <>
                        <Divider title="Formula" />
                        <Group label="Expression">
                            <input className="control-input" value={selectedField['x-calc'] ?? ''} onChange={(e) => handleUpdate({ 'x-calc': e.target.value })} placeholder="{quantity} * {unitPrice}" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem' }}>Use &#123;fieldKey&#125; as placeholders. Supports +, -, *, /</p>
                        </Group>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                            {otherFields.filter((f) => f.type === 'number').map((f) => (
                                <button key={f.key} onClick={() => handleUpdate({ 'x-calc': `${selectedField['x-calc'] ?? ''}{${f.key}}` })}
                                    style={{ fontSize: '0.68rem', padding: '2px 7px', border: '1px solid #e2e8f0', borderRadius: 5, background: '#f8fafc', cursor: 'pointer', color: '#374151', fontFamily: 'monospace' }}>
                                    +&#123;{f.key}&#125;
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Typeahead */}
                {selectedField.type === 'typeahead' && (
                    <>
                        <Divider title="Async Source" />
                        <Group label="API URL">
                            <input className="control-input" value={xui.asyncSource?.url ?? ''} onChange={(e) => handleXUIUpdate({ asyncSource: { ...(xui.asyncSource ?? { debounceMs: 300 }), url: e.target.value } })} placeholder="https://api.example.com/search?q={query}" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
                        </Group>
                        <Group label={`Debounce: ${xui.asyncSource?.debounceMs ?? 300}ms`}>
                            <input type="range" min="100" max="1000" step="50" className="range-input" value={xui.asyncSource?.debounceMs ?? 300} onChange={(e) => handleXUIUpdate({ asyncSource: { ...(xui.asyncSource ?? { url: '' }), debounceMs: parseInt(e.target.value) } })} />
                        </Group>
                    </>
                )}

                {/* File upload */}
                {selectedField.type === 'file' && (
                    <>
                        <Divider title="File Upload" />
                        <Group label="Accepted types">
                            <input className="control-input" value={xui.accept ?? ''} onChange={(e) => handleXUIUpdate({ accept: e.target.value })} placeholder="image/*,.pdf" />
                        </Group>
                        <Group label="Max size (MB)">
                            <input type="number" className="control-input" min="0.1" step="0.5" value={xui.maxFileSizeBytes ? xui.maxFileSizeBytes / (1024 * 1024) : ''} onChange={(e) => handleXUIUpdate({ maxFileSizeBytes: parseFloat(e.target.value) * 1024 * 1024 })} placeholder="e.g. 5" />
                        </Group>
                        <div className="settings-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <input type="checkbox" checked={xui.multiple ?? false} onChange={(e) => handleXUIUpdate({ multiple: e.target.checked })} />
                                Allow multiple files
                            </label>
                        </div>
                    </>
                )}

                {/* Style overrides */}
                <Divider title="Style Overrides" />
                <div className="settings-grid">
                    {[
                        { key: 'labelColor', label: 'Label', fallback: state.form.theme.colors.text },
                        { key: 'inputTextColor', label: 'Input text', fallback: state.form.theme.colors.text },
                        { key: 'borderColor', label: 'Border', fallback: state.form.theme.colors.border },
                        { key: 'backgroundColor', label: 'Background', fallback: state.form.theme.colors.background },
                        { key: 'focusColor', label: 'Focus', fallback: state.form.theme.colors.primary },
                    ].map(({ key, label, fallback }) => (
                        <div className="settings-group" key={key}>
                            <label className="control-label">{label}</label>
                            <div className="color-input-wrapper">
                                <input type="color" className="color-picker" value={(selectedField.ui?.styleOverrides as Record<string, string> | undefined)?.[key] ?? fallback}
                                    onChange={(e) => handleUiUpdate('styleOverrides', { ...selectedField.ui?.styleOverrides, [key]: e.target.value })} />
                            </div>
                        </div>
                    ))}
                </div>
                <button style={{ width: '100%', padding: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}
                    onClick={() => handleUiUpdate('styleOverrides', undefined)}>
                    Reset to theme defaults
                </button>

                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <small style={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'monospace' }}>id: {selectedField.id}</small>
                </div>
            </div>

            <GenerateCodeFooter onGenerate={onGenerate} isGenerating={isGenerating} />
        </div>
    );
};
