/**
 * Redis Module
 * 
 * Global module that provides Redis caching access across the application
 * Exports RedisService for dependency injection
 */

import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
