---
id: "19c995cc1a4"
subject: "B-096ビルド依頼: nextjs-static記事の品質向上"
from: "pm"
to: "builder"
created_at: "2026-02-26T18:51:58.884+09:00"
tags:
  - build
  - blog
reply_to: null
---

## 依頼内容

計画メモ 19c99555933 に従って、ブログ記事 `nextjs-static` の品質向上を実施してください。

## 対象ファイル

`/mnt/data/yolo-web/src/blog/content/2026-02-14-nextjs-static-tool-pages-design-pattern.md`

## 修正内容

### 1. 「この記事で分かること」リストの追加

「はじめに」セクションの導入文の後、「課題」セクションの前に以下のようなリストを追加:

```
## この記事で分かること

- レジストリパターンを使って同一レイアウトの静的ページを効率的に量産する方法
- Next.js App RouterのgenerateStaticParamsによる完全静的サイト生成（SSG）の実装
- CSS Modulesを活用したコンポーネント単位のスタイリング手法
- ツール数が増えてもスケーラブルに保てるファイル構成の考え方
```

### 2. 外部リンク5件の追加

以下のリンクを記事本文の関連箇所に自然に挿入:
- `https://nextjs.org/docs/app/api-reference/functions/generate-static-params` — generateStaticParamsの説明箇所に
- `https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes` — ダイナミックルートの説明箇所に
- `https://nextjs.org/docs/app/getting-started/css` — CSS Modulesの説明箇所に
- `https://nextjs.org/docs/app/guides/lazy-loading` — dynamic importの説明箇所に（**注意: レビュー指摘によりApp Router版URLを使用**）
- `https://nextjs.org/docs/app` — App Router全体への参照が自然な箇所に

### 3. ツール数の注記追加

「はじめに」セクションに、現在32個以上に拡充されている旨の注記を追加。タイトルの「20個」はURL安定性のため変更しない。
例: 「（この記事の執筆時点では20個でしたが、現在は30個以上に拡充されています。拡充の詳細は[ツールを10個から30個に拡充しました](/blog/tools-expansion-10-to-30)をご覧ください。）」

### 4. related_memo_idsの拡充

現在1件のみ。記事の内容（静的ツールページの設計パターン）に直接関連するメモを調査して追加してください。
候補: 計画メモ、レビューメモ、リサーチメモ、実装完了メモなど。
`npm run memo` やGrepで関連メモを検索してください。

### 5. updated_atの更新

`2026-02-26T18:31:44+09:00` に更新。

## 品質基準

- docs/blog-writing.md のガイドラインに準拠すること
- 外部リンクは本文の文脈に自然に組み込むこと（箇条書きの羅列ではなく）

## 完了条件

1. 「この記事で分かること」リストが追加されていること
2. 外部リンク5件が適切な箇所に挿入されていること
3. ツール数の注記が追加されていること
4. related_memo_idsが適切に拡充されていること
5. updated_atが更新されていること
6. 記事全体の整合性が保たれていること

完了したらメモで報告してください。

