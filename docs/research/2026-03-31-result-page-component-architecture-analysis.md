# 結果ページコンポーネント（page.tsx）設計上の問題調査

調査日: 2026-03-31
対象ファイル: `src/app/play/[slug]/result/[resultId]/page.tsx`

---

## 1. 現在の page.tsx の状態

### ファイル規模

- **総行数: 601行**
- `generateStaticParams` + ユーティリティ関数: 38行
- `generateMetadata`: 70行
- コンポーネント本体 `PlayQuizResultPage`: 453行（148行〜601行）

### 条件分岐の数と複雑さ

`detailedContent.variant` に対する直接的な比較分岐は **9箇所**:

```
L255: detailedContent.variant === "contrarian-fortune"
L261: detailedContent.variant !== "contrarian-fortune"
L262: detailedContent.variant !== "character-fortune"
L271: detailedContent.variant !== "contrarian-fortune"
L272: detailedContent.variant !== "character-fortune"
L289: detailedContent.variant !== "contrarian-fortune"
L290: detailedContent.variant !== "character-fortune"
L344: detailedContent.variant === "contrarian-fortune"
L452: detailedContent.variant === "character-fortune"
```

これに加えて `slug === "character-personality"` による互換性データ取得の分岐が3箇所（L92, L178, L182）ある。

### 各variantのコード量（JSX行）

| variant                                         | JSX行数   | 備考                                    |
| ----------------------------------------------- | --------- | --------------------------------------- |
| 共通ヘッダー部（クイズ名・icon・title）         | 約16行    | 全variantで使用                         |
| description / CTA1 の条件分岐                   | 約33行    | contrarian/character-fortune では非表示 |
| 標準 detailedContent（traits/behaviors/advice） | 約54行    | variant=undefined の場合                |
| contrarian-fortune 専用レイアウト               | **107行** | L342〜L448                              |
| character-fortune 専用レイアウト                | **125行** | L450〜L574                              |
| 共通フッター（share/compatibility/related）     | 約26行    | 全variantで使用                         |

variant専用JSXの合計は **286行（全601行の47.6%）**。

---

## 2. page.module.css の状態

- **総行数: 398行**
- 共通スタイル（L1〜L215）: **215行（54.0%）**
- contrarian-fortune 専用スタイル（L216〜L360）: **145行（36.4%）**
- character-fortune 専用スタイル（L361〜L398）: **38行（9.5%）**

variant固有スタイルの合計: **183行（46.0%）**

CSSファイルの約半分がvariant固有であり、新variantが追加されるたびに同ファイルへの追記が続く構造になっている。

---

## 3. Next.js App Router のアーキテクチャ上の選択肢

### 現在の設計

`/play/[slug]/result/[resultId]/page.tsx` が単一のServer Componentとして存在し、`generateStaticParams` で全クイズ全結果のHTMLを静的生成する。variant判定はレンダリング時の条件分岐で行う。

### 代替案の比較

#### (A) variant ごとに専用の React コンポーネント（Server Component）を作成し、page.tsx から呼び出す

構成例:

```
src/app/play/[slug]/result/[resultId]/
  page.tsx                          ← ルーティング・メタデータ・variant振り分けのみ
  _variants/
    StandardResultLayout.tsx        ← 標準形式
    ContrarianFortuneLayout.tsx     ← contrarian-fortune
    CharacterFortuneLayout.tsx      ← character-fortune
    ImpossibleAdviceLayout.tsx      ← 将来追加
```

**メリット:**

- page.tsx は dispatch ロジックのみに専念できる（大幅に slim 化）
- 各variant のレンダリングロジックが独立したファイルに分離され、読みやすく独立テスト可能
- CSS Modules も variant ごとに分割できる（`ContrarianFortuneLayout.module.css` 等）
- コーディングルール「関心の分離を徹底する」「コンポーネントは狭く読みやすく独立してテスト可能に保つ」に合致
- 新variantの追加時に既存ファイルへの影響を最小化できる

**デメリット:**

- ファイル数が増加する（各variant + CSS Module で variant数 × 2ファイル）
- generateStaticParams と generateMetadata は page.tsx に残るため、完全な分離にはならない
- ルーティング構造は変わらないため SSG の仕組みはそのまま活用できる

**SSG互換性:** 完全に互換。`generateStaticParams` は page.tsx に残るだけでよい。

---

#### (B) slug ごとに完全に別の page.tsx を作る（ルーティング変更）

構成例:

```
src/app/play/
  contrarian-fortune/result/[resultId]/page.tsx
  character-fortune/result/[resultId]/page.tsx
  [slug]/result/[resultId]/page.tsx   ← 標準形式のみ
```

**メリット:**

- 各クイズ種別が完全に独立したルートになる
- 不要なコードが一切含まれない（ビルド成果物がクリーン）
- 将来的なクイズ固有機能（固有のURLパラメータなど）を自由に実装できる

**デメリット:**

