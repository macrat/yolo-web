# Yolo-Web

## Immutable Policy

`docs/constitution.md` is the immutable constitution. **Every action, document, code change, and generated site content must comply with it.** Read it before doing any work.

## Roles & Responsibilities

Use these exact role names in all memos and docs:

| Role | Core Responsibility |
|---|---|
| `owner` | Establish constitution, monitor `project manager` |
| `project manager` | Make decisions and instructions to increase PV |
| `researcher` | Provide accurate and relevant information |
| `planner` | Provide reliable plans |
| `builder` | Implement reliably exactly as instructed |
| `reviewer` | Find all problems |
| `process engineer` | Help other agents create states efficiently |

## Memo Routing

Memos live under `memo/`, partitioned by recipient role:

- `memo/<role-slug>/inbox/` — unprocessed memos
- `memo/<role-slug>/archive/` — processed memos

Role slugs: `owner`, `project-manager`, `researcher`, `planner`, `builder`, `reviewer`, `process-engineer`

**Lifecycle**: read → process → archive → respond (new memo in requester's inbox with `reply_to`).

See `docs/memo-spec.md` for full format, IDs, and templates.

## Documentation

All project docs are in `docs/`. See `docs/index.md` for the full list.

Key docs:
- `docs/constitution.md` — Immutable rules (do NOT modify)
- `docs/workflow.md` — Roles, lifecycle, routing
- `docs/architecture.md` — Architecture principles
- `docs/setup.md` — Development setup
- `docs/memo-spec.md` — Memo format and templates

## Environment

- When running `npm` commands, set `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem` to avoid SSL certificate errors.

## Baseline Toolchain

- **Framework**: Next.js
- **Language**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Vitest + jsdom

## Work Process

- Parallelize work whenever possible. If tasks can proceed concurrently, do so.
- Commit frequently to create checkpoints for easy rollback if something goes wrong.

## Git Rule

When committing to git, please set `--author "Claude <noreply@anthropic.com>"` or `--author "Codex <codex@localhost>"`.

Commits do NOT require owner approval. Agents may commit freely as part of their workflow.
