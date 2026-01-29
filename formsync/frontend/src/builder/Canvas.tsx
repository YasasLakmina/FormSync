import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBuilder } from '../context/BuilderContext';
import { FieldModel } from '../types';
import { getPlugin } from './plugins/FieldPlugin';
import { filterVisibleFields, evaluateCalcExpression } from '../lib/conditionEngine';

// ── Register all plugins ───────────────────────────────────────────────────────
import './plugins/FileFieldPreview';
import './plugins/RichTextFieldPreview';
import './plugins/SignatureFieldPreview';
import './plugins/RepeaterFieldPreview';
import './plugins/TypeaheadFieldPreview';
import './plugins/CalculatedFieldPreview';

// ─── Generic Field Mock ───────────────────────────────────────────────────────

type StyleOverrides = Record<string, string>;

const GenericFieldMock: React.FC<{ field: FieldModel; overrides?: StyleOverrides }> = ({ field, overrides }) => {
    // Unique selector used to scope placeholder + focus-ring styles per field
    const scopeId = `fm-${field.id}`;

    const inputTextColor = overrides?.inputTextColor ?? 'var(--color-muted)';
    const borderColor = overrides?.borderColor ?? 'var(--color-border)';
    const bgColor = overrides?.backgroundColor ?? 'var(--color-input-bg)';
    // Focus ring: since inputs are disabled, :focus never fires in the builder.
    // Use the "white gap + outer ring" pattern so the focus ring is visually
    // distinct from the border (border = edge of the field; ring = outside it).
    // The 2px white shadow creates a gap between the border and the ring.
    const focusRing = overrides?.focusColor
        ? `0 0 0 2px white, 0 0 0 4px ${overrides.focusColor}`
        : undefined;

    const base: React.CSSProperties = {
        width: '100%',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--border-radius)',
        background: bgColor,
        padding: '0 0.75rem',
        color: inputTextColor,
        fontSize: 'var(--font-size-base)',
        pointerEvents: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        boxShadow: focusRing,
    };

    // Inject a scoped <style> so ::placeholder picks up the text color.
    // Inline `color:` on a disabled input does NOT affect placeholder text.
    const placeholderStyle = overrides?.inputTextColor
        ? `#${scopeId} input::placeholder, #${scopeId} textarea::placeholder, #${scopeId} select { color: ${overrides.inputTextColor} !important; opacity: 1; }`
        : null;

    if (field.type === 'checkbox') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                <input type="checkbox" readOnly style={{ width: 15, height: 15 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{field.label}</span>
            </div>
        );
    }

    const wrapId = scopeId;
    if (field.type === 'select') {
        return (
            <div id={wrapId}>
                {placeholderStyle && <style>{placeholderStyle}</style>}
                <select disabled style={{ ...base, height: '38px', width: '100%' }}>
                    <option>{field.ui?.placeholder ?? `Select ${field.label}…`}</option>
                    {field.constraints?.enum?.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
            </div>
        );
    }
    if (field.type === 'textarea') {
        return (
            <div id={wrapId}>
                {placeholderStyle && <style>{placeholderStyle}</style>}
                <textarea
                    readOnly disabled value=""
                    placeholder={field.ui?.placeholder ?? 'Enter text…'}
                    style={{ ...base, minHeight: '80px', padding: '0.5rem 0.75rem', resize: 'vertical', width: '100%' }}
                />
            </div>
        );
    }
    return (
        <div id={wrapId}>
            {placeholderStyle && <style>{placeholderStyle}</style>}
            <input
                type={field.type === 'password' ? 'password' : field.type === 'date' ? 'date' : 'text'}
                readOnly disabled
                placeholder={field.ui?.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
                style={{ ...base, height: '38px', width: '100%' }}
            />
        </div>
    );
};


// ─── Field Renderer ───────────────────────────────────────────────────────────

interface FieldRendererProps {
    field: FieldModel;
    isSelected: boolean;
    onSelect: (e?: React.MouseEvent) => void;
    /** Id of the currently selected field (needed for nested child highlighting) */
    selectedFieldId: string | null;
    /** Dispatch a child field selection request up to the Canvas */
    onSelectChild: (id: string) => void;
    theme: Record<string, string | number>;
    previewValues: Record<string, unknown>;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, isSelected, onSelect, selectedFieldId, onSelectChild, theme, previewValues }) => {
    const overrides = field.ui?.styleOverrides as StyleOverrides | undefined;
    const colSpan = field.ui?.['x-ui']?.colSpan ?? 12;
    const hasConditions = (field.ui?.['x-conditions']?.rules?.length ?? 0) > 0;
    const calcValue = field.type === 'calculated' && field['x-calc']
        ? evaluateCalcExpression(field['x-calc'], previewValues)
        : undefined;

    // Scope the focus color as a CSS variable on the field wrapper so the
    // browser's :focus ring picks it up via outline: var(--field-focus-color)
    const wrapVars = overrides?.focusColor
        ? { '--field-focus-color': overrides.focusColor } as React.CSSProperties
        : {};

    const wrapStyle: React.CSSProperties = {
        ...wrapVars,
        gridColumn: `span ${colSpan}`,
        padding: '0.65rem',
        border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
        borderRadius: 'var(--border-radius, 4px)',
        background: isSelected ? 'rgba(99,102,241,0.04)' : 'transparent',
        cursor: 'pointer',
        transition: 'border-color 0.12s',
    };

    // Group type — children are now selectable
    if (field.type === 'group') {
        return (
            <fieldset
                style={{
                    ...wrapStyle,
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border, #e5e7eb)',
                    padding: '1rem', borderRadius: 'var(--border-radius, 4px)',
                }}
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
                <legend style={{ padding: '0 0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    {field.label}
                </legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.65rem' }}>
                    {field.children?.map((child) => (
                        <FieldRenderer
                            key={child.id}
                            field={child}
                            isSelected={selectedFieldId === child.id}
                            onSelect={(e?: React.MouseEvent) => { e?.stopPropagation(); onSelectChild(child.id); }}
                            theme={theme}
                            previewValues={previewValues}
                            selectedFieldId={selectedFieldId}
                            onSelectChild={onSelectChild}
                        />
                    ))}
                </div>
            </fieldset>
        );
    }

    const Plugin = getPlugin(field.type);
    const showCalc = calcValue !== undefined;

    return (
        <div style={wrapStyle} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            {/* Label row */}
            {field.type !== 'checkbox' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: overrides?.labelColor || 'var(--color-text)' }}>
                        {field.label}
                        {field.required && <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>}
                    </label>
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        {colSpan < 12 && (
                            <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: 8, background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}>
                                {colSpan}/12
                            </span>
                        )}
                        {hasConditions && (
                            <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: 8, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                                Conditional
                            </span>
                        )}
                        {field.stepIndex !== undefined && (
                            <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>
                                S{field.stepIndex + 1}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Input area */}
            {showCalc ? (
                <div style={{
                    display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius)', background: '#f9fafb',
                    padding: '0 0.75rem', height: '38px', gap: '0.5rem',
                }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6b7280', fontSize: '0.9rem' }}>=</span>
                    <span style={{ flex: 1, fontSize: '0.875rem', fontFamily: 'monospace', color: '#111827' }}>{calcValue}</span>
                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: '#e5e7eb', borderRadius: 6, color: '#6b7280', fontWeight: 600 }}>Computed</span>
                </div>
            ) : Plugin ? (
                <Plugin field={field} isSelected={isSelected} theme={theme} />
            ) : (
                <GenericFieldMock field={field} overrides={overrides} />
            )}

            {/* Help text */}
            {field.ui?.helpText && (
                <small style={{ display: 'block', marginTop: '0.3rem', color: 'var(--color-muted)', fontSize: '0.75rem' }}>
                    {field.ui.helpText}
                </small>
            )}
        </div>
    );
};

