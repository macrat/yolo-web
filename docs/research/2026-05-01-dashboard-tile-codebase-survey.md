# B-309 ダッシュボード基盤実装のためのコードベース調査

調査日: 2026-05-01

---

## 1. メタ型構造の現状

### ToolMeta（`src/tools/types.ts`）

| フィールド          | 型                       | 備考                                                     |
| ------------------- | ------------------------ | -------------------------------------------------------- |
| slug                | string                   |                                                          |
| name                | string                   | 日本語表示名                                             |
| nameEn              | string                   | 英語名                                                   |
| description         | string                   | SEO用 120-160字                                          |
| shortDescription    | string                   | カード用 ~50字                                           |
| keywords            | string[]                 |                                                          |
| category            | ToolCategory             | "text"\|"encoding"\|"developer"\|"security"\|"generator" |
| relatedSlugs        | string[]                 |                                                          |
| publishedAt         | string                   | ISO 8601                                                 |
| updatedAt?          | string                   |                                                          |
| structuredDataType? | string                   | JSON-LD @type                                            |
| trustLevel          | TrustLevel               |                                                          |
| howItWorks          | string                   | ゾーン3用説明                                            |
| faq?                | Array<{question,answer}> |                                                          |

### PlayContentMeta（`src/play/types.ts`）

| フィールド       | 型                                            | 備考               |
| ---------------- | --------------------------------------------- | ------------------ |
| slug             | string                                        |                    |
| title            | string                                        |                    |
| shortTitle?      | string                                        | 15字超のタイトル用 |
| description      | string                                        | ~60字              |
| shortDescription | string                                        | ~30字              |
| icon             | string                                        | 絵文字             |
| accentColor      | string                                        | CSS hex            |
| keywords         | string[]                                      |                    |
| publishedAt      | string                                        |                    |
| updatedAt?       | string                                        |                    |
| trustLevel       | TrustLevel                                    |                    |
| trustNote?       | string                                        |                    |
| contentType      | "quiz"\|"game"\|"fortune"                     |                    |
| category         | "fortune"\|"personality"\|"knowledge"\|"game" |                    |
| seoTitle?        | string                                        |                    |

### CheatsheetMeta（`src/cheatsheets/types.ts`）

ToolMeta と共通フィールド多数。追加固有フィールド: `nameEn`, `relatedToolSlugs`, `relatedCheatsheetSlugs`, `sections[]`, `valueProposition?`, `usageExample?`

### GameMeta（`src/play/games/types.ts`）

PlayContentMeta の上位型。固有フィールド: `difficulty`, `statsKey`, `isDaily?`, `ogpSubtitle`, `sitemap`, `seo{}`, `valueProposition?`, `usageExample?`, `faq?`, `relatedGameSlugs?`

### レジストリ構造

- **Tools**: `src/tools/registry.ts` — `toolsBySlug: Map`, `allToolMetas: ToolMeta[]`, `getAllToolSlugs()`
- **Play**: `src/play/registry.ts` — `allPlayContents: PlayContentMeta[]`, `playContentBySlug: Map`, `getAllPlaySlugs()`（Game+Quiz+Fortuneを統合変換）
- **Cheatsheets**: `src/cheatsheets/registry.ts` — `cheatsheetsBySlug: Map`, `allCheatsheetMetas: CheatsheetMeta[]`

### 統合時の主要な差分

| フィールド       | Tool                   | Play                                 | Cheatsheet                              |
| ---------------- | ---------------------- | ------------------------------------ | --------------------------------------- |
| name（日本語）   | name                   | title                                | name                                    |
| shortDescription | shortDescription ~50字 | shortDescription ~30字               | shortDescription                        |
| category型       | ToolCategory（5種）    | "fortune/personality/knowledge/game" | CheatsheetCategory（3種）               |
| icon（絵文字）   | なし                   | あり                                 | なし                                    |
| accentColor      | なし                   | あり                                 | なし                                    |
| howItWorks       | あり                   | なし                                 | なし                                    |
| relatedSlugs     | relatedSlugs           | relatedGameSlugs（GameMetaのみ）     | relatedToolSlugs/relatedCheatsheetSlugs |

