import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Monitoring')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check the API health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'The API is online and functional.',
    schema: {
      example: { status: 'ok', timestamp: '2026-01-16T14:00:00.000Z' }
    }
  })
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}