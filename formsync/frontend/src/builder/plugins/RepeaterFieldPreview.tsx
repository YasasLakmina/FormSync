import React from 'react';
import { ClipboardList } from 'lucide-react';
import { FieldModel } from '../../types';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';

type Ov = Record<string, string>;

function resolveRepeaterChrome(field: FieldModel, theme: Record<string, string | number>) {
    const o = field.ui?.styleOverrides as Ov | undefined;
    const t = theme as Record<string, string>;
    const border = o?.borderColor ?? t['--color-border'] ?? '#e2e8f0';
    const surface = o?.backgroundColor ?? t['--color-surface'] ?? '#f8fafc';
    const label = o?.labelColor ?? t['--color-text'] ?? '#0f172a';
    const hint = o?.inputTextColor ?? t['--color-muted'] ?? '#64748b';
    const accent = o?.focusColor ?? t['--color-primary'] ?? '#6366f1';
    return { border, surface, label, hint, accent, o };
}

// A small inner field preview row used inside the repeater section
const InnerFieldRow: React.FC<{ label: string; type: string; labelColor: string; borderColor: string; inputBg: string; hintColor: string }> = ({
    label,
    type,
    labelColor,
    borderColor,
    inputBg,
    hintColor,
}) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <label
            style={{
                minWidth: '80px',
                fontSize: '0.78rem',
                color: labelColor,
                fontWeight: 500,
            }}
        >
            {label}
        </label>
        <div
            style={{
                flex: 1,
                height: '30px',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                background: inputBg,
                padding: '0 0.5rem',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: hintColor,
                fontStyle: 'italic',
            }}
        >
            {type}…
        </div>
    </div>
);

const RepeaterFieldPreview: React.FC<FieldPluginProps> = ({ field, theme }) => {
    const children = field.children ?? [];
    const isTable = (field.ui as { displayMode?: string } | undefined)?.displayMode === 'table';
    const { border, surface, label, hint, accent } = resolveRepeaterChrome(field, theme);
    const inputBg =
        (field.ui?.styleOverrides as Ov | undefined)?.backgroundColor ??
        (theme['--color-input-bg'] as string) ??
        '#ffffff';
    const errColor = (theme['--color-error'] as string) ?? '#dc2626';

    const theadCellStyle: React.CSSProperties = {
        border: `1px solid ${border}`,
        padding: '0.45rem 0.65rem',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: '0.78rem',
        letterSpacing: '0.02em',
        color: label,
        background: `color-mix(in srgb, ${label} 12%, ${surface})`,
    };

    const bodyCellStyle: React.CSSProperties = {
        border: `1px solid ${border}`,
        padding: '0.4rem 0.5rem',
        color: hint,
        fontSize: '0.75rem',
    };

    if (isTable) {
        const colCount = Math.max(children.length, 1);
        return (
            <div
                style={{
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: surface,
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        background: `color-mix(in srgb, ${accent} 14%, ${surface})`,
                        padding: '0.5rem 0.75rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: label,
                        borderBottom: `1px solid ${border}`,
                    }}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ClipboardList size={15} strokeWidth={2} aria-hidden />
                        <span>{field.label}</span>
                        <span style={{ fontWeight: 500, opacity: 0.85 }}>(data table)</span>
                    </span>
                </div>
                <div style={{ overflowX: 'auto', padding: '0.5rem' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.8125rem',
                            background: inputBg,
                            border: `1px solid ${border}`,
                            borderRadius: 6,
                            overflow: 'hidden',
                        }}
                    >
                        <thead>
                            <tr>
                                {children.length > 0 ? (
                                    children.map((c) => (
                                        <th key={c.id} scope="col" style={theadCellStyle}>
                                            {c.label}
                                            {c.required ? (
                                                <span style={{ color: errColor, marginLeft: 2 }} aria-hidden="true">
                                                    *
                                                </span>
                                            ) : null}
                                        </th>
                                    ))
                                ) : (
                                    <th scope="col" style={theadCellStyle}>
                                        Columns — use the right sidebar → Repeater columns
                                    </th>
                                )}
                                <th
                                    scope="col"
                                    style={{
                                        ...theadCellStyle,
                                        width: '5.5rem',
                                        textAlign: 'right',
                                        background: `color-mix(in srgb, ${accent} 10%, ${surface})`,
                                    }}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {children.length > 0 ? (
                                <tr>
                                    {children.map((c) => (
                                        <td key={c.id} style={{ ...bodyCellStyle, fontStyle: 'italic' }}>
                                            {c.type}
                                        </td>
                                    ))}
                                    <td
                                        style={{
                                            ...bodyCellStyle,
                                            textAlign: 'right',
                                            fontSize: '0.7rem',
                                            color: accent,
                                            fontWeight: 600,
                                            fontStyle: 'normal',
                                        }}
                                    >
                                        Remove
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td
                                        colSpan={colCount + 1}
                                        style={{
                                            ...bodyCellStyle,
                                            textAlign: 'center',
                                            padding: '0.85rem',
                                            background: `color-mix(in srgb, ${accent} 8%, ${surface})`,
                                            color: label,
                                            fontStyle: 'normal',
                                        }}
                                    >
                                        Select this repeater, then use the <strong>right sidebar</strong> →{' '}
                                        <strong>Repeater columns</strong> to add fields. Labels become the table
                                        headings.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div
                    style={{
                        padding: '0.5rem 0.75rem',
                        borderTop: `1px dashed ${border}`,
                        display: 'flex',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        color: accent,
                        fontWeight: 500,
                    }}
                >
                    + Add row
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                border: `1px solid ${border}`,
                borderRadius: 8,
                overflow: 'hidden',
                background: surface,
                pointerEvents: 'none',
            }}
        >
            {/* Section header */}
            <div
                style={{
                    background: `color-mix(in srgb, ${accent} 14%, ${surface})`,
                    padding: '0.5rem 0.75rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: label,
                    borderBottom: `1px solid ${border}`,
                }}
            >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ClipboardList size={15} strokeWidth={2} aria-hidden />
                    <span>
                        {field.label} — Item 1
                    </span>
                </span>
            </div>

            {/* Child fields preview */}
            <div style={{ padding: '0.75rem' }}>
                {children.length > 0 ? (
                    children.map((child) => (
                        <InnerFieldRow
                            key={child.id}
                            label={child.label}
                            type={child.type}
                            labelColor={label}
                            borderColor={border}
                            inputBg={inputBg}
                            hintColor={hint}
                        />
                    ))
                ) : (
                    <div
                        style={{
                            textAlign: 'center',
                            color: accent,
                            fontSize: '0.8rem',
                            padding: '0.5rem',
                        }}
                    >
                        No child fields yet — use the right sidebar → Repeater columns to add fields
                    </div>
                )}
            </div>

            {/* Add item button */}
            <div
                style={{
                    padding: '0.5rem 0.75rem',
                    borderTop: `1px dashed ${border}`,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <span
                    style={{
                        fontSize: '0.8rem',
                        color: accent,
                        cursor: 'default',
                        fontWeight: 500,
                    }}
                >
                    + Add another {field.label}
                </span>
            </div>
        </div>
    );
};

registerPlugin('repeater', RepeaterFieldPreview);
export { RepeaterFieldPreview };
