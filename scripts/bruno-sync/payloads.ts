#!/usr/bin/env bun
import { readdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { GATEWAY_SRC, BRUNO_ROOT } from './config';
import { parseBruText } from './generator/bru-parser';
import { loadOpenApi } from './payload-sync/openapi-loader';
import { matchOperation } from './payload-sync/operation-matcher';
import { generatePayload } from './payload-sync/payload-generator';
import { isEmptyBody } from './payload-sync/empty-body-detector';
import { replaceBodyJsonBlock } from './payload-sync/body-block-writer';
import { formatReport } from './payload-sync/reporter';
import type { PayloadSyncReport, PayloadSyncResult } from './types';

const SWAGGER_PATH = join(process.cwd(), 'apps/backend-gateway/swagger.json');

export interface RunOptions {
  brunoRoot: string;
  swaggerPath: string;
  gatewaySrcDir: string;
  apply: boolean;
  verbose: boolean;
}

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '_archived' || e.name === 'environments' || e.name === 'auth') continue;
      await walk(full, out);
    } else if (e.isFile() && e.name.endsWith('.bru') && e.name !== 'folder.bru') {
      out.push(full);
    }
  }
  return out;
}

export async function runPayloadSync(opts: RunOptions): Promise<PayloadSyncReport> {
  const loaded = loadOpenApi(opts.swaggerPath, opts.gatewaySrcDir);
  const files = await walk(opts.brunoRoot);
  const results: PayloadSyncResult[] = [];

  for (const file of files) {
    const relPath = relative(opts.brunoRoot, file);
    const text = await Bun.file(file).text();
    const sections = parseBruText(text);

    if (!sections.method) continue;
    if (sections.body_json === undefined) {
      // No body block AND method is GET/DELETE => skip silently.
      const method = sections.method.verb.toUpperCase();
      if (method === 'GET' || method === 'DELETE' || method === 'HEAD' || method === 'OPTIONS') continue;
      results.push({
        filePath: file,
        relativePath: relPath,
        status: 'SKIPPED_NO_BODY',
        warnings: [],
      });
      continue;
    }

    if (!isEmptyBody(sections.body_json)) {
      results.push({
        filePath: file,
        relativePath: relPath,
        status: 'SKIPPED_NOT_EMPTY',
        warnings: [],
      });
      continue;
    }

    const urlMatch = sections.method.body.match(/^\s*url:\s*(\S+)/m);
    if (!urlMatch) {
      results.push({
        filePath: file,
        relativePath: relPath,
        status: 'SKIPPED_NO_BODY',
        warnings: ['no url in method block'],
      });
      continue;
    }
    const url = urlMatch[1];
    const matched = matchOperation(loaded.doc, sections.method.verb, url);
    if (!matched.operation) {
      results.push({
        filePath: file,
        relativePath: relPath,
        status: 'NO_MATCH',
        warnings: matched.reason ? [matched.reason] : [],
      });
      continue;
    }

    const generated = generatePayload(matched.operation, loaded.doc, sections.docs ?? '');
    if (generated.value === null) {
      results.push({
        filePath: file,
        relativePath: relPath,
        status: 'NO_REQUEST_BODY',
        warnings: generated.warnings,
      });
      continue;
    }

    const newText = replaceBodyJsonBlock(text, generated.value);
    if (opts.apply) {
      writeFileSync(file, newText, 'utf8');
    }
    results.push({
      filePath: file,
      relativePath: relPath,
      status: 'UPDATED',
      warnings: generated.warnings,
      before: text,
      after: newText,
    });
  }

  return {
    results,
    staleOpenapi: loaded.stale,
    dryRun: !opts.apply,
  };
}

interface CliFlags {
  apply: boolean;
  verbose: boolean;
}

function parseArgs(argv: string[]): CliFlags {
  return {
    apply: argv.includes('--apply'),
    verbose: argv.includes('--verbose'),
  };
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const report = await runPayloadSync({
    brunoRoot: BRUNO_ROOT,
    swaggerPath: SWAGGER_PATH,
    gatewaySrcDir: GATEWAY_SRC,
    apply: flags.apply,
    verbose: flags.verbose,
  });
  console.log(formatReport(report, flags.verbose));
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
