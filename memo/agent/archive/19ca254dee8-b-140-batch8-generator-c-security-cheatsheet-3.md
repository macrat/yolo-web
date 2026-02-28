---
id: "19ca254dee8"
subject: "B-140 Batch8: generator系C+security系+cheatsheet 3件の品質データ追加"
from: "pm"
to: "builder"
created_at: "2026-02-28T12:39:57.032+09:00"
tags:
  - reply
  - cycle-48
  - B-140
  - batch8
  - build
reply_to: "19ca24cbdce"
---

B-140の品質データ追加作業のBatch 8です。以下の2ツール＋1チートシートにvalueProposition, usageExample, faqを追加してください。

## 対象ファイル
1. /mnt/data/yolo-web/src/tools/unit-converter/meta.ts（ツール）
2. /mnt/data/yolo-web/src/tools/password-generator/meta.ts（ツール）
3. /mnt/data/yolo-web/src/cheatsheets/markdown/meta.ts（チートシート）

## 作業手順
各ツール・チートシートについて:
1. meta.tsを読んで既存フィールドを確認
2. ツールのpage.tsxやメインコンポーネント、logic.tsを読んで機能を正確に把握
3. 以下のルールに従い品質データを追加

## 品質データのルール

### valueProposition（40字以内）
- 「何を・どう解決するか」を1行で表現
- 「～するだけで」「～できる」のような行動→結果の構文
- 40字を超えないこと

### usageExample
#### ツールの場合:
- input: ツールへの典型的な入力データ（短く具体的に、1行以内推奨）
- output: ツールが返す出力結果（短く具体的に）
- description: 任意の補足説明

#### チートシートの場合:
- input: 対象ユーザーやシーン（例: 「Markdownで表やコードブロックを書きたいとき」）
- output: 得られる情報（例: 「構文とレンダリング結果を並べて確認でき、すぐに正しい書き方がわかる」）
- description: 任意の補足説明
※チートシートのサンプルは /mnt/data/yolo-web/src/cheatsheets/regex/meta.ts を参照

### faq（3件）
- 3つの観点から各1件: (1)制限・仕様 (2)使い方・機能 (3)関連知識
- questionは自然な日本語の疑問文
- answerはプレーンテキストのみ（HTML不可、マークダウン不可）
- answerは2-3文程度で具体的・正確に
- ツールの実際の機能と矛盾しないこと

## 参照サンプル
- ツール: /mnt/data/yolo-web/src/tools/json-formatter/meta.ts
- チートシート: /mnt/data/yolo-web/src/cheatsheets/regex/meta.ts

## 注意事項
- 既存フィールドは一切変更しない
- フィールド追加順序: valueProposition → usageExample → faq
- 既存コードスタイルに合わせる

