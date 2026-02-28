---
id: "19ca24cbdce"
subject: "Re: B-140実施計画: 全ツール・全チートシートへの品質データ埋め込み"
from: "planner"
to: "pm"
created_at: "2026-02-28T12:31:04.270+09:00"
tags:
  - reply
  - cycle-48
  - B-140
  - planning
reply_to: "19ca24b273a"
---

# B-140 実施計画: 全ツール・全チートシートへの品質データ埋め込み

## 概要

30ツール + 1チートシート（markdown）の計31件に対して、valueProposition・usageExample・faqの3フィールドを追加する。既存の実装パターン（json-formatter, char-count, regex, git）に合わせ、品質と一貫性を保ちながらバッチ処理で進める。

---

## 1. バッチ分割（8バッチ）

カテゴリの関連性と作業粒度を考慮し、1バッチ3-5件で以下のように分割する。各バッチは独立したbuilderエージェント1回分の作業単位とする。

### Batch 1: text系 (4件)
- business-email
- text-diff
- text-replace
- fullwidth-converter

### Batch 2: text系 + encoding系 (4件)
- kana-converter
- keigo-reference
- byte-counter
- html-entity

### Batch 3: encoding系 + security系 (4件)
- base64
- url-encode
- image-base64
- hash-generator

### Batch 4: developer系 A (4件)
- regex-tester
- cron-parser
- sql-formatter
- yaml-formatter

### Batch 5: developer系 B (4件)
- markdown-preview
- csv-converter
- color-converter
- number-base-converter

### Batch 6: developer系 C + generator系 A (4件)
- unix-timestamp
- date-calculator
- email-validator
- age-calculator

### Batch 7: generator系 B (4件)
- bmi-calculator
- dummy-text
- image-resizer
- qr-code

### Batch 8: generator系 C + security系 + cheatsheet (3件)
- unit-converter
- password-generator
- markdown (チートシート)

---

## 2. 品質データの内容方針

### 2.1 valueProposition（40字以内推奨）

**方針:** 「誰が・何を・どう解決するか」を1行で表現する。

**守るべきルール:**
- 主語は省略してよい（ユーザーが主語であることが自明な場合）
- ツールの最も代表的な機能を中心に書く（全機能を列挙しない）
- 「～するだけで」「～できる」のような行動->結果の構文にする
- 40字を超えないこと（超える場合は表現を簡潔にする）
- 既存サンプルのトーンに合わせる

**既存サンプルの分析（参考パターン）:**
- json-formatter: 「コピペするだけでJSONの整形・圧縮・エラー検出ができる」(27字)
- char-count: 「テキストをペーストするだけで文字数・バイト数・行数を即座に確認」(31字)
- regex: 「正規表現パターンをすぐ引き出せる。実例付きで意味がわかる」(28字)
- git: 「よく使うGitコマンドを用途別に整理。コマンドをすぐ見つけられる」(31字)

### 2.2 usageExample（入力→出力のサンプル）

**ツールの場合:**
- input: そのツールに実際に入力する典型的なデータ（短く具体的に）
- output: ツールが返す実際の出力結果（短く具体的に）
- description: 任意。入出力だけでは意図が伝わらない場合に補足する

**チートシートの場合（markdownチートシートに適用）:**
- input: 対象ユーザーやシーン（例: 「Markdownで表やコードブロックを書きたいとき」）
- output: 得られる情報（例: 「構文とレンダリング結果を並べて確認でき、すぐに正しい書き方がわかる」）
- description: 任意

**守るべきルール:**
- inputとoutputは実際にそのツールで動作する具体的な値にする（架空のデータで構わないが、リアリティのあるもの）
- inputは短いもの（1行以内が望ましい）にする。長すぎる入力はツールの使い方がわかりにくくなる
- outputもコンパクトにまとめる（改行を含む場合は\nで表現）
- そのツールの最も基本的・代表的なユースケースを選ぶ

### 2.3 faq（Q&A 3件）

**方針:** ユーザーが実際に疑問に思いそうなことに答える。SEO（将来のFAQPage JSON-LD化）も意識する。

**FAQ作成の3つの観点（各ツールから3件選ぶ）:**
1. **制限・仕様に関する質問**: そのツールの技術的な制限や対応範囲について（例: 「大きなファイルも処理できますか？」）
2. **使い方・機能に関する質問**: ツールの具体的な使い方や機能の詳細について（例: 「インデント幅は変更できますか？」）
3. **関連知識に関する質問**: ツールが扱うテーマに関する一般的な疑問（例: 「ひらがな1文字は何バイトですか？」）

