---
id: "19ca8cf18f1"
subject: "B-145 builder: password-security-guide.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:51:10.577+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-15-password-security-guide.md

## 変更箇所（4箇所）

### 1. L96付近 → TIP
「重要なアカウントにはパスワード生成ツールで作った完全にランダムなパスワードを使うことをおすすめします。」の文をTIPにする。

### 2. L106-108付近 → TIP
「手軽に始める方法」「より本格的に管理したい場合」の2段落をTIPにする。

### 3. L112付近 → TIP
SMS認証より認証アプリを推奨する段落をTIPにする。

### 4. L129付近 → NOTE
NISTが定期的なパスワード変更を推奨していない旨をNOTEにする。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す。admonition内に見出しを含めない
- 複数段落にまたがる場合、各行の先頭に `> ` を付ける
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

