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

    // ─── Disabled (collapsed) state ────────────────────────────────────────────
    if (!isWizardMode) {
        return (
            <div className="wc-bar">
                <div className="wc-bar-left">
                    <Layers size={14} strokeWidth={1.75} className="wc-bar-icon" />
                    <span className="wc-bar-label">Multi-step Wizard</span>
                </div>
                <button className="wc-btn-enable" onClick={handleEnable}>Enable</button>
            </div>
        );
    }

    // ─── Enabled state ──────────────────────────────────────────────────────────
    return (
        <div className="wc-root">
            {/* Summary row — always visible */}
            <div className="wc-summary" onClick={() => setExpanded((v) => !v)}>
                <div className="wc-summary-left">
                    <Layers size={14} strokeWidth={1.75} className="wc-summary-icon" />
                    <span className="wc-summary-title">Wizard</span>
                    <span className="wc-badge">{stepCount} steps</span>
                    <span className="wc-on-badge">ON</span>
                </div>
                <div className="wc-summary-right">
                    <button
                        className="wc-btn-disable"
                        onClick={(e) => { e.stopPropagation(); handleDisable(); }}
                    >
                        Disable
                    </button>
                    {expanded
                        ? <ChevronUp size={13} className="wc-chevron" />
                        : <ChevronDown size={13} className="wc-chevron" />}
                </div>
            </div>

            {/* Step list — visible when expanded */}
            {expanded && (
                <div className="wc-steps">
                    {steps.map((step, i) => {
                        const fieldCount = state.form.fields.filter((f) => f.stepIndex === i).length;
                        const isActive = state.activeStep === i;
                        return (
                            <div
                                key={step.id}
                                className={`wc-step-row ${isActive ? 'wc-step-row--active' : ''}`}
                                onClick={() => dispatch({ type: 'SET_STEP', payload: i })}
                            >
                                {/* Step number badge — circle */}
                                <div className={`wc-step-num ${isActive ? 'wc-step-num--active' : ''}`}>
                                    {i + 1}
                                </div>

                                {/* Editable step title */}
                                <input
                                    className="wc-step-input"
                                    value={step.title}
                                    onChange={(e) => { e.stopPropagation(); renameStep(step.id, e.target.value); }}
                                    onClick={(e) => e.stopPropagation()}
                                />

                                {/* Field count */}
                                <span className="wc-step-count">
                                    {fieldCount} {fieldCount !== 1 ? 'fields' : 'field'}
                                </span>

                                {/* Remove button */}
                                {steps.length > 1 && (
                                    <button
                                        className="wc-step-remove"
                                        onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                                    >
                                        <Trash2 size={11} strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <button className="wc-add-step" onClick={addStep}>
                        <Plus size={12} />
                        Add step
                    </button>
                </div>
            )}
        </div>
    );
};
