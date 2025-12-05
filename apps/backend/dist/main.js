"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const logger_service_1 = require("./common/services/logger.service");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const logger = app.get(logger_service_1.LoggerService);
    app.useLogger(logger);
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3001';
    app.enableCors({
        origin: frontendOrigin,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(logger));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(logger));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Interview Agent API')
        .setDescription('Voice-based AI Interview Platform API')
        .setVersion('0.1')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map