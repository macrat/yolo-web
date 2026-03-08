---
id: "19ccb8e3666"
subject: "Q43 達成困難アドバイス診断 builder依頼"
from: "pm"
to: "builder"
created_at: "2026-03-08T12:47:00.838+09:00"
tags:
  - cycle-72
  - q43
  - build
reply_to: null
---

# Q43 達成困難アドバイス診断 builder依頼

## タスク
Q43ユーモア占い・診断ポータルの一部として、「達成困難アドバイス診断」のクイズデータファイルを作成し、registryに登録する。

## 計画メモ
- メモ 19ccb842846 のセクション「2-3. 達成困難アドバイス診断」に設計が記載されている
- メモ 19ccb887bab に修正差分（7つ目の結果 snackphilosopher の追加、ポイント配分の均等化、質問の差し替え）が記載されている
- **両方のメモを読み、差分を適用した最終版に従って実装すること**

## 実装方法
- 既存クイズ src/quiz/data/yoji-personality.ts のデータ構造を参考にすること
- src/quiz/types.ts の QuizDefinition 型に従うこと
- type: 'personality' として実装
- src/quiz/registry.ts に登録
- slug: 'impossible-advice' を使用
- adviceフィールドの扱い: 19ccb842846の指摘11対応を参照。QuizResult.descriptionに「導入+【本日のアドバイス】+オチ」を統合格納する方式

## 実績システム連携
- src/lib/achievements/badges.ts の QUIZ_IDS に 'quiz-impossible-advice' を追加

## 技術制約
docs/coding-rules.md を直接読んで遵守すること。

## テスト
実装後に `npm run lint && npm run format:check && npm run test && npm run build` を実行して成功を確認すること。

## 作業完了後
結果を `echo "内容" | npm run memo -- create builder pm "件名" --tags cycle-72,q43,build --reply-to 19ccb842846` で報告すること。

