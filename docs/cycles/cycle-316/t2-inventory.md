# T2 着手前の洗い出し（コントロールと入力）

計測日: 2026-09-25
本書は実測の列挙のみ。案・評価は含まない。

- 変更前: コミット `885c924` の親（`885c924^`）。`git archive 885c924^ src` で取り出したものを読んだ。
- いま: `HEAD`（`db7e525`）。作業ツリーには T2 の着手による未コミットの変更があるので、`git archive db7e525 src` で取り出したものを読んだ。
- CSS は postcss で規則ごとに読み、宣言の値に `var(--accent)`・`var(--accent-weak)` を含む規則を拾った。`--accent` の件数には `--accent-weak` を含めない。
- 変更前に `--accent`・`--accent-weak` を値に持つ CSS の規則は 309 件（107 ファイル）。うち `outline` だけに使う規則が 106 件で、105 件はフォーカスの規則（5 章）、1 件は `.swatchSelected`（選択の輪。1-6）。TSX・TS の `var(--accent…)` はコメントとテストの中だけで、インラインのスタイルには無い。
- 値に `--accent` を持たない規則は、1-3（`filter`・`opacity` の hover）、1-4（全体の `a:hover`）、1-5（無効）、1-7（下線を持たないリンク）で別の条件で拾った。条件はそれぞれの節に書く。
- 1 章で扱う規則の色の宣言（`color`・`background`・`border`・`outline`・`text-decoration`・`font-weight`）は、`globals.css`・`Header.module.css`・`Footer.module.css`・`ThemeToggle.module.css`（削除済み）と `In.module.css` の `.char` の `font-weight` を除き、HEAD でも同じ値のまま残っている。

HEAD の `globals.css` で、関わるトークンは次の値を指す。

| トークン        | 変更前（light）                  | HEAD                     |
| --------------- | -------------------------------- | ------------------------ |
| `--accent`      | `oklch(0.51 0.16 32)`（朱）      | `var(--ink)`             |
| `--accent-weak` | `oklch(0.51 0.16 32 / 0.12)`     | `var(--paper-2)`         |
| `--rule`        | `oklch(0.84 0.008 85)`（淡い線） | `var(--ink)`             |
| `--rule-strong` | `oklch(0.3 0.01 80)`             | `var(--rule)`（= --ink） |
| `--radius`      | `0px`                            | `0px`                    |
| `--radius-sm`   | `2px`                            | `var(--radius)`（= 0px） |

そのため HEAD では、変更前に `--rule`・`--rule-strong` で引いていた枠と、`--accent` に変わる枠が同じ `--ink` になる。

---

## 1. 色だけで操作や状態を示していた箇所

判定: 下線・反転・枠・形・太字など、色以外の手がかりが同じ状態に無いものを「色だけ」とした。

### 1-0. 全体の既定（`src/app/globals.css`）

| 選択子    | 変更前                             | HEAD                                                   |
| --------- | ---------------------------------- | ------------------------------------------------------ |
| `a`       | 朱・下線                           | `:where(a)` が `--ink`・細い下線。訪問済みは `--ink-2` |
| `a:hover` | 朱（詳細度 0,1,1）。hover は色だけ | 規則が無い                                             |

変更前の `a:hover` は詳細度が `.class`（0,1,0）より高く、部品のクラスで色を決めたリンクも、自前の hover の色を持たないものは hover で朱になっていた。

### 1-1. 静止時に色だけで示していたもの（20 規則）

**リンク（12 規則）**。どれも `text-decoration: none` で、hover でだけ下線が出る。

| ファイル                                                                     | 選択子                  | 何か                                       | HEAD の見え方                                                           |
| ---------------------------------------------------------------------------- | ----------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| `src/app/blog/[slug]/page.module.css`                                        | `.category`             | 記事の上の分類のリンク                     | `--ink`・下線なし。並ぶ日付（`.meta` の `--ink-2`）とは明度の差だけ     |
| `src/app/dictionary/humor/[slug]/page.module.css`                            | `.backLink a`           | 一覧へ戻るリンク                           | `--ink`・下線なし。本文と同じ                                           |
| `src/app/storybook/page.module.css`                                          | `.tocList li a`         | 目次のリンク                               | `--ink`・下線なし                                                       |
| `src/blog/_components/SeriesNav.module.css`                                  | `.link`                 | シリーズの記事の一覧のリンク               | `--ink`・下線なし。いまの記事（`.currentLink`）も `--ink`、行が太字     |
| `src/components/Breadcrumb/Breadcrumb.module.css`                            | `.link`                 | パンくずのリンク                           | `--ink`・下線なし。いまのページ（`.current`、リンクでない）と同じ見え方 |
| `src/dictionary/_components/color/ColorDetail.module.css`                    | `.crossLink`            | 色の詳細から色変換ツールへのリンク         | `--ink`・下線なし                                                       |
| `src/dictionary/_components/kanji/KanjiDetail.module.css`                    | `.crossLink`            | 漢字の詳細から「漢字カナール」へのリンク   | `--ink`・下線なし                                                       |
| `src/dictionary/_components/yoji/YojiDetail.module.css`                      | `.crossLink`            | 四字熟語の詳細から「四字キメル」へのリンク | `--ink`・下線なし                                                       |
| `src/dictionary/_components/yoji/YojiDetail.module.css`                      | `.externalLink`         | 出典の外部サイトへのリンク                 | `--ink`・下線なし                                                       |
| `src/dictionary/_components/new/PlayRecommendBlock.module.css`               | `.cta`                  | 行の中の「診断してみる →」などの誘い（※1） | `--ink`・下線なし。行の説明（`--ink-2`）とは明度の差だけ                |
| `src/play/quiz/_components/QuizContainer.module.css`                         | `.relatedLink`          | 診断の開始画面の関連リンク                 | `--ink`・下線なし                                                       |
| `src/tools/traditional-color-palette/TraditionalColorPaletteTile.module.css` | `.paletteColorNameLink` | 選んだ伝統色の名前から色の辞典へのリンク   | `--ink`・下線なし                                                       |

※1 `.cta` は行のリンク（`.card`、`text-decoration: none`）の中の文字。行の hover では名前（`.title`）に下線が出る。文言は `getCtaText` が分類ごとに「占ってみる」「診断してみる」「挑戦してみる」「遊んでみる」を返す。

**現在地（3 規則）**

