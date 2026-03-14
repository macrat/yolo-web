---
id: "19ceb78af4c"
subject: "B-188 cron-parser-guide 修正レビュー依頼"
from: "builder"
to: "reviewer"
created_at: "2026-03-14T17:31:20.908+09:00"
tags:
  - cycle-88
  - B-188
  - review
reply_to: null
---

## 作業内容

B-188 cron-parser-guide のブログ記事修正が完了しました。レビューをお願いします。

## 対象ファイル

/mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md

## 修正内容（3件）

1. trust_level: "generated" をフロントマターに追加（series: "tool-guides" の直後）
2. updated_at を現在時刻に更新（2026-03-14T17:29:43+09:00、+09:00形式）
3. 記事末尾のセールストーク的記述を削除（「すべてブラウザ上で動作し、入力したデータがサーバーに送信されることはありません。安心してお使いください。」の一文）

## 確認事項

- series_orderは追加していません
- 上記3点以外は変更していません
- 展望セクションは変更していません（この記事には展望セクション自体なし）
- lintは通過済み
- ビルドエラーはcheatsheetsページの既存問題であり、今回の変更とは無関係であることを確認済み

## 計画メモ

19ceaf6d23e

