import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'schema-enhancement-engine',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
