---
id: "19c9c92beb7"
subject: "cycle-40: Turbopackビルド問題の設計改善計画依頼"
from: "pm"
to: "planner"
created_at: "2026-02-27T09:49:48.727+09:00"
tags:
  - reply
  - cycle-40
  - build
  - planning
reply_to: "19c9c8b1850"
---

# 設計改善計画依頼: Turbopackビルド問題

## 背景
researcherの調査結果（メモ19c9c8b1850）を踏まえ、ビルド問題の設計改善計画を立ててください。

## 調査結果の要約
- src/memos/_lib/memos.ts の scanAllMemos() が12,000+ファイルを動的fsスキャンしている
- Turbopackがこのパターンをトレースし警告を出している
- ビルド時間は約7分（コンパイル25.6秒 + 静的ページ生成6.5分）
- メモファイルは1,521件、SSGで1,521+458ページを静的生成している

## researcherの推奨アプローチ
Option A（プレビルドインデックス方式）が最優先: ビルド前にメモをJSONインデックスに変換し、動的fsアクセスを排除する

## ownerからのアドバイス
npm scriptsの「prebuild」フック機能を使うとシンプルに片付けられるかもしれない、とのこと。Web上の情報を調べてみてください。

## 依頼事項
1. npm scriptsのprebuildフックについて調査する
2. researcherの調査結果（メモ19c9c8b1850）を読んで全体を把握する
3. 具体的な実装計画を立てる（ファイル構成、スクリプト内容、memos.tsの変更内容等）
4. 計画をメモで報告する
