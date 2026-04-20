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
| `README.md` | keep | — | — | _none_ |
| `CLAUDE.md` | keep | — | — | _none_ |
| `PRD.md` | delete | — | Salvaged: success metrics, non-scope, hotel mock data context. | _none_ |
| `PROJECT_DOCUMENTATION.md` | delete | — | Salvaged: full ERDs, enums, deployment layout, CI/CD, env vars. | _none_ |
| `PROJECT_DOCUMENTATION.docx` | delete | — | binary — no salvage | _none_ |
| `WARP.md` | delete | — | Salvaged: service consolidation note, db:mock scripts, test:cov. | _none_ |
| `cursorrule.cursor` | delete | — | Salvaged: class size limits, RO-RO, workflow Zod pattern, common module structure. | `.github/copilot-instructions.md:37` |
| `api-500-errors-investigation.txt` | delete | — | Salvaged: 5 systemic bug patterns (msg-pattern mismatch, Prisma spread). | _none_ |
| `api-crud-test-results.txt` | delete | — | one-off test output — no salvage | _none_ |
| `api-test-results.txt` | delete | — | one-off test output — no salvage | _none_ |
| `PROJECT_ISSUES_REPORT.txt` | delete | — | Salvaged: all 20 issues (critical security bug, missing relations, stale turbo.json). | _none_ |
| `get-good-received-note-payload-from-PO.json` | delete | — | test scratch — no salvage | _none_ |
| `test_insert_report.json` | delete | — | test scratch — no salvage | `scripts/test_insert_data.py:856` |
| `generate` | delete | — | empty file — no salvage | _none_ |

## docs/ files (non-subfolder)

| path | action | new path | salvage notes | references found |
|---|---|---|---|---|
| `docs/architecture-diagram.md` | merge | `docs/architecture-system.md` | merge into system (Q1=A) | _none_ |
| `docs/infra-diagram.md` | merge | `docs/architecture-system.md` | merge into system (Q1=A) | _none_ |
| `docs/k8s-architecture-diagram.md` | merge | `docs/architecture-system.md` | merge into system (Q1=A) | _none_ |
| `docs/k8s-dynamic-clustering-architecture.md` | merge | `docs/architecture-system.md` | merge into system (Q1=A) | _none_ |
| `docs/deploy_new_tenant_schema.md` | rename | `docs/deploy-tenant-schema.md` | — | _none_ |
| `docs/deploy_new_platform_schema.md` | rename | `docs/deploy-platform-schema.md` | — | _none_ |
| `docs/docker-run.md` | rename | `docs/deploy-docker-run.md` | — | _none_ |
| `docs/fix-ssl-keycloak.md` | rename | `docs/ops-fix-ssl-keycloak.md` | — | _none_ |
| `docs/start_dev_base.md` | rename | `docs/ops-start-dev-base.md` | — | _none_ |
| `docs/prisma-upgrade-script.md` | rename | `docs/ops-prisma-upgrade-script.md` | — | _none_ |
| `docs/micro-report-design.md` | rename | `docs/design-micro-report-ts.md` | Q4=A keep both | _none_ |
| `docs/micro-report-design-go.md` | rename | `docs/design-micro-report-go.md` | Q4=A keep both | _none_ |

## docs/inventory-calculations/ (judgment call — merge or flatten)

| path | action | new path | salvage notes | references found |
|---|---|---|---|---|
| `docs/inventory-calculations/busness-rules-inventory-calc.md` | merge | `docs/domain-inventory-calculations.md` | Q2=A merge; typo "busness" fixed in section header | _none_ |
| `docs/inventory-calculations/functional-requirements.md` | merge | `docs/domain-inventory-calculations.md` | Q2=A merge | _none_ |
| `docs/inventory-calculations/inventory-calculations.md` | merge | `docs/domain-inventory-calculations.md` | Q2=A merge | _none_ |

## docs/tools/ (judgment call — mostly NOT docs, needs relocation)

| path | action | new path | salvage notes | references found |
|---|---|---|---|---|
| `docs/tools/README.md` | merge | `docs/ops-backup.md` | Q3=A merge | `docs/tools/env_config.txt:1`, `docs/tools/setup_cron.sh:11` |
| `docs/tools/README_backup.md` | delete | — | redundant backup of README | _none_ |
| `docs/tools/backup.md` | merge | `docs/ops-backup.md` | Q3=A merge | _none_ |
| `docs/tools/auto_backup.sh` | relocate | `scripts/backup/auto_backup.sh` | script, not doc | `docs/tools/README.md:85,112,166`, `docs/tools/setup_cron.sh:9,10,16,47,54` |
| `docs/tools/backup_postgres.py` | relocate | `scripts/backup/backup_postgres.py` | script, not doc | `docs/tools/README.md:9,69`, `docs/tools/README_backup.md:32,140,146`, `docs/tools/setup.sh:67` |
| `docs/tools/cleanup_backups.py` | relocate | `scripts/backup/cleanup_backups.py` | script, not doc | `docs/tools/README.md:11,79`, `docs/tools/setup.sh:69` |
| `docs/tools/convert-copy-to-insert.py` | relocate | `scripts/backup/convert-copy-to-insert.py` | script, not doc | `docs/tools/backup.md:11` |
| `docs/tools/env.example` | relocate | `scripts/backup/env.example` | config, not doc | _none_ |
| `docs/tools/env_config.txt` | relocate | `scripts/backup/env_config.txt` | config, not doc | _none_ |
| `docs/tools/requirements.txt` | relocate | `scripts/backup/requirements.txt` | python deps | _none_ |
| `docs/tools/restore_postgres.py` | relocate | `scripts/backup/restore_postgres.py` | script, not doc | `docs/tools/README.md:10,74`, `docs/tools/setup.sh:68` |
| `docs/tools/setup.sh` | relocate | `scripts/backup/setup.sh` | script, not doc | _none_ |
| `docs/tools/setup_cron.sh` | relocate | `scripts/backup/setup_cron.sh` | script, not doc | `docs/tools/README.md:14,88,89,97,100,103` |
| `docs/tools/.gitignore` | relocate | `scripts/backup/.gitignore` | ignores script-generated files | _none_ |

## Judgment calls — resolved in Task 3 (2026-04-20)

1. **Architecture docs (Q1)** → **A: Merge all 4 into `docs/architecture-system.md`.**
2. **Inventory-calculations (Q2)** → **A: Merge all 3 into `docs/domain-inventory-calculations.md`; fix "busness" typo in section header.**
3. **tools/ docs (Q3)** → **A: Merge `README.md` + `backup.md` into `docs/ops-backup.md`.**
4. **Micro-report (Q4)** → **A: Keep both, rename to `docs/design-micro-report-ts.md` + `docs/design-micro-report-go.md`.**
5. **Scripts destination (Q5)** → **A: `scripts/backup/`** (table defaults correct).
