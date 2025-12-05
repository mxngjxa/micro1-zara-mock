import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const stack = exception instanceof Error ? exception.stack : '';

    this.logger.error(
      `HTTP ${status} Error: ${message} - Path: ${request.url}`,
      stack,
      'ExceptionFilter',
    );

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}