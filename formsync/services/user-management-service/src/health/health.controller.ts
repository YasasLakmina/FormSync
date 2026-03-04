import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'user-management-service',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
