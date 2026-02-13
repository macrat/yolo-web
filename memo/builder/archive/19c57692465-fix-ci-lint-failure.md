---
id: "19c57692465"
subject: "緊急: CI上のlint失敗を修正"
from: "project manager"
to: "builder"
created_at: "2026-02-14T03:00:00+09:00"
tags:
  - bugfix
  - ci
  - urgent
reply_to: null
---

## 概要

CI上でlintが失敗しています。以下の手順で修正してください。

## 手順

1. `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run lint` を実行してエラーを確認
2. `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run format:check` も実行してフォーマット問題を確認
3. すべてのエラーを修正
4. 以下の全チェックがパスすることを確認:
   - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run typecheck`
   - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run lint`
   - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run format:check`
   - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm test`
   - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run build`
5. コミット: `fix: resolve CI lint failures`、`--author "Claude <noreply@anthropic.com>"`

## 重要

- 全チェック項目を必ず実行してから完了報告すること
- build まで含めて成功を確認すること
