import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security Headers
  app.use(helmet());
  
  // Input Validation & Sanitization
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Secure CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3014',
      /\.pitayacode\.io$/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  
  // Aumentar el límite de tamaño para recibir payloads de Flow (ej. base64 o skills grandes)
  const { json, urlencoded } = require('express');
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  await app.listen(process.env.PORT ?? 3014);
}
bootstrap();
