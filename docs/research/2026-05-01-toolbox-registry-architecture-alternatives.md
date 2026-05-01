---
title: 道具箱メタデータ集約方式 ゼロベース設計比較調査
date: 2026-05-01
purpose: yolos.net の道具箱機能（ツール/遊び/チートシート）のメタデータ集約方式を、現在の集中 registry 方式から始め、200〜500 件スケールに耐える代替案をゼロベースで評価する
method: >
  Next.js 16 (App Router, Turbopack) 公式ドキュメント・GitHub Issues 調査、
  shadcn/ui registry ドキュメント精読、Astro Content Collections ドキュメント精読、
  content-collections (npm) の設計確認、Storybook glob パターン調査、
  TypeScript decorator/SWC 互換性調査、プロジェクトソースコード確認
sources:
  - https://nextjs.org/blog/turbopack-incremental-computation
  - https://ui.shadcn.com/docs/registry/getting-started
  - https://docs.astro.build/en/guides/content-collections/
  - https://github.com/sdorra/content-collections
  - https://storybook.js.org/docs/api/main-config/main-config-stories
  - https://nextjs.org/docs/app/api-reference/functions/generate-static-params
  - https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  - https://github.com/swc-project/swc/discussions/5053
  - https://nextjs.org/blog/next-16-1
  - https://github.com/piotrkulpinski/openalternative
---

# 道具箱メタデータ集約方式 ゼロベース設計比較調査

## 調査背景

yolos.net は Next.js 16 (App Router, Turbopack) + TypeScript の静的サイトである。
現在 `src/tools/registry.ts` で 34 ツール、`src/play/registry.ts` 系列で 20 遊び、
`src/cheatsheets/registry.ts` で 7 チートシートを「集中 registry」方式で管理し、
`src/lib/toolbox/registry.ts` の `getAllTileables()` で統合している。

各ツールは `src/tools/{slug}/meta.ts` に `ToolMeta` オブジェクトを export し、
`registry.ts` が全 meta を手動 import して配列に積む構造。
追加時: (1) meta.ts 作成、(2) registry.ts に import 追記、(3) registry.ts の配列に追加 — という 3 ステップが常に必要。

目標は 200〜500 ツール規模への拡張時でも DX・型安全・SSG・HMR を犠牲にしない設計を選ぶこと。

---

## 現状コードの実測

- `src/tools/char-count/` 配下: `Component.tsx`, `Component.module.css`, `logic.ts`, `meta.ts`, `__tests__/`
- 各 meta.ts は `export const meta: ToolMeta = { slug, name, nameEn, description, ... }` の形
- `registry.ts` は 37 行の import + 37 エントリの配列定義 (= 74 行の手動管理)
- 既に `prebuild` スクリプト (`tsx scripts/build-search-index.ts`) が存在しており、`allToolMetas` を import して JSON を生成している

---

## 案 A: 現状の集中 registry 方式（baseline）

### 実装

`src/{tools,play,cheatsheets}/registry.ts` が各 meta.ts を静的 import して配列化。
`src/lib/toolbox/registry.ts` が 3 registry を集約。

### メリット

- TypeScript の型推論が完全（`ToolMeta[]` として厳密に型付け）
- ビルド時に tree-shaking が最大限に効く
- IDE の「参照を探す」が正確
- 外部ライブラリへの依存追加ゼロ

### デメリット

- ツール追加: 必ず 3 ファイル操作（meta.ts 新規 + registry.ts import 追記 + 配列追記）
- 削除時に registry.ts の import と配列エントリを両方取り残すリスクがある
- 500 件では registry.ts が ~1500 行規模になる（ファイル肥大化）
- ファイル間の暗黙結合（meta.ts を追加しても registry.ts を忘れると動かない）

### スケール耐性

ビルド自体は Turbopack の差分キャッシュで高速を維持できるが、DX（開発者体験）の観点で管理コストが線形増加する。

---

## 案 B: ファイルシステムスキャン（ビルド時動的検出）

### 概要

Next.js 側から `src/tools/*/meta.ts` を glob で検出し、動的に import して registry を構成する。

### 実現可能性（Next.js App Router + Turbopack）

