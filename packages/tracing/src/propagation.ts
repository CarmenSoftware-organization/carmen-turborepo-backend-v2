import {
  context as otelContext,
  propagation,
  type Context,
} from '@opentelemetry/api';

export interface TraceCarrier {
  traceparent?: string;
  tracestate?: string;
}

/**
 * Inject the current active trace context into a plain carrier.
 *
 * Used by gateway-side code before sending an RPC payload so downstream
 * services can rejoin the same trace.
 */
export function injectTraceContext(): TraceCarrier {
  const carrier: Record<string, string> = {};
  propagation.inject(otelContext.active(), carrier);
  const out: TraceCarrier = {};
  if (carrier.traceparent) out.traceparent = carrier.traceparent;
  if (carrier.tracestate) out.tracestate = carrier.tracestate;
  return out;
}

/**
 * Extract a W3C trace context from an incoming RPC payload.
 *
 * Returns `undefined` when no `traceparent` is present so callers can skip
 * context switching for un-traced calls.
 */
export function extractTraceContext(
  payload: TraceCarrier | null | undefined,
): Context | undefined {
  const traceparent = payload?.traceparent;
  if (!traceparent) return undefined;

  const carrier: Record<string, string> = { traceparent };
  if (payload?.tracestate) carrier.tracestate = payload.tracestate;
  return propagation.extract(otelContext.active(), carrier);
}
