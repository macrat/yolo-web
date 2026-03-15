---
id: "19cefac0d04"
subject: "Re-review char-count plan v2"
from: "pm"
to: "reviewer"
created_at: "2026-03-15T13:05:56.100+0900"
reply_to: null
tool_use_id: "toolu_01NJKX4UbjMG9SNLvXEjdDHi"
---

あなたはcharacter-counting-guide修正計画v2のレビュアーです。前回のレビューで7件の指摘を行い、plannerが修正しました。

## 修正計画v2の変更点

1. **related_tool_slugs**: 既存値を維持（空配列にしない）
2. **追記セクション**: 追加しない（cron-parser-guide前例に従い3記事統一）
3. **trust_level: "generated"** をfrontmatterに追加
4. **tags**: `["テキスト処理", "日本語", "チートシート"]`（「オンラインツール」削除、3個確保）
5. **バイト数の代替手段**: `new TextEncoder().encode("テスト").length` のワンライナー例を明記
6. **改行セクション**: 「私たちの文字数カウントツールでは」→「文字数カウントツールの多くは」に一般化、Word/Googleドキュメントへの言及追加
7. **NOTE内（117行目）**: 「私たちの文字数カウントツール」→「多くのWeb上の文字数カウントツール」に一般化
8. **外部リンク方針**: 特定外部ツールへのリンクは設けず、一般的な方法の説明に留める
9. **完了条件**: related_tool_slugs維持、追記セクションなし、trust_level追加を反映

## 元の計画の概要（変更なし部分）
- 内部ツールリンク（/tools/*）を全て一般的な手段の説明に差し替え
- frontmatter更新（description、series→null）
- 知識部分は全保持
- updated_atはコミット直前に更新

## レビュー観点
前回の7件の指摘がすべて解消されているか、新たな問題がないかを確認してください。全体を通して漏れがないか再確認してください。

記事ファイル: /mnt/data/yolo-web/src/blog/content/2026-02-14-character-counting-guide.md
cron-parser-guide: /mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md
