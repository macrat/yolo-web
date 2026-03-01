# Security: Permission System and Constitution Protection

## Overview

This document describes the security architecture for the yolos.net project, focusing on how the constitution (the project's highest-priority rule set) is protected and how agent permissions are managed.

## Design Principles

1. **Multi-layer defense**: No single mechanism is relied upon for critical protections. Hooks, deny rules, and permission scoping work together.
2. **Least privilege**: Each agent is granted only the permissions necessary for its role.
3. **Hooks over deny rules**: PreToolUse hooks are the primary protection mechanism because they work even when `bypassPermissions` is enabled. Deny rules serve as a secondary defense layer.
4. **Fail-safe defaults**: When in doubt, block the operation. False positives are preferable to security gaps for critical files.

## Constitution Protection

`docs/constitution.md` is the project's most important file. It defines the rules that all agents must follow. Unauthorized modification would compromise the entire project's integrity.

### Protection Layers

#### Layer 1: PreToolUse Hooks (Primary)

Hooks execute before any tool use and work regardless of `bypassPermissions` settings.

| Hook Script                    | Matcher       | Purpose                                                                                                                                                 |
| ------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protect-constitution.sh`      | `Edit\|Write` | Blocks Edit/Write tool operations on constitution.md                                                                                                    |
| `protect-constitution-bash.sh` | `Bash`        | Blocks Bash write commands (cp, mv, sed -i, tee, redirects, etc.) targeting constitution.md while allowing read-only operations (cat, grep, diff, etc.) |

**How hooks work:**

- The hook reads tool input from stdin (JSON format)
- It checks `tool_input.file_path` (for Edit/Write) or `tool_input.command` (for Bash)
- If constitution.md is targeted for modification, the hook exits with code 2 and outputs a block message to stderr
- Exit code 2 signals Claude Code to reject the tool use

#### Layer 2: Deny Rules (Secondary)

In `settings.json`, the following deny rules provide additional protection:

- `Edit(/docs/constitution.md)` - Blocks Edit tool
- `Write(/docs/constitution.md)` - Blocks Write tool

**Known limitation**: Deny rules have known bugs in some Claude Code versions (GitHub Issues #8961, #6631) and do not apply when `bypassPermissions` is enabled. This is why hooks are the primary protection.

### Limitations

- Indirect writes via scripting languages (e.g., a Python script that opens and writes to constitution.md) cannot be fully blocked by Bash hooks without overly broad restrictions
- This is considered an acceptable trade-off: the multi-layer defense makes accidental or routine modification impossible, while truly determined circumvention would require unusual and conspicuous commands

## Agent Permissions

### Permission Model

| Agent      | permissionMode    | Reason                                                    |
| ---------- | ----------------- | --------------------------------------------------------- |
| builder    | bypassPermissions | Needs Edit/Write/Bash frequently for implementation tasks |
| researcher | (default)         | Read-only tools; bypassPermissions is unnecessary         |
| planner    | (default)         | Planning tasks do not require elevated permissions        |
| reviewer   | (default)         | Review tasks do not require elevated permissions          |

### Deny Rules for Agents

The following agent types are denied to prevent uncontrolled sub-agent spawning:

- `Agent(Explore)` - Blocks the Explore agent
- `Agent(Plan)` - Blocks the Plan agent
- `Agent(general-purpose)` - Blocks the general-purpose agent

These ensure that only project-defined agents (builder, researcher, planner, reviewer) are used.

### Allow Rules

The following tool uses are allowed project-wide (via `settings.json`):

- `Bash` - Shell commands (protected by multiple PreToolUse hooks)
- `Edit(/docs/backlog.md)` - Backlog management
- `Edit(/docs/cycle/*.md)` - Cycle documentation
- `WebFetch` - Web page fetching
- `WebSearch` - Web search

## Other Hooks

| Hook Script                | Matcher | Purpose                                                                                       |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `pre-commit-check.sh`      | `Bash`  | Runs format, lint, and test checks before git commit                                          |
| `pre-push-check.sh`        | `Bash`  | Runs format, lint, test, and build checks before git push                                     |
| `block-destructive-git.sh` | `Bash`  | Blocks destructive git commands (reset --hard, clean -f, etc.) when uncommitted changes exist |

## Modifying This System

When changing permission settings:

1. Always update this document to reflect the changes
2. Test all protection layers after modification
3. Ensure hooks are executable (`chmod +x`)
4. Validate `settings.json` JSON syntax after editing
5. Remember that deny rules do not apply to agents with `bypassPermissions` -- use hooks for critical protections
