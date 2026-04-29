import type { OpenApiDocument, OpenApiSchema } from '../types';

export const MAX_REF_DEPTH = 5;
const REF_PREFIX = '#/components/schemas/';

export interface ResolveResult {
  schema: OpenApiSchema;
  warnings: string[];
}

export function resolveSchema(
  schema: OpenApiSchema,
  doc: OpenApiDocument,
  visited: string[] = [],
): ResolveResult {
  const warnings: string[] = [];
  return { schema: resolveInner(schema, doc, visited, warnings), warnings };
}

function resolveInner(
  schema: OpenApiSchema,
  doc: OpenApiDocument,
  visited: string[],
  warnings: string[],
): OpenApiSchema {
  if (schema.$ref) {
    const ref = schema.$ref;
    if (!ref.startsWith(REF_PREFIX)) {
      warnings.push(`unsupported $ref: ${ref}`);
      return { type: 'object' };
    }
    const name = ref.slice(REF_PREFIX.length);
    if (visited.includes(name)) {
      warnings.push(`circular ref detected at ${name}`);
      return { type: 'object', nullable: true };
    }
    if (visited.length >= MAX_REF_DEPTH) {
      warnings.push(`max ref depth (${MAX_REF_DEPTH}) reached at ${name}`);
      return { type: 'object', nullable: true };
    }
    const target = doc.components?.schemas?.[name];
    if (!target) {
      warnings.push(`unresolved $ref: ${ref}`);
      return { type: 'object' };
    }
    return resolveInner(target, doc, [...visited, name], warnings);
  }

  if (schema.allOf && schema.allOf.length > 0) {
    const merged: OpenApiSchema = { type: 'object', properties: {}, required: [] };
    for (const part of schema.allOf) {
      const resolved = resolveInner(part, doc, visited, warnings);
      if (resolved.properties) {
        merged.properties = { ...merged.properties, ...resolved.properties };
      }
      if (resolved.required) {
        merged.required = [...(merged.required ?? []), ...resolved.required];
      }
    }
    return merged;
  }

  if (schema.oneOf && schema.oneOf.length > 0) {
    warnings.push(`oneOf encountered — picked first variant`);
    return resolveInner(schema.oneOf[0], doc, visited, warnings);
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    warnings.push(`anyOf encountered — picked first variant`);
    return resolveInner(schema.anyOf[0], doc, visited, warnings);
  }

  if (schema.properties && Object.keys(schema.properties).length > 0) {
    const resolvedProperties: Record<string, OpenApiSchema> = {};
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      resolvedProperties[key] = resolveInner(propSchema, doc, visited, warnings);
    }
    return { ...schema, properties: resolvedProperties };
  }

  return schema;
}