| ファイル                                                      | 選択子                                | 何か                                   | HEAD の見え方                                                                                   |
| ------------------------------------------------------------- | ------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/components/Header/Header.module.css`（変更前）           | `.navLink[aria-current="page"]`       | 上端のナビの現在地（ほかは `--ink-2`） | 規則が無い。上端は `FrameLink` に替わり、現在地は太字・下線なし（`.link[aria-current="page"]`） |
| `src/components/Header/Header.module.css`（変更前）           | `.mobileNavLink[aria-current="page"]` | 狭い画面のメニューの現在地             | 規則が無い（狭い画面のメニューが無い）                                                          |
| `src/dictionary/_components/FacetIndex/FacetIndex.module.css` | `.active`                             | 辞典の索引（部首・画数など）の現在地   | `--ink`。ほかの項目（`.link`）も `--ink`・下線なしで、同じ見え方                                |

**選択・状態（5 規則）**

| ファイル                                                                | 選択子                    | 何か                               | 変更前                            | HEAD の見え方                                                                                                  |
| ----------------------------------------------------------------------- | ------------------------- | ---------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css` | `.difficultyButtonActive` | 難易度の選んだ状態                 | 地 `--accent-weak`・文字と枠 朱   | 地 `--paper-2`・文字 `--ink`・枠 `--ink`。選ばない状態（文字 `--ink-2`・枠 `--ink`）との差は地と文字の明度だけ |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`   | `.difficultyButtonActive` | 同上                               | 同上                              | 同上                                                                                                           |
| `src/play/games/nakamawake/_components/WordGrid.module.css`             | `.selected`               | なかまわけの選んだ語               | 地 `--accent-weak`・文字と枠 朱   | 地 `--paper-2`・文字と枠 `--ink`。選ばない語（地 `--paper`・文字と枠 `--ink`）との差は地の色だけ               |
| `src/components/Input/Input.module.css`                                 | `.error`                  | 入力欄のエラーの状態               | 枠の色だけ朱（太さは 1px のまま） | 枠 `--ink`。平常時（`--rule-strong` = `--ink`）と同じ見え方                                                    |
| `src/components/FileDropZone/FileDropZone.module.css`                   | `.dropZoneActive`         | ファイルをドラッグで重ねている状態 | 破線の枠の色だけ朱                | 枠 `--ink`。平常時（`--rule-strong` = `--ink`）と同じ見え方                                                    |

### 1-2. hover・active で色だけが変わっていたもの（69 規則）

「HEAD の見え方」の「変化なし」は、平常時と hover の色が HEAD でどちらも同じトークンを指すことをいう。

| ファイル                                                                 | 選択子                                                            | 何か                                   | 変更前の hover                                  | HEAD の見え方                               |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| `src/app/globals.css`                                                    | `a:hover`                                                         | すべてのリンク（1-0）                  | 文字 朱                                         | 規則が無い                                  |
| `src/app/global-not-found.module.css`                                    | `.card:hover`                                                     | 404 の案内の枠つきリンク               | 枠 朱                                           | 変化なし                                    |
| `src/app/page.module.css`                                                | `.heroLink:hover`                                                 | トップの枠つきリンク                   | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| 診断の結果のページ 10 ファイル（※2）                                     | `.tryButton:hover`                                                | 「この診断をやってみる」の枠つきリンク | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| 診断の結果のページ 9 ファイル（※2 から character-fortune を除く）        | `.cta2Link:hover`                                                 | 2つ目の誘いの枠つきリンク              | 地 `--accent-weak`・文字 朱（1-0 の `a:hover`） | 変化なし（平常時の地が `--paper-2`）        |
| `src/blog/_components/BlogFilterableList.module.css`                     | `.tagChip:hover`                                                  | タグの枠つきリンク                     | 文字と枠 朱                                     | 文字が `--ink-2` から `--ink`。枠は変化なし |
| `src/blog/_components/TagList.module.css`                                | `.tagLink:hover`                                                  | 記事のタグの枠つきリンク               | 文字と枠 朱                                     | 文字が `--ink-2` から `--ink`。枠は変化なし |
| `src/components/Button/Button.module.css`                                | `.variantDefault:hover:not(:disabled)`                            | 既定のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/components/FileDropZone/FileDropZone.module.css`                    | `.dropZone:hover`                                                 | ファイルを落とす欄                     | 破線の枠 朱                                     | 変化なし                                    |
| `src/components/Header/Header.module.css`（変更前）                      | `.hamburger:hover`                                                | 狭い画面のメニューのボタン             | 文字 朱                                         | 規則が無い（ボタンが無い）                  |
| `src/components/Pagination/Pagination.module.css`                        | `.pageItem:hover:not(.disabled):not(.active)`                     | ページ送りの項目                       | 文字と枠 朱                                     | 変化なし                                    |
| `src/components/SegmentedControl/SegmentedControl.module.css`            | `.option:hover:not([aria-checked="true"])`                        | セグメント切替の選ばない項目           | 地 `--accent-weak`                              | 変化なし（外側 `.root` の地が `--paper-2`） |
| `src/components/ShareButtons/ShareButtons.module.css`                    | `.button:hover`・`.button:active`（2 規則）                       | 共有のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/dictionary/_components/color/ColorDetail.module.css`                | `.copyButton:hover`                                               | 色の値のコピーのボタン                 | 文字と枠 朱                                     | 文字が `--ink-2` から `--ink`。枠は変化なし |
| 同上                                                                     | `.categoryLink:hover`                                             | 色の分類の枠つきリンク                 | 文字と枠 朱                                     | 文字が `--ink-2` から `--ink`。枠は変化なし |
| 同上                                                                     | `.relatedLink:hover`・`.relatedLink:hover .relatedName`（2 規則） | 関連する色の枠つきリンク               | 枠と名前 朱                                     | 変化なし                                    |
| `src/dictionary/_components/yoji/YojiDetail.module.css`                  | `.categoryTag:hover`                                              | 四字熟語の分類の枠つきリンク           | 文字と枠 朱                                     | 文字が `--ink-2` から `--ink`。枠は変化なし |
| 同上                                                                     | `.kanjiLink:hover`                                                | 構成する漢字の枠つきリンク             | 文字と枠 朱                                     | 変化なし                                    |
| `src/humor-dict/_components/EntryRatingButton.module.css`                | `.button:not([aria-pressed="true"]):hover`                        | 笑辞典の評価のボタン                   | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/irodori/_components/GameHeader.module.css`               | `.iconButton:hover`                                               | ゲームの見出しのアイコンのボタン       | 文字 朱                                         | 文字が `--ink-2` から `--ink`               |
| `src/play/games/irodori/_components/ResultModal.module.css`              | `.statsButton:hover`                                              | 成績のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/kanji-kanaru/_components/GameContainer.module.css`       | `.retryButton:hover`                                              | やり直しのボタン                       | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css`  | `.iconButton:hover`                                               | アイコンのボタン                       | 文字 朱                                         | 文字が `--ink-2` から `--ink`               |
| 同上                                                                     | `.difficultyButton:hover`                                         | 難易度のボタン                         | 文字と枠 朱                                     | 文字が `--ink-2` から `--ink`。枠は変化なし |
| 同上                                                                     | `.statsButton:hover`                                              | 成績のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/nakamawake/_components/GameControls.module.css`          | `.secondaryButton:hover:not(:disabled)`                           | 操作のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/nakamawake/_components/GameHeader.module.css`            | `.iconButton:hover`                                               | アイコンのボタン                       | 文字 朱                                         | 文字が `--ink-2` から `--ink`               |
| `src/play/games/nakamawake/_components/ResultModal.module.css`           | `.statsButton:hover`                                              | 成績のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/nakamawake/_components/WordGrid.module.css`              | `.wordButton:hover:not(:disabled)`                                | 語のボタン                             | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/shared/_components/new/CrossCategoryBanner.module.css`   | `.link:hover`                                                     | ほかの分類への枠つきリンク             | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/shared/_components/new/GameDialog.module.css`            | `.modalClose:hover`                                               | ダイアログを閉じるボタン               | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/shared/_components/new/GameShareButtons.module.css`      | `.shareButton:hover`                                              | 共有のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/yoji-kimeru/_components/styles/GameContainer.module.css` | `.retryButton:hover`                                              | やり直しのボタン                       | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`    | `.iconButton:hover`                                               | アイコンのボタン                       | 文字 朱                                         | 文字が `--ink-2` から `--ink`               |
| 同上                                                                     | `.difficultyButton:hover`                                         | 難易度のボタン                         | 文字と枠 朱                                     | 文字が `--ink-2` から `--ink`。枠は変化なし |
| 同上                                                                     | `.statsButton:hover`                                              | 成績のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/quiz/_components/FudaActions.module.css`                       | `.shareButton:hover:not(:disabled)`                               | 札の共有のボタン                       | 文字と枠 朱                                     | 変化なし                                    |
| `src/play/quiz/_components/InviteFriendButton.module.css`                | `.button:hover`                                                   | 友だちを誘うボタン                     | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| `src/play/quiz/_components/OtherTypesNav.module.css`                     | `.item > a:hover`                                                 | ほかのタイプへのリンク                 | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| `src/play/quiz/_components/QuestionCard.module.css`                      | `.choiceButton:hover:not(:disabled)`                              | 設問の選択肢のボタン                   | 枠 朱・地 `--accent-weak`                       | 地 `--paper-2`。枠は変化なし                |
| 同上                                                                     | `.nextButton:hover`                                               | 次の設問へのボタン                     | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| `src/play/quiz/_components/QuizContainer.module.css`                     | `.startButton:hover`                                              | 「はじめる」のボタン                   | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| `src/play/quiz/_components/RelatedQuizzes.module.css`                    | `.link:hover`                                                     | 関連する診断の枠つきの行               | 枠 朱                                           | 変化なし                                    |
| `src/play/quiz/_components/ResultCard.module.css`                        | `.recommendation:hover`                                           | おすすめの枠つきリンク                 | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| 同上                                                                     | `.retryButton:hover`                                              | もう一度のボタン                       | 地 `--accent-weak`・文字と枠 朱                 | 地 `--paper-2`。文字と枠は変化なし          |
| 同上                                                                     | `.tiedTypeLink:hover`                                             | 同点のタイプへの枠つきリンク           | 地 `--accent-weak`                              | 地 `--paper-2`                              |
| `src/play/quiz/_components/ResultNextContent.module.css`                 | `.link:hover`                                                     | 次の診断の枠つきの行                   | 枠 朱                                           | 変化なし                                    |
| `src/play/quiz/_components/ShareButtons.module.css`                      | `.shareButton:hover`                                              | 共有のボタン                           | 文字と枠 朱                                     | 変化なし                                    |
| `src/tools/image-resizer/ImageResizerTile.module.css`                    | `.lockButton:hover`                                               | 縦横比の固定のボタン                   | 枠 朱                                           | 変化なし                                    |
| `src/tools/regex-tester/RegexTesterTile.module.css`                      | `.toggleButton:hover`                                             | 表示の切り替えのボタン                 | 枠 朱                                           | 変化なし                                    |

※2 `src/app/play/{[slug],animal-personality,character-fortune,character-personality,contrarian-fortune,impossible-advice,music-personality,traditional-color,unexpected-compatibility,yoji-personality}/result/[resultId]/page.module.css`

内訳: 「変化なし」37 規則、地が `--paper-2` になる 19 規則、文字の明度だけ変わる 11 規則、規則が無い 2 規則。

### 1-3. 朱の面の明度だけを変えていた hover・active（15 規則）

拾い方: 変更前の CSS で、選択子に `:hover` か `:active` を含み、`filter` か `opacity` を宣言する規則を集めた（17 規則）。そこから、朱を使っていない `.colorNameLink:hover`（`opacity: 0.8`。1-6）と `.swatch:hover .swatchTooltip`（吹き出しを出す）を除いた。

| ファイル                                                                | 選択子                                                                          | 平常時の面                      | 変更前の hover・active                 | HEAD の見え方                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------- | ------------------------------------------------ |
| `src/components/Button/Button.module.css`                               | `.variantPrimary:hover:not(:disabled)`・`.variantPrimary:active:not(:disabled)` | 地 朱                           | `brightness(0.92)`・`brightness(0.85)` | 地 `--ink` に同じ `filter`                       |
| `src/play/quiz/_components/FudaActions.module.css`                      | `.saveButton:hover:not(:disabled)`・`.saveButton:active:not(:disabled)`         | 地 朱                           | `brightness(0.92)`・`brightness(0.85)` | 地 `--ink` に同じ `filter`                       |
| `src/play/games/irodori/_components/GameContainer.module.css`           | `.submitButton:hover`                                                           | 地 朱                           | `opacity: 0.9`                         | 地 `--ink` に同じ `opacity`                      |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css` | `.submitButton:hover:not(:disabled)`・`.submitButton:active:not(:disabled)`     | 地 朱                           | `brightness(0.92)`・`brightness(0.85)` | 地 `--ink` に同じ `filter`                       |
| 同上                                                                    | `.difficultyButtonActive:hover`                                                 | 地 `--accent-weak`・文字と枠 朱 | `brightness(0.97)`                     | 地 `--paper-2`・文字と枠 `--ink` に同じ `filter` |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`   | `.submitButton:hover:not(:disabled)`・`.submitButton:active:not(:disabled)`     | 地 朱                           | `brightness(0.92)`・`brightness(0.85)` | 地 `--ink` に同じ `filter`                       |
| 同上                                                                    | `.difficultyButtonActive:hover`                                                 | 地 `--accent-weak`・文字と枠 朱 | `brightness(0.97)`                     | 地 `--paper-2`・文字と枠 `--ink` に同じ `filter` |
| `src/play/games/nakamawake/_components/GameControls.module.css`         | `.primaryButton:hover:not(:disabled)`・`.primaryButton:active:not(:disabled)`   | 地 朱                           | `brightness(0.92)`・`brightness(0.85)` | 地 `--ink` に同じ `filter`                       |
| `src/play/games/nakamawake/_components/WordGrid.module.css`             | `.selected:hover:not(:disabled)`                                                | 地 `--accent-weak`・文字と枠 朱 | `brightness(0.97)`                     | 地 `--paper-2`・文字と枠 `--ink` に同じ `filter` |
| `src/play/games/shared/_components/new/NextGameBanner.module.css`       | `.unplayed:hover`                                                               | 地 `--paper`・文字と枠 朱       | `brightness(0.92)`                     | 文字と枠 `--ink` に同じ `filter`                 |

`--ink` は light で `oklch(0.15 0 0)`、dark で `oklch(0.97 0 0)`。どの規則も、hover・active で変わるのは `filter` か `opacity` だけである。

### 1-4. 全体の `a:hover` だけで hover が変わっていたリンク

拾い方: 変更前の TSX の `<Link>`・`<a>` のうち、`className` に CSS module のクラスを持つものを集め、そのクラスの規則を読んだ。自前の `:hover` に `color` が無く、平常時の `color` の選択子の詳細度が `a:hover`（0,1,1）より低いものは、hover で `a` の朱になる。平常時の `color` が朱か、`color` を持たないもの（`a` の朱をそのまま受ける）は、hover で色が変わらないので除いた。`className` に module のクラスを持たないリンク（`Pagination` の `className={className}` の1か所）と、要素の選択子（`.x a`）で色を決めたリンクは、この方法の外である（要素の選択子の規則はどれも詳細度が 0,1,1 以上）。

**リンクの文字が朱になっていたもの**

| ファイル                                                   | クラス             | 平常時                                      | 変更前の hover                                              | HEAD の見え方                                                                 |
| ---------------------------------------------------------- | ------------------ | ------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| ※2 から character-fortune を除く 9 ファイルの `page.tsx`   | `.cta2Link`        | `--ink`・下線なし・枠あり                   | 文字 朱・地 `--accent-weak`（1-2）                          | hover で変化なし                                                              |
| `src/play/games/shared/_components/new/NextGameBanner.tsx` | `.gameLink.played` | `--ink-2`・下線なし・枠あり（「クリア済」） | 文字 朱（`.gameTitle`・`.gameStatus` は色を持たず受け継ぐ） | hover で変化なし                                                              |
| `src/components/SkipLink/index.tsx`                        | `.skipLink`        | `--ink`・下線なし                           | 文字 朱                                                     | 部品が書き換わり、`globals.css` の `a` の既定の下線を持つ。hover の規則は無い |

**`a:hover` が当たるが、文字がすべて色を持つ子の中にあって見え方が変わらなかったもの**: `src/app/blog/[slug]/page.tsx` の `.prevPost`・`.nextPost`、`src/blog/_components/SeriesNav.tsx` の `.prevLink`・`.nextLink`、`src/app/dictionary/humor/page.tsx` の `.entryLink`、`src/app/dictionary/humor/[slug]/page.tsx` の `.relatedLink`、`src/dictionary/_components/DictionaryEntryList/index.tsx` の `.itemLink`、`src/dictionary/_components/color/ColorDetail.tsx` の `.relatedLink`、`src/app/global-not-found-content.tsx` の `.card`。

### 1-5. 無効の状態（19 規則）

拾い方: 変更前の CSS で、`:not(…)` の中を除いた選択子に `:disabled` か `.disabled` を含む規則を集めた。HEAD（`db7e525`）でも 19 規則とも同じ宣言のまま残っている。「無効にする場所」は HEAD の TSX で `disabled` を渡す箇所。

| ファイル                                                                | 選択子                                                                | 宣言（変更前 = HEAD）                                               | HEAD の見え方                                                              | 無効にする場所と、理由の文字                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/Button/Button.module.css`                               | `.button:disabled`                                                    | 地 `--paper-2`・文字 `--ink-2`・枠 `--rule`・`cursor: not-allowed`  | 地 `--paper-2`・文字 `--ink-2`・枠 `--ink`（実線）。プライマリも同じになる | 道具のコピーのボタン（出力が空のとき）、`PasswordGeneratorTile` の生成（文字の種類を選んでいないとき。`ErrorMessage` が「使用する文字の種類を 1 つ以上選んでください」と言う）、`QrCodeTile` のダウンロード、`UnixTimestampTile` など。部品は理由の文字を持たない |
| `src/components/Pagination/Pagination.module.css`                       | `.disabled`                                                           | 文字 `--ink-2`・枠 `--rule`・`opacity: 0.6`・`pointer-events: none` | 文字 `--ink-2`・枠 `--ink` を 0.6 の不透明度で                             | 最初と最後のページの前後の項目（`aria-disabled`）。理由の文字は無い                                                                                                                                                                                               |
| `src/components/Input/Input.module.css`                                 | `.input:disabled`                                                     | 地 `--paper-2`・文字 `--ink-2`                                      | 同じ                                                                       | storybook だけ                                                                                                                                                                                                                                                    |
| `src/components/Select/Select.module.css`                               | `.select:disabled`・`.wrapper:has(.select:disabled) .icon`（2 規則）  | 地 `--paper-2`・文字 `--ink-2`／印 `--ink-2`                        | 同じ                                                                       | storybook だけ                                                                                                                                                                                                                                                    |
| `src/components/Textarea/Textarea.module.css`                           | `.textarea:disabled`                                                  | 地 `--paper-2`・文字 `--ink-2`                                      | 同じ                                                                       | storybook だけ                                                                                                                                                                                                                                                    |
| `src/components/ToggleSwitch/ToggleSwitch.module.css`                   | `.wrapper:has(.input:disabled)`・`.input:disabled ~ .track`（2 規則） | `cursor: not-allowed`／線路に `opacity: 0.5`                        | 同じ                                                                       | storybook だけ                                                                                                                                                                                                                                                    |
| `src/play/games/irodori/_components/GameContainer.module.css`           | `.submitButton:disabled`                                              | `opacity: 0.5`                                                      | 地 `--ink` を 0.5 の不透明度で                                             | `disabled` を渡す箇所は無い                                                                                                                                                                                                                                       |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css` | `.inputField:disabled`・`.submitButton:disabled`（2 規則）            | `opacity: 0.5`                                                      | 枠 `--ink`・地 `--paper` の欄と、地 `--ink` のボタンを 0.5 の不透明度で    | `GuessInput`（`disabled` の props）、`GameContainer`（遊んでいないとき・送信中）                                                                                                                                                                                  |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`   | `.inputField:disabled`・`.submitButton:disabled`（2 規則）            | `opacity: 0.5`                                                      | 同上                                                                       | `GuessInput`（`disabled` の props・送信中）、`GameContainer`（遊んでいないとき・送信中）                                                                                                                                                                          |
| `src/play/games/nakamawake/_components/GameControls.module.css`         | `.primaryButton:disabled`・`.secondaryButton:disabled`（2 規則）      | `opacity: 0.4`                                                      | 地 `--ink` の「チェック」と、枠 `--ink` のボタンを 0.4 の不透明度で        | 遊んでいないとき。「チェック」は4語を選ぶまで（`canCheck`）                                                                                                                                                                                                       |
| `src/play/games/nakamawake/_components/WordGrid.module.css`             | `.wordButton:disabled`                                                | `opacity: 0.5`                                                      | 枠 `--ink` の語を 0.5 の不透明度で                                         | 遊んでいないとき                                                                                                                                                                                                                                                  |
| `src/play/quiz/_components/FudaActions.module.css`                      | `.saveButton:disabled, .shareButton:disabled`                         | 地 `--paper-2`・文字 `--ink-2`・枠 `--rule`                         | 地 `--paper-2`・文字 `--ink-2`・枠 `--ink`                                 | 札の画像を作っているあいだ（`busy`。`aria-busy` を持つ）                                                                                                                                                                                                          |
| `src/play/quiz/_components/QuestionCard.module.css`                     | `.choiceButton:disabled`                                              | `cursor: default`                                                   | 見え方は変わらない                                                         | 回答したあと（正誤の文字「正解」「あなたの回答」が出る）                                                                                                                                                                                                          |
| `src/tools/image-resizer/ImageResizerTile.module.css`                   | `.resizeButton:disabled`                                              | `opacity: 0.5`                                                      | 同じ                                                                       | `disabled` を渡す箇所は無い                                                                                                                                                                                                                                       |

