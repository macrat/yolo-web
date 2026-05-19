# cycle-195 Phase 7 事前調査: メタ型構造・codegen・定数共有の現状

調査日: 2026-05-19

---

## 1. 既存のツールメタ型の構造

### 共通型定義

`src/tools/types.ts` に `ToolMeta` インタフェースが定義されている。

主要フィールド:

| フィールド          | 型                        | 備考                                                         |
| ------------------- | ------------------------- | ------------------------------------------------------------ |
| slug                | string                    | URL識別子                                                    |
| name                | string                    | 日本語表示名                                                 |
| nameEn              | string                    | 英語名                                                       |
| description         | string                    | 120-160字、meta description用                                |
| shortDescription    | string                    | ~50字、カード表示用                                          |
| keywords            | string[]                  | SEOキーワード                                                |
| category            | ToolCategory              | "text" / "encoding" / "developer" / "security" / "generator" |
| relatedSlugs        | string[]                  | 関連ツールのslug                                             |
| publishedAt         | string                    | ISO 8601                                                     |
| updatedAt?          | string                    | ISO 8601                                                     |
| structuredDataType? | string                    | JSON-LD @type                                                |
| trustLevel          | TrustLevel                |                                                              |
| howItWorks          | string                    | ゾーン3「このツールについて」用                              |
| faq?                | Array<{question, answer}> | FAQPage JSON-LD用                                            |

参照: `src/tools/types.ts:10-43`

`ToolDefinition` は `{ meta: ToolMeta }` のラッパー型。参照: `src/tools/types.ts:41-43`

**タイル関連フィールドはまだ存在しない。** Phase 7.1 で追加が必要。

### 代表ツールの meta.ts 確認

- `src/tools/keigo-reference/meta.ts` — category: "text", trustLevel: "curated"
- `src/tools/sql-formatter/meta.ts` — category: "developer", trustLevel: "verified"
- `src/tools/json-formatter/meta.ts` — category: "developer", trustLevel: "verified"

すべて同一の `ToolMeta` インタフェースを満たし、import は `@/tools/types` から。

### メタ型の使用箇所

- `src/tools/registry.ts` — `src/tools/generated/tools-registry.ts` の re-export
- `src/tools/generated/tools-registry.ts` — codegen 生成、`toolsBySlug`、`allToolMetas`、`getAllToolSlugs` を export
- `src/lib/toolbox/types.ts` — `ToolMeta` を import して `toTileable()` adapter に使用
- `src/lib/toolbox/generated/toolbox-registry.ts` — codegen 生成、`Tileable[]` に変換
- `src/lib/seo.ts`、`src/app/sitemap.ts` — SEO / サイトマップ生成に使用
- `src/tools/_components/` — カード・グリッド・レイアウト等の表示コンポーネントが参照

---

## 2. 他コンテンツ群のメタ構造

### 2-a. 遊び (play)

#### 共通ビュー型

`src/play/types.ts` に `PlayContentMeta` インタフェース。

主要フィールド:

| フィールド       | 型                                                  | 備考                       |
| ---------------- | --------------------------------------------------- | -------------------------- |
| slug             | string                                              |                            |
| title            | string                                              | ToolMeta.name に相当       |
| shortTitle?      | string                                              | 15文字超タイトルの短縮版   |
| description      | string                                              | ~60字                      |
| shortDescription | string                                              | ~30字                      |
| icon             | string                                              | 絵文字 (ToolMetaにはない)  |
| accentColor      | string                                              | CSS hex (ToolMetaにはない) |
| keywords         | string[]                                            |                            |
| publishedAt      | string                                              | ISO 8601                   |
| updatedAt?       | string                                              | ISO 8601                   |
| trustLevel       | TrustLevel                                          |                            |
| trustNote?       | string                                              |                            |
| contentType      | "quiz" \| "game" \| "fortune"                       |                            |
| category         | "fortune" \| "personality" \| "knowledge" \| "game" |                            |
| seoTitle?        | string                                              |                            |

参照: `src/play/types.ts:11-60`

#### ゲーム (GameMeta)

`src/play/games/types.ts` に `GameMeta` インタフェース。`PlayContentMeta` より多くのフィールドを持つ（`difficulty`、`statsKey`、`isDaily`、`ogpSubtitle`、`sitemap`、`seo`、`valueProposition`、`usageExample`、`faq`、`relatedGameSlugs`）。

