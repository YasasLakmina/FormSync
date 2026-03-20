import React from 'react';
import { ClipboardList } from 'lucide-react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';

// A small inner field preview row used inside the repeater section
const InnerFieldRow: React.FC<{ label: string; type: string }> = ({ label, type }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <label
            style={{
                minWidth: '80px',
                fontSize: '0.78rem',
                color: '#374151',
                fontWeight: 500,
            }}
        >
            {label}
        </label>
        <div
            style={{
                flex: 1,
                height: '30px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                background: '#fff',
                padding: '0 0.5rem',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: '#9ca3af',
                fontStyle: 'italic',
            }}
        >
            {type}…
        </div>
    </div>
);

const theadCellStyle: React.CSSProperties = {
    border: '1px solid #c4b5fd',
    padding: '0.45rem 0.65rem',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '0.78rem',
    letterSpacing: '0.02em',
    color: '#1e1b4b',
    background: '#e9e5ff',
};

const bodyCellStyle: React.CSSProperties = {
    border: '1px solid #ddd6fe',
    padding: '0.4rem 0.5rem',
    color: '#64748b',
    fontSize: '0.75rem',
};

const RepeaterFieldPreview: React.FC<FieldPluginProps> = ({ field }) => {
    const children = field.children ?? [];
    const isTable = (field.ui as { displayMode?: string } | undefined)?.displayMode === 'table';

    if (isTable) {
        const colCount = Math.max(children.length, 1);
        return (
            <div
                style={{
                    border: '1px solid #c7d2fe',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#fafaff',
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        background: '#ede9fe',
                        padding: '0.5rem 0.75rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#5b21b6',
                        borderBottom: '1px solid #c4b5fd',
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
                            background: '#fff',
                            border: '1px solid #ddd6fe',
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
                                                <span style={{ color: '#b91c1c', marginLeft: 2 }} aria-hidden="true">
                                                    *
                                                </span>
                                            ) : null}
                                        </th>
                                    ))
                                ) : (
                                    <th scope="col" style={theadCellStyle}>
                                        {/* Placeholder until user adds Year, Experience, etc. as child fields */}
                                        Columns — add child fields (e.g. Year, Experience)
                                    </th>
                                )}
                                <th
                                    scope="col"
                                    style={{
                                        ...theadCellStyle,
                                        width: '5.5rem',
                                        textAlign: 'right',
                                        background: '#f5f3ff',
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
                                            color: '#7c3aed',
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
                                            background: '#faf5ff',
                                            color: '#5b21b6',
                                            fontStyle: 'normal',
                                        }}
                                    >
                                        Select this repeater → <strong>Properties</strong> → add each column as a
                                        child field. Labels become the table headings.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div
                    style={{
                        padding: '0.5rem 0.75rem',
                        borderTop: '1px dashed #c4b5fd',
                        display: 'flex',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        color: '#7c3aed',
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
                border: '1px solid #c7d2fe',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#f5f3ff',
                pointerEvents: 'none',
            }}
        >
            {/* Section header */}
            <div
                style={{
                    background: '#ede9fe',
                    padding: '0.5rem 0.75rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: '#5b21b6',
                    borderBottom: '1px solid #c4b5fd',
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
                        <InnerFieldRow key={child.id} label={child.label} type={child.type} />
                    ))
                ) : (
                    <div
                        style={{
                            textAlign: 'center',
                            color: '#8b5cf6',
                            fontSize: '0.8rem',
                            padding: '0.5rem',
                        }}
                    >
                        No child fields yet — add fields in the properties panel
                    </div>
                )}
            </div>

            {/* Add item button */}
            <div
                style={{
                    padding: '0.5rem 0.75rem',
                    borderTop: '1px dashed #c4b5fd',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <span
                    style={{
                        fontSize: '0.8rem',
                        color: '#7c3aed',
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
