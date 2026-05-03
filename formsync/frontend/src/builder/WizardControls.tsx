import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Layers } from 'lucide-react';
import { useBuilder } from '../context/BuilderContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { FormStep, FieldModel } from '../types';

function assignStepIndexDeep(fields: FieldModel[], stepIdx: number): FieldModel[] {
    return fields.map((f) => ({
        ...f,
        stepIndex: stepIdx,
        children: f.children?.length ? assignStepIndexDeep(f.children, stepIdx) : f.children,
    }));
}

function stripStepIndexDeep(fields: FieldModel[]): FieldModel[] {
    return fields.map((f) => {
        const { stepIndex: _, ...rest } = f;
        const next = { ...rest } as FieldModel;
        if (next.children?.length) {
            return { ...next, children: stripStepIndexDeep(next.children) };
        }
        return next;
    });
}

function remapStepIndicesAfterRemoval(fields: FieldModel[], removedIndex: number): FieldModel[] {
    return fields.map((f) => {
        let si = f.stepIndex;
        if (si === removedIndex) si = 0;
        else if (si !== undefined && si > removedIndex) si = si - 1;
        const next = { ...f, stepIndex: si } as FieldModel;
        if (f.children?.length) {
            return { ...next, children: remapStepIndicesAfterRemoval(f.children, removedIndex) };
        }
        return next;
    });
}

/** Leaf fields (inputs) assigned to the given step (effective step = stepIndex ?? 0). */
function countLeavesOnStep(fields: FieldModel[], stepIdx: number): number {
    let n = 0;
    const walk = (fs: FieldModel[]) => {
        for (const f of fs) {
            if (f.type === 'group' || f.type === 'repeater') {
                if (f.children?.length) walk(f.children);
            } else if ((f.stepIndex ?? 0) === stepIdx) {
                n += 1;
            }
        }
    };
    walk(fields);
    return n;
}

export const WizardControls: React.FC = () => {
    const { state, dispatch, isWizardMode, stepCount } = useBuilder();
    const [expanded, setExpanded] = useState(false);
    const [disableWizardOpen, setDisableWizardOpen] = useState(false);

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
        const updatedFields = assignStepIndexDeep(state.form.fields, 0);
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

    const confirmDisableWizard = () => {
        dispatch({
            type: 'UPDATE_FORM',
            payload: {
                ...state.form,
                layout: { ...state.form.layout, steps: undefined },
                fields: stripStepIndexDeep(state.form.fields),
            },
        });
        setExpanded(false);
        setDisableWizardOpen(false);
    };

    const addStep = () => {
        const id = `step-${Date.now().toString(36)}`;
        setSteps([...steps, { id, title: `Step ${steps.length + 1}` }]);
    };

    const removeStep = (id: string) => {
        if (steps.length <= 1) return;
        const removedIndex = steps.findIndex((s) => s.id === id);
        const newSteps = steps.filter((s) => s.id !== id);
        const updatedFields = remapStepIndicesAfterRemoval(state.form.fields, removedIndex);
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
        <>
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
                            type="button"
                            className="wc-btn-add-inline"
                            onClick={(e) => {
                                e.stopPropagation();
                                addStep();
                            }}
                            title="Add another wizard step"
                        >
                            <Plus size={12} strokeWidth={2.25} />
                            Add step
                        </button>
                        <button
                            type="button"
                            className="wc-btn-disable"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDisableWizardOpen(true);
                            }}
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
                            const fieldCount = countLeavesOnStep(state.form.fields, i);
                            const isActive = state.activeStep === i;
                            return (
                                <div
                                    key={step.id}
                                    className={`wc-step-row ${isActive ? 'wc-step-row--active' : ''}`}
                                    onClick={() => dispatch({ type: 'SET_STEP', payload: i })}
                                >
                                    <div className={`wc-step-num ${isActive ? 'wc-step-num--active' : ''}`}>
                                        {i + 1}
                                    </div>

                                    <input
                                        className="wc-step-input"
                                        value={step.title}
                                        onChange={(e) => { e.stopPropagation(); renameStep(step.id, e.target.value); }}
                                        onClick={(e) => e.stopPropagation()}
                                    />

                                    <span className="wc-step-count">
                                        {fieldCount} {fieldCount !== 1 ? 'fields' : 'field'}
                                    </span>

                                    {steps.length > 1 && (
                                        <button
                                            type="button"
                                            className="wc-step-remove"
                                            onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                                        >
                                            <Trash2 size={11} strokeWidth={2} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        <button type="button" className="wc-add-step" onClick={addStep}>
                            <Plus size={12} />
                            Add step
                        </button>
                    </div>
                )}
            </div>

            <AlertDialog open={disableWizardOpen} onOpenChange={setDisableWizardOpen}>
                <AlertDialogContent className="max-w-md rounded-xl border border-neutral-200 shadow-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disable wizard?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Step assignments will be removed from all fields, including fields inside groups and repeaters.
                            You can undo afterward from the toolbar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                            onClick={confirmDisableWizard}
                        >
                            Disable wizard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
