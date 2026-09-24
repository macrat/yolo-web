# DESIGN.md と src/ の差分（実測）

計測日: 2026-09-24
本書は実測値の列挙のみ。案・評価・提言は含まない。

- 対象コミット: `9c848bd`（HEAD）
- 計測はリポジトリルート `/home/user/yolo-web` で ripgrep（`rg`）を使った。特に断りがなければ、`__tests__/` と `*.test.*` は件数から除いている（「非テスト」と記す）。
- 「参照件数」は `var(--name)` の出現数で数えた。`--accent` の件数には `--accent-weak` を含めない。`--paper` の件数には `--paper-2` を含めない（パターンは `var\(--NAME[,) ]`）。

---

## 1. 色トークン

### 1-1. `src/app/globals.css` が定義するトークン（色）

| トークン                                                    | light（行）                            | dark（行）                              | DESIGN.md §2 の値（light / dark）     | 対応                               |
| ----------------------------------------------------------- | -------------------------------------- | --------------------------------------- | ------------------------------------- | ---------------------------------- |
| `--paper`                                                   | `oklch(0.975 0.006 90)`（:14）         | `oklch(0.215 0.008 80)`（:99）          | `oklch(0.99 0 0)` / `oklch(0.18 0 0)` | 名前は同じ。値は不一致（chroma≠0） |
| `--paper-2`                                                 | `oklch(0.955 0.007 90)`（:15）         | `oklch(0.245 0.008 80)`（:100）         | `oklch(0.95 0 0)` / `oklch(0.24 0 0)` | 名前は同じ。値は不一致（chroma≠0） |
| `--ink`                                                     | `oklch(0.235 0.008 80)`（:16）         | `oklch(0.93 0.005 90)`（:101）          | `oklch(0.15 0 0)` / `oklch(0.97 0 0)` | 名前は同じ。値は不一致（chroma≠0） |
| `--ink-2`                                                   | `oklch(0.45 0.01 80)`（:17）           | `oklch(0.72 0.008 85)`（:102）          | `oklch(0.44 0 0)` / `oklch(0.74 0 0)` | 名前は同じ。値は不一致（chroma≠0） |
| `--rule`                                                    | `oklch(0.84 0.008 85)`（:18、淡い線）  | `oklch(0.36 0.008 80)`（:103）          | `var(--ink)`（太い線）                | 名前は同じ。値と役割が不一致       |
| `--rule-2`                                                  | 定義なし                               | 定義なし                                | `oklch(0.62 0 0)` / `oklch(0.53 0 0)` | **実装に無い**（参照も0件）        |
| `--rule-strong`                                             | `oklch(0.3 0.01 80)`（:19）            | `oklch(0.88 0.005 90)`（:104）          | —                                     | DESIGN に無い                      |
| `--accent`                                                  | `oklch(0.51 0.16 32)`（:20、朱）       | `oklch(0.7 0.14 32)`（:105）            | —                                     | DESIGN に無い                      |
| `--accent-weak`                                             | `oklch(0.51 0.16 32 / 0.12)`（:21-23） | `oklch(0.7 0.14 32 / 0.16)`（:106-108） | —                                     | DESIGN に無い                      |
| `--wairo-ink-white` / `--wairo-ink-sumi`                    | :72-73                                 | （共通）                                | —                                     | DESIGN に無い                      |
| `--wairo-{kurenai,kaki,yamabuki,moegi,tokiwa,ai,fuji,suou}` | :76-83                                 | :113-120                                | —                                     | DESIGN に無い（8色）               |
| `--wairo-*-on`（8個）                                       | :86-93                                 | （共通）                                | —                                     | DESIGN に無い                      |

globals.css が定義する色以外のトークン:

- 余白: `--space-8/16/24/32/48/64`（:26-31）
- 幅: `--measure: 42rem`（:32。DESIGN は `40rem`）、`--max-width: 960px`（:33。DESIGN は `60rem`）
- 角丸: `--radius: 0px`（:34）、`--radius-sm: 2px`（:35）
- 書体: `--font-mincho`、`--font-gothic`、`--font-number`（:41-44）、`--font-mono`（body 内 :158）

DESIGN.md §5 の `--rule-w`（3px）と `--rule-w-hair`（1px）は、定義も参照も0件だった（`rg -c -e '--rule-2|--rule-w' src` の出力は空）。

### 1-2. 各トークンの参照数（globals.css を除く src/）

コマンド:

```
for t in ...; do p="var\(--$t[,) ]";
  rg -l -e "$p" src -g '*.{css,tsx,ts}' -g '!src/app/globals.css' -g '!**/__tests__/**' -g '!*.test.*' | wc -l
  rg -o -e "$p" src (同条件) | wc -l; done
```

| トークン                  | DESIGN にあるか                  | 参照ファイル数（非テスト）  | 参照件数（非テスト）          | ファイル数（テスト込み） |
| ------------------------- | -------------------------------- | --------------------------- | ----------------------------- | ------------------------ |
| `--paper`                 | ある                             | 61                          | 90                            | 61                       |
| `--paper-2`               | ある                             | 66                          | 143                           | 66                       |
| `--ink`                   | ある                             | 133                         | 382                           | 133                      |
| `--ink-2`                 | ある                             | 138                         | 371                           | 138                      |
| `--rule`                  | ある（値・役割は別）             | 110                         | 265                           | 111                      |
| `--rule-strong`           | 無い                             | 44                          | 57                            | 46                       |
| `--accent`                | 無い                             | 121                         | 378                           | 134                      |
| `--accent-weak`           | 無い                             | 30                          | 45                            | 31                       |
| `--radius`                | 無い（DESIGN は角丸0を文で定義） | 108                         | 254                           | 112                      |
| `--radius-sm`             | 無い                             | 35                          | 41                            | 38                       |
| `--space-8`〜`--space-64` | 無い（8px 倍数は文で定義）       | 69 / 66 / 42 / 36 / 12 / 20 | 195 / 182 / 91 / 62 / 21 / 20 | —                        |
| `--measure`               | ある（値は別）                   | 19                          | 28                            | 20                       |
| `--max-width`             | ある（値は別）                   | 21                          | 21                            | 23                       |

`--accent`（globals.css を除く CSS）がどのプロパティで使われているか（`rg -o -N -e '^\s*[a-z-]+:\s*[^;]*var\(--accent[,) ]' ...`）:

| プロパティ          | 件数 |
| ------------------- | ---- |
| color               | 134  |
| outline             | 106  |
| border-color        | 52   |
| border              | 34   |
| border-bottom-color | 9    |
| background          | 6    |
| accent-color        | 4    |
| background-color    | 3    |
| stroke              | 1    |

`--accent-weak` は background-color 41件、background 4件。

globals.css 自身も `--accent` を使っている。`a { color: var(--accent) }`（:170-179）、`:focus-visible { outline: 2px solid var(--accent) }`（:235-238）、`.markdown-alert-warning/caution`（:308-316）。

### 1-3. `--wairo-*` の参照（globals.css を除く）

コマンド: `rg -l/-o -e "var\(--wairo-$t$s[,) ]" src -g '!src/app/globals.css'`

| トークン                      | ファイル数 | 件数 |     | トークン              | ファイル数 | 件数 |
| ----------------------------- | ---------- | ---- | --- | --------------------- | ---------- | ---- |
| `--wairo-kurenai`             | 4          | 5    |     | `--wairo-kurenai-on`  | 1          | 1    |
| `--wairo-kaki`                | 3          | 3    |     | `--wairo-kaki-on`     | 1          | 1    |
| `--wairo-yamabuki`            | 10         | 18   |     | `--wairo-yamabuki-on` | 5          | 5    |
| `--wairo-moegi`               | 7          | 9    |     | `--wairo-moegi-on`    | 3          | 3    |
| `--wairo-tokiwa`              | 7          | 13   |     | `--wairo-tokiwa-on`   | 4          | 6    |
| `--wairo-ai`                  | 7          | 9    |     | `--wairo-ai-on`       | 3          | 3    |
| `--wairo-fuji`                | 7          | 9    |     | `--wairo-fuji-on`     | 3          | 3    |
| `--wairo-suou`                | 3          | 3    |     | `--wairo-suou-on`     | 1          | 1    |
| `--wairo-ink-white` / `-sumi` | 0          | 0    |     |                       |            |      |

