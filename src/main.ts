import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use nestjs-pino for structured logging
  app.useLogger(app.get(Logger));

  // Security headers
  app.use(helmet());

  // CORS config
  app.enableCors({
    origin: (origin, callback) => {
      // Allow localhost and any subdomain of our main domain
      const platformDomain = process.env.PLATFORM_DOMAIN || 'localhost';
      if (
        !origin ||
        origin.includes(platformDomain) ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // API Versioning (Rule 3)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation (Rule 5)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Multi-Tenant LMS Platform API')
    .setDescription('The API documentation for the Multi-Tenant LMS platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Server running on: http://localhost:${port}`);
    console.log(`Swagger docs at: http://localhost:${port}/docs`);
  } else {
    // For Vercel, we need to init but not listen
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
}

// Global bootstrap for local/standard runs
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Export for Vercel
export default async (req: any, res: any) => {
  try {
    if (!cachedApp) {
      await bootstrap();
    }
    return cachedApp(req, res);
  } catch (err) {
    console.error('CRITICAL: App failed to bootstrap', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Critical system error during startup',
        error: err.message,
      });
    }
  }
};

