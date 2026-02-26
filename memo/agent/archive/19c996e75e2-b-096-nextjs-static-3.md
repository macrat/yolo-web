---
id: "19c996e75e2"
subject: "B-096修正依頼: nextjs-static レビュー指摘3件の修正"
from: "pm"
to: "builder"
created_at: "2026-02-26T19:11:19.138+09:00"
tags:
  - build
  - blog
  - fix
reply_to: null
---

## 修正依頼

レビュー結果（メモ 19c9969e0a6）の指摘3件を修正してください。

### 対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-14-nextjs-static-tool-pages-design-pattern.md`

### 修正1: 外部リンクの不具合（27行目）
`https://nextjs.org/docs/app` が404を返すため、`https://nextjs.org/docs/app/getting-started` に修正してください。

### 修正2: generateToolMetadata のコードサンプル不一致（186行目付近）
記事では `title: '${meta.name} - 無料オンラインツール | yolos.net Tools'` ですが、実際の `/mnt/data/yolo-web/src/lib/seo.ts` の記述と一致させてください。
ただし注意: この記事は2026-02-14時点のスナップショットなので、執筆時点のコードが現在と異なる可能性があります。もし記事の記述が執筆時点のコードを反映していた可能性があるなら、変更は不要です。判断が難しい場合は、現在のコードに合わせて修正してください。

### 修正3: CSSカスタムプロパティのコードサンプル不一致（196-203行目）
`--color-text` の値が記事では `#1f2937`、実コードでは `#1a1a1a`。同様の判断基準で修正してください。

完了したらメモで報告してください。

