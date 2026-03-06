import React from 'react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';

const CalculatedFieldPreview: React.FC<FieldPluginProps> = ({ field }) => {
    const formula = field['x-calc'] ?? '';

    return (
        <div style={{ pointerEvents: 'none' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    background: '#f9fafb',
                    padding: '0 0.75rem',
                    height: '38px',
                    gap: '0.5rem',
                    cursor: 'not-allowed',
                }}
            >
                {/* = symbol badge */}
                <span
                    style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#6b7280',
                        fontFamily: 'monospace',
                    }}
                >
                    =
                </span>
                <span
                    style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        color: formula ? '#1f2937' : '#9ca3af',
                        fontFamily: 'monospace',
                        fontStyle: formula ? 'normal' : 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {formula || 'No formula defined — edit in properties'}
                </span>
                {/* Read-only badge */}
                <span
                    style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        background: '#e5e7eb',
                        color: '#6b7280',
                        borderRadius: 10,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                    }}
                >
                    Computed
                </span>
            </div>
            {formula && (
                <div style={{ marginTop: '0.25rem', fontSize: '0.72rem', color: '#6b7280' }}>
                    Formula: <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>{formula}</code>
                </div>
            )}
        </div>
    );
};

registerPlugin('calculated', CalculatedFieldPreview);
export { CalculatedFieldPreview };
