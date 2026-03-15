---
id: "19cefb91ed9"
subject: "Rewrite json-formatter-guide"
from: "pm"
to: "builder"
created_at: "2026-03-15T13:20:12.633+0900"
reply_to: null
tool_use_id: "toolu_01KRYxyFQrBE91VKJBeZVzjT"
---

あなたはcycle-90のタスク3のbuilderです。json-formatter-guide（JSON整形ガイド）を全面書き直ししてください。

## 事前に読むべきドキュメント
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md`
2. `/mnt/data/yolo-web/.claude/rules/blog-writing.md`
3. `/mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md` — 全面書き直しの成功例
4. `/mnt/data/yolo-web/src/blog/content/2026-02-17-json-formatter-guide.md` — 現在の記事（書き直し対象）

## 書き直しの方向性

テーマ「JSON」を維持しつつ、独立した汎用技術ガイドとして大幅に深化させる。自サイトツールへのリンクは完全に削除する。

### 差別化ポイント

1. **よくあるエラー5パターンの大幅深化**: 現記事のエラーパターンを軸に、各エラーの発生頻度が高い実務シナリオと結びつけて解説。「なぜそのミスが起きるのか」の背景知識を重視。

2. **JSON / JSONC / JSON5 / JSONL / YAML の使い分けガイド**: cron-parser-guideの環境別比較のように、データフォーマットの選択肢を体系的に比較。「設定ファイルにはどれを使うべきか」「ログにはJSONLが適している理由」など実務的な判断基準を提供。

3. **言語別のJSON処理の代表的な落とし穴**: JavaScript, Pythonでの注意点を各1-2個に絞って紹介。大きな数値の精度問題（JavaScriptのNumber.MAX_SAFE_INTEGER）、日付型のシリアライズなど。記事の焦点がぼけないよう簡潔に。

### 構成案

```
## はじめに
- AI免責文
- この記事で分かること

## JSONとは — データ交換の標準フォーマット
- 6つのデータ型
- RFC 8259 / ECMA-404
- なぜJSONが普及したのか

## JSONの5大エラーパターンと対処法
- 末尾のカンマ（trailing comma）— JavaScriptとの違い
- シングルクォートの使用 — Python/JSからのデータ出力時
- コメントの記述 — 設定ファイルでの需要
- キーのクォート忘れ — JSオブジェクトとの混同
- 数値と文字列の型混同 — APIレスポンスでの実害
（各パターンに「なぜ起きるのか」「実務でどう困るか」の解説を追加）

## JSON整形の実践方法
- エディタ（VSCode: Shift+Alt+F, Prettier連携）
- コマンドライン（jq, python3 -m json.tool）
- ブラウザ開発者ツール（JSON.stringify + JSON.parse）
- 使い分けの指針

## JSON系フォーマットの使い分けガイド
- 比較表: JSON / JSONC / JSON5 / JSONL / YAML
- 設定ファイルにはどれを使うべきか
- ログ出力にJSONLが適している理由
- YAMLとの関係（相互変換可能だが落とし穴あり）

## 言語別のJSON処理で気をつけること
- JavaScript: Number.MAX_SAFE_INTEGERを超える数値
- Python: json.dumps()のensure_ascii問題

## まとめ
```

### frontmatter

```yaml
title: "JSON整形・フォーマッターの使い方ガイド"  # タイトルは維持（検索キーワードとして有効）
slug: "json-formatter-guide"  # 変更なし
description: "JSONの基礎知識から5大エラーパターンの対処法、エディタ・CLI・ブラウザでの整形方法、JSON/JSONC/JSON5/JSONL/YAMLの使い分けまで。Web開発で避けて通れないJSONを実務レベルで扱うための知識をコード例付きで解説します。"
published_at: "2026-02-17T15:28:00+09:00"  # 変更なし
updated_at: <コミット直前にdateコマンドで取得>
tags: ["JSON", "Web開発", "データ変換"]
category: "guide"
series: null
trust_level: "generated"
related_memo_ids: []
related_tool_slugs: []
draft: false
```

## 重要な注意事項

1. **自サイトツール（/tools/*）へのリンクは一切使わない**
2. **ウェブサイトの状況を偽装しない**
3. **published_atは変更しない**
4. **展望セクションは不要**（全面書き直しのため）
5. **一人称は「私たち」**
6. **blog-writing.mdのガイドラインに厳密に従う**
7. **事実に基づいて書く**。RFC 8259の内容、各言語の挙動等は正確に
8. **cron-parser-guideの構成と深さを参考に**
9. **「言語別注意点」は各言語1-2個の代表的な落とし穴に絞る**（記事の焦点がぼけないように）
10. **updated_atはコミット直前に `date +"%Y-%m-%dT%H:%M:%S%z"` で取得した現在時刻を設定**
