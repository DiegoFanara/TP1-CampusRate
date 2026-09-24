import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let title = HttpStatus[status] ?? 'Internal Server Error';
    let detail = 'Une erreur inattendue est survenue.';

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        detail = body;
      } else if (body && typeof body === 'object' && 'message' in body) {
        const message = (body as { message: unknown }).message;
        detail = Array.isArray(message) ? message.join(', ') : String(message);
      }
      title = exception.name.replace('Exception', '');
    }

    response.status(status).type('application/problem+json').json({
      type: 'about:blank',
      title,
      status,
      detail,
      instance: request.url,
    });
  }
}
