# T5 着手前の洗い出し（面ごとの適用）

計測日: 2026-09-28
本書は実測とコードの読み取りの列挙のみ。案・評価は含まない。決めることは各節の「決めること」に問いの形で置く。

- 対象: `3863a39` のコード。行番号もこのコミットのもの。
- 画面: `3863a39` の木を別の場所に取り出し、`next dev --webpack` で配信したものを、Playwright（`/opt/pw-browsers/chromium-1194`）で **375×667** と **1280×800** で開いた。ことわりのあるものだけ **320×667** でも開いた。既定の文字サイズ・ライトで測った。
- y 座標はページ先頭からの CSS px。x 座標は画面の左端からの px で、見出し・パンくずは最初の字の左端。
- §5 のコンテンツ幅の左端は、375px で **27**、1280px で **179**（`DESIGN.md` §5 の表と同じ式）。§4 の主見出しは 375px で **33.28px**（2.08rem）、1280px で **65.28px**（4.08rem）。セクションの見出しは 375px で **23.84px**、1280px で **46.72px**。
- 数は、ことわりの無いものは `src/` のテスト（`__tests__`・`*.test.*`）を除いて数えた。
- T5 の行は [index.md](./index.md) の「実施する作業」の T5。補足事項の T5 に触れる行（T3-9・T3-6/8・T4 の棚卸しのレビュー・`Unix／タイムスタンプ` の折れ・unix-timestamp の表・T4-7 の (6)・T4-17・T4-4c）も含めた。

---

## 0. 面ごとの来訪者の重み（GA・28日）

BigQuery の GA4（`events_*`、2026-08-31〜2026-09-27、`page_view`）。URL のパスで面に分けた。

| 面                                                   | PV    | 割合   | モバイルの割合 | 中の主なページ                                                                            |
| ---------------------------------------------------- | ----- | ------ | -------------- | ----------------------------------------------------------------------------------------- |
| 診断・クイズのプレイ面（`/play/[slug]`）             | 2,734 | 81.01% | 86.9%          | `/play/character-personality` 2,527（全体の 74.87%）・word-sense 46・traditional-color 36 |
| 一覧（`/tools`・`/play`・`/blog`・辞典の一覧と分類） | 265   | 7.85%  | 14.0%          | `/play` 23・`/dictionary/yoji/category/society` 14・`/blog` 11                            |
| 辞典の詳細                                           | 102   | 3.02%  | 56.9%          | `/dictionary/colors/toki` 6・`/dictionary/kanji/左` 5                                     |
| トップ（`/`）                                        | 72    | 2.13%  | 29.2%          | —                                                                                         |
| ブログの記事                                         | 64    | 1.90%  | 10.9%          | `javascript-date-pitfalls-and-fixes` 9                                                    |
| ツール（`/tools/*`）                                 | 59    | 1.75%  | 50.8%          | `yoji-search` 48                                                                          |
| 診断の結果のページ（`/play/*/result/*`）             | 36    | 1.07%  | 88.9%          | —                                                                                         |
| ゲーム4本                                            | 29    | 0.86%  | 20.7%          | kanji-kanaru 13・irodori 8・yoji-kimeru 6                                                 |
| `/about`                                             | 10    | 0.30%  | 0%             | —                                                                                         |
| `/play/daily`                                        | 3     | 0.09%  | 66.7%          | —                                                                                         |
| `/privacy`                                           | 1     | 0.03%  | 0%             | —                                                                                         |
| 404（題が「ページが見つかりません」か「404」を含む） | 0     | 0%     | —              | —                                                                                         |

合計 3,375。

---

## 1. 404 と 410

§5・§6（左端・Tab の順）、§4（主見出しの段）。

| 項目                                              | いまの事実                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| どのルートにも一致しない URL                      | `src/app/global-not-found.js`（`next.config.ts` の `experimental.globalNotFound`）が描く。`/zz-not-exist` は 404・題「ページが見つかりません \| yolos.net」。                                                                                                  |
| ページの中で見つからない URL                      | `src/app/not-found.tsx` は無い。`notFound()` を呼ぶファイルは 68。`/dictionary/kanji/zz` は 404 で、題は Next の既定「404: This page could not be found.」、h1 は「404」（24px、y=372〜421・x=52 at 375 / y=439〜488・x=504 at 1280。中央に置かれる）。        |
| 404 の本文の左端                                  | `global-not-found.module.css` の `.main` が `max-width: 1200px`・`padding: 0 1rem` を持つ。h1 の字の左端は 375px で **43**、1280px で **195**（コンテンツ幅の左端より 16 右）。h1 は `2rem`（狭い画面 `1.5rem`）で、実測 24px / 32px。見出しは `PhrasedText`。 |
| 404 の Tab の順                                   | 測っていない。                                                                                                                                                                                                                                                 |
| 410（`/blog/ai-agent-site-strategy-formulation`） | 410。h1 は 33.28px / 65.28px、左端 27 / 179。§4・§5 どおり。見出しは `<wbr>` を持たず `word-break: auto-phrase`（`middleware.ts` の `build410Html`）。                                                                                                         |

**決めること**

