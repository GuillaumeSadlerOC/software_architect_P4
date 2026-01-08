import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  // Creating the application instance
  const app = await NestFactory.create(AppModule);

  // Retrieving the ConfigService
  // Allows centralized access to variables loaded by ConfigModule
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global prefix configuration
  // All routes will be under /api (e.g., /api/auth/login)
  app.setGlobalPrefix('api');

  // Configuring CORS (Cross-Origin Resource Sharing)
  // We retrieve the URL of the frontend defined in the .env file
  const frontendUrl = configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
  
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Overall validation (Safety & Robustness)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Cleans up incoming objects (removes properties not declared in the DTO)
      forbidNonWhitelisted: true, // The request is rejected if unexpected properties are present
      transform: true,            // Automatically transforms payloads into DTO instances
    }),
  );

  // Graceful Shutdown
  // Docker: allows the application to properly close database connections before shutting down
  app.enableShutdownHooks();

  //Server startup
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`🛡️  CORS enabled for: ${frontendUrl}`);
}
bootstrap();