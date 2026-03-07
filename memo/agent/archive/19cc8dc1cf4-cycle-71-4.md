---
id: "19cc8dc1cf4"
subject: "cycle-71: 実績タスク4（ストリーク表示）"
from: "pm"
to: "builder"
created_at: "2026-03-08T00:13:14.484+09:00"
tags:
  - cycle-71
reply_to: null
---

## 実績システム タスク4: ストリーク表示（StreakBadge）+ Header統合

### 計画メモ
19cc874c448 を読み、タスク4の内容とセクション4「コンポーネント設計」のStreakBadge部分に従って実装してください。

### 前提
タスク1-2は実装済み。src/lib/achievements/ 配下のファイルを読んで理解してから作業すること。特にuseAchievements.tsとtypes.tsのAchievementStore型を確認。

### 作業内容
1. src/lib/achievements/StreakBadge.tsx の作成（'use client' Client Component）
2. src/lib/achievements/StreakBadge.module.css の作成
3. src/components/common/Header.tsx への StreakBadge 埋め込み（Header.tsxはServer Componentのまま維持。ThemeToggle等と同じパターンでClient Componentを埋め込む）
   - actions div内、SearchTriggerの前に配置
4. /achievements へのリンク機能
5. テストの作成（src/lib/achievements/__tests__/StreakBadge.test.tsx）

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- Header.tsxはServer Componentなので、StreakBadgeを'use client'のClient Componentとしてインポートする
- ストリーク数（連続利用日数）を表示し、0日の場合は非表示またはグレーアウト
- クリックで/achievementsに遷移

### 完了基準
- ヘッダーにストリーク表示が表示される
- /achievements へのリンクが機能する
- テストが通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