「理由の文字」の欄は、`disabled` を渡す箇所の近くの JSX を読んだ範囲の事実である。道具のコピーのボタン（20 か所あまり）は、1 か所ずつの近くの文までは確かめていない。

### 1-6. 朱を使っていたが、色以外の手がかりもあったもの

**同じ状態に色以外の手がかりがあったもの**

| ファイル                                                                                                                                       | 選択子                                          | 色以外の手がかり                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/blog/[slug]/page.module.css`                                                                                                          | `.navTitle`                                     | 太字（前後の記事のリンクの題。下線なし）                                                                                        |
| `src/blog/_components/SeriesNav.module.css`                                                                                                    | `.quickNavTitle`                                | 太字（シリーズの前後の記事のリンクの題。下線なし）                                                                              |
| `src/app/page.module.css`                                                                                                                      | `.heroLink`                                     | 枠（下線なし）                                                                                                                  |
| ※2 の 10 ファイル                                                                                                                              | `.tryButton`                                    | 枠（下線なし）                                                                                                                  |
| `src/play/quiz/_components/InviteFriendButton.module.css`                                                                                      | `.button`                                       | 枠                                                                                                                              |
| `src/play/quiz/_components/QuestionCard.module.css`                                                                                            | `.nextButton`                                   | 枠                                                                                                                              |
| `src/play/quiz/_components/QuizContainer.module.css`                                                                                           | `.startButton`                                  | 枠                                                                                                                              |
| `src/play/quiz/_components/ResultCard.module.css`                                                                                              | `.recommendation`・`.tiedTypeLink`              | 枠（下線なし）                                                                                                                  |
| `src/play/quiz/_components/RelatedQuizzes.module.css`                                                                                          | `.name`                                         | 行の枠（名前は朱・下線なし）                                                                                                    |
| `src/play/quiz/_components/ResultNextContent.module.css`                                                                                       | `.title`                                        | 行の枠（題は朱・下線なし）                                                                                                      |
| ※3 の 8 ファイル                                                                                                                               | `.allTypesGrid .allTypesItemCurrent a`          | 太字（いまのタイプ）                                                                                                            |
| ※3 の 8 ファイル                                                                                                                               | `.allTypesListVertical .allTypesItemCurrent a`  | 透明から見える枠になる（いまのタイプ）                                                                                          |
| `src/app/play/character-fortune/result/[resultId]/page.module.css`                                                                             | `.allTypesItemCurrent a`                        | 太字（いまのタイプ）                                                                                                            |
| `src/play/quiz/_components/OtherTypesNav.module.css`                                                                                           | `.itemCurrent > span`                           | 透明から見える枠になる（いまのタイプ。リンクでない）                                                                            |
| `src/components/SegmentedControl/SegmentedControl.module.css`                                                                                  | `.option[aria-checked="true"]`                  | 透明から見える枠になる                                                                                                          |
| `src/components/Pagination/Pagination.module.css`                                                                                              | `.active`                                       | 太字                                                                                                                            |
| `src/blog/_components/BlogFilterableList.module.css`                                                                                           | `.filterButton[data-active="true"]`             | 太字（分類の絞り込みのリンク）                                                                                                  |
| `src/components/ToggleSwitch/ToggleSwitch.module.css`                                                                                          | `.input:checked ~ .track`                       | つまみの位置                                                                                                                    |
| `src/play/quiz/_components/ProgressBar.module.css`                                                                                             | `.fill`                                         | 棒の長さ                                                                                                                        |
| `src/tools/traditional-color-palette/TraditionalColorPaletteTile.module.css`                                                                   | `.swatchSelected`                               | 3px の輪（`outline`）                                                                                                           |
| `src/humor-dict/_components/EntryRatingButton.module.css`                                                                                      | `.button[aria-pressed="true"]`                  | 文字が「おもしろかった」から「おもしろかった!」になる。HEAD では、押した状態と押していない状態の差は地の `--paper-2` とこの文字 |
| `src/play/games/irodori/_components/GameContainer.module.css`（`ProgressBar.tsx` が使う）                                                      | `.progressDotCurrent`                           | 点の隣の `.progressText` が「n/N」を言う。HEAD では、点は済み・いま・未の3つとも `--ink`                                        |
| `src/tools/image-resizer/ImageResizerTile.module.css`                                                                                          | `.lockButtonActive`                             | 文字「固定中」とアイコン                                                                                                        |
| `src/play/quiz/_components/QuestionCard.module.css`                                                                                            | `.choiceCorrect`・`.choiceCorrect .feedbackTag` | 文字「正解」                                                                                                                    |
| `src/play/games/shared/_components/new/NextGameBanner.module.css`                                                                              | `.unplayed`                                     | 文字「未プレイ」・「クリア済」                                                                                                  |
| `src/play/games/nakamawake/_components/GameContainer.module.css`                                                                               | `.mistakeDanger`                                | 太字・点滅                                                                                                                      |
| `src/play/fortune/_components/DailyFortuneCard.module.css`                                                                                     | `.medalLabelDone`                               | 文字「占い完了」・太字                                                                                                          |
| `src/tools/keigo-reference/KeigoReferenceTile.module.css`                                                                                      | `.correctText`                                  | 文字「正:」                                                                                                                     |
| `src/components/Button/Button.module.css`                                                                                                      | `.variantPrimary`                               | 反転                                                                                                                            |
| `src/play/games/irodori/_components/GameContainer.module.css`                                                                                  | `.submitButton`                                 | 反転                                                                                                                            |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css`・`src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css` | `.submitButton`                                 | 反転                                                                                                                            |
| `src/play/games/nakamawake/_components/GameControls.module.css`                                                                                | `.primaryButton`                                | 反転                                                                                                                            |
| `src/play/quiz/_components/FudaActions.module.css`                                                                                             | `.saveButton`                                   | 反転                                                                                                                            |
| `src/tools/fullwidth-converter/FullwidthConverterTile.module.css`・`src/tools/regex-tester/RegexTesterTile.module.css`                         | `input[type="checkbox"]`（`accent-color`）      | ブラウザのチェックボックスの形                                                                                                  |
| `src/tools/image-resizer/ImageResizerTile.module.css`・`src/tools/password-generator/PasswordGeneratorTile.module.css`                         | `.rangeInput`・`.slider`（`accent-color`）      | ブラウザのスライダーの形                                                                                                        |
| `src/play/games/irodori/_components/RoundResult.module.css`                                                                                    | `.colorNameLink`                                | 下線（`globals.css` の `a` の既定。hover は `opacity` だけ）                                                                    |
| `src/app/play/[slug]/result/[resultId]/DescriptionExpander.module.css`                                                                         | `.descriptionToggle`                            | 下線                                                                                                                            |
| `src/play/games/_components/new/GameLayout.module.css`                                                                                         | `.attribution a`                                | 下線                                                                                                                            |
| `src/tools/markdown-preview/MarkdownPreviewTile.module.css`                                                                                    | `.preview a`                                    | 下線（`globals.css` の `a` の既定）                                                                                             |