- 1-a. `global-not-found.js` を `not-found.tsx` に寄せるか（ルートのレイアウトは1つ）。寄せないなら、`not-found.tsx` と `global-not-found.js` が同じ本文の部品を持つか。
- 1-b. 410 の見出しに文節の区切りを入れるか（middleware が組む HTML で、サーバーの `splitIntoPhrases` をそのまま使えるか）。

---

## 2. トップ（`/`）

§4（主見出し）・§5（コンテナ・線）。文言は T7、OGP の副題は T6。

| 項目               | いまの事実                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| h1                 | サイト名。`page.module.css:27` の `.title` が `font-size: 3rem`（コメントに「48px の見せ場」）。実測はどの幅も 48px。                                |
| 自前の余白         | `page.module.css:14` が `padding: var(--space-32) var(--space-24) var(--space-64)`。h1 の左端は 375px で **51**、1280px で **203**（どちらも +24）。 |
| 細い `--ink` の枠  | `.hero`（`page.module.css:63`、`1px solid var(--rule)`）。                                                                                           |
| 下限未満の字       | `.heroKicker` 13px。                                                                                                                                 |
| 見出しの折り方     | 見出し6つのうち5つが `auto-phrase` のまま（`PhrasedText` を使うのは1つ）。                                                                           |
| セクションのあいだ | 全幅の罫線を持つ区切り 0。                                                                                                                           |

**決めること**

- 2-a. サイト名の h1 を §4 の主見出しの段（33.28 / 65.28）で組むか。§5 のレイアウトの「サイト名（見出し書体・本文と同じ大きさ）」は上端のサイト名で、トップの h1 の大きさは §4 の表のほかに定めが無い。
- 2-b. `.hero` の細い枠を §5 のボックス（太い線）にするか、枠を外すか。

---

## 3. 一覧のページ

§5（左端）・§4（主見出し）・§7。

`/tools`・`/play`・`/blog`・`/blog/tag/オンラインツール`・`/dictionary`・`/dictionary/kanji`・`/dictionary/yoji/category/society`・`/dictionary/colors` を測った。

| 項目                   | いまの事実                                                                                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| h1・左端・パンくず     | 8ページとも h1 は 33.28 / 65.28、h1 とパンくずの左端は 27 / 179。パンくずの上端は 95 / 111。                                                                                                                                             |
| 細い `--ink` の枠      | 0。                                                                                                                                                                                                                                      |
| 見出しの折り方         | h1 に `<wbr>` を持つのはタグと分類のページ（データから作る見出し）。`/blog` は見出し4つのうち3つ、`/dictionary/kanji` は20のうち19が `auto-phrase` のまま（索引の区切りの見出しなど）。                                                  |
| 辞典の検索の欄のラベル | `/dictionary/kanji`・`/dictionary/yoji`・`/dictionary/colors`・`/dictionary/humor` の検索の欄は、どれも見えるラベルを持つ（「字・読み・熟語で探す」など）。T5 の行の「辞典の検索の欄の見えるラベルが無い」は、`3863a39` では当たらない。 |
| 索引の語の折り方       | ブログのタグの2語の名前（「オンラインツール」「ワークフロー連載」）の索引は、区切りを持たない（補足事項 T3-6/8 で T5 に渡したもの）。                                                                                                    |

**決めること**

- 3-a. 索引の語（アコーディオンの中のタグ名）と「同じカテゴリの四字熟語（57語）」「すべてのタイプ（8）」のような、名前に括弧で数を添えた見出し・ラベルに、§4 の「名前に括弧で数を添えたもの」の区切りを作る関数を、見出しと同じ `splitIntoPhrases` の指定で持つか、別の指定を足すか。

---

## 4. ツール（36本）

§4（主見出し・下限）・§5（コンテナ・線・ボックス）・§6（プライマリ・無効・スライダー・コピー）・§8（入力・結果）。

### 4-1. 頭の組み方（`ToolPageLayout`）

| 項目                 | いまの事実                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| h1                   | 36本とも 375px で **20px**、1280px で **25px**（§4 は 33.28 / 65.28）。                                                                                                                                                                                                                                                                                                            |
| h1 より大きい見出し  | 36本とも「関連ツール」（23.84px at 375、46.72px at 1280）が h1 より大きい。「関連ブログ記事」を持つ16本（age-calculator・business-email・char-count・color-converter・cron-parser・date-calculator・html-entity・json-formatter・keigo-reference・markdown-preview・regex-tester・text-diff・text-replace・traditional-color-palette・url-encode・yaml-formatter）はそれも大きい。 |
| 左端                 | h1 とパンくずの左端は 27 / 179（コンテナのとおり）。                                                                                                                                                                                                                                                                                                                               |
| パンくずの上端       | 375px で **79**、1280px で **87**（一覧のページは 95 / 111）。                                                                                                                                                                                                                                                                                                                     |
| ページの中の h2 の段 | FAQ・このツールについて・結果の見出しは 17〜17.6px。§4 のセクションの見出し（23.84 / 46.72）でも小見出し（17 / 33.28）でもない段が混ざる。unit-converter に 13.6px、unix-timestamp に 14px の h2 がある。                                                                                                                                                                          |
| 最初の操作の位置     | 375px で最初の入力欄・ボタンの上端は 230（bmi-calculator・image-resizer）〜 389（unix-timestamp）。320px では 306〜465。どれも 667 の中。                                                                                                                                                                                                                                          |
| 線                   | 「このツールについて」とシェアの上の線は `--rule-w-hair` の `--rule-2`（`ToolPageLayout.module.css:53`・`:83`）。FaqSection の上の線は `1px solid var(--rule)`（`FaqSection.module.css:6`）。                                                                                                                                                                                      |
| セクションのあいだ   | 全幅の罫線を持つ区切り 0（`Section` を使うのは `ListPage` と storybook だけ）。                                                                                                                                                                                                                                                                                                    |

