export interface SchemaEnhancement {
    path: string;
    originalValue: any;
    newValue: any;
    changeType: 'added' | 'modified' | 'removed';
    reason: string;
}
export interface EnhancementResult {
    success: boolean;
    enhancedSchema?: any;
    changes: SchemaEnhancement[];
    errors?: string[];
    tokensUsed?: number;
    model?: string;
}
export interface EnhancementOptions {
    focusAreas?: ('naming' | 'validation' | 'accessibility' | 'descriptions')[];
    preserveStructure?: boolean;
    targetLanguage?: string;
}
export interface LLMProviderPlugin {
    readonly name: string;
    enhanceSchema(schema: any, options?: EnhancementOptions): Promise<EnhancementResult>;
    getProviderName(): string;
    isConfigured(): boolean;
}