`var(--wairo-` の合計は92件（テストを含む）。1件以上あるファイル（`rg -c`）:

- `src/test/design-gate.test.ts`: 21
- `src/components/Tsutsumi/Tsutsumi.module.css`: 16
- `KanjiKanaru.module.css`: 8
- `YojiKimeru.module.css`: 8
- `nakamawake/ResultModal.module.css`: 8
- `nakamawake/SolvedGroups.module.css`: 8
- `RadarChart.module.css`: 8
- `ScienceThinkingResultExtra.module.css`: 8
- `nakamawake/HowToPlayModal.module.css`: 4
- `nakamawake/StatsModal.module.css`: 2
- `fortune/StarRating.module.css`: 1

`--wairo-` を文字列として含むファイルは、ほかに `src/lib/wairoHex.ts`、`src/lib/__tests__/wairoHex.test.ts`、`src/components/Tsutsumi/index.tsx` がある。

---

## 2. 直書きの色

コマンド:

```
P='oklch\(|#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('
rg -o -e "$P" src -g '*.{css,tsx,ts}' -g '!src/app/globals.css' | wc -l             → 643件（テスト込み）
rg -l -e "$P" （同）| wc -l                                                          → 95ファイル（テスト込み）
rg -o -e "$P" src -g '*.{css,tsx,ts}' -g '!src/app/globals.css' -g '!**/__tests__/**' -g '!*.test.*' | wc -l → 259件（非テスト）
rg -l （同）| wc -l → 46ファイル（非テスト）
```

- 非テストの259件には、コメント中の色（旧色の記録など）も含まれる。
- コメント行（`*`、`//`、`/*`、`{/*` で始まる行と、行末 `//` コメント中の色）を除いた「コード中」の件数は **191件**。この除外はヒューリスティックで、`utsuwaHex.ts` は行末コメントを持つので手で数え直した。
- `.js`/`.jsx`/`.mjs` のヒットは0件。
- CSS/TSX/TS の外では、`src/data/traditional-colors.json` に `#xxxxxx` が250件ある。

### 2-1. ファイル別（非テスト、コード中件数/全件数）と分類

**コンテンツそのものの色と思われるもの**

| ファイル                                                              | コード中/全 | 内容                                                                                       |
| --------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `src/play/quiz/data/traditional-color.ts`                             | 9/9         | 結果8色（伝統色の hex。:278, 304, 330, 356, 382, 408, 434, 460）と meta.accentColor（:16） |
| `src/dictionary/_components/color/ColorDetail.tsx`                    | 2/2         | `rgb(...)`/`hsl(...)` の表示用文字列（:72-73）                                             |
| `src/tools/color-converter/ColorConverterTile.tsx`                    | 4/4         | 既定値 `#3498db`（:212, 225）とエラー文言                                                  |
| `src/tools/color-converter/logic.ts`                                  | 4/6         | 出力文字列 `rgb(...)`/`hsl(...)` とエラー文言                                              |
| `src/app/tools/color-converter/page.tsx`                              | 1/1         | `defaultInput="#3498db"`（:30）                                                            |
| `src/tools/traditional-color-palette/TraditionalColorPaletteTile.tsx` | 2/4         | `rgb(...)`/`hsl(...)` の表示用文字列（:80, 85）                                            |
| `src/play/games/irodori/_components/HslSliders.tsx`                   | 13/13       | スライダーのグラデーション軌道（:30-41）とプレビュー色（:45）                              |

**UI の色と思われるもの**

| ファイル                                                                              | コード中/全 | 内容                                                                                                                                 |
| ------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/Header/Header.module.css`                                             | 1/1         | `.mobileOverlay { background: rgba(0,0,0,0.4) }`（:124）                                                                             |
| `src/play/games/shared/_components/new/GameDialog.module.css`                         | 1/2         | backdrop `rgba(0,0,0,0.5)`（:17）                                                                                                    |
| `src/lib/utsuwaHex.ts`                                                                | 6/12        | 器の hex（PAPER `#f8f7f2`、INK `#201e1a`、INK_2、RULE、RULE_STRONG、ACCENT `#af3622`。:21-31）。OGP・札画像・410 ページが使う        |
| `src/play/color-utils.ts`                                                             | 2/6         | 色の上に置く文字色 `#1a1a1a`/`#ffffff`（:59, 62）                                                                                    |
| `src/play/games/registry.ts`                                                          | 4/4         | ゲームの `accentColor`（:12, 71, 132, 193）                                                                                          |
| `src/play/registry.ts`                                                                | 1/1         | `accentColor: "#7c3aed"`（:68）                                                                                                      |
| `src/play/quiz/data/{kanji-level,kotowaza-level,yoji-level,character-personality}.ts` | 各1/1       | meta.accentColor                                                                                                                     |
| `src/play/games/irodori/_lib/share.ts`                                                | 8/8         | シェア画像（canvas）。地 `#1a1a2e`、文字 `#ffffff`/`#aaaaaa`/`#888888`/`#333333`（UI）と、回答色 `hsl(...)`（:98、コンテンツ）が混在 |

`accentColor` を描画で参照している箇所は見つからなかった。`ResultCard.tsx:179` は `void accentColor;` で受けるだけである。

**不明**

| ファイル                                                                                                                                                                                                                          | コード中/全                    | 内容                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/wairoHex.ts`                                                                                                                                                                                                             | 10/26                          | 和色8色の hex と文字色（:33-34, 48-55）。結果 ID のハッシュで割り当てる色で、OGP・札画像が使う                                                                                                                                    |
| `src/play/quiz/data/character-personality-results-batch1/2/3.ts`                                                                                                                                                                  | 10/10、10/16、4/17             | 24タイプそれぞれの `color`（タイプに付けた色）                                                                                                                                                                                    |
| `src/play/quiz/data/{animal-personality, character-fortune, contrarian-fortune, impossible-advice, japanese-culture, music-personality, science-thinking, unexpected-compatibility, word-sense-personality, yoji-personality}.ts` | 13, 7, 9, 8, 8, 9, 11, 9, 9, 9 | 結果タイプの `color` と meta.accentColor。描画では `--type-color` のインライン注入（6 Content コンポーネントと OtherTypesNav）に使われるが、CSS の `var(--type-color)` 参照は0件（`rg -o -e 'var\(--type-color' src -g '*.css'`） |
| `src/play/games/irodori/_components/RoundResult.tsx` / `FinalResult.tsx`                                                                                                                                                          | 1/1、1/1                       | 未回答時の代替色 `#333333`（:16 / :42）                                                                                                                                                                                           |
| `src/tools/qr-code/logic.ts`                                                                                                                                                                                                      | 1/1                            | canvas の地 `#fff`（:40）                                                                                                                                                                                                         |

**コメント中のみ（コード中は0件）**

- `src/app/blog/[slug]/page.module.css`
- `src/app/dictionary/humor/[slug]/opengraph-image.tsx`
- `src/app/play/traditional-color/result/[resultId]/opengraph-image.tsx`
- `src/lib/fuda-image.tsx`
- `src/lib/ogp-image.tsx`
- `src/lib/oklchToHex.ts`
- `src/lib/sanitize.ts`
- `src/middleware.ts`
- `src/play/games/irodori/_lib/color-utils.ts`
- `src/play/games/shared/_components/new/NextGameBanner.tsx`
- `src/play/quiz/_components/AnimalPersonalityContent.module.css`

### 2-2. インラインの `style={{ backgroundColor / background }}`（非テスト TSX）

コマンド: `rg -n 'style=\{\{' src -g '*.tsx' ... | rg -i 'color|background'`

| 箇所                                                                                                                 | 値                               |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `ColorDetail.tsx:79`, `:145`                                                                                         | `color.hex`, `c.hex`             |
| `DictionaryEntryList/index.tsx:61`                                                                                   | `item.swatch`                    |
| `TraditionalColorPaletteTile.tsx:188`, `:303`                                                                        | `hexValue`, `color.hex`          |
| `ColorConverterTile.tsx:297`                                                                                         | `hexValue`                       |
| `TraditionalColorContent.tsx:122`                                                                                    | `r.color`                        |
| irodori `ColorTarget.tsx:18`、`RoundResult.tsx:25,36`、`FinalResult.tsx:49,53`、`HslSliders.tsx:59,75,91,105`        | お題の色・回答色・グラデーション |
| 6 Content コンポーネント（Yoji/Contrarian/Impossible/TraditionalColor/UnexpectedCompatibility/CharacterPersonality） | `"--type-color": resultColor`    |
| `src/app/storybook/StorybookContent.tsx:187`                                                                         | `var(${swatch.token})`           |

