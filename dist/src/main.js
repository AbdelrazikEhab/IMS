import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));
    app.use(helmet());
    app.enableCors({
        origin: (origin, callback) => {
            const platformDomain = process.env.PLATFORM_DOMAIN || 'localhost';
            if (!origin ||
                origin.includes(platformDomain) ||
                origin.includes('localhost')) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new DocumentBuilder()
        .setTitle('Multi-Tenant LMS Platform API')
        .setDescription('The API documentation for the Multi-Tenant LMS platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Server running on: http://localhost:${port}`);
    console.log(`Swagger docs at: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map