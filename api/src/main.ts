import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
  AppModule,
);
app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});

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
