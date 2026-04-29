# bruno-sync

Reconciles `apps/bruno/carmen-inventory/` with gateway controllers.

## Reconciliation (add / update / archive .bru files)

```bash
bun run bruno:sync           # apply changes
bun run bruno:sync:dry       # preview only
bun run scripts/bruno-sync/index.ts --verbose
```

See `docs/superpowers/specs/2026-04-22-bruno-sync-design.md` for design.

## Payload sync (fill body:json from Swagger)

Reads `apps/backend-gateway/swagger.json` and fills empty `body:json { {} }` blocks
in `.bru` files with sample payloads. Non-empty bodies are preserved.

```bash
bun run bruno:sync:payloads:dry     # preview
bun run bruno:sync:payloads         # apply
bun run scripts/bruno-sync/payloads.ts --apply --verbose
```

Workflow:
1. Edit a DTO in `apps/backend-gateway/src/`.
2. Restart gateway dev to regenerate `swagger.json`.
3. Run `bun run bruno:sync:payloads:dry` to preview, then `bun run bruno:sync:payloads`.
4. Commit `.bru` changes alongside the DTO change.

If `swagger.json` is older than gateway src, the tool prints a warning but still runs.

See `docs/superpowers/specs/2026-04-29-bruno-payload-sync-design.md` for design.