---

## 3. 色がコンテンツそのものである面

| 面（ルート）                                                               | ファイル                                                                                                                          | 色の描き方                                                                               | 色見本の枠                                                       | 色の上の文字                                                                                               |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/dictionary/colors/[slug]` 詳細                                           | `src/dictionary/_components/color/ColorDetail.tsx:77-81`, css `.swatch`（:17-23）                                                 | 幅100%・高さ200px（狭い画面は150px）の色見本                                             | 1px `--rule`                                                     | なし（色名は見本の下の h1）                                                                                |
| 同 詳細の「同じカテゴリの伝統色」                                          | `ColorDetail.tsx:142-147`, css `.relatedSwatch`（:162-168）                                                                       | 高さ40px の見本と、その下に色名                                                          | 1px `--rule`                                                     | なし                                                                                                       |
| `/dictionary/colors`（検索結果）、`/dictionary/colors/category/[category]` | `DictionaryEntryList/index.tsx:58-63`, css `.swatch`（:53-59）                                                                    | 行頭に20×20px の見本                                                                     | 1px `--rule`                                                     | なし。値札に hex                                                                                           |
| `/tools/traditional-color-palette`                                         | `TraditionalColorPaletteTile.tsx:186-191`（配色カード）、`:300-310`（色の格子ボタン）                                             | カードの見本と、格子の色ボタン                                                           | 1px `--rule`（`.paletteColorSwatch`）、2px `--rule`（`.swatch`） | 格子ボタン内に `.swatchTooltip`（`--ink` 地・`--paper` 文字、既定 opacity 0）があり、色名と hex を表示する |
| `/tools/color-converter`                                                   | `ColorConverterTile.tsx:293-298`（`.colorPreview`）、`:271-277`（`input type="color"`）                                           | 変換結果のプレビュー見本                                                                 | 1px `--rule-strong`                                              | なし                                                                                                       |
| `/play/traditional-color/result/[resultId]` と診断の結果                   | `TraditionalColorContent.tsx:119-124`, css `.colorDot`（:168-174）                                                                | 「他の色も見てみよう」の各行に12×12px のドット（実際の伝統色）                           | 1px `--rule`                                                     | なし                                                                                                       |
| 同 結果の主表示                                                            | `ResultPageShell.tsx:85-91`, `ResultCard.tsx:508-515` → Tsutsumi                                                                  | 伝統色ではなく、`pickResultWairoColor(result.id)`（ID ハッシュ → 和色8色）で塗った記号面 | —                                                                | **あり**。記号字を `--wairo-*-on` で載せる（`Tsutsumi.module.css:66-110`）                                 |
| `/play/irodori`                                                            | `ColorTarget.tsx:16-21`、`HslSliders.tsx:52-105`、`RoundResult.tsx:23-38`、`FinalResult.tsx:49-53`                                | お題の見本・スライダー軌道（グラデーション）・プレビュー・お題と回答の比較               | 1px `--rule`（`.colorPatch` / `.previewPatch` / `.miniPatch`）   | なし（ラベルは見本の外）                                                                                   |
| irodori のシェア画像                                                       | `src/play/games/irodori/_lib/share.ts:43-118`                                                                                     | canvas に `#1a1a2e` の地と回答色の矩形                                                   | —                                                                | 白文字などの文字を canvas に描画                                                                           |
| 和色 `--wairo-*` の包み（Tsutsumi）                                        | `Tsutsumi.module.css:66-76`（`.figure { background: var(--fill); color: var(--on) }`）                                            | 記号面を和色で塗る                                                                       | 外枠 1px `--rule-strong`                                         | **あり**（記号・数字・単位を `--on` 色で載せる）                                                           |
| Tsutsumi の使用箇所                                                        | `src/app/page.tsx:240`（見本 `color="ai"`）、`ResultCard.tsx:508`、`ResultPageShell.tsx:85`、`DailyFortuneCard.tsx:77`            | JSX で4ファイル・4箇所                                                                   |                                                                  |                                                                                                            |
| kanji-kanaru / yoji-kimeru の判定セル                                      | `KanjiKanaru.module.css:226-233`、`YojiKimeru.module.css:185-192`                                                                 | 正解 = tokiwa、近い/含む = yamabuki のセル地                                             | —                                                                | **あり**（`-on` 色の文字）                                                                                 |
| 同 分布バーと凡例                                                          | `KanjiKanaru:497-498, 537, 541`、`YojiKimeru:455-456, 499, 503`                                                                   | バーと凡例チップを和色で塗る                                                             | —                                                                | 分布バーは `-on` 色の文字あり                                                                              |
| nakamawake の正解グループ                                                  | `SolvedGroups.module.css:38-54`、`ResultModal.module.css:36-52`、`HowToPlayModal.module.css:36-48`、`StatsModal.module.css:67-68` | グループ地を yamabuki / moegi / ai / fuji で塗る                                         | —                                                                | SolvedGroups・ResultModal・StatsModal は `-on` 色の文字あり。HowToPlay は見本のみ                          |
| 占いの星                                                                   | `StarRating.module.css:9`                                                                                                         | 星の字の色を `--wairo-yamabuki` にする                                                   | —                                                                | 文字自体が色                                                                                               |
| レーダーチャート                                                           | `RadarChart.module.css:40-61`                                                                                                     | 多角形の塗り `--radar-fill`（和色）                                                      | —                                                                | —                                                                                                          |
| science-thinking の追加表示                                                | `ScienceThinkingResultExtra.module.css:62, 74-95`                                                                                 | バーの塗り `--extra-fill`（和色）                                                        | —                                                                | —                                                                                                          |
| OGP: `/dictionary/colors/[slug]`、traditional-color の結果                 | `opengraph-image.tsx:57` / `:56` → `fuda-image.tsx:102-113, 214-224`                                                              | 300×300 の記号面を `colorOverride`（実際の色 hex）で塗る。ほかの面は和色                 | 1px RULE_STRONG                                                  | **あり**（記号字を `getContrastTextColor` の色で載せる）                                                   |
| OGP: `/play/character-personality/result/[resultId]` と fuda-image ルート  | `fuda-image.tsx`                                                                                                                  | 記号面を和色で塗る                                                                       | 同上                                                             | あり                                                                                                       |

---

## 4. 書体

### 4-1. 現状

- `src/lib/fonts.ts:14-28`: next/font/google で2書体を読み込む。
  - `Noto_Serif_JP`（weight "600"、subsets ["latin"]、display swap、変数 `--font-mincho`）
  - `Zilla_Slab`（weight "500"、変数 `--font-number`）
- `src/app/layout.tsx:13, 29`: `<html className={`${mincho.variable} ${number.variable}`}>`。
- `globals.css:41-44`:
  - `--font-mincho: var(--font-mincho, "Hiragino Mincho ProN", "Yu Mincho", serif)`
  - `--font-gothic: "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Noto Sans JP", sans-serif`（Web フォントなし）
  - `--font-number: var(--font-number, "Zilla Slab", "Roboto Slab", serif)`
- `globals.css:154`: `body { font-family: var(--font-gothic) }`。
- `globals.css:158`: `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace`。
- `globals.css:196-206`: `h1〜h6 { font-family: var(--font-mincho); font-weight: 600; line-height: 1.4; font-feature-settings: "palt" }`。
- OGP（`src/lib/ogp-image.tsx:56, 63`）は Noto Serif JP 600 と Noto Sans JP 400 を Google Fonts CDN から取得する。
- favicon の字形（`scripts/generate-favicons.ts:50-54`）は Noto Serif JP wght 900。
- 410 ページ（`src/middleware.ts:58-60`）は明朝とゴシックのシステムスタック。

### 4-2. DESIGN.md §3 との差

