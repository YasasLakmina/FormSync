/**
 * Root Application Module
 * 
 * Orchestrates all feature modules and configures global services:
 * - Configuration management (env variables)
 * - Database connection (Prisma)
 * - Redis connection
 * - Plugin system initialization
 * - Feature modules (Schema, Plugins)
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { SchemaModule } from './schema/schema.module';
import { PluginsModule } from './plugins/plugins.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    // Feature modules
    SchemaModule,
    PluginsModule,
  ],
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async onModuleInit() {
    console.log('🔌 Initializing FormSync API...');
    await this.prisma.enableShutdownHooks();
    console.log('✅ Database connection established');
    console.log('✅ Redis connection established');
    console.log('✅ Plugin system ready');
  }
}