補足事項 T3-9 の条件: yoji-search の 1280×800 と keigo-reference の 375×667 で最初の結果の全体が画面に入る（T3 の時点の下端 793・665）。h1 を §4 にしたあとの下端は測っていない。

### 4-2. 入力とボタン

| 項目                              | いまの事実                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 自前のラベル（`Field` でない）    | `<label>` 78 か所・28ファイル。`Field` を使う道具は5本（age-calculator・base64・char-count・json-formatter・qr-code）。78 の内訳: 読み取り専用の結果の欄のラベル 12（html-entity・fullwidth-converter・yaml-formatter・dummy-text・sql-formatter・csv-converter・kana-converter・url-encode・text-replace・line-break-remover の出力と business-email のプレビュー2）、スライダーのラベル 2（password-generator・image-resizer）、見えないラベル（`srOnly`）9（すべて date-calculator）、残りの見えるラベル 55。 |
| 下限未満のラベル                  | 自前のラベルのクラスが 13.6px（fullwidth・hash・kana・markdown-preview・text-diff・text-replace・unit-converter・url-encode の `fieldLabel`・`panelLabel` など）、12.8px（unix-timestamp の `dateFieldLabel`）。                                                                                                                                                                                                                                                                                                 |
| 1ページのプライマリボタン         | 開いた直後の画面で数えて: date-calculator **4**（「差分を計算」「加算」「西暦→和暦 変換」「和暦→西暦 変換」）、unix-timestamp **2**（「変換」×2）。image-base64 はデコードの向きでデコードのボタンと、デコードのあとの保存のボタンの2つ（`ImageBase64Tile.tsx:345`・`:368`）。ほかは0か1。                                                                                                                                                                                                                       |
| 無効の理由の無い `Button`         | 道具で2か所: `PasswordGeneratorTile.tsx:250`（プライマリ）・`UnixTimestampTile.tsx:193`（`disabled={!mounted}`）。ゲームの `GuessInput` にも2か所（yoji-kimeru:111・kanji-kanaru:110）と、kanji-kanaru の `Field`（:73）。                                                                                                                                                                                                                                                                                       |
| 無効の理由の無い `CopyButton`     | **29か所・18ファイル**（すべて道具。`disabled` を渡し `disabledReason` を渡さない）: unix-timestamp 8・color-converter 3・business-email 2・number-base-converter 2・html-entity・fullwidth-converter・yaml-formatter・dummy-text・hash-generator・sql-formatter・csv-converter・cron-parser・kana-converter・url-encode・password-generator・text-replace・markdown-preview・line-break-remover 各1。色の辞典の `CopyButton` 3つは `disabled` を持たない。                                                      |
| スライダー                        | `input type="range"` を直に置くのは password-generator（`:176`）と image-resizer（`:533`）。共有の `Slider` を使うのは irodori だけ。`max-width` は password-generator の `400px`（`:32`）・`300px`（`:85`）、image-resizer の `200px`（`:82`）。password-generator の「生成」のボタンの下端は 375px で 713（667 の外）。image-resizer の「リサイズ」は画像を読み込まないと出ないので測っていない（行の数は T4-14 の時点のもの）。                                                                               |
| 320px で語の中で折れるラベル      | line-break-remover の「連続する改行を1つにまと／める」、image-resizer のファイルの欄の「ファ／イルを落としても選べます」。sql-formatter・url-encode のラベルは 320px で語の中で折れない。sql-formatter の選ぶ欄は、320px でラベル（x=38）と同じ行に置かれ（x=118・幅 120）、はみ出さない。                                                                                                                                                                                                                       |
| email-validator の自前の印        | 判定の `svg` が2つ（`EmailValidatorTile.tsx:153`・`:169`）。`.badgeValid` が `1px solid var(--rule)`、`.badgeInvalid` ほかが `1px solid var(--accent)`・`color: var(--accent)`（`EmailValidatorTile.module.css:48`〜`:65`）。                                                                                                                                                                                                                                                                                    |
| keigo-reference「よくある間違い」 | `.correctText` が `color: var(--accent)`・600・0.9rem、`.mistakeLabel` が 0.75rem・600、字は「誤:」「正:」（半角のコロン。`KeigoReferenceTile.tsx:300`・`:306`）。`.mistakeCard` は `1px solid var(--rule-strong)`。                                                                                                                                                                                                                                                                                             |
| traditional-color-palette         | 色見本の格子は `minmax(44px, 1fr)`（`TraditionalColorPaletteTile.module.css:37`）で、行の「28px」は `3863a39` では当たらない。配色の説明とカードの字は 0.7〜0.9rem（`:153`〜`:261`）、`.harmonyDescription` 実測 12.8px。                                                                                                                                                                                                                                                                                        |

