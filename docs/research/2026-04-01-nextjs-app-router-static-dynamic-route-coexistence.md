---
title: Next.js App Router の具体的ルートと動的ルートの共存仕様
date: 2026-04-01
purpose: /play/[slug]/result/[resultId] という動的ルートと /play/contrarian-fortune/result/[resultId] のような具体的ルートを共存させる際のNext.js App Routerの動作仕様を明確化する
method: |
  - Next.js 公式ドキュメント（nextjs.org/docs）の直接取得
  - GitHub vercel/next.js discussions の調査
  - Vercel コミュニティフォーラムの調査
  - 既存コードベース（yolos.net の /src/app/play/ ディレクトリ）の実態調査
sources:
  - https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
  - https://nextjs.org/docs/app/api-reference/functions/generate-static-params
  - https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  - https://nextjs.org/docs/14/app/building-your-application/routing
  - https://github.com/vercel/next.js/discussions/37171
  - https://community.vercel.com/t/dynamic-route-taking-precedence-over-static-route/1636
---

# Next.js App Router の具体的ルートと動的ルートの共存仕様

## 調査の背景

yolos.net では現在 `/play/[slug]/result/[resultId]` という動的ルートで全クイズの結果ページを処理している。今後、特定のslug（`contrarian-fortune`, `character-fortune` など）については専用の具体的ルート（例: `app/play/contrarian-fortune/result/[resultId]/page.tsx`）を設けて、variant別のServer Componentへの分離を実現したいという設計ニーズがある。

この調査では、Next.js App Router において具体的ルートと動的ルートを同じ階層に共存させた場合の動作仕様を4つの観点から明確化する。

---

## 1. ルート優先度：具体的ルートと動的ルートが共存する場合

### 結論

**具体的（named）セグメントは動的セグメント（`[slug]`）よりも常に高い優先度を持つ。**

Next.js App Router のファイルシステムルーティングでは、ルートの特定性（specificity）に基づいて優先度が決まる。URLパスの各セグメントを評価する際、文字列リテラルのフォルダ名は `[slug]` のようなブラケット記法のフォルダより先にマッチする。

### 具体的な例

```
app/
  play/
    [slug]/           ← 動的ルート
      result/
        [resultId]/
          page.tsx
    contrarian-fortune/  ← 具体的ルート（同階層に共存可能）
      result/
        [resultId]/
          page.tsx
    daily/            ← 別の具体的ルート（現在のyolos.netでも実装済み）
      page.tsx
    kanji-kanaru/     ← 別の具体的ルート（現在のyolos.netでも実装済み）
      page.tsx
```

この構造において:

- `/play/contrarian-fortune/result/abc123` へのリクエスト → `app/play/contrarian-fortune/result/[resultId]/page.tsx` が処理
- `/play/music-personality/result/abc123` へのリクエスト → `app/play/[slug]/result/[resultId]/page.tsx` が処理

### 現在のyolos.netでの実証

現在のコードベースの `/src/app/play/` ディレクトリを確認すると、`daily`, `irodori`, `kanji-kanaru`, `nakamawake`, `yoji-kimeru` という具体的ルートフォルダと `[slug]` 動的ルートフォルダが同じ階層に共存している。これはNext.js App Routerがこのパターンを問題なくサポートしていることの実証である。

### 公式ドキュメントの根拠

Next.js の公式ドキュメントには「Routes across directories should not resolve to the same URL path and will cause a build-time error to prevent a conflict」という記述がある。ここで重要なのは「same URL path」という条件であり、`/play/daily` と `/play/[slug]` は異なるURLパスに解決されるため、これは競合に該当しない。

Pages Router のドキュメントには明示的に「Predefined (named) routes take precedence over dynamic routes」という記述があり、App Router でも同じ原則が適用される。コミュニティの知見（GitHub discussions, Vercel community forums）でも「more specific routes typically take precedence over less specific ones」という見解が一致している。

### 注意点

`/play/[slug]/` レベルの単一セグメントと具体的フォルダが共存する場合の優先度の話であり、全く同じURLパスに解決される複数のroute定義（例えば `app/play/contrarian-fortune/page.tsx` が存在するのに同時に `app/play/[slug]/page.tsx` の `generateStaticParams` が `contrarian-fortune` を返す場合）は問題ない。各ルートはそれぞれ独立したページとしてビルドされる。

