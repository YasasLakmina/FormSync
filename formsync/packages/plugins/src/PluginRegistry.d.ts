import { FormatParserPlugin } from './interfaces/FormatParserPlugin';
import { SchemaValidatorPlugin } from './interfaces/SchemaValidatorPlugin';
import { LLMProviderPlugin } from './interfaces/LLMProviderPlugin';
export type PluginType = 'parser' | 'validator' | 'llm';
export interface PluginConfig {
    type: PluginType;
    name: string;
    enabled: boolean;
    config?: Record<string, any>;
}
export declare class PluginRegistry {
    private static instance;
    private parsers;
    private validators;
    private llmProviders;
    private constructor();
    static getInstance(): PluginRegistry;
    registerParser(plugin: FormatParserPlugin): void;
    registerValidator(plugin: SchemaValidatorPlugin): void;
    registerLLMProvider(plugin: LLMProviderPlugin): void;
    getParser(name: string): FormatParserPlugin | undefined;
    getAllParsers(): FormatParserPlugin[];
    getValidator(name: string): SchemaValidatorPlugin | undefined;
    getAllValidators(): SchemaValidatorPlugin[];
    getLLMProvider(name: string): LLMProviderPlugin | undefined;
    getAllLLMProviders(): LLMProviderPlugin[];
    detectParser(input: string): FormatParserPlugin | undefined;
    clear(): void;
    getStats(): {
        parsers: number;
        validators: number;
        llmProviders: number;
    };
}
