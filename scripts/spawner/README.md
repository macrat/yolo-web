# Spawner -- AI Agent Auto-Orchestration System

> **Status: Frozen** (2026-02-18)
> This system is currently frozen. See [Freeze History](#5-freeze-history) and [Restoration Steps](#6-restoration-steps) for details.

## 1. Overview

The spawner is an automated agent orchestration system that enables Claude Code agents to work continuously without user input. It serves two primary purposes:

1. **Continuous operation**: Agents keep working without waiting for user input between tasks.
2. **PM context savings**: The project manager does not need to manage other agents' lifecycles directly, preserving its context window for decision-making.

### Monitored Roles

The spawner monitors inbox directories for 6 roles (owner is excluded):

- `project-manager`
- `researcher`
- `planner`
- `builder`
- `reviewer`
- `process-engineer`

### How It Works

The spawner watches `memo/<role>/inbox/` directories using `fs.watch`. When a new `.md` file appears, it spawns the corresponding agent process by loading the role's prompt from `agents/prompt/<role>.md` and passing it to the spawn command (default: `claude -p`). The project manager is treated specially: it runs as a single instance and is started automatically when no other agents are running.

## 2. Architecture

### Source Files

| File                 | Responsibility                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`           | Main entry point. Exports `createSpawner()` which integrates the watcher and process manager, manages spawner state (`RUNNING` / `ENDING`), handles initial inbox scan, PM auto-restart on all-agents-stopped, and shutdown logic.                                                                                                                                               |
| `types.ts`           | Type definitions and constants: `MONITORED_ROLES`, `RETRY_INTERVALS_MS` (`[5000, 15000, 45000]`), `MAX_RETRIES` (3), `PM_CRASH_THRESHOLD_MS` (30000), `DEFAULT_MAX_CONCURRENT` (10), `DEBOUNCE_MS` (500). Interfaces: `AgentProcess`, `QueuedSpawn`, `MemoInfo`.                                                                                                                 |
| `watcher.ts`         | File system watcher using `fs.watch` on each role's inbox directory. Includes debouncing (500ms) to suppress duplicate events, memo frontmatter parsing for log output, inbox scanning functions (`scanInbox`, `scanAllInboxes`, `countActiveMemos`, `getMemoInfo`).                                                                                                             |
| `process-manager.ts` | Process spawning and lifecycle management. Handles concurrency limiting (queue when at max), PM single-instance enforcement, duplicate memo deduplication via `processedFiles` set, retry with exponential backoff (5s/15s/45s), PM crash detection (< 30s runtime triggers counter), and `SIGKILL` for force-kill. Sets `YOLO_AGENT` environment variable on spawned processes. |
| `prompt-loader.ts`   | Loads prompt templates from `agents/prompt/<role>.md` and replaces the `$INPUT_MEMO_FILES` placeholder with the triggering memo file path. PM receives `null` (no replacement).                                                                                                                                                                                                  |
| `logger.ts`          | Timestamped logging to both stdout and a log file in `agents/logs/`. Formats: general messages (`datetime message`), agent-scoped (`datetime [role] message`), memo detection (`datetime [from] -> [to] subject`). Log files are named `YYYYMMDD-HHmmss_spawner.log`.                                                                                                            |
| `__tests__/`         | Unit tests for each module: `spawner.test.ts`, `process-manager.test.ts`, `watcher.test.ts`, `prompt-loader.test.ts`, `logger.test.ts`, `types.test.ts`.                                                                                                                                                                                                                         |

## 3. Startup and Configuration

### Running

```bash
npm run spawner
```

This executes `tsx scripts/spawner/index.ts`.

### Environment Variables

| Variable                 | Default     | Description                                                                                                                                                                                                                                   |
| ------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SPAWNER_SPAWN_CMD`      | `claude -p` | The command used to spawn agents. The prompt string is appended as the last argument. The value is split by spaces: first token is the command, remaining tokens are base arguments. Example: `SPAWNER_SPAWN_CMD='echo'` for dry-run testing. |
| `SPAWNER_MAX_CONCURRENT` | `10`        | Maximum number of concurrent agent processes. Excess spawn requests are queued and processed FIFO as slots open.                                                                                                                              |

### Shutdown

- **Ctrl-C once**: Enters ending mode. No new agents are spawned; the spawner waits for all running agents to finish, then exits with code 0.
- **Ctrl-C 3 times within 1 second**: Force kills all running agent processes with `SIGKILL` and exits with code 1.

### Agent Logs

Agent stdout/stderr is written to `agents/logs/` (gitignored). Each agent process gets its own log file named `YYYYMMDD-HHmmss_<role>.log`.

## 4. Key Design Decisions

### NOTE-1: SPAWNER_SPAWN_CMD Parsing

The spawn command string is split by whitespace. The first token becomes the command; the rest become base arguments. The loaded prompt string is always appended as the final argument. This simple parsing does not support quoted arguments with spaces.

### NOTE-2: Watcher Starts Before Initial Scan

The file watcher is started **before** the initial inbox scan (`scanAllInboxes`). This prevents a race condition where a memo could arrive between the scan completing and the watcher starting, which would cause that memo to be missed entirely.

### NOTE-3: PM Receives Null Memo File

The project manager is always spawned with `memoFile: null`. The `$INPUT_MEMO_FILES` placeholder in its prompt is not replaced. This is because PM manages its own inbox and should read all pending memos, not just a specific one.

### EDGE-4: Active Memo Warning on Startup

When the spawner starts, it checks each monitored role's `active/` directory. If any role has memos in `active/`, a warning is logged. This alerts operators that previous work may not have been properly completed.

### EDGE-5: PM Crash Detection

If the project manager process exits within 30 seconds of starting (`PM_CRASH_THRESHOLD_MS`), it is counted as a crash. After 3 consecutive crashes (`MAX_RETRIES`), the spawner enters ending mode to prevent an infinite restart loop. The crash counter resets when PM runs for more than 30 seconds.

### Retry with Exponential Backoff

When an agent process fails to spawn (error event), it is retried up to 3 times with increasing delays: 5s, 15s, 45s. If all retries are exhausted, the spawner enters ending mode.

### YOLO_AGENT Environment Variable

Each spawned agent process receives the `YOLO_AGENT` environment variable set to its role name. This allows agents to identify themselves at runtime.

## 5. Freeze History

### Freeze Date

2026-02-18

### Reason

The cost of developing stability mechanisms for the spawner outweighed the benefits, given that:

1. **High development overhead**: Reliable process management, crash recovery, and inter-process coordination required significant ongoing engineering effort.
2. **Subagent mode was stable enough**: Claude Code's built-in subagent (Task tool) mode provided sufficient multi-agent capability with less complexity.
3. **Agent teams feature**: Anthropic's upcoming agent teams functionality would likely supersede custom orchestration.

### Incident: B-031 Cancellation Failure

The key incident that highlighted the spawner's limitations was the B-031 batch cancellation failure. Because spawner-managed agents run as independent OS processes with no inter-process communication channel, the project manager could not cancel in-progress work when priorities changed. Additionally, when the PM process restarted, it lost all context about what had been delegated, leading to duplicate work.

### Related Memos

- `19c6fe62d1c` -- Owner freeze directive
- `19c6fd2a261` -- Incident analysis (B-031 cancellation failure)

## 6. Restoration Steps

To restore the spawner system to operational status:

1. **Source code**: The spawner source code in `scripts/spawner/` is preserved and requires no changes.

2. **Create prompt directory and files**:

   ```bash
   mkdir -p agents/prompt
   ```

   Copy prompt files from `.claude/agents/` (or restore from git history) into `agents/prompt/`. Each role needs a `<role>.md` file (e.g., `project-manager.md`, `builder.md`, etc.). The prompt files must contain the `$INPUT_MEMO_FILES` placeholder where the triggering memo path should be injected.

3. **Add spawner script to package.json**:

   ```json
   {
     "scripts": {
       "spawner": "tsx scripts/spawner/index.ts"
     }
   }
   ```

4. **Restore CLAUDE.md spawner section**: Refer to git commit `58b34b4` (or nearby) for the original Spawner section content in CLAUDE.md. The section documents startup commands, environment variables, shutdown behavior, and agent prompt locations.

5. **Workflow documentation**: No spawner-specific additions to `docs/workflow.md` are needed. The memo routing system is shared infrastructure and remains in place.

6. **Run tests to verify**:
   ```bash
   npx vitest run scripts/spawner/__tests__/
   ```
   All spawner tests should pass without modification since the source code is preserved.
