import type { PayloadSyncReport, PayloadSyncResult, PayloadSyncStatus } from '../types';

function group(
  results: PayloadSyncResult[],
  status: PayloadSyncStatus,
): PayloadSyncResult[] {
  return results.filter((r) => r.status === status);
}

function listSection(title: string, items: PayloadSyncResult[]): string {
  if (items.length === 0) return '';
  const lines = [`${title}:`];
  for (const r of items) {
    const w = r.warnings.length > 0 ? ` — ${r.warnings.join('; ')}` : '';
    lines.push(`  ${r.relativePath}${w}`);
  }
  return lines.join('\n');
}

export function formatReport(report: PayloadSyncReport, verbose: boolean): string {
  const updated = group(report.results, 'UPDATED');
  const skippedEmpty = group(report.results, 'SKIPPED_NOT_EMPTY');
  const skippedNoBody = group(report.results, 'SKIPPED_NO_BODY');
  const skippedNonJson = group(report.results, 'SKIPPED_NON_JSON_BODY');
  const noMatch = group(report.results, 'NO_MATCH');
  const noBody = group(report.results, 'NO_REQUEST_BODY');
  const warnings = report.results.filter((r) => r.warnings.length > 0);

  const lines: string[] = [];
  lines.push(`Bruno Payload Sync${report.dryRun ? ' — DRY RUN' : ''}`);
  if (report.staleOpenapi) {
    lines.push('WARNING: swagger.json is stale — rebuild gateway first.');
  }
  lines.push('');
  lines.push(`Updated:    ${updated.length} files${report.dryRun ? '       (would write)' : '       (wrote)'}`);
  lines.push(`Skipped:    ${skippedEmpty.length + skippedNoBody.length + skippedNonJson.length} files       (preserved)`);
  lines.push(`No match:   ${noMatch.length} files       (gateway operation missing)`);
  lines.push(`No body:    ${noBody.length} files       (operation has no requestBody)`);
  lines.push(`Warnings:   ${warnings.length} files       (review)`);

  const sections: string[] = [
    listSection('Updated files', updated),
    listSection('Warnings', warnings),
    listSection('No match', noMatch),
  ];
  if (verbose) {
    sections.push(
      listSection('Skipped (body not empty)', skippedEmpty),
      listSection('Skipped (no body declared)', skippedNoBody),
      listSection('Skipped (non-JSON body)', skippedNonJson),
      listSection('No requestBody', noBody),
    );
  }
  for (const s of sections) {
    if (s) {
      lines.push('');
      lines.push(s);
    }
  }
  if (report.dryRun && updated.length > 0) {
    lines.push('');
    lines.push('Run with --apply to write changes.');
  }
  return lines.join('\n');
}
