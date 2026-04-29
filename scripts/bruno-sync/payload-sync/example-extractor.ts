import type { JsonValue, OpenApiOperation, OpenApiSchema } from '../types';

const ISO_DATE_TIME = '2026-04-29T00:00:00.000Z';
const ISO_DATE = '2026-04-29';

export function extractFromOperationLevel(op: OpenApiOperation): JsonValue | null {
  const content = op.requestBody?.content?.['application/json'];
  if (!content) return null;
  if (content.example !== undefined) return content.example;
  if (content.schema?.example !== undefined) return content.schema.example;
  return null;
}

export function extractFromSchema(schema: OpenApiSchema): JsonValue | undefined {
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];
  return undefined;
}

export function formatDefault(schema: OpenApiSchema): JsonValue {
  if (schema.type === 'string') {
    switch (schema.format) {
      case 'date-time': return ISO_DATE_TIME;
      case 'date': return ISO_DATE;
      case 'uuid': return '';
      case 'email': return 'user@example.com';
      case 'uri':
      case 'url':
        return 'https://example.com';
      default: return '';
    }
  }
  if (schema.type === 'number' || schema.type === 'integer') return 0;
  if (schema.type === 'boolean') return false;
  if (schema.type === 'array') return [];
  if (schema.type === 'object') return {};
  if (schema.type === 'null') return null;
  return null;
}

const SAMPLE_BODY_RE = /###\s*Sample Body\s*\n+```json\s*\n([\s\S]*?)```/i;

export function parseSampleBodyFromDocs(docs: string): JsonValue | null {
  const match = docs.match(SAMPLE_BODY_RE);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as JsonValue;
  } catch {
    return null;
  }
}

export function lookupInDocsValue(
  docsValue: JsonValue | null,
  fieldName: string,
): JsonValue | undefined {
  if (!docsValue || typeof docsValue !== 'object' || Array.isArray(docsValue)) {
    return undefined;
  }
  const obj = docsValue as { [k: string]: JsonValue };
  return fieldName in obj ? obj[fieldName] : undefined;
}
