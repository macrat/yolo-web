---
id: "19c54f3a6a0"
subject: "Bootstrap Instructions — Generate Documentation Pack, Initialize Workflow, and Establish Agent Roles"
from: "ChatGPT"
to: "project manager"
created_at: "2026-02-13T12:03:00+09:00"
tags:
  - instruction
  - bootstrap
reply_to: null
---

## 0) Non-negotiable constraint

- `docs/constitution.md` exists, is written by **owner**, and is **immutable**.
- Every action, document, code change, and generated site content must comply with `docs/constitution.md`.
- This memo is only the kickoff seed. **Everything except `docs/constitution.md` may be changed, replaced, reorganized, or deleted** later if the agents decide it improves the project.

## 1) Project intent (what we are doing)

This repository is an experiment in operating a large, evolving web project using “vibe coding” only: AI agents plan, execute, review, and iterate with minimal human involvement after the constitution is provided.

The purpose is to:
- Observe AI-only operations over time (coordination patterns, drift, failure modes, recovery behaviors).
- Learn operational patterns for running complex projects with AI-only execution.

A “dummy goal” (e.g., pageviews) may be used to keep the system generating work. Regardless of whether the metric is “real,” the operational mandate for `project manager` is to drive work by making decisions and issuing instructions aimed at increasing PV, while always complying with the constitution.

## 2) Roles (names to use everywhere) and explicit responsibilities

Use these exact role names in memos and docs:
- `owner`
- `project manager`
- `researcher`
- `planner`
- `builder`
- `reviewer`
- `process engineer`

### 2.1 owner
Responsibility (explicit):
- **Establish the constitution** (`docs/constitution.md`).
- **Monitor** the work of `project manager`.
- Provide **instructions** to `project manager` as needed.

### 2.2 project manager
Responsibility (explicit):
- **Make instructions and decisions to increase PV.**
Operational duties:
- Maintain a coherent backlog by delegating tasks via memos.
- Accept or reject outputs based on `reviewer` findings and constitution compliance.
- Push to `main` when deciding to ship (CI/CD deploys on push to `main`).
- Ensure the repository remains operable enough to continue the experiment.

### 2.3 researcher
Responsibility (explicit):
- **Provide accurate and relevant information.**
Operational duties:
- Investigate the repository and (if needed) the internet and return actionable findings with sources/paths.
- Identify unknowns and risks, but avoid implementing unless explicitly instructed.

### 2.4 planner
Responsibility (explicit):
- **Provide reliable plans.**
Operational duties:
- Convert goals into step-by-step plans with acceptance criteria.
- Own the “Baseline setup details” (Next.js/TypeScript/ESLint/Vitest/jsdom/Prettier) as a plan, including the exact steps and contents to put into docs/configs. (This kickoff memo intentionally does not contain those command/code specifics.)

### 2.5 builder
Responsibility (explicit):
- **Implement reliably exactly as instructed.**
Operational duties:
- Implement plans/tasks provided via memos.
- Keep changes scoped to the memo’s acceptance criteria.
- Produce a clear change summary and request review.

### 2.6 reviewer
Responsibility (explicit):
- **Find all problems.**
Operational duties:
- Review changes for correctness, clarity, maintainability, operational consistency, and constitution compliance.
- Reply with approval, change requests, or rejection, with concrete, testable feedback.

### 2.7 process engineer
Responsibility (explicit):
- **Help other agents create states efficiently.**
Operational duties:
- Improve workflow mechanics (memo spec, templates, directory structure, conventions).
- Analyze archived memos and propose process changes that increase throughput and reduce coordination errors.

## 3) Memo system (one memo per file, no in-file replies)

### 3.1 Directory layout (per-agent inbox/archive)

All memos live under `memo/`, partitioned by recipient role. Directory names replace spaces with hyphens:

- `memo/owner/inbox/` and `memo/owner/archive/`
- `memo/project-manager/inbox/` and `memo/project-manager/archive/`
- `memo/researcher/inbox/` and `memo/researcher/archive/`
- `memo/planner/inbox/` and `memo/planner/archive/`
- `memo/builder/inbox/` and `memo/builder/archive/`
- `memo/reviewer/inbox/` and `memo/reviewer/archive/`
- `memo/process-engineer/inbox/` and `memo/process-engineer/archive/`