**重要な制約**：`import.meta.glob` は Vite 固有の API であり、Next.js (webpack/Turbopack) では使用できない。

webpack の `require.context()` は Next.js のビルドパイプラインで使用可能だが、
引数はリテラルのみ（変数不可）、Turbopack での対応状況が不安定（2025年時点で完全互換は未達）。
GitHub Discussion #20660 で「Next.js での TypeScript glob imports」が継続議論中。

実用的なアプローチは「prebuild Node.js スクリプト（fast-glob 使用）で registry.ts を codegen する」案 C へと収束する。

### HMR 時の挙動

開発時に `src/tools/new-tool/meta.ts` を追加した場合、
動的 import では HMR がファイル追加を検知できない（新 import パスが存在しないため）。
Turbopack は差分計算をするため、新規ファイルはプロセス再起動が必要になる場合がある。
これは案 B の最大の弱点。

### TypeScript 型推論

動的 glob import では `Promise<unknown>[]` となり、ランタイムバリデーション（Zod 等）なしには型安全を保てない。

---

## 案 C: manifest.json + prebuild スクリプト統合

### 概要

各ツールに `src/tools/{slug}/manifest.json` を配置し、
`scripts/generate-registry.ts` が `fast-glob` で全 manifest.json を収集して
`src/generated/registry.ts` を出力する。`prebuild` / `predev` hook で自動実行。

### 実現可能性

**高い**。プロジェクトはすでに `prebuild` + `tsx scripts/*.ts` のパターンを採用している（`build-search-index.ts`）。
同一パターンで registry codegen を追加するだけ。

```json
// src/tools/char-count/manifest.json
{
  "slug": "char-count",
  "name": "文字数カウント",
  "nameEn": "Character Counter",
  "category": "text"
}
```

codegen スクリプトが Zod で manifest を検証し、型付き TypeScript を出力する。

### TypeScript 型推論

生成される `src/generated/registry.ts` は静的 TypeScript ファイルなので、
import 後の型推論は案 A と同等。`as const` も使用可能。
Zod スキーマが manifest の shape を保証し、エラーは codegen 時に検出される。

### デメリット

- `src/generated/` ファイルを git 管理するかどうかの判断が必要
  - git 管理すると diff が煩雑になる
  - git 管理しないと `prebuild` を忘れた際に CI/CD が失敗する
  - `.gitignore` に入れつつ CI で prebuild を必須にする方法が推奨
- JSON はコメント不可（meta.ts の TypeScript と比べてリッチな記述が難しい）
- manifest.json に書ける情報が限られる（`howItWorks`, `faq` の長文を JSON に書くのは辛い）
  - 長文フィールドは meta.ts を残し、manifest.json は slug/category/name 等の最小限のみとするハイブリッドも選択肢

### HMR 時の挙動

`predev` に codegen を含めるため、起動時に registry が最新化される。
開発中に新ツールを追加した場合は dev server 再起動が必要（prebuild 再実行のため）。
これは案 A も同じ（import 追記には再起動が必要）。

---

## 案 D: コンポーネントファイルからメタを export（Next.js metadata export パターン流用）

### 概要

`src/app/(toolbox)/tools/[slug]/page.tsx` に `export const tileMeta: TileMeta = {...}` を直接定義し、
Next.js の `export const metadata` パターンと統一する。

### 実現可能性

技術的には可能。Next.js App Router は `page.tsx` からの named export を活用する（`generateMetadata`, `generateStaticParams` など）。
しかし**集約の問題は解決しない**。

ダッシュボードで全タイルを一覧表示するには、全 page.tsx からメタを収集する必要があるが、
App Router では「全ページを import して meta を取得する」標準 API が存在しない。
結局 prebuild codegen か手動 registry に戻る。

### 既存パターンとの相性

shadcn/ui の registry アーキテクチャ（`registry.json` で全コンポーネントを宣言し `shadcn build` で JSON 出力）が
この方向に近い。ただし shadcn は「配布」目的であり、yolos.net の「一覧表示」目的とは異なる。

### 結論

page.tsx への meta 配置は理論上は綺麗だが、集約機構が別途必要なため案 C と同等の prebuild スクリプトが要る。
DRY にならない（meta の定義場所と集約方法が分離）ため、推奨しない。

---