レジストリ: `src/play/games/registry.ts` — `gameEntries: GameMeta[]` にインライン定義（per-slug meta.ts なし）。4件: kanji-kanaru / yoji-kimeru / nakamawake / irodori。

#### クイズ (QuizMeta)

`src/play/quiz/types.ts` に `QuizMeta` インタフェース。多数の `DetailedContent` variant union型も定義。

レジストリ: `src/play/quiz/registry.ts` — `quizEntries: QuizDefinition[]` に import。**15件**: kanji-level / kotowaza-level / traditional-color / yoji-level / yoji-personality / impossible-advice / contrarian-fortune / unexpected-compatibility / music-personality / character-fortune / animal-personality / science-thinking / japanese-culture / character-personality / word-sense-personality。

参照: `src/play/quiz/registry.ts:1-34`

#### 占い (Fortune)

1件のみ。`src/play/registry.ts` に `fortunePlayContentMeta` 定数として直書き（per-slug meta.ts なし）。slug="daily"、contentType="fortune"。

#### 集約

`src/play/registry.ts` の `allPlayContents` が GameMeta → PlayContentMeta、QuizMeta → PlayContentMeta の変換 adapter（`gameMetaToPlayContentMeta`、`quizMetaToPlayContentMeta`）を経由して統合。

**合計 20件**: ゲーム4 + クイズ15 + 占い1。これは `play/registry.ts:93` のコメントおよび `toolbox-registry.ts:107` の生成時コメントと一致。

### 2-b. チートシート (CheatsheetMeta)

`src/cheatsheets/types.ts` に `CheatsheetMeta` インタフェース。`sections: CheatsheetSection[]` フィールドを持つのが特徴。**7件**: cron / git / html-tags / http-status-codes / markdown / regex / sql。

Phase 9.2 でブログ記事に転換予定。Phase 7 の Tileable 型契約には含まれていない（`src/lib/toolbox/generated/toolbox-registry.ts` のコメントにも "TOOLS" と "PLAY" のみ記載）。ただし `scripts/generate-toolbox-registry.ts` は cheatsheets の registry も生成対象に含めている。

### 2-c. 辞典 (dictionary / humor-dict)

- `src/dictionary/_lib/types.ts` の `DictionaryMeta` 型がある（slug, publishedAt, updatedAt, name, trustLevel, valueProposition?, faq? のフィールド）。
- `src/humor-dict/` の `HumorDictMeta` は独立した型（publishedAt, updatedAt, title, description のみのシンプルな構造）。

Phase 9.3 で再編対象。Phase 7 のタイル型契約が直接触れる必要はない（toolbox registry の scope 外）。

---

## 3. 既存の codegen / レジストリの仕組み

### generate-toolbox-registry.ts

`scripts/generate-toolbox-registry.ts` が以下の3ファイルを生成:

1. `src/lib/toolbox/generated/toolbox-registry.ts` — 統合 `Tileable[]` レジストリ（tools + play）
2. `src/tools/generated/tools-registry.ts` — tools のみのレジストリ
3. `src/cheatsheets/generated/cheatsheets-registry.ts` — cheatsheets のみのレジストリ

実行トリガー: `prebuild`、`predev`、`pretest` すべてで走る。コマンド: `npm run generate:toolbox-registry`。

ツールは `src/tools/*/meta.ts` を fast-glob で自動発見（per-slug meta.ts 方式）。Play は per-slug meta.ts がないため `src/play/registry.ts` を静的 import して使用。Cheatsheets は `src/cheatsheets/*/meta.ts` を自動発見。

参照: `scripts/generate-toolbox-registry.ts`

### 公開 API (toolbox)

- `src/lib/toolbox/registry.ts` — `getAllTileables()` / `getTileableBySlug()` を export
- `src/lib/toolbox/tile-loader.ts` — `getTileComponent(slug)` を export。現時点ではすべて `FallbackTile`。Phase 7（B-314）で slug ごとの dynamic import 分岐を追加する拡張ポイントがコメントで示されている。

### Tileable 型（既存）

`src/lib/toolbox/types.ts:17-46` に定義済み:

```
interface Tileable {
  slug: string
  displayName: string
  shortDescription: string
  contentKind: ContentKind  // "tool" | "play"
  icon?: string
  accentColor?: string
  publishedAt: string
  trustLevel: TrustLevel
}
```

`toTileable(meta, contentKind)` adapter 関数も同ファイルに定義（overload で ToolMeta / PlayContentMeta の両方に対応）。

