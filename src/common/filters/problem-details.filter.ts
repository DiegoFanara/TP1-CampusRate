import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

const CLIENT_ERROR_DETAILS: Record<number, string> = {
  413: 'Le corps de requete depasse la taille maximale autoriser.',
  415: "Le type de contenus (Content-Type) n'est pas supporter.",
};

function getClientErrorStatus(exception: unknown): number | undefined {
  if (typeof exception !== 'object' || exception === null) {
    return undefined;
  }
  const { status, statusCode } = exception as {
    status?: unknown;
    statusCode?: unknown;
  };
  const value = typeof status === 'number' ? status : statusCode;
  return typeof value === 'number' && value >= 400 && value < 500
    ? value
    : undefined;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const clientErrorStatus = getClientErrorStatus(exception);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (clientErrorStatus ?? HttpStatus.INTERNAL_SERVER_ERROR);

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
    } else if (clientErrorStatus) {
      detail = CLIENT_ERROR_DETAILS[clientErrorStatus] ?? 'Requete invalide.';
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