※3 `src/play/quiz/_components/` の `AnimalPersonalityContent.module.css`・`CharacterPersonalityContent.module.css`・`ContrarianFortuneContent.module.css`・`ImpossibleAdviceContent.module.css`・`MusicPersonalityContent.module.css`・`TraditionalColorContent.module.css`・`UnexpectedCompatibilityContent.module.css`・`YojiPersonalityContent.module.css` の 8 ファイル。

**文字で状態を言っていたもの（朱は文字や枠の色）**

- エラー: `src/components/ErrorMessage/ErrorMessage.module.css` `.errorMessage`、`src/play/games/kanji-kanaru/_components/GameContainer.module.css`・`src/play/games/yoji-kimeru/_components/styles/GameContainer.module.css` の `.errorMessage`、`KanjiKanaru.module.css`・`YojiKimeru.module.css` の `.errorMessage`、`src/tools/email-validator/EmailValidatorTile.module.css` の `.errorPanel`
- 注意・判定: `EmailValidatorTile.module.css` の `.badgeValidWithSuggestion`・`.badgeInvalid`・`.suggestionPanel`・`.warningPanel`、`src/tools/image-resizer/ImageResizerTile.module.css` の `.gifWarningBox`、`src/app/globals.css` の `.markdown-alert-warning`・`.markdown-alert-caution`（左の線とラベル）
- 済みの知らせ: `.copiedMessage`（`src/components/ShareButtons`・`src/play/games/shared/_components/new/GameShareButtons`・`src/play/quiz/_components/InviteFriendButton`・`src/play/quiz/_components/ShareButtons`）、`src/play/quiz/_components/FudaActions.module.css` の `.status`
- 印・見出し: `src/blog/_components/BlogList.module.css` の `.newMark`、`src/play/games/irodori/_components/FinalResult.module.css` の `.rankBadge`、`src/tools/_components/ErrorBoundary.module.css` の `.heading`