### 4-3. 結果の組み方（T4 の見本5本の規則を31本へ）

| 項目                           | いまの事実                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Panel` と `ResultBox`         | `Panel` を使う道具 31本、`ResultBox` を使う道具 5本（age-calculator・base64・char-count・json-formatter・qr-code）。コメント「§1 パネル準拠」が 26 ファイルに残る。`CronParserTile.tsx:348` に「B-3準拠」のコメント。                                                                                          |
| 細い `--ink` の枠（道具）      | 20ファイル・35か所（下の 10-3 の表）。                                                                                                                                                                                                                                                                         |
| 開いた直後の画面の下限未満の字 | byte-counter 13・unit-converter 13・unix-timestamp 6・number-base-converter 4（12px）・text-replace 4・url-encode 3 ほか（375px で字を持つ要素を数えた）。                                                                                                                                                     |
| markdown-preview               | プレビューの中の h1 がページの2つ目の h1 になり（ページの h1 は2つ）、33.28px でページの h1（20px）より大きい。外枠は `1px solid var(--rule-strong)`（`MarkdownPreviewTile.module.css:74`・`:83`）、ラベルは 0.85rem・600（`:44`・`:45`）。プレビューの中は `Prose` で、`.prose h2` の細い下線（10-3）も出る。 |
| unix-timestamp の表            | 補足事項の条件（375px の「ローカル時刻」のコピーで表が 233px 下へずれる、200% で別のコピーを押すと先のボタンが1行に戻る）は、`3863a39` で測り直していない。                                                                                                                                                    |
| 変体のための作り（B-755）      | `*TileVariant` の型と `variant` の prop を持つ道具が 28 ファイル。`scripts/generate-toolbox-registry.ts` が残り、`predev`・`prebuild` がそれを呼ぶ（`src/tools/registry.ts` は生成物の再輸出）。                                                                                                               |
| `new/` のディレクトリ（B-567） | `src/dictionary/_components/new`・`src/play/games/_components/new`・`src/play/games/shared/_components/new` の3つ。                                                                                                                                                                                            |
| BMI の結果の行とボタン         | 測っていない。                                                                                                                                                                                                                                                                                                 |

**決めること**

- 4-a. 道具のページの頭: h1 を §4 の主見出しにしたとき、パンくずの位置（いま一覧より 16〜24 上）と、yoji-search 1280×800・keigo-reference 375×667 の最初の結果の全体が画面に入る条件を、どう両立させるか。
- 4-b. 道具のページの中の見出しの段: 「このツールについて」・FAQ・結果の見出し・関連は、§5 のセクション（全幅の罫線と §4 のセクションの見出し）か、セクションの中の小見出しか。セクションにするなら、どの見出しの前で全幅の罫線を引くか。
- 4-c. date-calculator の4つの計算（差分・加算・和暦2つ）で、1ページに1つのプライマリをどれにするか。4つの計算を1ページの別の面（ラジオボタンで切り替えるなど）に分けるか。unix-timestamp の2つの「変換」、image-base64 のデコードと保存も同じ。
- 4-d. date-calculator の見えないラベル9つを見えるラベルにするか（§8「入力欄は必ずラベルを持つ」は見えることを言っているか）。
- 4-e. 読み取り専用の結果の欄の12のラベルは、`Field` に移すのか、T4 の結果の組み方（§8「読み取り専用の入力欄に出さない」）で欄そのものをやめるのか。
- 4-f. `UnixTimestampTile.tsx:193` の `disabled={!mounted}`（描き終えるまで押せない）に、来訪者に見せる理由の文が要るか。
- 4-g. 320px で語の中で折れるラベル（line-break-remover・image-resizer）の言い回しをどう変えるか。

---

## 5. 診断・クイズ

§4・§5・§6。回答の画面は T5a が受け持つ。

| 項目                                | いまの事実                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| プレイ面の h1                       | character-personality・kanji-level・music-personality・word-sense-personality で 375px **17.6px**、1280px **20px**。     |
| h1 より大きい見出し                 | 同じ4本で「他のクイズ・診断も試してみよう」「他のジャンルも試してみよう」（23.84 / 46.72）。1280px では3つ。             |
| 開始のボタン                        | character-personality の「はじめる」の下端は 375px で 468、320px で 580（どちらも 667 の中）。kanji-level は 419 / 463。 |
| プレイ面の左端・パンくず            | 27 / 179。パンくずの上端 87 / 87。                                                                                       |
| 結果のページの h1                   | `/play/character-personality/result/blazing-poet`・`/play/traditional-color/result/ai` で 33.28 / 65.28、左端 27 / 179。 |
| 細い `--ink` の枠                   | プレイ面は FaqSection の上の線だけ。結果のページは `InviteFriendButton.module.css:7` の `.wrapper` の上の線。            |
| `/play/daily`                       | h1 あり（B-594）。33.28 / 65.28、左端 27 / 179。見出し4つのうち1つが6字を超えて `<wbr>` を持たない。                     |
| 結果のページの 24行のあと           | 24行の一覧のあとの共有と「次はこれを」までの距離は測っていない（T5 の行の要求）。                                        |
| 375px のパンくずの行数（T4-7 の 6） | 測っていない。                                                                                                           |

**決めること**

- 5-a. プレイ面（PV の 81%）の h1 を §4 の主見出しの段にしたとき、「はじめる」が 320×667・375×667 の最初の画面に入り続けるか。入らないなら頭の何を詰めるか（T5a の選択肢の設計と同じ画面）。

---

## 6. ゲーム（4本）

§4・§5・§6。頭の組み方は T4 が受け持った。

| 項目                         | いまの事実                                                                                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| h1・左端                     | 4本とも 33.28 / 65.28、左端 27 / 179。                                                                                                                                                                                                                |
| 主操作の位置                 | プライマリの下端は 375px で kanji-kanaru 536・yoji-kimeru 577・irodori 659・nakamawake **1094**（667 の外）。1280px では 544・554・687・623。                                                                                                         |
| NextGameBanner               | `NextGameBanner.module.css:4` の `.container` が `1px solid var(--rule)` と `border-radius: var(--radius)`。一覧は `ItemList` の `boxed={false}`。見出しを持たず、進みの文「今日のパズル {n}/{N} クリア」（`NextGameBanner.tsx`）が一覧の名前になる。 |
| 負けた回を「クリア」と数える | 数は `playedToday`（各ゲームの `lastPlayedDate` が今日か。`crossGameProgress.ts:69`）で数える。勝ち負けを見ない。                                                                                                                                     |
| CrossCategoryBanner          | `CrossCategoryBanner.module.css:4` の `.crossCategory` が上に `1px solid var(--rule)`。                                                                                                                                                               |
| 無効の理由の無いボタン       | 4-2 の表のとおり（`GuessInput` 2本）。                                                                                                                                                                                                                |

**決めること**

- 6-a. NextGameBanner の数えるものを「遊んだ」に言い換えるか、勝った回だけを数える記録を足すか。
- 6-b. nakamawake の主操作が 375px で 1094 にある件は、T4 の頭の組み方の範囲か T5 の範囲か。

---

## 7. 辞典の詳細

§4・§5・§7。`DictionaryDetailLayout`（漢字・四字熟語・伝統色）と `/dictionary/humor/[slug]`。

| 項目                       | いまの事実                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 自前の余白                 | `DictionaryDetailLayout.module.css:16` と `humor/[slug]/page.module.css:10` が `padding: var(--space-32) var(--space-24) var(--space-64)`。パンくずの左端は 375px で **51**、1280px で **203**。                                                                                                                                                            |
| h1                         | 漢字・四字熟語・伝統色の詳細は 375・1280 とも **25px**。ユーモア辞典は 31 / 39px。漢字の h1 の左端は 131 / 448、四字熟語と伝統色は 51 / 320、ユーモアは 51 / 320。                                                                                                                                                                                          |
| セクションの見出し         | `.section h2` が 320・375px で **20px**（`KanjiDetail.module.css`・`YojiDetail.module.css`・`ColorDetail.module.css`）で、下に `1px solid var(--rule)`（`:70`・`:89`・`:41`）。                                                                                                                                                                             |
| 索引の区切りの見出し       | 漢字の「3画」「5画」「10画」、四字熟語の「初級」「中級」「上級」（h3）が 375px で 23.84px（漢字）・17px（四字熟語）、1280px で 33.28px。1280px では h1（25px）より大きい。                                                                                                                                                                                  |
| h1 より大きい見出し        | 1280px で「こちらもおすすめ」（46.72px）が3ページとも h1 より大きい。                                                                                                                                                                                                                                                                                       |
| 細い `--ink` の線          | 漢字 11・四字熟語 11・伝統色 10・ユーモア 5（画面で数えた要素の数）。見出しの下線・`.infoList`・`.infoRow`・`.metaList`・`.metaItem`・`.codeTable tr`・伝統色の色見本（`ColorDetail.module.css:22`、§2 は色見本を `--rule-2` の細い線で囲む）・`.shareSection` の上。ユーモアは `.header`（`1px solid var(--rule-strong)`）・`.sectionTitle`・`.backLink`。 |
| 押せる範囲を持たないリンク | 漢字の詳細の「工」「5画」「小学1年」（部首・画数・学年への分類のリンク）、四字熟語の「コトバンク↗」（字そのものを除いてブロックの中に字が無いリンクを数えた）。                                                                                                                                                                                             |
| 古いトークン               | ユーモアの `.header`・`.example`（`humor/[slug]/page.module.css:23`・`:55`）が `--rule-strong`、`ColorDetail.module.css:20` が `--radius`。                                                                                                                                                                                                                 |
| 経緯の注記                 | `DictionaryDetailLayout.module.css:4` に「店構え」。                                                                                                                                                                                                                                                                                                        |
| 色の辞典の表（T4-4c）      | 200% の 320・375px でコピーのボタンが画面の外に出る件は、`3863a39` で測り直していない。                                                                                                                                                                                                                                                                     |

**決めること**

- 7-a. 詳細のページの h1 はどの要素か（漢字の詳細で h1 が 25px、大字は別の要素）。h1 を §4 の主見出しにしたとき、大字（§3 の字の形そのものが中身である字）とどう並べるか。
- 7-b. `.infoList`・`.metaList` の値の並び（ラベルと値の組）を §5 の表で組むか、§7 の行の一覧の区切りで組むか。
- 7-c. 分類へのリンク（部首・画数・学年）を、本文の中のリンクとして置くか、字の箱を持つコントロールとして置くか（§7「項目が属する分類へのリンク」は一覧ではないとだけ言う）。

---

## 8. ブログ

§4・§5・§6。

| 項目                     | いまの事実                                                                                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 自前の余白               | `blog/[slug]/page.module.css:11` が `padding: var(--space-32) var(--space-24) var(--space-64)`、`:194` が狭い画面で `var(--space-24) var(--space-24) var(--space-48)`。h1 とパンくずの左端は 51 / 203。                |
| h1                       | 33.28 / 65.28、`<wbr>` あり。                                                                                                                                                                                          |
| パンくずと h1            | 375px でパンくずの下端 175・h1 の上端 175（あいだ 0）。                                                                                                                                                                |
| 本文の見出し             | Markdown の見出しは `<wbr>` を持たず `auto-phrase` のまま（`markdown.ts` の見出しの描き方は区切りを入れない）。87記事の本文にコードの外の見出しが 1,252。測った2記事では見出し14のうち12、24のうち22が `auto-phrase`。 |
| `.prose h2` の下線       | `Prose.module.css:20` が `border-bottom: 1px solid var(--rule)`。                                                                                                                                                      |
| 共有と前後の記事の線     | `.shareSection`・`.postNav` の上に `1px solid var(--rule)`（`:89`・`:105`）。`.navLabel` 12px。                                                                                                                        |
| 目次（375px）            | 読み込みの途中で `details` が開いていて（高さ 605）、読み込みのあと閉じる（高さ 66）。最初の本文の h2 は y=2466 から 1927 へ **539px** 上へ動く（`javascript-date-pitfalls-and-fixes`）。                              |
| 1280px で横に送る表      | 87記事・197表のうち **0**（自前の余白 24px がある状態）。                                                                                                                                                              |
| 目次の列の折れ（1280px） | 閉じたときの2行の折れと 200% で画面の外に出る件は、測っていない。                                                                                                                                                      |

**決めること**

- 8-a. 記事の本文の h2 は §5 のセクション（全幅の罫線と §4 のセクションの見出しの段）か、セクションの中の小見出し（上に細い線）か。いまの下線はどちらにも無い形。
- 8-b. 目次のアコーディオンの初めの開閉を、サーバーで描くときにどう決めるか（幅はサーバーで分からない）。
- 8-c. 自前の余白 24px を外したあと、1280px で横に送る表が増えないか（いま 0）を、外したあとの画面で測る。

---

## 9. about・privacy・storybook

§5・§4。about の文章の中身は B-746 に残す。

| 項目              | いまの事実                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 自前の余白と幅    | `about/page.module.css:8`・`privacy/page.module.css:12` が `padding: var(--space-32) var(--space-24) var(--space-64)`。パンくずと h1 の左端は 375px で **51**、1280px で **344**（本文を中央に寄せている）。 |
| h1                | 33.28 / 65.28、`<wbr>` あり。                                                                                                                                                                                |
| 細い `--ink` の線 | about 6（見出しの下線 `.sectionTitle`）、privacy 11（`.title` の `--rule-strong`・`.sectionTitle`・`.enactmentDate`）。`privacy/page.module.css:15` のコメントに「のれん罫」。                               |
| storybook         | 細い `--ink` の枠 4か所（`.notice`・`.toc`・`.swatch`・`.radiusSample`）、`--radius` の宣言3と inline の2（`StorybookContent.tsx:503`・`:515`）、下限未満の字の宣言 7、プライマリ5（見本として並べる）。     |

**決めること**

- 9-a. storybook の見本の中のプライマリ5つを、1ページに1つの規則の外（見本）として扱うか。

---

## 10. 面をまたぐもの

### 10-1. ページの CSS が参照する古いトークン

§2・§5・§12（トークン）。定義は `globals.css:31`〜`:33`（`--accent`・`--accent-weak`・`--rule-strong`）と `:56`〜`:57`（`--radius`・`--radius-sm`）。

| トークン        | 宣言の数 | ファイル | どこ                                                                                                                                                                                                                                                     |
| --------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--accent`      | 6        | 3        | email-validator 4・keigo-reference 1・`tools/_components/ErrorBoundary.module.css:16`                                                                                                                                                                    |
| `--accent-weak` | 0        | 0        | —（`src/test/design-gate.test.ts` の見本の文字列だけ）                                                                                                                                                                                                   |
| `--rule-strong` | 19       | 15       | 道具13ファイル（byte-counter・business-email・color-converter 3・cron-parser・email-validator・hash-generator・image-base64・keigo-reference・markdown-preview 2・password-generator・text-diff・text-replace・unit-converter）・privacy・humor の詳細 2 |
| `--radius`      | 49       | 27       | 道具21ファイル・storybook 2ファイル（CSS 3・TSX 1）・`ColorDetail`・`QuestionCard`・`NextGameBanner`・`ErrorBoundary`                                                                                                                                    |
| `--radius-sm`   | 4        | 4        | email-validator・color-converter・regex-tester・storybook の TSX                                                                                                                                                                                         |

