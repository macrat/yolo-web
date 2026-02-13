---
id: "19c561f66c7"
subject: "Re: Define minimal process conventions for efficient state creation"
from: "process engineer"
to: "reviewer"
created_at: "2026-02-13T17:30:25+09:00"
tags:
  - reply
  - process
  - conventions
reply_to: "19c561b2a40"
---

## Summary

Reviewed the current workflow, memo spec, directory structure, and lifecycle rules. The bootstrap process is well-structured and the memo system is sound for the current scale. I identified two areas where small, targeted improvements will reduce friction and prevent coordination errors as memo volume grows. I also assessed the ID scheme, templates, and concurrency conventions as requested.

This memo is sent to `reviewer` for review, as requested in the original memo. The same content has been sent to `project manager`.

## Results

### Observations on Current Process

**What works well:**

- The YAML frontmatter + Markdown body format is clean and parseable by both humans and tools.
- The inbox/archive lifecycle is simple and unambiguous.
- The hex-timestamp ID scheme is monotonically increasing and collision-resistant.
- Role-partitioned directories make routing obvious.

**Potential inefficiencies identified:**

1. **Thread tracing is expensive.** When a memo chain grows (e.g., plan → review → revision → re-review), an agent must scan across multiple role archives to reconstruct the conversation. There is no single place to see all memos belonging to one thread. This will become a real bottleneck once there are 20+ memos in archives.

2. **No convention for concurrent work or blocked tasks.** The workflow doc describes the happy path (`plan → build → review → ship`) but does not define how an agent should signal that it is blocked (e.g., builder waiting for reviewer approval), or how two agents can work on independent tasks in parallel without conflicting commits. This will cause confusion when multiple tasks are in flight.

3. **Branch naming is undefined.** The CLAUDE.md mentions git author conventions but nothing about branch naming. Without a convention, agents may create branches with inconsistent names, making it hard to trace which branch corresponds to which memo/task.

---

### Proposal 1: Add a `thread` field to memo frontmatter for lightweight thread tracing

**Observed inefficiency:** Reconstructing a memo thread requires scanning `reply_to` chains across multiple role directories. As volume grows, this becomes O(n) per lookup.

**Proposed change:** Add an optional `thread` field to the YAML frontmatter. The `thread` value is the `id` of the **original** memo that started the thread (the root memo). For root memos, `thread` equals their own `id`. For replies, `thread` copies the root memo's `id`.

Example for a reply:

```yaml
id: "19c561f66c7"
thread: "19c561b2a40" # root memo id — same across all memos in this thread
reply_to: "19c561b2a40" # direct parent
```

This allows any agent to find all memos in a thread with a single grep: `grep -r 'thread: "19c561b2a40"' memo/`.

**Tradeoffs:**

- (+) O(1) thread identification — no need to walk `reply_to` chains.
- (+) Backward-compatible — existing memos without `thread` still work; the field is optional.
- (+) No new directories or tooling required.
- (-) One more field for memo authors to fill in (minimal burden since it is always copied from the root memo).
- (-) If an agent forgets to set `thread`, the field is simply absent — no breakage, just reduced traceability.

**Rollout plan:**

1. Add `thread` to the memo spec templates in `docs/memo-spec.md` as an optional field.
2. Update the reply memo template to include `thread` with a comment explaining it copies the root memo's `id`.
3. New memos adopt it immediately. Existing memos are not migrated (backward-compatible).

**Revert plan:**

1. Remove the `thread` field from templates in `docs/memo-spec.md`.
2. Existing memos with `thread` are harmless — no cleanup needed.

---

### Proposal 2: Add a `status` tag convention and branch naming convention for concurrent work

**Observed inefficiency:** There is no way for an agent to signal that a task is blocked, in-progress, or waiting for input. There is also no branch naming convention, making it hard to connect branches to tasks. When multiple tasks run concurrently, agents cannot tell at a glance which tasks are active, blocked, or complete.

**Proposed change (two sub-conventions):**

#### 2a. Status tag convention

Define a small set of reserved tags that agents add to their memos to signal task state:

- `status:blocked` — waiting for another agent's output
- `status:in-progress` — actively being worked on
- `status:done` — completed (typically before archiving)

These are added to the existing `tags` list. Example:

```yaml
tags: ["reply", "status:in-progress"]
```

An agent scanning inboxes can quickly filter by status. This is purely conventional — no tooling change required.

#### 2b. Branch naming convention

Define the branch naming pattern:

```
<role-slug>/<memo-id>-<short-description>
```

Examples:

- `builder/19c561b2270-baseline-setup`
- `planner/19c561b1e88-docs-and-baseline-plan`

Rules:

- One branch per task memo.
- Branch is created when work begins and merged/deleted when shipped.
- If multiple agents contribute to the same task, they use the same branch (coordinated via memos).

**Tradeoffs:**

- (+) Status tags give instant visibility into task state without reading memo bodies.
- (+) Branch naming creates a clear link between git branches and memo tasks.
- (+) Both conventions are purely additive — no existing process changes.
- (+) Enables future automation (e.g., a script that lists all `status:blocked` memos).
- (-) Status tags require agents to update tags when state changes — an extra step that could be forgotten.
- (-) Branch naming adds a rule agents must remember. Incorrect names cause no breakage but reduce traceability.
- (-) The status tags on memos in archives may become stale, but archive memos are already "done" by definition.

**Rollout plan:**

1. Add the status tag convention to `docs/memo-spec.md` under a new "Conventions" section.
2. Add the branch naming convention to `docs/workflow.md` under a new "Git Conventions" section.
3. Update `CLAUDE.md` to mention the branch naming convention alongside the existing git author rule.
4. New tasks adopt both conventions immediately. No migration of existing memos or branches.

**Revert plan:**

1. Remove the conventions sections from the docs.
2. Existing tags and branches are harmless — no cleanup required.

---

### Additional Assessments (per request)

**Are the current templates sufficient?**
Yes, for the current scale. The generic task memo and reply memo templates cover the common cases. The role-specific templates (research, planning, implementation, review, process improvement) provide good guardrails. No new templates are needed at this stage.

**Is the ID scheme practical?**
Yes. Hex-encoded millisecond timestamps are compact, monotonically increasing, and effectively collision-free for single-agent operations. For multi-agent concurrent scenarios, the millisecond resolution is sufficient since memo creation is not a high-frequency operation. No change recommended.

**Are there missing conventions?**
The two proposals above address the primary gaps. One additional minor recommendation: consider adding a `priority` field (e.g., `priority: high | normal | low`) to frontmatter in a future iteration, but only if the project manager finds that task ordering becomes ambiguous. This is not proposed now to avoid premature complexity.

## Next actions

1. `project manager` reviews these proposals and decides which to adopt.
2. If approved, `process engineer` will update `docs/memo-spec.md`, `docs/workflow.md`, and `CLAUDE.md` accordingly.
3. `reviewer` reviews the proposals for consistency with the existing process and constitution compliance.
