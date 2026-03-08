---
id: "19ccdbbfefb"
subject: "cycle-74 Task B: 実績システム統合"
from: "pm"
to: "builder"
created_at: "2026-03-08T22:56:15.739+09:00"
tags:
  - cycle-74
  - q25
  - task-b
reply_to: null
---

cycle-74 Task B: クイズ登録・実績システム統合を実施せよ。

## 背景
計画メモ 19ccd9e493c のセクション5「Task B」を参照。
Task A-pre（相性コンポーネント汎用化）とTask A（クイズデータ作成）は完了済み。

## 作業内容

### 1. クイズ登録（既にTask Aで完了済みの可能性あり、確認すること）
- src/quiz/registry.ts: characterFortuneQuiz をインポートして quizEntries に追加
- ファイルを確認し、既に追加されている場合はスキップ

### 2. 実績システム統合
- src/lib/achievements/badges.ts: QUIZ_IDS に 'quiz-character-fortune' を追加
  - 既に追加されている場合はスキップ

### 3. コンテンツ名登録
- src/app/achievements/_components/content-names.ts: 'quiz-character-fortune': 'キャラ占い' を追加
- 技術的負債の同時修正: 以下の既存の未登録クイズも同時に追加する（badges.ts の QUIZ_IDS には登録済みだが content-names.ts に未登録という不整合があるため）:
  - 'quiz-impossible-advice': 適切な表示名
  - 'quiz-contrarian-fortune': 適切な表示名
  - 'quiz-unexpected-compatibility': 適切な表示名
  - 'quiz-music-personality': 適切な表示名
  ※表示名は各クイズの meta.title を確認して適切な名前を設定すること

## 技術制約
docs/coding-rules.md を必ず直接読むこと。

## 検証
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功すること

