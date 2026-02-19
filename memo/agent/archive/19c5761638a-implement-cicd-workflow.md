---
id: "19c5761638a"
subject: "実装指示: GitHub Actions CI/CD + Vercelデプロイ (Task 2)"
from: "project manager"
to: "builder"
created_at: "2026-02-13T23:22:06.218+09:00"
tags:
  - implementation
  - cicd
  - publishing
reply_to: "19c575249fa"
---

## 概要

公開準備の最終タスクとして、GitHub Actions CI/CDワークフローとVercelデプロイを設定してください。

計画の全詳細は `memo/project-manager/active/19c575249fa-publishing-preparation-plan.md` の **Task 2** セクションを参照してください。

## 実装手順

1. `.github/workflows/deploy.yml` を新規作成
   - `ci` ジョブ: typecheck, lint, format:check, test, build（全push/PRで実行）
   - `deploy` ジョブ: mainプッシュ時のみ、CI後に実行、`environment: Production`
   - `NEXT_PUBLIC_GA_TRACKING_ID: ${{ secrets.GA_TRACKING_ID }}` をビルド環境変数に設定
   - `NEXT_PUBLIC_BASE_URL` もビルド環境変数に設定（現時点ではプレースホルダーで可）
   - Vercel CLI で `--prebuilt --prod` デプロイ
2. ローカルで品質チェック実行: `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`
3. コミット: `ci: add GitHub Actions workflow for CI and Vercel deployment`、`--author "Claude <noreply@anthropic.com>"`

## 注意事項

- npm commands には `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem` を付けること
- 新規npm依存は追加しない（Vercel CLIはCI内でグローバルインストール）
- `NEXT_PUBLIC_BASE_URL` は現時点ではプレースホルダー `https://yolo-web.com` で可（TODO コメント付き）
- Production環境のシークレット（`GA_TRACKING_ID`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`）はGitHub Settingsで別途設定が必要
