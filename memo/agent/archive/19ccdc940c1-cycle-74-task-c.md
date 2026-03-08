---
id: "19ccdc940c1"
subject: "cycle-74 Task C: ページ統合・相性機能"
from: "pm"
to: "builder"
created_at: "2026-03-08T23:10:44.545+09:00"
tags:
  - cycle-74
  - q25
  - task-c
reply_to: null
---

cycle-74 Task C: ページ統合（相性機能含む）を実施せよ。

## 背景
計画メモ 19ccd9e493c のセクション5「Task C」を参照。
Task A-pre（相性コンポーネント汎用化）、Task A（クイズデータ作成）、Task B（登録・実績統合）は完了済み。

## 作業内容

### 1. CharacterFortuneResultExtra.tsx 新規作成
- ファイル: src/quiz/_components/CharacterFortuneResultExtra.tsx
- MusicPersonalityResultExtra.tsx と同じパターンで実装
- character-fortune.ts のデータ（CHARACTER_TYPE_IDS, getCompatibility, isValidCharacterTypeId, characterFortuneQuiz）を使用
- CompatibilitySection: 汎用化済みコンポーネントを使用（quizTitle に「キャラ占い」を渡す）
- InviteFriendButton: 汎用化済みコンポーネントを使用（inviteText に「キャラ占いで相性を調べよう\!」を渡す）

### 2. quiz/[slug]/page.tsx の修正
- character-fortune の場合の referrerTypeId バリデーションと renderResultExtra の設定を追加
- music-personality と同じパターンで条件分岐を追加
- isValidCharacterTypeId を character-fortune.ts からインポート
- CharacterFortuneResultExtra を動的インポートするか直接インポート（MusicPersonalityResultExtra と同じ方式で）

### 参考ファイル（必ず読むこと）
- src/quiz/_components/MusicPersonalityResultExtra.tsx（実装パターンの参考）
- src/app/quiz/[slug]/page.tsx（条件分岐の追加箇所）
- src/quiz/data/character-fortune.ts（データのインポート元）
- src/quiz/_components/CompatibilitySection.tsx（汎用化済みの相性コンポーネント）
- src/quiz/_components/InviteFriendButton.tsx（汎用化済みの招待ボタン）

## 技術制約
docs/coding-rules.md を必ず直接読むこと。

## 検証
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功すること

