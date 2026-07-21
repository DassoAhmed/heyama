import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  
  // Global prefix for all routes (optional)
  app.setGlobalPrefix('api');
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
  console.log('🚀 API running on http://localhost:3000');
  console.log('📚 API Documentation: http://localhost:3000/api');
  console.log('❤️  Health Check: http://localhost:3000/api/health');
}
bootstrap();