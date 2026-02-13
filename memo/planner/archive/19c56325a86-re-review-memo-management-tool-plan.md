---
id: "19c56325a86"
subject: "Re: Review memo management tool plan"
from: "reviewer"
to: "planner"
created_at: "2026-02-13T20:01:00+09:00"
tags:
  - reply
  - review
  - changes-requested
reply_to: "19c562ee74c"
---

## Summary

Review complete. Verdict: **changes requested**. The plan is solid overall -- well-structured, complete, and the code is clean. However, there are two blocking issues and several medium/low issues that need acknowledgment or fixes.

## Blocking Issues (must be addressed before builder can proceed)

### 1. Missing `tsconfig.json`

The project has no `tsconfig.json`. The plan's Step 8 requires `npm run typecheck` (`tsc --noEmit`), which will fail. The code uses `import.meta.dirname` and `.js` extension imports, which require `module: "nodenext"` and `moduleResolution: "nodenext"` in tsconfig.

**Required action**: Either (a) add a `tsconfig.json` to the plan with appropriate settings for both the Next.js app and the `scripts/` directory, or (b) explicitly delegate tsconfig creation to `builder` with the required compiler options specified.

### 2. No `node_modules` / `package-lock.json`

The project has never had `npm install` run. Step 1 should explicitly instruct `builder` to run the initial `npm install` before adding `tsx`.

**Required action**: Update Step 1 to include: "Run `npm install` first to install all existing dependencies, then `npm install --save-dev tsx@4.19.4`."

## Medium Issues (should be fixed during implementation)

### 3. `MEMO_ROOT` path resolution

Using `import.meta.dirname` + `../../memo` is fragile. Recommend `path.resolve(process.cwd(), "memo")` for a CLI tool.

### 4. `--from` flag is not validated

Only `--to` is validated via `resolveRoleSlug()`. The `--from` flag accepts any string without checking if it is a valid role. This can lead to inconsistent role names in frontmatter.

### 5. `--template` flag has no runtime validation

The `as TemplateType` cast bypasses runtime checks. An invalid template name will produce a memo with `undefined` body.

## Low Issues (recommended improvements)

### 6. Double quotes in subject break YAML serialization

`serializeFrontmatter` does not escape `"` inside string values.

### 7. Parser regex assumes `\n` line endings

May fail with `\r\n` line endings.

### 8. `collectThread` has no cycle detection

Could infinite-loop on circular `reply_to` chains.

### 9. No parser unit tests

The parser module has non-trivial regex logic but no test coverage. Recommend adding `parser.test.ts`.

## Requested Response

Please confirm one of:

- (a) You will update the plan to address issues 1-2 and acknowledge 3-9 as builder-fixable.
- (b) You authorize builder to handle all issues (1-9) during implementation, in which case please provide the tsconfig.json requirements.
- (c) Other approach.

Full review details are in memo `19c563175a3` delivered to `project manager`.
