/**
 * Schema Module
 * 
 * Feature module for schema CRUD, conversion, validation, and AI enhancement
 */

import { Module } from '@nestjs/common';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';
import { ImportService } from './import.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PluginsModule } from '../plugins/plugins.module';

@Module({
  imports: [PluginsModule],
  controllers: [SchemaController],
  providers: [SchemaService, ImportService, PrismaService, RedisService],
})
export class SchemaModule {}
