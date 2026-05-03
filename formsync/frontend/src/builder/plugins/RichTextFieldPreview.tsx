import React from 'react';
import { Link2, List, ListOrdered } from 'lucide-react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';
import { resolveFieldStyleOverrides } from './fieldPreviewStyles';

const RichTextFieldPreview: React.FC<FieldPluginProps> = ({ field, theme }) => {
    const { border, surface, hint, accent } = resolveFieldStyleOverrides(field, theme);
    const toolbarBg = `color-mix(in srgb, ${accent} 10%, ${surface})`;

    const toolbarBtn = (extra?: React.CSSProperties): React.CSSProperties => ({
        fontSize: '0.78rem',
        padding: '2px 6px',
        border: `1px solid ${border}`,
        borderRadius: 3,
        background: surface,
        color: hint,
        fontFamily: 'inherit',
        fontWeight: 600,
        cursor: 'default',
        lineHeight: 1.2,
        ...extra,
    });

    return (
        <div
            style={{
                border: `1px solid ${border}`,
                borderRadius: 6,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.4rem 0.75rem',
                    borderBottom: `1px solid ${border}`,
                    background: toolbarBg,
                }}
            >
                <span style={toolbarBtn()}>B</span>
                <span style={toolbarBtn()}>I</span>
                <span style={toolbarBtn()}>U</span>
                <span
                    style={{
                        width: 1,
                        alignSelf: 'stretch',
                        minHeight: 14,
                        background: border,
                        margin: '0 2px',
                        flexShrink: 0,
                    }}
                    aria-hidden
                />
                <span style={{ ...toolbarBtn(), display: 'inline-flex', alignItems: 'center', padding: '2px 5px' }} aria-hidden>
                    <List size={12} strokeWidth={2} />
                </span>
                <span style={{ ...toolbarBtn(), display: 'inline-flex', alignItems: 'center', padding: '2px 5px' }} aria-hidden>
                    <ListOrdered size={12} strokeWidth={2} />
                </span>
                <span style={{ ...toolbarBtn(), display: 'inline-flex', alignItems: 'center', padding: '2px 5px', color: accent }} aria-hidden>
                    <Link2 size={12} strokeWidth={2} />
                </span>
            </div>
            <div
                style={{
                    padding: '0.75rem',
                    minHeight: '80px',
                    background: surface,
                    color: hint,
                    fontStyle: 'italic',
                    fontSize: '0.875rem',
                }}
            >
                {field.ui?.placeholder ?? 'Start typing rich content here…'}
            </div>
        </div>
    );
};

registerPlugin('richtext', RichTextFieldPreview);
export { RichTextFieldPreview };
