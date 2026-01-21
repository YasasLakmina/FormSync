import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Layers } from 'lucide-react';
import { useBuilder } from '../context/BuilderContext';
import { FormStep } from '../types';

export const WizardControls: React.FC = () => {
    const { state, dispatch, isWizardMode, stepCount } = useBuilder();
    const [expanded, setExpanded] = useState(false);

    const steps = state.form.layout.steps ?? [];

    const setSteps = (newSteps: FormStep[]) => {
        dispatch({
            type: 'UPDATE_FORM',
            payload: {
                ...state.form,
                layout: { ...state.form.layout, steps: newSteps.length > 0 ? newSteps : undefined },
            },
        });
    };

    const handleEnable = () => {
        const updatedFields = state.form.fields.map((f) => ({ ...f, stepIndex: 0 }));
        dispatch({
            type: 'UPDATE_FORM',
            payload: {
                ...state.form,
                layout: {
                    ...state.form.layout,
                    steps: [{ id: 'step-1', title: 'Step 1' }, { id: 'step-2', title: 'Step 2' }],
                },
                fields: updatedFields,
            },
        });
        setExpanded(true);
    };

    const handleDisable = () => {
        if (!window.confirm('Disabling wizard will remove step assignments from all fields.')) return;
        dispatch({
            type: 'UPDATE_FORM',
            payload: {
                ...state.form,
                layout: { ...state.form.layout, steps: undefined },
                fields: state.form.fields.map(({ stepIndex: _, ...rest }) => rest),
            },
        });
        setExpanded(false);
    };

    const addStep = () => {
        const id = `step-${Date.now().toString(36)}`;
        setSteps([...steps, { id, title: `Step ${steps.length + 1}` }]);
    };

    const removeStep = (id: string) => {
        if (steps.length <= 1) return;
        const removedIndex = steps.findIndex((s) => s.id === id);
        const newSteps = steps.filter((s) => s.id !== id);
        const updatedFields = state.form.fields.map((f) => {
            if (f.stepIndex === removedIndex) return { ...f, stepIndex: 0 };
            if (f.stepIndex !== undefined && f.stepIndex > removedIndex) return { ...f, stepIndex: f.stepIndex - 1 };
            return f;
        });
        dispatch({
            type: 'UPDATE_FORM',
            payload: {
                ...state.form,
                layout: { ...state.form.layout, steps: newSteps.length > 0 ? newSteps : undefined },
                fields: updatedFields,
            },
        });
        if (state.activeStep >= newSteps.length) {
            dispatch({ type: 'SET_STEP', payload: Math.max(0, newSteps.length - 1) });
        }
    };

    const renameStep = (id: string, title: string) => {
        setSteps(steps.map((s) => (s.id === id ? { ...s, title } : s)));
    };

    // ── Disabled state ──────────────────────────────────────────────────────────
    if (!isWizardMode) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                margin: '0.5rem 0.75rem', padding: '0.45rem 0.75rem',
                border: '1px solid #e2e8f0', borderRadius: 8,
                background: '#f8fafc',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Layers size={13} strokeWidth={2} color="#94a3b8" />
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Multi-step Wizard</span>
                </div>
                <button
                    onClick={handleEnable}
                    style={{
                        fontSize: '0.72rem', padding: '3px 11px',
                        border: '1px solid #6366f1', borderRadius: 6,
                        background: '#eff6ff', color: '#4338ca', cursor: 'pointer', fontWeight: 600,
                        fontFamily: 'inherit',
                    }}
                >
                    Enable
                </button>
            </div>
        );
    }

    // ── Enabled state ───────────────────────────────────────────────────────────
    return (
        <div style={{
            margin: '0.5rem 0.75rem',
            border: '1px solid #c7d2fe', borderRadius: 8,
            background: '#f5f3ff', overflow: 'hidden',
        }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.45rem 0.75rem', cursor: 'pointer',
                    borderBottom: expanded ? '1px solid #c7d2fe' : 'none',
                    background: '#ede9fe',
                }}
                onClick={() => setExpanded((v) => !v)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Layers size={13} strokeWidth={2} color="#6366f1" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3730a3' }}>
                        Wizard — {stepCount} steps
                    </span>
                    <span style={{
                        fontSize: '0.6rem', padding: '1px 6px', borderRadius: 8,
                        background: '#6366f1', color: '#fff', fontWeight: 700, letterSpacing: '0.03em',
                    }}>
                        ON
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDisable(); }}
                        style={{
                            fontSize: '0.7rem', padding: '2px 8px',
                            border: '1px solid #e2e8f0', borderRadius: 5,
                            background: '#fff', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        Disable
                    </button>
                    {expanded ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
                </div>
            </div>

            {/* Step list */}
            {expanded && (
                <div style={{ padding: '0.45rem 0.75rem' }}>
                    {steps.map((step, i) => {
                        const fieldCount = state.form.fields.filter((f) => f.stepIndex === i).length;
                        const isActive = state.activeStep === i;
                        return (
                            <div
                                key={step.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.35rem 0.5rem', marginBottom: '0.25rem', borderRadius: 6,
                                    border: `1px solid ${isActive ? '#a5b4fc' : '#e2e8f0'}`,
                                    background: isActive ? '#eff6ff' : '#fff',
                                    cursor: 'pointer', transition: 'all 0.1s',
                                }}
                                onClick={() => dispatch({ type: 'SET_STEP', payload: i })}
                            >
                                <span style={{
                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                    background: isActive ? '#6366f1' : '#e2e8f0',
                                    color: isActive ? '#fff' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 700,
                                }}>
                                    {i + 1}
                                </span>

                                <input
                                    value={step.title}
                                    onChange={(e) => { e.stopPropagation(); renameStep(step.id, e.target.value); }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        flex: 1, border: 'none', background: 'transparent',
                                        fontSize: '0.78rem', fontWeight: isActive ? 600 : 400,
                                        color: isActive ? '#3730a3' : '#374151', outline: 'none', fontFamily: 'inherit',
                                    }}
                                />

                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                    {fieldCount} {fieldCount !== 1 ? 'fields' : 'field'}
                                </span>

                                {steps.length > 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                                        style={{
                                            padding: '2px', border: 'none', background: 'transparent',
                                            color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; }}
                                    >
                                        <Trash2 size={11} strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={addStep}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                            width: '100%', padding: '0.3rem', marginTop: '0.2rem',
                            border: '1px dashed #c7d2fe', borderRadius: 6,
                            background: 'transparent', color: '#6366f1',
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, fontFamily: 'inherit',
                        }}
                    >
                        <Plus size={11} />
                        Add step
                    </button>
                </div>
            )}
        </div>
    );
};
