import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  type Type,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import {
  context as otelContext,
  trace,
  SpanStatusCode,
} from '@opentelemetry/api';
import { extractTraceContext, type TraceCarrier } from './propagation.js';

/**
 * Build a TCP/RPC trace-context interceptor bound to `tracerName`.
 *
 * Extracts `traceparent`/`tracestate` from the incoming RPC payload, then
 * starts a child span named `<Class>.<method>` linked to the caller's trace.
 * HTTP requests pass through unchanged (the HTTP auto-instrumentation spans
 * those).
 *
 * Usage:
 *   providers: [{ provide: APP_INTERCEPTOR, useClass: createTraceContextInterceptor('micro-business') }]
 */
export function createTraceContextInterceptor(
  tracerName: string,
): Type<NestInterceptor> {
  @Injectable()
  class TraceContextInterceptor implements NestInterceptor {
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
      if (ctx.getType() !== 'rpc') return next.handle();

      const payload = ctx.switchToRpc().getData<TraceCarrier | undefined>();
      const extracted = extractTraceContext(payload);
      if (!extracted) return next.handle();

      const tracer = trace.getTracer(tracerName);
      const className = ctx.getClass()?.name ?? 'Unknown';
      const methodName = ctx.getHandler()?.name ?? 'unknown';

      return from(
        otelContext.with(extracted, () =>
          tracer.startActiveSpan(
            `${className}.${methodName}`,
            async (span) => {
              try {
                return await new Promise<unknown>((resolve, reject) => {
                  next.handle().subscribe({
                    next: (value) => resolve(value),
                    error: (err) => reject(err),
                    complete: () => {},
                  });
                });
              } catch (error) {
                span.recordException(error as Error);
                span.setStatus({ code: SpanStatusCode.ERROR });
                throw error;
              } finally {
                span.end();
              }
            },
          ),
        ),
      );
    }
  }

  return TraceContextInterceptor;
}
