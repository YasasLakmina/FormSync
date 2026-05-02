/**
 * Schema Module
 *
 * Feature module for schema CRUD, conversion, validation, and AI enhancement
 */

import { Module } from '@nestjs/common';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';
import { SchemaEnhancerService } from './schema-enhancer.service';
import { SchemaQualityEngine } from './schema-quality-engine';
import { SchemaSuggestionEngine } from './schema-suggestion.engine';
import { SchemaSyntaxValidator } from './schema-syntax-validator';
import { ImportService } from './import.service';
import { ParserService } from './parser.service';
import { ValidatorService } from './validator.service';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAILLMPlugin } from '../plugins/llm/openai-llm.plugin';
import { SrsParserService } from './srs-parser.service';

@Module({
  controllers: [SchemaController],
  providers: [
    SchemaService,
    SchemaEnhancerService,
    SchemaQualityEngine,
    SchemaSuggestionEngine,
    SchemaSyntaxValidator,
    ImportService,
    ParserService,
    ValidatorService,
    PrismaService,
    OpenAILLMPlugin,
    SrsParserService,
  ],
})
export class SchemaModule {}