**操作・状態でない飾り**: `src/components/Header/Header.module.css`（変更前）の `.dot`（サイト名の「.」）、`src/components/In/In.module.css` の `.ringLine`・`.char`（印）。

### 1-7. 静止時に下線を持たず、文字が朱でないリンク

拾い方: 変更前の TSX の `<Link>`・`<a>` のうち、自分のクラスの規則に `text-decoration: none` を持ち、平常時の `color` が朱でないもの（1-4 と同じ読み方）と、CSS の要素の選択子（`.x a`・`.x > a`）の規則で同じ条件を満たすものを集めた。平常時に文字が朱のリンクは 1-1・1-6 にある。HEAD では、どれも平常時に下線を持たない（上端・下端とスキップのリンクを除く）。

| ファイル                                                                                                                            | 選択子                                                                   | 平常時                                 | 変更前の hover                              | 載っている節 |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------- | ------------ |
| `src/components/RelatedTools/RelatedTools.module.css`                                                                               | `.link`（関連ツールの行）                                                | 名前 `--ink`                           | 名前が朱・下線                              | —            |
| `src/components/RelatedBlogPosts/RelatedBlogPosts.module.css`・`src/play/games/_components/new/RelatedBlogPosts.module.css`         | `.link`                                                                  | 題 `--ink`                             | 題が朱・下線                                | —            |
| `src/play/_components/RecommendedContent.module.css`・`src/play/_components/RelatedContentCard.module.css`（`RelatedGames` も使う） | `.link`                                                                  | 名前 `--ink`                           | 名前が朱・下線                              | —            |
| `src/dictionary/_components/DictionaryEntryList/DictionaryEntryList.module.css`                                                     | `.itemLink`                                                              | 名前 `--ink`                           | 名前が朱・下線                              | 1-4          |
| `src/dictionary/_components/new/PlayRecommendBlock.module.css`                                                                      | `.card`                                                                  | 題 `--ink`（中の `.cta` は朱。1-1）    | 題が朱・下線                                | —            |
| `src/app/dictionary/humor/page.module.css`                                                                                          | `.entryLink`                                                             | 見出し語 `--ink`                       | 見出し語が朱・下線                          | 1-4          |
| `src/app/dictionary/humor/[slug]/page.module.css`                                                                                   | `.relatedLink`                                                           | 語 `--ink`                             | 語が朱・下線                                | 1-4          |
| `src/blog/_components/BlogList.module.css`                                                                                          | `.titleLink`                                                             | `--ink`                                | 朱・下線                                    | —            |
| `src/blog/_components/TableOfContents.module.css`                                                                                   | `.link`                                                                  | `--ink-2`                              | 朱・下線                                    | —            |
| `src/blog/_components/BlogListView.module.css`                                                                                      | `.tagBreadcrumb a`                                                       | `--ink-2`                              | 朱・下線                                    | —            |
| `src/blog/_components/BlogFilterableList.module.css`                                                                                | `.filterButton`                                                          | `--ink-2`（選んだ分類は朱・太字。1-6） | 朱・下線                                    | —            |
| 同上                                                                                                                                | `.tagChip`                                                               | `--ink-2`・枠                          | 文字と枠が朱                                | 1-2          |
| `src/blog/_components/TagList.module.css`                                                                                           | `.tagLink`                                                               | `--ink-2`・枠                          | 文字と枠が朱                                | 1-2          |
| `src/components/Shinagaki/Shinagaki.module.css`                                                                                     | `.name`                                                                  | `--ink`                                | 朱・下線                                    | —            |
| `src/app/dictionary/kanji/page.module.css`                                                                                          | `.facetLink`                                                             | `--ink`                                | 朱・下線                                    | —            |
| `src/dictionary/_components/FacetIndex/FacetIndex.module.css`                                                                       | `.link`                                                                  | `--ink`（現在地は朱。1-1）             | 朱・下線                                    | —            |
| `src/dictionary/_components/kanji/KanjiDetail.module.css`                                                                           | `.relatedLink`                                                           | `--ink`                                | 朱・下線                                    | —            |
| `src/dictionary/_components/yoji/YojiDetail.module.css`                                                                             | `.relatedLink`                                                           | `--ink`                                | 朱・下線                                    | —            |
| 同上                                                                                                                                | `.categoryTag`・`.kanjiLink`                                             | `--ink-2`・`--ink`、枠                 | 文字と枠が朱                                | 1-2          |
| `src/dictionary/_components/color/ColorDetail.module.css`                                                                           | `.categoryLink`・`.relatedLink`                                          | `--ink-2`・`--ink`、枠                 | 文字か名前と枠が朱                          | 1-2          |
| `src/play/games/shared/_components/new/CrossCategoryBanner.module.css`                                                              | `.link`                                                                  | `--ink`・枠                            | 文字と枠が朱                                | 1-2          |
| `src/app/global-not-found.module.css`                                                                                               | `.card`                                                                  | 題 `--ink`・枠                         | 枠が朱                                      | 1-2・1-4     |
| ※2 から character-fortune を除く 9 ファイル                                                                                         | `.cta2Link`                                                              | `--ink`・枠                            | 地 `--accent-weak`・文字が朱                | 1-2・1-4     |
| `src/play/quiz/_components/OtherTypesNav.module.css`                                                                                | `.item > a`                                                              | `--ink`                                | 地 `--accent-weak`                          | 1-2          |
| ※3 の 8 ファイル                                                                                                                    | `.allTypesGrid .allTypesItem a`・`.allTypesListVertical .allTypesItem a` | `--ink`                                | 地 `--paper-2`（朱は使わない）              | —            |
| `src/app/play/character-fortune/result/[resultId]/page.module.css`                                                                  | `.allTypesItem a`                                                        | `--ink`                                | 地 `--paper-2`（朱は使わない）              | —            |
| `src/play/games/shared/_components/new/NextGameBanner.module.css`                                                                   | `.gameLink.played`                                                       | `--ink-2`・枠                          | 文字が朱                                    | 1-4          |
| `src/components/Footer/Footer.module.css`（変更前）                                                                                 | `.link`                                                                  | `--ink-2`                              | 朱・下線                                    | —            |
| `src/components/Header/Header.module.css`（変更前）                                                                                 | `.navLink`・`.mobileNavLink`                                             | `--ink-2`（現在地は朱。1-1）           | `--ink`・下線                               | —            |
| `src/components/Header/Header.module.css`（変更前）                                                                                 | `.logo`                                                                  | `--ink`                                | 変わらない（`color: var(--ink)`・下線なし） | —            |
| `src/components/SkipLink/SkipLink.module.css`（変更前）                                                                             | `.skipLink`                                                              | `--ink`・枠                            | 文字が朱                                    | 1-4          |

変更前の Header・Footer は T1 で `FrameLink` に替わり、HEAD では現在地を除いて下線を持つ。`SkipLink` も HEAD では下線を持つ。ほかは HEAD でも平常時に下線を持たず、文字は `--ink` か `--ink-2` で、朱だった hover は `--ink` になる。

### 1-8. タブ

変更前にも HEAD にも、`role="tab"`・`role="tablist"`・`aria-selected` を持つ要素と、名前に `tab` を含むクラスは無い。

