import React, { useState } from 'react';
import { LeftPanel } from './LeftPanel';
import { Canvas } from './Canvas';
import { RightPanel } from './RightPanel';
import { useBuilder } from '../context/BuilderContext';
import { exportReactApp } from '../utils/export-handler';
import { exportBackendCode } from '../utils/backend-export-handler';

export const BuilderLayout: React.FC = () => {
    const { state } = useBuilder();
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingBackend, setIsExportingBackend] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            await exportReactApp(state.form);
            // Success feedback
            console.log('Export successful!');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleBackendExport = async () => {
        if (!state.schemaId) {
            alert('Backend export requires a schema ID. Please load a schema from Schema UI first.');
            return;
        }

        try {
            setIsExportingBackend(true);
            await exportBackendCode(state.schemaId);
            console.log('Backend export successful!');
        } catch (error) {
            console.error('Backend export failed:', error);
            alert(`Backend export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExportingBackend(false);
        }
    };

    return (
        <div className="builder-layout">
            {/* Export Buttons - positioned at top */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 1000,
                display: 'flex',
                gap: '0.75rem',
            }}>
                {/* Frontend Export Button */}
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        opacity: isExporting ? 0.6 : 1,
                        transition: 'all 0.2s',
                    }}
                >
                    {isExporting ? 'Exporting...' : '📦 Export React App'}
                </button>

                {/* Backend Export Button */}
                <button
                    onClick={handleBackendExport}
                    disabled={isExportingBackend || !state.schemaId}
                    title={!state.schemaId ? 'Load a schema from Schema UI to enable backend export' : 'Download backend code (NestJS)'}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: state.schemaId ? '#10b981' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: (isExportingBackend || !state.schemaId) ? 'not-allowed' : 'pointer',
                        opacity: (isExportingBackend || !state.schemaId) ? 0.6 : 1,
                        transition: 'all 0.2s',
                    }}
                >
                    {isExportingBackend ? 'Exporting...' : '🔧 Download Backend Code'}
                </button>
            </div>

            <LeftPanel />
            <Canvas />
            <RightPanel />
        </div>
    );
};
