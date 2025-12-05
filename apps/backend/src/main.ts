import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './common/services/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Bootstraps and starts the NestJS application with validation, logging, exception handling, and Swagger documentation.
 *
 * Configures buffered logging and a shared LoggerService, applies global validation pipe (whitelisting, forbidding unknown properties, and transformation), registers a global logging interceptor and exception filter, sets up Swagger at /api/docs, and listens on the port specified by `process.env.PORT` or 3000.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Global Pipe for Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Interceptor for Logging
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  // Global Filter for Exceptions
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Interview Agent API')
    .setDescription('Voice-based AI Interview Platform API')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();