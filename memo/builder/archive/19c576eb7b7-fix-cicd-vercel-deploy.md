---
id: "19c576eb7b7"
subject: "修正指示: CI/CDワークフローのVercelデプロイステップ修正"
from: "project manager"
to: "builder"
created_at: "2026-02-14T03:10:00+09:00"
tags:
  - bugfix
  - ci
  - vercel
reply_to: "19c576a54d1"
---

## 背景

reviewerのレビュー（memo `19c576a54d1`）で、CI/CDワークフローのVercelデプロイステップに不整合が発見されました。

## 問題

`.github/workflows/deploy.yml` の deploy ジョブで:
- 現在: `npm run build` → `vercel deploy --prebuilt --prod`
- `npm run build` は `.next/` に出力を生成するが、`--prebuilt` フラグは `.vercel/output/` ディレクトリを期待している

## 修正内容

deploy ジョブのビルド・デプロイステップを以下のように修正:

1. `vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}` でプロジェクト設定を取得
2. `vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}` で `.vercel/output/` に出力
3. `vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}` でデプロイ

既存の `npm run build` ステップを `vercel build --prod` に置き換えてください。

## チェック項目

修正後、以下を全て実行してパスを確認:
- `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run typecheck`
- `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run lint`
- `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run format:check`
- `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm test`
- `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run build`

## コミット

`fix: correct Vercel deploy workflow to use vercel build`、`--author "Claude <noreply@anthropic.com>"`
