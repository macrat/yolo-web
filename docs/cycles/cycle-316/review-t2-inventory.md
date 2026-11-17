# レビュー: T2 着手前の洗い出し（t2-inventory.md）

レビュー日: 2026-09-25
対象: [t2-inventory.md](./t2-inventory.md)（未コミット。HEAD は db7e525）
根拠: [index.md](./index.md) の T2 の行、`DESIGN.md` §2・§5・§6・§7・§8、`docs/constitution.md`、`docs/anti-patterns/planning.md`・`workflow.md`

## 結論

**改善指示**（Blocker 0・Major 2・Minor 6）

件数と HEAD の見え方の記述は、確かめた範囲ではほぼ実測と合っている。T2 の完了の判定に使うには、2つの取りこぼしを埋める必要がある。洗い出しは「値に `var(--accent)`・`var(--accent-weak)` を含む規則」を拾う作りになっている。そのため、朱の面の明度を変えるだけの hover が抜けている（Major-1）。無効の状態も入っていない（Major-2）。ほかは事実の誤り2件、分類の誤り、案の混入、範囲の境界の書き漏れである。

## 確かめたこと

`git archive 885c924^ src` を展開し、postcss で規則ごとに読み直した。HEAD（db7e525）の `src/` も同じ方法で読んだ。

| 観点                                                                                                                                                                                          | 結果                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 変更前に `--accent`・`--accent-weak` を値に持つ規則 309 件、outline だけの規則 106 件（`.swatchSelected` 1件＋フォーカス 105 件）                                                             | 一致。**ファイル数は 107 で、122 ではない**（Minor-1）                                                    |
| 変更前と HEAD の、朱を含む宣言の差                                                                                                                                                            | 差があるのは `globals.css`・`Header`・`Footer`・`ThemeToggle` だけ。冒頭の「HEAD でも同じ値のまま」と一致 |
| 1-2 の 69 規則と内訳（37・19・11・2）                                                                                                                                                         | 一致                                                                                                      |
| 1-1 の HEAD の見え方（Breadcrumb `.link`/`.current`、FacetIndex `.link`/`.active`、blog `.category`/`.meta`、EntryRatingButton、SegmentedControl、`.cta2Link`、Input `.error`、irodori の点） | CSS の値は一致。ただし EntryRatingButton と irodori の点には文字の手がかりがある（Minor-3）               |
| 1-3 の `.lockButtonActive`（文字と錠のアイコン）、`.choiceCorrect`（「正解」）、1-4 の hover の下線                                                                                           | 一致                                                                                                      |
| 2-1 の使うファイル数                                                                                                                                                                          | 18部品は一致。**`In` は 1**（`src/lib/fuda-image.tsx` はコメントで参照しているだけ。Minor-2）             |
| 2-2 の要素の数（`<button>` 34 ファイル、`<input>` の種類、`<details>`・`<dialog>`）                                                                                                           | 一致                                                                                                      |
| 3 章の古いトークンの件数（部品・ページの宣言、全10セル）                                                                                                                                      | 一致                                                                                                      |
| 4 章の入力欄の文字の大きさ、`className` で渡すクラスに `font-size` が無いこと                                                                                                                 | 一致                                                                                                      |
| 5 章のフォーカスの規則 19（17）・90（57）、5-4 の7規則                                                                                                                                        | 一致                                                                                                      |
| TSX・TS の `var(--accent…)` がコメントとテストだけにあること                                                                                                                                  | 一致                                                                                                      |

## 指摘

### Major-1: 朱で示していた hover の洗い出しが、`var(--accent)` を含む規則という代理指標に閉じている

T2 の行は「朱や `--accent-weak` で示していた現在地・選択・hover の状態も、着手の前の洗い出しに含める」と定める。しかし次の2種類は、規則の値に `var(--accent)` が無いため拾われていない。

