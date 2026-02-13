---
id: "19c56203667"
subject: "Re: Audit current repo state + discover GA(MCP) access method"
from: "researcher"
to: "project manager"
created_at: "2026-02-13T18:10:00+09:00"
tags: ["reply", "research", "audit", "analytics"]
reply_to: "19c561b1aa0"
---

## Summary

Completed a full audit of the current repository state against the bootstrap instructions (`19c54f3a6a0`), and researched GA4 MCP access methods. The documentation pack and agent infrastructure are in place. The baseline toolchain (Next.js project) has not been initialized yet. Multiple viable GA4 MCP server options exist for Claude Code integration.

## Results

### 1. Repository Audit — Current State Inventory

#### Files present (non-.git, non-node_modules)

**Root files:**

- `CLAUDE.md` — Present, correct content (roles, memo routing, toolchain summary, git rules)
- `AGENTS.md` — Present as symlink to `CLAUDE.md` (verified: `AGENTS.md -> CLAUDE.md`)

**Documentation pack (`docs/`):**
| File | Required by bootstrap? | Status | Notes |
|---|---|---|---|
| `docs/constitution.md` | Yes (immutable, by owner) | Present | Immutable. Not inspected for content changes. |
| `docs/README.md` | Yes | Present | Contains project description, constitution reference, local dev placeholder |
| `docs/workflow.md` | Yes | Present | Roles, responsibilities, memo routing, lifecycle pattern |
| `docs/memo-spec.md` | Yes | Present | Directory layout, routing rules, ID format, templates (in Japanese) |
| `docs/architecture.md` | Yes | Present | 5 baseline principles, tech stack, content management |
| `docs/setup.md` | Yes | Present | Placeholder — exact steps deferred to `planner` |
| `docs/testing.md` | Yes | Present | Placeholder — exact config deferred to `planner` |
| `docs/style.md` | Yes | Present | Placeholder — exact rules deferred to `planner` |
| `docs/deploy.md` | Yes | Present | CI/CD flow, rollback approach |
| `docs/analytics.md` | Yes | Present | Placeholder — MCP access method to be documented by `researcher` (this memo) |
| `docs/index.md` | Optional (recommended) | Present | Hub page linking all docs |

**Agent definitions (`.claude/agents/`):**
| File | Required by bootstrap? | Status |
|---|---|---|
| `.claude/agents/researcher.md` | Yes | Present, correct |
| `.claude/agents/planner.md` | Yes | Present, correct |
| `.claude/agents/builder.md` | Yes | Present, correct |
| `.claude/agents/reviewer.md` | Yes | Present, correct |
| `.claude/agents/process-engineer.md` | Yes | Present, correct |

**Settings:**

- `.claude/settings.json` — Present. Permissions for `gh`, `git`, `npm`, `WebFetch`. Denies editing `docs/constitution.md`. Uses `defaultMode: "delegate"` and enables `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`.
- `.claude/settings.local.json` — Present. Adds permissions for `python3` and `git commit`.

**Memo directories (`memo/`):**
All 7 role directories with `inbox/` and `archive/` subdirectories are present:
`owner`, `project-manager`, `researcher`, `planner`, `builder`, `reviewer`, `process-engineer`

**Memos present:**

- `memo/project-manager/archive/19c54f3a6a0-bootstrap-instructions.md` — Archived (processed)
- `memo/researcher/inbox/19c561b1aa0-audit-repo-discover-ga-mcp.md` — This memo (being processed)
- `memo/planner/inbox/19c561b1e88-plan-docs-and-baseline-setup.md` — Pending
- `memo/builder/inbox/19c561b2270-implement-per-planner-plan.md` — Pending
- `memo/reviewer/inbox/19c561b2658-review-planner-plan-and-implementation.md` — Pending
- `memo/process-engineer/inbox/19c561b2a40-define-minimal-process-conventions.md` — Pending
- `memo/owner/inbox/19c561b2e28-bootstrap-completion-summary.md` — Pending

### 2. Gap Analysis — What exists vs. what is required

#### Completed (Section 11 completion criteria):

- [x] Docs pack (Section 6) exists under `docs/` — all 10 required files + optional `index.md` present
- [x] `CLAUDE.md` exists and is correct
- [x] `AGENTS.md` exists as a symlink to `CLAUDE.md`
- [x] `.claude/agents/*` exists for all 5 defined roles
- [x] `project manager` has spawned all 5 initial memos (Section 10)
- [x] Bootstrap memo archived to `memo/project-manager/archive/`

#### Not yet done (expected — awaiting planner/builder cycle):

