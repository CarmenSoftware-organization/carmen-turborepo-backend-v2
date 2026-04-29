import { describe, it, expect } from 'bun:test';
import { replaceBodyJsonBlock } from '../../../payload-sync/body-block-writer';

const sample = `meta {
  name: Create x
  type: http
  seq: 3
}

post {
  url: {{host}}/api/x
  body: json
  auth: bearer
}

headers {
  x-app-id: {{x_app_id}}
  Content-Type: application/json
}

auth:bearer {
  token: {{access_token}}
}

body:json {
  {}
}

docs {
  ## docs preserved
}
`;

describe('replaceBodyJsonBlock', () => {
  it('replaces existing empty body:json with new payload', () => {
    const out = replaceBodyJsonBlock(sample, { name: 'Alice', age: 0 });
    expect(out).toContain('body:json {\n  {\n    "name": "Alice",\n    "age": 0\n  }\n}');
  });

  it('preserves meta, post, headers, auth and docs blocks verbatim', () => {
    const out = replaceBodyJsonBlock(sample, { name: 'X' });
    expect(out).toContain('## docs preserved');
    expect(out).toContain('  url: {{host}}/api/x');
    expect(out).toContain('Content-Type: application/json');
    expect(out).toContain('seq: 3');
  });

  it('inserts a body:json block after the headers block when none exists', () => {
    const noBody = `meta {
  name: x
}

post {
  url: {{host}}/api/x
  body: json
  auth: bearer
}

headers {
  x-app-id: {{x_app_id}}
}
`;
    const out = replaceBodyJsonBlock(noBody, { foo: 'bar' });
    expect(out).toContain('body:json {');
    expect(out).toContain('"foo": "bar"');
  });

  it('formats payload with two-space indent inside the block', () => {
    const out = replaceBodyJsonBlock(sample, { a: 1, b: { c: 2 } });
    // Outer object indented 2 spaces; inner object indented 4 spaces.
    expect(out).toContain('  {\n    "a": 1,');
    expect(out).toContain('    "b": {\n      "c": 2\n    }');
  });

  it('roundtrips: re-parsing replaced body via bru parser preserves payload', async () => {
    const { parseBruText } = await import('../../../generator/bru-parser');
    const out = replaceBodyJsonBlock(sample, { hello: 'world' });
    const parsed = parseBruText(out);
    expect(parsed.body_json).toContain('"hello": "world"');
  });
});
