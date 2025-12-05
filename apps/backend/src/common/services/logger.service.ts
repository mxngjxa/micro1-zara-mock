import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  log(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.extractMeta(optionalParams);
    this.logger.info(message, { context, meta });
  }

  error(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.extractMeta(optionalParams);
    this.logger.error(message, { context, meta });
  }

  warn(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.extractMeta(optionalParams);
    this.logger.warn(message, { context, meta });
  }

  debug(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.extractMeta(optionalParams);
    this.logger.debug(message, { context, meta });
  }

  verbose(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.extractMeta(optionalParams);
    this.logger.verbose(message, { context, meta });
  }

  fatal(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.extractMeta(optionalParams);
    this.logger.error(message, { context, meta, fatal: true });
  }

  private extractMeta(params: any[]): { context?: string; meta: any[] } {
    if (params.length === 0) {
      return { meta: [] };
    }

    const last = params[params.length - 1];
    if (typeof last === 'string') {
      return {
        context: last,
        meta: params.slice(0, -1),
      };
    }

    return { meta: params };
  }
}