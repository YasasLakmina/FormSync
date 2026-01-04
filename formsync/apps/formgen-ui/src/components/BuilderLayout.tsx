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
            <LeftPanel />
            <Canvas />

            {/* Right section with persistent export toolbar */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                {/* Persistent Export Toolbar */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e5e7eb',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                }}>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: isExporting ? 'not-allowed' : 'pointer',
                            opacity: isExporting ? 0.6 : 1,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {isExporting ? 'Exporting...' : 'Export React App'}
                    </button>
                    <button
                        onClick={handleBackendExport}
                        disabled={isExportingBackend || !state.schemaId}
                        title={!state.schemaId ? 'Load a schema from Schema UI to enable backend export' : 'Download backend code (NestJS)'}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: state.schemaId ? '#10b981' : '#9ca3af',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: (isExportingBackend || !state.schemaId) ? 'not-allowed' : 'pointer',
                            opacity: (isExportingBackend || !state.schemaId) ? 0.6 : 1,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {isExportingBackend ? 'Exporting...' : 'Download Backend'}
                    </button>
                </div>

                {/* RightPanel */}
                <RightPanel />
            </div>
        </div>
    );
};