1. **朱の面の明度を `filter`・`opacity` で変えるだけの hover・active（15 規則）**。朱で塗った要素の hover を明度だけで示していた。1-3 は `.colorNameLink:hover` の `opacity` だけに触れている。
   - `Button.module.css` `.variantPrimary:hover:not(:disabled)`・`:active`（`brightness(0.92)`・`0.85`）
   - `FudaActions.module.css` `.saveButton:hover`・`:active`
   - irodori `GameContainer.module.css` `.submitButton:hover`
   - `KanjiKanaru.module.css`・`YojiKimeru.module.css` の `.submitButton:hover`・`:active`（各2）と `.difficultyButtonActive:hover`（各1）
   - nakamawake `GameControls.module.css` `.primaryButton:hover`・`:active`、`WordGrid.module.css` `.selected:hover:not(:disabled)`
   - `NextGameBanner.module.css` `.unplayed:hover`

   HEAD では面が `--ink` になる。`brightness(0.92)` を掛けても、light の `--ink` ではほとんど見分けられない。

2. **全体の `a:hover`（詳細度 0,1,1）だけで朱になっていたリンク**。1-0 はこの仕組みを説明しているが、当たる要素を挙げていない。たとえば `NextGameBanner` の `.gameLink.played` は自前の hover を持たず、hover の手がかりは `a:hover` の朱だけだった（文字の色だけが変わる）。HEAD では手がかりが無い。`.cta2Link` の hover も、変更前は地が `--accent-weak` になるだけでなく、`a:hover` で文字も朱になっていた。1-2 の「変更前の hover」の列はこれを書いていない。

どちらも、T2 の完了の判定「朱で示していた hover が §6 の内側の細いボーダーで見分けられる」の母集団から漏れる。1-2 に加え、`a:hover` の影響を受けたリンクを列挙してほしい。やり方の例: クラスで `text-decoration: none` を持ち、自前の `:hover` の色を持たず、`a:hover` より詳細度が低いリンク。AP-P02 の後段「列挙の網羅性を厳密にしても、測度が問いとずれていれば結論は誤る」に当たる。

### Major-2: 無効の状態が洗い出されていない

T2 の範囲には §6 の**無効**がある。§6 は「明度の差だけで、押せるかどうかを示さない」とも定める。変更前の無効の規則は 19 件（`:disabled`・`.disabled`）ある。どれも `opacity` か色（`--paper-2` の地・`--ink-2` の文字）だけで状態を示していた。
例: `Button` `.button:disabled`、`Pagination` `.disabled`（`opacity: 0.6`）、`ToggleSwitch` `.input:disabled ~ .track`（`opacity: 0.5`）、irodori・kanji-kanaru・yoji-kimeru の `.submitButton:disabled`、nakamawake の `.primaryButton`・`.secondaryButton`・`.wordButton` の `:disabled`、`ImageResizerTile` `.resizeButton:disabled`、`FudaActions` `.saveButton:disabled`・`.shareButton:disabled`、`Input`・`Select`・`Textarea` の `:disabled`、kanji-kanaru・yoji-kimeru の `.inputField:disabled`。
朱のプライマリボタンは、無効のとき朱が薄くなるだけだった。これは「朱の色で示していた状態」そのものである。「色だけで操作や状態を示していた箇所のすべて」を判定するには、この一覧が要る。規則ごとに、理由を文字で添えているかも書いてほしい（§6 の無効は「理由を文字で添える」）。

### Minor-1: 「122 ファイル」が実測と合わない

冒頭の「309 件（122 ファイル）」について。規則ごとに読むと 107 ファイルになる。コメントの中の `var(--accent` まで数える grep でも 112 ファイルで、122 にはならない。数え方を確かめて直してほしい。

### Minor-2: `In` を使うファイルは 1 つ

2-1 は `In` の使う場所を `Tsutsumi`・`src/lib/fuda-image.tsx` の 2 とする。`fuda-image.tsx` は JSDoc の `{@link import("@/components/In").default In}` で触れているだけで、import していない。1 に直してほしい。

