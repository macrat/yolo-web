---
id: "19cc8dbef80"
subject: "cycle-71: 実績タスク3（バッジ通知UI）"
from: "pm"
to: "builder"
created_at: "2026-03-08T00:13:02.848+09:00"
tags:
  - cycle-71
reply_to: null
---

## 実績システム タスク3: バッジ通知UI（AchievementToast）

### 計画メモ
19cc874c448 を読み、タスク3の内容とセクション4「コンポーネント設計」のAchievementToast部分に従って実装してください。

### 前提
タスク1-2は実装済み。src/lib/achievements/ 配下のファイル（特にAchievementProvider.tsx, useAchievements.ts, types.ts）を読んで理解してから作業すること。

### 作業内容
1. src/lib/achievements/AchievementToast.tsx の作成（'use client' Client Component）
2. src/lib/achievements/AchievementToast.module.css の作成
3. AchievementProviderまたはlayout.tsx にAchievementToastを組み込む
4. テストの作成（src/lib/achievements/__tests__/AchievementToast.test.tsx）

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- useAchievementsフックのnewlyUnlockedとdismissNotificationsを活用すること
- バッジ解除時にトースト通知が表示され、一定時間後またはユーザー操作で消える動作
- アニメーションはCSS transitionで実装
- アクセシビリティ: aria-live=polite 等

### 完了基準
- バッジ解除時にトースト通知が表示される
- テストが通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