| 役割                                         | DESIGN.md §3              | 実装                                                                                                                 |
| -------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 見出しの和文                                 | Zen Antique（400）        | Noto Serif JP 600（next/font、subsets latin）とシステム明朝                                                          |
| 本文・UI の和文                              | BIZ UDPGothic（400・700） | システムゴシックのスタック（Web フォントなし）                                                                       |
| 欧文・数字（U+0000-007F 全体。見出しを含む） | IBM Plex Sans（400・700） | 範囲で書体を分ける `unicode-range` などの指定は見つからなかった。数字は `.tabular`/`[data-number]` に Zilla Slab 500 |
| コード                                       | `ui-monospace`            | `Menlo, Consolas, Liberation Mono, Courier New, monospace`                                                           |

コマンド `rg -n -e 'next/font|Zen Antique|Zen_Antique|BIZ UDP|BIZ_UDP|IBM Plex|IBM_Plex|ui-monospace|...' src` で、Zen Antique・BIZ UDPGothic・IBM Plex・ui-monospace は0件だった。

CSS の font-weight の分布（`rg -o -N -e 'font-weight:\s*[0-9a-z]+' src -g '*.css'`）:

| 値                     | 件数 |
| ---------------------- | ---- |
| 600                    | 157  |
| 700                    | 29   |
| 500                    | 15   |
| 400                    | 4    |
| 800                    | 1    |
| inherit / normal / var | 各1  |

### 4-3. `--font-*` の参照（globals.css を除く、非テスト）

| 変数            | ファイル数 | 件数 |
| --------------- | ---------- | ---- |
| `--font-mincho` | 42         | 60   |
| `--font-gothic` | 29         | 49   |
| `--font-number` | 23         | 23   |
| `--font-mono`   | 20         | 42   |

---

## 5. ルート文字サイズと入力欄

### ルート

- `globals.css:141-149`: `html, body { font-size: 16px; line-height: 1.7; }`。ルートの文字サイズを px で固定している。
- `.prose, [data-prose] { line-height: 1.9 }`（:228-232）。
- `line-height: 1.85` の宣言は0ファイル（`rg -c -e 'line-height:\s*1\.85' src -g '*.css' | wc -l`）。

見出しサイズ（globals.css:207-222）:

| 要素  | 実装      | DESIGN §4（64rem 以上）    |
| ----- | --------- | -------------------------- |
| h1    | 2.4375rem | 主見出し 4.08rem           |
| h2    | 1.9375rem | セクションの見出し 2.92rem |
| h3    | 1.5625rem | 小見出し 2.08rem           |
| h4    | 1.25rem   | —                          |
| h5/h6 | 1rem      | —                          |

見出しの line-height は 1.4（DESIGN は 1.25 以下）。

### 共有部品の入力欄

| 部品             | font-size（行）                   | min-height | DESIGN §4（`1.0625rem` と 16px の大きいほう） |
| ---------------- | --------------------------------- | ---------- | --------------------------------------------- |
| Input            | 14px（`Input.module.css:10`）     | 44px       | 下回る                                        |
| Textarea         | 14px（`Textarea.module.css:10`）  | —          | 下回る                                        |
| Select           | 14px（`Select.module.css:17`）    | —          | 下回る                                        |
| SegmentedControl | 14px（:27）                       | —          | （参考）                                      |
| Button           | 14px（:15）、small は 12px（:76） | —          | （参考）                                      |

### 共有部品を使わずに置いた入力

`<select>` と `<textarea>` の直置きは0件。`<input>` の直置きは12件・9ファイル（`rg -n -e '<input\b' src -g '*.tsx' -g '!**/__tests__/**' -g '!*.test.*' -g '!src/components/**'`）。

| ファイル:行                                                                            | type     | font-size                                  |
| -------------------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| `src/dictionary/_components/DictionarySearch/index.tsx:84`                             | search   | 1rem（`DictionarySearch.module.css:38`）   |
| `src/tools/regex-tester/RegexTesterTile.tsx:212`                                       | text     | 0.95rem（`RegexTesterTile.module.css:51`） |
| `src/play/games/kanji-kanaru/_components/GuessInput.tsx:70`                            | text     | 1.5rem（`KanjiKanaru.module.css:310`）     |
| `src/play/games/yoji-kimeru/_components/GuessInput.tsx:83`                             | text     | 1.5rem（`YojiKimeru.module.css:269`）      |
| `RegexTesterTile.tsx:239`、`FullwidthConverterTile.tsx:181`                            | checkbox | —                                          |
| `ColorConverterTile.tsx:271`                                                           | color    | —                                          |
| `ImageResizerTile.tsx:587`、`PasswordGeneratorTile.tsx:187`、`HslSliders.tsx:52,68,84` | range    | —                                          |

### 参考（補助情報の下限 0.875rem 未満）

- `font-size` の rem 指定686件のうち、`< 0.875rem` は189件。
- px 指定は7件で、そのうち `< 14px` は1件（Button small の 12px）。
- Footer の AI 告知 `.note` は 0.8125rem（`Footer.module.css`）。

コマンド: `rg -o -N -e 'font-size:\s*[0-9.]+rem' src -g '*.css' | ... | awk '$1<0.875' | wc -l`

---

## 6. 構造

### 6-1. layout.tsx と共通シェル

`src/app/layout.tsx:26-53` の構造:

```
<html lang="ja" className={mincho.variable number.variable}>
  <body style={{display:flex, flexDirection:column, minHeight:100vh}}>
    <script ld+json/>
    <ThemeProvider>
      <SkipLink/> <GoogleAnalytics/>
      <Header actions={<ThemeToggle/>}/>
      <main id=main-content tabIndex=-1 style={{flex:1}}>{children}</main>
      <Footer/>
```

`<main>` には幅もボーダーも無い。幅は各ページや各シェルの CSS が決めている。`src/app/play/kanji-kanaru/layout.tsx` もあるが、中身は `<>{children}</>` だけである。

### 6-2. Header（`src/components/Header/`）

- `.header`: `background: transparent; border-bottom: 1px solid var(--rule-strong); width: 100%`（css :8-15）。
- `.inner`: `max-width: var(--max-width)`、`padding: 0 16px`、`height: 3.5rem`、flex。
- ロゴ「yolos.net」: `--font-mincho` 600、1.375rem。ドット「.」だけ `--accent`（:29-54）。
- ナビ: 遊び／ツール／ブログ／サイト紹介の4項目（index.tsx:16-21）。文字色は `--ink-2`、0.9375rem で、hover 時だけ下線。現在地は `color: var(--accent)`（:110-112）。
- 720px 以下: ナビとアクションを隠し、ハンバーガーボタンとモバイルメニューにする。オーバーレイは `rgba(0,0,0,0.4)`（:118-126, 138-205）。
- テーマ切替（ThemeToggle）をヘッダー右に置く。

### 6-3. Footer（`src/components/Footer/`）

- `.footer`: `background: var(--paper-2); border-top: 1px solid var(--rule-strong)`。
- `.inner`: `max-width: var(--max-width)`、`padding: 48px 16px`。
- 4カラムのサイトマップ（ツール／遊び／ブログ／その他。全19リンク、index.tsx:15-66）。カラム見出しは明朝で、下に 1px `--rule`。
- `.bottom`: `border-top: 1px solid var(--rule)`。AI 運営の告知（0.8125rem）と © 表記。
- リンクは hover 時に `--accent` と下線。

### 6-4. 各シェルのコンテナ

| シェル                                                      | 幅（行）                                                                                 | 余白           | 左右ボーダー |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- | ------------ |
| ToolPageLayout                                              | `max-width: var(--max-width)`（css :10-13）                                              | 24px / 16px    | なし         |
| GameLayout                                                  | `max-width: 600px`（:7-10）                                                              | 16px / 8px     | なし         |
| ResultPageShell                                             | `max-width: 600px`（:1-4）                                                               | 1rem / 0.5rem  | なし         |
| QuizPlayPageLayout（`src/app/play/[slug]/page.module.css`） | `max-width: var(--max-width)`（:11-14）                                                  | 1.5rem 1rem    | なし         |
| DictionaryDetailLayout                                      | `max-width: var(--max-width)`（:14-17）                                                  | 32 / 24 / 64px | なし         |
| トップ `src/app/page.module.css`                            | `max-width: var(--max-width)`（:11-14）。ヒーローは 1px `--rule-strong` の囲み（:62-66） | —              | なし         |
| BlogListView                                                | `max-width: var(--max-width)`（:9-12）                                                   | —              | なし         |