- 現在 `/play/[slug]/result/[resultId]` という統一URLパターンを破壊する
- SEO上、既存の静的URLが変わる場合リダイレクト設定が必要
- `[slug]` ルートと固定ルート（例: `contrarian-fortune`）の共存時、Next.js はより具体的なルートを優先するため技術的には実現可能だが、管理が複雑になる
- クイズ追加のたびにルートディレクトリを作る必要があり、スケーラビリティが低い
- generateStaticParams が分散するため、全結果ページ一覧のメンテナンスが難しくなる

**SSG互換性:** 互換だが実装コストと管理コストが高い。

---

#### (C) 条件分岐は page.tsx に残すが、各 variant のレンダリングを別ファイルに切り出す（現状の改良版）

これは (A) とほぼ同じ。「page.tsx の JSX 内に条件分岐は残すが、その中身を `<ContrarianFortuneLayout ... />` のように別コンポーネントに委譲する」形。実質的に (A) と同義となる。

**現状との差分:**

- page.tsx の行数は 600行 → 約 200〜250行に削減される
- 条件分岐のエントリポイントは page.tsx に残るため、variant の種類は一目で把握できる

---

## 4. バンドルサイズへの影響

### このページの SSG の仕組み

`generateStaticParams` が全クイズ × 全結果IDの組み合わせを列挙し、ビルド時に静的HTMLを生成する。HTMLはサーバーから配信されるが、クライアント側のインタラクション（展開ボタン、シェアボタン等）のためにJSバンドルが読み込まれる。

### Client Component の一覧

このページで使用される `"use client"` コンポーネント:

| コンポーネント         | ファイル                                     | 役割                                       |
| ---------------------- | -------------------------------------------- | ------------------------------------------ |
| `DescriptionExpander`  | `result/[resultId]/DescriptionExpander.tsx`  | 説明文の展開/折りたたみ（useState）        |
| `CompatibilityDisplay` | `result/[resultId]/CompatibilityDisplay.tsx` | 相性表示（CompatibilitySectionのラッパー） |
| `ShareButtons`         | `src/play/quiz/_components/ShareButtons.tsx` | SNSシェアボタン（useState, useCallback）   |

`RelatedQuizzes` と `RecommendedContent` はServer Componentであることを確認済み（`"use client"` ディレクティブなし）。

### クライアントJSチャンクの構成

`page_client-reference-manifest.js` の `entryJSFiles` から、このページが追加で読み込むチャンク:

| チャンク              | サイズ          | 役割                                                                                            |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `b827744a1f0930d9.js` | 32,338 bytes    | 共通レイアウト用 Client Components（NavLinks, MobileNav 等）                                    |
| `629098185c6f3c9c.js` | 39,576 bytes    | 共通 Client Components（ShareButtons含む）                                                      |
| `3bedfde6abca2270.js` | **7,341 bytes** | このページ固有（DescriptionExpander, CompatibilityDisplay, ShareButtons, CompatibilitySection） |

**page固有チャンク（3bedfde6）は 7.3KB**。これは小さいが、variant追加に伴い増加していく。

### SSGとバンドルサイズの関係

- **HTMLはSSG**: ページ固有のレンダリングロジック（variant切り替えの if/else）はサーバー側で実行されるため、クライアントバンドルには含まれない
- **Client ComponentのJSは全variant共通**: DescriptionExpander / CompatibilityDisplay / ShareButtons のコードは、contrarian-fortuneページでも character-fortuneページでも同一チャンクとして読み込まれる
- **variant判定ロジック自体はクライアントに届かない**: `detailedContent.variant === "contrarian-fortune"` という判定はサーバー側でのみ実行される

**重要な結論**: 現在の構成では、バンドルサイズへの直接的な悪影響は限定的。問題の本質はバンドルサイズよりも「開発工数」「可読性」「拡張性」にある。

---

## 5. 将来の拡張計画（B-250〜B-257）

### 残り7コンテンツの詳細

| バックログID | コンテンツ                  | 結果数 | 備考              |
| ------------ | --------------------------- | ------ | ----------------- |
| B-250        | character-fortune（追加分） | 6      | 既存variantの拡充 |
| B-251        | impossible-advice           | 7      | 新variant追加     |
| B-252        | unexpected-compatibility    | 8      | 新variant追加     |
| B-253        | character-personality       | 24     | 新variant追加     |
| B-254        | animal-personality          | 12     | 新variant追加     |
| B-255        | music-personality           | 8      | 新variant追加     |
| B-256        | traditional-color           | 8      | 新variant追加     |
| B-257        | yoji-personality            | 8      | 新variant追加     |

### 全variant実装後の page.tsx の推定規模

**現在（2 custom variants）:**

- page.tsx: 601行
- page.module.css: 398行

**B-250〜B-257が全て実装された場合（9 custom variants + standard）:**

- 各variant の JSX: 平均100〜125行と仮定
- 追加分: 7 variants × 平均110行 = 770行
- generateMetadata への条件分岐追加: 各variant ごとに増加
- **推定 page.tsx: 1,400〜1,500行**
- **推定 page.module.css: 800〜900行**

