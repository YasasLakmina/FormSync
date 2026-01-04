import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';

export interface GenerationStage {
    name: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
    progress: number;
}

interface FlowDiagramProps {
    stages: GenerationStage[];
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ stages }) => {
    return (
        <div className="flow-diagram">
            {stages.map((stage, index) => (
                <React.Fragment key={stage.name}>
                    <StageNode stage={stage} index={index} />
                    {index < stages.length - 1 && <Connector isActive={stage.status === 'complete'} />}
                </React.Fragment>
            ))}
        </div>
    );
};

const StageNode: React.FC<{ stage: GenerationStage; index: number }> = ({ stage, index }) => {
    const getStatusClass = () => {
        switch (stage.status) {
            case 'complete': return 'completed';
            case 'loading': return 'loading';
            case 'error': return 'error';
            default: return 'pending';
        }
    };

    const getIcon = () => {
        switch (stage.status) {
            case 'complete': return <Check size={16} color="white" />;
            case 'loading': return <Loader2 size={16} color="white" className="spin-animation" />;
            case 'error': return <AlertCircle size={16} color="white" />;
            default: return <Circle size={16} color="white" />;
        }
    };

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="stage-node"
        >
            <div className={`stage-icon ${getStatusClass()}`}>
                {getIcon()}
            </div>
            <span className="stage-label">
                {stage.name}
            </span>
        </motion.div>
    );
};

const Connector: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            className={`connector ${isActive ? 'active' : ''}`}
        />
    );
};
