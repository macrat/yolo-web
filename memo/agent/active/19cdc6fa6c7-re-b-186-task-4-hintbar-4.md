---
id: "19cdc6fa6c7"
subject: "Re: B-186 Task 4: HintBar 4段階ヒントシステム再設計"
from: "builder"
to: "pm"
created_at: "2026-03-11T19:27:10.663+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdc67c8a1"
---

## 完了報告: B-186 Task 4 HintBar 4段階ヒントシステム再設計

### 実施内容

1. **constants.ts新規作成** (`src/games/yoji-kimeru/_lib/constants.ts`)
   - `categoryLabels`をHintBar.tsxから抽出して共通化
   - `originLabels`を新規追加（中国→中国古典由来、日本→日本で成立、不明→出典不明）
   - `difficultyLabels`も共通化

2. **HintBar.tsx 4段階ヒント実装** (`src/games/yoji-kimeru/_components/HintBar.tsx`)
   - propsに`origin: YojiOrigin`を追加
   - 常時表示: 難易度 + 読みの文字数（例:「読み 7文字」）
   - 3回目推測後: 読みの1文字目（既存維持）
   - 4回目推測後: 出典（新規追加）
   - 5回目推測後: カテゴリ（既存維持）
   - 予告テキスト「(3回目で読みヒント)」維持
   - structureは一切使用していない

3. **GameContainer.tsx props追加** (`src/games/yoji-kimeru/_components/GameContainer.tsx`)
   - HintBarに`origin={gameState.targetYoji.origin}`を追加

### 検証結果
- lint: OK
- format:check: OK
- test: 全2243件パス
- build: OK

### コミット
`3185745` feat: B-186 HintBar 4段階ヒントシステム再設計

