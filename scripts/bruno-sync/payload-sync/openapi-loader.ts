import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { OpenApiDocument } from '../types';

export interface LoadResult {
  doc: OpenApiDocument;
  stale: boolean;
  swaggerMtimeMs: number;
  newestSrcMtimeMs: number;
}

function newestMtime(dir: string): number {
  let newest = 0;
  const stack: string[] = [dir];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    let entries: { name: string; isDirectory: () => boolean; isFile: () => boolean }[] = [];
    try {
      entries = readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = join(cur, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist') continue;
        stack.push(full);
      } else if (e.isFile()) {
        try {
          const st = statSync(full);
          if (st.mtimeMs > newest) newest = st.mtimeMs;
        } catch {
          // ignore
        }
      }
    }
  }
  return newest;
}

export function loadOpenApi(swaggerPath: string, gatewaySrcDir: string): LoadResult {
  const text = readFileSync(swaggerPath, 'utf8');
  const doc = JSON.parse(text) as OpenApiDocument;
  if (!doc.paths || typeof doc.paths !== 'object') {
    throw new Error(`invalid OpenAPI document at ${swaggerPath}: missing paths`);
  }
  const swaggerMtimeMs = statSync(swaggerPath).mtimeMs;
  const newestSrcMtimeMs = newestMtime(gatewaySrcDir);
  return {
    doc,
    stale: newestSrcMtimeMs > swaggerMtimeMs,
    swaggerMtimeMs,
    newestSrcMtimeMs,
  };
}
