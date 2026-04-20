import { trace, SpanStatusCode, type Span } from '@opentelemetry/api';

/**
 * Wrap an async function in a child span.
 *
 * Use for sub-spans inside a handler (e.g. around a DB query, a remote call,
 * or a non-trivial computation) when the default Nest/HTTP auto-instrumentation
 * isn't granular enough.
 *
 * The span records exceptions and ends automatically.
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  tracerName = 'app',
): Promise<T> {
  const tracer = trace.getTracer(tracerName);
  return tracer.startActiveSpan(name, async (span) => {
    try {
      return await fn(span);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}