---

## 2. generateStaticParams の扱い

### 結論

**具体的ルートは動的ルートとは独立したファイルシステムエントリとして扱われる。動的ルートの `generateStaticParams` から具体的ルートのスラッグを除外する必要はない。ただし明示性のために除外することが推奨される。**

### 詳細な動作

Next.js は `generateStaticParams` を各ルートセグメントの `page.tsx` に対して独立して実行する。`app/play/contrarian-fortune/result/[resultId]/page.tsx` の `generateStaticParams` と `app/play/[slug]/result/[resultId]/page.tsx` の `generateStaticParams` は、それぞれ独立してビルド時に呼び出される。

ルートマッチングの段階で既に分岐しているため、もし動的ルートの `generateStaticParams` が `{ slug: 'contrarian-fortune', resultId: 'xxx' }` を返したとしても、そのURLは実際には具体的ルートによって処理されるため、重複した問題は生じない。ただしビルド時にNext.jsが不要なページを生成しようとする可能性があるため、明示的に除外することが望ましい。

### 実装例

```typescript
// app/play/[slug]/result/[resultId]/page.tsx

// 具体的ルートとして分離したslugのリスト
const CONCRETE_ROUTE_SLUGS = ["contrarian-fortune", "character-fortune"];

export async function generateStaticParams() {
  const params: Array<{ slug: string; resultId: string }> = [];
  for (const slug of getAllQuizSlugs()) {
    // 具体的ルートとして分離したslugを除外（推奨）
    if (CONCRETE_ROUTE_SLUGS.includes(slug)) continue;
    for (const resultId of getResultIdsForQuiz(slug)) {
      params.push({ slug, resultId });
    }
  }
  return params;
}
```

```typescript
// app/play/contrarian-fortune/result/[resultId]/page.tsx

export async function generateStaticParams() {
  // このルートに特化したresultIdのみを返す
  // 注意: slugパラメータは不要（このルートには[slug]セグメントがない）
  return getResultIdsForQuiz("contrarian-fortune").map((resultId) => ({
    resultId,
  }));
}
```

### dynamicParams の考慮

`export const dynamicParams = false` を設定すると、`generateStaticParams` で列挙しなかったパラメータへのアクセスで404を返す。具体的ルートと動的ルートを組み合わせる場合、この設定は各ルートで独立して機能する。

---

## 3. 実装パターンのベストプラクティスと注意点

### パターンの概要

このパターン（動的ルートの一部を具体的ルートでオーバーライドする）は yolos.net では `/play/daily/` や `/play/kanji-kanaru/` で既に実装されており（これらは `/play/[slug]/page.tsx` の動的ルートと同じ階層に配置）、Next.js App Router が正常にサポートすることが確認されている。

### ベストプラクティス

**1. ディレクトリ構造の明確化**

具体的ルートと動的ルートを同じ `play/` 下に配置し、フォルダ名で区別する。特別な設定（rewrites や middleware）は不要。

```
app/play/
  [slug]/                    # 汎用動的ルート
    result/
      [resultId]/
        page.tsx
  contrarian-fortune/        # 具体的ルート（优先度高）
    result/
      [resultId]/
        page.tsx
  character-fortune/         # 具体的ルート（优先度高）
    result/
      [resultId]/
        page.tsx
```

**2. レイアウトの共有に注意**

もし `app/play/[slug]/layout.tsx` が存在する場合、`app/play/contrarian-fortune/` は `[slug]` のレイアウトを継承しない（別のディレクトリブランチであるため）。共通レイアウトが必要な場合は `app/play/layout.tsx` レベルで定義するか、共通コンポーネントを切り出す。

なお yolos.net の現行コードベースでは `app/play/[slug]/layout.tsx` は存在せず（`page.tsx` のみ）、この問題は発生しない。

**3. opengraph-image.tsx の扱い**

現在 `app/play/[slug]/opengraph-image.tsx` が存在する。具体的ルートに専用OGPが必要な場合は `app/play/contrarian-fortune/opengraph-image.tsx` を個別に作成する。不要な場合は省略でき、その場合 `/play/[slug]/` の opengraph-image は適用されない（別ブランチのため）。

