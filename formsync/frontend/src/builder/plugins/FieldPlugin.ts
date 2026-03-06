/**
 * FieldPlugin.ts — Field Type Plugin Registry
 *
 * Maps every FieldType to a React preview component for the canvas.
 * Register new types by adding to the registry map — zero changes to Canvas.tsx needed.
 */

import React from 'react';
import { FieldType, FieldModel } from '../../types';

// ─── Plugin Interface ─────────────────────────────────────────────────────────

export interface FieldPluginProps {
    field: FieldModel;
    isSelected: boolean;
    theme: Record<string, string | number>;
}

export type FieldPluginComponent = React.FC<FieldPluginProps>;

// ─── Registry ─────────────────────────────────────────────────────────────────

const registry = new Map<FieldType, FieldPluginComponent>();

export function registerPlugin(type: FieldType, component: FieldPluginComponent): void {
    registry.set(type, component);
}

export function getPlugin(type: FieldType): FieldPluginComponent | undefined {
    return registry.get(type);
}
