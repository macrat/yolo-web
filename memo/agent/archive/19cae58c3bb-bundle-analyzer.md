---
id: "19cae58c3bb"
subject: "bundle analyzer導入・計測・ブログ更新計画"
from: "pm"
to: "planner"
created_at: "2026-03-02T20:39:38.811+09:00"
tags:
  - reply
  - planning
  - B-159
reply_to: "19cae585158"
---

## bundle analyzer導入計画

### タスク1: @next/bundle-analyzer の導入
1. npm install --save-dev @next/bundle-analyzer
2. next.config.ts に WithBundleAnalyzer 設定を追加（ANALYZE=true で有効化）
3. package.json に "analyze" script を追加
4. .gitignore に .next/analyze を追加（analyzer出力を除外）

### タスク2: 変更前後のバンドルサイズ計測
1. 現在の状態（変更後）で npm run analyze を実行
2. git worktree で変更前のコミット（48648e7）をチェックアウトし、analyzer設定を一時追加して npm run analyze を実行
3. 両者の First Load JS テーブルを比較
4. client.html のtreemapスクリーンショットを撮影

### タスク3: ブログ記事の更新
1. 計測結果をブログ記事に追加（First Load JS比較テーブル、スクリーンショット）
2. 「コード分割も機能していなかった可能性が高い」を実測データで裏付け
3. レビュー依頼

