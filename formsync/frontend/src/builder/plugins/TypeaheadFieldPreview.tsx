import React from 'react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';

const TypeaheadFieldPreview: React.FC<FieldPluginProps> = ({ field }) => {
    const src = field.ui?.['x-ui']?.asyncSource;
    const hasUrl = src?.url && src.url.length > 0;

    return (
        <div
            style={{
                position: 'relative',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    background: '#fff',
                    padding: '0 0.75rem',
                    height: '38px',
                    gap: '0.5rem',
                }}
            >
                {/* Search icon */}
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>🔍</span>
                <span
                    style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        color: '#9ca3af',
                        fontStyle: 'italic',
                    }}
                >
                    {field.ui?.placeholder ?? 'Type to search…'}
                </span>
                {/* Loading spinner indicator */}
                {hasUrl && (
                    <span
                        title={`Fetches from: ${src?.url}`}
                        style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            borderRadius: 10,
                            fontWeight: 600,
                        }}
                    >
                        API
                    </span>
                )}
                {!hasUrl && (
                    <span
                        style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            background: '#fef3c7',
                            color: '#b45309',
                            borderRadius: 10,
                            fontWeight: 600,
                        }}
                    >
                        No URL
                    </span>
                )}
            </div>
            {/* Dropdown hint */}
            <div
                style={{
                    border: '1px solid #e5e7eb',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    background: '#fff',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    color: '#9ca3af',
                }}
            >
                ↳ Results will appear here after typing
            </div>
        </div>
    );
};

registerPlugin('typeahead', TypeaheadFieldPreview);
export { TypeaheadFieldPreview };
