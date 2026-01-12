import React from 'react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';

const FileFieldPreview: React.FC<FieldPluginProps> = ({ field }) => {
    const xui = field.ui?.['x-ui'];
    const accept = xui?.accept ?? '*/*';
    const multiple = xui?.multiple ?? false;
    const maxMB = xui?.maxFileSizeBytes ? (xui.maxFileSizeBytes / (1024 * 1024)).toFixed(1) : null;

    return (
        <div
            style={{
                border: '2px dashed #93c5fd',
                borderRadius: 8,
                padding: '1.5rem',
                textAlign: 'center',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '0.875rem',
                cursor: 'pointer',
                pointerEvents: 'none',
            }}
        >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                {multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse'}
            </div>
            <div style={{ color: '#3b82f6', fontSize: '0.75rem' }}>
                Accepts: {accept}
                {maxMB && ` · Max ${maxMB} MB`}
            </div>
        </div>
    );
};

registerPlugin('file', FileFieldPreview);
export { FileFieldPreview };
