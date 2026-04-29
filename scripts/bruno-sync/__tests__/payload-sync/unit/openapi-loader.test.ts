import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { mkdirSync, writeFileSync, rmSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadOpenApi } from '../../../payload-sync/openapi-loader';

const tmpRoot = join(tmpdir(), `openapi-loader-${Date.now()}`);
const swaggerPath = join(tmpRoot, 'swagger.json');
const srcDir = join(tmpRoot, 'src');
const srcFile = join(srcDir, 'a.ts');

beforeAll(() => {
  mkdirSync(tmpRoot, { recursive: true });
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(swaggerPath, JSON.stringify({ paths: { '/x': {} } }));
  writeFileSync(srcFile, 'x');
});

afterAll(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

describe('loadOpenApi', () => {
  it('parses a valid swagger.json', () => {
    const r = loadOpenApi(swaggerPath, srcDir);
    expect(r.doc.paths['/x']).toBeDefined();
  });

  it('detects fresh swagger.json (mtime >= src mtime)', () => {
    const futureTime = new Date(Date.now() + 60_000);
    utimesSync(swaggerPath, futureTime, futureTime);
    const r = loadOpenApi(swaggerPath, srcDir);
    expect(r.stale).toBe(false);
  });

  it('detects stale swagger.json (mtime < src mtime)', () => {
    const pastTime = new Date(Date.now() - 60_000);
    utimesSync(swaggerPath, pastTime, pastTime);
    const futureTime = new Date(Date.now() + 60_000);
    utimesSync(srcFile, futureTime, futureTime);
    const r = loadOpenApi(swaggerPath, srcDir);
    expect(r.stale).toBe(true);
  });

  it('throws on missing swagger.json', () => {
    expect(() => loadOpenApi('/nonexistent/swagger.json', srcDir)).toThrow();
  });

  it('throws on invalid JSON', () => {
    const bad = join(tmpRoot, 'bad.json');
    writeFileSync(bad, '{ not valid');
    expect(() => loadOpenApi(bad, srcDir)).toThrow();
  });
});
