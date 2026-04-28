import {
  AUDIT_AT_FIELDS,
  AUDIT_BY_ID_FIELDS,
  collectTargetsByPaths,
  uniqueAuditUserIds,
  mutateToAuditShape,
} from './audit-shape';

describe('audit-shape', () => {
  describe('collectTargetsByPaths', () => {
    it("returns the root object for paths=['']", () => {
      const root = { id: 'a' };
      expect(collectTargetsByPaths(root, [''])).toEqual([root]);
    });

    it("returns array elements when root is array and paths=['']", () => {
      const arr = [{ id: 'a' }, { id: 'b' }];
      expect(collectTargetsByPaths(arr, [''])).toEqual([arr[0], arr[1]]);
    });

    it('descends into named array field', () => {
      const root = { items: [{ id: 'i1' }, { id: 'i2' }] };
      expect(collectTargetsByPaths(root, ['items'])).toEqual([
        root.items[0],
        root.items[1],
      ]);
    });

    it('descends into nested array of arrays', () => {
      const root = {
        items: [{ attachments: [{ id: 'a1' }, { id: 'a2' }] }, { attachments: [{ id: 'a3' }] }],
      };
      expect(collectTargetsByPaths(root, ['items.attachments'])).toEqual([
        root.items[0].attachments[0],
        root.items[0].attachments[1],
        root.items[1].attachments[0],
      ]);
    });

    it('handles a single object at a named field', () => {
      const root = { meta: { id: 'm1' } };
      expect(collectTargetsByPaths(root, ['meta'])).toEqual([root.meta]);
    });

    it('skips missing or null paths silently', () => {
      const root = { id: 'a' };
      expect(collectTargetsByPaths(root, ['items', 'nope.x'])).toEqual([]);
    });

    it('combines multiple paths', () => {
      const root = { items: [{ id: 'i1' }] };
      const out = collectTargetsByPaths(root, ['', 'items']);
      expect(out).toEqual([root, root.items[0]]);
    });

    it('returns empty array for null/undefined payload', () => {
      expect(collectTargetsByPaths(null, [''])).toEqual([]);
      expect(collectTargetsByPaths(undefined, [''])).toEqual([]);
    });
  });

  describe('uniqueAuditUserIds', () => {
    it('collects and dedupes ids across the six audit-by fields', () => {
      const targets = [
        { created_by_id: 'u1', updated_by_id: 'u2', deleted_by_id: null },
        { created_by_id: 'u1', updated_by_id: 'u3' }, // u1 dup
        { other: 'unrelated' },
      ];
      expect(uniqueAuditUserIds(targets).sort()).toEqual(['u1', 'u2', 'u3']);
    });

    it('ignores non-string and empty values', () => {
      const targets = [
        { created_by_id: '', updated_by_id: 0, deleted_by_id: null },
        { created_by_id: undefined },
      ];
      expect(uniqueAuditUserIds(targets)).toEqual([]);
    });
  });

  describe('mutateToAuditShape', () => {
    const map = new Map<string, string | null>([
      ['u1', 'John Doe'],
      ['u2', null], // resolved to "Unknown"
    ]);

    it('moves *_at and converts *_by_id into nested audit object', () => {
      const t: Record<string, unknown> = {
        id: 'x',
        name: 'thing',
        created_at: '2026-04-01T00:00:00Z',
        created_by_id: 'u1',
        updated_at: '2026-04-15T00:00:00Z',
        updated_by_id: 'u2',
        deleted_at: null,
        deleted_by_id: null,
      };
      mutateToAuditShape(t, map);
      expect(t).toEqual({
        id: 'x',
        name: 'thing',
        audit: {
          created_at: '2026-04-01T00:00:00Z',
          created_by: { id: 'u1', name: 'John Doe' },
          updated_at: '2026-04-15T00:00:00Z',
          updated_by: { id: 'u2', name: 'Unknown' },
          deleted_at: null,
          deleted_by: null,
        },
      });
    });

    it('uses Unknown when id is present but resolver returned no entry', () => {
      const t: Record<string, unknown> = { created_by_id: 'ghost', created_at: '2026-04-01T00:00:00Z' };
      mutateToAuditShape(t, new Map());
      expect(t).toEqual({
        audit: {
          created_at: '2026-04-01T00:00:00Z',
          created_by: { id: 'ghost', name: 'Unknown' },
          updated_at: null,
          updated_by: null,
          deleted_at: null,
          deleted_by: null,
        },
      });
    });

    it('does not add audit field when target has none of the six fields', () => {
      const t: Record<string, unknown> = { id: 'x', name: 'thing' };
      mutateToAuditShape(t, map);
      expect(t).toEqual({ id: 'x', name: 'thing' });
    });

    it('handles partial fields (only created_*) — fills others as null', () => {
      const t: Record<string, unknown> = {
        id: 'x',
        created_at: '2026-04-01T00:00:00Z',
        created_by_id: 'u1',
      };
      mutateToAuditShape(t, map);
      expect(t).toEqual({
        id: 'x',
        audit: {
          created_at: '2026-04-01T00:00:00Z',
          created_by: { id: 'u1', name: 'John Doe' },
          updated_at: null,
          updated_by: null,
          deleted_at: null,
          deleted_by: null,
        },
      });
    });

    it('keeps audit.*_at = null when *_by_id present but *_at absent', () => {
      const t: Record<string, unknown> = { created_by_id: 'u1' };
      mutateToAuditShape(t, map);
      expect(t).toEqual({
        audit: {
          created_at: null,
          created_by: { id: 'u1', name: 'John Doe' },
          updated_at: null,
          updated_by: null,
          deleted_at: null,
          deleted_by: null,
        },
      });
    });

    it('is a no-op when target is not a plain object', () => {
      expect(() => mutateToAuditShape(null as any, map)).not.toThrow();
      expect(() => mutateToAuditShape('x' as any, map)).not.toThrow();
    });
  });

  describe('AUDIT_*_FIELDS exports', () => {
    it('exposes the canonical field name lists', () => {
      expect(AUDIT_AT_FIELDS).toEqual(['created_at', 'updated_at', 'deleted_at']);
      expect(AUDIT_BY_ID_FIELDS).toEqual(['created_by_id', 'updated_by_id', 'deleted_by_id']);
    });
  });
});
