import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ==================== CORS CONFIGURATION ====================
  const allowedOrigins = [
    'https://heyama-liard.vercel.app',  
    'https://heyama-43xq.onrender.com',  
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:5173'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ Blocked origin:', origin);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
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
  
  // ==================== HEALTH CHECK ====================
  app.getHttpAdapter().get('/api/health', (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Server is running', 
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });
  
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
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`======================================\n`);
}

bootstrap();