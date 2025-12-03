import React, { useState } from 'react';
import { LeftPanel } from './LeftPanel';
import { Canvas } from './Canvas';
import { RightPanel } from './RightPanel';
import { useBuilder } from '../context/BuilderContext';
import { exportReactApp } from '../utils/export-handler';

export const BuilderLayout: React.FC = () => {
    const { state } = useBuilder();
    const [isExporting, setIsExporting] = useState(false);

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

    return (
        <div className="builder-layout">
            {/* Export Button - positioned at top */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 1000,
            }}>
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
            </div>

            <LeftPanel />
            <Canvas />
            <RightPanel />
        </div>
    );
};
