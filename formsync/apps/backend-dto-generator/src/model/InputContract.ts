
/**
 * Represents the raw payload received from the Schema API.
 */

export interface SchemaPayload {
    name: string;
    description?: string;
    // The JSON Schema content
    content: any;
    version?: string;
    sourceFormat?: string;
    tags?: string[];
    status?: 'draft' | 'validated' | 'enhanced' | 'published';
}