// ─── Wizard Step Header ───────────────────────────────────────────────────────

const WizardStepHeader: React.FC<{
    steps: { id: string; title: string }[];
    activeStep: number;
    onStepClick: (i: number) => void;
}> = ({ steps, activeStep, onStepClick }) => (
    <div style={{ marginBottom: '2rem' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '0.75rem' }}>
            {steps.map((step, i) => (
                <React.Fragment key={step.id}>
                    {i > 0 && (
                        <div style={{
                            flex: 1, height: 2,
                            background: i <= activeStep ? 'var(--color-primary)' : '#e5e7eb',
                            transition: 'background 0.2s',
                        }} />
                    )}
                    <button
                        onClick={() => onStepClick(i)}
                        style={{
                            width: 28, height: 28, borderRadius: '50%', border: 'none',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                            background: i === activeStep ? 'var(--color-primary)' : i < activeStep ? '#10b981' : '#e5e7eb',
                            color: i <= activeStep ? '#fff' : '#9ca3af',
                            transition: 'all 0.2s',
                        }}
                        title={step.title}
                    >
                        {i < activeStep ? '✓' : i + 1}
                    </button>
                </React.Fragment>
            ))}
        </div>
        {/* Step label */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Step {activeStep + 1} of {steps.length}
            </span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                {steps[activeStep]?.title}
            </span>
        </div>
    </div>
);

// ─── Live Preview Panel ───────────────────────────────────────────────────────

const PreviewPanel: React.FC<{
    fields: FieldModel[];
    values: Record<string, unknown>;
    onChange: (key: string, val: unknown) => void;
    onClear: () => void;
}> = ({ fields, values, onChange, onClear }) => {
    const previewable = fields.filter(
        (f) => !['group', 'repeater', 'calculated', 'signature', 'file', 'richtext'].includes(f.type)
    );
    if (previewable.length === 0) return null;

    return (
        <div style={{
            marginBottom: '1.25rem', padding: '0.75rem', background: '#fffbeb',
            border: '1px solid #fde68a', borderRadius: 6,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Preview Values
                </span>
                <button
                    onClick={onClear}
                    style={{ fontSize: '0.72rem', padding: '2px 8px', border: '1px solid #fde68a', borderRadius: 4, background: '#fff', cursor: 'pointer', color: '#92400e' }}
                >
                    Clear
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {previewable.map((f) => (
                    <div key={f.id}>
                        <label style={{ fontSize: '0.68rem', color: '#78350f', display: 'block', marginBottom: 2, fontWeight: 500 }}>{f.label}</label>
                        {f.type === 'checkbox' ? (
                            <input type="checkbox" checked={!!values[f.key]} onChange={(e) => onChange(f.key, e.target.checked)} />
                        ) : f.constraints?.enum ? (
                            <select value={String(values[f.key] ?? '')} onChange={(e) => onChange(f.key, e.target.value)}
                                style={{ width: '100%', fontSize: '0.78rem', padding: '2px 4px', border: '1px solid #fde68a', borderRadius: 3 }}>
                                <option value="">—</option>
                                {f.constraints.enum.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : (
                            <input
                                type={f.type === 'number' ? 'number' : 'text'}
                                value={String(values[f.key] ?? '')}
                                onChange={(e) => onChange(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                                style={{ width: '100%', fontSize: '0.78rem', padding: '2px 6px', border: '1px solid #fde68a', borderRadius: 3 }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Canvas ───────────────────────────────────────────────────────────────────

export const Canvas: React.FC = () => {
    const { state, dispatch, isWizardMode, stepCount } = useBuilder();
    const { form, selectedFieldId, activeStep, previewValues } = state;

    const [showPreview, setShowPreview] = React.useState(false);

    const densityGap: Record<string, string> = { compact: '0.5rem', normal: '0.75rem', comfortable: '1.25rem' };

    const themeVars = {
        '--color-primary': form.theme.colors.primary,
        '--color-bg': form.theme.colors.background,
        '--color-surface': form.theme.colors.surface,
        '--color-text': form.theme.colors.text,
        '--color-muted': form.theme.colors.muted,
        '--color-border': form.theme.colors.border,
        '--color-error': form.theme.colors.error,
        '--color-input-bg': form.theme.colors.inputBackground,
        '--border-radius': `${form.theme.radius}px`,
        '--font-family': form.theme.typography.fontFamily,
        '--font-size-base': `${form.theme.typography.baseFontSize}px`,
    } as React.CSSProperties;

    const orderedFields = form.layout.order
        .map((id) => form.fields.find((f) => f.id === id))
        .filter((f): f is FieldModel => !!f);

    // In builder mode: never hide fields by condition — always show everything so designers
    // can see and configure conditional fields. Conditions only evaluate in Live Preview
    // (or in the generated/exported form).
    const visibleFields = showPreview
        ? filterVisibleFields(orderedFields, previewValues, isWizardMode ? activeStep : undefined)
        : isWizardMode
            ? orderedFields.filter((f) => f.stepIndex === undefined || f.stepIndex === activeStep)
            : orderedFields;

    const setPreviewValue = (key: string, value: unknown) =>
        dispatch({ type: 'SET_PREVIEW_VALUE', payload: { key, value } });

    return (
        <div className="canvas-area" onClick={() => dispatch({ type: 'SELECT_FIELD', payload: null })}>
            <div className="form-preview" style={themeVars} onClick={(e) => e.stopPropagation()}>

                {/* Toolbar: live preview toggle */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 500 }}>Live preview</span>
                    <button
                        onClick={() => setShowPreview((v) => !v)}
                        style={{
                            fontSize: '0.72rem', padding: '3px 10px', border: '1px solid',
                            borderColor: showPreview ? '#6366f1' : '#d1d5db', borderRadius: 12,
                            cursor: 'pointer',
                            background: showPreview ? '#eef2ff' : '#f9fafb',
                            color: showPreview ? '#4338ca' : '#64748b', fontWeight: 500,
                        }}
                    >
                        {showPreview ? 'On' : 'Off'}
                    </button>
                </div>

                {showPreview && (
                    <PreviewPanel fields={orderedFields} values={previewValues} onChange={setPreviewValue} onClear={() => dispatch({ type: 'CLEAR_PREVIEW_VALUES' })} />
                )}

                {/* Form header */}
                <h1 className="form-title" style={{ marginBottom: form.meta?.description ? '0.25rem' : '2rem' }}>
                    {form.meta?.title ?? form.name}
                </h1>
                {form.meta?.description && (
                    <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>{form.meta.description}</p>
                )}

                {/* Wizard step header */}
                {isWizardMode && form.layout.steps && form.layout.steps.length > 0 && (
                    <WizardStepHeader
                        steps={form.layout.steps}
                        activeStep={activeStep}
                        onStepClick={(i) => dispatch({ type: 'SET_STEP', payload: i })}
                    />
                )}

                {/* Field grid */}
                {visibleFields.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: densityGap[form.theme.density] ?? '0.75rem' }}>
                        {visibleFields.map((field) => (
                            <FieldRenderer
                                key={field.id}
                                field={field}
                                isSelected={selectedFieldId === field.id}
                                onSelect={() => dispatch({ type: 'SELECT_FIELD', payload: field.id })}
                                selectedFieldId={selectedFieldId}
                                onSelectChild={(id) => dispatch({ type: 'SELECT_FIELD', payload: id })}
                                theme={themeVars as Record<string, string | number>}
                                previewValues={previewValues}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '3rem',
                        border: '1px dashed #e5e7eb', borderRadius: 8, color: '#94a3b8', fontSize: '0.875rem',
                    }}>
                        {isWizardMode
                            ? `No fields assigned to "${form.layout.steps?.[activeStep]?.title ?? `Step ${activeStep + 1}`}" — select a field and set its step in the properties panel.`
                            : 'Add fields from the palette on the left.'}
                    </div>
                )}

                {/* Footer nav */}
                <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {isWizardMode && activeStep > 0 && (
                        <button
                            onClick={() => dispatch({ type: 'SET_STEP', payload: activeStep - 1 })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.6rem 1.25rem', background: 'var(--color-surface)',
                                color: 'var(--color-text)', border: '1px solid var(--color-border)',
                                borderRadius: 'var(--border-radius)', fontSize: '0.875rem', cursor: 'pointer',
                            }}
                        >
                            <ChevronLeft size={15} /> Previous
                        </button>
                    )}
                    {isWizardMode && activeStep < stepCount - 1 ? (
                        <button
                            onClick={() => dispatch({ type: 'SET_STEP', payload: activeStep + 1 })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.6rem 1.25rem', background: 'var(--color-primary)',
                                color: '#fff', border: 'none', borderRadius: 'var(--border-radius)',
                                fontSize: '0.875rem', cursor: 'pointer',
                            }}
                        >
                            Next <ChevronRight size={15} />
                        </button>
                    ) : (
                        <button
                            style={{
                                padding: '0.6rem 1.75rem',
                                background: form.submit?.color ?? 'var(--color-primary)',
                                color: '#fff', border: 'none', borderRadius: 'var(--border-radius)',
                                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            {form.submit?.text ?? 'Submit'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
