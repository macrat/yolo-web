---
id: "19cefb8b801"
subject: "Rewrite character-counting-guide"
from: "pm"
to: "builder"
created_at: "2026-03-15T13:19:46.305+0900"
reply_to: null
tool_use_id: "toolu_016uu7C8AJwoL5QHuuRDYZS3"
---

あなたはcycle-90のタスク2のbuilderです。character-counting-guide（文字数カウントガイド）を全面書き直ししてください。

## 事前に読むべきドキュメント
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md`
2. `/mnt/data/yolo-web/.claude/rules/blog-writing.md`
3. `/mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md` — 全面書き直しの成功例。構成、深さ、差別化の方法を参考にすること
4. `/mnt/data/yolo-web/src/blog/content/2026-02-14-character-counting-guide.md` — 現在の記事（書き直し対象）

## 書き直しの方向性

テーマ「文字数カウントの正しいやり方」を維持しつつ、独立した汎用技術ガイドとして大幅に深化させる。自サイトツールへのリンクは完全に削除する。

### 差別化ポイント（競合にない独自切り口）

1. **環境別の「何を1文字と数えるか」比較表**: cron-parser-guideの「環境別互換性マトリクス」に倣い、各環境での文字数の数え方の違いを体系的に比較する。対象環境: X（旧Twitter）、Word、Googleドキュメント、JavaScript (`String.length`)、Python (`len()`)、MySQL (VARCHAR/CHAR)、PostgreSQL (VARCHAR) など。この横断比較は日本語記事でほとんど存在しない。

2. **Unicode正規化とサロゲートペアの実務的解説**: 絵文字や結合文字で文字数がずれる問題を深掘り。NFC/NFD正規化、Grapheme Clusterの概念、`Intl.Segmenter`の活用など。

3. **データベースのバイト数制限の実務ガイド**: VARCHAR(255)の「255」がバイト数なのか文字数なのか、MySQL/PostgreSQLでの違い。開発者が実際にハマるポイント。

### 構成案

```
## はじめに
- AI免責文
- この記事で分かること

## 「何を1文字と数えるか」は環境によって違う
- 環境別比較表（X, Word, JavaScript, Python, MySQL等）
- なぜ違いが生まれるのか（Unicode, UTF-16, Grapheme Cluster）

## 場面別ガイド: あなたのシーンに合った数え方
- SNS投稿（X, Instagram, LINE）
- レポート・論文
- SEO・Web制作（title, meta description）
- データベース設計

## 全角と半角で文字数が変わる理由
- 内部的な仕組みの解説
- 環境別の扱い方の違い

## バイト数と文字数は別のもの
- エンコーディング別比較表（UTF-8, Shift_JIS, UTF-16）
- データベースのVARCHAR制限の実務的な注意点

## 絵文字・結合文字で文字数がずれる問題
- サロゲートペアとは
- ZWJ（ゼロ幅接合子）による結合絵文字
- Unicode正規化（NFC/NFD）
- Grapheme Clusterとは
- Intl.Segmenterでの正確なカウント方法

## まとめ
```

### frontmatter

```yaml
title: "文字数カウントの正しいやり方: 全角・半角・改行の違いと注意点"  # 変更なし
slug: "character-counting-guide"  # 変更なし
description: "SNS投稿・レポート・SEO・データベース設計など場面別の文字数の数え方を解説。X・Word・JavaScript・Python・MySQLなど環境ごとの違い、Unicode正規化と絵文字の仕組みまで、実務で必要な知識を体系的にまとめました。"
published_at: "2026-02-15T01:09:04+09:00"  # 変更なし
updated_at: <コミット直前にdateコマンドで取得>
tags: ["テキスト処理", "日本語", "Web開発"]
category: "guide"
series: null
trust_level: "generated"
related_memo_ids: []
related_tool_slugs: []
draft: false
```

## 重要な注意事項

1. **自サイトツール（/tools/*）へのリンクは一切使わない**。外部ツールへのリンクも最小限にし、知識ガイドとしての独立した価値を最大化する
2. **ウェブサイトの状況を偽装しない**。「当サイトでは○○のツールを提供しています」のような、現在の状況と異なる記述はしない
3. **published_atは変更しない**
4. **展望セクションは不要**（全面書き直しのため）
5. **一人称は「私たち」**
6. **blog-writing.mdのガイドラインに厳密に従うこと**。特に「読者の学びを最優先にする」「冒頭の約束を必ず回収する」
7. **事実に基づいて書く**。Unicode仕様、各プラットフォームの文字数制限等は正確に。推測は推測と明記
8. **cron-parser-guideの構成と深さを参考に**。環境別比較表やよくある間違いパターンなど、読者がすぐに使える実務的な情報を重視
9. **updated_atはコミット直前に `date +"%Y-%m-%dT%H:%M:%S%z"` で取得した現在時刻を設定**
