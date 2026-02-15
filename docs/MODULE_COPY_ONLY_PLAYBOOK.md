# Copy-Only Module Unification Playbook (Safe Mode)

Last updated: 2026-02-14

## Non-Negotiable Safety Rules
1. Copy-only operation: no move, no rename, no delete in source repos.
2. Read-only source scanning from each project.
3. All copied files go to a staging destination outside source repos.
4. Dry-run first, then explicit execution.
5. Hash audit output for copied files.

## Source Scope
- FlamingSocialMedia
- MohnMatrix
- MohnMenu
- MohnMint
- MohnMove
- MohnPay
- MohnServe
- MohnSters
- NeighborTechs

## Staging Destination
Default:
- `C:\Users\richa\projects\Mohn_Empire\MODULE_COPY_STAGING`

Structure:
- `MODULE_COPY_STAGING/<module-id>/<project>/<original-relative-path>`

## Workflow
1. Run dry-run preview:
   - `pwsh -File scripts/copy-shared-modules.ps1`
2. Review planned copy list.
3. Run execute mode:
   - `pwsh -File scripts/copy-shared-modules.ps1 -Execute`
4. Review generated audit report in staging:
   - `MODULE_COPY_STAGING/copy-audit-<timestamp>.csv`

## Why this is safest
- Existing projects remain untouched.
- You get a full snapshot of reusable modules by family.
- You can refine modules in staging first, then selectively push updates back to projects later.

## Next Step After Copy
Create a shared package repo/workspace from staged modules and publish versioned packages:
- `@mohn/core-types`
- `@mohn/core-auth`
- `@mohn/core-payments`
- `@mohn/core-tracking`
- `@mohn/core-seo-domain`
- `@mohn/core-admin-support`