**「タイル」としての統一ビュー型の案**: `slug`, `title`（nameに統一）, `shortDescription`, `category`（文字列）, `contentKind`（"tool"\|"play"\|"cheatsheet"）, `icon?`, `accentColor?`, `publishedAt` を最小共通項に。

---

## 2. (new) Route Group の現状

### 既存ファイル構成（`src/app/(new)/`）

```
src/app/(new)/
  layout.tsx          — 新デザインシステムのRootLayout
  storybook/
    page.tsx          — robots: {index:false, follow:false} でnoindex
    page.module.css
    StorybookContent.tsx  — "use client"
```

### layout.tsx の特徴（`src/app/(new)/layout.tsx`）

- `@/app/globals.css` を取り込む（new-globals.css ではなく既存のものを共用）
- Header / Footer / ThemeProvider / AchievementProvider / GoogleAnalytics を含む
- `(legacy)` の layout と実質同じ構成（StreakBadge / ThemeToggle あり）

### 道具箱ページの自然な配置

`src/app/(new)/toolbox/page.tsx`（または `/dashboard/page.tsx`）に配置する。

### noindex 慣行

`/storybook` が先例: `metadata.robots = { index: false, follow: false }` を page.tsx に直書き。他に `(legacy)` の動的 result ページ一部でも `robots: { index: true/false }` を page.tsx に設定するパターンが確立している。

---

## 3. 既存の localStorage 利用パターン

### キー名の命名規則

| キー                                   | 場所                             |
| -------------------------------------- | -------------------------------- |
| `yolos-achievements`                   | `src/lib/achievements/badges.ts` |
| `yolos-fortune-seed`                   | `src/play/fortune/logic.ts`      |
| `kanji-kanaru-stats[-{difficulty}]`    | games/kanji-kanaru               |
| `kanji-kanaru-history[-{difficulty}]`  | games/kanji-kanaru               |
| `kanji-kanaru-first-visit`             | games/kanji-kanaru               |
| `kanji-kanaru-difficulty`              | games/kanji-kanaru               |
| `yoji-kimeru-stats[-{difficulty}]`     | games/yoji-kimeru                |
| `nakamawake-stats/history/first-visit` | games/nakamawake                 |
| `irodori-stats/history/first-visit`    | games/irodori                    |
| `humor-dictionary-ratings`             | humor-dict                       |

規則: `{コンテンツ名}-{データ種別}` のハイフン区切り。グローバルな yolos プレフィックスは実績・fortune のみ。

### 読み書きパターン（実績システムが最も整備: `src/lib/achievements/storage.ts`）

- SSR guard: `typeof window === "undefined"` で早期リターン
- isStorageAvailable() 関数でテストキー書き込み確認（games系）
- try-catch で QuotaExceededError / SecurityError をサイレントに吸収
- JSON.parse → 型ガード検証 → フォールバック（defaultStore）
- `schemaVersion` フィールドによるバージョニング（現在 v1、マイグレーションチェーン用コメントあり）

### Provider / hook 化

**共通 `useLocalStorage` hook は存在しない。** 各モジュールが独立した storage.ts を持つパターン。AchievementProvider が Context+Reducer ベースで localStorage を管理する唯一の Provider 基盤。

### 道具箱への示唆

ダッシュボード用には `yolos-toolbox-config` キーで、実績システム同様の `schemaVersion` + isStorageAvailable + try-catch パターンを採用するのが既存慣行に最も沿う。

---

## 4. ドラッグ&ドロップの既存利用

### DnD ライブラリ

**なし。** `package.json` に react-dnd / @dnd-kit / react-grid-layout / muuri / Sortable.js は一切含まれない。

### 依存方針の判定材料

- `dependencies` はランタイム7件のみ（diff, feed, fuse.js, js-yaml, marked, next, next-themes, qrcode-generator, react, react-dom, sanitize-html）
- 明確に軽量志向。
- ただし `DESIGN.md` に `--shadow-dragging` CSS変数が既に定義済みで、`globals.css` にも実装済み。DnD UIのビジュアル仕様は先行して整備されている。

### 推奨

軽量志向に沿い、**PointerEvent ベースの自前実装**か、バンドルサイズが小さい `@dnd-kit/core`（約15KB）が有力候補。react-grid-layout（50KB+）は過剰。

