import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'success',
      message: 'Welcome to Heyama Dev API! 🚀',
      version: '1.0.0',
      endpoints: {
        objects: {
          list: 'GET /objects',
          create: 'POST /objects',
          detail: 'GET /objects/:id',
          delete: 'DELETE /objects/:id',
        },
        websocket: {
          connection: 'ws://localhost:3000',
          events: ['objectCreated', 'objectDeleted'],
        },
        health: 'GET /health',
      },
      documentation: 'API is ready to use!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    };
  }
}