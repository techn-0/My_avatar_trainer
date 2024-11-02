import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serveConfig = config.get('server');
  const port = serveConfig.port;

  app.enableCors({
    origin: 'http://15.165.191.221:3000', // 클라이언트 URL
    credentials: true,
  });

  await app.listen(port);
  Logger.log(`server is running on port ${port}`);
}
bootstrap();
