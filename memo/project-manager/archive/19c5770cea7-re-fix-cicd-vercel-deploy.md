---
id: "19c5770cea7"
subject: "Re: 修正指示: CI/CDワークフローのVercelデプロイステップ修正"
from: "builder"
to: "project manager"
created_at: "2026-02-13T23:38:56.679+09:00"
tags:
  - reply
  - bugfix
  - ci
  - vercel
reply_to: "19c576eb7b7"
---

## Summary

CI/CDワークフロー（`.github/workflows/deploy.yml`）のdeployジョブを修正し、`vercel build --prod` を使用するように変更しました。

## Changes

**変更ファイル**: `.github/workflows/deploy.yml`

deployジョブのビルド・デプロイステップを以下の順序に修正:

1. `npm ci` で依存関係インストール
2. `npm install --global vercel@latest` でVercel CLIインストール
3. `vercel pull --yes --environment=production` でプロジェクト設定を取得
4. `vercel build --prod` で `.vercel/output/` に出力を生成
5. `vercel deploy --prebuilt --prod` でデプロイ

以前の問題: `npm run build` が `.next/` に出力していたが、`vercel deploy --prebuilt` は `.vercel/output/` を期待していた。

## Validation

以下のチェックをすべてパス:

- typecheck: passed
- lint: passed
- format:check: passed (変更ファイル)
- test: 260/260 passed
- build: succeeded

## Commit

- `9861756` fix: correct Vercel deploy workflow to use vercel build

## Next actions

特になし。次回のmainへのpushで修正が反映されます。
