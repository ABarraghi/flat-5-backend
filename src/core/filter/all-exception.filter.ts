import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { ErrorCodeService } from '../exception/error-code.service';
import { IncomingMessage } from 'http';
import { Logging } from '@core/logger/logging.service';

export interface FormattedResponse {
  statusCode: any;
  error: any;
  errorCode?: string;
  message?: any;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly config: ConfigService) {
    super();
  }

  private static formatValidationsMessages(
    errors: ValidationError[] | ValidationError,
    messagesFormatted: object = {}
  ) {
    if (Array.isArray(errors)) {
      errors.map(error => {
        AllExceptionsFilter.formatValidationsMessages(error, messagesFormatted);
      });
    } else {
      if (errors.constraints) {
        messagesFormatted[errors.property] = errors.constraints;
      }
      if (errors.children) {
        messagesFormatted[errors.property] = messagesFormatted[errors.property] ?? {};
        AllExceptionsFilter.formatValidationsMessages(
          errors.children,
          messagesFormatted[errors.property]
        );
      }
    }

    return messagesFormatted;
  }

  private static format(exception: HttpException) {
    const errors = exception.getResponse();
    if (errors['errorCode']) {
      // full error
      return errors;
    } else if (typeof errors['message'] === 'string') {
      // only errorCode
      return ErrorCodeService.getError(errors['message']) ?? errors['message'];
    } else if (typeof errors === 'object' && errors['statusCode'] && errors['message']) {
      // this error come from validation
      return AllExceptionsFilter.formatValidationsMessages(errors['message']);
    } else {
      return errors;
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const isDebug = this.config.get('app.debug');
    const response = host.switchToHttp().getResponse();
    let formattedResponse: FormattedResponse;
    if (exception instanceof HttpException) {
      const formatErrors = AllExceptionsFilter.format(exception);
      formattedResponse = {
        statusCode: exception.getStatus(),
        error: formatErrors['errorCode']
          ? { [formatErrors['errorCode']]: formatErrors['message'] }
          : formatErrors,
        message: formatErrors['message'],
        errorCode: formatErrors['errorCode']
      };

      this.logHandledError(exception, host);
    } else {
      this.logUnknownError(exception, host);
      formattedResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: exception.toString()
      };
    }
    response.status(formattedResponse.statusCode).send({
      ...formattedResponse,
      stack: isDebug ? exception['stack'] : undefined,
      handler: isDebug ? 'AllExceptionsFilter' : undefined
    });
  }

  logUnknownError(exception, host) {
    const request = host.switchToHttp().getRequest();
    const errorMessage = exception instanceof Error ? exception.message : '';
    const method = request instanceof IncomingMessage ? request.method : '';
    Logging.error(`[${method}] [${request.url}] ${errorMessage}`, exception, {
      name: 'REQUEST_ERROR',
      user: request.user
    });
  }

  logHandledError(exception, host) {
    const request = host.switchToHttp().getRequest();
    const method = request instanceof IncomingMessage ? request.method : '';
    if (exception.getStatus() !== HttpStatus.NOT_FOUND) {
      Logging.warn(`${method}  ${request.url}`, `[${exception.getStatus()}] HTTP Bad Request `);
    }
  }
}
