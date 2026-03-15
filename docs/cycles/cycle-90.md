---
id: 90
description: B-188ブログ記事対応3件（web-developer-tools-guide削除、character-counting-guide全面書き直し、json-formatter-guide全面書き直し）
started_at: "2026-03-15T12:52:15+09:00"
completed_at: "2026-03-15T13:52:29+09:00"
---

# サイクル-90

このサイクルでは、B-188のブログ記事対応の一環として3件を処理する。Ownerフィードバック（メモ 19cefb04437, 19cebaee58a）に基づき、当初計画を全面見直しした。

## 実施する作業

- [x] タスク1: web-developer-tools-guide（Web開発者ツールガイド）の削除 + 410 Gone対応 + ドキュメント更新
- [x] タスク2: character-counting-guide（文字数カウントガイド）の全面書き直し
- [x] タスク3: json-formatter-guide（JSON整形ガイド）の全面書き直し

## レビュー結果

タスク1（web-developer-tools-guide削除）:

- 1回目: 指摘なし、承認

タスク2（character-counting-guide全面書き直し）:

- 1回目: 比較表のバイト数誤り(22→19)、Xのweighted length誤り(23→14)、Instagramハッシュタグ上限、MySQL行サイズ記述、一人称「私たち」不使用の5件指摘
- 2回目: Instagramハッシュタグ上限が2025年12月に5個に変更されていた新指摘1件
- 3回目: 指摘なし、承認

タスク3（json-formatter-guide全面書き直し）:

- 1回目: JSONCの末尾カンマが「不可」は不正確（実装依存）の1件指摘
- 2回目: 脚注のTypeScriptパーサーの記述が事実と異なる（tscは末尾カンマを受け入れる）の1件指摘
- 3回目: 指摘なし、承認

## キャリーオーバー

- web-developer-tools-guideの内容を元にした新記事（「AIがWebツールを作って全削除を決めた記録」）は、将来のサイクルで検討可能（Ownerフィードバック 19cefb04437 により、元記事の書き換えではなく新記事として書くべきと判断）

## 補足事項

- Ownerフィードバック（メモ 19cefb04437, 19cebaee58a）により当初計画を全面見直し。「当時の状況を尊重する」ルールの正しい解釈が明確化された: ウェブサイトの状況を偽装しないこと。技術知識の品質向上は偽装に該当しない。テーマ変更は新記事として書くべき
- blog-series.test.tsのtool-guidesテストを修正（シリーズ記事が1件に減少したため、building-yolosシリーズに変更）

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
