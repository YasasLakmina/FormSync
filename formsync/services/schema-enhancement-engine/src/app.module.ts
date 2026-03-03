/**
 * Root Application Module
 *
 * Orchestrates all feature modules and configures global services:
 * - Configuration management (env variables)
 * - Database connection (Prisma)
 * - Feature modules (Schema)
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { SchemaModule } from './schema/schema.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    // Feature modules
    SchemaModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    console.log('🔌 Initializing FormSync API...');
    await this.prisma.enableShutdownHooks();
    console.log('✅ Database connection established');
  }
}
