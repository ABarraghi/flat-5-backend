import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import { useContainer } from 'class-validator';

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

  app.enableCors();
  app.use(compression());
  // Now everywhere you can inject Validator class which will go from the container
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });

  await app.listen(3000);
}
bootstrap();
