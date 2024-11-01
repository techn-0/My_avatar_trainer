import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const serveConfig = config.get('server');
  const port = serveConfig.port;

  app.enableCors({
    origin: 'http://localhost:3000', // 클라이언트 URL
    credentials: true,
  });

  await app.listen(port);
  Logger.log(`server is running on port ${port}`);
}
bootstrap();
