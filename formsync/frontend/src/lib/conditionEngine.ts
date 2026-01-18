/**
 * conditionEngine.ts — Pure Condition & Calculation Evaluation Engine
 *
 * No React. No side effects. No dependencies beyond TypeScript.
 * All functions take plain data in and return plain data out.
 *
 * Design:
 *   evaluateCondition(field, values)  → boolean  (show or hide a field)
 *   evaluateCalcExpression(formula, values) → string | number (computed value)
 */

import type { FieldModel, ConditionRule, ConditionOperator } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

/** A snapshot of all current form values, keyed by fieldKey */
export type FormValues = Record<string, unknown>;

// ─── Single Rule Evaluation ───────────────────────────────────────────────────

/**
 * Coerce a raw form value to a comparable primitive.
 * Handles numeric strings for numeric operators.
 */
function coerce(val: unknown, op: ConditionOperator): unknown {
    if (op === 'gt' || op === 'lt' || op === 'gte' || op === 'lte') {
        const n = Number(val);
        return isNaN(n) ? val : n;
    }
    return val;
}

function evaluateRule(rule: ConditionRule, values: FormValues): boolean {
    const rawValue = values[rule.fieldKey];

    switch (rule.operator) {
        case 'notEmpty':
            return rawValue !== undefined && rawValue !== null && rawValue !== '' && rawValue !== false;

        case 'eq':
            return coerce(rawValue, 'eq') === coerce(rule.value, 'eq');

        case 'neq':
            return coerce(rawValue, 'neq') !== coerce(rule.value, 'neq');

        case 'gt':
            return (coerce(rawValue, 'gt') as number) > (coerce(rule.value, 'gt') as number);

        case 'lt':
            return (coerce(rawValue, 'lt') as number) < (coerce(rule.value, 'lt') as number);

        case 'gte':
            return (coerce(rawValue, 'gte') as number) >= (coerce(rule.value, 'gte') as number);

        case 'lte':
            return (coerce(rawValue, 'lte') as number) <= (coerce(rule.value, 'lte') as number);

        case 'contains': {
            if (Array.isArray(rawValue)) {
                return rawValue.includes(rule.value);
            }
            if (typeof rawValue === 'string') {
                return rawValue.includes(String(rule.value ?? ''));
            }
            return false;
        }

        case 'in': {
            if (!Array.isArray(rule.value)) return false;
            return (rule.value as unknown[]).includes(rawValue);
        }

        default:
            return true;
    }
}

// ─── Field Visibility ─────────────────────────────────────────────────────────

/**
 * Evaluates whether a field should be visible given the current form values.
 * Returns true (show) by default when no conditions are configured.
 *
 * All rules in a FieldConditions block are AND-ed.
 */
export function evaluateCondition(field: FieldModel, values: FormValues): boolean {
    const conditions = field.ui?.['x-conditions'];

    if (!conditions || conditions.rules.length === 0) {
        return true; // No conditions → always visible
    }

    try {
        return conditions.rules.every((rule) => evaluateRule(rule, values));
    } catch {
        // On any evaluation error, fall back to defaultVisible (or show)
        return conditions.defaultVisible ?? true;
    }
}

// ─── Calculated Fields ────────────────────────────────────────────────────────

/**
 * Evaluates a calc formula string against current form values.
 *
 * Syntax: Use `{fieldKey}` as placeholders. Supports basic arithmetic (+, -, *, /).
 *
 * Examples:
 *   '{quantity} * {unitPrice}'  → 5 * 20 → 100
 *   '{firstName} {lastName}'   → 'John Doe'
 *
 * Returns the raw formula string if evaluation fails (safe fallback).
 */
export function evaluateCalcExpression(formula: string, values: FormValues): string | number {
    if (!formula) return '';

    // Replace all {fieldKey} tokens with their current values
    const interpolated = formula.replace(/\{([^}]+)\}/g, (_, key: string) => {
        const val = values[key.trim()];
        return val !== undefined && val !== null ? String(val) : '0';
    });

    // If result is purely numeric-arithmetic, evaluate safely
    const isArithmetic = /^[\d\s+\-*/().]+$/.test(interpolated);
    if (isArithmetic) {
        try {
            // Safe arithmetic evaluation without eval(): use Function constructor
            // in a controlled, read-only scope with no access to globals
            const result = new Function(`"use strict"; return (${interpolated});`)() as number;
            // Return a clean number or its string representation
            return typeof result === 'number' && isFinite(result) ? result : interpolated;
        } catch {
            return interpolated;
        }
    }

    // String interpolation result
    return interpolated;
}

// ─── Helper: Filter Visible Fields ───────────────────────────────────────────

/**
 * Returns only the fields that should be visible given current form values.
 * Also filters by active wizard step when stepIndex filtering is requested.
 */
export function filterVisibleFields(
    fields: FieldModel[],
    values: FormValues,
    activeStep?: number,
): FieldModel[] {
    return fields.filter((field) => {
        // Step filter: if a step is active and field has a stepIndex, only show matching
        if (activeStep !== undefined && field.stepIndex !== undefined) {
            if (field.stepIndex !== activeStep) return false;
        }
        return evaluateCondition(field, values);
    });
}
