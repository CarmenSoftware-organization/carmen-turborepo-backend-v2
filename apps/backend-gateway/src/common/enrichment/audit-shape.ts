export const AUDIT_AT_FIELDS = ['created_at', 'updated_at', 'deleted_at'] as const;
export const AUDIT_BY_ID_FIELDS = ['created_by_id', 'updated_by_id', 'deleted_by_id'] as const;

const KIND_MAP = [
  { at: 'created_at', byId: 'created_by_id', by: 'created_by' },
  { at: 'updated_at', byId: 'updated_by_id', by: 'updated_by' },
  { at: 'deleted_at', byId: 'deleted_by_id', by: 'deleted_by' },
] as const;

export type EnrichmentTarget = Record<string, unknown>;

function isPlainObject(value: unknown): value is EnrichmentTarget {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Collect every plain-object target inside `payload` reachable by any of the
 * dot-separated `paths`. `''` means the root payload itself (or each element
 * if root is an array). Missing paths are skipped silently. Used by
 * EnrichmentService to find the entries that need their audit fields rewritten.
 */
export function collectTargetsByPaths(
  payload: unknown,
  paths: string[],
): EnrichmentTarget[] {
  if (payload == null) return [];
  const out: EnrichmentTarget[] = [];
  for (const path of paths) {
    collectAt(payload, path === '' ? [] : path.split('.'), 0, out);
  }
  return out;
}

function collectAt(node: unknown, parts: string[], idx: number, out: EnrichmentTarget[]): void {
  if (node == null) return;

  if (idx === parts.length) {
    if (Array.isArray(node)) {
      for (const el of node) {
        if (isPlainObject(el)) out.push(el);
      }
    } else if (isPlainObject(node)) {
      out.push(node);
    }
    return;
  }

  if (Array.isArray(node)) {
    for (const el of node) collectAt(el, parts, idx, out);
    return;
  }

  if (!isPlainObject(node)) return;
  const next = node[parts[idx]];
  if (next == null) return;
  collectAt(next, parts, idx + 1, out);
}

/**
 * Return the unique, non-empty string ids found in `created_by_id`,
 * `updated_by_id`, and `deleted_by_id` across all targets.
 */
export function uniqueAuditUserIds(targets: EnrichmentTarget[]): string[] {
  const set = new Set<string>();
  for (const t of targets) {
    if (!isPlainObject(t)) continue;
    for (const f of AUDIT_BY_ID_FIELDS) {
      const v = t[f];
      if (typeof v === 'string' && v.length > 0) set.add(v);
    }
  }
  return Array.from(set);
}

/**
 * Mutate `target` in place: move `created_at / updated_at / deleted_at` and
 * convert `created_by_id / updated_by_id / deleted_by_id` into a single
 * nested `audit` object with `{ id, name }` user references resolved via
 * `nameMap`. Resolved-but-missing names become `"Unknown"`. No-op if the
 * target is not a plain object or has none of the six audit fields.
 */
export function mutateToAuditShape(
  target: EnrichmentTarget,
  nameMap: Map<string, string | null>,
): void {
  if (!isPlainObject(target)) return;

  const hasAny = KIND_MAP.some(({ at, byId }) => at in target || byId in target);
  if (!hasAny) return;

  const audit: Record<string, unknown> = {};
  for (const { at, byId, by } of KIND_MAP) {
    const atVal = at in target ? target[at] : null;
    const byIdVal = target[byId];
    audit[at] = atVal ?? null;

    if (typeof byIdVal === 'string' && byIdVal.length > 0) {
      const resolved = nameMap.get(byIdVal);
      audit[by] = { id: byIdVal, name: resolved ?? 'Unknown' };
    } else {
      audit[by] = null;
    }

    delete target[at];
    delete target[byId];
  }
  target.audit = audit;
}