**4. コード重複の管理**

具体的ルートのpage.tsxと動的ルートのpage.tsxで共通ロジックが生じる場合は、共通処理を分離したモジュール（例: `_lib/` や共有ユーティリティ、`_layouts/` のような既存の構造）に切り出すことで重複を最小化する。

**5. テスト**

各ルートのpage.tsxはそれぞれ独立したテストを持つ。既存の規約に従い `app/play/contrarian-fortune/result/[resultId]/__tests__/page.test.tsx` として作成する。

### 注意点

**Parallel Routes との組み合わせ**

Parallel Routes（`@slot` フォルダ）と具体的ルートのオーバーライドを組み合わせる場合、既知の問題がある（GitHub Issue #61552）。yolos.net では Parallel Routes を使用していないため、この問題は非該当。

**`output: 'export'` モードでの注意**

`next.config.js` で `output: 'export'` を使用する場合、静的エクスポート時にルートの優先度が意図通りに機能しない可能性があるという報告がある。yolos.net では通常のNext.jsビルドを使用しているため非該当。

---

## 4. generateMetadata の扱い

### 結論

**各ルートの `generateMetadata` は完全に独立して機能する。具体的ルートと動的ルートが共存していても、それぞれのルートで定義した `generateMetadata` がそのルートのリクエストに対して独立して呼び出される。**

### 詳細な動作

Next.js の Metadata API はルートセグメントごとに評価される。`app/play/contrarian-fortune/result/[resultId]/page.tsx` の `generateMetadata` は、そのURLへのリクエスト時にのみ呼び出される。`app/play/[slug]/result/[resultId]/page.tsx` の `generateMetadata` は、動的ルートにマッチするURLへのリクエスト時にのみ呼び出される。

公式ドキュメントには「Metadata is evaluated in order, starting from the root segment down to the segment closest to the final page.js segment」という記述があるが、これはレイアウトのメタデータが子ページに継承・マージされるという話であり、具体的ルートと動的ルートの間での干渉を示すものではない。

### params の型の違い

具体的ルートの `generateMetadata` では、`slug` パラメータは存在しない（URLパスに固定されているため）。

```typescript
// app/play/contrarian-fortune/result/[resultId]/page.tsx
// params は { resultId: string } のみ。slugは 'contrarian-fortune' として固定。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ resultId: string }>;
}): Promise<Metadata> {
  const { resultId } = await params;
  const slug = "contrarian-fortune"; // 固定値
  // ...
}
```

```typescript
// app/play/[slug]/result/[resultId]/page.tsx
// params は { slug: string; resultId: string }
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; resultId: string }>;
}): Promise<Metadata> {
  const { slug, resultId } = await params;
  // ...
}
```

### メタデータの継承と上書き

メタデータは浅いマージ（shallow merge）で親から子へ継承される。具体的ルートのpage.tsxで定義したメタデータは、そのルートのレイアウト（`app/layout.tsx` や `app/play/layout.tsx` があれば）のメタデータを上書きする。これは動的ルートと全く同じ挙動であり、特別な考慮は不要。

---

## まとめ

| 観点                 | 動作                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| ルート優先度         | 具体的ルートが動的ルートより常に優先される（自動的・設定不要）                               |
| generateStaticParams | 各ルートで独立して機能。除外は必須ではないが、明示性のために推奨                             |
| generateMetadata     | 各ルートで完全に独立して機能。干渉なし                                                       |
| レイアウト継承       | 具体的ルートは `[slug]/layout.tsx` を継承しない（yolos.netは現在layout.tsxなしのため非問題） |
| opengraph-image      | 具体的ルートに必要なら個別に作成、不要なら省略可                                             |

### yolos.net への適用可否

このパターンは yolos.net の現行アーキテクチャに完全に適用可能である。`app/play/daily/` や `app/play/kanji-kanaru/` が `app/play/[slug]/` と同じ階層で問題なく動作している実績が証拠である。`contrarian-fortune` や `character-fortune` の具体的ルートを追加する実装は、技術的に安全かつ標準的なNext.jsパターンである。
