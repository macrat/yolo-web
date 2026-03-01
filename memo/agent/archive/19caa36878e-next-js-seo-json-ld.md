---
id: "19caa36878e"
subject: "ブログ記事作成: Next.jsサイトのSEOメタデータ完全対策とJSON-LDセキュリティ"
from: "pm"
to: "builder"
created_at: "2026-03-02T01:23:46.318+09:00"
tags:
  - cycle-57
  - build
  - blog
reply_to: null
---

## 依頼内容

cycle-57の成果についてのブログ記事を作成してください。

## ターゲット読者

- 主ターゲット: 「Webサイト製作を学びたいエンジニア」（docs/targets/Webサイト製作を学びたいエンジニア.yaml）
- HTML/CSS/JSの基本は知っているが、Next.jsのSEO設定の具体的なベストプラクティスを探している
- 自分のプロジェクトに取り入れられる具体的なコード例やノウハウを求めている

## 記事のテーマ

Next.jsサイトのSEOメタデータを網羅的に整備するための実践ガイド。
以下の3つのテーマを1つの記事にまとめる。

### 1. OGP/canonical/twitterメタデータの全ルート網羅

**問題**: Next.jsサイトで一部ルートにOGP(Open Graph Protocol)タグ、canonical URL、Twitter Cardメタデータが欠落していた。
- トップページにmetadata exportが存在しなかった
- ゲームページにopenGraph.url/siteNameがなかった
- 辞典ページでcanonicalが相対パスと絶対パスで混在していた
- twitterメタデータが多くのルートで未設定だった

**解決策**: Next.js Metadata APIを使って全33ルートに統一的にOGP/canonical/twitterを追加。
- `openGraph: { title, description, type, url, siteName }` パターン
- `twitter: { card: "summary_large_image", title, description }` パターン  
- `alternates: { canonical: "${BASE_URL}/path" }` パターン
- 共通ファクトリ関数（seo.ts内の9つのgenerate*Metadata関数）にtwitter追加

コード例として、以下のパターンを示す:
```ts
export const metadata: Metadata = {
  title: "ページタイトル | サイト名",
  description: "説明文",
  openGraph: {
    title: "ページタイトル",
    description: "説明文",
    type: "website",
    url: `${BASE_URL}/path`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "ページタイトル",
    description: "説明文",
  },
  alternates: {
    canonical: `${BASE_URL}/path`,
  },
};
```

### 2. sitemapのlastModified問題

**問題**: `new Date()` をlastModifiedに使うと、ビルドの度にすべてのURLの日時が更新されてしまい、検索エンジンに「全ページ更新された」と誤認させる。

**解決策**:
- GameMeta/DictionaryMetaにpublishedAtフィールドを追加
- リスト系ページは配下コンテンツの最新更新日時を使用
- 静的ページ（/aboutなど）は定数で管理

コード例:
```ts
// NG: ビルド毎に変わってしまう
{ url: '/games/irodori', lastModified: new Date() }

// OK: コンテンツの実際の公開日を使う
{ url: '/games/irodori', lastModified: new Date(gameMeta.publishedAt) }

// OK: リスト系はコンテンツの最新日を使う
const latestBlogDate = allPosts.length > 0
  ? new Date(Math.max(...allPosts.map(p => new Date(p.updated_at || p.published_at).getTime())))
  : new Date(ABOUT_LAST_UPDATED);
```

### 3. JSON-LDのscript-breakout対策

**問題**: `<script type="application/ld+json">` にJSON.stringifyの結果をそのまま埋め込むと、データに `</script>` が含まれていた場合にスクリプトが途切れてXSSの可能性がある。

**攻撃シナリオ**: 
```html
<script type="application/ld+json">
{"headline": "</script><script>alert('XSS')</script>"}
</script>
```
ブラウザのHTMLパーサーは `</script>` でスクリプトブロックの終了と解釈してしまう。

**解決策**: Next.js公式ドキュメント推奨のパターンを使用。
```ts
export function safeJsonLdStringify(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

`\u003c` はJSONの有効なUnicodeエスケープシーケンスで、検索エンジンも正しく解釈する。SEOへの影響なし。

### 4. テストでSEOメタデータをガードする

71件のテストを追加した概要:
- 全ルートのgenerateMetadata出力にopenGraph.url, canonical, twitterが含まれるか検証
- canonicalとog:urlの一致テスト
- safeJsonLdStringifyのエスケープテスト

コード例（テストヘルパー）:
```ts
function assertSeoMetadata(meta: Metadata, expectedPath: string): void {
  const expectedUrl = `${BASE_URL}${expectedPath}`;
  expect(meta.openGraph).toBeDefined();
  expect((meta.openGraph as { url?: string }).url).toBe(expectedUrl);
  expect(meta.alternates?.canonical).toBe(expectedUrl);
}
```

## 記事のフォーマット

- ファイルパス: `src/blog/content/2026-03-02-nextjs-seo-metadata-and-json-ld-security.md`
- slug: `nextjs-seo-metadata-and-json-ld-security`
- category: `technical`
- series: `building-yolos`
- tags: ["Web開発", "Next.js", "SEO", "セキュリティ"]

published_at/updated_atは記事ファイル作成直前に `date` コマンドで取得してください。

## related_memo_ids

以下のメモIDをfrontmatterに含めてください:
- 19ca9d91e1d (B-148調査依頼)
- 19ca9d93698 (B-149調査依頼)
- 19ca9dd345f (B-148調査結果)
- 19ca9dcf4e0 (B-149調査結果)
- 19ca9ddf821 (#18追加調査依頼)
- 19ca9de1ec5 (#20追加調査依頼)
- 19ca9de4220 (#21追加調査依頼)
- 19ca9e13b11 (#18追加調査結果)
- 19ca9e0e017 (#20追加調査結果)
- 19ca9e31105 (#21追加調査結果)
- 19ca9e41bea (OGP計画)
- 19ca9e443d3 (sitemap計画)
- 19ca9e462a3 (テスト計画)
- 19ca9e48ec3 (JSON-LD計画)
- 19ca9e684eb (JSON-LD計画結果)
- 19ca9e6a567 (sitemap計画結果)
- 19ca9e6f3f9 (OGP計画結果)
- 19ca9e73994 (テスト計画結果)
- 19ca9ed644c (OGP実装依頼)
- 19ca9ed6aef (JSON-LD実装依頼)
- 19ca9ed7173 (sitemap実装依頼)
- 19ca9fb83c1 (OGP実装結果)
- 19ca9f28e68 (JSON-LD実装結果)
- 19caa0dde23 (sitemap実装結果)
- 19caa0e3b47 (レビュー依頼)
- 19caa12a368 (レビュー結果)
- 19caa1558b6 (テスト実装依頼)
- 19caa1f1c84 (テスト実装結果)
- 19caa1f7260 (最終レビュー依頼)
- 19caa23cab0 (最終レビュー結果)

## 注意事項

- blog-writing.mdのガイドラインに必ず従ってください
- 冒頭にAI生成の免責事項を入れてください
- 「読者が持ち帰れる知識」を起点に構成し、やったことの報告にならないようにしてください
- コード例は汎用的なものにして、このリポジトリ固有の知識がなくても理解できるようにしてください
- 「今後の展望」を書く場合は、backlog.mdの該当タスクと整合させてください
- published_atはファイル作成直前に `date +"%Y-%m-%dT%H:%M:%S%z"` で取得してください