## 案 E: 動的 import + generateStaticParams 系統

### 概要

`generateStaticParams` で slug を列挙し、各 page.tsx が自身のメタを持つ形。
ダッシュボード側は `generateStaticParams` の出力を元にメタを取得する。

### 実現可能性

**部分的**。`generateStaticParams` は slug のリストを返すだけであり、
リストを生成するには結局「全 slug がどこかに定義されている必要」がある。
現状の `getAllToolSlugs()` が registry から取得しているのと本質的に同じ。

また、`generateStaticParams` 自体は「メタを配布する」仕組みではなく「静的 slug を列挙する」仕組みである。
一覧ページでの全タイル表示には別途 meta 集約が必要であり、この案単体では完結しない。

---

## 案 F: Plugin / package 方式（各ツールが npm package）

### 概要

各ツールが独立 npm package、registry は `package.json` の dependencies から自動生成。pnpm workspaces + Turborepo。

### 評価

**過剰設計**。34〜500 ツール程度のモノレポで package 分割のオーバーヘッド（バージョン管理、publish、依存解決）を
持ち込む合理性はない。Turborepo の適用範囲はマルチチーム・マルチデプロイ環境向け。

参考事例として大規模 OSS（shadcn/ui、Radix UI）があるが、これらは「再利用・配布」が目的であり、
単一サイトの内部コンテンツ管理とは前提が異なる。

**除外**。

---

## 案 G: Decorator / class-based registry

### 概要

`@RegisterTool({ slug: "char-count", ... })` デコレータで meta を宣言。
TypeScript Stage 3 デコレータを使用。

### TypeScript/SWC の現状（2025年）

TypeScript 5.0 以降で Stage 3 デコレータの basic support が追加されたが、
Next.js の SWC コンパイラとの完全互換は 2025年時点で不安定（GitHub swc-project/swc Discussion #5053 で継続議論中）。
legacy `experimentalDecorators` は SWC でサポートされるが、Stage 3 spec-compliant decorators の
`decoratorVersion: "2022-03"` 設定が `next.config.js` レベルでは未サポート。

また、デコレータは「クラスが import される」まで実行されないため、
ファイルをスキャンするだけでは registry に登録されない。
全ツールを何らかの形で import する集約コードが依然必要 = 案 A と変わらない。

**除外**。

---

## 案 H: ハイブリッド（meta.ts + 自動 codegen 集約）

### 概要

- 各ツールは `src/tools/{slug}/meta.ts` を保持（型安全な TypeScript のまま）
- 集約は手動 registry.ts への追記ではなく、`scripts/generate-registry.ts` (fast-glob ベース) が自動生成
- 生成物: `src/generated/toolbox-registry.ts`（型付き TypeScript export）

### 案 C との差異

案 C は manifest を JSON にする。案 H は meta.ts を TypeScript のまま残し、
glob で発見 → dynamic `require()` で読み込み → TypeScript ファイルを出力する codegen スクリプトを使う。

つまり「メタの記述形式は現在の TypeScript のまま」「集約のみ自動化」。

### 実現可能性

`tsx` (TypeScript Execute) は既に devDependencies に存在する。
fast-glob は Next.js の transitive dependency として存在するか、追加コスト極小。

codegen スクリプト例:

```typescript
// scripts/generate-registry.ts
import { glob } from "fast-glob";
const metaFiles = await glob("src/tools/*/meta.ts");
// dynamic import each, collect meta, write src/generated/toolbox-registry.ts
```

生成される `src/generated/toolbox-registry.ts` は静的 TypeScript ファイルなので型推論は完全。
Zod バリデーションを codegen 時に挟むことでスキーマ違反を早期検出できる。

### ツール追加フロー（案 H）

1. `src/tools/new-tool/meta.ts` を作成
2. `npm run dev` を実行（`predev` で codegen が走り registry に自動追加）

**手順が 1 ステップに削減される**（現状 3 ステップ）。

---

## 既知事例の registry 設計まとめ

### shadcn/ui Registry（2025年版）

