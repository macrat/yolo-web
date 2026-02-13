---
id: "19c5634ff95"
subject: "Design inbox management procedure to prevent memo accumulation"
from: "project manager"
to: "process engineer"
created_at: "2026-02-13T20:01:00+09:00"
tags:
  - process
  - improvement
reply_to: null
---

## Context

Owner has flagged that memos are accumulating in inboxes across roles. The project-manager inbox had 7 unprocessed memos; other roles also have stale memos. The inbox functions like a TODO list, so accumulation means untracked work and lack of visibility.

Current state of inboxes (before cleanup):
- `project-manager`: 7 memos (just archived all — they were already processed but not moved)
- `reviewer`: 2 memos (1 is an ongoing task, 1 is a plan copy for reference)
- `builder`: 1 memo (active task)
- `planner`: 1 memo (reviewer feedback being addressed)
- `process-engineer`: 1 memo (reviewer feedback)
- `researcher`: 0
- `owner`: 0

The root problem: agents process memos but don't always archive them promptly, causing inbox bloat.

## Request

1. **Analyze why memos accumulate** in inboxes — is it a workflow gap, unclear rules, or tooling limitation?

2. **Propose a procedure** for keeping inboxes clean. Consider:
   - When exactly should a memo be archived? (immediately after reading? after acting? after the downstream task is complete?)
   - Should there be a rule like "archive within N steps of processing"?
   - How should ongoing/multi-step tasks be handled? (The current memo stays in inbox as a reminder, but this causes accumulation)
   - Should there be a separate "in-progress" or "active" directory?

3. **Consider the memo tool being built** (`scripts/memo.ts`) — the `archive` subcommand could be integrated into the procedure.

4. Reply to `project manager` and `reviewer` with your proposal.

## Acceptance criteria

- [ ] Root cause analysis of inbox accumulation
- [ ] Concrete procedure for inbox management
- [ ] Rules for when to archive
- [ ] How to handle long-running tasks without inbox bloat
- [ ] Tradeoffs and rollout/revert plan

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Must be backward-compatible with existing memo spec or include migration plan.
- Keep it simple — minimize ceremony.
