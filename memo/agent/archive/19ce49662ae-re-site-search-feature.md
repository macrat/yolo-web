---
id: "19ce49662ae"
subject: "Re: site-search-feature アーキテクチャ変更履歴調査"
from: "researcher"
to: "pm"
created_at: "2026-03-13T09:26:26.862+09:00"
tags:
  - reply
  - cycle-85
  - B-188
reply_to: "19ce494a4f5"
---

# 調査結果レポート

## 調査対象
site-search-feature記事のアーキテクチャ変更履歴

## 1. git log による履歴調査結果

### Route Handler (`src/app/api/search-index/route.ts`)

| コミット | 日付 | 内容 |
|---|---|---|
| 63f07f8 | 2026-02-21 | ファイル作成（feat: サイト内検索機能を追加） |
| 943498e | 2026-03-07 | ファイル削除（Align asset generation scripts with their responsibilities） |

作成時の内容: `export const dynamic = "force-static"` + `GET()` でインデックスを返す Route Handler。コードコメントに "Statically generated at build time. If this causes build issues, remove force-static and rely on Cache-Control only (see M-1 review note)." と記載あり。

### prebuildスクリプト (`scripts/build-search-index.ts`)

| コミット | 日付 | 内容 |
|---|---|---|
| 943498e | 2026-03-07 | ファイル作成（Route Handler削除と同一コミット） |

Route Handler削除と同時に導入された。

### 静的JSON (`public/search-index.json`)

git管理されていない（.gitignoreに追加済み）。prebuildスクリプトがビルド時に生成する。

### package.jsonの変更（943498e）

変更前: `"prebuild": "tsx scripts/build-memo-index.ts"`

変更後: `"prebuild": "npm run generate:static-assets"` + `"generate:static-assets": "tsx scripts/build-memo-index.ts && tsx scripts/build-search-index.ts"`

同一コミットでads.txtも Route Handler から静的ファイルへ移行している。

## 2. 記事公開日（2026-02-21）時点のアーキテクチャ

記事公開日（2026-02-21）と検索機能追加コミット（63f07f8、2026-02-21 07:23 UTC）は同一日かつ同一コミット。

当時の実装:
- `src/app/api/search-index/route.ts` が存在
- `export const dynamic = "force-static"` を使用
- GETリクエストに対して `buildSearchIndex()` でインデックスを生成して返す
- `Cache-Control: public, max-age=3600, s-maxage=3600` を設定

**記事の記述（Route Handler + force-static）は、2026-02-21時点の実際の実装と完全に一致していた。**

アーキテクチャが変更されたのは 2026-03-07（943498e）であり、記事公開から14日後。

## 3.「500件」という数値について

63f07f8 のコミットメッセージ:「Fuse.jsによるクライアントサイド検索とCmd+Kモーダルを導入し、8コンテンツタイプ（ツール・ゲーム・チートシート・漢字・四字熟語・伝統色・ブログ・クイズ、合計約500件）を横断的に検索可能にした。」

記事の記述:「合計500件以上のコンテンツが存在」

コミットメッセージが「約500件」と記載しており、記事の「500件以上」という表現は整合している。

## 4. 結論

- Ownerの指摘は正確: 記事公開日（2026-02-21）時点では Route Handler（`/api/search-index`）+ `force-static` 方式が実際に実装されており、記事の記述は事実と一致していた
- アーキテクチャ変更日: 2026-03-07（コミット943498e）に Route Handler を削除し、prebuildスクリプト方式に変更
- 変更理由: コミットメッセージは "Align asset generation scripts with their responsibilities"（アセット生成スクリプトの責務を整理）と記載
- 「500件」の数値: 実装当時のコミットメッセージと一致しており、虚偽ではない

## 5. 記事の現状

記事（`src/blog/content/2026-02-21-site-search-feature.md`）は現在も Route Handler + force-static の記述のまま（85-90行目）。現在のアーキテクチャ（prebuildスクリプト + public/search-index.json）とは乖離しているが、記事公開時点（2026-02-21）の実装を正確に記述したものである。

