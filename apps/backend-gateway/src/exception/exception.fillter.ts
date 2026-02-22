import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response, Request } from 'express'
import { ZodValidationException } from 'nestjs-zod'
import * as Sentry from '@sentry/node'

@Catch()
export class ExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = (exception as Record<string, unknown>)?.error
      ? String((exception as Record<string, Record<string, unknown>>).error.message)
      : 'Internal server error';
    try {
      message = JSON.parse(message as string);
    } catch {
      // Keep original message if parsing fails
    }
    let errorResponse: Record<string, unknown> | null = null;

    // Handle Zod validation errors with detailed field-level messages
    if (exception instanceof ZodValidationException) {
      status = exception.getStatus();
      const zodError = exception.getZodError();
      const fieldErrors = zodError.errors.map((err) => {
        const path = err.path.length > 0 ? err.path.join('.') : '(root)';
        return `${path}: ${err.message}`;
      });
      message = fieldErrors;
      errorResponse = {
        statusCode: status,
        error: 'Validation failed',
        errors: zodError.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle different response formats
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as Record<string, unknown>).message as string || exception.message;
        errorResponse = exceptionResponse as Record<string, unknown>;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error({ exception, message }, 'ExceptionFilter');
    Sentry.captureException(exception);

    response.status(status).json({
      success: false,
      status: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(errorResponse && typeof errorResponse === 'object' ? errorResponse : {}),
    });
  }
}