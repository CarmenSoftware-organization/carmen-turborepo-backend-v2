import type {
  JsonValue,
  OpenApiDocument,
  OpenApiOperation,
  OpenApiSchema,
} from '../types';
import { resolveSchema } from './schema-resolver';
import {
  extractFromOperationLevel,
  extractFromSchema,
  formatDefault,
  parseSampleBodyFromDocs,
  lookupInDocsValue,
} from './example-extractor';

export interface GenerateResult {
  value: JsonValue | null;
  warnings: string[];
}

export function generatePayload(
  op: OpenApiOperation,
  doc: OpenApiDocument,
  docsBlock: string,
): GenerateResult {
  const warnings: string[] = [];

  // Top-level operation example wins outright.
  const top = extractFromOperationLevel(op);
  if (top !== null) return { value: top, warnings };

  const content = op.requestBody?.content?.['application/json'];
  if (!content || !content.schema) {
    warnings.push('operation has no requestBody schema');
    return { value: null, warnings };
  }

  const docsValue = parseSampleBodyFromDocs(docsBlock);
  const value = buildFromSchema(content.schema, doc, docsValue, '', warnings);
  return { value, warnings };
}

function buildFromSchema(
  schema: OpenApiSchema,
  doc: OpenApiDocument,
  docsValue: JsonValue | null,
  fieldKey: string,
  warnings: string[],
): JsonValue {
  const resolved = resolveSchema(schema, doc);
  warnings.push(...resolved.warnings);
  const s = resolved.schema;

  // 1. Schema example (top of priority chain for this field)
  const fromSchema = extractFromSchema(s);
  if (fromSchema !== undefined) return fromSchema;

  // 2. Object: walk properties
  if (s.type === 'object' || s.properties) {
    const out: { [k: string]: JsonValue } = {};
    const props = s.properties ?? {};
    for (const [key, propSchema] of Object.entries(props)) {
      const childDocs = lookupInDocsValue(docsValue, key) ?? null;
      out[key] = buildFromSchema(propSchema, doc, childDocs, key, warnings);
    }
    return out;
  }

  // 3. Array: special-case "add" arrays of objects
  if (s.type === 'array' && s.items) {
    const itemResolved = resolveSchema(s.items, doc);
    warnings.push(...itemResolved.warnings);
    const isAddArrayOfObjects =
      fieldKey === 'add' &&
      (itemResolved.schema.type === 'object' ||
        itemResolved.schema.properties !== undefined);
    if (isAddArrayOfObjects) {
      const childDocsArr =
        Array.isArray(docsValue) && docsValue.length > 0 ? docsValue[0] : null;
      const elem = buildFromSchema(s.items, doc, childDocsArr, '', warnings);
      return [elem];
    }
    return [];
  }

  // 4. Docs fallback for primitives that have no schema-level hints
  const fromDocs = docsValue;
  if (fromDocs !== null && typeof fromDocs !== 'object') {
    return fromDocs;
  }

  // 5. Type-based default
  return formatDefault(s);
}
