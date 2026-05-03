/**
 * conditionEngine.test.ts — Unit tests for the pure evaluation engine
 *
 * Run with: cd formsync/frontend && npm run test -- conditionEngine
 */

import { describe, it, expect } from 'vitest';
import { evaluateCondition, evaluateCalcExpression, filterVisibleFields, pruneFieldsForWizardStep } from '../lib/conditionEngine';
import type { FieldModel } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeField(overrides: Partial<FieldModel> = {}): FieldModel {
    return {
        id: 'f1', key: 'myField', type: 'text', label: 'My Field', required: false,
        ui: {},
        ...overrides,
    };
}

// ─── evaluateCondition ────────────────────────────────────────────────────────

describe('evaluateCondition', () => {
    it('returns true when no conditions are set', () => {
        const field = makeField();
        expect(evaluateCondition(field, {})).toBe(true);
    });

    it('returns true when conditions rules array is empty', () => {
        const field = makeField({ ui: { 'x-conditions': { rules: [] } } });
        expect(evaluateCondition(field, {})).toBe(true);
    });

    it('eq operator: shows when source field matches', () => {
        const field = makeField({
            ui: { 'x-conditions': { rules: [{ fieldKey: 'role', operator: 'eq', value: 'admin' }] } },
        });
        expect(evaluateCondition(field, { role: 'admin' })).toBe(true);
        expect(evaluateCondition(field, { role: 'user' })).toBe(false);
    });

    it('neq operator', () => {
        const field = makeField({
            ui: { 'x-conditions': { rules: [{ fieldKey: 'status', operator: 'neq', value: 'inactive' }] } },
        });
        expect(evaluateCondition(field, { status: 'active' })).toBe(true);
        expect(evaluateCondition(field, { status: 'inactive' })).toBe(false);
    });

    it('gt operator', () => {
        const field = makeField({
            ui: { 'x-conditions': { rules: [{ fieldKey: 'age', operator: 'gt', value: 18 }] } },
        });
        expect(evaluateCondition(field, { age: 25 })).toBe(true);
        expect(evaluateCondition(field, { age: 16 })).toBe(false);
    });

    it('notEmpty operator', () => {
        const field = makeField({
            ui: { 'x-conditions': { rules: [{ fieldKey: 'name', operator: 'notEmpty' }] } },
        });
        expect(evaluateCondition(field, { name: 'Alice' })).toBe(true);
        expect(evaluateCondition(field, { name: '' })).toBe(false);
        expect(evaluateCondition(field, {})).toBe(false);
    });

    it('contains operator: works for string values', () => {
        const field = makeField({
            ui: { 'x-conditions': { rules: [{ fieldKey: 'bio', operator: 'contains', value: 'engineer' }] } },
        });
        expect(evaluateCondition(field, { bio: 'senior engineer' })).toBe(true);
        expect(evaluateCondition(field, { bio: 'designer' })).toBe(false);
    });

    it('in operator', () => {
        const field = makeField({
            ui: { 'x-conditions': { rules: [{ fieldKey: 'dept', operator: 'in', value: ['IT', 'Engineering'] }] } },
        });
        expect(evaluateCondition(field, { dept: 'IT' })).toBe(true);
        expect(evaluateCondition(field, { dept: 'HR' })).toBe(false);
    });

    it('AND logic: all rules must pass', () => {
        const field = makeField({
            ui: {
                'x-conditions': {
                    rules: [
                        { fieldKey: 'active', operator: 'eq', value: true },
                        { fieldKey: 'age', operator: 'gte', value: 18 },
                    ],
                },
            },
        });
        expect(evaluateCondition(field, { active: true, age: 21 })).toBe(true);
        expect(evaluateCondition(field, { active: true, age: 16 })).toBe(false);
        expect(evaluateCondition(field, { active: false, age: 21 })).toBe(false);
    });

    it('returns defaultVisible on evaluation error', () => {
        const field = makeField({
            ui: { 'x-conditions': { rules: [{ fieldKey: 'x', operator: 'in', value: undefined as any }], defaultVisible: false } },
        });
        // 'in' with undefined value should return false (in check fails gracefully)
        expect(evaluateCondition(field, { x: 'yes' })).toBe(false);
    });
});

// ─── evaluateCalcExpression ───────────────────────────────────────────────────

describe('evaluateCalcExpression', () => {
    it('returns empty string for empty formula', () => {
        expect(evaluateCalcExpression('', {})).toBe('');
    });

    it('performs numeric arithmetic', () => {
        expect(evaluateCalcExpression('{qty} * {price}', { qty: 5, price: 20 })).toBe(100);
    });

    it('performs addition', () => {
        expect(evaluateCalcExpression('{a} + {b}', { a: 10, b: 3 })).toBe(13);
    });

    it('falls back to interpolated string for non-arithmetic', () => {
        const result = evaluateCalcExpression('{firstName} {lastName}', { firstName: 'Jane', lastName: 'Doe' });
        expect(result).toBe('Jane Doe');
    });

    it('uses 0 for missing field references', () => {
        expect(evaluateCalcExpression('{missing} + 5', {})).toBe(5);
    });
});

// ─── filterVisibleFields ──────────────────────────────────────────────────────

describe('filterVisibleFields', () => {
    const f1 = makeField({ id: 'f1', key: 'name', type: 'text', label: 'Name', stepIndex: 0 });
    const f2 = makeField({
        id: 'f2', key: 'company', type: 'text', label: 'Company',
        stepIndex: 1,
        ui: { 'x-conditions': { rules: [{ fieldKey: 'name', operator: 'notEmpty' }] } },
    });

    it('returns all fields when no step filter is active', () => {
        const result = filterVisibleFields([f1, f2], { name: 'Alice' });
        expect(result).toHaveLength(2);
    });

    it('filters by step index', () => {
        const result = filterVisibleFields([f1, f2], { name: 'Alice' }, 0);
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('name');
    });

    it('treats missing stepIndex as step 0 for wizard filtering', () => {
        const unassigned = makeField({ id: 'fu', key: 'extra', type: 'text', label: 'Extra' });
        expect(filterVisibleFields([unassigned], {}, 0)).toHaveLength(1);
        expect(filterVisibleFields([unassigned], {}, 1)).toHaveLength(0);
    });

    it('pruneFieldsForWizardStep keeps groups when a nested child matches the step', () => {
        const inner = makeField({ id: 'c1', key: 'child', type: 'text', label: 'Child', stepIndex: 1 });
        const grp = makeField({
            id: 'g1',
            key: 'g',
            type: 'group',
            label: 'Group',
            stepIndex: 0,
            children: [inner],
        });
        const pruned0 = pruneFieldsForWizardStep([grp], 0);
        expect(pruned0).toHaveLength(0);
        const pruned1 = pruneFieldsForWizardStep([grp], 1);
        expect(pruned1).toHaveLength(1);
        expect(pruned1[0].type).toBe('group');
        expect(pruned1[0].children).toHaveLength(1);
        expect(pruned1[0].children![0].key).toBe('child');
    });

    it('filters by conditions within a step', () => {
        const result = filterVisibleFields([f1, f2], { name: '' }, 1);
        // name is empty → condition fails → company hidden
        expect(result).toHaveLength(0);
    });
});