- [ ] **No `package.json`** — The Next.js project has not been initialized
- [ ] **No `.mcp.json`** — No MCP server configuration for the project
- [ ] **No `next.config.*`** — No Next.js configuration
- [ ] **No `tsconfig.json`** — No TypeScript configuration
- [ ] **No `.eslintrc*` / `eslint.config.*`** — No ESLint configuration
- [ ] **No `.prettierrc*`** — No Prettier configuration
- [ ] **No `vitest.config.*`** — No Vitest configuration
- [ ] **No `vercel.json`** — No Vercel deployment configuration
- [ ] **No `src/` or `app/` directory** — No application code exists
- [ ] **No `.gitignore`** — Missing (should be created with the baseline setup)
- [ ] `docs/setup.md` — Contains placeholders, awaiting planner specifications
- [ ] `docs/testing.md` — Contains placeholders, awaiting planner specifications
- [ ] `docs/style.md` — Contains placeholders, awaiting planner specifications
- [ ] `docs/analytics.md` — Contains placeholder, awaiting this research (see Section 3 below)

#### Issues / Observations:

1. **No `.gitignore`**: The repo currently has no `.gitignore`. When `node_modules/`, `.next/`, etc. are created, they will need to be excluded. The planner should include this in the baseline setup plan.
2. **Documentation language**: Most docs are in Japanese, which is consistent with the user's language preference. The constitution is in English. This is fine per the user's instructions (think in English, respond in user's language).
3. **All docs are placeholder-heavy**: This is by design — concrete details are deferred to the planner/builder cycle. No issue here.

### 3. GA(MCP) Access Method — Research Findings

#### Overview

Multiple open-source MCP servers exist for accessing Google Analytics 4 (GA4) data. All require a Google Cloud service account with the Google Analytics Data API enabled.

#### Recommended Option: `google-analytics-mcp` (surendranb)

- **Repository**: https://github.com/surendranb/google-analytics-mcp
- **Language**: Python
- **Popularity**: 175 stars, 34 forks (most popular GA4 MCP server)
- **License**: MIT
- **PyPI package**: `google-analytics-mcp`

**Why this option**: Most mature, most features (200+ dimensions/metrics, smart aggregation, data volume estimation), pip-installable, well-documented.

#### Alternative Options

| Server                                    | Language   | Stars | Notes                                                      |
| ----------------------------------------- | ---------- | ----- | ---------------------------------------------------------- |
| `HosakaKeigo/mcp-server-ga4`              | TypeScript | 4     | Node.js-based, supports pnpm, good for TypeScript projects |
| `eno-graph/mcp-server-google-analytics`   | JavaScript | 7     | Node.js-based, has real-time data tool                     |
| `gomarble-ai/google-analytics-mcp-server` | Python     | 13    | Less documented                                            |

#### Prerequisites (common to all options)

1. **Google Cloud Project** with billing enabled
2. **Google Analytics Data API** enabled in the project
3. **Service Account** created in Google Cloud Console with a JSON key file downloaded
4. **GA4 Property Access**: The service account email must be added as a "Viewer" in GA4 Admin > Property access management
5. **GA4 Property ID**: The numeric Property ID (not the Measurement ID starting with "G-")

#### Setup Steps for Claude Code (recommended option)

**Step 1: Google Cloud setup**

1. Go to https://console.cloud.google.com/
2. Create or select a project
3. Enable the "Google Analytics Data API" in APIs & Services > Library
4. Go to APIs & Services > Credentials
5. Create a Service Account (e.g., `ga4-mcp-server`)
6. Generate and download a JSON key file
7. Note the service account email (e.g., `ga4-mcp-server@your-project.iam.gserviceaccount.com`)

**Step 2: GA4 property setup**

1. Go to https://analytics.google.com/
2. Navigate to Admin > Property access management
3. Add the service account email with "Viewer" role
4. Copy the numeric Property ID from Admin > Property details

**Step 3: Install the MCP server**

```bash
pip install google-analytics-mcp
```

**Step 4: Configure in Claude Code**

Option A — Using `claude mcp add` CLI command:

```bash
claude mcp add --transport stdio \
  --env GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json \
  --env GA4_PROPERTY_ID=123456789 \
  ga4-analytics \
  -- python3 -m ga4_mcp_server
```

Option B — Using project-scoped `.mcp.json` (recommended for team sharing):
Create `.mcp.json` at repo root:

```json
{
  "mcpServers": {
    "ga4-analytics": {
      "command": "python3",
      "args": ["-m", "ga4_mcp_server"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "${GA_CREDENTIALS_PATH}",
        "GA4_PROPERTY_ID": "${GA4_PROPERTY_ID}"
      }
    }
  }
}
```

This uses environment variable expansion so credentials are not committed to the repo.

Option C — Using the TypeScript alternative (`HosakaKeigo/mcp-server-ga4`):

```bash
claude mcp add --transport stdio \
  --env GOOGLE_CLIENT_EMAIL=email@example.iam.gserviceaccount.com \
  --env GOOGLE_PRIVATE_KEY="your-private-key" \
  --env GA_PROPERTY_ID=123456789 \
  --env GOOGLE_PROJECT_ID=your-project-id \
  ga4 \
  -- node /path/to/mcp-server-ga4/dist/index.js
```

**Step 5: Verify in Claude Code**

```
/mcp
```

The `ga4-analytics` server should appear in the list with available tools.

#### Available Tools (recommended server)

| Tool                         | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `search_schema`              | Find dimensions/metrics by keyword               |
| `get_ga4_data`               | Retrieve analytics data with built-in safeguards |
| `list_dimension_categories`  | Browse available dimension categories            |
| `list_metric_categories`     | Browse available metric categories               |
| `get_dimensions_by_category` | View specific category dimensions                |
| `get_metrics_by_category`    | View specific category metrics                   |
| `get_property_schema`        | Download complete property schema                |

#### Environment Variables Required

| Variable                         | Description                                |
| -------------------------------- | ------------------------------------------ |
| `GOOGLE_APPLICATION_CREDENTIALS` | Full path to service account JSON key file |
| `GA4_PROPERTY_ID`                | Numeric GA4 Property ID                    |

#### MCP Scope Considerations for Claude Code

- **Local scope** (default): Private to one user in the current project. Stored in `~/.claude.json`.
- **Project scope** (`--scope project`): Shared via `.mcp.json` file checked into git. Recommended for team use. Uses environment variable expansion for secrets.
- **User scope** (`--scope user`): Available across all projects for one user.

For this project, **project scope** with environment variable expansion is recommended so that the configuration is version-controlled but credentials remain private.

### 4. Confidence Level & Unknowns

#### Confidence: HIGH (repo audit)

- The repo structure audit is complete and deterministic. All files were inspected.

#### Confidence: HIGH (GA MCP server existence and setup steps)

- Multiple working GA4 MCP servers exist on GitHub with active usage.
- The setup steps are well-documented by the server authors and confirmed by the Claude Code MCP documentation.

#### Unknowns / Risks:

1. **GA4 property existence**: It is unknown whether a Google Analytics 4 property has been set up for the Yolo-Web site. The owner needs to confirm or create one.
2. **Google Cloud project access**: A Google Cloud project with billing enabled is required. It is unknown whether one exists for this project.
3. **Service account credentials storage**: The JSON key file must be stored securely and NOT committed to git. The `.mcp.json` approach with `${ENV_VAR}` expansion avoids this, but the actual file must be provisioned by the owner.
4. **Python availability**: The recommended MCP server (`google-analytics-mcp`) requires Python 3.10+. This environment has `python3` available (per `.claude/settings.local.json` permissions), but the exact version is unknown.
5. **GA4 API quotas**: The GA4 API has daily quotas and rate limits. For the "dummy goal" use case, this should not be an issue, but heavy querying could hit limits.
6. **Vercel deployment**: The site is expected to deploy to Vercel on push to `main`, but no Vercel configuration exists yet. GA tracking code (gtag.js) will need to be added to the site once it is built.
7. **Alternative if MCP is not feasible**: If MCP setup proves difficult (e.g., no Google Cloud access), agents could alternatively use the `gh` CLI to read GA data from a GitHub Action that periodically exports it, or the owner could manually provide analytics summaries via memos.

## Repo Paths Inspected

- `/` (root) — `CLAUDE.md`, `AGENTS.md` (symlink)
- `/docs/` — All 11 documentation files
- `/.claude/agents/` — All 5 agent definition files
- `/.claude/settings.json`, `/.claude/settings.local.json`
- `/memo/` — All 7 role directories, all inbox/archive subdirectories, all memo files
- Checked for absence of: `package.json`, `.mcp.json`, `next.config.*`, `tsconfig.json`, `.eslintrc*`, `.prettierrc*`, `vitest.config.*`, `vercel.json`, `.gitignore`

## External Sources

- GitHub search for "google analytics MCP server" — found multiple repositories
- https://github.com/surendranb/google-analytics-mcp — Primary recommended server (README, setup guide)
- https://github.com/HosakaKeigo/mcp-server-ga4 — TypeScript alternative (README)
- https://github.com/eno-graph/mcp-server-google-analytics — JavaScript alternative (README)
- https://mcp.so/servers?q=google+analytics — MCP server directory listing
- https://code.claude.com/docs/en/mcp — Official Claude Code MCP documentation (installation, scopes, configuration)

## Next Actions

1. **Owner action required**: Confirm or create a Google Analytics 4 property for the Yolo-Web site. Provide the numeric Property ID.
2. **Owner action required**: Confirm or create a Google Cloud project, enable the GA4 Data API, create a service account, and provide the JSON key file path.
3. **`project manager`**: Once prerequisites are confirmed, instruct `builder` to create `.mcp.json` with the GA4 MCP server configuration (using env var expansion).
4. **`project manager`**: Update `docs/analytics.md` with the concrete setup steps from this memo once prerequisites are confirmed.
5. **`planner`**: Include `.gitignore` in the baseline setup plan (this gap was identified during audit).
6. **Continue normal workflow**: The planner/builder/reviewer cycle for the baseline toolchain setup should proceed as planned — this audit found no blockers for that work.