### 条件分岐の増殖パターン

現在の否定条件パターンがさらに複雑化する:

```tsx
// 現在（2 custom variants）
(
  !detailedContent ||
  (detailedContent.variant !== "contrarian-fortune" &&
    detailedContent.variant !== "character-fortune")
)(
  // B-257まで完了後（8 custom variants）
  !detailedContent ||
    (detailedContent.variant !== "contrarian-fortune" &&
      detailedContent.variant !== "character-fortune" &&
      detailedContent.variant !== "impossible-advice" &&
      detailedContent.variant !== "unexpected-compatibility" &&
      detailedContent.variant !== "character-personality" &&
      detailedContent.variant !== "animal-personality" &&
      detailedContent.variant !== "music-personality" &&
      detailedContent.variant !== "traditional-color" &&
      detailedContent.variant !== "yoji-personality"),
);
```

この否定条件リストは、新variantを追加するたびに既存の複数箇所を修正する必要があり、**修正漏れによるバグのリスクが高い**。

---

## 6. コンポーネント分離の実現可能性まとめ

### 推奨アーキテクチャ: 選択肢(A)

`page.tsx` に variant dispatch ロジックを残し、各variant のレンダリングを専用の Server Component ファイルに切り出す。

**分離後の page.tsx の責務:**

1. `generateStaticParams` — 静的生成パラメータの列挙
2. `generateMetadata` — メタデータ生成（variant固有部分は各variant関数に委譲可能）
3. 共通データ取得（quiz, result, compatFriendTypeId, compatData）
4. 共通JSXの構造（Breadcrumb, card wrapper, shareSection, RelatedQuizzes）
5. `detailedContent.variant` に基づく layout component の選択

**分離後の構造（例）:**

```
src/app/play/[slug]/result/[resultId]/
  page.tsx                                    ← dispatch + 共通構造
  _layouts/
    StandardResultLayout.tsx                  ← variant=undefined
    StandardResultLayout.module.css
    ContrarianFortuneLayout.tsx               ← variant="contrarian-fortune"
    ContrarianFortuneLayout.module.css
    CharacterFortuneLayout.tsx                ← variant="character-fortune"
    CharacterFortuneLayout.module.css
  DescriptionExpander.tsx                     ← 既存
  CompatibilityDisplay.tsx                    ← 既存
```

**SSG互換性:** `generateStaticParams` は page.tsx に残るため、完全互換。静的生成に影響なし。

### 各選択肢のまとめ

| 選択肢                                | メリット                         | デメリット                      | SSG互換      |
| ------------------------------------- | -------------------------------- | ------------------------------- | ------------ |
| (A) variant別コンポーネント分離       | 可読性・拡張性が高い、テスト容易 | ファイル数増加                  | あり         |
| (B) slug別の完全なルート分離          | 完全独立                         | URL変更・管理コスト大           | あり（複雑） |
| (C) page.tsx内 + 別ファイルに切り出し | (A)と実質同じ                    | (A)と同じ                       | あり         |
| 現状維持                              | ファイル数少ない                 | 1,500行超のファイルになる見込み | あり         |

---

## 総合評価

### 問題の深刻度

**現時点（2 custom variants）では機能的に問題はない**が、以下の観点で構造的な問題を抱えている:

1. **拡張性**: B-250〜B-257が全て実装されると page.tsx が 1,400〜1,500行に達する
2. **否定条件の増殖**: `variant !== "X" && variant !== "Y" && ...` の否定リストが修正漏れのバグ要因になる
3. **開発工数**: 1つのvariantを編集するために 600行超のファイルを開く必要がある
4. **CSS管理**: 398行のCSSファイルの半分がvariant固有で、全体を把握しにくい
5. **バンドルサイズへの影響**: SSGとClient Component分離の仕組みにより直接的な影響は限定的だが、コードサイズの増大はビルド時間に影響する

### バンドルサイズについての注記

Owner指摘の「バンドルサイズ」については、SSGページのサーバー側ロジック（variant判定）はクライアントJSに含まれないため、現在の単一 page.tsx 構成がクライアントバンドルに直接悪影響を与えているわけではない。問題はむしろ**開発工数・可読性・拡張性**に集中している。ただし、各variantが固有の Client Component を持つようになった場合は、バンドルサイズへの影響が生じる可能性がある。

### 推奨対応

選択肢(A)を採用する。各variant の JSXロジックを `_layouts/` 以下の専用 Server Component に分離し、`page.tsx` は dispatch とメタデータ生成に専念させる。CSS Module も variant ごとに分割することで、個々の variant の開発・修正が独立して行えるようになる。

このアーキテクチャ変更は B-251 以降の variant 実装に先行して行うことが望ましい。現在（2 custom variants）の段階での移行コストが最も低く、B-257まで実装が進んだ後では分離作業の難易度が上がる。
