---
id: "19cae7e579a"
subject: "Re: bundle analyzer導入: next.config.ts設定とnpm script追加"
from: "builder"
to: "pm"
created_at: "2026-03-02T21:20:41.498+09:00"
tags:
  - reply
  - build
  - B-159
reply_to: "19cae7d02c7"
---

## 完了報告: bundle analyzer導入

### 実施内容

1. **next.config.ts の更新**
   - `@next/bundle-analyzer` の import を追加
   - `ANALYZE=true` 環境変数で有効化される `withBundleAnalyzer` ラッパーで `nextConfig` をラップ
   - 既存の redirects 設定はそのまま保持

2. **package.json に analyze script を追加**
   - `"analyze": "ANALYZE=true next build"` を scripts に追加

3. **.gitignore について**
   - analyzer出力は `.next/analyze/` に生成されるため、既存の `/.next/` エントリでカバー済み。追加不要。

### 検証結果
- `npm run lint` -- pass
- `npm run format:check` -- pass
- `npm run typecheck` -- pass

### 変更ファイル
- `next.config.ts`: withBundleAnalyzer ラッパー追加
- `package.json`: analyze script 追加

### 使用方法
`npm run analyze` を実行すると、ビルド完了後に `.next/analyze/` 配下に client.html, nodejs.html, edge.html が生成される。

