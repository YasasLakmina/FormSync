/**
 * Export Handler — React App ZIP Download
 *
 * Calls the formgen-service microservice (POST /generate-react) to generate
 * a standalone React app ZIP and triggers a browser download.
 */

import { FormModel } from '../types';

const FORMGEN_SERVICE_URL = import.meta.env.VITE_FORMGEN_SERVICE_URL || 'http://localhost:3003';

export async function exportReactApp(formModel: FormModel): Promise<void> {
    try {
        console.log('[Export] Calling formgen-service for:', formModel.name);

        const response = await fetch(`${FORMGEN_SERVICE_URL}/generate-react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formModel }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                (errorData as any).message || `formgen-service returned ${response.status}: ${response.statusText}`
            );
        }

        const blob = await response.blob();
        const filename = `${formModel.name.toLowerCase().replace(/\s+/g, '-')}-export.zip`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('[Export] Download triggered:', filename);
    } catch (error) {
        console.error('[Export] Export failed:', error);
        throw new Error(
            `Failed to export React app: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
