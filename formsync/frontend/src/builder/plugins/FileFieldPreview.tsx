import React from 'react';
import { FolderUp } from 'lucide-react';
import { FieldPluginProps, registerPlugin } from './FieldPlugin';
import { resolveFieldStyleOverrides } from './fieldPreviewStyles';

const FileFieldPreview: React.FC<FieldPluginProps> = ({ field, theme }) => {
    const xui = field.ui?.['x-ui'];
    const accept = xui?.accept ?? '*/*';
    const multiple = xui?.multiple ?? false;
    const maxMB = xui?.maxFileSizeBytes ? (xui.maxFileSizeBytes / (1024 * 1024)).toFixed(1) : null;
    const { border, surface, label, hint, accent } = resolveFieldStyleOverrides(field, theme);

    return (
        <div
            style={{
                border: `2px dashed ${border}`,
                borderRadius: 8,
                padding: '1.5rem',
                textAlign: 'center',
                background: `color-mix(in srgb, ${accent} 8%, ${surface})`,
                color: label,
                fontSize: '0.875rem',
                cursor: 'pointer',
                pointerEvents: 'none',
            }}
        >
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', color: accent }}>
                <FolderUp size={28} strokeWidth={1.75} aria-hidden />
            </div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: label }}>
                {multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse'}
            </div>
            <div style={{ color: hint, fontSize: '0.75rem' }}>
                Accepts: {accept}
                {maxMB && ` · Max ${maxMB} MB`}
            </div>
        </div>
    );
};

registerPlugin('file', FileFieldPreview);
export { FileFieldPreview };
