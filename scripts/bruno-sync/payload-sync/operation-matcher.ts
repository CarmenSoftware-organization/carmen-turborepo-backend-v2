import type { OpenApiDocument, OpenApiOperation, OpenApiPathItem } from '../types';

const HTTP_METHODS: (keyof OpenApiPathItem)[] = [
  'get', 'post', 'put', 'patch', 'delete', 'head', 'options',
];

/**
 * Strips trailing slash from a path.
 * No-op for already-normalised paths.
 */
export function normalisePath(path: string): string {
  let p = path;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/**
 * Converts a Bruno URL to an OpenAPI-style path string.
 *
 * Transformations applied (in order):
 * 1. Strip query string (including `~`-prefixed Bruno query placeholders)
 * 2. Strip the leading `{{host}}` (or any single leading `{{var}}`) prefix
 * 3. Replace remaining `{{var}}` path segments with `{var}`
 * 4. Replace Express-style `:var` path params with `{var}`
 * 5. Strip trailing slash
 */
export function normaliseBrunoUrl(url: string): string {
  let u = url.trim();
  // 1. strip query string
  const q = u.indexOf('?');
  if (q >= 0) u = u.slice(0, q);
  // 2. strip leading {{var}} (the host variable)
  u = u.replace(/^\{\{[a-zA-Z0-9_]+\}\}/, '');
  // 3. {{var}} → {var}
  u = u.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, '{$1}');
  // 4. :var → {var}
  u = u.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
  // 5. strip trailing slash
  return normalisePath(u);
}

export interface MatchResult {
  operation: OpenApiOperation | null;
  reason?: string;
}

/**
 * Finds the OpenAPI operation that matches a given HTTP method and Bruno URL.
 *
 * Returns `{ operation: null, reason }` when no match is found.
 */
export function matchOperation(
  doc: OpenApiDocument,
  method: string,
  brunoUrl: string,
): MatchResult {
  const m = method.toLowerCase() as keyof OpenApiPathItem;
  if (!HTTP_METHODS.includes(m)) {
    return { operation: null, reason: `unknown method ${method}` };
  }
  const target = normaliseBrunoUrl(brunoUrl);
  const pathItem = doc.paths[target];
  if (!pathItem) {
    // Try matching with normalisePath on each registered path (cheap loop)
    for (const [registeredPath, item] of Object.entries(doc.paths)) {
      if (normalisePath(registeredPath) === target) {
        const op = item[m];
        if (!op) {
          return {
            operation: null,
            reason: `path matched but method ${m} not declared`,
          };
        }
        return { operation: op };
      }
    }
    return { operation: null, reason: `path not found in spec: ${target}` };
  }
  const op = pathItem[m];
  if (!op) {
    return { operation: null, reason: `path matched but method ${m} not declared` };
  }
  return { operation: op };
}
