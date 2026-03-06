import React from 'react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';

const RichTextFieldPreview: React.FC<FieldPluginProps> = ({ field }) => (
    <div
        style={{
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 6,
            overflow: 'hidden',
            pointerEvents: 'none',
        }}
    >
        {/* Mock toolbar */}
        <div
            style={{
                display: 'flex',
                gap: '0.25rem',
                padding: '0.4rem 0.75rem',
                borderBottom: '1px solid #e5e7eb',
                background: '#f9fafb',
            }}
        >
            {['B', 'I', 'U', '—', '≡', '≡≡', '—', '🔗'].map((t, i) => (
                <span
                    key={i}
                    style={{
                        fontSize: '0.78rem',
                        padding: '2px 5px',
                        border: '1px solid #d1d5db',
                        borderRadius: 3,
                        background: '#fff',
                        color: '#374151',
                        fontFamily: 'serif',
                        cursor: 'default',
                    }}
                >
                    {t}
                </span>
            ))}
        </div>
        {/* Mock content area */}
        <div
            style={{
                padding: '0.75rem',
                minHeight: '80px',
                color: '#9ca3af',
                fontStyle: 'italic',
                fontSize: '0.875rem',
            }}
        >
            {field.ui?.placeholder ?? 'Start typing rich content here…'}
        </div>
    </div>
);

registerPlugin('richtext', RichTextFieldPreview);
export { RichTextFieldPreview };
