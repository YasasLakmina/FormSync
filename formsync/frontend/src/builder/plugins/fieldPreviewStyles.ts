import type { FieldModel } from '../../types';

type Ov = Record<string, string>;

/**
 * Style Overrides from the right panel, with theme fallbacks (same keys as Canvas / GenericFieldMock).
 */
export function resolveFieldStyleOverrides(
    field: FieldModel,
    theme: Record<string, string | number>,
) {
    const o = field.ui?.styleOverrides as Ov | undefined;
    const t = theme as Record<string, string>;
    return {
        border: o?.borderColor ?? t['--color-border'] ?? '#e2e8f0',
        surface: o?.backgroundColor ?? t['--color-input-bg'] ?? '#ffffff',
        label: o?.labelColor ?? t['--color-text'] ?? '#0f172a',
        hint: o?.inputTextColor ?? t['--color-muted'] ?? '#64748b',
        accent: o?.focusColor ?? t['--color-primary'] ?? '#6366f1',
    };
}
