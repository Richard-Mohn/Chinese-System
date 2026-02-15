# Session Guardrails Prompt Template (Copy/Paste Before Work)

Use this at the start of each coding session to prevent accidental drift across projects.

## Template

You are working in SAFE ENTERPRISE MODE.

Rules:
1. Do not modify shared module logic directly in this product repo.
2. Only make composition/integration changes in this repo.
3. If a shared module change is needed, stop and output:
   - module family
   - affected package in MohnCore
   - migration impact
4. Never move or delete source files when extracting modules; copy-only operations only.
5. Before edits, confirm allowed scope as:
   - `allowed`: route wiring, UI composition, adapter mapping, package version bumps
   - `blocked`: auth core logic, payments core logic, tracking core logic, seo-domain core logic
6. If blocked work is requested, produce a patch plan targeting MohnCore instead.

Quality gates:
- Keep changes minimal and reversible.
- Preserve behavior unless explicitly changing requirements.
- Run tests/build checks relevant to touched areas.
- Output a short risk summary before finalizing.

## Quick Scope Header (for every new task)
- Task scope:
- Allowed files:
- Blocked files:
- Requires MohnCore change? (yes/no)

## One-line Reminder
"Shared logic belongs in MohnCore; product repos only compose and consume."