### 1-9. 色で状態を示すもので、index.md の T2 以外の行が名指しするもの

1 章の表に載せていないもの、または載せたが T2 以外の行が名指ししているもの。

| もの                                                                                        | ファイル                                                                                                                                       | 名指ししている行                                                              |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 漢字カナール・四字熟語きめるの判定のマスと凡例（`--wairo-tokiwa`・`--wairo-yamabuki` の地） | `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css`・`src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css` | T4「色で状態を示している面」「和色のトークン（`--wairo-*`・`--wairo-*-on`）」 |
| 成績の分布の強調（`.distributionBarHighlight`、地 `--wairo-tokiwa`）                        | `KanjiKanaru.module.css`・`YojiKimeru.module.css`・`src/play/games/nakamawake/_components/StatsModal.module.css`                               | T4「色で状態を示している面」「和色のトークン」                                |
| 運勢の星（`StarRating`、満ちた星 `--wairo-yamabuki`・空の星 `--rule-strong`）               | `src/play/fortune/_components/StarRating.module.css`                                                                                           | T4「色で状態を示している面」「和色のトークン」                                |
| GFM Alert（`.markdown-alert-*`。1-6）                                                       | `src/app/globals.css`                                                                                                                          | T4「ブログ本文の GFM Alert」                                                  |
| エラーの文（1-6 の「エラー」）                                                              | `ErrorMessage`・ゲームの `.errorMessage`・`EmailValidatorTile` の `.errorPanel`                                                                | T2「入力欄とラベルとエラー」                                                  |
| 注意・判定・済みの知らせ・印（1-6 の「注意・判定」「済みの知らせ」「印・見出し」）          | 1-6 のとおり                                                                                                                                   | どの行も名指ししていない                                                      |

---

## 2. コントロールの部品と、それを使う場所

「使うファイル」は `@/components/<名前>` を import する `src/` のファイル（部品の中と `__tests__/` を除く）。括弧内は `src/app/storybook/` を含む数。

### 2-1. `src/components/` の部品

