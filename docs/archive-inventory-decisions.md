# Doc Inventory Decisions (working file — deleted at end)

Working contract for the doc cleanup sub-project. Every in-scope file has a
row. Nothing is touched until its row has an action.

## Legend

- **keep** — stays as-is.
- **rename** — `git mv` to new path under flat-prefix convention.
- **merge** — content absorbed into another file.
- **delete** — removed after salvage pass.
- **relocate** — moved out of `docs/` into `scripts/` or similar (for non-doc files).

## Root files

| path | action | new path | salvage notes | references found |
|---|---|---|---|---|
| `README.md` | keep | — | — | (fill in after Task 5) |
| `CLAUDE.md` | keep | — | — | (fill in after Task 5) |
| `PRD.md` | delete | — | (fill in Task 4) | (fill in Task 5) |
| `PROJECT_DOCUMENTATION.md` | delete | — | (fill in Task 4) | (fill in Task 5) |
| `PROJECT_DOCUMENTATION.docx` | delete | — | binary — no salvage | (fill in Task 5) |
| `WARP.md` | delete | — | (fill in Task 4) | (fill in Task 5) |
| `cursorrule.cursor` | delete | — | (fill in Task 4) | (fill in Task 5) |
| `api-500-errors-investigation.txt` | delete | — | (fill in Task 4) | (fill in Task 5) |
| `api-crud-test-results.txt` | delete | — | one-off test output — no salvage | (fill in Task 5) |
| `api-test-results.txt` | delete | — | one-off test output — no salvage | (fill in Task 5) |
| `PROJECT_ISSUES_REPORT.txt` | delete | — | (fill in Task 4) | (fill in Task 5) |
| `get-good-received-note-payload-from-PO.json` | delete | — | test scratch — no salvage | (fill in Task 5) |
| `test_insert_report.json` | delete | — | test scratch — no salvage | (fill in Task 5) |
| `generate` | delete | — | empty file — no salvage | (fill in Task 5) |

## docs/ files (non-subfolder)

| path | action | new path | salvage notes | references found |
|---|---|---|---|---|
| `docs/architecture-diagram.md` | (judgment) | (judgment) | — | (Task 5) |
| `docs/infra-diagram.md` | (judgment) | (judgment) | — | (Task 5) |
| `docs/k8s-architecture-diagram.md` | (judgment) | (judgment) | — | (Task 5) |
| `docs/k8s-dynamic-clustering-architecture.md` | (judgment) | (judgment) | — | (Task 5) |
| `docs/deploy_new_tenant_schema.md` | rename | `docs/deploy-tenant-schema.md` | — | (Task 5) |
| `docs/deploy_new_platform_schema.md` | rename | `docs/deploy-platform-schema.md` | — | (Task 5) |
| `docs/docker-run.md` | rename | `docs/deploy-docker-run.md` | — | (Task 5) |
| `docs/fix-ssl-keycloak.md` | rename | `docs/ops-fix-ssl-keycloak.md` | — | (Task 5) |
| `docs/start_dev_base.md` | rename | `docs/ops-start-dev-base.md` | — | (Task 5) |
| `docs/prisma-upgrade-script.md` | rename | `docs/ops-prisma-upgrade-script.md` | — | (Task 5) |
| `docs/micro-report-design.md` | (judgment) | (judgment) | — | (Task 5) |
| `docs/micro-report-design-go.md` | (judgment) | (judgment) | — | (Task 5) |

## docs/inventory-calculations/ (judgment call — merge or flatten)

| path | action | new path | salvage notes | references found |
|---|---|---|---|---|
| `docs/inventory-calculations/busness-rules-inventory-calc.md` | (judgment) | (judgment) | note typo "busness" — fix in new name | (Task 5) |
| `docs/inventory-calculations/functional-requirements.md` | (judgment) | (judgment) | — | (Task 5) |
| `docs/inventory-calculations/inventory-calculations.md` | (judgment) | (judgment) | — | (Task 5) |

## docs/tools/ (judgment call — mostly NOT docs, needs relocation)

| path | action | new path | salvage notes | references found |
|---|---|---|---|---|
| `docs/tools/README.md` | (judgment — merge) | — | — | (Task 5) |
| `docs/tools/README_backup.md` | delete | — | redundant backup of README | (Task 5) |
| `docs/tools/backup.md` | (judgment — merge) | `docs/ops-backup.md` | — | (Task 5) |
| `docs/tools/auto_backup.sh` | relocate | `scripts/backup/auto_backup.sh` | script, not doc | (Task 5) |
| `docs/tools/backup_postgres.py` | relocate | `scripts/backup/backup_postgres.py` | script, not doc | (Task 5) |
| `docs/tools/cleanup_backups.py` | relocate | `scripts/backup/cleanup_backups.py` | script, not doc | (Task 5) |
| `docs/tools/convert-copy-to-insert.py` | relocate | `scripts/backup/convert-copy-to-insert.py` | script, not doc | (Task 5) |
| `docs/tools/env.example` | relocate | `scripts/backup/env.example` | config, not doc | (Task 5) |
| `docs/tools/env_config.txt` | relocate | `scripts/backup/env_config.txt` | config, not doc | (Task 5) |
| `docs/tools/requirements.txt` | relocate | `scripts/backup/requirements.txt` | python deps | (Task 5) |
| `docs/tools/restore_postgres.py` | relocate | `scripts/backup/restore_postgres.py` | script, not doc | (Task 5) |
| `docs/tools/setup.sh` | relocate | `scripts/backup/setup.sh` | script, not doc | (Task 5) |
| `docs/tools/setup_cron.sh` | relocate | `scripts/backup/setup_cron.sh` | script, not doc | (Task 5) |
| `docs/tools/.gitignore` | relocate | `scripts/backup/.gitignore` | ignores script-generated files | (Task 8) |

## Judgment calls to resolve in Task 3

1. **Architecture docs** — merge 4 files into 1–2, or keep 4 separate with prefix renames?
2. **Inventory-calculations** — merge 3 files into one `docs/domain-inventory-calculations.md`, or keep 3 prefixed (fix typo)?
3. **tools/ docs** — merge `README.md` + `backup.md` into `docs/ops-backup.md`?
4. **Micro-report variants** — keep both `-ts` and `-go` designs, or merge?
5. **Scripts relocation target** — `scripts/backup/` (as above), `scripts/tools/`, or somewhere else already established in the repo?
