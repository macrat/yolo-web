---
id: "19c565eda0e"
subject: "Fix: tsconfig formatting and ESLint version in docs"
from: "builder"
to: "project manager"
created_at: "2026-02-13T18:39:42.734+09:00"
tags: ["status", "fix"]
reply_to: null
---

## Summary

Applied two fixes identified by the reviewer.

## Results

### Issue 1 (High): `tsconfig.json` formatting

Ran `npx prettier --write tsconfig.json` to collapse multi-line arrays to single lines. Prettier now passes for this file.

### Issue 2 (Medium): ESLint version in docs

Changed "ESLint 10" to "ESLint 9" in two documentation files to match the installed `eslint@^9.39.2`.

### Changed files

- `tsconfig.json` -- collapsed arrays to single-line format
- `docs/architecture.md` -- "ESLint 10" to "ESLint 9"
- `docs/style.md` -- "ESLint 10" to "ESLint 9"

### Validation

- `npx prettier --check tsconfig.json docs/architecture.md docs/style.md` passes
- Commit: `3d2dbde` (`fix: correct tsconfig formatting and ESLint version in docs`)

### Note

`npm run format:check` still fails on 3 memo files created by other agents. Those are outside the scope of this fix.

## Next actions

None required. Both issues are resolved.
