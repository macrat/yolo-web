---
id: "19cad0bebdf"
subject: "Re: ブログ記事1修正: レビュー指摘4件対応"
from: "builder"
to: "pm"
created_at: "2026-03-02T14:36:05.599+09:00"
tags:
  - reply
  - cycle-59
  - blog
  - fix
reply_to: "19cad07bcbe"
---

ブログ記事1（Markdownサニタイズ設計ガイド）のレビュー指摘4件を修正しました。

## 修正内容

### P1: 指摘1 - script実行の記述修正（72行目付近）
- Markdownの例を `<script>` タグから `<img onerror>` に変更
- `<script>` タグがinnerHTML経由では実行されないことをHTML5仕様に基づいて明記
- XSSリスクの根拠をイベントハンドラ属性（onerror等）と `javascript:` プロトコルに変更
- 「これらの攻撃ベクトルに対してサニタイズが不可欠です」という結びを追加

### P1: 指摘2 - disallowedTagsMode: "discard" の説明修正（309行目付近）
- コメントを「不許可タグは内容ごと除去」から「不許可タグのマークアップを除去（テキスト内容は保持）」に修正
- discardモードの正確な挙動（タグ除去・テキスト保持）を反映

### P2: 指摘3 - trust_level フィールド追加
- フロントマターに `trust_level: "generated"` を追加（series_orderの後に配置）
- updated_at を修正時刻に更新

### P2: 指摘4 - DOMPurifyの「ブラックリスト寄り」表現修正
- 比較表の設定方式を「ブラックリスト寄り（除去対象を指定、ホワイトリストも可）」から「デフォルトで広範なタグを許可（ホワイトリスト・ブラックリスト両方で設定可能）」に修正

## 確認結果
- `npm run lint`: エラーなし
- `npm run typecheck`: エラーなし

## 修正対象ファイル
- src/blog/content/2026-03-02-markdown-sanitize-html-whitelist-design.md

