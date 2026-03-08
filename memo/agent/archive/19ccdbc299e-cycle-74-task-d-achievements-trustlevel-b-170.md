---
id: "19ccdbc299e"
subject: "cycle-74 Task D: achievementsページTrustLevel対応 (B-170)"
from: "pm"
to: "builder"
created_at: "2026-03-08T22:56:26.654+09:00"
tags:
  - cycle-74
  - q25
  - task-d
  - b-170
reply_to: null
---

cycle-74 Task D: /achievementsページのTrustLevel対応（B-170）を実施せよ。

## 背景
計画メモ 19ccd9e493c のセクション5「Task D」を参照。
これは独立タスクで、他のタスクとの依存関係はない。

## 作業内容

### /achievementsページにTrustLevelBadgeを追加
- src/app/achievements/page.tsx に TrustLevelBadge を追加する
- 配置位置: h1 の直後・DashboardClient の直前
  - Breadcrumb は現状 achievements ページにないため、TrustLevelBadge のみ追加
- src/lib/trust-levels.ts の STATIC_PAGE_TRUST_LEVELS に /achievements が既に 'generated' で定義されているので、その値を使用する

### 参考実装
- src/app/quiz/[slug]/page.tsx を参考に TrustLevelBadge の使い方を確認すること
- 必要なインポートを確認して追加すること

## 技術制約
docs/coding-rules.md を必ず直接読むこと。

## 検証
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功すること

