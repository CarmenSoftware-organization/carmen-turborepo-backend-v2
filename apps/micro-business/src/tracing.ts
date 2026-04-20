import 'dotenv/config';
import { initTracing } from '@repo/tracing';

initTracing({ serviceName: 'micro-business' });