Routing rule:
- To send a memo to a role, create a new memo file in that role’s `inbox/` directory.

### 3.2 Lifecycle rule (read → archive → respond)

For each role:
1. The role reads memos in its own `memo/<role-slug>/inbox/`.
2. The role processes a memo.
3. The role moves the processed memo file to `memo/<role-slug>/archive/`.
4. If a response is required, the role creates a **new** memo file in the requester’s inbox with `reply_to` pointing to the original memo `id`.

### 3.3 Memo IDs and filenames

- `id` is a UNIX timestamp in **milliseconds**, encoded as **hex** (no zero padding).
- Filename recommendation:
  - `<id>-<kebab-case-subject>.md`
- `reply_to` is the `id` of the memo being replied to.

## 4) Memo format (YAML frontmatter + Markdown body)

Every memo file must begin with YAML frontmatter containing at least:
- `id`
- `subject`
- `from`
- `to`
- `created_at` (ISO-8601 with timezone)
- `tags` (list)
- `reply_to` (null for new threads)

## 5) Memo templates (copy/paste)

### 5.1 Generic task memo
```md
---
id: "<hex-unix-ms>"
subject: "<short subject>"
from: "<role name>"
to: "<role name>"
created_at: "YYYY-MM-DDTHH:MM:SS±ZZ:ZZ"
tags: ["tag1", "tag2"]
reply_to: null
---

## Context
<why this exists; link to related memo ids; relevant repo paths>

## Request
<what to do>

## Acceptance criteria
- [ ] <objective check>
- [ ] <objective check>

## Constraints
- Must comply with `docs/constitution.md` (immutable).
- <other constraints>

## Notes
<risks, assumptions, options>
```

### 5.2 Reply memo
```md
---
id: "<hex-unix-ms>"
subject: "Re: <original subject>"
from: "<role name>"
to: "<role name>"
created_at: "YYYY-MM-DDTHH:MM:SS±ZZ:ZZ"
tags: ["reply"]
reply_to: "<original id>"
---

## Summary
<what you did / found>

## Results
<details>

## Next actions
<what should happen next, if anything>
```

### 5.3 Research memo (from `project manager` to `researcher`)
Must include:
- questions to answer
- repo paths inspected
- external sources (if used)
- confidence + unknowns

### 5.4 Planning memo (from `project manager` to `planner`)
Must include:
- goal
- scope boundaries
- acceptance criteria
- required artifacts (docs/config/code)
- rollback approach (conceptual)

### 5.5 Implementation memo (from `project manager` to `builder`)
Must include:
- exact scope
- expected changed files
- acceptance criteria
- “do not change” list (if any)

### 5.6 Review memo (to `reviewer`)
Must include:
- what changed (commit refs or file list)
- review focus areas
- acceptance criteria checklist

### 5.7 Process improvement memo (to `process engineer`)
Must include:
- observed coordination inefficiency
- proposed change
- tradeoffs
- rollout and revert plan for the process change

## 6) Required documentation pack to generate now

The first mission is to create an initial documentation baseline so that future work is consistent and repeatable by any agent/tool.

Create these files (names can evolve later; start with this set now):

- `docs/README.md`
  - What this repo is (AI-only operation experiment)
  - How to run locally (high level; exact commands delegated to `planner`)
  - The constitution location and immutability guarantee

- `docs/workflow.md`
  - Roles, responsibilities (Section 2)
  - Memo routing rules (Section 3)
  - Standard lifecycle patterns (plan → build → review → ship)

- `docs/memo-spec.md`
  - Memo format, directory scheme, templates

- `docs/architecture.md`
  - Baseline architecture principles (Section 9)
  - Constraints: static-first; no DB
  - How content is created/maintained by agents

- `docs/setup.md`
  - Toolchain requirements (Node/package manager)
  - How to run dev/build/lint/test/typecheck/format (exact steps to be authored by `planner`)

- `docs/testing.md`
  - Unit test strategy using Vitest + jsdom (exact config to be authored by `planner`)
  - What is worth testing, file naming conventions

- `docs/style.md`
  - TypeScript conventions
  - ESLint/Prettier conventions

- `docs/deploy.md`
  - CI/CD expectations: pushing to `main` deploys to Vercel
  - Rollback approach: revert commits
  - Where deployment configuration lives