CSS の `max-width` の値の分布（`rg -o -N -e '^\s*max-width:\s*[^;]+' src -g '*.css'`）:

| 値                 | 件数   |
| ------------------ | ------ |
| `var(--measure)`   | 28     |
| `var(--max-width)` | 21     |
| `600px`            | 10     |
| `100%`             | 10     |
| `500px`            | 3      |
| `300px`            | 3      |
| その他             | 各1〜2 |

メディアクエリの分布:

| 条件                     | 件数   |
| ------------------------ | ------ |
| `max-width: 640px`       | 27     |
| `min-width: 480px`       | 14     |
| `prefers-reduced-motion` | 10     |
| `max-width: 768px`       | 9      |
| `max-width: 720px`       | 5      |
| その他                   | 各1〜3 |

`45rem`/`64rem` の条件は0件。

### 6-5. DESIGN §5 の構造に相当するもの

**コンテナの左右の太いボーダー**: 0件。

`border-left/right/inline` の宣言は CSS 全体で8件（`rg -n -e '^\s*border-(left|right|inline)(-[a-z]+)?:' src -g '*.css'`）で、いずれもコンテナのものではない:

- 引用やコールアウトの左罫: markdown-preview、YojiDetail、blog `[slug]`、humor `[slug]` ×2、globals `.markdown-alert-warning`
- BMI の三角形（transparent の左右罫）

**画面端まで届く全幅の罫線**:

- `100vw` は `globals.css:143`（`max-width: 100vw`）の1件だけ。`calc(50% - 50vw)` などの張り出し指定は0件。
- Header の下辺と Footer の上辺は `<header>`/`<footer>` 要素の幅（body 幅）で引かれ、太さは1px。

**セクションの切れ目**: 全幅の罫線ではない。各ページの CSS がコンテナ内で `border-top: 1px solid var(--rule)` を引いている。

**線の太さ**（`rg -o -N -e 'border(-[a-z]+)*:\s*[0-9.]+px' src -g '*.css'`）:

| 太さ | 件数 |
| ---- | ---- |
| 1px  | 334  |
| 2px  | 13   |
| 3px  | 6    |
| 5px  | 3    |
| 4px  | 1    |
| 8px  | 1    |

outline は 2px が125件（`2px solid var(--accent)` が81ファイル125件）、3px が1件。

### 6-6. 角丸・影・グラデーション・backdrop-filter

| 項目                                 | コマンド                                       | 件数 / ファイル数   | 内訳                                                                                                                                   |
| ------------------------------------ | ---------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `border-radius:` 宣言（CSS）         | `rg -n -e '^\s*border-radius:' src -g '*.css'` | 261件 / 113ファイル | `var(--radius)`（=0px）232、`var(--radius-sm)`（=2px）26、`50%` 2（kanji-kanaru・yoji-kimeru の `GameContainer.module.css:20`）、`0` 1 |
| `borderRadius`（TSX）                | `rg -e borderRadius`（非テスト）               | 2件 / 1ファイル     | storybook                                                                                                                              |
| `box-shadow:` 宣言（CSS）            | `rg -n -e '^\s*box-shadow:' src -g '*.css'`    | 1件 / 1ファイル     | `none`（`GameDialog.module.css:13`）。ほかの出現はすべてコメント（全出現67件/51ファイル）                                              |
| `gradient(`（非テスト）              | `rg -e 'gradient\('`                           | 3件 / 1ファイル     | `HslSliders.tsx:30, 34, 41`                                                                                                            |
| `backdrop-filter` / `backdropFilter` | —                                              | 非テストは0件       | テストだけにある（design-gate など）                                                                                                   |
| `text-shadow`                        | —                                              | 非テストは0件       | —                                                                                                                                      |

`--radius-sm: 2px` の宣言は26件。DESIGN では丸い形を持つのはラジオボタンだけとしている。

---

## 7. 共有コンポーネント（`src/components/`）

- 「import ファイル数」: `rg -l -e "from \"@/components/$c(/[^\"]*)?\"" src -g '*.{ts,tsx}' -g '!**/__tests__/**' -g '!*.test.*' -g "!src/components/$c/**"`
- 「JSX 使用」: `<Name` の出現で数え、storybook・src/components・テストを除いた（`rg -o -e '<Name\b' ... -g '!src/app/storybook/**' -g '!src/components/**'`）。

| コンポーネント                           | 役割（1行）                                                          | DESIGN §6〜§8 の相当                                 | import ファイル数（非テスト） | JSX 使用（件/ファイル）                              |
| ---------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------- | ---------------------------------------------------- |
| Breadcrumb                               | パンくず（nav > ol）                                                 | 相当なし                                             | 20                            | 19/19                                                |
| Button                                   | ボタン。primary は `--accent` 地・`--paper` 文字、default は罫の線画 | プライマリボタン（§6）。default 版は相当なし         | 27                            | 65/26                                                |
| ErrorMessage                             | エラー文言の表示                                                     | §8 入力のエラー文                                    | 26                            | 30/25                                                |
| FaqSection                               | details/summary の FAQ と JSON-LD                                    | アコーディオン（§6）                                 | 5                             | 4/4                                                  |
| FileDropZone                             | ファイルのドラッグ&ドロップ取り込み                                  | 相当なし                                             | 3                             | 2/2                                                  |
| Footer                                   | サイトフッター（サイトマップと AI 告知）                             | §5 レイアウト下端                                    | 1                             | —                                                    |
| GoogleAnalytics                          | GA タグ（非視覚）                                                    | 相当なし                                             | 1                             | —                                                    |
| Header                                   | サイトヘッダー（ロゴ・ナビ・ハンバーガー）                           | §5 レイアウト上端                                    | 1                             | —                                                    |
| In                                       | 印（明朝1字・回転±8°）                                               | 相当なし                                             | 1（Tsutsumi のみ）            | 0/0                                                  |
| Input                                    | テキスト入力                                                         | 入力欄・書き込む欄（§8）                             | 20                            | 45/19                                                |
| Nefuda（+NefudaGroup）                   | 値札（小ラベル、`--radius-sm`）                                      | 相当なし                                             | 7                             | 6/6                                                  |
| Pagination                               | ページ番号のリンク                                                   | ページ送り（§6・§7）                                 | 2                             | 1/1                                                  |
| Panel                                    | 矩形コンテナ（1px `--rule`、padding 24/32）                          | ボックス（§5）に近い（DESIGN は太い線と指定）        | 37                            | 71/36（storybook 25件を除く）                        |
| RelatedBlogPosts                         | 関連ブログ記事の一覧                                                 | 名指しの部品なし（一覧 §7）                          | 2                             | 2/2                                                  |
| RelatedTools                             | 関連ツールの一覧                                                     | 名指しの部品なし（一覧 §7）                          | 2                             | 1/1                                                  |
| SegmentedControl                         | role=radiogroup の切替（選択時は `--accent-weak` 地・`--accent` 枠） | 機能はラジオボタン（§6）相当。形は DESIGN に無い     | 21                            | 26/20                                                |
| Select                                   | セレクトボックス                                                     | 選ぶ欄（§8）                                         | 13                            | 15/12                                                |
| ShareButtons                             | SNS 共有ボタン                                                       | 相当なし                                             | 7                             | 11/11（`play/quiz/_components/ShareButtons` を含む） |
| Shinagaki                                | 品書き（罫で区切る一覧）                                             | 一覧（§7）                                           | 8                             | 11/8                                                 |
| SkipLink                                 | 本文へのスキップリンク                                               | 相当なし（§12 キーボード要件）                       | 1                             | —                                                    |
| Textarea                                 | 複数行入力                                                           | 書き込む欄（§8）                                     | 22                            | 36/21                                                |
| ThemeProvider                            | next-themes のラッパー（defaultTheme="system"）                      | §10 既定テーマは端末に従う                           | 1                             | —                                                    |
| ThemeToggle                              | ライト/ダーク切替（トグル型）                                        | 相当なし                                             | 1                             | 1/1                                                  |
| ToggleSwitch                             | checkbox ベースの ON/OFF スイッチ（ON は `--accent` 地）             | 機能はチェックボックス（§6）相当。形は DESIGN に無い | 6                             | 11/5                                                 |
| Tsutsumi                                 | 結果の包み（和色の記号面・タイプ名・印）                             | 結果のボックス（§8）の役。色面の上に文字を載せる     | 7                             | 4/4                                                  |
| hooks/useCopyToClipboard                 | コピー用フック（非視覚）                                             | —                                                    | 23                            | —                                                    |
| icons（BarChart/ChevronDown/HelpCircle） | SVG アイコン                                                         | 相当なし                                             | 7                             | —                                                    |

