import React from 'react';
import { PenLine } from 'lucide-react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';
import { resolveFieldStyleOverrides } from './fieldPreviewStyles';

const SignatureFieldPreview: React.FC<FieldPluginProps> = ({ field, theme }) => {
    const { border, surface, hint } = resolveFieldStyleOverrides(field, theme);
    return (
        <div
            style={{
                border: `1px solid ${border}`,
                borderRadius: 8,
                background: surface,
                height: '100px',
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    bottom: '28px',
                    left: '5%',
                    right: '5%',
                    borderBottom: `1px dashed ${hint}`,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                }}
            >
                <PenLine size={22} strokeWidth={1.75} color={hint} aria-hidden />
                <span style={{ fontSize: '0.78rem', color: hint }}>Sign here</span>
            </div>
            <button
                type="button"
                style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '8px',
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    background: surface,
                    color: hint,
                    cursor: 'default',
                }}
            >
                Clear
            </button>
        </div>
    );
};

registerPlugin('signature', SignatureFieldPreview);
export { SignatureFieldPreview };
