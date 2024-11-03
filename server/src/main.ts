import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as config from 'config';
import * as cookieParser from 'cookie-parser';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // NestExpressApplication 타입으로 설정
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  
  const serveConfig = config.get('server');
  const port = serveConfig.port;

  app.enableCors({
    origin: [
      'https://techn0.shop',  // HTTPS 도메인 허용

      'http://15.165.191.221:3002', // 직접 IP로 접근할 경우
    ],
    credentials: true,
  });

  // Static assets 설정
  app.useStaticAssets(join(__dirname, '..', '..', 'pose', 'build'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'pose', 'build'));

  await app.listen(port);
  Logger.log(`server is running on port ${port}`);
}
bootstrap();