合計 78 宣言・29ファイル。ほかにコメントの中に3（`ByteCounterTile.module.css:6`・`ImageBase64Tile.module.css:28`・`CronParserTile.tsx:348`）。テストでは `design-gate.test.ts` が `var(--radius)`・`var(--radius-sm)` を許す値として持ち、5つの道具のテストが `var(--accent)` の有無を見る。

### 10-2. フォーカスの規則

§6（フォーカス）。

`globals.css` の外で `:focus`・`:focus-visible`・`:focus-within` を持つ規則は 16（11ファイル）。`outline: 2px solid var(--accent)` の形は0。16の内訳は、共有の二重リングのトークン（`--focus-ring`・`--focus-ring-offset`・`--focus-ring-fill`）を使うもの（ResultBox・FileDropZone・traditional-color-palette の見本・regex-tester の欄の行）、リングを出さないもの（`SiteFrame` の `.main:focus`・`QuestionCard` の `.questionText:focus` の `outline: none`、regex-tester の欄の `outline: none` は行の側でリングを出す）、ItemList・Select・SkipLink・Slider の部品の中の規則。T5 の行の「約83件」は `3863a39` では残っていない。

### 10-3. 細い `--ink` の線（`1px solid|dashed var(--rule)` / `var(--rule-strong)`）

