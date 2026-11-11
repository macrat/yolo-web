# レビュー: T1 の土台（2巡目）

レビュー日: 2026-09-25
対象: `git diff 13c4c3c..998fc8e -- src DESIGN.md`（df4bf9a・885c924・9fca564・952b709・998fc8e）と、998fc8e で更新した [index.md](./index.md)・[fonts-decision.md](./fonts-decision.md)
根拠: `DESIGN.md` §2〜§5、[fonts-decision.md](./fonts-decision.md)、`.claude/skills/frontend-design/SKILL.md`、[index.md](./index.md) の T1〜T5 の分担と完了の条件、[review-t1-base.md](./review-t1-base.md)

## 結論

**改善指示**（Blocker 0・Major 1・Minor 4）

§2 の6色、§4 の組版、§5 の線・幅・余白のトークンは、light・dark とも `DESIGN.md` のとおりである。ルートの文字サイズは固定されておらず、既定を 32px にすると本文・見出し・幅がそろって大きくなる。書体の配り方と見出しの書体の当て方も、`DESIGN.md` §3 と fonts-decision.md のとおりである。前回の指摘（Major 5・Minor 7）は、記録の一部（Major-2 の判断の理由、Major-5 の記録の食い違い）を除いて直っている。

一方で、見出しの書体を Noto Serif JP（600）から Zen Antique（400 の1本だけ）に替えたときに、見出しの書体へ `font-weight: 600` を当てた規則が6つ残った。そこでは Zen Antique が合成太字で描かれ、漢字・四字熟語の詳細の大字では字の中の空きが潰れる。§4「合成太字を作らない」に反し、T1 の変更が来訪者に出した害である。

## 確かめたこと

998fc8e を `npm run build` して `next start` で配り、Playwright（Chromium 1194）で確かめた。

| 観点                                  | 結果                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §2 の6色（light・dark）               | `globals.css` の値は `DESIGN.md` の表のとおり。`--rule` は両モードで `var(--ink)`。比を計算した: 文字 `--ink`／`--paper` 19.1・17.2、`--ink-2`／`--paper` 7.6・8.2、`--ink-2`／`--paper-2` 6.7・7.1、線 `--rule-2`／`--paper` 3.5・3.6、`--rule-2`／`--paper-2` 3.2・3.1。どれも §12 を満たす                                                                 |
| 完了の条件「UI のトークン」           | 998fc8e が条件に「`DESIGN.md` が値を定めるもの（§4 の文字の大きさと行間、§5 の間隔とボックスの内側の余白）」を加え、`--text-*`・`--leading-*`・`--space-*`・`--box-padding` はその範囲に入った。残る `--accent`・`--accent-weak`・`--rule-strong`・`--radius`・`--radius-sm`・`--wairo-*` は PM の前提のとおり T2〜T5 で消える別名・中身の色として扱った      |
| §4 の組版                             | 本文 `1.0625rem`・行間 `1.85`、補助情報 `0.875rem`、入力欄 `max(1.0625rem, 16px)`、見出しは行間 `1.25`・400・5段。`45rem`・`64rem` で主見出し・セクション・小見出しの段がそろって下がる                                                                                                                                                                       |
| §5 の線・幅・余白                     | `--rule-w: 3px`・`--rule-w-hair: 1px`、`--max-width: 60rem`・`--measure: 40rem`、ボックスの内側の余白は `45rem` 未満で 8px・以上で 16px。`pre` は太い線のボックス、表は外枠なしで細い線。`caption` の先に来る表でも外側の線が消える選択子になった                                                                                                             |
| ルートの文字サイズ                    | `html` に `font-size` が無い。CDP の `Page.setFontSizes` で既定を 32px にすると、4ページ（トップ・ブログ・ツール・漢字）× 375px・1280px で本文 34px、トップの h1 96px、ブログの h1 66.56px（32px の既定では 1280px が `45rem` 未満になる）、`--max-width` は 60rem なのでコンテナも一緒に広がる。ページの横のはみ出しは0                                      |
| 書体の配り方                          | ビルドの CSS で、`plexSans` の2つの `@font-face` に `unicode-range: U+0-7F`、代わりの書体 `IBM Plex Sans Fallback`（`local(Arial)`・同じ範囲）、Zen Antique は分割ファイルで `preload` なし。HTML は Plex の Regular と Bold だけを preload する。`CSS.getPlatformFontsForNode` で、見出しの和文は Zen Antique、欧文は IBM Plex Sans で描かれることを確かめた |
| Zen Antique に無い字                  | `/dictionary/kanji/𠮟` に2つ、`/dictionary/kanji/radical/辵`・`/dictionary/colors/sohi` に1つずつ `data-heading-font="fallback"` が付き、`/dictionary/kanji/山`・`/dictionary/yoji/切磋琢磨` には付かない。字の表は `.next/static` に無く、`.next/server` にだけある                                                                                          |
| 四字熟語の構成漢字（前回の Major-3）  | 行の字がすべて見出しの書体でそろった。行に Zen Antique に無い字があれば、行全体が本文の書体に切り替わる                                                                                                                                                                                                                                                       |
| 読み込みの前後のずれ                  | Web フォントを止めたときと読み込んだときの h1・h2 の高さは6ページとも同じ。ページの高さは漢字・四字熟語で 2px、ブログで 62px 違う（この環境には Arial が無く、Plex の代わりの書体が効かない。T9 に割り当て済みの項目）                                                                                                                                        |
| 6ページ × 375px・1280px × light・dark | トップ・`/play/character-personality`・`/tools/char-count`・`/dictionary/kanji/山`・`/dictionary/yoji/切磋琢磨`・`/blog/sql-cheatsheet` の24枚を撮り、ダークのクラスが付くことも確かめた。読めない・操作できない箇所は下の Major-1 のほかに無い。`/blog/sql-cheatsheet` の 375px で表がはみ出すのは前回の申し送り（T4・B-641）のまま                          |
| 試験・静的検査                        | `npm run typecheck`・`npm run lint`・`npm run format:check`・`npm run build` が通る。`vitest run` は 324ファイル・5,565件が通る                                                                                                                                                                                                                               |

