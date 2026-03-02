/**
 * Backend Export Handler
 * Handles downloading backend code (NestJS controller, service, DTOs) as ZIP.
 */

export async function exportBackendCode(schemaId: string): Promise<void> {
    try {
        const schemaResponse = await fetch(`/api/schema/${schemaId}`);
        if (!schemaResponse.ok) {
            throw new Error(`Failed to fetch schema: ${schemaResponse.status} ${schemaResponse.statusText}`);
        }
        const schemaData = await schemaResponse.json();
        const validatedSchema = schemaData.content;

        const response = await fetch('http://localhost:3001/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schema: validatedSchema, preview: false }),
        });

        if (!response.ok) {
            throw new Error(`Backend generation failed: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${schemaData.name.toLowerCase().replace(/\s+/g, '-')}-backend.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('[Backend Export] Export failed:', error);
        throw new Error(`Failed to export backend code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
