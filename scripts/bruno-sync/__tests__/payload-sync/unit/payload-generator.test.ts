import { describe, it, expect } from 'bun:test';
import { generatePayload } from '../../../payload-sync/payload-generator';
import type { OpenApiDocument, OpenApiOperation, OpenApiSchema } from '../../../types';

const emptyDoc: OpenApiDocument = { paths: {}, components: { schemas: {} } };

function opWithSchema(schema: OpenApiSchema): OpenApiOperation {
  return {
    requestBody: { content: { 'application/json': { schema } } },
  };
}

describe('generatePayload', () => {
  it('returns top-level operation example verbatim when present', () => {
    const op: OpenApiOperation = {
      requestBody: {
        content: {
          'application/json': {
            schema: { type: 'object' },
            example: { whole: 'thing' },
          },
        },
      },
    };
    const r = generatePayload(op, emptyDoc, '');
    expect(r.value).toEqual({ whole: 'thing' });
  });

  it('builds object with all declared properties', () => {
    const op = opWithSchema({
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Alice' },
        age: { type: 'integer' },
        active: { type: 'boolean' },
      },
    });
    const r = generatePayload(op, emptyDoc, '');
    expect(r.value).toEqual({ name: 'Alice', age: 0, active: false });
  });

  it('uses property.example > default > enum[0] > type-default', () => {
    const op = opWithSchema({
      type: 'object',
      properties: {
        a: { type: 'string', example: 'X' },
        b: { type: 'string', default: 'Y' },
        c: { type: 'string', enum: ['P', 'Q'] },
        d: { type: 'string' },
      },
    });
    const r = generatePayload(op, emptyDoc, '');
    expect(r.value).toEqual({ a: 'X', b: 'Y', c: 'P', d: '' });
  });

  it('falls back to docs Sample Body when schema lacks examples', () => {
    const op = opWithSchema({
      type: 'object',
      properties: {
        name: { type: 'string' },
        code: { type: 'string' },
      },
    });
    const docs = '### Sample Body\n```json\n{ "name": "from-docs", "code": "ABC" }\n```\n';
    const r = generatePayload(op, emptyDoc, docs);
    expect(r.value).toEqual({ name: 'from-docs', code: 'ABC' });
  });

  it('populates one element for arrays named "add" with object items', () => {
    const op = opWithSchema({
      type: 'object',
      properties: {
        details: {
          type: 'object',
          properties: {
            store_requisition_detail: {
              type: 'object',
              properties: {
                add: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      qty: { type: 'integer' },
                      note: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const r = generatePayload(op, emptyDoc, '');
    const v = r.value as Record<string, unknown>;
    const add = (((v.details as Record<string, unknown>).store_requisition_detail) as Record<string, unknown>).add;
    expect(Array.isArray(add)).toBe(true);
    expect((add as unknown[]).length).toBe(1);
    expect((add as { qty: number; note: string }[])[0]).toEqual({ qty: 0, note: '' });
  });

  it('non-add arrays default to empty array', () => {
    const op = opWithSchema({
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
      },
    });
    const r = generatePayload(op, emptyDoc, '');
    expect(r.value).toEqual({ tags: [] });
  });

  it('respects format-specific defaults (date-time, uuid, email)', () => {
    const op = opWithSchema({
      type: 'object',
      properties: {
        when: { type: 'string', format: 'date-time' },
        id: { type: 'string', format: 'uuid' },
        contact: { type: 'string', format: 'email' },
      },
    });
    const r = generatePayload(op, emptyDoc, '');
    expect(r.value).toEqual({
      when: '2026-04-29T00:00:00.000Z',
      id: '',
      contact: 'user@example.com',
    });
  });

  it('returns null + warning when operation has no requestBody', () => {
    const r = generatePayload({}, emptyDoc, '');
    expect(r.value).toBeNull();
    expect(r.warnings.some((w) => /no requestBody/i.test(w))).toBe(true);
  });

  it('resolves $ref in property schemas', () => {
    const doc: OpenApiDocument = {
      paths: {},
      components: {
        schemas: {
          Foo: { type: 'string', example: 'foo-value' },
        },
      },
    };
    const op = opWithSchema({
      type: 'object',
      properties: { foo: { $ref: '#/components/schemas/Foo' } },
    });
    const r = generatePayload(op, doc, '');
    expect(r.value).toEqual({ foo: 'foo-value' });
  });
});