- `registry.json`（ルート）に全コンポーネントを手動宣言（ファイルパス・type・name）
- `shadcn build` コマンドで `public/r/*.json` を出力
- 各コンポーネントは `registry/[STYLE]/[NAME]/component.tsx` に配置
- **手動宣言型**（ファイルを置くだけでは自動検出されない）
- 目的は「他プロジェクトへの配布」なので、厳密な宣言が求められる
- 2025年 CLI 3.0 で namespaced registries 対応、HTTP content negotiation によるリモート取得

### Astro Content Collections

- `src/content.config.ts` に `defineCollection({ loader: glob({pattern: "**/*.md", base: "src/posts"}) })` を宣言
- **ファイルシステム自動検出 + Zod スキーマ検証**の組み合わせ
- ビルド時に型定義ファイルを自動生成（`.astro/types.d.ts`）
- 案 H のイメージに近いが、Astro 独自のコンパイラ統合がある
- Next.js では同等の仕組みを自前実装（content-collections npm package が近似）

### content-collections (npm: @content-collections/\*)

- `content-collections.ts` に `defineCollection` でディレクトリ・glob・Zod スキーマを宣言
- Next.js の `withContentCollections` wrapper で `next.config.ts` に統合
- ビルド時に型定義を自動生成
- 主な用途はマークダウン/MDX コンテンツ管理
- TypeScript オブジェクト（meta.ts）の自動集約には直接対応していないが、カスタムローダーで拡張可能

### Storybook stories auto-discovery

- `.storybook/main.ts` に `stories: ['../src/**/*.stories.@(ts|tsx)']` のように glob を宣言
- webpack の `require.context` をストーリーブック内部で使用して動的ロード
- **dev 時は HMR でファイル追加を即時反映**（webpack の watch が新ファイルを検知）
- これは webpack が bundler である場合の動的 glob import であり、Next.js + Turbopack では異なる制約がある

### OpenAlternative

- Next.js + Prisma (PostgreSQL) の DB 駆動型ディレクトリサイト
- コンテンツはデータベースに格納され、ファイルシステムで管理しない
- 静的 registry パターンとは設計思想が異なる

---

## 比較表

| 観点                             | A: 集中 registry | B: FS スキャン            | C: manifest.json + codegen    | H: meta.ts + codegen      |
| -------------------------------- | ---------------- | ------------------------- | ----------------------------- | ------------------------- |
| Next.js 16 App Router 実現可能性 | 現状実装済み ◎   | 制約多い △                | 高い ◎                        | 高い ◎                    |
| TypeScript 型推論                | 完全 ◎           | 要 Zod 等 △               | codegen 後は完全 ◎            | codegen 後は完全 ◎        |
| SSG との相性                     | 完全 ◎           | prebuild 必須 ○           | prebuild 必須 ○               | prebuild 必須 ○           |
| HMR 時の挙動                     | 再起動必要 △     | NG (新ファイル検知不可) ✗ | predev 起動時 △               | predev 起動時 △           |
| 200〜500件スケール DX            | 3 ステップ/件 ✗  | N/A                       | 1 ステップ/件 ◎               | 1 ステップ/件 ◎           |
| 既存パターンとの整合             | —                | Vite/Storybook            | prebuild スクリプト既存 ◎     | prebuild スクリプト既存 ◎ |
| 記述形式の柔軟性                 | TypeScript ◎     | TypeScript ◎              | JSON（コメント不可、長文難）△ | TypeScript ◎              |
| 削除時の安全性                   | 取り残しリスク ✗ | 自動削除 ◎                | 自動削除 ◎                    | 自動削除 ◎                |
| 外部依存追加                     | なし ◎           | Vite 等不要だが制約 ✗     | fast-glob（軽量）○            | fast-glob（軽量）○        |
| 実装コスト                       | ゼロ（現状）◎    | 高い ✗                    | 中程度 ○                      | 中程度 ○                  |

（◎=優れる ○=良好 △=許容 ✗=問題あり）

---

## yolos.net コンテキストへの推奨案

### トップ 1 推奨: 案 H（meta.ts + 自動 codegen 集約）

**理由:**

1. **現在の TypeScript meta.ts 形式をそのまま維持できる**
   - `howItWorks`, `faq` 等の長文フィールドを TypeScript で記述できる
   - IDE の補完・型チェックが変わらず利く
   - 既存 34 ツールの移行コストがゼロ

