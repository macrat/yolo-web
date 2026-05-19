---
title: Phase 7 タイル基盤実装のベストプラクティス調査
date: 2026-05-19
purpose: デザインシステム Phase 7「タイル基盤実装」に向けた技術選定の根拠収集。隠し検証ルート・定数共有・タイルレジストリ・型契約の 4 トピックを網羅。
method: |
  - Next.js 公式ドキュメント（generateMetadata, robots.txt, Server/Client Components）を直接参照
  - GitHub Issues（Turbopack CSS Modules :export / @value 問題）を確認
  - 既存コードベース（scripts/generate-toolbox-registry.ts, src/lib/toolbox/types.ts, src/app/robots.ts, storybook/page.tsx）を実地参照
  - Web 検索で補完（X-Robots-Tag, CSS 定数共有パターン）
sources:
  - https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  - https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
  - https://nextjs.org/docs/app/getting-started/server-and-client-components
  - https://github.com/vercel/next.js/issues/85173
  - src/app/(new)/storybook/page.tsx（既存ルート実例）
  - scripts/generate-toolbox-registry.ts（既存 codegen 実例）
  - src/lib/toolbox/types.ts（既存 Tileable 型実例）
---

# Phase 7 タイル基盤実装のベストプラクティス調査

## エグゼクティブサマリー（200 字）

hidden 検証ルートは `metadata: { robots: { index: false, follow: false } }` と `robots.ts` の `/internal/` disallow の組み合わせが最小コストで確実。CSS 定数共有は Turbopack で `:export` と `@value` が未サポートのため CSS Custom Properties + TS 定数の二重管理が現状ベスト。タイルレジストリは既存 `generate-toolbox-registry.ts` の codegen パターンを踏襲するのが整合性・保守性ともに最善。型契約は Phase 7 スコープとして `TileSize` / `TileComponent` 型のみを定義し、タイル間連携（入出力）は Phase 8 以降に先送りが適切。

---

## セクション 1: Next.js App Router での hidden / internal 検証ルートの作り方

### 技術背景

Next.js 15 App Router でのメタデータ制御は 3 層に分かれる。

| 層                                           | 実装場所                                           | 対象                                            |
| -------------------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| `metadata` オブジェクト / `generateMetadata` | `page.tsx` または `layout.tsx`                     | HTML `<meta name="robots">` タグ                |
| `X-Robots-Tag` ヘッダー                      | `next.config.ts` の `headers()` またはミドルウェア | HTTP ヘッダーレベル（非 HTML ファイルにも有効） |
| `robots.txt` / `app/robots.ts`               | `app/robots.ts` で `MetadataRoute.Robots` を返す   | クローラーへのパス単位の許可・禁止              |

### 推奨パターン：metadata.robots + robots.ts disallow の併用

```tsx
// app/(internal)/tiles/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function TilesInternalPage() { ... }
```

```ts
// app/robots.ts（既存ファイルへの追記）
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/internal/"], // ← 追記
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

この組み合わせにより：

- `<meta name="robots" content="noindex, nofollow">` が HTML に出力される
- `robots.txt` でクローラーのアクセス自体を抑制する（二重防御）

### Route Group による URL 設計

`app/(internal)/tiles/page.tsx` の Route Group `(internal)` は **URL には現れない**。実際の URL は `/tiles` になる。URL に `internal` を明示したい場合は Route Group を使わず `app/internal/tiles/page.tsx` とすると URL は `/internal/tiles` になる。どちらを選ぶかは命名の意図による：

- URL に `/internal/` を含めたい（robots.txt の disallow ルールと一致させやすい）→ `app/internal/tiles/page.tsx`
- URL をきれいに保ちたい（将来的に `/tiles` として公開するかもしれない）→ `app/(internal)/tiles/page.tsx` だが robots.txt の disallow パスは別途指定が必要

**Phase 7 推奨: `app/internal/tiles/page.tsx`** — URL が `/internal/tiles` となり robots.ts の `disallow: '/internal/'` と完全に一致する。

### storybook との比較（既存実例）

既存の `src/app/(new)/storybook/page.tsx` は以下を実装している：

```tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

robots.txt への disallow 追加は行っていない。Phase 7 では storybook と同じ最小パターン（metadata のみ）から始めて、必要なら robots.ts を追記する方針でよい。

### `generateMetadata` vs 静的 `metadata` の使い分け

- 検証ルートは動的情報不要のため **静的 `metadata` オブジェクト**で十分
- `generateMetadata` は動的ルートパラメータや外部データに依存する場合に使用

### X-Robots-Tag ヘッダーが必要なケース

HTML 以外のファイル（PDF, 画像等）を noindex にしたい場合や、サイト全体に一括適用したい場合に有効。検証ルートのような単一ページ用途では `metadata.robots` で十分。

---

## セクション 2: tile-grid 定数（128px / 8px）を CSS Module と JS で共有する手法

