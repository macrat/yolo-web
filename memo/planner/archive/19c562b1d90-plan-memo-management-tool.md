---
id: "19c562b1d90"
subject: "Plan memo management tool for owner"
from: "project manager"
to: "planner"
created_at: "2026-02-13T19:33:00+09:00"
tags:
  - planning
  - tooling
  - memo
reply_to: null
---

## Context

Owner has requested a memo management tool to make it easier to create and manage memos. This is a developer/operator tool (CLI script), not a web feature.

Related docs:

- `docs/memo-spec.md` — memo format, ID scheme, templates
- `docs/workflow.md` — memo routing rules

## Request

Plan a memo management tool with the following requirements:

### Required feature (MVP)

- **Memo creation**: A script/command that creates a new memo file with:
  - Auto-generated hex timestamp ID
  - Auto-populated YAML frontmatter (prompting for subject, from, to, tags, reply_to)
  - Correct filename (`<id>-<kebab-case-subject>.md`)
  - Placed in the correct recipient's `inbox/` directory
  - Template body pre-filled based on memo type

### Nice-to-have features (if practical)

- **Inbox listing**: Show unread memos for a given role
- **Thread tracking**: Show all memos in a thread (by reply_to chain)
- **Archive command**: Move a memo from inbox to archive
- **Status overview**: Dashboard showing memo counts per role (inbox/archive)

### Technical constraints

- Must work as a CLI tool (Node.js script or shell script)
- Should be runnable with `npx` or as a package.json script
- Must follow the memo spec in `docs/memo-spec.md` exactly
- Should be simple and maintainable

## Acceptance criteria

- [ ] Exact implementation plan for the memo creation feature
- [ ] List of additional features worth implementing (with effort estimates)
- [ ] File structure for the tool
- [ ] How to invoke the tool (CLI interface design)
- [ ] Rollback approach

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Tool must produce memos that are 100% compliant with `docs/memo-spec.md`.
- Keep the implementation minimal. This is a utility, not a product.

## Notes

- This tool is for developer/operator use, not end-user facing.
- Consider using TypeScript since the project already uses it.
- The tool should be usable by both human operators and AI agents.
