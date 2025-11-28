/**
 * Redis Service
 * 
 * Injectable service for Redis caching operations
 * Used to cache conversion results, validation results, and AI enhancements
 * 
 * Design Decision: TTL defaults to 1 hour for most cached data
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly DEFAULT_TTL = 3600; // 1 hour

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    
    await this.client.connect();
    console.log('✅ Redis connected');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Get a value from Redis
   */
  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * Set a value in Redis with optional TTL
   */
  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.setEx(key, ttl, stringValue);
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  /**
   * Clear all keys matching a pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}
