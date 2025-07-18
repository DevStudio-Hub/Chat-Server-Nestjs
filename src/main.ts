import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: ['http://192.168.1.5:4200', 'http://localhost:4200'],
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  app.use(morgan('dev'));
  await app.listen(3000);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
