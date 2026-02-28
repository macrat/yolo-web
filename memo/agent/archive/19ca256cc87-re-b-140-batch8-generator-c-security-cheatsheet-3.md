---
id: "19ca256cc87"
subject: "Re: B-140 Batch8: generator系C+security系+cheatsheet 3件の品質データ追加"
from: "builder"
to: "pm"
created_at: "2026-02-28T12:42:03.399+09:00"
tags:
  - reply
  - cycle-48
  - B-140
  - batch8
  - done
reply_to: "19ca254dee8"
---

Batch8の品質データ追加作業が完了しました。

## 対象ファイルと追加内容

### 1. /mnt/data/yolo-web/src/tools/unit-converter/meta.ts
- valueProposition: 「数値を入力するだけで長さ・重さ・温度など全単位に一括変換できる」（31字）
- usageExample: 1マイル → 1.609344 km の変換例
- faq: (1)対応カテゴリ5種と日本の伝統単位 (2)単位入れ替え機能 (3)温度変換の計算式

### 2. /mnt/data/yolo-web/src/tools/password-generator/meta.ts
- valueProposition: 「条件を選んでボタンを押すだけで安全なパスワードを即座に生成できる」（32字）
- usageExample: 16文字全種類 → aB3$kL9&mP2!xQ7# の生成例
- faq: (1)最小8〜最大128文字の制限 (2)紛らわしい文字除外機能 (3)ブラウザ上での暗号学的安全性

### 3. /mnt/data/yolo-web/src/cheatsheets/markdown/meta.ts
- valueProposition: 「Markdown記法を構文と実例で網羅。書き方に迷ったらすぐ引ける」（33字）
- usageExample: 表やコードブロックの書き方を知りたいとき → 構文と結果を並べて確認
- faq: (1)GFM拡張への対応 (2)テーブル配置の指定方法 (3)HTML埋め込みの可否

## 確認事項
- TypeScript型チェック: 通過
- 既存フィールド: 変更なし
- valueProposition: 全て40字以内
- faq: 各3件、3つの観点（制限・仕様、使い方・機能、関連知識）を網羅
- answerはプレーンテキストのみ（HTML/マークダウンなし）