2. **追加コストが 1 ステップに削減される**
   - `src/tools/new-tool/meta.ts` を置くだけで次の `predev`/`prebuild` 時に自動登録
   - registry.ts への手動追記が不要

3. **プロジェクトにすでに `prebuild` + `tsx scripts/` パターンがある**
   - `scripts/build-search-index.ts` が同一パターンで稼働中
   - `scripts/generate-registry.ts` を追加するだけで既存インフラを活用できる

4. **削除・移動が安全**
   - ディレクトリを削除するだけで codegen 時に registry から消える
   - 取り残しリスクがない

5. **500 件スケール時もビルド時間に影響しない**
   - codegen スクリプトは `fast-glob` による I/O のみで高速
   - Turbopack は生成済みの静的 TypeScript ファイルを差分キャッシュで処理

**制約（許容範囲）:**

- `predev` / `prebuild` 必須（既存の `build-search-index.ts` と同じ制約）
- 新ツール追加後は dev server 再起動が必要（現案 A も同様）
- `src/generated/toolbox-registry.ts` の git 管理ポリシー決定が必要（`.gitignore` 推奨）

### トップ 2 推奨: 案 A の改善版（現状維持 + lint ルール補強）

500 件規模への移行を急がない場合、現状の案 A を維持しつつ、以下の補強で課題を緩和する選択肢。

1. **ESLint カスタムルール**で「`src/tools/*/meta.ts` が存在するが `registry.ts` に登録されていない」を検出
2. CI の `typecheck` + lint で取り残しを防止
3. 案 H への移行は 100+ ツール到達時に改めて判断

**実装コスト比較:**

- 案 H 実装（PoC レベル）: `scripts/generate-registry.ts` 約 50 行、`next.config.ts` への hook 追加で 1 サイクル内（0.5 日）
- 案 A 改善: ESLint カスタムルール実装が実は案 H より複雑になりうる

---

## 推奨案（案 H）の実装ステップ概要

### Phase 1: PoC（本サイクルまたは次サイクル）

```
scripts/generate-registry.ts:
  1. fast-glob で src/tools/*/meta.ts を収集
  2. tsx の dynamic import で各 meta を読み込み
  3. Zod で ToolMeta スキーマを検証
  4. 検証済み meta 配列を src/generated/toolbox-registry.ts に書き出し
  5. 同様に src/play/games/*/meta.ts、src/cheatsheets/*/meta.ts にも対応（順次）

package.json:
  "prebuild": "npm run generate:static-assets && npm run generate:registry",
  "predev": 同上
```

### Phase 2: 既存 registry.ts の廃止

- `src/tools/registry.ts` の手動 import 群を削除
- `src/generated/toolbox-registry.ts` から import するよう `src/lib/toolbox/registry.ts` を修正
- 既存の `buildSearchIndex()` も `src/generated/toolbox-registry.ts` から import

### 注意点

- `src/generated/` は `.gitignore` に追加し、CI の `prebuild` ステップで生成
- 現状の play/games と play/quiz は registry 構造が異なるため（GameMeta と QuizMeta が分離）、
  codegen の対応は tools から始めてフェーズを分ける
- fast-glob は `devDependencies` として追加（prod bundle には含まれない）

---

## 参考情報

### Turbopack のスケール特性

Next.js 公式ブログ（2026年1月）によると、Turbopack は「関数レベルの細粒度キャッシュ」を実装しており、
アプリケーション全体のサイズではなく「変更の差分サイズ」にのみ依存する計算モデルを採用している。
500 ページ規模でもビルド時間の線形増加を避けられる。

### Next.js 16.1 ファイルシステムキャッシュ

Next.js 16.1 で `next dev` のファイルシステムキャッシュがデフォルト有効化された。
コンパイル成果物がディスクに永続化されるため、dev server 再起動後も warm cache から高速に復帰できる。
案 H での「新ツール追加時の dev server 再起動」コストはこれにより最小化される。

### HMR の限界

Next.js + Turbopack では「既存ファイルの変更」は HMR で即時反映されるが、
「新規ファイルの追加」は import グラフに存在しないため HMR では検知できない。
これはすべての案（A〜H）に共通する制約であり、案 H 固有の欠点ではない。
