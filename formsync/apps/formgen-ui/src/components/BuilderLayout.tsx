import React, { useState } from 'react';
import { LeftPanel } from './LeftPanel';
import { Canvas } from './Canvas';
import { RightPanel } from './RightPanel';
import { useBuilder } from '../context/BuilderContext';
import { exportReactApp } from '../utils/export-handler';
import { exportBackendCode } from '../utils/backend-export-handler';
import { FlowDiagram, GenerationStage } from './FlowDiagram';
import { Sparkles } from 'lucide-react';

export const BuilderLayout: React.FC = () => {
    const { state } = useBuilder();
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingBackend, setIsExportingBackend] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize with first 4 stages complete as we are in Builder
    const [stages, setStages] = useState<GenerationStage[]>([
        { name: 'Enter Schema', status: 'complete', progress: 100 },
        { name: 'Input Validation', status: 'complete', progress: 100 },
        { name: 'Schema Conversion', status: 'complete', progress: 100 },
        { name: 'AI Enhancement', status: 'complete', progress: 100 },
        { name: 'Frontend Generation', status: 'pending', progress: 0 },
        { name: 'Backend Generation', status: 'pending', progress: 0 },
        { name: 'DTO Generation', status: 'pending', progress: 0 },
        { name: 'Test Generation', status: 'pending', progress: 0 },
    ]);

    const isFrontendComplete = stages.find(s => s.name === 'Frontend Generation')?.status === 'complete';

    const handleExport = async () => {
        try {
            setIsExporting(true);
            await exportReactApp(state.form);
            // Mark Frontend Generation as complete for visual feedback
            setStages(prev => prev.map(s => s.name === 'Frontend Generation' ? { ...s, status: 'complete', progress: 100 } : s));
            console.log('Export successful!');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setStages(prev => prev.map(s => s.name === 'Frontend Generation' ? { ...s, status: 'error' } : s));
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

    const handleGenerate = async () => {
        if (!state.schemaId) {
            alert('Generation requires a schema ID. Please load a schema from Schema UI first.');
            return;
        }

        setIsGenerating(true);

        try {
            // Start from Backend Generation (index 5)
            // End after DTO Generation (index 6), excluding Test Generation (index 7)
            const generationStages = stages.slice(5, 7);

            for (let i = 0; i < generationStages.length; i++) {
                const stageIndex = i + 5; // Offset for actual index (starts at 5)
                setStages(prev =>
                    prev.map((s, idx) => (idx === stageIndex ? { ...s, status: 'loading', progress: 0 } : s))
                );

                // Simulate progress
                for (let progress = 0; progress <= 100; progress += 25) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    setStages(prev =>
                        prev.map((s, idx) => (idx === stageIndex ? { ...s, progress } : s))
                    );
                }

                // Mark complete
                setStages(prev =>
                    prev.map((s, idx) => (idx === stageIndex ? { ...s, status: 'complete', progress: 100 } : s))
                );
            }

            // Redirect to Schema UI Generated Code Page
            const schemaUiUrl = 'http://localhost:5173';
            window.location.href = `${schemaUiUrl}/generated?schemaId=${state.schemaId}`;

        } catch (error) {
            console.error('Generation failed:', error);
            alert('Generation failed. Please try again.');
            setStages(prev => prev.map((s, idx) => idx >= 5 ? { ...s, status: 'error' } : s));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="builder-layout">
            <LeftPanel />

            {/* Middle Column with Progress Bar and Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
                <div style={{ padding: '0 1rem' }}>
                    <FlowDiagram stages={stages} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Canvas />
                </div>
            </div>

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
                    alignItems: 'center',
                    minHeight: '60px'
                }}>
                    {!isFrontendComplete ? (
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            style={{
                                background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                                color: 'white',
                                padding: '0.75rem 2rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: isExporting ? 'not-allowed' : 'pointer',
                                opacity: isExporting ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s ease-in-out',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                if (!isExporting) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isExporting) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                }
                            }}
                        >
                            <Sparkles size={20} />
                            {isExporting ? 'Exporting...' : 'Export React App'}
                        </button>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !state.schemaId}
                            style={{
                                background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                                color: 'white',
                                padding: '0.75rem 2rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: (isGenerating || !state.schemaId) ? 'not-allowed' : 'pointer',
                                opacity: (isGenerating || !state.schemaId) ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s ease-in-out',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                if (!isGenerating && state.schemaId) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isGenerating && state.schemaId) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                }
                            }}
                            title={!state.schemaId ? 'Load a schema from Schema UI first' : 'Convert logic to full backend'}
                        >
                            <Sparkles size={20} />
                            {isGenerating ? 'Generating...' : 'Generate Code'}
                        </button>
                    )}
                    {/* <button
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
                    </button> */}
                </div>

                {/* RightPanel */}
                <RightPanel />
            </div>
        </div>
    );
};
