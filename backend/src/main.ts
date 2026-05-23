import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.setGlobalPrefix('api/v1');

  const port = parseInt(process.env.PORT ?? '8000', 10);
  const trustedOrigins = process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [`http://localhost:${port}`, 'http://localhost:3000'];

  app.enableCors({
    origin: trustedOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  await app.listen(port);
  console.log(`Daleel API: ${process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`}`);
  console.log(`Swagger UI: ${process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`}/api/docs`);
}
bootstrap();