---

## 5. frontend-design スキル / DESIGN.md / 共通コンポーネント

### `.claude/skills/frontend-design/SKILL.md`

詳細は `DESIGN.md` に委譲。概要:

- Concept: シンプル・洗練・邪魔しない
- Do: パネル並列デザイン、シンプルテキスト、挙動を伝えるアニメーション
- Don't: 派手な装飾、過度なアニメーション、グラデーション
- 角丸: インタラクティブ要素は `--r-interactive`、その他は `--r-normal`
- 影: ボタン `--shadow-button`、ドラッグ中 `--shadow-dragging`

### DESIGN.md タイル UI 関連規約

- パネルには影なし。ドラッグ中のみ `--shadow-dragging` を適用（66行目, 82行目）
- `--shadow-dragging` は globals.css に定義済み

### `src/components/` 共通コンポーネント（cycle-171 で実装の新系列）

`src/components/` 配下（PascalCase ディレクトリ構造）:

- `Panel/` — パネル基盤
- `Button/` — ボタン
- `Input/` — 入力
- `Breadcrumb/` — パンくず
- `ToggleSwitch/` — トグル
- `Pagination/` — ページネーション
- `ShareButtons/` — シェアボタン
- `ThemeProvider/`, `ThemeToggle/` — テーマ
- `Footer/`, `Header/` — レイアウト

旧系列 (`src/components/common/`) も存在するが新系列への移行中と思われる。

---

## 既存資産の切り分け

### そのまま使える資産

| 資産                                                    | 場所                              | 用途                         |
| ------------------------------------------------------- | --------------------------------- | ---------------------------- |
| `(new)/layout.tsx`                                      | `src/app/(new)/layout.tsx`        | 道具箱ページのレイアウト基盤 |
| `Panel` コンポーネント                                  | `src/components/Panel/`           | タイルの基本構造             |
| `Button`, `Input`, `ToggleSwitch`                       | `src/components/*/`               | ダッシュボードUI部品         |
| `--shadow-dragging` CSS変数                             | `src/app/globals.css`             | ドラッグUI                   |
| localStorage パターン                                   | `src/lib/achievements/storage.ts` | storage.ts の雛型            |
| noindex パターン                                        | `(new)/storybook/page.tsx`        | 検証ページの非公開設定       |
| `allToolMetas`, `allPlayContents`, `allCheatsheetMetas` | 各 registry.ts                    | タイル候補の一覧取得         |

### 新規実装が必要なもの

| 項目                                      | 理由                                                  |
| ----------------------------------------- | ----------------------------------------------------- |
| `Tile` コンポーネント                     | 既存 Panel とは異なるダッシュボード専用コンポーネント |
| `TileMeta` 統合型                         | Tool/Play/Cheatsheet の最小共通ビュー型（新規定義）   |
| `useDashboardConfig` hook                 | localStorage 読み書き + タイル配列管理                |
| `yolos-toolbox-config` storage モジュール | schemaVersion 付きの新規 storage.ts                   |
| DnD 実装                                  | ライブラリ未導入。自前実装か軽量ライブラリ追加が必要  |
| `(new)/toolbox/page.tsx`                  | 道具箱ページ本体                                      |
| タイル候補の統合 indexer                  | Tool/Play/Cheatsheet の 3 registry を束ねる統合リスト |

---

## Phase 4 (B-334) 向け：ツール/遊び一覧の取得経路

| コンテンツ種別         | 関数                         | 返り値                                             |
| ---------------------- | ---------------------------- | -------------------------------------------------- |
| ツール全件             | `allToolMetas`（定数）       | `ToolMeta[]`（34件）                               |
| ツール slug 配列       | `getAllToolSlugs()`          | `string[]`                                         |
| 遊び全件               | `allPlayContents`（定数）    | `PlayContentMeta[]`（20件: game4+quiz15+fortune1） |
| 遊び slug 配列         | `getAllPlaySlugs()`          | `string[]`                                         |
| チートシート全件       | `allCheatsheetMetas`（定数） | `CheatsheetMeta[]`（7件）                          |
| チートシート slug 配列 | `getAllCheatsheetSlugs()`    | `string[]`                                         |

いずれも静的インポートで完結。サーバー API 不要。
