# yolos.net

## Immutable Policy

`docs/constitution.md` is the immutable constitution. **Every action, document, code change, and generated site content must comply with it.** Read it before doing any work.

## Roles & Responsibilities

Use these exact role names in all memos and docs:

| Role               | Core Responsibility                                                         |
| ------------------ | --------------------------------------------------------------------------- |
| `owner`            | Establish constitution, monitor `project manager`                           |
| `project manager`  | Make decisions, delegate work, coordinate agents (NO direct implementation) |
| `researcher`       | Provide accurate and relevant information                                   |
| `planner`          | Provide reliable plans                                                      |
| `builder`          | Implement reliably exactly as instructed                                    |
| `reviewer`         | Find all problems                                                           |
| `process engineer` | Help other agents create states efficiently                                 |

## Memo Routing

Memos live under `memo/`, partitioned by recipient role:

- `memo/<role-slug>/inbox/` — unread messages (queue)
- `memo/<role-slug>/active/` — in-progress tasks (to-do list)
- `memo/<role-slug>/archive/` — completed (history)

Role slugs: `owner`, `project-manager`, `researcher`, `planner`, `builder`, `reviewer`, `process-engineer`

**Lifecycle**: read -> triage (archive or activate) -> respond. Ongoing tasks go to `active/`; completed tasks go to `archive/`. At the start of work, an agent MUST check both `inbox/` and `active/`. Agents MUST triage all inbox memos before concluding work.

See `docs/memo-spec.md` for full format, IDs, and templates.

**1メモ1タスク**: 1つのメモには1つの作業依頼のみを含める。複数タスクは個別のメモに分割すること。

## Memo Tool Usage (Required)

All memo operations MUST use the memo CLI tool (`npm run memo`). Direct manipulation of the `memo/` directory (creating, moving, editing, or deleting files) is prohibited.

Available commands:

- `npm run memo -- list [options]` -- List memos with filters
- `npm run memo -- read <id>` -- Display memo content
- `npm run memo -- create <from> <to> <subject> [options]` -- Create a new memo
- `npm run memo -- mark <id> <state>` -- Change memo state (inbox/active/archive)

## Documentation

All project docs are in `docs/`. See `docs/index.md` for the full list.

Key docs:

- `docs/constitution.md` — Immutable rules (do NOT modify)
- `docs/workflow.md` — Roles, lifecycle, routing
- `docs/architecture.md` — Architecture principles
- `docs/setup.md` — Development setup
- `docs/memo-spec.md` — Memo format and templates

## Baseline Toolchain

- **Framework**: Next.js
- **Language**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Vitest + jsdom

## Work Process

- Parallelize work whenever possible. If tasks can proceed concurrently, do so.
- Multiple instances of the same agent role may run concurrently when collision risk is low:
  - `researcher`, `planner`, `reviewer` are read-only (except memo writing) — safe to run multiple instances.
  - `builder` instances may run concurrently if their work areas do not overlap.
- Commit frequently to create checkpoints for easy rollback if something goes wrong.
- `project manager` は `docs/backlog.md` を直接編集できる（他のコード・ファイルは直接編集不可）。

## Git Rule

When committing to git, please set `--author "Claude <noreply@anthropic.com>"` or `--author "Codex <codex@localhost>"`.

Commits do NOT require owner approval. Agents may commit freely as part of their workflow.
