---
name: cycle-kickoff
description: "新しいサイクルを開始する際のチェックリスト。Pre-flight確認、owner報告、research/plan依頼を段階的に実行する。"
disable-model-invocation: true
---

# Cycle Kickoff Checklist

This checklist is used when starting a new cycle (new feature, redesign, or new content). It does NOT apply to minor fixes such as bug fixes or addressing reviewer notes.

## Pre-flight

- [ ] Confirm previous cycle is complete (shipped, or carry-over items explicitly recorded in backlog)
- [ ] Check owner inbox for unprocessed directives:
  ```bash
  npm run memo -- list --to owner --state inbox
  ```
- [ ] Visually check other roles' inboxes for stale memos that should not be sitting there. If stale memos are found, send a notification memo to the relevant role.
- [ ] Check CodeQL alerts:

  ```bash
  gh api --method GET '/repos/macrat/yolo-web/code-scanning/alerts?state=open'
  ```

  - Critical/High: Immediately add to backlog Active and prioritize
  - Medium: Add to backlog Queued
  - Low: Add to backlog Deferred

- [ ] Check Dependabot PRs:

  ```bash
  gh pr list --author 'app/dependabot'
  ```

  - Patch updates (CI passing): Merge after reviewer confirmation
  - Minor updates: Merge after reviewer checks CHANGELOG
  - Major updates: Handle through normal build/review flow

- [ ] Review `docs/backlog.md` and check Active/Queued/Deferred items
- [ ] Update status of items to be worked on this cycle to in-progress

## Step 1: Owner Report

- [ ] Send cycle start report memo to owner (include cycle number, direction, and previous cycle summary):
  ```bash
  npm run memo -- create project-manager owner "サイクルN開始報告" --tags report
  ```

## Step 2: Research (parallelizable)

- [ ] Send research request memo to researcher (create in researcher/inbox/):
  ```bash
  npm run memo -- create project-manager researcher "調査依頼: <topic>" --tags request,research
  ```
- [ ] Research request must include: questions to answer, scope of research, whether external sources are needed
- [ ] Receive and review researcher's response

## Step 3: Plan (parallelizable -- can send to planner in parallel for independent themes)

- [ ] Send plan request memo to planner (create in planner/inbox/):
  ```bash
  npm run memo -- create project-manager planner "計画依頼: <topic>" --tags request,plan
  ```
- [ ] Plan request must reference the researcher's findings memo ID
- [ ] Receive and review planner's plan

## Step 4: Review Plan

- [ ] Send plan review request memo to reviewer (create in reviewer/inbox/):
  ```bash
  npm run memo -- create project-manager reviewer "計画レビュー依頼: <topic>" --tags request,review
  ```
- [ ] Receive reviewer's approval (APPROVED / APPROVED_WITH_NOTES)

## Step 5: Build (parallelizable -- when work areas do not overlap)

- [ ] Send implementation memo to builder based on the approved plan (create in builder/inbox/):
  ```bash
  npm run memo -- create project-manager builder "実装依頼: <topic>" --tags request,implementation
  ```
- [ ] Implementation memo must conform to the implementation memo template in `docs/memo-spec.md`
- [ ] Must reference the approved plan's memo ID
- [ ] If blog article creation criteria apply, include blog article creation in the acceptance criteria

## Step 6: Review Implementation

- [ ] After receiving builder's completion report, send review request memo to reviewer
- [ ] Receive reviewer's approval

## Step 7: Ship

- [ ] Merge to main and push
- [ ] If blog article creation criteria apply to this cycle, confirm blog articles are included
- [ ] Send cycle completion report memo to owner
- [ ] Move completed items in `docs/backlog.md` to Done section (PM edits directly)
- [ ] If there are carry-over items, move them to Deferred with documented reasons

## Prohibitions (always in effect)

- PM must NOT directly modify code or files (exception: `docs/backlog.md` editing is allowed)
- PM must NOT give direct instructions to builder without going through memos (Task tool usage is prohibited)
- PM must NOT move or delete memos in other roles' inbox/active/ directories
- PM must NOT proceed to build phase without reviewer's approval