§5（線は太い `--rule` か細い `--rule-2` の2種類）・§6（細い線で囲むのは hover・入力欄・色見本）。

`globals.css` の外に **64か所・35ファイル**（`1px solid var(--rule)` 45・`1px solid var(--rule-strong)` 18・`1px dashed var(--rule)` 1）。

| まとまり     | 数             | ファイルとクラス                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 道具         | 35・20ファイル | 囲み（`border`）: bmi `.meterTrack`・business-email `.previewSection`・byte-counter `.primaryStat` `.stat`・color-converter `.colorPicker` `.colorPreview` `.resultCard`・cron-parser `.description` `.builtExpression`・email-validator `.badgeValid` `.analysisPanel`・hash `.resultRow`・image-base64 `.preview`・image-resizer `.imagePreview`・keigo `.mistakeCard`・markdown-preview `.preview` `.emptyHint`・number-base `.resultCard` `.hexResult`・password `.resultDisplay`・regex `.matchInfo` `.matchText` `.replaceOutput`・text-diff `.result`・text-replace `.regexHint`・traditional-color-palette `.placeholderMessage`（破線）`.achromaticNotice` `.paletteCard` `.paletteColorSwatch`・unit-converter `.resultDisplay` `.allResults` `.resultItem`・unix-timestamp `.currentBar`・`ErrorBoundary` `.error`。区切り（片側）: byte-counter `.breakdown` |
| 共有の部品   | 2              | `FaqSection` `.section` の上・`Prose` `.prose h2` の下                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 辞典         | 10・4ファイル  | 7 の表のとおり                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ゲーム・診断 | 3              | `NextGameBanner` `.container`（囲み）・`CrossCategoryBanner` の上・`InviteFriendButton` の上                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| app のページ | 14・6ファイル  | トップ `.hero`・ブログ `.shareSection` `.postNav`・ユーモア 3・privacy 3・about `.sectionTitle`・storybook 4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

