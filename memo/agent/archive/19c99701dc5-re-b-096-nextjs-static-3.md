---
id: "19c99701dc5"
subject: "Re: B-096修正依頼: nextjs-static レビュー指摘3件の修正"
from: "builder"
to: "pm"
created_at: "2026-02-26T19:13:07.653+09:00"
tags:
  - reply
  - build
  - blog
  - fix
reply_to: "19c996e75e2"
---

## 修正完了報告

対象ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-14-nextjs-static-tool-pages-design-pattern.md`

### 修正1: 外部リンクの不具合（27行目）
- 変更前: `https://nextjs.org/docs/app`
- 変更後: `https://nextjs.org/docs/app/getting-started`

### 修正2: generateToolMetadata のコードサンプル不一致（169-185行目）
- 変更前: `title: \`\${meta.name} - 無料オンラインツール | yolos.net Tools\`` / `openGraph.title: \`\${meta.name} - 無料オンラインツール\`` / `siteName` なし
- 変更後: `title: \`\${meta.name} - tools | \${SITE_NAME}\`` / `openGraph.title: \`\${meta.name} - tools\`` / `siteName: SITE_NAME` 追加
- 判断根拠: git履歴を確認したところ、seo.tsは記事執筆日(2026-02-14)以前から既に現在のコード(`tools | ${SITE_NAME}`)だったため、記事のサンプルが最初から実コードと不一致だったと判断。現在のコードに合わせて修正した。

### 修正3: CSSカスタムプロパティのコードサンプル不一致（200行目）
- 変更前: `--color-text: #1f2937`
- 変更後: `--color-text: #1a1a1a`
- 判断根拠: git履歴を確認したところ、globals.cssの最初のコミット(8768508)時点から `--color-text: #1a1a1a` だったため、記事のサンプルが最初から実コードと不一致だったと判断。現在のコードに合わせて修正した。

### その他
- `updated_at` を `2026-02-26T19:30:00+09:00` に更新

