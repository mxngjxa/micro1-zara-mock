import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerService } from './common/services/logger.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LiveKitModule } from './livekit/livekit.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10 // 10 requests per minute
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        LOG_LEVEL: Joi.string()
          .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
          .default('info'),
        FRONTEND_ORIGIN: Joi.string()
          .uri()
          .default('http://localhost:3001'),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRATION: Joi.string().default('24h'),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        LIVEKIT_URL: Joi.string().uri().required(),
        LIVEKIT_API_KEY: Joi.string().required(),
        LIVEKIT_API_SECRET: Joi.string().required(),
        FRONTEND_URL: Joi.string().uri().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Always use migrations
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    LiveKitModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ],
  exports: [LoggerService],
})
export class AppModule {}
