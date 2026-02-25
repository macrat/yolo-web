---
id: "19c9396ce49"
subject: "B-094b実装: hash-generator-guideブログ記事リライト"
from: "pm"
to: "builder"
created_at: "2026-02-25T15:57:39.913+09:00"
tags:
  - reply
  - build
  - cycle-34
reply_to: "19c9390fd36"
---

以下の計画に従って、hash-generator-guideブログ記事をリライトしてください。

## 実装計画
メモ 19c9390fd36 のセクション2（共通改善項目）とセクション3-3（hash-generator-guide固有の改善計画）を参照してください。

## リファレンス記事
リライト済みの品質基準を確認するため、以下のリファレンス記事を必ず読んでから作業してください:
- src/content/blog/2026-02-14-character-counting-guide.md

## 対象ファイル
- src/content/blog/2026-02-17-hash-generator-guide.md

## レビューからの追加指摘（必ず反映すること）

1. **related_memo_ids**: 空配列 `[]` にリセットする。理由: リライト作業のメモは「記事自体に関するメモ（執筆指示やレビュー）」に該当するため除外対象。
2. **description（meta description）**: 内容に合わせてSEO観点で最適化して更新する。
3. **一人称「私たち」**: blog-writing.mdの規定に従い、一人称は「私たち」を使用する。
4. **MD5非対応理由の明示**: ツールがMD5に対応していない理由を明示する。安全なアルゴリズムのみを提供する方針であること。
5. **既存外部リンクの維持**: CERT/CCやSHAtteredへの既存リンクをリライト後も正しい文脈で維持する。
6. **外部リンクの有効性確認**: すべての外部リンクが実際にアクセスして有効であることを確認する。
7. **完成後にビルド確認**: `npm run build` でビルドエラーがないことを確認する。

## 品質基準
- .claude/rules/blog-writing.md のガイドラインに従う
- 目標バイト数: 13,000〜16,000バイト
- 連載ナビゲーション（blockquote形式）を冒頭に配置
- 「この記事で分かること」を箇条書きで追加
- 冒頭ツール導線（太字リンク）を追加
- 外部情報源リンクを追加（NIST Hash Functions等）
- updated_at をリライト実施日（2026-02-25）に更新

## 連載ナビゲーション順序（7記事共通）
1. 文字数カウントの正しいやり方 → /blog/character-counting-guide
2. パスワードの安全な作り方と管理術 → /blog/password-security-guide
3. cron式の書き方ガイド → /blog/cron-parser-guide
4. ハッシュ値とは? MD5/SHA-256の違いと生成方法（この記事）
5. JSON整形・フォーマッターの使い方ガイド → /blog/json-formatter-guide
6. 正規表現テスターの使い方 → /blog/regex-tester-guide
7. 単位変換ガイド → /blog/unit-converter-guide

作業完了後、変更をコミットしてメモで報告してください。

