import * as Sentry from '@sentry/node';
import { Logger } from '@nestjs/common';
import { Obj } from '@core/support/obj';
import { Integrations } from '@sentry/tracing';
import { CaptureContext } from '@sentry/types';

export interface LoggingConfig {
  dsn: string;
  env: string;
  consoleLogLevel: string;
  sentryLogLevel: string;
}

export type LogContext =
  | ({
      name: string;
    } & CaptureContext)
  | string;

const LOG_LEVEL = {
  OFF: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  VERBOSE: 5
};

enum Severity {
  Fatal = 'fatal',
  Error = 'error',
  Warning = 'warning',
  Log = 'log',
  Info = 'info',
  Debug = 'debug',
  Critical = 'critical'
}

export class Logging {
  private static consoleLogLevel: number = LOG_LEVEL.OFF;
  private static sentryLogLevel: number = LOG_LEVEL.OFF;

  static setup(loggingConfig: LoggingConfig) {
    if (loggingConfig.dsn) {
      Sentry.init({
        dsn: loggingConfig.dsn,
        environment: loggingConfig.env,
        integrations: [
          // enable HTTP calls tracing
          new Sentry.Integrations.Http({ tracing: true }),
          // enable Express.js middleware tracing
          new Integrations.Express()
        ],
        // We recommend adjusting this value in production, or using tracesSampler for finer control
        tracesSampleRate: 1.0
      });
    }
    this.consoleLogLevel = Object.keys(LOG_LEVEL).indexOf(loggingConfig.consoleLogLevel);
    this.sentryLogLevel = Object.keys(LOG_LEVEL).indexOf(loggingConfig.sentryLogLevel);
  }

  static error(message: any, exception: any, context?: LogContext) {
    const errorContext = {
      level: Severity.Error
    };
    const { name, captureContext } = this.parseContext(context, errorContext);
    if (this.enableLog(LOG_LEVEL.ERROR, this.consoleLogLevel)) {
      const trace = exception instanceof Error ? exception.stack : undefined;
      Logger.error(message, trace, name);
    }

    if (this.enableLog(LOG_LEVEL.ERROR, this.sentryLogLevel)) {
      Sentry.captureException(exception, captureContext);
    }
  }

  static log(message: any, context?: LogContext) {
    const logContext = {
      level: Severity.Log
    };
    const { name, captureContext } = this.parseContext(context, logContext);

    if (this.enableLog(LOG_LEVEL.INFO, this.consoleLogLevel)) {
      Logger.log(message, name);
    }

    if (this.enableLog(LOG_LEVEL.INFO, this.sentryLogLevel)) {
      Sentry.captureMessage(this.formatMessage(message, name), captureContext);
    }
  }

  static warn(message: any, context?: LogContext) {
    const warnContext = {
      level: Severity.Warning
    };
    const { name, captureContext } = this.parseContext(context, warnContext);
    if (this.enableLog(LOG_LEVEL.WARN, this.consoleLogLevel)) {
      Logger.warn(message, name);
    }

    if (this.enableLog(LOG_LEVEL.WARN, this.sentryLogLevel)) {
      Sentry.captureMessage(this.formatMessage(message, name), captureContext);
    }
  }

  static debug(message: any, context?: LogContext) {
    const debugContext = {
      level: Severity.Debug
    };
    const { name, captureContext } = this.parseContext(context, debugContext);
    if (this.enableLog(LOG_LEVEL.DEBUG, this.consoleLogLevel)) {
      Logger.debug(message, name);
    }

    if (this.enableLog(LOG_LEVEL.DEBUG, this.sentryLogLevel)) {
      Sentry.captureMessage(this.formatMessage(message, name), captureContext);
    }
  }

  static verbose(message: any, context?: LogContext) {
    const verboseContext = {
      level: Severity.Info
    };
    const { name, captureContext } = this.parseContext(context, verboseContext);

    if (this.enableLog(LOG_LEVEL.VERBOSE, this.consoleLogLevel)) {
      Logger.verbose(message, name);
    }
    if (this.enableLog(LOG_LEVEL.VERBOSE, this.sentryLogLevel)) {
      Sentry.captureMessage(this.formatMessage(message, name), captureContext);
    }
  }

  private static enableLog(logLevel: number, logLevelConfig: number): boolean {
    return logLevel >= logLevelConfig && !!logLevelConfig;
  }

  private static formatMessage(message: any, context: string): string {
    const output = Obj.isNotNullObject(message) ? `${'Object:'}\n${JSON.stringify(message, null, 2)}\n` : message;

    return `${context}${output}`;
  }

  private static parseContext(
    context: LogContext,
    defaultContext?: CaptureContext | any
  ): { name: string; captureContext: CaptureContext } {
    const result = {
      name: '',
      captureContext: null
    };
    if (context) {
      if (typeof context === 'string') {
        result.name = context;
        result.captureContext = defaultContext;
      } else if (typeof context === 'object') {
        result.name = context.name;
        result.captureContext = { ...defaultContext, ...Obj.clone(context, ['name']) };
      }
    }

    return result;
  }
}
