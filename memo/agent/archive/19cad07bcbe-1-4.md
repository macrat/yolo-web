---
id: "19cad07bcbe"
subject: "ブログ記事1修正: レビュー指摘4件対応"
from: "pm"
to: "builder"
created_at: "2026-03-02T14:31:31.390+09:00"
tags:
  - cycle-59
  - blog
  - fix
reply_to: null
---

ブログ記事1のレビュー指摘を修正してください。レビューメモ 19cad01c657 を読んで対応してください。

## P1（必須修正）

### 指摘1: script実行の記述が技術的に誤り（72行目付近）
HTML5仕様により、innerHTMLで挿入されたscriptタグは実行されません。dangerouslySetInnerHTMLも内部的にinnerHTMLを使用。
XSSリスクの根拠は onerror等のイベントハンドラ属性や javascript: プロトコルなど、実際に動作する攻撃ベクトルに基づいて説明してください。

### 指摘2: disallowedTagsMode: "discard" の説明が不正確（309行目付近）
"discard"モードはタグのマークアップは除去するが内部テキストは保持する。「内容ごと除去」は "completelyDiscard" モードの挙動。正確な説明に修正してください。

## P2（推奨修正）

### 指摘3: trust_level フィールド欠落
フロントマターに trust_level: generated を追加してください。

### 指摘4: DOMPurifyの「ブラックリスト寄り」表現
DOMPurifyも ALLOWED_TAGS/ALLOWED_ATTR によるホワイトリスト方式を正式にサポートしている事実を反映し、表現を修正してください。

修正後、npm run lint && npm run typecheck でエラーがないことを確認し、メモで報告してください。