### TileComponentProps / TileComponentLoader

`src/lib/toolbox/tile-loader.ts:37-40`:

```
interface TileComponentProps {
  slug: string
}
type TileComponentLoader = React.ComponentType<TileComponentProps>
```

現時点ではコンポーネント参照は `Tileable` 型に含まれていない（意図的な分離設計）。

---

## 4. Phase 7 で扱う対象範囲の数値実体

| 種別         | 計画記載数 | 実測数 | 一致状況 |
| ------------ | ---------- | ------ | -------- |
| ツール       | 34         | 34     | 一致     |
| ゲーム       | 4          | 4      | 一致     |
| クイズ       | 15         | 15     | 一致     |
| 占い         | 1          | 1      | 一致     |
| **遊び合計** | **20**     | **20** | **一致** |

ツール34件: `src/tools/generated/tools-registry.ts:99` の `// Count at generation time: tools=34` および実ディレクトリ数（`ls | grep -v shared | wc -l = 34`）で確認。

遊び20件: `src/play/registry.ts:93` のコメントおよび `src/lib/toolbox/generated/toolbox-registry.ts:107` の生成時コメント `play=20` で確認。内訳はゲーム4（games/registry.ts）+ クイズ15（quiz/registry.ts: 15エントリ）+ 占い1（daily、play/registry.ts に定数）。

B-365 で課題として挙げられていた「30→34、13→20 の訂正」は **現時点では design-migration-plan.md に既に正しく記載されている**（Phase 8.1: 34ルート、Phase 8.2: ゲーム4+クイズ15+占い1）ことを確認。

チートシート7件（Phase 9.2対象）は tools/play の Tileable 集計には含まれない。

---

## 5. CSS Module と JS 定数の値共有手法の既存事例

**結論: `:export` 構文の使用事例なし。CSS カスタムプロパティを TS 側から import する事例もなし。**

調査範囲で確認された既存の共有パターン:

1. **JS 定数ファイルのみ**: `src/lib/constants.ts`（SITE_NAME, BASE_URL）、`src/play/games/yoji-kimeru/_lib/constants.ts` 等。
2. **Shiki の CSS 変数**: `src/lib/highlight.ts` が `--shiki-dark` / `--shiki-dark-bg` CSS 変数を参照しているが、これは Shiki ライブラリの規約であり、JS-CSS 値共有の独自設計ではない。
3. **ToolsGrid.module.css**: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` / `gap: 1rem` — タイルサイズとは別物の一覧グリッド設定。

**FallbackTile.tsx** の `padding: "8px"` はインライン style で定数化されていない（フォールバック用の仮実装）。

### Phase 7.2 に向けた含意

既存のプロジェクトには CSS Module `:export` 構文や CSS custom property → TS import の先例がない。Phase 7.2 では新規に以下を決定する必要がある:

- `TILE_CELL_PX = 128`、`TILE_GAP_PX = 8` を `src/tools/_constants/tile-grid.ts`（plan記載）または `src/lib/toolbox/tile-grid.ts` に定義
- CSS Module 側との共有方法（`:export` 構文 or CSS `var(--tile-cell, 128px)` 等）を Phase 7.2 で新規設計として確定

---

## まとめ / Phase 7 実装上の注意点

1. **Tileable 型は既存** — `src/lib/toolbox/types.ts` に Phase 2 で定義済み。Phase 7.1 ではこれに「タイル用コンポーネント参照・推奨サイズ・placeholder 等」を**追加する**か、別途 `TileRegistration` 型を並設するかを判断する。
2. **tile-loader.ts に拡張ポイントあり** — `getTileComponent(slug)` 内の `if (slug === "xxx") { return dynamic(...) }` パターンがコメントで明示。Phase 7.3 以降の実装時は当該箇所を拡張する。
3. **play の codegen 対応なし** — play は per-slug meta.ts がなく、`src/play/registry.ts` を静的 import する方式。Phase 7 でタイル定義を追加する場合、play は games/registry.ts / quiz/registry.ts の GameMeta / QuizMeta にフィールド追加 or 別のタイル定義構造が必要。
4. **CSS-JS 値共有の先例なし** — Phase 7.2 でプロジェクト初の設計判断が必要。
5. **hidden 検証ルート未整備** — `/internal/tiles` 等は未実装。Phase 7.3 で新設。
6. **数値の一致確認済** — ツール34件・遊び20件（ゲーム4+クイズ15+占い1）は計画と実体が一致。
