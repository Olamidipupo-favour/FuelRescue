import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Set global prefix (optional)
  // app.setGlobalPrefix('api');
  
  // Get port from environment or use default
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 