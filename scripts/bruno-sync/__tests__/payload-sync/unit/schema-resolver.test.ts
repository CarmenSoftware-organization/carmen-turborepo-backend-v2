import { describe, it, expect } from 'bun:test';
import { resolveSchema, MAX_REF_DEPTH } from '../../../payload-sync/schema-resolver';
import type { OpenApiDocument, OpenApiSchema } from '../../../types';

const doc: OpenApiDocument = {
  paths: {},
  components: {
    schemas: {
      Foo: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'foo' },
        },
        required: ['id'],
      },
      Bar: {
        type: 'object',
        properties: {
          foo: { $ref: '#/components/schemas/Foo' },
        },
      },
      Cycle: {
        type: 'object',
        properties: {
          self: { $ref: '#/components/schemas/Cycle' },
        },
      },
    },
  },
};

describe('resolveSchema', () => {
  it('resolves a $ref to its target schema', () => {
    const r = resolveSchema({ $ref: '#/components/schemas/Foo' }, doc);
    expect(r.schema.type).toBe('object');
    expect(r.schema.properties?.name?.example).toBe('foo');
  });

  it('passes through inline schema unchanged', () => {
    const inline: OpenApiSchema = { type: 'string', example: 'hi' };
    const r = resolveSchema(inline, doc);
    expect(r.schema).toEqual(inline);
  });

  it('merges allOf into a single object schema', () => {
    const s: OpenApiSchema = {
      allOf: [
        { type: 'object', properties: { a: { type: 'string' } } },
        { type: 'object', properties: { b: { type: 'number' } } },
      ],
    };
    const r = resolveSchema(s, doc);
    expect(r.schema.type).toBe('object');
    expect(r.schema.properties?.a?.type).toBe('string');
    expect(r.schema.properties?.b?.type).toBe('number');
  });

  it('picks first variant for oneOf and emits warning', () => {
    const s: OpenApiSchema = {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
      ],
    };
    const r = resolveSchema(s, doc);
    expect(r.schema.type).toBe('string');
    expect(r.warnings.some((w) => /oneOf/i.test(w))).toBe(true);
  });

  it('picks first variant for anyOf and emits warning', () => {
    const s: OpenApiSchema = {
      anyOf: [
        { type: 'object' },
        { type: 'array' },
      ],
    };
    const r = resolveSchema(s, doc);
    expect(r.schema.type).toBe('object');
    expect(r.warnings.some((w) => /anyOf/i.test(w))).toBe(true);
  });

  it('detects circular ref and emits warning', () => {
    const r = resolveSchema(
      { $ref: '#/components/schemas/Cycle' },
      doc,
    );
    expect(r.warnings.some((w) => /circular/i.test(w))).toBe(true);
  });

  it('exposes MAX_REF_DEPTH = 5', () => {
    expect(MAX_REF_DEPTH).toBe(5);
  });
});
