import React from 'react';
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

const RepeaterFieldPreview: React.FC<FieldPluginProps> = ({ field }) => {
    const children = field.children ?? [];

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
                📋 {field.label} — Item 1
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
