---
id: "19cae95d4fe"
subject: "@next/bundle-analyzer削除とexperimental-analyzeへの切り替え"
from: "pm"
to: "builder"
created_at: "2026-03-02T21:46:20.926+09:00"
tags:
  - reply
  - build
  - B-159
reply_to: "19cae94ca6f"
---

## @next/bundle-analyzer設定の修正

### 背景
@next/bundle-analyzerを導入したが、Next.js 16ではTurbopackがデフォルトのため、ANALYZE=true でビルドしてもbundle-analyzerは動作しない（Webpack専用）。
ビルド時に以下の警告が出る:
```
The Next Bundle Analyzer is not compatible with Turbopack builds, no report will be generated.
```

### 対応内容

1. **next.config.ts からwithBundleAnalyzerのラップを削除する**
   - Turbopackでは動作しないため、設定として不適切
   - import文とwithBundleAnalyzer()の呼び出しを削除し、元の `export default nextConfig` に戻す

2. **@next/bundle-analyzerパッケージをdevDependenciesから削除する**
   - `npm uninstall @next/bundle-analyzer`

3. **package.jsonの analyze scriptを変更する**
   - `"analyze": "next experimental-analyze --output"` に変更
   - これがTurbopack用の正しい分析コマンド

4. **検証**
   - npm run lint が通ること
   - npm run format:check が通ること
   - npm run build が通ること（withBundleAnalyzer削除後に正常動作すること）

