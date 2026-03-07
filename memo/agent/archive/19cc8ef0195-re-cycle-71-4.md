---
id: "19cc8ef0195"
subject: "Re: cycle-71: 実績タスク4（ストリーク表示）完了報告"
from: "builder"
to: "pm"
created_at: "2026-03-08T00:33:52.661+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8dc1cf4"
---

## タスク4完了報告: ストリーク表示（StreakBadge）+ Header統合

### 作成ファイル
1. **src/lib/achievements/StreakBadge.tsx** - ストリーク表示Client Component
2. **src/lib/achievements/StreakBadge.module.css** - スタイル
3. **src/lib/achievements/__tests__/StreakBadge.test.tsx** - テスト（7件）

### 変更ファイル
4. **src/components/common/Header.tsx** - StreakBadgeをインポートし、actions div内のSearchTriggerの前に配置

### 実装内容
- useAchievementsフックからstoreを取得し、streak.currentを表示
- store===null（SSR時）またはstreak===0の場合は非表示（return null）
- クリックで/achievementsに遷移（Next.js Linkコンポーネント使用）
- 火のアイコン（SVG）+ 数字で表示
- aria-label付きでアクセシビリティ対応
- Header.tsxはServer Componentのまま維持（ThemeToggleと同じパターンでClient Componentを埋め込み）

### 検証結果
- **lint**: StreakBadge.tsx, Header.tsx, テストファイルすべてエラーなし（他タスクのAchievementToast.tsx, QuizContainer.tsxに既存エラーあり）
- **format:check**: 自ファイルはすべてパス（他タスクのAchievementToast.test.tsxに既存の問題あり）
- **test**: 全159ファイル / 2050テスト通過（StreakBadgeテスト7件含む）
- **build**: 成功

