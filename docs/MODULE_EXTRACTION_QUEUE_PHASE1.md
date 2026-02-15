# Module Extraction Queue (Copy-Only) — Phase 1

Last updated: 2026-02-14
Method: copy-only from source projects into shared staging

## Phase 1 Goal
Extract highest-overlap module families first with minimal risk.

## Order (Dependency-Safe)
1. `core-types`
2. `core-auth`
3. `core-ui-shell`
4. `core-payments`
5. `core-cart-ordering`
6. `core-tracking`
7. `core-seo-domain`
8. `core-notifications`
9. `core-admin-support`
10. `core-compliance`
11. `core-offerwall`
12. `core-live-ops`

## Execution Commands
Preview (safe dry-run):
- `pwsh -File scripts/copy-shared-modules.ps1`

Actual copy:
- `pwsh -File scripts/copy-shared-modules.ps1 -Execute`

## Validation Checklist
- Confirm audit CSV exists in `MODULE_COPY_STAGING`
- Confirm source repos have zero file changes
- Confirm each module folder contains files from multiple projects
- Confirm hashes are present in audit

## Rollback
No rollback needed for sources (copy-only). If needed, delete staged output folder only:
- `C:\Users\richa\projects\Mohn_Empire\MODULE_COPY_STAGING`
