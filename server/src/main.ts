import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const serveConfig = config.get('server');
  const port = serveConfig.port;
  app.enableCors();
  await app.listen(port);
  Logger.log(`server is running on port ${port}`);
}
bootstrap();
