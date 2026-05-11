# layout 並べ読み 4 列テーブル（B-334-4-1 成果物）

作成日: 2026-05-10  
用途: B-334-4-3「layout 親メタデータ等価性の実体確認」のチェック根拠

---

## 4 列テーブル

| 観点                    | `(legacy)/layout.tsx`                                                                       | `(new)/layout.tsx`                                                                                     | 差分メモ                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **metadata export**     | `export const metadata: Metadata = sharedMetadata` (L12)                                    | `export const metadata: Metadata = sharedMetadata` (L13)                                               | 等価。双方とも `src/lib/site-metadata.ts` の `sharedMetadata` を参照。OGP / Twitter / canonical / robots / keywords / metadataBase は等価            |
| **JSON-LD**             | `generateWebSiteJsonLd()` を呼び `<script type="application/ld+json">` で注入 (L19, L25-28) | `generateWebSiteJsonLd()` を呼び `<script type="application/ld+json">` で注入 (L20, L26-29)            | 等価。双方とも `src/lib/seo.ts` の同一関数を呼ぶ                                                                                                     |
| **ThemeProvider**       | `@/components/common/ThemeProvider`（L7, L31）                                              | `@/components/ThemeProvider`（L5, L34）                                                                | コンポーネントパスが異なる（旧版 vs 新版）。ただし機能的に等価とみなされる                                                                           |
| **AchievementProvider** | `@/lib/achievements/AchievementProvider`（L9, L32）                                         | `@/lib/achievements/AchievementProvider`（L9, L35）                                                    | 等価。同一パスを参照                                                                                                                                 |
| **GoogleAnalytics**     | `@/components/common/GoogleAnalytics`（L4, L33）                                            | `@/components/common/GoogleAnalytics`（L7, L36）                                                       | 等価。同一パス（新版でも common/GoogleAnalytics のまま）                                                                                             |
| **Header**              | `@/components/common/Header`（L5, L34）。actions slot なし（`<Header />`）                  | `@/components/Header`（L3, L37-43）。actions slot あり（`<StreakBadge />` + `<ThemeToggle />` を渡す） | 差異あり。(new) 側はヘッダーに StreakBadge と ThemeToggle が表示される。Phase 4.4 移行でトップに初めて表示される UI 差分                             |
| **StreakBadge**         | 存在しない                                                                                  | `@/lib/achievements/StreakBadge`（L9, 41行目）                                                         | (new) のみ。メタデータに影響なし                                                                                                                     |
| **ThemeToggle**         | 存在しない                                                                                  | `@/components/ThemeToggle`（L6, 42行目）                                                               | (new) のみ。メタデータに影響なし                                                                                                                     |
| **Footer**              | `@/components/common/Footer`（L6, L36）                                                     | `@/components/Footer`（L4, L45）                                                                       | コンポーネントパスが異なる（旧版 vs 新版）。機能的に等価                                                                                             |
| **CSS import**          | `import "../old-globals.css"` (L3)。旧 CSS 変数セット（`--color-*` 系）が定義される         | `import "@/app/globals.css"` (L2)。新 CSS 変数セット（`--bg` / `--fg` / `--accent` 系）が定義される    | 差異あり。B-334-4-2 で `page.module.css` が参照する CSS 変数の解決元が old-globals.css から globals.css に切り替わる。B-334-4-2 でトークン置換が必要 |
| **html lang**           | `lang="ja"` + `suppressHydrationWarning`                                                    | `lang="ja"` + `suppressHydrationWarning`                                                               | 等価                                                                                                                                                 |
| **body style**          | `display: flex; flexDirection: column; minHeight: 100vh`                                    | `display: flex; flexDirection: column; minHeight: 100vh`                                               | 等価                                                                                                                                                 |
| **main style**          | `flex: 1`                                                                                   | `flex: 1`                                                                                              | 等価                                                                                                                                                 |
| **provider 順序**       | ThemeProvider → AchievementProvider → GoogleAnalytics → Header → main → Footer              | ThemeProvider → AchievementProvider → GoogleAnalytics → Header → main → Footer                         | 等価                                                                                                                                                 |

---

## メタデータ等価性のまとめ

OGP / Twitter / canonical / robots の観点では **完全等価**。

- 双方とも `sharedMetadata`（`src/lib/site-metadata.ts`）を `metadata` export に適用
- 双方とも `generateWebSiteJsonLd()` を JSON-LD として注入
- 既知の差分（Header actions slot / CSS globals / ThemeProvider パス差）はすべて UI 層の差分であり、メタデータ等価性に影響しない

B-334-4-3 の「layout 親メタデータ等価性の実体確認」において、上記の観点で差異なしと判断できる。

---

## B-334-4-2 への申し送り

CSS 変数の解決元が `old-globals.css` → `globals.css` に切り替わるため、`page.module.css` が参照する以下の変数が `globals.css` に定義されていることを B-334-4-2 で実体確認すること:

- `--color-border`（FortunePreview.module.css, page.module.css で使用）
- `--max-width`（page.module.css で使用）
- `--play-accent`（PlayContentTabs.tsx の inline style で使用）
- ダークモード変数（`:global(:root.dark)` 修正が必要）
