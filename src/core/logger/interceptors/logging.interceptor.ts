import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IncomingMessage } from 'http';
import { Logging } from '../logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      tap(() => {
        const method = request instanceof IncomingMessage ? request.method : '';
        const statusCode = response.statusCode;
        Logging.log(`${method}  ${request.url}  ${statusCode}    ${Date.now() - now}ms`, 'HTTP Request');
      })
    );
  }
}
