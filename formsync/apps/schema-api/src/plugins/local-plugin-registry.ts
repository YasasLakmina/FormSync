/**
 * Plugin Registry (Local Copy)
 * 
 * Central registry for managing all plugins in the system.
 * This is a local copy to avoid dependency on compiled plugins package.
 */

import { FormatParserPlugin } from '@formsync/plugins';
import { SchemaValidatorPlugin } from '@formsync/plugins';
import { LLMProviderPlugin } from '@formsync/plugins';
import { RuntimeGeneratorPlugin } from '@formsync/plugins';

export type PluginType = 'parser' | 'validator' | 'llm' | 'runtime-generator';

export interface PluginConfig {
  type: PluginType;
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export class LocalPluginRegistry {
  private static instance: LocalPluginRegistry;
  private parsers: Map<string, FormatParserPlugin> = new Map();
  private validators: Map<string, SchemaValidatorPlugin> = new Map();
  private llmProviders: Map<string, LLMProviderPlugin> = new Map();
  private runtimeGenerators: Map<string, RuntimeGeneratorPlugin> = new Map();

  private constructor() {}

  static getInstance(): LocalPluginRegistry {
    if (!LocalPluginRegistry.instance) {
      LocalPluginRegistry.instance = new LocalPluginRegistry();
    }
    return LocalPluginRegistry.instance;
  }

  registerParser(plugin: FormatParserPlugin): void {
    this.parsers.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered parser: ${plugin.name}`);
  }

  registerValidator(plugin: SchemaValidatorPlugin): void {
    this.validators.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered validator: ${plugin.name}`);
  }

  registerLLMProvider(plugin: LLMProviderPlugin): void {
    this.llmProviders.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered LLM provider: ${plugin.name}`);
  }

  registerRuntimeGenerator(plugin: RuntimeGeneratorPlugin): void {
    this.runtimeGenerators.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered runtime generator: ${plugin.name}`);
  }

  getParser(name: string): FormatParserPlugin | undefined {
    return this.parsers.get(name);
  }

  getAllParsers(): FormatParserPlugin[] {
    return Array.from(this.parsers.values());
  }

  getValidator(name: string): SchemaValidatorPlugin | undefined {
    return this.validators.get(name);
  }

  getAllValidators(): SchemaValidatorPlugin[] {
    return Array.from(this.validators.values());
  }

  getLLMProvider(name: string): LLMProviderPlugin | undefined {
    return this.llmProviders.get(name);
  }

  getAllLLMProviders(): LLMProviderPlugin[] {
    return Array.from(this.llmProviders.values());
  }

  getRuntimeGenerator(name: string): RuntimeGeneratorPlugin | undefined {
    return this.runtimeGenerators.get(name);
  }

  getAllRuntimeGenerators(): RuntimeGeneratorPlugin[] {
    return Array.from(this.runtimeGenerators.values());
  }

  detectParser(input: string): FormatParserPlugin | undefined {
    for (const parser of this.parsers.values()) {
      if (parser.canParse(input)) {
        return parser;
      }
    }
    return undefined;
  }

  clear(): void {
    this.parsers.clear();
    this.validators.clear();
    this.llmProviders.clear();
    this.runtimeGenerators.clear();
  }

  getStats(): { parsers: number; validators: number; llmProviders: number; runtimeGenerators: number } {
    return {
      parsers: this.parsers.size,
      validators: this.validators.size,
      llmProviders: this.llmProviders.size,
      runtimeGenerators: this.runtimeGenerators.size,
    };
  }
}