## 指摘

### Major-1: 見出しの書体を当てた要素のうち6つが、Zen Antique の合成太字で描かれる

Zen Antique はウェイト400の1本しかない。見出しの書体を当てたまま `font-weight: 600` を持つ規則が、次の6つ残っている。どれも 13c4c3c では Noto Serif JP（600 を配っていた）で描かれていた規則で、885c924・952b709 が `font-family` だけを `--font-heading` に替えた。ブラウザは太字を合成して描く。

| 規則                                                                                    | 出る場所                                  |
| --------------------------------------------------------------------------------------- | ----------------------------------------- |
| `src/dictionary/_components/kanji/KanjiDetail.module.css` `.character`（96px）          | 漢字辞典の詳細の大字（2,136 ページ）      |
| `src/dictionary/_components/yoji/YojiDetail.module.css` `.character`（52px）            | 四字熟語辞典の詳細の大字（400 ページ）    |
| `src/components/In/In.module.css` `.char`                                               | トップの札の見本の印、診断の結果面の印    |
| `src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css` `.resultAnswer` | 漢字カナールの正解                        |
| `src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css` `.resultAnswer`   | 四字熟語きめるの正解                      |
| `src/play/games/_components/new/GameLayout.module.css` `.usageExampleHeading`           | 4つのゲームのページの「こんなゲームです」 |

`/dictionary/yoji/切磋琢磨` の大字を、そのままと `font-weight: 400` にしたもので撮り比べると、合成太字では「磋」「磨」の中の空きが潰れて黒い塊になる。トップの印の「診」は 9.35px で、字の形が読めない。ほかに21ページを開いて同じ条件の要素を探し、4つのゲームのページの「こんなゲームです」と診断の結果面の印で合成太字を確かめた。§4「和文も欧文もウェイト 700 を持つ（合成太字を作らない）」と §3「見出しにウェイトの差を使わない」に反する。大字は漢字・四字熟語の詳細でいちばん大きく、来訪者がまず見る字である。

大字・正解・印の字をアンティーク体で組み続けるかは T4 が判定する。しかし、いまの害は T1 が書体を替えたことで生じたので、T1 で消す。

