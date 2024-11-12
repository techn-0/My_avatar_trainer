import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import * as cookieParser from 'cookie-parser';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000', // 클라이언트 URL
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe()); // Enable validation globally
  const serveConfig = config.get('server');
  const port = serveConfig.port;
  const redisConfig = config.get('redis');
  const redisPort = redisConfig.port;


  await app.listen(port);
  Logger.log(`server is running on port ${port}`);
  Logger.log(`Redis is running on port ${redisPort}`, 'Bootstrap');
}
bootstrap();
