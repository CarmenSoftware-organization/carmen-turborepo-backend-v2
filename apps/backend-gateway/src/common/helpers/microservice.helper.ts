import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable, timeout, catchError, throwError } from 'rxjs';
import { BackendLogger } from './backend.logger';

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

const logger = new BackendLogger('MicroserviceHelper');

/**
 * Sends a message to a microservice with timeout and error handling.
 * Use this instead of raw firstValueFrom() to prevent hanging requests.
 */
export async function sendToService<T = unknown>(
  client: ClientProxy,
  pattern: Record<string, string>,
  data: Record<string, unknown>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  try {
    const res: Observable<T> = client.send(pattern, data);

    return await firstValueFrom(
      res.pipe(
        timeout(timeoutMs),
        catchError((err) => {
          if (err.name === 'TimeoutError') {
            logger.error(
              {
                function: 'sendToService',
                pattern,
                error: `Service timeout after ${timeoutMs}ms`,
              },
              'MicroserviceHelper',
            );
            return throwError(
              () => new HttpException('Service timeout', HttpStatus.GATEWAY_TIMEOUT),
            );
          }
          return throwError(() => err);
        }),
      ),
    );
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    logger.error(
      {
        function: 'sendToService',
        pattern,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'MicroserviceHelper',
    );

    throw new HttpException(
      'Service unavailable',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
