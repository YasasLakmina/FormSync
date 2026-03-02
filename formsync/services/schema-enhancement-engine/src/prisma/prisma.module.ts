/**
 * Prisma Module
 * 
 * Global module that provides Prisma database access across the application
 * Exports PrismaService for dependency injection
 */

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