| 部品               | 中身                                                                           | DESIGN.md §6・§8 の同名の種類                                                | 使うファイル | 主なファイル                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`           | `<button>`。`default`・`primary` の2種、`small` の大きさ、無効                 | `primary` は §6 プライマリボタン。無効は §6 無効。`default` の名の種類は無い | 26（27）     | `src/tools/*/…Tile.tsx`（26 ファイルすべてが道具）                                                                                                                                                         |
| `Input`            | `<input>`。`error` で枠の色が変わる                                            | §8 入力欄（書き込む欄）・エラーの入力欄                                      | 19（20）     | `src/tools/*/…Tile.tsx` 18、`src/blog/_components/BlogFilterableList.tsx`                                                                                                                                  |
| `Textarea`         | `<textarea>`。等幅・読み取り専用・無効                                         | §8 入力欄（書き込む欄）                                                      | 21（22）     | `src/tools/*/…Tile.tsx` 21                                                                                                                                                                                 |
| `Select`           | `<select>` と下向きの印                                                        | §8 入力欄（選ぶ欄）                                                          | 12（13）     | `src/tools/*/…Tile.tsx` 12                                                                                                                                                                                 |
| `ErrorMessage`     | エラーの文の箱                                                                 | §8 エラーのときの「何が問題でどう直すか」の文                                | 25（26）     | `src/tools/*/…Tile.tsx` 25                                                                                                                                                                                 |
| `SegmentedControl` | `role="radiogroup"` の中に `role="radio"` の `<button>` を並べたセグメント切替 | 無い                                                                         | 20（21）     | `src/tools/*/…Tile.tsx` 20                                                                                                                                                                                 |
| `ToggleSwitch`     | 隠した `<input type="checkbox">` とつまみのトグルスイッチ                      | 無い                                                                         | 5（6）       | base64・sql-formatter・password-generator・text-replace・line-break-remover の Tile                                                                                                                        |
| `FaqSection`       | `<details>`・`<summary>`。印「▶」が開くと 90° 回る                             | §6 アコーディオン                                                            | 4（5）       | `ToolPageLayout`・`GameLayout`・`QuizPlayPageLayout`・`DictionaryDetailLayout`                                                                                                                             |
| `Pagination`       | ページ番号と前後のリンク。現在のページは太字                                   | §6 ページ送り                                                                | 1（2）       | `src/blog/_components/BlogFilterableList.tsx`                                                                                                                                                              |
| `Breadcrumb`       | パンくず（リンクと「/」と現在のページの文字）                                  | §6 リンク                                                                    | 19（20）     | 辞典のページ 11、`src/app/play/page.tsx`・`src/app/play/daily/page.tsx`、`ToolPageLayout`・`GameLayout`・`QuizPlayPageLayout`・`ResultPageShell`・`DictionaryDetailLayout`、`src/app/blog/[slug]/page.tsx` |
| `FrameLink`        | 上端・下端のリンク。現在地は太字                                               | §6 リンク・現在地                                                            | 2            | `Header`・`Footer`                                                                                                                                                                                         |
| `SkipLink`         | 本文へのスキップのリンク                                                       | §6 リンク                                                                    | 1            | `src/components/SiteFrame/index.tsx`                                                                                                                                                                       |
| `ShareButtons`     | 共有の `<button>`・リンクの並びと「コピーしました」の知らせ                    | 無い                                                                         | 6（7）       | `ToolPageLayout`・`GameLayout`・`QuizPlayPageLayout`・`DictionaryDetailLayout`・ブログの記事・笑辞典の項目                                                                                                 |
| `FileDropZone`     | `role="button"` の欄と隠した `<input type="file">`。ドラッグでも選べる         | 無い                                                                         | 2（3）       | `image-resizer`・`image-base64` の Tile                                                                                                                                                                    |
| `RelatedTools`     | 関連ツールの行の一覧                                                           | §6 一覧の行                                                                  | 1（2）       | `ToolPageLayout`                                                                                                                                                                                           |
| `RelatedBlogPosts` | 関連する記事の行の一覧                                                         | §6 一覧の行                                                                  | 1（2）       | `ToolPageLayout`                                                                                                                                                                                           |
| `Shinagaki`        | 品書き（名前・説明・値札の行の一覧）                                           | §6 一覧の行                                                                  | 8            | `src/app/page.tsx`・`src/app/tools/page.tsx`・`src/app/play/page.tsx`・辞典のページ 3・`src/app/about/page.tsx`・`RelatedArticles`                                                                         |
| `Nefuda`           | 値札（枠で囲んだ小さなラベル）                                                 | 無い                                                                         | 7            | `Shinagaki`・`src/app/page.tsx`・`BlogList`・`YojiDetail`・`PlayRecommendBlock`・`DictionaryEntryList`・`QuizContainer`                                                                                    |
| `In`               | 印（円環と1字）                                                                | 無い                                                                         | 1            | `Tsutsumi`（`src/lib/fuda-image.tsx` は JSDoc の `{@link}` で触れるだけで import しない）                                                                                                                  |

コントロールでない部品: `Panel`（36（37））・`Tsutsumi`（8）・`Section`（0（1））・`SiteFrame`・`Header`・`Footer`・`GoogleAnalytics`（各 1）。`src/components/icons/`（`BarChart`・`ChevronDown`・`HelpCircle`）と `src/components/hooks/useCopyToClipboard.ts`。`ThemeToggle` は HEAD に無い。

### 2-2. ページや機能の中で独自に書いたコントロール

`src/components/` と `src/app/storybook/` と `__tests__/` を除く TSX を数えた。

**要素の数**

| 要素                                                                    | ファイル数 | ファイル                                                                                                          |
| ----------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `<button>`                                                              | 34         | 下の表                                                                                                            |
| `<input type="text">`・`type` なし・`search`                            | 4          | `DictionarySearch`（`search`）、kanji-kanaru と yoji-kimeru の `GuessInput`、`RegexTesterTile`（`.patternInput`） |
| `<input type="checkbox">`                                               | 2          | `FullwidthConverterTile`・`RegexTesterTile`                                                                       |
| `<input type="range">`                                                  | 3          | `HslSliders`（irodori）・`ImageResizerTile`・`PasswordGeneratorTile`                                              |
| `<input type="color">`                                                  | 1          | `ColorConverterTile`                                                                                              |
| `<details>`・`<summary>`                                                | 2          | `src/blog/_components/SeriesNav.tsx`・`src/blog/_components/CollapsibleTOC.tsx`                                   |
| `<dialog>`                                                              | 1          | `src/play/games/shared/_components/new/GameDialog.tsx`                                                            |
| `<select>`・`<textarea>`・`role="radio"`・`role="switch"`・`role="tab"` | 0          | —                                                                                                                 |

**独自の `<button>` の種類**

| 種類                                     | DESIGN.md §6・§8 の同名の種類 | ファイルとクラス                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 反転の実行ボタン                         | §6 プライマリボタン           | irodori `GameContainer`（`.submitButton`）、kanji-kanaru・yoji-kimeru `GuessInput`（`.submitButton`）、nakamawake `GameControls`（`.primaryButton`）、`FudaActions`（`.saveButton`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 枠の実行ボタン                           | 無い                          | `QuizContainer`（`.startButton`）、`QuestionCard`（`.nextButton`）、`InviteFriendButton`（`.button`）、`ResultCard`（`.retryButton`）、kanji-kanaru・yoji-kimeru `GameContainer`（`.retryButton`）、irodori `GameContainer`（`.nextButton`）、nakamawake `GameControls`（`.secondaryButton`）、irodori・kanji-kanaru・nakamawake・yoji-kimeru `ResultModal`（`.statsButton`）、`GameDialog`（`.modalClose`）、`GameShareButtons`（`.shareButtonCopy`・`.shareButtonImage`・`.shareButtonX`）、quiz `ShareButtons`（`.shareButton`）、`FudaActions`（`.shareButton`）、`ColorDetail`（`.copyButton`）、`ImageResizerTile`（`.resizeButton`・`.downloadButton`）、`UnitConverterTile`（`.swapButton`） |
| アイコンのボタン                         | 無い                          | irodori・kanji-kanaru・nakamawake・yoji-kimeru `GameHeader`（`.iconButton`、各 2）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 押した状態を持つボタン（`aria-pressed`） | 無い                          | kanji-kanaru・yoji-kimeru `DifficultySelector`、nakamawake `WordGrid`（`.wordButton`）、`EntryRatingButton`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 切り替えのボタン（押した状態の属性なし） | 無い                          | `ImageResizerTile`（`.lockButton`、`aria-label` と文字で状態を言う）、`RegexTesterTile`（`.toggleButton`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 選ぶボタン                               | 無い                          | `QuestionCard`（`.choiceButton`、設問の選択肢）、`TraditionalColorPaletteTile`（`.swatch`、色見本を選ぶ）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 開閉のボタン（`aria-expanded`）          | 無い                          | `DescriptionExpander`（`.descriptionToggle`）、`KeigoReferenceTile`（`.expandButton`。狭い画面の `.mobileCard` は `role="button"` の `<div>`）、`YojiSearchTile`（`.resultButton`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 続きを出すボタン                         | 無い                          | `YojiSearchTile`（`.moreButton`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

**リンクのボタン（枠で囲み、下線を持たないリンク）**

| クラス                                                        | ファイル                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| `.heroLink`                                                   | `src/app/page.module.css`                                    |
| `.tryButton`・`.cta2Link`                                     | ※2 の 10 ファイル（`.cta2Link` は 9）                        |
| `.recommendation`・`.tiedTypeLink`                            | `src/play/quiz/_components/ResultCard.module.css`            |
| `.link`                                                       | `CrossCategoryBanner`・`RelatedQuizzes`・`ResultNextContent` |
| `.gameLink`                                                   | `NextGameBanner`                                             |
| `.card`                                                       | `src/app/global-not-found.module.css`                        |
| `.tagChip`・`.tagLink`                                        | `BlogFilterableList`・`TagList`                              |
| `.categoryLink`・`.relatedLink`・`.categoryTag`・`.kanjiLink` | `ColorDetail`・`YojiDetail`                                  |

**そのほか**

- 絞り込み・現在地のリンク: `BlogFilterableList`（`.filterButton`、`data-active` で太字）、`FacetIndex`（`.link`・`.active`、`aria-current="page"`）、`OtherTypesNav`（いまのタイプは `<span>`）、※3 の 8 ファイルと character-fortune の結果のページ（`.allTypesItemCurrent`）。
- エラーの表示: kanji-kanaru・yoji-kimeru の `.errorMessage`、`EmailValidatorTile` の `.errorPanel`。
- 値札・印に似た表示: `EmailValidatorTile` の `.badge*`、`BlogList` の `.newMark`、irodori `FinalResult` の `.rankBadge`。DESIGN.md に同名の種類は無い。
- 前後の記事のリンク: `src/app/blog/[slug]/page.tsx`（`.prevPost`・`.nextPost`）、`SeriesNav`（`.prevLink`・`.nextLink`）。

---

## 3. 古いトークンの参照

`var(--名前)` の出現を数えた。「宣言」は CSS の宣言の値の中、「そのほか」は CSS のコメントと TSX・TS・MD（コメント・テスト・記事）の中。`globals.css` のトークンの定義の行（`--accent: var(--ink)` など）は定義なので数えない。ただし `--radius-sm: var(--radius)` の `var(--radius)` は宣言に1件入る。

### 3-1. 件数

| トークン        | 部品・宣言（ファイル） | 部品・そのほか | ページや機能・宣言（ファイル） | ページや機能・そのほか |
| --------------- | ---------------------- | -------------- | ------------------------------ | ---------------------- |
| `--accent`      | 40（16）               | 27             | 299（87）                      | 21                     |
| `--accent-weak` | 2（1）                 | 0              | 43（29）                       | 5                      |
| `--rule-strong` | 5（5）                 | 2              | 44（34）                       | 2                      |
| `--radius`      | 11（9）                | 4              | 218（90）                      | 26                     |
| `--radius-sm`   | 7（7）                 | 3              | 18（15）                       | 18                     |
| 計              | 65（19）               | 36（22）       | 622（113）                     | 72（36）               |

ページや機能の宣言の内訳（ファイル数と、`--accent`・`--accent-weak`・`--rule-strong`・`--radius`・`--radius-sm` の件数）:

| 場所              | ファイル | `--accent` | `--accent-weak` | `--rule-strong` | `--radius` | `--radius-sm` |
| ----------------- | -------- | ---------- | --------------- | --------------- | ---------- | ------------- |
| `src/play/`       | 50       | 154        | 21              | 4               | 106        | 7             |
| `src/tools/`      | 28       | 37         | 1               | 26              | 71         | 4             |
| `src/app/`        | 20       | 59         | 20              | 14              | 35         | 1             |
| `src/blog/`       | 7        | 21         | 0               | 0               | 1          | 2             |
| `src/dictionary/` | 7        | 25         | 0               | 0               | 4          | 4             |
| `src/humor-dict/` | 1        | 3          | 1               | 0               | 1          | 0             |

### 3-2. 部品の宣言（ファイルごと）

| ファイル（`src/components/`）                  | `--accent` | `--accent-weak` | `--rule-strong` | `--radius` | `--radius-sm` |
| ---------------------------------------------- | ---------- | --------------- | --------------- | ---------- | ------------- |
| `Breadcrumb/Breadcrumb.module.css`             | 2          |                 |                 |            | 1             |
| `Button/Button.module.css`                     | 5          |                 |                 | 1          |               |
| `ErrorMessage/ErrorMessage.module.css`         | 1          |                 |                 | 1          |               |
| `FaqSection/FaqSection.module.css`             | 1          |                 |                 | 1          |               |
| `FileDropZone/FileDropZone.module.css`         | 3          |                 | 1               |            | 1             |
| `In/In.module.css`                             | 2          |                 |                 |            |               |
| `Input/Input.module.css`                       | 2          |                 | 1               |            | 1             |
| `Nefuda/Nefuda.module.css`                     |            |                 |                 |            | 1             |
| `Pagination/Pagination.module.css`             | 5          |                 |                 | 1          |               |
| `Panel/Panel.module.css`                       |            |                 |                 | 1          |               |
| `RelatedBlogPosts/RelatedBlogPosts.module.css` | 2          |                 |                 |            |               |
| `RelatedTools/RelatedTools.module.css`         | 2          |                 |                 |            |               |
| `SegmentedControl/SegmentedControl.module.css` | 3          | 2               |                 | 2          |               |
| `Select/Select.module.css`                     | 1          |                 | 1               |            | 1             |
| `ShareButtons/ShareButtons.module.css`         | 6          |                 |                 | 1          |               |
| `Shinagaki/Shinagaki.module.css`               | 2          |                 |                 |            |               |
| `Textarea/Textarea.module.css`                 | 1          |                 | 1               |            | 1             |
| `ToggleSwitch/ToggleSwitch.module.css`         | 2          |                 |                 | 1          | 1             |
| `Tsutsumi/Tsutsumi.module.css`                 |            |                 | 1               | 2          |               |

部品の「そのほか」（36 件・22 ファイル）: `index.tsx` のコメント 9 ファイル（`Button`（`--radius`）・`FileDropZone`・`In`・`Input`・`RelatedTools`・`SegmentedControl`・`Select`・`Textarea`・`ToggleSwitch`）、`*.module.css` のコメント 7 ファイル（`Button`・`FaqSection`・`FileDropZone`・`Input`・`SegmentedControl`・`Select`・`Textarea`）、テスト 6 ファイル（`ErrorMessage`・`FaqSection`・`RelatedBlogPosts`・`SegmentedControl`・`Select`・`Textarea` の `__tests__/`）。

---

## 4. 入力欄の文字の大きさ（B-663）

HEAD の `globals.css` は `input, select, textarea { font-size: var(--text-input) }`（`--text-input: max(var(--text-body), 16px)`、`--text-body: 1.0625rem`。既定のルートで 17px）。部品やページのクラスの `font-size` がこれを上書きする。

**16px を下回るもの**

| ファイル                                            | 選択子          | 値        | 既定のルートでの大きさ | 使う場所                                                        |
| --------------------------------------------------- | --------------- | --------- | ---------------------- | --------------------------------------------------------------- |
| `src/components/Input/Input.module.css`             | `.input`        | `14px`    | 14px                   | 19 ファイル・45 か所（storybook を含めて 20 ファイル・53 か所） |
| `src/components/Textarea/Textarea.module.css`       | `.textarea`     | `14px`    | 14px                   | 21 ファイル・36 か所（storybook を含めて 22 ファイル・40 か所） |
| `src/components/Select/Select.module.css`           | `.select`       | `14px`    | 14px                   | 12 ファイル・15 か所（storybook を含めて 13 ファイル・17 か所） |
| `src/tools/regex-tester/RegexTesterTile.module.css` | `.patternInput` | `0.95rem` | 15.2px                 | 正規表現のパターンの欄（`<input type="text">`）                 |

`Input` を使う側が `className` で渡すクラス（`BlogFilterableList` の `.searchInput`、`BusinessEmailTile` の `.subjectInput`、`DateCalculatorTile` の `.numberInput`・`.shortNumberInput`、`DummyTextTile` の `.numberInput`、`UnixTimestampTile` の `.tsInput`・`.dateInput`）は、どれも `font-size` を持たない。`Textarea`・`Select` に `className` でクラスを渡す箇所は無い。

**16px 以上のもの**

| ファイル                                                                  | 選択子        | 値       | 既定のルートでの大きさ                    |
| ------------------------------------------------------------------------- | ------------- | -------- | ----------------------------------------- |
| `src/dictionary/_components/DictionarySearch/DictionarySearch.module.css` | `.input`      | `1rem`   | 16px（`--text-input` の 17px より小さい） |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css`   | `.inputField` | `1.5rem` | 24px                                      |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`     | `.inputField` | `1.5rem` | 24px                                      |

文字を書き込まない入力（`type="checkbox"`・`type="range"`・`type="color"`・`type="file"`）は数えていない。

---

## 5. フォーカスの見え方

### 5-1. 既定

`src/app/globals.css` の `:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }`。変更前は `outline: 2px solid var(--accent)`。

DESIGN.md §6 のフォーカスは「要素に密着した二重リング。内も外も太い線と同じ太さで、内は `--paper`、外は `--ink`」。

### 5-2. 独自の規則の件数

`:focus`・`:focus-visible`・`:focus-within` を含む選択子の規則（`globals.css` の既定を除く）。

| 中身                                                    | 部品（ファイル） | ページや機能（ファイル） |
| ------------------------------------------------------- | ---------------- | ------------------------ |
| `outline: 2px solid var(--accent); outline-offset: 2px` | 13               | 83                       |
| 上に `border-radius` を足したもの                       | 1                | 2                        |
| 上に `border-color: var(--accent)` を足したもの         | 0                | 1                        |
| `border-color: var(--accent)` だけ                      | 0                | 2                        |
| `outline: none`                                         | 2                | 2                        |
| `outline: var(--rule-w) solid var(--ink)` の二重リング  | 2                | 0                        |
| `transform: none`（スキップのリンクを画面に出す）       | 1                | 0                        |
| 計                                                      | 19（17）         | 90（57）                 |

`--accent` は HEAD で `--ink` を指すので、`outline: 2px solid var(--accent); outline-offset: 2px` の規則は、HEAD では既定と同じ見え方になる。

### 5-3. 部品の規則

| ファイル（`src/components/`）                  | 選択子                          | 中身                                                                                                                  |
| ---------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Breadcrumb/Breadcrumb.module.css`             | `.link:focus-visible`           | `outline: 2px solid var(--accent)`・`outline-offset: 2px`・`border-radius: var(--radius-sm)`                          |
| `Button/Button.module.css`                     | `.button:focus-visible`         | `outline: 2px solid var(--accent)`・`outline-offset: 2px`                                                             |
| `FaqSection/FaqSection.module.css`             | `.question:focus-visible`       | 同上                                                                                                                  |
| `FileDropZone/FileDropZone.module.css`         | `.dropZone:focus-visible`       | 同上                                                                                                                  |
| `Input/Input.module.css`                       | `.input:focus-visible`          | 同上（平常時は `outline: none`）                                                                                      |
| `Pagination/Pagination.module.css`             | `.pageItem:focus-visible`       | 同上                                                                                                                  |
| `RelatedBlogPosts/RelatedBlogPosts.module.css` | `.link:focus-visible`           | 同上                                                                                                                  |
| `RelatedTools/RelatedTools.module.css`         | `.link:focus-visible`           | 同上                                                                                                                  |
| `SegmentedControl/SegmentedControl.module.css` | `.option:focus-visible`         | 同上                                                                                                                  |
| `Select/Select.module.css`                     | `.select:focus-visible`         | 同上（平常時は `outline: none`）                                                                                      |
| `ShareButtons/ShareButtons.module.css`         | `.button:focus-visible`         | 同上                                                                                                                  |
| `Shinagaki/Shinagaki.module.css`               | `.name:focus-visible`           | 同上                                                                                                                  |
| `Textarea/Textarea.module.css`                 | `.textarea:focus-visible`       | 同上（平常時は `outline: none`）                                                                                      |
| `ToggleSwitch/ToggleSwitch.module.css`         | `.input:focus-visible ~ .track` | 同上（隠した `<input>` のフォーカスを線路に出す）                                                                     |
| `FrameLink/FrameLink.module.css`               | `.link:focus-visible`           | `outline: none`                                                                                                       |
| `FrameLink/FrameLink.module.css`               | `.link:focus-visible::after`    | `outline: var(--rule-w) solid var(--ink)`・`outline-offset: var(--rule-w)`（押せる範囲に出す二重リング）              |
| `SkipLink/SkipLink.module.css`                 | `.skipLink:focus`               | `transform: none`                                                                                                     |
| `SkipLink/SkipLink.module.css`                 | `.skipLink:focus-visible`       | `outline: var(--rule-w) solid var(--ink)`・`outline-offset: 0`（内の輪は `border: var(--rule-w) solid var(--paper)`） |
| `SiteFrame/SiteFrame.module.css`               | `.main:focus`                   | `outline: none`（スキップの移り先）                                                                                   |