### Minor-3: 文字の手がかりがあるものを「色だけ」に入れている

1 章の判定は「色以外の手がかりが同じ状態に無いもの」を「色だけ」とする。1-3 は「固定中」「正解」などの文字を手がかりに数えている。この基準で見ると、次の2つは 1-1 から外れるか、少なくとも文字の手がかりを書くべきである。

- irodori の `.progressDotCurrent`: 点の隣の `.progressText` に `n/N` が出る（`ProgressBar.tsx`）。1-1 の「3つの状態が同じ見え方」は点だけを見たときの話である。
- `EntryRatingButton` の押した状態: ラベルが「おもしろかった」から「おもしろかった!」に変わる。HEAD の列の「押していない状態との差は地の色だけ」は事実と合わない。

### Minor-4: 案が混ざっている

「本書は実測の列挙のみ。案・評価は含まない」としているが、2 章の「DESIGN.md で当たる種類」の列には設計の判断が入っている。

- `SegmentedControl` の「（§6 の役割ではラジオボタン）」
- `ToggleSwitch` の「（§6 の役割ではチェックボックス）」
- `aria-pressed` のボタンの「（§6 の役割ではラジオボタンかチェックボックス）」

これらは、どの §6 の種類に置き換えるかという、T2 の設計で決めることの先取りである。T5a が「§6 のどの種類として組むかを先に決め」「3案以上を比べ」ると定めているのと同じ種類の判断にあたる。2-2「そのほか」の「§6 の『現在地』はナビの項目を指す。§7 は種別の絞り込みを…と定める」と、`.moreButton` の「§7 はページ送りを定める」も、不適合という評価を匂わせる。事実（「DESIGN.md に同名の種類は無い」「役割は radiogroup / aria-pressed」）だけにして、対応づけは計画に移してほしい。

### Minor-5: 範囲の境界が書かれていない

色で状態を示すもののうち、次のものは 1 章に無い。T4（「色で状態を示している面」「GFM Alert」）の受け持ちなら、そう一行書いてほしい。書いていないと、読み手には取りこぼしと区別できない。

- 漢字カナール・四字熟語きめるの判定のマスと凡例（`--wairo-tokiwa`・`--wairo-yamabuki`）
- 分布の強調（`.distributionBarHighlight`）
- 星の評価（`StarRating`）

1-3 に載っている `.markdown-alert-*` と、エラー・注意の文も同じである。これらを T2 で扱うのか T4 で扱うのかを書いてほしい。

### Minor-6: 1-4 の基準が揃っていない

1-4 は「静止時に色も下線も持たないリンク」のうち、変更前の hover が朱だったものだけを挙げている。次の2つが抜けている。

- 同じ形の `.allTypesItem a`：※3 の 8 ファイルと character-fortune の結果のページ。`--ink`・下線なしで、hover は地の `--paper-2` だけ。いまのタイプは 1-3 に載るが、ほかのタイプへのリンクはどこにも載っていない。
- 変更前の `Footer.module.css` の `.link`：`--ink-2`・下線なし。hover で朱と下線。Header の項目は 1-1・1-2 に載せている。

HEAD ではリンクの色が本文と同じ `--ink` になった。そのため、変更前に朱だったかどうかに関係なく、下線を持たないリンクは本文と見分けられない。1-4 の見出しの条件（「朱を使っていない」）どおりに、朱の hover を持たなかったものも載せてほしい。載せないなら、条件を「hover が朱だったもの」と書き直してほしい。Footer は T1 で `FrameLink` に替わったことを書けば足りる。

## PM への指示

1. 上の指摘（Major 2・Minor 6）を、洗い出しの作成者に直させること。
2. 直したら、もう一度レビューを依頼すること。そのときは、今回の指摘だけでなく全体を見直す。
