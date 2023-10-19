import { Logging } from './logging.service';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }
  ]
})
export class LoggingModule {
  constructor(config: ConfigService) {
    Logging.setup({
      dsn: config.get('logging.sentryDSN'),
      env: config.get('app.env'),
      consoleLogLevel: config.get('logging.consoleLogLevel'),
      sentryLogLevel: config.get('logging.sentryLogLevel')
    });
  }
}
