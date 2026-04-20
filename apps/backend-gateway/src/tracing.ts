import 'dotenv/config';
import { initTracing } from '@repo/tracing';

initTracing({ serviceName: 'backend-gateway', includeExpress: true });