画面では、`FaqSection` を持つツール・ゲーム・診断のプレイ面のどのページにも1本出る。

### 10-4. 見出しの折り方（`auto-phrase` をやめる）

§4（折り方）。

- `globals.css:190` が h1〜h6 に `word-break: auto-phrase` を掛ける。`line-break: strict` は `DESIGN.md` にも `globals.css` にも無い（`src/` では nakamawake の `WordGrid.module.css:84` だけ）。
- `PhrasedText` を使うファイルは 32。`<h1>`〜`<h6>` を直に書く TSX は 27ファイル・131か所（storybook 76、cron-parser 6、トップ 5、privacy 4 ほか）。
- 測ったページで、`auto-phrase` のまま描かれる見出しの数（375px）: トップ 5/6、`/blog` 3/4、`/dictionary/kanji` 19/20、漢字の詳細 5/10、四字熟語の詳細 4/11、伝統色の詳細 2/7、ユーモアの詳細 3/4、ブログの記事 12/14・22/24、privacy 4/15、date-calculator 3/9、markdown-preview 2/8、unix-timestamp 2/7、cron-parser・unit-converter 各1、yoji-kimeru 2/8、410 1/1、Next の既定の 404 2/2。ツールの h1 は 36本のうち 27本が `<wbr>` を持ち、9本（age-calculator・date-calculator・email-validator・fullwidth-converter・keigo-reference・line-break-remover・number-base-converter・unit-converter・yoji-search）は持たない（`<wbr>` が要らない1文節の名前かどうかは見ていない）。
- ブログの本文の見出し 1,252（8 の表）。
- 補足事項の条件: 空白を持つ見出しの空白より後ろの長い語が字の所で割れて行頭に長音符が出うる（「Unix ／タイムスタンプ変換ツ／ール」）。いまの道具の名前は空白を持たない。

