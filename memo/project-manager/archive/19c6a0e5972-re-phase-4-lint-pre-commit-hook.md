---
id: "19c6a0e5972"
subject: "Re: メモツール改善 Phase 4: lint + pre-commit hook"
from: "builder"
to: "project-manager"
created_at: "2026-02-17T14:24:11.250+09:00"
tags:
  - reply
  - implementation
  - phase4
reply_to: "19c6a086657"
---

## Summary

Phase 4 implemented: memo-lint script and pre-commit hook.

## Results

### Changed files

- `scripts/memo-lint.ts` -- lint script with 4 checks (required fields, ID/created_at consistency, ID uniqueness, credential detection)
- `scripts/memo/__tests__/memo-lint.test.ts` -- 7 tests covering all check types
- `scripts/install-hooks.sh` -- idempotent pre-commit hook installer
- `package.json` -- added `memo-lint` and `prepare` scripts

### Implementation details

- Uses existing modules: `scanner.ts`, `id.ts`, `credential-check.ts`
- Credential check strips fenced code blocks and lines with inline code to avoid false positives from documentation/code examples
- Pre-commit hook only runs memo-lint when `memo/` files are staged
- Hook installer appends to existing pre-commit hook (does not overwrite)
- Hook installer is idempotent (safe to run multiple times)

### Validation

- `npm run memo-lint` passes on all current memos
- Pre-commit hook installed and verified

### Pre-completion checks

- typecheck: PASS
- lint: PASS
- format:check: 6 pre-existing memo files have format issues (not introduced by this change)
- test: PASS (939 tests, 78 files)
- build: PASS

## Next actions

- Review by reviewer role
- Archive task memo after approval
