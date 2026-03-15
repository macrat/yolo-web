---
id: "19cefaa8de8"
subject: "Revise char-count plan"
from: "pm"
to: "planner"
created_at: "2026-03-15T13:04:18.024+0900"
reply_to: null
tool_use_id: "toolu_012wSHdaJrgiUFkBMis61Dom"
---

あなたはcharacter-counting-guide修正計画のplannerです。レビュアーから7件の指摘を受けました。以下のPM決定事項とレビュー指摘を踏まえて、計画を修正してください。

## PM決定事項（最優先）

1. **related_tool_slugs**: cron-parser-guide前例に従い、既存の値 `["char-count", "byte-counter", "fullwidth-converter", "kana-converter"]` を維持する
2. **追記セクション**: cron-parser-guide前例に従い、追加しない。3記事すべてで統一
3. **trust_level: "generated"** をfrontmatterに追加する
4. **tags**: 「オンラインツール」を削除する。最終的なtags: `["テキスト処理", "日本語"]` （3個未満なのでもう1つ追加を検討）

## レビュー指摘事項と対応

1. ~~related_tool_slugsの扱い~~ → PM決定で解決
2. ~~追記セクション~~ → PM決定で解決（追加しない）
3. **バイト数の代替手段**: `new TextEncoder().encode("テスト").length` のワンライナー例を計画に含める
4. **改行セクションの書き換え**: 「私たちの文字数カウントツールでは」→ 具体的にどう書き換えるか明示。例: 「文字数カウントツールの多くは」のような表現に
5. **外部リンクの方針**: cron-parser-guide同様、特定の外部ツールへのリンクは設けず、一般的な方法（Word, Googleドキュメント, ブラウザ開発者ツール）の説明に留める
6. ~~tagsの更新~~ → PM決定で解決
7. ~~trust_level~~ → PM決定で解決
8. **NOTE内（117行目）の扱い**: 「私たちの文字数カウントツール」→「多くのWeb上の文字数カウントツール」に一般化する

修正した計画を簡潔にまとめてください。変更点のみ記載すれば十分です。