DESIGN §6 のコントロールに対応する素の要素（非テスト TSX、storybook を含む）:

| 要素              | 件数                               |
| ----------------- | ---------------------------------- |
| `type="radio"`    | 0件                                |
| `type="checkbox"` | 6件・3ファイル                     |
| `role="radio"`    | 3件・1ファイル（SegmentedControl） |
| `role="switch"`   | 4件・2ファイル                     |
| `<details`        | 5件・4ファイル                     |
| `<table`          | 3件・3ファイル                     |

---

## 8. ページ一覧

コマンド:

- `find src/app -name page.tsx | wc -l` → **80**
- シェルの判定: 各 page.tsx の import を `rg -o -N -e 'import (\w+)[^;]*from "[^"]*(Layout|Shell|Page)[^"]*"'` で抽出した

| 種類               | 件数 | ルート                                                                                                                                                                                                                                        | 共通シェル                                                                                               |
| ------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| トップ             | 1    | `/`                                                                                                                                                                                                                                           | なし（`page.module.css` と Nefuda/Shinagaki/Tsutsumi）                                                   |
| 一覧               | 2    | `/play`、`/tools`                                                                                                                                                                                                                             | なし（`page.module.css` と Shinagaki。`/play` は Breadcrumb も）                                         |
| ツール             | 36   | `/tools/*`                                                                                                                                                                                                                                    | ToolPageLayout（36/36）                                                                                  |
| 診断・クイズ・占い | 13   | `/play/[slug]`、`/play/music-personality`                                                                                                                                                                                                     | QuizPlayPageLayout（2）                                                                                  |
|                    |      | `/play/[slug]/result/[resultId]` と個別の結果ページ9（animal-personality、character-fortune、character-personality、contrarian-fortune、impossible-advice、music-personality、traditional-color、unexpected-compatibility、yoji-personality） | ResultPageShell（10）                                                                                    |
|                    |      | `/play/daily`                                                                                                                                                                                                                                 | なし（DailyFortuneCard）                                                                                 |
| ゲーム             | 4    | `/play/irodori`、`/play/kanji-kanaru`、`/play/nakamawake`、`/play/yoji-kimeru`                                                                                                                                                                | GameLayout（4/4）                                                                                        |
| 辞典               | 14   | `/dictionary/colors/[slug]`、`/dictionary/kanji/[char]`、`/dictionary/yoji/[yoji]`                                                                                                                                                            | DictionaryDetailLayout（3）                                                                              |
|                    |      | `/dictionary`、`/dictionary/{colors,kanji,yoji,humor}`、`/dictionary/humor/[slug]`、`/dictionary/colors/category/[category]`、`/dictionary/kanji/{grade,radical,stroke}/*`、`/dictionary/yoji/category/[category]`                            | なし（11。Breadcrumb と DictionaryEntryList/FacetIndex/DictionarySearch/Shinagaki と `page.module.css`） |
| ブログ             | 7    | `/blog`、`/blog/page/[page]`、`/blog/category/[category]`（+`/page/[page]`）、`/blog/tag/[tag]`（+`/page/[page]`）                                                                                                                            | BlogListView（6）                                                                                        |
|                    |      | `/blog/[slug]`                                                                                                                                                                                                                                | なし（`page.module.css`）                                                                                |
| その他             | 3    | `/about`、`/privacy`、`/storybook`                                                                                                                                                                                                            | なし                                                                                                     |

シェルの定義場所:

- `src/tools/_components/ToolPageLayout/index.tsx`
- `src/play/games/_components/new/GameLayout.tsx`
- `src/play/quiz/_components/QuizPlayPageLayout.tsx`
- `src/play/quiz/_components/ResultPageShell.tsx`
- `src/dictionary/_components/new/DictionaryDetailLayout.tsx`
- `src/blog/_components/BlogListView.tsx`

クイズ定義は15件（`src/play/quiz/registry.ts:2-16` の import）。

---

## 9. `/play/character-personality`

### 9-1. ルートとファイル

| 部位           | ファイル                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| プレイ面       | `src/app/play/[slug]/page.tsx` → `src/play/quiz/_components/QuizPlayPageLayout.tsx`（CSS は `src/app/play/[slug]/page.module.css`）                                                                                                                                |
| プレイ面の OGP | `src/app/play/[slug]/opengraph-image.tsx`（ogp-image）                                                                                                                                                                                                             |
| 結果面         | `src/app/play/character-personality/result/[resultId]/page.tsx` と `page.module.css`                                                                                                                                                                               |
| 結果面の OGP   | `.../opengraph-image.tsx`（fuda-image、和色）                                                                                                                                                                                                                      |
| 札画像         | `.../fuda-image/route.ts`                                                                                                                                                                                                                                          |
| データ         | `src/play/quiz/data/character-personality.ts`、`character-personality-results-batch1/2/3.ts`（タイプ数 10 + 10 + 4 = 24、各タイプに `color` の hex）、`character-personality-compat-{different,shared}.ts`、`character-personality-compatibility.ts`（合計3243行） |

### 9-2. 描画に使うコンポーネント

node スクリプトで import を再帰的に解決した（`src/app/play/[slug]/page.tsx` と結果 page.tsx を起点に、data/lib/registry は除外）。

| 区分                                                            | コンポーネント                                                                                                                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 共有部品（`src/components`）                                    | Breadcrumb、FaqSection、ShareButtons、Tsutsumi（→ In）、Nefuda（QuizContainer の NefudaGroup）                                                                                                                                                     |
| play 共通                                                       | `src/play/_components/RecommendedContent`                                                                                                                                                                                                          |
| quiz 部品（プレイ）                                             | QuizContainer、ProgressBar、QuestionCard、ResultCard、ResultNextContent、ResultExtraLoader、RelatedQuizzes                                                                                                                                         |
| quiz 部品（結果）                                               | CompatibilitySection、InviteFriendButton、ShareButtons（quiz 版）、FudaActions、OtherTypesNav、CharacterPersonalityContent、ResultPageShell、resultVisual.ts、introBadges.ts                                                                       |
| `[slug]/result` 共有                                            | DescriptionExpander、CompatibilityDisplay                                                                                                                                                                                                          |
| ResultCard が静的 import する他診断の部品（同じバンドルに入る） | AnimalPersonality、ContrarianFortune、ImpossibleAdvice、MusicPersonality、TraditionalColor、UnexpectedCompatibility、YojiPersonality の各 Content、RadarChart、ScienceThinkingResultExtra、CharacterFortuneResultExtra、JapaneseCultureResultExtra |

### 9-3. CSS module ごとのトークン参照

`var(--X[,) ]` の出現数（`rg -o -e "var\(--$t[,) ]" FILE | wc -l`）。