### 5-4. ページや機能の規則のうち、既定の形でないもの

| ファイル                                                                  | 選択子                        | 中身                                                                                                                                                              |
| ------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/dictionary/_components/DictionarySearch/DictionarySearch.module.css` | `.input:focus-visible`        | `outline: 2px solid var(--accent)`・`outline-offset: 2px`・`border-color: var(--accent)`                                                                          |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css`   | `.inputField:focus`           | `border-color: var(--accent)` だけ。平常時は `outline: none`・`border: 2px solid var(--rule)`。HEAD では平常時もフォーカス時も枠が `--ink` で、見え方が変わらない |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`     | `.inputField:focus`           | 同上                                                                                                                                                              |
| `src/play/quiz/_components/QuestionCard.module.css`                       | `.questionText:focus`         | `outline: none`（設問の見出し。`tabIndex={-1}` でプログラムからだけフォーカスを受ける）                                                                           |
| `src/play/quiz/_components/QuizContainer.module.css`                      | `.resultPhase:focus`          | `outline: none`（結果の領域。フォーカスの移り先）                                                                                                                 |
| `src/tools/keigo-reference/KeigoReferenceTile.module.css`                 | `.expandButton:focus-visible` | 既定の形に `border-radius: var(--radius)` を足したもの                                                                                                            |
| `src/tools/yoji-search/YojiSearchTile.module.css`                         | `.resultButton:focus-visible` | 同上                                                                                                                                                              |

既定の形（`outline: 2px solid var(--accent); outline-offset: 2px`）の 83 規則は 56 ファイルにある。場所ごとのファイル数: `src/play/games/` 15、`src/app/play/` 11、`src/play/quiz/` 9、`src/blog/_components/` 6、`src/dictionary/_components/` 2、`src/play/_components/` 2、`src/app/blog/`・`src/app/dictionary/`・`src/app/global-not-found.module.css`・`src/app/page.module.css` 各 1、`src/tools/` の 7 ファイル（color-converter・image-resizer・keigo-reference・regex-tester・traditional-color-palette・unit-converter・yoji-search）。このうち `src/tools/regex-tester/RegexTesterTile.module.css` の `.patternRow:focus-within` は、中の `.patternInput`（平常時 `outline: none`）のフォーカスを行に出す。

平常時に `outline: none` を持ち、`:focus-visible` で輪を戻す規則: `Input`・`Select`・`Textarea`（部品）、`src/play/games/irodori/_components/HslSliders.module.css` の `.slider`。
