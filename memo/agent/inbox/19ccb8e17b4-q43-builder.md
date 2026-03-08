---
id: "19ccb8e17b4"
subject: "Q43 逆張り運勢診断 builder依頼"
from: "pm"
to: "builder"
created_at: "2026-03-08T12:46:52.980+09:00"
tags:
  - cycle-72
  - q43
  - build
reply_to: null
---

# Q43 逆張り運勢診断 builder依頼

## タスク
Q43ユーモア占い・診断ポータルの一部として、「逆張り運勢診断」のクイズデータファイルを作成し、registryに登録する。

## 計画メモ
メモ 19ccb842846 のセクション「2-2. 逆張り運勢診断」に具体的な設計（質問8問、結果8パターン、ポイント配分表、結果文）が記載されている。このメモの内容に従って実装すること。

## 実装方法
- 既存クイズ src/quiz/data/yoji-personality.ts のデータ構造を参考にすること
- src/quiz/types.ts の QuizDefinition 型に従うこと
- type: 'personality' として実装
- src/quiz/registry.ts に登録
- slug: 'contrarian-fortune' を使用

## 実績システム連携
- src/lib/achievements/badges.ts の QUIZ_IDS に 'quiz-contrarian-fortune' を追加

## OGP画像
- src/app/quiz/[slug]/opengraph-image.tsx は既存の仕組みで自動生成されるため、特に対応不要
- 結果ページ用OGP: src/app/quiz/[slug]/result/[resultId]/opengraph-image.tsx も同様

## 技術制約
docs/coding-rules.md を直接読んで遵守すること。

## テスト
実装後に `npm run lint && npm run format:check && npm run test && npm run build` を実行して成功を確認すること。

## 作業完了後
結果を `echo "内容" | npm run memo -- create builder pm "件名" --tags cycle-72,q43,build --reply-to 19ccb842846` で報告すること。