直し方: 6つの規則の `font-weight: 600` を消す（見出しの書体は 400 の1本）。書体を替えるときは、その書体に紐づく指定（ウェイト・`font-feature-settings` など）を `grep` で洗い出してから替える（AP-I13）。再発を防ぐため、「見出しの書体で描かれる要素のウェイトは 400」を T8 の機械の検査に加えるよう、T8 の完了の条件に書く。

### Minor-1: T1 が書き換えた行に、経緯と、`DESIGN.md` に無い節・違う節を指す参照が残っている

前回の Major-4 で「朱」は消えたが、同じ行に次が残っている。どれも 13c4c3c..998fc8e の `+` の行（T1 が書いた行）である。

- **経緯**: ツールの12ファイルの先頭の注記「フェーズR: 店構え（紙・墨）トークンへ移行。」「フェーズR C5: 新デザイントークン（紙・墨）へ移行。」（`ColorConverterTile`・`CronParserTile`・`CsvConverterTile`・`DateCalculatorTile`・`DummyTextTile`・`EmailValidatorTile`・`KanaConverterTile`・`KeigoReferenceTile`・`LineBreakRemoverTile`・`MarkdownPreviewTile`・`NumberBaseConverterTile`・`PasswordGeneratorTile` の `.module.css`）、`EmailValidatorTile.test.tsx` の「フェーズR（店構えデザイン）では」、`TraditionalColorPaletteTile`・`UnitConverterTile` の「旧 --color-* トークン不使用」「旧トークン不使用」、`ToolPageLayout/index.tsx` の「旧トークン（--fg/--bg/--border/--r-*）は使用しない」
- **`DESIGN.md` に無い節**: `Button.module.css`「（§4/§8-2）」、`Footer.module.css`「（§8-6）」、`ThemeToggle.module.css`「（§4/§8-5）」。完了の条件「書き換えたファイルに `DESIGN.md` に無い節番号の参照が0件」に当たる
- **違う節を指す参照**: 「下線はリンク専有・§3」（`BlogList`・`RelatedTools`・`Shinagaki`・`ShareButtons`・`DictionaryEntryList`・`PlayRecommendBlock`・`dictionary/humor/page.module.css`。下線は §6、§3 は書体）、「§4「品名（リンク・墨）」」「§4「一覧の既定は品書き」」「§4「ページネーションは店構え」」（`DESIGN.md` に無い規定）、「全トークン経由（§10）」「タップ面 44px（§10）」「:focus-visible に委ねる（§10）」（§10 はサイトの外での見え方）、「本文は左揃え（§4）」「一行の長さを --measure に絞る（§3）」（左揃えと幅は §5）

とくに「静止時は下線を出さず、hover で下線（下線はリンクの専有・§3）」は、§6（リンクは下線を必ず持つ）と逆のことを `DESIGN.md` の規定として書いている。T2 で部品を作り直す人がこの注記を読めば、誤った規定を根拠にしうる。

直し方: T1 が書き換えた行からは、経緯（フェーズ・移行・旧〜）を消し、節番号は外すか今の `DESIGN.md` の節に正す。書き換えていない行に残る同じ種類の注記は T2〜T5 が部品と面を作り直すときに消えるが、完了の条件の範囲（「このサイクルで書き換えたファイル」）に入るので、T8 の検査で拾えることを確かめておく。

### Minor-2: 使われていない数字のユーティリティを、書き換えたうえで残している

`globals.css` の `.tabular, [data-number]` は、9fca564 が `font-family` を `--font-body` に書き換えたが、`src/` のどこからも使われていない（クラス名 `tabular` も属性 `data-number` も0件）。IBM Plex Sans の数字は既定で桁が揃う（§3）ので、`font-feature-settings: "tnum"` も効き目が無い。土台に使われない規則を残すと、T2〜T5 の作業者がこれを数字の組み方の正典と読む。同じ理由で、`KanjiDetail.module.css` の `.number` の注記「桁が映える tabular 数字書体（§3）」は、いまは本文の書体を当てているだけなので事実と合わない。

直し方: `.tabular, [data-number]` の規則を消す。`.number` の注記を事実に合わせる（または規則ごと消す）。

