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
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PluginsModule } from '../plugins/plugins.module';

@Module({
  imports: [PluginsModule],
  controllers: [SchemaController],
  providers: [
    SchemaService,
    SchemaEnhancerService,
    SchemaQualityEngine,
    SchemaSuggestionEngine,
    SchemaSyntaxValidator,
    ImportService,
    PrismaService,
    RedisService,
  ],
})
export class SchemaModule {}
