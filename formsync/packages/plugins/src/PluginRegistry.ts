/**
 * Plugin Registry
 * 
 * Central registry for managing all plugins in the system.
 * Supports dynamic loading from configuration and type-safe retrieval.
 * 
 * Design Decision: Uses a singleton pattern to ensure one registry instance
 * across the application. Plugins are registered by type and name.
 */

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

export class PluginRegistry {
  private static instance: PluginRegistry;
  private parsers: Map<string, FormatParserPlugin> = new Map();
  private validators: Map<string, SchemaValidatorPlugin> = new Map();
  private llmProviders: Map<string, LLMProviderPlugin> = new Map();

  private constructor() {}

  /**
   * Get singleton instance of the registry
   */
  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Register a format parser plugin
   */
  registerParser(plugin: FormatParserPlugin): void {
    this.parsers.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered parser: ${plugin.name}`);
  }

  /**
   * Register a schema validator plugin
   */
  registerValidator(plugin: SchemaValidatorPlugin): void {
    this.validators.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered validator: ${plugin.name}`);
  }

  /**
   * Register an LLM provider plugin
   */
  registerLLMProvider(plugin: LLMProviderPlugin): void {
    this.llmProviders.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered LLM provider: ${plugin.name}`);
  }

  /**
   * Get a specific parser by name
   */
  getParser(name: string): FormatParserPlugin | undefined {
    return this.parsers.get(name);
  }

  /**
   * Get all registered parsers
   */
  getAllParsers(): FormatParserPlugin[] {
    return Array.from(this.parsers.values());
  }

  /**
   * Get a specific validator by name
   */
  getValidator(name: string): SchemaValidatorPlugin | undefined {
    return this.validators.get(name);
  }

  /**
   * Get all registered validators
   */
  getAllValidators(): SchemaValidatorPlugin[] {
    return Array.from(this.validators.values());
  }

  /**
   * Get a specific LLM provider by name
   */
  getLLMProvider(name: string): LLMProviderPlugin | undefined {
    return this.llmProviders.get(name);
  }

  /**
   * Get all registered LLM providers
   */
  getAllLLMProviders(): LLMProviderPlugin[] {
    return Array.from(this.llmProviders.values());
  }

  /**
   * Auto-detect and get the appropriate parser for input
   */
  detectParser(input: string): FormatParserPlugin | undefined {
    for (const parser of this.parsers.values()) {
      if (parser.canParse(input)) {
        return parser;
      }
    }
    return undefined;
  }

  /**
   * Clear all registered plugins (useful for testing)
   */
  clear(): void {
    this.parsers.clear();
    this.validators.clear();
    this.llmProviders.clear();
  }

  /**
   * Get registry statistics
   */
  getStats(): { parsers: number; validators: number; llmProviders: number } {
    return {
      parsers: this.parsers.size,
      validators: this.validators.size,
      llmProviders: this.llmProviders.size,
    };
  }
}
