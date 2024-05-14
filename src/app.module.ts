import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggingModule } from '@core/logger/logging.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ExceptionModule } from '@core/exception/exception.module';
import { TransformInterceptor } from '@core/interceptor/transform.interceptor';
import { validationOptions } from '@config/validation';
import { AllExceptionsFilter } from '@core/filter/all-exception.filter';
import { LoadModule } from '@module/load/load.module';
import { AuthModule } from '@module/auth/auth.module';
import { BookingModule } from '@module/booking/booking.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: config
    }),
    LoggingModule,
    ExceptionModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URL || 'mongodb+srv://flatfive:PcFNxuiCXvvw3Ce7@cluster0.8ad0wnd.mongodb.net'
    ),
    AuthModule,
    LoadModule,
    BookingModule
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
