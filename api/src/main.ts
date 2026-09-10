import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Strip unknown properties and enforce DTO validation on every route.
  // Important for booking/payment endpoints where unexpected fields
  // (e.g. a client trying to set totalPrice directly) must be rejected.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(); // tighten to specific origins before production deploy

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Bloom Booking API running on port ${port}`);
}
bootstrap();