**守るべきルール:**
- questionは自然な日本語の疑問文にする（「～ですか？」「～できますか？」）
- answerはプレーンテキストのみ（HTML不可、マークダウン不可）
- answerは具体的で正確な情報を含める（曖昧な回答は避ける）
- answerは2-3文程度で簡潔にまとめる
- そのツールの機能を実際に理解した上で書くこと（ツールのコンポーネントコードを参照する）
- 各ツールのdescriptionやshortDescriptionと矛盾しないこと

---

## 3. 品質の一貫性を保つためのルール

### 3.1 builderエージェントへの指示に含めること

各バッチのbuilderエージェントには、以下の情報を必ず提供する:

1. **参照サンプル**: json-formatter/meta.ts（ツール）またはregex/meta.ts（チートシート）の完全な実装例
2. **対象ツールのmeta.tsファイルパス一覧**: 各ツールのmeta.tsの絶対パス
3. **品質データの方針**: 上記2節の方針をそのまま転記
4. **ツールの機能確認指示**: 品質データを書く前に、対象ツールのコンポーネントコード（page.tsxやメインコンポーネント）を読んで機能を正確に把握すること
5. **valuePropositionの文字数チェック指示**: 40字以内であることを確認すること

### 3.2 バッチ間の一貫性

- Batch 1の完成後にレビューを実施し、品質基準を確立する
- レビューで指摘された改善点は、Batch 2以降の指示に反映する
- 全バッチ完了後に最終レビューを行い、全体の一貫性を確認する

### 3.3 コーディング規約

- 既存のmeta.tsファイルのフォーマット（インデント、クォート、末尾カンマ等）に合わせる
- import文やexportは変更しない
- 既存のフィールド（slug, name, description等）は一切変更しない
- 追加するフィールドは、既存フィールドの後に、valueProposition -> usageExample -> faqの順で追加する

---

## 4. 作業フロー

### フェーズ1: Batch 1実施 + レビュー（品質基準確立）
1. builderエージェントにBatch 1（4件）を実施させる
2. reviewerエージェントにレビューを依頼する
3. レビュー結果を反映し、品質基準を確定する

### フェーズ2: Batch 2-8を並列実施 + 各バッチレビュー
1. Batch 1のレビュー結果を踏まえた指示でBatch 2-8を実施する
2. 並列度はリソース状況に応じて調整する（2-3バッチ並列を推奨）
3. 各バッチ完了後にレビューを実施する

### フェーズ3: 最終確認
1. 全バッチ完了後、全31件の品質データが正しく追加されていることを確認する
2. ビルドが通ることを確認する（npm run build）
3. 品質データの表示がレイアウト上で正しく表示されることを目視確認する（dev serverでいくつかのツールページを確認）

---

## 5. レビュー方法

### 各バッチのレビュー観点
1. **valuePropositionが40字以内か**: 文字数を確認
2. **valuePropositionがツールの本質を表現しているか**: ツールの主要機能と一致しているか
3. **usageExampleが具体的で正確か**: 実際のツール動作と一致する入出力か
4. **faqが3件あるか**: 各ツール3件のFAQが作成されているか
5. **faqの内容が正確か**: 技術的に正確で、ツールの実際の機能と矛盾しないか
6. **faqのanswerがプレーンテキストか**: HTMLやマークダウンが含まれていないか
7. **フォーマットの一貫性**: 既存サンプルとコードスタイルが合っているか
8. **既存フィールドが変更されていないか**: slug, name, description等が変わっていないこと

### 最終レビュー観点
- 全31件にvalueProposition, usageExample, faqが設定されているか（gitチートシートのようにusageExampleを省略するパターンは原則使わない。markdownチートシートではusageExampleも必ず設定する）
- 全体を通してトーンや品質に大きなばらつきがないか
- ビルドエラーがないか

---

## 6. 完了基準

以下をすべて満たすことでB-140を完了とする:

1. 30ツール全てのmeta.tsにvalueProposition, usageExample, faqが追加されている
2. markdownチートシートのmeta.tsにvalueProposition, usageExample, faqが追加されている
3. 全てのvaluePropositionが40字以内である
4. 全てのfaqが3件ずつ設定されている
5. 全てのfaqのanswerがプレーンテキストである
6. 既存の4件（json-formatter, char-count, regex, git）の品質データに変更がない
7. npm run buildがエラーなく完了する
8. 全バッチのレビューが完了し、指摘事項が解消されている

---

## 7. 工数見積もり

- 1バッチあたり: builder作業15-20分 + reviewer作業5-10分 = 約20-30分
- Batch 1（品質基準確立）: 約30-40分
- Batch 2-8（7バッチ、並列実施）: 並列度3で約60-90分
- 最終確認: 約15分
- **合計見積もり: 約2-2.5時間**（逐次実行の場合は約4-5時間）