| CSS module                        | paper | paper-2 | ink | ink-2 | rule | rule-strong | accent | accent-weak | radius | radius-sm | font-mincho | font-gothic | font-number | wairo | 行数 |
| --------------------------------- | ----- | ------- | --- | ----- | ---- | ----------- | ------ | ----------- | ------ | --------- | ----------- | ----------- | ----------- | ----- | ---- |
| app/play/[slug]/page              | 0     | 0       | 1   | 2     | 1    | 0           | 0      | 0           | 0      | 0         | 0           | 0           | 0           | 0     | 71   |
| QuizContainer                     | 1     | 0       | 0   | 1     | 0    | 0           | 5      | 1           | 1      | 0         | 1           | 0           | 0           | 0     | 97   |
| ProgressBar                       | 0     | 1       | 0   | 1     | 1    | 0           | 1      | 0           | 1      | 0         | 0           | 0           | 0           | 0     | 42   |
| QuestionCard                      | 2     | 1       | 2   | 3     | 2    | 1           | 8      | 3           | 3      | 1         | 1           | 0           | 0           | 0     | 159  |
| ResultCard                        | 1     | 5       | 10  | 7     | 5    | 1           | 9      | 3           | 8      | 1         | 0           | 0           | 0           | 0     | 364  |
| Tsutsumi                          | 1     | 0       | 2   | 3     | 1    | 1           | 0      | 0           | 2      | 0         | 3           | 4           | 1           | 16    | 181  |
| In                                | 0     | 0       | 0   | 0     | 0    | 0           | 2      | 0           | 0      | 0         | 1           | 0           | 0           | 0     | 50   |
| Nefuda                            | 0     | 0       | 0   | 1     | 1    | 0           | 0      | 0           | 0      | 1         | 0           | 1           | 0           | 0     | 32   |
| CompatibilitySection              | 0     | 0       | 3   | 2     | 0    | 1           | 0      | 0           | 0      | 0         | 0           | 0           | 0           | 0     | 75   |
| InviteFriendButton                | 1     | 0       | 0   | 1     | 1    | 0           | 4      | 1           | 1      | 0         | 0           | 0           | 0           | 0     | 48   |
| quiz/ShareButtons                 | 1     | 0       | 1   | 0     | 1    | 0           | 4      | 0           | 1      | 0         | 0           | 0           | 0           | 0     | 57   |
| FudaActions                       | 2     | 1       | 1   | 2     | 3    | 0           | 6      | 0           | 1      | 0         | 0           | 0           | 0           | 0     | 96   |
| OtherTypesNav                     | 0     | 0       | 2   | 0     | 2    | 0           | 2      | 2           | 1      | 0         | 0           | 0           | 0           | 0     | 81   |
| ResultNextContent                 | 2     | 0       | 1   | 2     | 3    | 0           | 3      | 0           | 1      | 1         | 0           | 0           | 0           | 0     | 80   |
| RelatedQuizzes                    | 1     | 0       | 1   | 1     | 3    | 0           | 3      | 0           | 1      | 0         | 0           | 0           | 0           | 0     | 79   |
| RecommendedContent                | 0     | 0       | 2   | 2     | 5    | 0           | 2      | 0           | 0      | 1         | 2           | 1           | 0           | 0     | 82   |
| Breadcrumb                        | 0     | 0       | 1   | 2     | 0    | 0           | 2      | 0           | 0      | 1         | 0           | 0           | 0           | 0     | 70   |
| FaqSection                        | 0     | 0       | 4   | 2     | 2    | 0           | 2      | 0           | 1      | 0         | 0           | 0           | 0           | 0     | 98   |
| components/ShareButtons           | 1     | 0       | 1   | 0     | 1    | 0           | 6      | 0           | 1      | 0         | 0           | 2           | 0           | 0     | 67   |
| CharacterPersonalityContent       | 0     | 4       | 7   | 1     | 5    | 0           | 3      | 1           | 4      | 0         | 0           | 0           | 0           | 0     | 209  |
| ResultPageShell                   | 0     | 0       | 1   | 3     | 1    | 0           | 0      | 0           | 0      | 0         | 0           | 0           | 0           | 0     | 60   |
| DescriptionExpander               | 0     | 0       | 1   | 0     | 0    | 0           | 2      | 0           | 0      | 0         | 0           | 0           | 0           | 0     | 42   |
| character-personality result page | 1     | 1       | 1   | 2     | 1    | 1           | 4      | 2           | 2      | 0         | 1           | 0           | 0           | 0     | 113  |

### 9-4. 結果の色の出方

- 結果の主表示は Tsutsumi。色は `pickResultWairoColor(result.id)`（ID ハッシュで和色8色から選ぶ）で決まる（`ResultPageShell.tsx:85-91`、`ResultCard.tsx:508-515`）。
- データの `result.color`（24色）は `--type-color` のインライン注入にだけ使われる（`CharacterPersonalityContent.tsx:214`）。CSS の参照は0件。

---

## 10. OGP 画像・favicon・theme-color

### 生成しているファイル

| 種類                  | 件数 | コマンド・内訳                                                                                                                                                                                      |
| --------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opengraph-image.tsx` | 57   | `find src/app -name opengraph-image.tsx \| wc -l`                                                                                                                                                   |
| `twitter-image.tsx`   | 40   | 全件が `export { default, ... } from "./opengraph-image"` の再エクスポート                                                                                                                          |
| 97ファイルの生成器別  | —    | `src/lib/ogp-image.tsx` 54、`src/lib/fuda-image.tsx` 3（`dictionary/colors/[slug]`、`play/traditional-color/result/[resultId]`、`play/character-personality/result/[resultId]`）、再エクスポート 40 |
| 札画像ルート          | 1    | `src/app/play/character-personality/result/[resultId]/fuda-image/route.ts`                                                                                                                          |

### 見た目の指定

**ogp-image**（`src/lib/ogp-image.tsx:262-385`）:

- 色は `@/lib/utsuwaHex` の light 固定値。地 PAPER `#f8f7f2`、文字 INK `#201e1a`/INK_2 `#58554f`。
- 外枠 `2px solid RULE_STRONG #302d28`、padding 56px 64px。
- 上部帯に「yolos.net」（ゴシック 30px・INK_2）。帯の下の `borderBottom: 1px solid RULE #cdcac5` は padding 内の要素に引かれている。
- 品名は明朝（NotoSerifJP 600）。副題はゴシック（NotoSansJP 400）。
- 右上に `ACCENT #af3622` の明朝「y」（-6° 回転）。

**fuda-image**（`src/lib/fuda-image.tsx`）:

- ogp-image と同じ外枠・帯（:150-170 付近）。
- 300×300 の記号面（:214-224）の地は和色（`wairoHex`）か `colorOverride`（実際の色 hex）。記号字をその上に載せる。
- ACCENT を stroke と色に使う（:287, 300）。

**favicon**:

- `public/icon.svg`: 地 `#f8f7f2` の上に、`#af3622` の角丸矩形（`rx="17.6"`）と `#f8f7f2` の「y」（パス）。
- `public/favicon.ico`（16/32/48）と `public/apple-touch-icon.png`（180×180）もある。
- 生成は `scripts/generate-favicons.ts`（Noto Serif JP wght 900）。
- 参照は `src/lib/site-metadata.ts:42-47`。

**theme-color**: `rg -n -e 'themeColor|theme-color|viewport' src` のヒットは blog 本文と middleware の viewport meta だけ。`theme-color` の指定は0件。

**既定テーマ**: `ThemeProvider` は `attribute="class" defaultTheme="system" enableSystem`（:24-26）。

### DESIGN.md §10 との差

| 項目             | DESIGN §10                                                          | 実装                                                                                                                    |
| ---------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| favicon          | `--ink` の背景に `--paper` で `y`（見出し書体）。角丸なし・彩度なし | 地 `#f8f7f2` に朱 `#af3622` の角丸タイル（rx 17.6）、白抜き `y`（Noto Serif JP 900）                                    |
| theme-color      | テーマごとの `--paper`                                              | 指定なし                                                                                                                |
| OGP の地・文字   | `--paper` 地・`--ink` 文字                                          | light 固定の hex（PAPER/INK。chroma ありの値を hex 化したもの）                                                         |
| OGP の罫線       | 全幅の罫線                                                          | 外枠 2px と、padding 内の 1px 下罫                                                                                      |
| OGP の見出し書体 | 見出し書体（Zen Antique）                                           | Noto Serif JP 600                                                                                                       |
| OGP の色見本     | 主題が色のページだけ1つ。ほかは印も足さない                         | 色が主題の2面は記号面を実際の色で塗り、その上に字を置く。character-personality の結果は和色の記号面。全 OGP に朱の「y」 |

---

## 11. テスト

コマンドは `T="-g *.test.ts -g *.test.tsx"` を付けて src/ で数えた。

