import React from 'react';
import { LeftPanel } from './LeftPanel';
import { Canvas } from './Canvas';
import { RightPanel } from './RightPanel';

export const BuilderLayout: React.FC = () => {
    return (
        <div className="builder-layout">
            <LeftPanel />
            <Canvas />
            <RightPanel />
        </div>
    );
};
