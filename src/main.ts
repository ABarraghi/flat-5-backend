import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import { useContainer } from 'class-validator';
import { json } from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.use('/', (req, res, next) => {
    if (req.url === '/') {
      res.send(`Welcome to Flat5 Api [${process.env.NODE_ENV}]`);
    } else if (!req.url.startsWith('/api')) {
      res.status(404).send('NOT FOUND');
    } else {
      next();
    }
  });

  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: ['http://localhost:3000', 'https://flat-5-frontend.vercel.app', 'https://flat-5-frontend-two.vercel.app'],
    credentials: true
  });
  app.use(compression());
  // Now everywhere you can inject Validator class which will go from the container
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });

  const configService = app.get(ConfigService);
  app.use(json({ limit: configService.get('app.bodyParser.limit', '100kb') }));

  const port = configService.get('app.port');

  await app.listen(port);
}
bootstrap();
