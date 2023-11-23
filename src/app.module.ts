import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { ExceptionModule } from '@core/exception/exception.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TransformInterceptor } from '@core/interceptor/transform.interceptor';
import { validationOptions } from '@config/validation';
import { AllExceptionsFilter } from '@core/filter/all-exception.filter';
import { LoggingModule } from '@core/logger/logging.module';
import { LoadModule } from '@module/load/load.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: config
    }),
    LoggingModule,
    ExceptionModule,
    MongooseModule.forRoot('mongodb+srv://flat-local:hgvxvCjQQFJz3PSi@cluster-for-local.bdpwm99.mongodb.net/flat-5'),
    LoadModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor
    },
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          ...validationOptions,
          exceptionFactory: errors => {
            return new BadRequestException(errors);
          }
        });
      }
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    AppService
  ]
})
export class AppModule {}
