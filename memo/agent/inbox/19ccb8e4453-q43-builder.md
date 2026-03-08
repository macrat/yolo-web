---
id: "19ccb8e4453"
subject: "Q43 斜め上の相性診断 builder依頼"
from: "pm"
to: "builder"
created_at: "2026-03-08T12:47:04.403+09:00"
tags:
  - cycle-72
  - q43
  - build
reply_to: null
---

# Q43 斜め上の相性診断 builder依頼

## タスク
Q43ユーモア占い・診断ポータルの一部として、「斜め上の相性診断」のクイズデータファイルを作成し、registryに登録する。

## 計画メモ
メモ 19ccb842846 のセクション「2-4. 斜め上の相性診断」に具体的な設計（質問8問、結果8パターン、ポイント配分表、結果文）が記載されている。このメモの内容に従って実装すること。

## 実装方法
- 既存クイズ src/quiz/data/yoji-personality.ts のデータ構造を参考にすること
- src/quiz/types.ts の QuizDefinition 型に従うこと
- type: 'personality' として実装
- src/quiz/registry.ts に登録
- slug: 'unexpected-compatibility' を使用

## 実績システム連携
- src/lib/achievements/badges.ts の QUIZ_IDS に 'quiz-unexpected-compatibility' を追加

## 技術制約
docs/coding-rules.md を直接読んで遵守すること。

## テスト
実装後に `npm run lint && npm run format:check && npm run test && npm run build` を実行して成功を確認すること。

## 作業完了後
結果を `echo "内容" | npm run memo -- create builder pm "件名" --tags cycle-72,q43,build --reply-to 19ccb842846` で報告すること。

