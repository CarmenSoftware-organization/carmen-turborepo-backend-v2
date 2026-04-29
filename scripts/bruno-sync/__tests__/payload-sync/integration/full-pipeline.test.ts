import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { runPayloadSync } from '../../../payloads';

const fixturesDir = join(import.meta.dir, '..', 'fixtures');
const openapiFixture = join(fixturesDir, 'openapi', 'simple.json');

let tmpBruno: string;

beforeEach(() => {
  tmpBruno = join(tmpdir(), `payload-sync-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tmpBruno, { recursive: true });
  for (const f of ['empty-body.bru', 'populated-body.bru', 'no-match.bru', 'non-json-body.bru']) {
    copyFileSync(join(fixturesDir, 'bruno', f), join(tmpBruno, f));
  }
});

afterEach(() => {
  rmSync(tmpBruno, { recursive: true, force: true });
});

describe('runPayloadSync (integration)', () => {
  it('updates empty body, skips populated, reports no-match (dry run)', async () => {
    const report = await runPayloadSync({
      brunoRoot: tmpBruno,
      swaggerPath: openapiFixture,
      gatewaySrcDir: dirname(openapiFixture),
      apply: false,
      verbose: true,
    });
    const byName = (n: string) => report.results.find((r) => r.relativePath.endsWith(n))!;
    expect(byName('empty-body.bru').status).toBe('UPDATED');
    expect(byName('populated-body.bru').status).toBe('SKIPPED_NOT_EMPTY');
    expect(byName('no-match.bru').status).toBe('NO_MATCH');
  });

  it('does not write files when dry run', async () => {
    const before = readFileSync(join(tmpBruno, 'empty-body.bru'), 'utf8');
    await runPayloadSync({
      brunoRoot: tmpBruno,
      swaggerPath: openapiFixture,
      gatewaySrcDir: dirname(openapiFixture),
      apply: false,
      verbose: false,
    });
    const after = readFileSync(join(tmpBruno, 'empty-body.bru'), 'utf8');
    expect(after).toBe(before);
  });

  it('writes files when apply=true', async () => {
    await runPayloadSync({
      brunoRoot: tmpBruno,
      swaggerPath: openapiFixture,
      gatewaySrcDir: dirname(openapiFixture),
      apply: true,
      verbose: false,
    });
    const after = readFileSync(join(tmpBruno, 'empty-body.bru'), 'utf8');
    expect(after).toContain('"name": "Net 30"');
    expect(after).toContain('"code": "N30"');
    expect(after).toContain('"is_active": true');
  });

  it('is idempotent: second run produces 0 UPDATED', async () => {
    await runPayloadSync({
      brunoRoot: tmpBruno,
      swaggerPath: openapiFixture,
      gatewaySrcDir: dirname(openapiFixture),
      apply: true,
      verbose: false,
    });
    const second = await runPayloadSync({
      brunoRoot: tmpBruno,
      swaggerPath: openapiFixture,
      gatewaySrcDir: dirname(openapiFixture),
      apply: true,
      verbose: false,
    });
    const updated = second.results.filter((r) => r.status === 'UPDATED');
    expect(updated.length).toBe(0);
  });

  it('reports SKIPPED_NON_JSON_BODY for multipart bodies', async () => {
    const report = await runPayloadSync({
      brunoRoot: tmpBruno,
      swaggerPath: openapiFixture,
      gatewaySrcDir: dirname(openapiFixture),
      apply: false,
      verbose: true,
    });
    const nonJson = report.results.find((r) => r.relativePath.endsWith('non-json-body.bru'));
    expect(nonJson?.status).toBe('SKIPPED_NON_JSON_BODY');
  });

  it('preserves docs and headers blocks byte-identical except body', async () => {
    const before = readFileSync(join(tmpBruno, 'empty-body.bru'), 'utf8');
    await runPayloadSync({
      brunoRoot: tmpBruno,
      swaggerPath: openapiFixture,
      gatewaySrcDir: dirname(openapiFixture),
      apply: true,
      verbose: false,
    });
    const after = readFileSync(join(tmpBruno, 'empty-body.bru'), 'utf8');
    expect(after).toContain('## Create');
    expect(after).toContain('Content-Type: application/json');
    expect(after).toContain('seq: 3');
    expect(before).not.toBe(after);
  });
});
