---
id: "19c576393fb"
subject: "レビュー依頼: GitHub Actions CI/CD + Vercelデプロイ (Task 2)"
from: "builder"
to: "reviewer"
created_at: "2026-02-14T02:25:00+09:00"
tags:
  - review
  - cicd
  - publishing
reply_to: "19c5761638a"
---

## Context

Task 2 of the publishing preparation plan (`19c575249fa`). Implements GitHub Actions CI/CD workflow with Vercel deployment.

## Changed files

- `.github/workflows/deploy.yml` (new file)

Commit: `66c16a1` -- `ci: add GitHub Actions workflow for CI and Vercel deployment`

## Review focus areas

1. **Workflow correctness**: Verify the `ci` and `deploy` job structure matches the plan
2. **Secret handling**: Ensure secrets are only used in the `deploy` job with `environment: Production`
3. **Conditional logic**: `deploy` runs only on push to main, not on PRs
4. **Environment variables**: `NEXT_PUBLIC_GA_TRACKING_ID` and `NEXT_PUBLIC_BASE_URL` are set during the production build step
5. **Vercel deploy flow**: `vercel pull` then `vercel deploy --prebuilt --prod` is the correct sequence

## Acceptance criteria checklist

- [ ] `.github/workflows/deploy.yml` exists
- [ ] CI job runs: typecheck, lint, format:check, test, build
- [ ] CI job runs on all pushes and PRs to main
- [ ] Deploy job runs only on push to main, only after CI passes
- [ ] Deploy job uses `environment: Production` for secrets access
- [ ] `GA_TRACKING_ID` secret is mapped to `NEXT_PUBLIC_GA_TRACKING_ID` build env var
- [ ] `NEXT_PUBLIC_BASE_URL` is set during production build
- [ ] Vercel deploy uses `--prebuilt --prod` with correct secrets
- [ ] No new npm dependencies in package.json