### 各手法の Turbopack 対応状況（2025 年 5 月時点）

| 手法                                                               | Turbopack 対応                  | 保守性 | 型安全性              | SSR 互換 |
| ------------------------------------------------------------------ | ------------------------------- | ------ | --------------------- | -------- |
| CSS Module `:export` 構文                                          | **不明確・要検証**              | 中     | 中（型定義手書き）    | OK       |
| CSS Module `@value` 規則                                           | **非サポート** (Issue #85173)   | 低     | 低                    | OK       |
| Sass 変数 export                                                   | **非サポート** (Issue #88544)   | 低     | 低                    | OK       |
| CSS Custom Properties（globals.css）                               | **完全対応**                    | 高     | 低（JS 参照は文字列） | OK       |
| インライン CSS Variable（`style={{ '--tile-cell-px': '128px' }}`） | **完全対応**                    | 高     | 中（TS 定数から注入） | OK       |
| PostCSS plugin で TS 定数を CSS 注入                               | Turbopack では PostCSS 制約あり | 低     | 高                    | OK       |

#### Turbopack の CSS Module 制限（公式 Issues 確認済み）

- `@value` ルール: Issue #85173 にて「Turbopack は `@value` を未実装（CSS variables に superseded）」と明記。本番・開発どちらでも未解決の値のまま出力される。
- Sass 変数 export: Issue #88544 にて「LightningCSS も Sass 変数 export を未実装のため、Webpack 使用時のみ動作する」と明記。

### 推奨手法：TS 定数 + CSS Custom Properties の二重管理

```ts
// src/lib/tile-constants.ts
export const TILE_CELL_PX = 128;
export const TILE_GAP_PX = 8;

/** タイル w×h セルのスタイルオブジェクトを返す */
export function tileSizeStyle(w: number, h: number): React.CSSProperties {
  return {
    width: w * TILE_CELL_PX + (w - 1) * TILE_GAP_PX,
    height: h * TILE_CELL_PX + (h - 1) * TILE_GAP_PX,
  };
}
```

```css
/* src/app/globals.css（既存ファイルへの追記） */
:root {
  --tile-cell-px: 128px;
  --tile-gap-px: 8px;
}
```

- **JS 側**: `TILE_CELL_PX` / `TILE_GAP_PX` 定数を直接参照（型安全、計算可能）
- **CSS 側**: `var(--tile-cell-px)` / `var(--tile-gap-px)` を参照
- **二重管理の問題**: 数値変更時に両方更新が必要だが、実態として 128 / 8 はグリッドの根幹仕様であり滅多に変わらない。コメントで両箇所をリンクしておけば十分。

#### インライン CSS Variable 注入パターン（代替案）

```tsx
// CSS variable を TS 定数から直接注入する方法
<div style={{ "--tile-cell-px": `${TILE_CELL_PX}px` } as React.CSSProperties}>
  ...
</div>
```

CSS 側は同様に `var(--tile-cell-px)` で参照できる。定義箇所を TS 1 ヶ所に集約できるメリットがあるが、layout レベルで一度設定すれば全体に伝搬する globals.css 方式の方がシンプル。

#### 採用しない手法の理由

- `:export` 構文: Turbopack での動作保証がないため将来リスクあり（webpack から Turbopack へ移行済みの本プロジェクトでは不採用）
- PostCSS プラグイン: Turbopack は一部 PostCSS plugins との互換制限があり、カスタム plugin 追加は保守コストが高い

---

## セクション 3: タイルレジストリ（コンテンツ集約）の代表的パターン

### 各パターンの比較

| パターン                                              | Next.js 15 + Turbopack                           | 保守性                 | 既存 codegen との整合           |
| ----------------------------------------------------- | ------------------------------------------------ | ---------------------- | ------------------------------- |
| ビルド時 codegen（`scripts/*.ts` → `src/generated/`） | 完全対応（ビルド依存なし）                       | 高（追加忘れゼロ）     | **最高**（既存と同方式）        |
| `import.meta.glob`（Vite スタイル）                   | **非サポート**（webpack / Turbopack では未実装） | 高                     | 低（仕組みが異なる）            |
| 手書き中央集約レジストリ                              | 完全対応                                         | 低（追加忘れが起きる） | 低（既存は codegen に移行済み） |
| ファイルシステムベース規約                            | 完全対応（fast-glob 使用）                       | 高                     | 高（既存が fast-glob を使用）   |

### 既存 codegen の実装確認

`scripts/generate-toolbox-registry.ts` を実地確認した結果、以下のパターンが定着している：

1. **fast-glob** で `src/tools/*/meta.ts` を自動探索
2. **スラッグ→インポート名変換**（`-` → `_`）で TS import 文を生成
3. **サニティチェック**（最小件数アサーション）で構造変化を早期検知
4. **出力ファイルを git 管理**（`src/lib/toolbox/generated/toolbox-registry.ts` 等）

### Phase 7 での推奨方針

既存 codegen を**そのまま踏襲**する。具体的には：

- タイル定義は `src/tools/{slug}/tile.ts`（または既存 `meta.ts` に tile フィールドを追加）として各コンテンツが保有
- `generate-toolbox-registry.ts` を拡張して `tile.ts` も探索対象に含める
- 生成物: `src/lib/tile-registry/generated/tile-registry.ts`

`import.meta.glob` は Vite/Astro 専用で Next.js（webpack/Turbopack）では使えない。`require.context`（webpack 専用）も Turbopack では非サポートのため、**ビルド前スクリプト + fast-glob が唯一の安定した動的探索手段**。

---

## セクション 4: タイルの型契約設計パターン

### 既存の Tileable 型（`src/lib/toolbox/types.ts`）

```ts
export interface Tileable {
  slug: string;
  displayName: string;
  shortDescription: string;
  contentKind: ContentKind; // "tool" | "play"
  icon?: string;
  accentColor?: string;
  publishedAt: string;
  trustLevel: TrustLevel;
}
```

この型は「タイル一覧表示に必要なメタデータ」を定義しており、タイルの**レンダリング方法**は含まない。

### Phase 7 で追加すべき型

Phase 7 のスコープは「タイル表示の箱の仕様」であり、タイルの中身（各ツールの UI）は Phase 8 以降。以下の最小セットが必要：

```ts
// src/lib/tile/types.ts（新規）

/** タイルのセル単位サイズ仕様 */
export interface TileSize {
  /** 横方向のセル数（1〜4 程度） */
  colSpan: number;
  /** 縦方向のセル数（1〜4 程度） */
  rowSpan: number;
}

/** タイルコンポーネントが受け取る基本 props */
export interface TileProps {
  /** タイルのサイズ（レイアウト計算に使用） */
  size: TileSize;
  /** タイルのメタ情報 */
  tileable: Tileable;
}

/** タイルコンポーネントの型 */
export type TileComponent = React.ComponentType<TileProps>;
```

### RSC / Client Component の境界判断

Next.js 公式ドキュメントの原則：

- **Server Component**: データ取得、静的レンダリング、秘密情報不要の場合
- **Client Component**: `useState`, `onClick` 等のインタラクション、ブラウザ API が必要な場合

タイルへの適用：

- `page.tsx`（検証ルートの親）: **Server Component**（`metadata` export のため必須）
- タイルコンポーネント自体: 多くのツールはインタラクション必須のため **Client Component** が基本
- 静的なラベルや情報表示のみのタイル: Server Component も可

**Phase 7 での型契約における境界の扱い**：`TileComponent` は `React.ComponentType<TileProps>` として型定義するだけでよく、Server/Client のどちらかを型で強制する必要はない。各 Phase 8 タイル実装時に `'use client'` を付けるかどうかを判断する。

### Phase 7 スコープの線引き

**Phase 7 に含める（型契約の確定）**:

- `TileSize` インターフェース（colSpan / rowSpan）
- `TileProps` インターフェース（size + tileable）
- `TileComponent` 型エイリアス
- `TILE_CELL_PX` / `TILE_GAP_PX` 定数
- `tileSizeStyle(w, h)` ユーティリティ関数

**Phase 7 に含めない（後続フェーズに先送り）**:

- タイル間のデータ連携インターフェース（入出力 placeholder）— Phase 8 以降の要件が固まってから設計する
- ダッシュボードのレイアウトエンジン型 — Phase 10 スコープ
- ドラッグ&ドロップ関連の型 — Phase 10 スコープ

macOS Widget / iOS Widget / Notion Widget のようなサードパーティウィジェット API では「入出力仕様・データフィード定義」が型契約の中心だが、本サイトのタイルは独立した自己完結ツールが中心であり、タイル間データ連携の需要は現時点では不明確。Phase 7 で先行定義するとオーバーエンジニアリングになるリスクが高い。

---

## 総合推奨サマリー

| トピック         | 推奨アプローチ                                                                                                                   | 根拠                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 隠し検証ルート   | `app/internal/tiles/page.tsx` + `metadata.robots: { index: false, follow: false }` + `robots.ts` への `/internal/` disallow 追加 | 既存 storybook と同パターン。二重防御で確実                        |
| CSS 定数共有     | `src/lib/tile-constants.ts`（TS 定数）+ `globals.css`（CSS Custom Properties）の二重管理                                         | Turbopack で `:export` / `@value` / Sass export が未サポートのため |
| タイルレジストリ | 既存 `generate-toolbox-registry.ts` を拡張した codegen                                                                           | 既存パターンとの整合性・fast-glob 活用・追加忘れ防止               |
| 型契約           | `TileSize` / `TileProps` / `TileComponent` の最小セット。タイル間連携は Phase 8 以降                                             | Phase 7 スコープ外要件の先行定義はオーバーエンジニアリング         |
