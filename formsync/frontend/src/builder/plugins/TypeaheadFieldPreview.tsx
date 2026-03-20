import React from 'react';
import { Search } from 'lucide-react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';
import { resolveFieldStyleOverrides } from './fieldPreviewStyles';

const TypeaheadFieldPreview: React.FC<FieldPluginProps> = ({ field, theme }) => {
    const src = field.ui?.['x-ui']?.asyncSource;
    const hasUrl = src?.url && src.url.length > 0;
    const { border, surface, hint, accent } = resolveFieldStyleOverrides(field, theme);

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
                    border: `1px solid ${border}`,
                    borderRadius: 6,
                    background: surface,
                    padding: '0 0.75rem',
                    height: '38px',
                    gap: '0.5rem',
                }}
            >
                <Search size={16} strokeWidth={2} style={{ color: hint, flexShrink: 0 }} aria-hidden />
                <span
                    style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        color: hint,
                        fontStyle: 'italic',
                    }}
                >
                    {field.ui?.placeholder ?? 'Type to search…'}
                </span>
                {hasUrl && (
                    <span
                        title={`Fetches from: ${src?.url}`}
                        style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            background: `color-mix(in srgb, ${accent} 15%, ${surface})`,
                            color: accent,
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
                            background: `color-mix(in srgb, ${accent} 12%, ${surface})`,
                            color: hint,
                            borderRadius: 10,
                            fontWeight: 600,
                        }}
                    >
                        No URL
                    </span>
                )}
            </div>
            <div
                style={{
                    border: `1px solid ${border}`,
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    background: surface,
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    color: hint,
                }}
            >
                Results appear below when you type.
            </div>
        </div>
    );
};

registerPlugin('typeahead', TypeaheadFieldPreview);
export { TypeaheadFieldPreview };