### 10-5. 押せる範囲（`data-text-box`）を持たないリンク

§5（字の箱）・§6。

画面の `main` の中で、`data-text-box`・`data-hit-area`・`data-inverted` を自分も祖先も持たず、ブロックの中にリンクの字しか無いリンクを数えた。測った64ページで、漢字の詳細 3（「工」「5画」「小学1年」）と四字熟語の詳細 1（「コトバンク↗」）だけ。T5 の行に挙がる「診断へ誘うリンク・すべて見る・カードのリンク・記事の前後のリンク」は、測ったページでは押せる範囲を持つか、ブロックの中にほかの字と並ぶ。

### 10-6. 中間のセクションと全幅の罫線

§5（ページの割り方）。

`Section`（`src/components/Section`）だけがセクションのあいだの全幅の罫線を引く（`margin-inline: calc(50% - 50vw)` はこのファイルだけ）。使うのは `ListPage` と storybook。測った64ページで、`::before` に太い線を持つ `section` は storybook の 26 だけで、ほかのページは中間に全幅の罫線を持たない（上端と下端の罫線は `SiteFrame`）。

### 10-7. §4 の下限（`0.875rem`）を下回る字

`globals.css` の外の `font-size` の宣言で、`0.875rem` 未満の rem・14px 未満の px・`0.875em` 未満の em は **70 宣言・30ファイル**（道具 26ファイル、storybook 7 宣言、ブログの記事、トップ、辞典1）。

### 10-8. 経緯の注記と、無い節への参照

- 「§1 パネル準拠」26ファイル、「B-3準拠」1（`CronParserTile.tsx:348`）。
- 道具の TSX の経緯のコメント: `DateCalculatorTile.tsx:84`〜`:85`（旧実装の id を移行）、`TextReplaceTile.tsx:87`、`regex-tester/meta.ts:5`・`:19`（cycle-215）、`cron-parser/logic.ts:416`〜`:417`・`CronParserTile.tsx:112`（B-472）。
- ページの CSS: `privacy/page.module.css:15`（のれん罫）、`DictionaryDetailLayout.module.css:4`（店構え）。
- ページの TSX: `dictionary/colors/[slug]/opengraph-image.tsx:10`〜`:30`（cycle-306、印）は T6 の画像と同じファイル。

---

## 11. 面ごとの仕事の量（まとめ）

| 面（GA の割合）          | 主な差分                                                                                                                                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 診断のプレイ面（81.01%） | h1 17.6 / 20px → §4。h1 より大きい関連の見出し2〜3。FaqSection の線。「はじめる」がファーストビューに残るかを測る。                                                                                                                           |
| 一覧（7.85%）            | §4・§5 は揃っている。残りは索引の語と括弧の数の見出しの区切り、`auto-phrase` の見出し。                                                                                                                                                       |
| 辞典の詳細（3.02%）      | 自前の余白 24px、h1 25px、セクションの見出し 20px、区切りの見出しの大小の逆転、細い線 10〜11、古いトークン、分類のリンクの字の箱。                                                                                                            |
| トップ（2.13%）          | 自前の余白 24px、h1 48px、細い枠、下限未満の字、`auto-phrase` の見出し5。                                                                                                                                                                     |
| ブログ（1.90%）          | 自前の余白 24px、本文の見出し 1,252 に区切り、`.prose h2` の下線、目次の 539px の動き、パンくずと h1 のあいだ 0、下限未満の字。                                                                                                               |
| ツール（1.75%）          | 36本の h1 20 / 25px と頭の組み方、31本の結果の組み直し（`Panel`）、細い枠 35、古いトークン 67 宣言（22ファイル）、自前のラベル 78、無効の理由の無い `CopyButton` 29・`Button` 2、プライマリの数（3本）、スライダー2本、変体の作り28ファイル。 |
| 診断の結果（1.07%）      | §4・§5 は揃っている。`InviteFriendButton` の線、24行のあとの距離の計測。                                                                                                                                                                      |
| ゲーム（0.86%）          | NextGameBanner の枠と数え方、CrossCategoryBanner の線、`GuessInput` の無効の理由、nakamawake の主操作の位置。                                                                                                                                 |
| about・privacy（0.33%）  | 自前の余白と中央寄せ（1280px で左端 344）、細い線。                                                                                                                                                                                           |
| 404（0%）・410           | `not-found.tsx` が無く Next の既定の 404 が出る（`notFound()` 68ファイル）、404 の左端 +16。410 は見出しの区切りだけ。                                                                                                                        |
