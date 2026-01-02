/**
 * Testing Guide for Schema Enhancement Engine
 * 
 * This file demonstrates how to test the SchemaEnhancerService
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SchemaEnhancerService } from './schema-enhancer.service';
import { OpenAILLMPlugin } from '../plugins/llm/openai-llm.plugin';

describe('SchemaEnhancerService', () => {
  let service: SchemaEnhancerService;
  let llmPlugin: OpenAILLMPlugin;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemaEnhancerService,
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

  it('should enhance schema with explainability', async () => {
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

    // Should have explanations
    expect(result.explanations).toBeDefined();
    expect(Array.isArray(result.explanations)).toBe(true);

    // Should have quality score
    expect(result.qualityScore).toBeDefined();
    expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    expect(result.qualityScore).toBeLessThanOrEqual(100);

    // Should have enhanced schema
    expect(result.enhancedSchema).toBeDefined();

    console.log('Quality Score:', result.qualityScore);
    console.log('Explanations:', result.explanations);
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

    // With 50% coverage, quality score should be affected
    expect(result.qualityScore).toBeLessThan(100);
  });
});
