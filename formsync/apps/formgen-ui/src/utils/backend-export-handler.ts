/**
 * Backend Export Handler
 * 
 * Handles downloading backend code (NestJS controller, service, DTOs) as ZIP
 * Reuses the same backend-dto-generator service endpoint that schema-ui uses
 */

/**
 * Export backend code as ZIP download
 * @param schemaId - The schema ID from the API
 */
export async function exportBackendCode(schemaId: string): Promise<void> {
    try {
        console.log('[Backend Export] Starting backend code export for schema:', schemaId);

        // Fetch the schema from API
        const schemaResponse = await fetch(`http://localhost:3000/schema/${schemaId}`);

        if (!schemaResponse.ok) {
            throw new Error(`Failed to fetch schema: ${schemaResponse.status} ${schemaResponse.statusText}`);
        }

        const schemaData = await schemaResponse.json();
        const validatedSchema = schemaData.content;
        console.log('[Backend Export] Fetched schema:', schemaData.name);

        // Call backend-dto-generator service to generate backend code
        // preview: false means we get a ZIP blob instead of JSON
        const response = await fetch('http://localhost:3001/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                schema: validatedSchema,
                preview: false // Request ZIP download
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend generation failed: ${response.status} ${response.statusText}`);
        }

        // Handle blob download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${schemaData.name.toLowerCase().replace(/\s+/g, '-')}-backend.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('[Backend Export] Backend code exported successfully');
    } catch (error) {
        console.error('[Backend Export] Export failed:', error);
        throw new Error(`Failed to export backend code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
