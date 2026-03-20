import React from 'react';
import { PenLine } from 'lucide-react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';

const SignatureFieldPreview: React.FC<FieldPluginProps> = () => (
    <div
        style={{
            border: '1px solid #d1d5db',
            borderRadius: 8,
            background: '#f9fafb',
            height: '100px',
            position: 'relative',
            overflow: 'hidden',
            pointerEvents: 'none',
        }}
    >
        {/* Baseline */}
        <div
            style={{
                position: 'absolute',
                bottom: '28px',
                left: '5%',
                right: '5%',
                borderBottom: '1px dashed #9ca3af',
            }}
        />
        {/* Placeholder text */}
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
            <PenLine size={22} strokeWidth={1.75} color="#9ca3af" aria-hidden />
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Sign here</span>
        </div>
        {/* Clear button mock */}
        <button
            style={{
                position: 'absolute',
                bottom: '6px',
                right: '8px',
                fontSize: '0.7rem',
                padding: '2px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                background: '#fff',
                color: '#6b7280',
                cursor: 'default',
            }}
        >
            Clear
        </button>
    </div>
);

registerPlugin('signature', SignatureFieldPreview);
export { SignatureFieldPreview };
