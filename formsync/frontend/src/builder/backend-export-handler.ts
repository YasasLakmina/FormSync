/**
 * Backend Export Handler
 * Handles downloading backend code (NestJS controller, service, DTOs) as individual files.
 */

import { generationService } from '../services/generationService';

export async function exportBackendCode(schemaId: string): Promise<void> {
    try {
        const schemaResponse = await fetch(`/api/schema/${schemaId}`);
        if (!schemaResponse.ok) {
            throw new Error(`Failed to fetch schema: ${schemaResponse.status} ${schemaResponse.statusText}`);
        }
        const schemaData = await schemaResponse.json();
        const validatedSchema = schemaData.content;

        // Generate and download client-side — no external service required
        await generationService.downloadZip(validatedSchema, schemaData.name?.toLowerCase().replace(/\s+/g, '-') || 'backend');
    } catch (error) {
        console.error('[Backend Export] Export failed:', error);
        throw new Error(`Failed to export backend code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