| 項目                                                | コマンド                                                                                                                                                                                 | ファイル数                                                                                                                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストファイル総数（src/）                          | `rg --files src $T \| wc -l`                                                                                                                                                             | 321                                                                                                                                                                          |
| デザイン値を固定しているテスト（和集合）            | `rg -l -e 'globals\.css\|--accent\|--rule-strong\|--wairo-\|oklch\(\|--paper\|--ink\|--rule\b\|--radius\|--font-\|utsuwaHex\|wairoHex\|border-radius\|box-shadow\|\.module\.css' src $T` | **57**                                                                                                                                                                       |
| うち CSS ファイルを読むテスト                       | `rg -l readFileSync \| xargs rg -l '\.css'`                                                                                                                                              | 50                                                                                                                                                                           |
| うち `expect(css...)` で CSS 文字列を検査するテスト | `rg -l -e 'expect\(css' src $T`                                                                                                                                                          | 44                                                                                                                                                                           |
| globals.css を参照                                  | `rg -l -e 'globals\.css'`                                                                                                                                                                | 4（`src/test/design-gate.test.ts`、`src/app/__tests__/globals-css-dialog.test.ts`、`src/lib/__tests__/wairoHex.test.ts`、`src/tools/qr-code/__tests__/QrCodeTile.test.tsx`） |
| `--accent` を含む                                   | `rg -l -e 'var\(--accent\|--accent\b'`                                                                                                                                                   | 44（うち `var(--accent` の文字列は13）                                                                                                                                       |
| `oklch(` を含む                                     | —                                                                                                                                                                                        | 3（design-gate、wairoHex、BmiCalculatorTile）                                                                                                                                |
| utsuwaHex/wairoHex を参照                           | —                                                                                                                                                                                        | 4（fuda-image、ogp-image、wairoHex、design-gate）                                                                                                                            |
| 書体名・`--font-` を含む                            | —                                                                                                                                                                                        | 4（ogp-image、Textarea、design-gate、middleware-gone-slugs）                                                                                                                 |
| `--rule-strong` を含む                              | —                                                                                                                                                                                        | 2                                                                                                                                                                            |
| `--wairo-` を含む                                   | —                                                                                                                                                                                        | 2                                                                                                                                                                            |
| `border-radius`/`borderRadius` を含む               | —                                                                                                                                                                                        | 10                                                                                                                                                                           |
| `font-weight: 700` を禁止する検査                   | `rg -l -F 'font-weight\s*:\s*700'`                                                                                                                                                       | 20                                                                                                                                                                           |
| `background: var(--accent)` を禁止する検査          | —                                                                                                                                                                                        | 4                                                                                                                                                                            |
| `var(--color-` を禁止する検査                       | —                                                                                                                                                                                        | 35                                                                                                                                                                           |
| 6桁 hex を含む                                      | —                                                                                                                                                                                        | 45（色変換系のテストデータを含む）                                                                                                                                           |
| `toHaveClass`/`className` を含む                    | —                                                                                                                                                                                        | 14                                                                                                                                                                           |
| `getByText` 系で文言を固定                          | `rg -l -e '(get\|find\|query)(All)?ByText'`                                                                                                                                              | 77                                                                                                                                                                           |
| `toHaveTextContent`                                 | —                                                                                                                                                                                        | 25                                                                                                                                                                           |
| AI 運営の告知文を固定                               | —                                                                                                                                                                                        | 3                                                                                                                                                                            |

`src/test/design-gate.test.ts` は1020行・26テスト。冒頭のコメント（:1-60）は、DESIGN.md の §8「禁止リスト」、§8-1〜§8-7、§10「色の直書き」などの節番号を検査項目として挙げている。

tests/e2e には `blog-detail-share-buttons.mjs` が1ファイルあり、色の検査は0件だった。

### 参考: src のコメントが挙げる DESIGN.md の節番号

`rg -o -e '§8-[0-9]+' src -g '!*.md'` は150件・57ファイル。現行の DESIGN.md の §8 は「入力と結果」で、`§8-1` のような枝番の節は無い。

---

## 12. 色の直書きとして現れない、中身になりうるもの

計画のレビューで、1〜11 の実測範囲から漏れていると指摘されたもの。計測日は同じ 2026-09-24。

| 何が               | 実測                                                                                                                                                                                  | 根拠                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| コードの色分け     | Shiki（`shiki/bundle/full`）がビルド時に、ライトの色をインラインの `color`・`background-color` として、ダークの色を `--shiki-dark`・`--shiki-dark-bg` として埋め込む。2テーマとも有彩 | `src/lib/highlight.ts:1-25`                                                                          |
| mermaid の図       | 11記事が ` ```mermaid ` を含む。描画テーマは `isDark ? "dark" : "default"`（どちらも有彩）                                                                                            | `grep -l '```mermaid' src/blog/content/*.md \| wc -l`、`src/blog/_components/MermaidRenderer.tsx:51` |
| ブログ本文の絵文字 | 87記事のうち2記事（`2026-02-22-game-infrastructure-refactoring.md`・`2026-02-14-character-counting-guide.md`）                                                                        | Python で U+1F300–1FAFF・U+2600–27BF を検索                                                          |

### 12-1. `--font-mincho`（いまの見出し書体）を使う箇所の内訳

計画の2巡目のレビューで、字形が中身の面の列挙が不完全だと指摘されたため作り直した。コマンド: `rg -n "var\(--font-mincho" src -g '*.css' -g '!src/app/globals.css'` の各行について、直前のセレクタを読んだ。**「字形が中身」とは、表示している字そのものが来訪者の求める答え・学習の対象であるものを指す**（辞典の見出し字、ゲームの答え、読みを問う設問）。

**字形が中身になりうるもの**

| 面                 | 箇所                                                                                                                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 漢字辞典の詳細     | `src/dictionary/_components/kanji/KanjiDetail.module.css:22`（`.character` 大字）、`:134`（`.relatedLink` 関連する字）                                                                                                                                            |
| 四字熟語辞典の詳細 | `src/dictionary/_components/yoji/YojiDetail.module.css:19`（`.character` 大字）、`:110`（`.kanjiLink`）、`:131`（`.kanjiChar`）、`:148`（`.relatedLink`）                                                                                                         |
| 辞典の一覧と索引   | `src/dictionary/_components/DictionaryEntryList/DictionaryEntryList.module.css:65`（`.name` 見出し語）、`src/dictionary/_components/FacetIndex/FacetIndex.module.css:50`（`.link` 部首などの索引）、`src/app/dictionary/kanji/page.module.css:95`（`.facetLink`） |
| 漢字カナール       | 盤面 `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css:191`（`.guessKanji`、書体の指定なし＝本文から継承）、正解の表示 `:372`（`.resultAnswer`、見出し書体）                                                                                 |
| 四字熟語きめる     | 正解の表示 `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css:331`（`.resultAnswer`）。盤面は書体の指定なし                                                                                                                                     |
| 知識クイズの設問   | `src/play/quiz/_components/QuestionCard.module.css:26`（`.questionText`。漢字・ことわざ・四字熟語の読みや意味を問う設問）                                                                                                                                         |

**見出し書体として使っているもの（字形は中身でない）**

ツールの見出し（`ToolPageLayout`・`ErrorBoundary`）、ゲームの見出し（kanji-kanaru・yoji-kimeru・irodori・nakamawake の `.title`、`GameLayout`、`GameDialog`、`RelatedBlogPosts`）、診断の開始ボタンと結果面の「やってみる」ボタン（`QuizContainer .startButton`、結果ページ10個の `.tryButton`）、関連コンテンツの見出しと名前（`RelatedContentCard`・`RecommendedContent`・`RelatedTools`・`RelatedBlogPosts`・`PlayRecommendBlock`）、辞典の見出し（`DictionarySearch`・`FacetIndex .heading`）、ユーモア辞典の語（`app/dictionary/humor` の `.word`・`.relatedWord`）、ブログの見出し（`SeriesNav`・`blog/[slug] .navTitle`）、トップのヒーローのリンク、共有部品（Header のロゴ・Footer の列見出し・Shinagaki・Tsutsumi・In）。

### 12-2. 見出し書体に無い字

Google Fonts の Zen Antique の CSS（`https://fonts.googleapis.com/css2?family=Zen+Antique&display=swap`、2026-09-24 取得・`@font-face` の unicode-range 8039区間）を `src/data/kanji-data.json` の2136字と照合した。**範囲外は「𠮟」（U+20B9F）の1字だけだった。** `DESIGN.md` §3「Zen Antique に無い字を含む見出しは、その和文を丸ごと本文書体で組む」が実際に掛かる面である（同じ照合を計画の2巡目のレビューも行い、同じ結果だった）。
