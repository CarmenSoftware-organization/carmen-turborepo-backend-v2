import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import type { Instrumentation } from '@opentelemetry/instrumentation';

export interface InitTracingOptions {
  /**
   * Logical service name emitted to the tracing backend.
   * Overridden by the `OTEL_SERVICE_NAME` env var when set.
   */
  serviceName: string;
  /**
   * OTLP HTTP collector base URL (no trailing `/v1/traces`).
   * Overridden by the `OTEL_EXPORTER_OTLP_ENDPOINT` env var when set.
   */
  defaultEndpoint?: string;
  /**
   * Include `@opentelemetry/instrumentation-express`. Enable for HTTP gateway
   * services; leave off for pure RPC microservices.
   */
  includeExpress?: boolean;
  /**
   * Extra instrumentations to append alongside the defaults.
   */
  extraInstrumentations?: Instrumentation[];
}

export interface InitTracingResult {
  sdk: NodeSDK;
  enabled: boolean;
}

let started: InitTracingResult | undefined;

/**
 * Initialise the OpenTelemetry NodeSDK for this process.
 *
 * Call this as the first statement in the service entrypoint (before importing
 * any NestJS / HTTP modules) so instrumentations can hook module load.
 *
 * Idempotent: subsequent calls return the already-started SDK.
 */
export function initTracing(options: InitTracingOptions): InitTracingResult {
  if (started) return started;

  const endpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    options.defaultEndpoint ??
    'http://dev.blueledgers.com:4318';
  const serviceName = process.env.OTEL_SERVICE_NAME ?? options.serviceName;
  const enabled = process.env.OTEL_TRACING_ENABLED !== 'false';

  const instrumentations: Instrumentation[] = enabled
    ? [
        new HttpInstrumentation(),
        ...(options.includeExpress ? [new ExpressInstrumentation()] : []),
        new NestInstrumentation(),
        ...(options.extraInstrumentations ?? []),
      ]
    : [];

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.0.0',
      'deployment.environment': process.env.NODE_ENV ?? 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
    instrumentations,
  });

  if (enabled) {
    sdk.start();
    // eslint-disable-next-line no-console
    console.log(`[OTEL] Tracing enabled for ${serviceName} -> ${endpoint}`);

    const shutdown = (): void => {
      sdk
        .shutdown()
        .then(() => console.log('[OTEL] Tracing shut down'))
        .catch((err) => console.error('[OTEL] Error shutting down tracing', err))
        .finally(() => process.exit(0));
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  started = { sdk, enabled };
  return started;
}
