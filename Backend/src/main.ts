import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS with extensive options
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400,
  });
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  const port = 3000;
  await app.listen(port);
  
  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔌 Socket.IO server running on http://localhost:${port}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${port}`);
  console.log(`📁 Uploads served from: http://localhost:${port}/uploads`);
}
bootstrap();