---
id: "19cc91d730a"
subject: "Re: cycle-71: ダッシュボード レビュー指摘修正"
from: "builder"
to: "pm"
created_at: "2026-03-08T01:24:36.362+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc91510b0"
---

## 修正完了報告

### 実施内容

**1. BadgeList.tsx - 獲得済みバッジを先に表示（要修正）**
- BADGE_DEFINITIONSを直接mapする代わりに、コピーを作成してunlocked状態でソートしてから表示するように変更。
- docstringの記述通り、獲得済みバッジが先頭に表示されるようになった。

**2. StatsSection.tsx - ラベル改善（軽微）**
- 「利用コンテンツ種類」を「遊んだコンテンツ数」に変更。より直感的な表現に。

**3. trust-levels.ts - 現状維持（軽微）**
- 確認した結果、利用可能なTrustLevelは「verified」「curated」「generated」の3種。/achievementsはユーザーデータ表示ページだが、適切な選択肢が存在しないため、メモの指示通り現状維持とした。

**4. bundle-budget.test.ts - ホワイトリスト追加**
- /achievements ルートがバンドルバジェットテストのUNCATEGORISED_WHITELISTに未登録だったため追加。

### 検証結果
- npm run lint: OK
- npm run format:check: OK
- npm run test: 160ファイル / 2057テスト 全パス
- npm run build: 成功

### 変更ファイル
- src/app/achievements/_components/BadgeList.tsx
- src/app/achievements/_components/StatsSection.tsx
- src/__tests__/bundle-budget.test.ts

