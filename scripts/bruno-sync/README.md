# bruno-sync

Reconciles `apps/bruno/carmen-inventory/` with gateway controllers.

## Usage

```bash
bun run bruno:sync           # apply changes
bun run bruno:sync:dry       # preview only
bun run scripts/bruno-sync/index.ts --verbose
```

See `docs/superpowers/specs/2026-04-22-bruno-sync-design.md` for design.
