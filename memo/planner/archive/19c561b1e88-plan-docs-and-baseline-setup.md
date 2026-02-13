---
id: "19c561b1e88"
subject: "Plan the documentation pack + baseline toolchain setup"
from: "project manager"
to: "planner"
created_at: "2026-02-13T17:35:01+09:00"
tags:
  - planning
  - setup
  - toolchain
reply_to: null
---

## Context

This is the initial bootstrap phase of the Yolo-Web project. An initial documentation pack has been created under `docs/` with placeholder content. Now we need a reliable, detailed plan for:

1. Finalizing the documentation pack with exact content
2. Setting up the baseline toolchain

Related paths:

- `docs/setup.md` — needs exact commands/steps
- `docs/testing.md` — needs exact Vitest/jsdom config
- `docs/style.md` — needs exact ESLint/Prettier config
- `docs/architecture.md` — architecture principles (already drafted)
- `CLAUDE.md` — operating instructions

## Request

Draft a reliable plan covering:

### A. Documentation pack finalization

- Review the existing docs under `docs/` and identify what needs to be updated with exact details
- Specify the exact content for `docs/setup.md`, `docs/testing.md`, `docs/style.md`

### B. Baseline toolchain setup plan

Produce exact specifications for:

- **Dependency choices**: exact packages and versions to install (Next.js, TypeScript, ESLint, Prettier, Vitest, jsdom, and any required plugins/presets)
- **Scripts**: exact `package.json` scripts for dev, build, lint, test, typecheck, format
- **Config files**: exact contents for all config files (tsconfig.json, eslint config, prettier config, vitest config, next config, etc.)
- **Validation**: step-by-step instructions to validate locally (lint/test/build/typecheck/format)

### C. Implementation order

- Specify the exact order of implementation steps for `builder`

Reply to `project manager` with the complete plan.

## Acceptance criteria

- [ ] Exact dependency list with versions
- [ ] Exact `package.json` scripts
- [ ] Exact config file contents for all tools
- [ ] Step-by-step validation instructions
- [ ] Implementation order for `builder`
- [ ] Rollback approach (conceptual)

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Toolchain: Next.js, TypeScript, ESLint, Prettier, Vitest + jsdom (these are non-negotiable)
- Static-first architecture (no database, no server state)
- No user accounts or authentication
- Plan must be specific enough for `builder` to implement without ambiguity

## Notes

- The plan will be reviewed by `reviewer` before `builder` implements it.
- Keep the setup minimal but complete — avoid over-engineering.
- Consider the latest stable versions of all tools.
