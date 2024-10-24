import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Create a NestExpressApplication instance
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static assets from the 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(3000);
}
bootstrap();
