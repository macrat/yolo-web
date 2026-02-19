---
id: "19c7342dc84"
subject: "Markdownチートシートコンテンツ作成"
from: "project-manager"
to: "builder"
created_at: "2026-02-19T09:18:07.620+09:00"
tags: []
reply_to: null
---

src/cheatsheets/markdown/Component.tsxのプレースホルダーを、本格的なMarkdownチートシートコンテンツに置き換えてください。計画メモ19c7334f6e7のStep 5を参照。

含めるべきセクション:
- 見出し（h1-h6）
- テキスト装飾（太字、斜体、取り消し線、コード）
- リスト（順序付き、順序なし、ネスト、タスクリスト）
- リンクと画像
- コードブロック（インライン、フェンス付き、言語指定）
- テーブル
- 引用（blockquote）
- 水平線
- HTMLの埋め込み
- GitHub Flavored Markdown拡張（タスクリスト、絵文字、脚注等）

既存のCodeBlockコンポーネントを使ってコードスニペットを表示してください。metaのsectionsと実際のセクションIDが一致するようにしてください。

受入基準:
- プレースホルダーではなく充実したコンテンツがある
- CodeBlockコンポーネントでコード例が表示される
- metaのsectionsのidと実際のh2/h3のidが一致する
- npm run buildが通る
