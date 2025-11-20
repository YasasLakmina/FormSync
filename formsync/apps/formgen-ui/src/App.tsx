import React, { useEffect } from 'react';
import { BuilderProvider, useBuilder } from './context/BuilderContext';
import { BuilderLayout } from './components/BuilderLayout';
import './index.css';

// Mock Data Loader to simulate "Load from API"
const DataLoader: React.FC = () => {
    const { dispatch } = useBuilder();

    useEffect(() => {
        // Simulating async load
        setTimeout(() => {
            dispatch({
                type: 'UPDATE_FORM',
                payload: {
                    id: 'sample-form',
                    name: 'Employee Onboarding',
                    version: '1.0',
                    meta: {
                        title: 'Employee Onboarding Form',
                        description: 'Please fill out your details below.'
                    },
                    theme: {
                        mode: 'light',
                        density: 'normal',
                        radius: 6,
                        colors: {
                            primary: '#3b82f6',
                            background: '#ffffff',
                            surface: '#ffffff',
                            text: '#111827',
                            muted: '#6b7280',
                            border: '#e5e7eb',
                            error: '#ef4444',
                            inputBackground: '#f9fafb',
                        },
                        typography: {
                            fontFamily: 'Inter, sans-serif',
                            baseFontSize: 16,
                        }
                    },
                    layout: { order: ['f1', 'f2', 'f3'] },
                    fields: [
                        { id: 'f1', key: 'fullName', type: 'text', label: 'Full Name', required: true },
                        { id: 'f2', key: 'email', type: 'email', label: 'Email Address', required: true },
                        { id: 'f3', key: 'role', type: 'select', label: 'Role', required: false, constraints: { enum: ['Dev', 'Design', 'Product'] } }
                    ]
                }
            });
        }, 500);
    }, [dispatch]);

    return null; // Headless component
};

function App() {
    return (
        <BuilderProvider>
            <DataLoader />
            <BuilderLayout />
        </BuilderProvider>
    );
}

export default App;
