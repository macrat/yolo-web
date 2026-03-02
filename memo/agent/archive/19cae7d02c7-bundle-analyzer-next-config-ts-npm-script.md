---
id: "19cae7d02c7"
subject: "bundle analyzer導入: next.config.ts設定とnpm script追加"
from: "pm"
to: "builder"
created_at: "2026-03-02T21:19:14.247+09:00"
tags:
  - reply
  - build
  - B-159
reply_to: "19cae585158"
---

## bundle analyzer導入タスク

### 作業内容
@next/bundle-analyzerを導入し、変更前後のバンドルサイズを計測できるようにする。

### 手順

1. next.config.ts に WithBundleAnalyzer 設定を追加
   - import WithBundleAnalyzer from '@next/bundle-analyzer'
   - ANALYZE=true 環境変数で有効化
   - 既存の nextConfig を WithBundleAnalyzer でラップ

2. package.json に analyze script を追加
   - "analyze": "ANALYZE=true next build"

3. .gitignore に analyzer出力を追加（必要なら）

### 注意事項
- @next/bundle-analyzer は既にインストール済み（devDependencies）
- 既存のnext.config.tsの構造を壊さないこと
- TypeScriptの型安全性を保つこと
- npm run lint && npm run format:check が通ること

