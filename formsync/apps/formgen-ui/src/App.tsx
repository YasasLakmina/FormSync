import React, { useEffect } from 'react';
import { BuilderProvider, useBuilder } from './context/BuilderContext';
import { BuilderLayout } from './components/BuilderLayout';
import { parseJsonSchemaToFormModel } from '@formsync/formgen-core';
import './index.css';

// Schema Loader - Fetches schema from API using ID from URL
const SchemaLoader: React.FC = () => {
    const { dispatch } = useBuilder();

    useEffect(() => {
        // Check for schema ID in URL parameter (e.g., ?schemaId=abc123)
        const urlParams = new URLSearchParams(window.location.search);
        const schemaId = urlParams.get('schemaId');

        if (schemaId) {
            // Fetch schema from API
            const fetchSchema = async () => {
                try {
                    console.log(`📡 Fetching schema from API with ID: ${schemaId}`);

                    const response = await fetch(`http://localhost:3000/schema/${schemaId}`);

                    if (!response.ok) {
                        throw new Error(`API returned ${response.status}: ${response.statusText}`);
                    }

                    const schemaData = await response.json();
                    console.log('📋 Fetched Schema Data:', schemaData);

                    // Extract the JSON Schema content
                    const jsonSchema = schemaData.content;
                    console.log('📋 JSON Schema:', jsonSchema);

                    // Convert JSON Schema to FormModel using the adapter
                    const formModel = parseJsonSchemaToFormModel(jsonSchema);
                    console.log('🔄 Converted FormModel:', formModel);

                    // Dispatch to context
                    dispatch({
                        type: 'UPDATE_FORM',
                        payload: formModel
                    });
                    console.log('✅ Dispatched FormModel to context');

                    // Store schemaId in context for backend export
                    dispatch({
                        type: 'SET_SCHEMA_ID',
                        payload: schemaId
                    });
                    console.log('✅ Stored schemaId in context:', schemaId);

                    // Clean up URL (remove schema parameter)
                    window.history.replaceState({}, '', window.location.pathname);

                    // Show success message
                    console.log('✅ Schema loaded from API successfully');

                    // Optional: Add a visual indicator in the UI
                    const notification = document.createElement('div');
                    notification.textContent = '✅ Schema loaded from API';
                    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; font-family: Inter, sans-serif; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);

                } catch (error) {
                    console.error('Failed to load schema from API:', error);

                    // Show error and load demo form
                    const notification = document.createElement('div');
                    notification.textContent = `❌ Failed to load schema: ${error instanceof Error ? error.message : 'API Error'}`;
                    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; font-family: Inter, sans-serif; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 4000);

                    // Load demo form as fallback
                    loadDemoForm(dispatch);
                }
            };

            fetchSchema();
        } else {
            // No schema ID from Schema UI - load demo form for development
            console.log('ℹ️ No schema ID found, loading demo form');
            loadDemoForm(dispatch);
        }
    }, [dispatch]);

    return null; // Headless component
};

// Demo form for development (fallback when no schema is provided)
function loadDemoForm(dispatch: ReturnType<typeof useBuilder>['dispatch']) {
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
                ],
                submit: { text: 'Register Now' }
            }
        });
    }, 500);
}


function App() {
    return (
        <BuilderProvider>
            <SchemaLoader />
            <BuilderLayout />
        </BuilderProvider>
    );
}

export default App;
