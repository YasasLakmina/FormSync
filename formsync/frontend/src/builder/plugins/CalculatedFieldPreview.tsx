import React from 'react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';
import { resolveFieldStyleOverrides } from './fieldPreviewStyles';

const CalculatedFieldPreview: React.FC<FieldPluginProps> = ({ field, theme }) => {
    const formula = field['x-calc'] ?? '';
    const { border, surface, label, hint } = resolveFieldStyleOverrides(field, theme);

    return (
        <div style={{ pointerEvents: 'none' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${border}`,
                    borderRadius: 6,
                    background: `color-mix(in srgb, ${hint} 6%, ${surface})`,
                    padding: '0 0.75rem',
                    height: '38px',
                    gap: '0.5rem',
                    cursor: 'not-allowed',
                }}
            >
                <span
                    style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: hint,
                        fontFamily: 'monospace',
                    }}
                >
                    =
                </span>
                <span
                    style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        color: formula ? label : hint,
                        fontFamily: 'monospace',
                        fontStyle: formula ? 'normal' : 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {formula || 'No formula defined — edit in properties'}
                </span>
                <span
                    style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        background: `color-mix(in srgb, ${border} 40%, ${surface})`,
                        color: hint,
                        borderRadius: 10,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                    }}
                >
                    Computed
                </span>
            </div>
            {formula && (
                <div style={{ marginTop: '0.25rem', fontSize: '0.72rem', color: hint }}>
                    Formula:{' '}
                    <code
                        style={{
                            background: `color-mix(in srgb, ${hint} 10%, ${surface})`,
                            padding: '1px 4px',
                            borderRadius: 3,
                            color: label,
                        }}
                    >
                        {formula}
                    </code>
                </div>
            )}
        </div>
    );
};

registerPlugin('calculated', CalculatedFieldPreview);
export { CalculatedFieldPreview };
