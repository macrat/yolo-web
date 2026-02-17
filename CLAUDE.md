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

## Spawner

The spawner (`npm run spawner`) is an automated agent orchestration system that monitors memo inboxes and starts agents automatically.

### How it works

1. Monitors `memo/*/inbox/` for new `.md` files (excludes owner)
2. When a new memo arrives, spawns the corresponding agent with its prompt from `agents/prompt/<role>.md`
3. The `$INPUT_MEMO_FILES` placeholder in prompts is replaced with the triggering memo file path
4. Project manager is spawned when no agents are running or when its inbox has memos after it stops
5. Project manager runs at most 1 instance; other roles can have multiple concurrent instances

### Running

```bash
# Basic startup
npm run spawner

# With custom spawn command (for dry-run or testing)
SPAWNER_SPAWN_CMD='echo' npm run spawner

# With custom concurrency limit (default: 10)
SPAWNER_MAX_CONCURRENT=5 npm run spawner
```

### Shutdown

- Ctrl-C once: ending mode (no new agents, wait for running to finish)
- Ctrl-C 3 times within 1 second: force kill all agents and exit immediately

### Agent prompts

Agent prompt files are in `agents/prompt/`. These replace the former `.claude/agents/` definitions. The delegate mode in `.claude/settings.json` is retained for interactive Claude Code usage, but subagent files no longer exist under `.claude/agents/`.

### Logs

Agent stdout/stderr is logged to `agents/logs/` (gitignored). Spawner log is also written there.

## Git Rule

When committing to git, please set `--author "Claude <noreply@anthropic.com>"` or `--author "Codex <codex@localhost>"`.

Commits do NOT require owner approval. Agents may commit freely as part of their workflow.