### Minor-3: 前回の Major-5 の記録に、事実と合わない箇所と、食い違いが残っている

- [fonts-decision.md](./fonts-decision.md)「扱い」の表は、字の表について「書体かデータが変わると試験が落ちる」と書く。試験が照らすのはリポジトリの `src/data/zen-antique-charset.json`（`v14` の時点の表）で、`next/font/google` がビルドのたびに取る Zen Antique の版が上がっても、表は変わらず試験も落ちない。落ちるのはデータが変わったときだけである。書体の版が上がったことに気づく手段（ビルドが取った CSS の URL の版と表の `source` を照らす検査など）を置くか、置かないならその判断と、表を作り直す契機を書く。
- 同じ表は「読み込みの前後の見出しの折り返し」を T9 で確かめるとしているが、[index.md](./index.md) の T9 は fonts-decision.md から引き取る項目を4つ（本文の太字・`text-spacing-trim`・和欧が混ざる行の高さ・Arial の無い環境の CLS）と列挙し、見出しの折り返しを含まない。T9 の列挙に加える。
- Plex の Bold を preload する理由を「強調と表の見出しで本文に広く出る」としているが、いまどのページでも Bold を使うのは上端のサイト名（`Header.module.css` の `.logo` が `font-weight: 600`）である。§5 はサイト名を見出しの書体・本文と同じ大きさとし、§3 は見出しにウェイトの差を使わないので、T1 の残りで上端を作り直せば Bold の主な使い手が消える。上端を作ったあとで preload を見直すことを、T1 の残りの作業として書く。

### Minor-4: 前回の Major-2 の判断と理由が、記録に無い

前回の Major-2 は「(a) 完了の条件の許す変数に §4・§5 の値を加える（計画の変更なので planner）か、(b) 部品に変数を渡さないかを選び、判断を cycle-316 の文書に残してレビューを受ける」と求めた。998fc8e は index.md の完了の条件を (a) の形に書き換えたが、なぜ (a) を選んだか（組版の値と画面幅ごとの段の割り当てを1か所で持ち、部品が再現しなくて済む、など）はどの文書にも無い。レビュー結果の表の対応欄も「反映した」だけである。条件の変更そのものは妥当だと判断するが、後のサイクルが条件の由来を辿れない。

直し方: index.md（または別ファイル）に、選んだ案と理由を2〜3行で書き、レビュー結果の表の前回の行の対応欄からそこへリンクする。

## 作業の進め方の指摘

- 前回の Major-5・Major-2 は、コードは直ったが、記録が求めたとおりになっていない（Minor-3・Minor-4）。指摘への対応は、指摘が求めたものすべてで完了とする（AP-WF01）。
- 書体を替えた 885c924 で、旧い書体に紐づくウェイトの指定を洗い出していなかった（Major-1。AP-I13）。
- 完了の条件（計画）の書き換えが、builder のコミットの中で行われている。計画の変更は planner が行い、その変更としてレビューを受ける。今回の内容はこのレビューで確かめたが、次からは分ける。

## 申し送り（今回の対象外）

- **T2**: `globals.css` の `:focus-visible` は `outline: 2px solid var(--ink)` の単色のリングで、§5 に無い太さ（2px）であり、§6 の二重リングでもない。T2 の「フォーカスの二重リング」で置き換える。`/tools/char-count` の入力欄（`Textarea.module.css`）は 14px の固定で、既定を 32px にしても 14px のまま（B-663）。
- **T1 の残り（上端）**: `.logo` の `font-weight: 600`（上の Minor-3）と大きさ（1.375rem）は §5 のレイアウトと違う。
- **T9**: 代わりの書体 `IBM Plex Sans Fallback` は `local(Arial)` だけで、Arial の無い Android と Linux では効かない。この環境ではブログのページの高さが読み込みの前後で 62px 変わった。Android は来訪者の端末として少なくないので、T9 で測ったうえで、Roboto など Android の書体のメトリクスを合わせた代わりの書体を足すかを決める。
- **T4**: `--wairo-*` は中身の色をトークンとして持っており、§12「コンテンツの色はトークンを持たない」と完了の条件に当たる。色が主題の面を組み直すときに扱う。
