import { describe, it, expect } from 'bun:test';
import { formatReport } from '../../../payload-sync/reporter';
import type { PayloadSyncReport } from '../../../types';

describe('formatReport', () => {
  it('shows counts for each status', () => {
    const report: PayloadSyncReport = {
      dryRun: true,
      staleOpenapi: false,
      results: [
        { filePath: '/a', relativePath: 'a.bru', status: 'UPDATED', warnings: [] },
        { filePath: '/b', relativePath: 'b.bru', status: 'UPDATED', warnings: [] },
        { filePath: '/c', relativePath: 'c.bru', status: 'SKIPPED_NOT_EMPTY', warnings: [] },
        { filePath: '/d', relativePath: 'd.bru', status: 'NO_MATCH', warnings: ['x'] },
      ],
    };
    const out = formatReport(report, false);
    expect(out).toContain('Updated:');
    expect(out).toContain('2 files');
    expect(out).toContain('Skipped:');
    expect(out).toContain('No match:');
    expect(out).toContain('Warnings:');
  });

  it('lists updated paths', () => {
    const report: PayloadSyncReport = {
      dryRun: false,
      staleOpenapi: false,
      results: [
        { filePath: '/a', relativePath: 'updated.bru', status: 'UPDATED', warnings: [] },
      ],
    };
    const out = formatReport(report, false);
    expect(out).toContain('updated.bru');
  });

  it('mentions DRY RUN header when dryRun is true', () => {
    const report: PayloadSyncReport = {
      dryRun: true,
      staleOpenapi: false,
      results: [],
    };
    const out = formatReport(report, false);
    expect(out).toContain('DRY RUN');
  });

  it('shows stale OpenAPI warning', () => {
    const report: PayloadSyncReport = {
      dryRun: false,
      staleOpenapi: true,
      results: [],
    };
    const out = formatReport(report, false);
    expect(out).toContain('stale');
  });

  it('hides skipped file lists by default; shows them in verbose', () => {
    const report: PayloadSyncReport = {
      dryRun: false,
      staleOpenapi: false,
      results: [
        { filePath: '/a', relativePath: 'a.bru', status: 'SKIPPED_NOT_EMPTY', warnings: [] },
      ],
    };
    const normal = formatReport(report, false);
    const verbose = formatReport(report, true);
    expect(normal.includes('a.bru')).toBe(false);
    expect(verbose.includes('a.bru')).toBe(true);
  });
});
