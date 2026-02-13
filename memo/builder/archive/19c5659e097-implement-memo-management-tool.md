---
id: "19c58a00000"
subject: "Implement memo management CLI tool per approved plan"
from: "project manager"
to: "builder"
created_at: "2026-02-13T23:30:00+09:00"
tags:
  - task
  - implementation
  - tooling
  - memo
reply_to: null
---

## Context

The owner requested a CLI tool for memo management. The planner created a plan (memo `19c562c499c`) which was reviewed, revised (memo `19c563445b4`), and re-reviewed by the reviewer who approved it (memo `19c56382ebd`).

The baseline toolchain setup is complete (commit `4106c64`), so all prerequisites are met.

## Request

Implement the memo management CLI tool exactly as specified in the two planner memos:

1. **Original plan**: `memo/project-manager/archive/19c562c499c-re-plan-memo-management-tool.md` — contains the base file structure, CLI interface design, unchanged file contents (C.2, C.5, C.8, C.9, C.11), implementation steps, and unit tests for id, frontmatter, paths, templates.
2. **Revised plan (v2)**: `memo/project-manager/archive/19c563445b4-re-revised-plan-memo-management-tool.md` — contains UPDATED file contents for types.ts (C.1), paths.ts (C.3), frontmatter.ts (C.4), parser.ts (C.6), create.ts (C.7), thread.ts (C.10), memo.ts CLI entry point (C.12), and NEW parser.test.ts (C.9b).

**Use the v2 version for any file that appears in both memos.** The v2 fixes are: `VALID_TEMPLATES` runtime validation, `process.cwd()` for MEMO_ROOT, `--from` validation, YAML double-quote escaping, CRLF normalization in parser, cycle detection in thread, and parser unit tests.

### Reviewer fix (from memo `19c56382ebd`):

In `create.ts`, the `to` field in the frontmatter object must use `toSlug` (resolved slug) instead of `options.to` (raw input). Change:

```ts
to: options.to,
```

to:

```ts
to: toSlug,
```

## Implementation Steps

1. `npm install --save-dev tsx@4.19.4`
2. Add `"memo": "tsx scripts/memo.ts"` to package.json scripts
3. Create `scripts/memo/types.ts` (v2)
4. Create core modules: `id.ts`, `paths.ts` (v2), `frontmatter.ts` (v2), `templates.ts`, `parser.ts` (v2)
5. Create commands: `create.ts` (v2 + reviewer fix), `inbox.ts`, `archive.ts`, `thread.ts` (v2), `status.ts`
6. Create CLI entry point: `scripts/memo.ts` (v2)
7. Create unit tests: `id.test.ts`, `frontmatter.test.ts`, `paths.test.ts`, `templates.test.ts`, `parser.test.ts` (v2)
8. Validate: `npm run typecheck`, `npm run lint`, `npm test`, `npm run format:check`
9. Test end-to-end: `npm run memo -- create --subject "Test memo" --from planner --to builder --tags "test" --template task`, verify file, delete it
10. Commit: `feat(scripts): add memo management CLI tool` with `--author "Claude <noreply@anthropic.com>"`
11. Send review request memo to `reviewer` and status update to `project manager`

## Acceptance criteria

- [ ] All files from the plan created exactly as specified
- [ ] The `to` field fix from reviewer applied (use `toSlug` not `options.to`)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all existing + new tests)
- [ ] `npm run format:check` passes
- [ ] End-to-end create command works and produces memo-spec compliant output
- [ ] Commit created with correct message and author
- [ ] Review request and status update memos sent

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Tool must produce memos 100% compliant with `docs/memo-spec.md`.
- Do NOT modify any existing application code under `src/`.
- Read both plan memos in full before starting implementation.

## Notes

- The `active/` directory is now part of the 3-state lifecycle. The `thread.ts` `scanAllMemos()` currently only scans `inbox` and `archive`. Consider adding `active` to the scan if it makes sense, but this is not blocking — it can be a follow-up.
