import React from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

// ─── Generic Field Mock (builder preview + live interactive) ─────────────────

type StyleOverrides = Record<string, string>;

const GenericFieldMock: React.FC<{
    field: FieldModel;
    overrides?: StyleOverrides;
    /** When set, the field is interactive (Live Preview mode) */
    liveValue?: unknown;
    onLiveChange?: (val: unknown) => void;
}> = ({ field, overrides, liveValue, onLiveChange }) => {
    const isLive = !!onLiveChange;
    const scopeId = `fm-${field.id}`;

    const inputTextColor = overrides?.inputTextColor ?? 'var(--color-muted)';
    const borderColor = overrides?.borderColor ?? 'var(--color-border)';
    const bgColor = overrides?.backgroundColor ?? 'var(--color-input-bg)';
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
        outline: 'none',
        boxSizing: 'border-box',
        boxShadow: focusRing,
        // Only lock pointer events in static builder mode
        pointerEvents: isLive ? 'auto' : 'none',
    };

    const placeholderStyle = overrides?.inputTextColor
        ? `#${scopeId} input::placeholder, #${scopeId} textarea::placeholder { color: ${overrides.inputTextColor} !important; opacity: 1; }`
        : null;

    if (field.type === 'checkbox') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: isLive ? 'auto' : 'none' }}>
                <input
                    type="checkbox"
                    checked={isLive ? !!liveValue : false}
                    readOnly={!isLive}
                    onChange={isLive ? (e) => onLiveChange!(e.target.checked) : undefined}
                    style={{ width: 15, height: 15 }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{field.label}</span>
            </div>
        );
    }

    if (field.type === 'select') {
        return (
            <div id={scopeId}>
                {placeholderStyle && <style>{placeholderStyle}</style>}
                <select
                    disabled={!isLive}
                    value={isLive ? String(liveValue ?? '') : undefined}
                    onChange={isLive ? (e) => onLiveChange!(e.target.value) : undefined}
                    style={{ ...base, height: '38px', width: '100%' }}
                >
                    <option value="">{field.ui?.placeholder ?? `Select ${field.label}…`}</option>
                    {field.constraints?.enum?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        );
    }
    if (field.type === 'textarea') {
        return (
            <div id={scopeId}>
                {placeholderStyle && <style>{placeholderStyle}</style>}
                <textarea
                    readOnly={!isLive} disabled={!isLive}
                    value={isLive ? String(liveValue ?? '') : ''}
                    placeholder={field.ui?.placeholder ?? 'Enter text…'}
                    onChange={isLive ? (e) => onLiveChange!(e.target.value) : undefined}
                    style={{ ...base, minHeight: '80px', padding: '0.5rem 0.75rem', resize: 'vertical', width: '100%' }}
                />
            </div>
        );
    }
    return (
        <div id={scopeId}>
            {placeholderStyle && <style>{placeholderStyle}</style>}
            <input
                type={field.type === 'password' ? 'password' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                readOnly={!isLive} disabled={!isLive}
                value={isLive ? String(liveValue ?? '') : undefined}
                placeholder={field.ui?.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
                onChange={isLive ? (e) => onLiveChange!(field.type === 'number' ? Number(e.target.value) : e.target.value) : undefined}
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
    selectedFieldId: string | null;
    onSelectChild: (id: string) => void;
    theme: Record<string, string | number>;
    previewValues: Record<string, unknown>;
    /** When set, Live Preview is active — fields are interactive */
    onPreviewChange?: (key: string, val: unknown) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, isSelected, onSelect, selectedFieldId, onSelectChild, theme, previewValues, onPreviewChange }) => {
    const overrides = field.ui?.styleOverrides as StyleOverrides | undefined;
    const colSpan = field.ui?.['x-ui']?.colSpan ?? 12;
    const hasConditions = (field.ui?.['x-conditions']?.rules?.length ?? 0) > 0;
    const calcValue = field.type === 'calculated' && field['x-calc']
        ? evaluateCalcExpression(field['x-calc'], previewValues)
        : undefined;

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

    // Group type
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
                            onPreviewChange={onPreviewChange}
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
            {/* Label row — repeaters draw their own legend/title inside the plugin */}
            {field.type !== 'checkbox' && field.type !== 'repeater' && (
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
                <GenericFieldMock
                    field={field}
                    overrides={overrides}
                    liveValue={previewValues[field.key]}
                    onLiveChange={onPreviewChange ? (val) => onPreviewChange(field.key, val) : undefined}
                />
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
                        type="button"
                        onClick={() => onStepClick(i)}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: i === activeStep ? 'var(--color-primary)' : i < activeStep ? '#10b981' : '#e5e7eb',
                            color: i <= activeStep ? '#fff' : '#9ca3af',
                            transition: 'all 0.2s',
                        }}
                        title={step.title}
                    >
                        {i < activeStep ? (
                            <Check size={14} strokeWidth={2.5} aria-hidden />
                        ) : (
                            i + 1
                        )}
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
        <div
            className="canvas-area"
            style={themeVars}
            onClick={() => dispatch({ type: 'SELECT_FIELD', payload: null })}
        >
            <div className="form-preview" onClick={(e) => e.stopPropagation()}>

                {/* ── Mode banner ─────────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: showPreview ? '0.75rem' : '1rem',
                }}>
                    {showPreview ? (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: '#ede9fe', border: '1px solid #c4b5fd',
                            borderRadius: 6, padding: '0.35rem 0.75rem',
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            <span style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 600 }}>Test Mode</span>
                            <span style={{ fontSize: '0.68rem', color: '#7c3aed' }}>Type into fields to test conditions</span>
                            <button
                                onClick={() => { setShowPreview(false); dispatch({ type: 'CLEAR_PREVIEW_VALUES' }); }}
                                style={{ marginLeft: 'auto', fontSize: '0.67rem', padding: '2px 9px', background: 'transparent', border: '1px solid #c4b5fd', borderRadius: 4, color: '#6366f1', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Exit
                            </button>
                        </div>
                    ) : (
                        <>
                            <span style={{ fontSize: '0.67rem', color: 'var(--color-muted, #888)', letterSpacing: '0.01em' }}>Builder view</span>
                            <button
                                onClick={() => setShowPreview(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    fontSize: '0.67rem', padding: '3px 10px',
                                    border: '1px solid #c4b5fd',
                                    borderRadius: 5, cursor: 'pointer',
                                    background: '#ede9fe',
                                    color: '#6366f1', fontWeight: 600,
                                }}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                Test Conditions
                            </button>
                        </>
                    )}
                </div>

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
                                onPreviewChange={showPreview ? setPreviewValue : undefined}
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
