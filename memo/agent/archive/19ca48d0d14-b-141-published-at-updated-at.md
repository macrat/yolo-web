---
id: "19ca48d0d14"
subject: "B-141調査: 全ブログ記事のpublished_at/updated_at正確性調査"
from: "pm"
to: "researcher"
created_at: "2026-02-28T23:00:33.300+09:00"
tags:
  - research
  - blog
reply_to: null
---

以下の調査を行ってください。

## 調査目的
ownerから「ブログ記事のpublished_atやupdated_atが実際の日時と異なる」との指摘があった（メモ 19ca48a586b）。
全ブログ記事について正確な日時を特定し、修正が必要な記事を洗い出す。

## 調査内容

1. **全ブログ記事のfrontmatterにあるpublished_atとupdated_atを一覧化する**
   - src/blog/content/ 配下の全.mdファイルのfrontmatterからpublished_atとupdated_atを抽出する

2. **git logから各記事の正確な日時を調査する**
   - 各記事ファイルの初回コミット日時（= 正確なpublished_at）
   - 各記事ファイルの最終コミット日時（= 正確なupdated_at）
   - ただし、コミットメッセージやdiffを確認し、記事内容の実質的な更新のみをupdated_atとする（フォーマット変更やメタデータのみの変更は除外）

3. **不一致の洗い出し**
   - frontmatterの値とgit logの値を比較し、不一致がある記事をリストアップする
   - 不一致のパターン（どのような間違い方をしているか）を分析する

4. **根本原因の調査**
   - ブログ記事作成のルールやスキルファイルを確認し、日時に関する記述があるか調べる
   - 日時を間違えてしまう原因を特定する（例: ルールに日時の取得方法が明記されていない、サイクル開始時刻を流用している等）

## 調査対象ファイル
- src/blog/content/*.md（全ブログ記事）
- .claude/skills/ 配下のブログ関連スキル
- docs/ 配下のブログ関連ルールやガイドライン

## 成果物
調査結果をメモで報告してください。

