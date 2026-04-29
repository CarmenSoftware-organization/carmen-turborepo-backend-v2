import { describe, it, expect } from 'bun:test';
import {
  extractFromOperationLevel,
  extractFromSchema,
  parseSampleBodyFromDocs,
  formatDefault,
} from '../../../payload-sync/example-extractor';
import type { OpenApiOperation, OpenApiSchema } from '../../../types';

describe('extractFromOperationLevel', () => {
  it('returns operation requestBody example when present', () => {
    const op: OpenApiOperation = {
      requestBody: {
        content: {
          'application/json': {
            schema: { type: 'object' },
            example: { name: 'top-level' },
          },
        },
      },
    };
    expect(extractFromOperationLevel(op)).toEqual({ name: 'top-level' });
  });

  it('returns null when there is no top-level example', () => {
    const op: OpenApiOperation = {
      requestBody: {
        content: { 'application/json': { schema: { type: 'object' } } },
      },
    };
    expect(extractFromOperationLevel(op)).toBeNull();
  });
});

describe('extractFromSchema (per-property priority)', () => {
  it('uses property.example when present', () => {
    const s: OpenApiSchema = { type: 'string', example: 'hello' };
    expect(extractFromSchema(s)).toBe('hello');
  });

  it('falls back to property.default', () => {
    const s: OpenApiSchema = { type: 'string', default: 'def' };
    expect(extractFromSchema(s)).toBe('def');
  });

  it('falls back to enum[0]', () => {
    const s: OpenApiSchema = { type: 'string', enum: ['a', 'b'] };
    expect(extractFromSchema(s)).toBe('a');
  });

  it('returns undefined when nothing matches (caller falls back to type-default)', () => {
    const s: OpenApiSchema = { type: 'string' };
    expect(extractFromSchema(s)).toBeUndefined();
  });
});

describe('formatDefault (type-based defaults)', () => {
  it('string → ""', () => expect(formatDefault({ type: 'string' })).toBe(''));
  it('number → 0', () => expect(formatDefault({ type: 'number' })).toBe(0));
  it('integer → 0', () => expect(formatDefault({ type: 'integer' })).toBe(0));
  it('boolean → false', () => expect(formatDefault({ type: 'boolean' })).toBe(false));
  it('array → []', () =>
    expect(formatDefault({ type: 'array', items: { type: 'string' } })).toEqual([]));
  it('object → {}', () => expect(formatDefault({ type: 'object' })).toEqual({}));

  it('format date-time → ISO string', () =>
    expect(formatDefault({ type: 'string', format: 'date-time' })).toBe(
      '2026-04-29T00:00:00.000Z',
    ));
  it('format date → date string', () =>
    expect(formatDefault({ type: 'string', format: 'date' })).toBe('2026-04-29'));
  it('format uuid → empty string', () =>
    expect(formatDefault({ type: 'string', format: 'uuid' })).toBe(''));
  it('format email → user@example.com', () =>
    expect(formatDefault({ type: 'string', format: 'email' })).toBe('user@example.com'));
  it('format uri → https://example.com', () =>
    expect(formatDefault({ type: 'string', format: 'uri' })).toBe('https://example.com'));
});

describe('parseSampleBodyFromDocs', () => {
  it('returns null when docs has no sample body block', () => {
    expect(parseSampleBodyFromDocs('## Some doc\n')).toBeNull();
  });

  it('extracts JSON object from `### Sample Body` code fence', () => {
    const docs = `
## Create

### Sample Body
\`\`\`json
{
  "name": "test"
}
\`\`\`
`;
    expect(parseSampleBodyFromDocs(docs)).toEqual({ name: 'test' });
  });

  it('returns null on unparseable JSON', () => {
    const docs = '### Sample Body\n```json\n{ bad\n```\n';
    expect(parseSampleBodyFromDocs(docs)).toBeNull();
  });
});
