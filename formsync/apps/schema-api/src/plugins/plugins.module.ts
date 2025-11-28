/**
 * Plugins Module
 * 
 * Centralizes plugin registration and initialization
 * Makes plugins available as injectable services throughout the app
 */

import { Module, OnModuleInit, Global } from '@nestjs/common';
import { PluginRegistry } from '@formsync/plugins';
import { JsonParserPlugin } from './parsers/json-parser.plugin';
import { YamlParserPlugin } from './parsers/yaml-parser.plugin';
import { XmlParserPlugin } from './parsers/xml-parser.plugin';
import { AjvValidatorPlugin } from './validators/ajv-validator.plugin';
import { WcagValidatorPlugin } from './validators/wcag-validator.plugin';
import { OpenAILLMPlugin } from './llm/openai-llm.plugin';

@Global()
@Module({
  providers: [
    {
      provide: 'PLUGIN_REGISTRY',
      useFactory: () => {
        return PluginRegistry.getInstance();
      },
    },
    JsonParserPlugin,
    YamlParserPlugin,
    XmlParserPlugin,
    AjvValidatorPlugin,
    WcagValidatorPlugin,
    OpenAILLMPlugin,
  ],
  exports: ['PLUGIN_REGISTRY'], // Export so other modules can import and use
})
export class PluginsModule implements OnModuleInit {
  constructor() {}

  async onModuleInit() {
    console.log('🔌 Initializing plugins...');
    const registry = PluginRegistry.getInstance();

    // Register parser plugins
    registry.registerParser(new JsonParserPlugin());
    registry.registerParser(new YamlParserPlugin());
    registry.registerParser(new XmlParserPlugin());

    // Register validator plugins
    registry.registerValidator(new AjvValidatorPlugin());
    registry.registerValidator(new WcagValidatorPlugin());

    // Register LLM provider plugins
    registry.registerLLMProvider(new OpenAILLMPlugin());

    const stats = registry.getStats();
    console.log(
      `✅ Plugins loaded: ${stats.parsers} parsers, ${stats.validators} validators, ${stats.llmProviders} LLM providers`
    );
  }
}
