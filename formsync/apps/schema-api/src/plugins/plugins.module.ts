/**
 * Plugins Module
 * 
 * Centralizes plugin registration and initialization
 * Makes plugins available as injectable services throughout the app
 */

import { Module, OnModuleInit, Global } from '@nestjs/common';
import { LocalPluginRegistry } from './local-plugin-registry';
import { JsonParserPlugin } from './parsers/json-parser.plugin';
import { YamlParserPlugin } from './parsers/yaml-parser.plugin';
import { XmlParserPlugin } from './parsers/xml-parser.plugin';
import { AjvValidatorPlugin } from './validators/ajv-validator.plugin';
import { WcagValidatorPlugin } from './validators/wcag-validator.plugin';
import { OpenAILLMPlugin } from './llm/openai-llm.plugin';
import { SpringBootGeneratorPlugin } from './generators/springboot-generator.plugin';
import { SpringBootScaffoldService } from '../runtime-binding-validator/services/springboot-scaffold.service';
import { DtoGeneratorService } from '../runtime-binding-validator/services/dto-generator.service';
import { ControllerGeneratorService } from '../runtime-binding-validator/services/controller-generator.service';

@Global()
@Module({
  providers: [
    {
      provide: 'PLUGIN_REGISTRY',
      useFactory: () => {
        return LocalPluginRegistry.getInstance();
      },
    },
    JsonParserPlugin,
    YamlParserPlugin,
    XmlParserPlugin,
    AjvValidatorPlugin,
    WcagValidatorPlugin,
    OpenAILLMPlugin,
    // Generator services (needed by SpringBootGeneratorPlugin)
    SpringBootScaffoldService,
    DtoGeneratorService,
    ControllerGeneratorService,
    // Runtime generator plugins
    SpringBootGeneratorPlugin,
  ],
  exports: ['PLUGIN_REGISTRY', OpenAILLMPlugin], // Export plugin for use in other modules
})
export class PluginsModule implements OnModuleInit {
  constructor() {}

  async onModuleInit() {
    console.log('🔌 Initializing plugins...');
    const registry = LocalPluginRegistry.getInstance();

    // Register parser plugins
    registry.registerParser(new JsonParserPlugin());
    registry.registerParser(new YamlParserPlugin());
    registry.registerParser(new XmlParserPlugin());

    // Register validator plugins
    registry.registerValidator(new AjvValidatorPlugin());
    registry.registerValidator(new WcagValidatorPlugin());

    // Register LLM provider plugins
    registry.registerLLMProvider(new OpenAILLMPlugin());

    // Register runtime generator plugins
    const springBootGenerator = new SpringBootGeneratorPlugin(
      new SpringBootScaffoldService(),
      new DtoGeneratorService(),
      new ControllerGeneratorService()
    );
    registry.registerRuntimeGenerator(springBootGenerator);

    const stats = registry.getStats();
    console.log(
      `✅ Plugins loaded: ${stats.parsers} parsers, ${stats.validators} validators, ${stats.llmProviders} LLM providers, ${stats.runtimeGenerators} runtime generators`
    );
  }
}