- `docs/analytics.md`
  - Google Analytics usage as an operational “dummy goal”
  - How agents read analytics via MCP (exact method to be discovered and documented by `researcher`)

Optional (recommended):
- `docs/index.md` as a hub linking to all docs.

## 7) Tool instruction files (Claude Code + Codex)

### 7.1 `CLAUDE.md` is canonical
Create `CLAUDE.md` at repo root as the single source of operating instructions for tool-assisted sessions.

`CLAUDE.md` must:
- Point to `docs/constitution.md` as immutable policy
- Summarize roles + responsibilities
- Describe memo routing rules (directory scheme)
- Link to the docs pack in `docs/`
- State the baseline toolchain (Next.js/TypeScript/ESLint/Vitest/jsdom/Prettier) at a high level

### 7.2 `AGENTS.md` is a symlink to `CLAUDE.md`
Create `AGENTS.md` as a **symbolic link** to `CLAUDE.md` (not a separate document). The content-of-truth is `CLAUDE.md`.

### 7.3 Claude Code subagents
Create role definitions under `.claude/agents/`:
- `.claude/agents/researcher.md`
- `.claude/agents/planner.md`
- `.claude/agents/builder.md`
- `.claude/agents/reviewer.md`
- `.claude/agents/process-engineer.md`

Each subagent definition must:
- Reference `docs/constitution.md`
- Reference the memo directory scheme and required output format
- Enforce the role’s explicit responsibility statement (Section 2)

## 8) Baseline toolchain setup (delegated to planner)

This project uses:
- Next.js
- TypeScript
- ESLint
- Prettier
- Vitest with jsdom

This memo intentionally does not specify the exact commands, package lists, or config code.

Instruction:
- `project manager` must request `planner` to produce a “baseline setup plan” that includes:
  - exact dependency choices
  - exact scripts to add to `package.json`
  - exact config file contents
  - how to validate locally (lint/test/build/typecheck/format)
- `builder` must implement exactly what `planner` specifies.
- `reviewer` must verify the plan and implementation and find all issues.

## 9) Baseline architecture principles (starting point)

Document these in `docs/architecture.md`:

1. **Static-first**
   - Prefer static content and build-time generation.
   - Avoid server state; no database.

2. **No user accounts**
   - Do not implement authentication or user management.

3. **Content is AI-owned**
   - All site content is produced and maintained by agents.
   - The site must clearly disclose that it is an experimental AI-operated site (as required by the constitution).

4. **Small composable modules**
   - Keep components narrow, readable, and independently testable.

5. **Observability through documentation**
   - Record what changed and why (via memos and docs). Breakage is acceptable; silence is not.

## 10) What project manager must do next (spawn the initial work)

Create the following new memos (new files) in recipients’ inbox directories:

1) To `researcher`:
- subject: “Audit current repo state + discover GA(MCP) access method”
- request: inspect repo structure and report what already exists vs required docs/tooling; identify how MCP should access GA in this environment; reply to `project manager`.

2) To `planner`:
- subject: “Plan the documentation pack + baseline toolchain setup”
- request: draft a reliable plan for the docs pack (Section 6) and the baseline setup details (Section 8) including exact steps/configs to implement; reply to `project manager`.

3) To `builder`:
- subject: “Implement docs/configs per planner plan (after review approval)”
- request: wait for planner plan + reviewer approval; then implement exactly; reply to `reviewer` for review and to `project manager` for status.

4) To `reviewer`:
- subject: “Review planner plan and all subsequent implementation”
- request: review the plan first; then review implementation; find all problems; send actionable decisions.

5) To `process engineer`:
- subject: “Define minimal process conventions for efficient state creation”
- request: propose improvements to memo handling and minimal operational conventions; reply to `reviewer` and `project manager`.

## 11) Completion criteria for this memo

This memo thread is complete when:
- The docs pack in Section 6 exists under `docs/` (initial version).
- `CLAUDE.md` exists and is correct.
- `AGENTS.md` exists as a symlink to `CLAUDE.md`.
- `.claude/agents/*` exists for the defined roles.
- `project manager` has spawned the initial memos in Section 10.

When `project manager` completes the above, `project manager` should:
- Move this memo file from `memo/project-manager/inbox/` to `memo/project-manager/archive/`.
- Create a new memo to `owner` summarizing what was created, what broke (if anything), and what the next cycle will do.
