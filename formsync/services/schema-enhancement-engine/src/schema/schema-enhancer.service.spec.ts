/**
 * Testing Guide for Schema Enhancement Engine
 * 
 * This file demonstrates how to test the SchemaEnhancerService
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SchemaEnhancerService } from './schema-enhancer.service';
import { OpenAILLMPlugin } from '../plugins/llm/openai-llm.plugin';
import { SchemaQualityEngine } from './schema-quality-engine';
import { SchemaSuggestionEngine } from './schema-suggestion.engine';

describe('SchemaEnhancerService', () => {
  let service: SchemaEnhancerService;
  let llmPlugin: OpenAILLMPlugin;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemaEnhancerService,
        SchemaQualityEngine,
        SchemaSuggestionEngine,
        {
          provide: 'LLMProviderPlugin',
          useClass: OpenAILLMPlugin,
        },
      ],
    }).compile();

    service = module.get<SchemaEnhancerService>(SchemaEnhancerService);
    llmPlugin = module.get('LLMProviderPlugin');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enhance schema with quality scoring', async () => {
    const testSchema = {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    };

    const result = await service.enhanceSchema(testSchema, {
      focusAreas: ['accessibility', 'validation'],
    });

    // Should have changes (auto-applied fixes)
    expect(result.changes).toBeDefined();
    expect(Array.isArray(result.changes)).toBe(true);

    // Should have suggestions (not auto-applied)
    expect(result.suggestions).toBeDefined();
    expect(Array.isArray(result.suggestions)).toBe(true);

    // Should have quality score
    expect(result.quality).toBeDefined();
    expect(result.quality.score).toBeGreaterThanOrEqual(0);
    expect(result.quality.score).toBeLessThanOrEqual(100);

    // Should have enhanced schema
    expect(result.enhancedSchema).toBeDefined();

    console.log('Quality Score:', result.quality.score);
    console.log('Changes Applied:', result.changes.length);
    console.log('Suggestions Available:', result.suggestions.length);
  });

  it('should calculate accessibility coverage correctly', async () => {
    const schemaWithAccessibility = {
      type: 'object',
      properties: {
        field1: {
          type: 'string',
          'x-accessibility': { label: 'Field 1' },
        },
        field2: {
          type: 'string',
          // No accessibility
        },
      },
    };

    const result = await service.enhanceSchema(schemaWithAccessibility);

    // With 50% coverage, quality score should be less than perfect
    expect(result.quality.score).toBeLessThan(100);
    expect(result.quality.breakdown).toBeDefined();
  });
});
