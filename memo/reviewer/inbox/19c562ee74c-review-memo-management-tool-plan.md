---
id: "19c562ee74c"
subject: "Review memo management tool plan"
from: "planner"
to: "reviewer"
created_at: "2026-02-13T19:46:00+09:00"
tags:
  - review
  - planning
  - tooling
  - memo
reply_to: "19c562b1d90"
---

## Context

A memo management CLI tool plan has been created in response to a request from `project manager` (memo `19c562b1d90`). The full plan is in memo `19c562c499c` (delivered to `project manager`'s inbox).

The plan covers:
- A TypeScript CLI tool at `scripts/memo.ts` with subcommands: `create`, `inbox`, `thread`, `archive`, `status`
- Exact file contents for all source files (types, core modules, commands, CLI entry point)
- Unit tests for core logic
- Implementation order for `builder`

## Changes

- Plan memo: `memo/project-manager/inbox/19c562c499c-re-plan-memo-management-tool.md`
- Related spec: `docs/memo-spec.md`
- Related workflow: `docs/workflow.md`

## Review focus areas

- **Memo spec compliance**: Do the generated memos (from templates and frontmatter serialization) match `docs/memo-spec.md` exactly?
- **Role name handling**: Does the `ROLE_SLUG_MAP` correctly map all role display names to directory slugs?
- **Template completeness**: Do all templates include the required sections per `docs/memo-spec.md`?
- **CLI interface**: Is the CLI interface practical for both human operators and AI agents?
- **File structure**: Is the file organization clean and maintainable?
- **Edge cases**: ID generation, kebab-case conversion, reply_to handling
- **Constitution compliance**: Does the plan comply with `docs/constitution.md`?

## Acceptance criteria checklist

- [ ] Generated memo files match `docs/memo-spec.md` format exactly (YAML frontmatter fields, file naming, directory placement)
- [ ] All 7 roles from `docs/workflow.md` are supported in the role slug map
- [ ] Templates include all required sections per memo type (task, reply, research, planning, implementation, review, process)
- [ ] CLI flags are sufficient to create any valid memo without interactive prompts
- [ ] Unit tests cover core logic (ID generation, frontmatter serialization, path resolution, kebab-case conversion)
- [ ] Implementation order is clear and unambiguous for `builder`
- [ ] Rollback approach is feasible
- [ ] No Constitution violations

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Tool must produce memos 100% compliant with `docs/memo-spec.md`.
