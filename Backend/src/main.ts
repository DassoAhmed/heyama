import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ==================== CORS CONFIGURATION ====================
  const allowedOrigins = [
    process.env.CLIENT_URL ||   'https://heyama-43xq.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.log('❌ Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400,
  });
  
  // ==================== BODY PARSING ====================
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
  
  // ==================== STATIC FILES ====================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  // ==================== GLOBAL PREFIX & PIPES ====================
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // ==================== START SERVER ====================
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`\n🚀 ======================================`);
  console.log(`✅ Server is running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`❤️  Health Check: http://localhost:${port}/api/health`);
  console.log(`🔌 Socket.IO: ws://localhost:${port}`);
  console.log(`📁 Uploads: http://localhost:${port}/uploads`);
  console.log(`======================================\n`);
}

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  process.exit(0);
});

bootstrap();