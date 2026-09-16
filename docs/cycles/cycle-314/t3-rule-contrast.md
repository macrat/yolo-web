# T3: `--rule` トークンのコントラストと WCAG SC 1.4.11 判定

調査日: 2026-09-16 / 対象コミット: `5c8fcba4`（`src/` 凍結下の調査・判定のみ）

## 0. 結論（先出し）

**3:1 を満たす必要がある用途は実在する。CSS 宣言で 8 件、コンポーネントで 4 つ、用途カテゴリで 3 つ。**

| #   | 用途                                                     | 箇所                                                                                          | 件数 | 決め手の層              |
| --- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---- | ----------------------- |
| A   | ToggleSwitch の状態表示（OFF 時のトラックとサム）        | `ToggleSwitch.module.css:51,86`                                                               | 2    | 層1（状態の識別）       |
| B   | 入力欄の境界（共有 `Input` を経由しない自前入力欄 3 つ） | `DictionarySearch.module.css:33` / `YojiKimeru.module.css:272` / `KanjiKanaru.module.css:313` | 3    | 層2（免除に当たらない） |
| G   | ゲーム盤面の空きセル（可視の併記テキストが無い）         | `YojiKimeru.module.css:208` / `KanjiKanaru.module.css:249,206`                                | 3    | 層3（理解に必要）       |

これに加えて **グレーゾーン 2 件**（ThemeToggle のトラック/サム）がある。厳密には副次手掛かりで条文を満たしうるが、実装コメント自身が「主たる手掛かり」と呼ぶサムが 1.43:1 で、根拠が副次手掛かり頼みになっている（§4-D）。

**広告と本文の分離は、現時点で 0 件。広告コンポーネントは実装されていない**（§5）。よって層3 判定は将来の実装に対する事前条件としてのみ意味を持つ。

推奨は **案3（該当 8 件のみ強い罫へ）＋案1（`DESIGN.md` に用途境界を明文化）の併用**。`--rule` そのものの値は動かさない（案2 は全 262 箇所を一斉に濃くし、罫の階層と「静かな帳面」の意匠を壊す。§6 で比較）。

---

## 1. 母集団——`--rule` の使用箇所を悉皆で数える

### 1.1 走査コマンドと総数

```
$ grep -rn "var(--rule)" src/ | wc -l
268
$ grep -rl "var(--rule)" src/ | wc -l
112
```

`--rule-strong` は別トークンであり `var(--rule)` には一致しない（`var(--rule-strong)` は文字列として `var(--rule)` を含まない）。混同は起きていない。

**268 行の内訳を最後まで分解した:**

| 種別                                                    | 件数    |
| ------------------------------------------------------- | ------- |
| CSS 宣言（実際に描画に効く）                            | 260     |
| TSX の `stroke="var(--rule)"`（RadarChart）             | 2       |
| テストの文字列アサーション（`FaqSection.test.tsx:101`） | 1       |
| コメント・ドキュメント行（描画に効かない）              | 5       |
| **合計**                                                | **268** |

描画に効く実使用は **262 件**。以降の分類はこの 262 件を母集団とする。

コメント 5 行の内訳（描画に効かないことの根拠）:
`CrossCategoryBanner.tsx:34` / `TraditionalColorPaletteTile.module.css:7` / `url-encode/UrlEncodeTile.module.css:4` / `unit-converter/UnitConverterTile.module.css:8` / `unix-timestamp/UnixTimestampTile.module.css:13`。

### 1.2 分類方法

CSS 宣言ごとにセレクタを復元し、同ディレクトリの TSX が当該クラスを `<a>` / `<button>` / `<input>` / `<textarea>` / `<select>` のいずれに載せているかを機械的に突き合わせた（スクリプトは `scratchpad/` に一時生成、恒久ファイルは作っていない）。機械分類の結果:

```
static 226 / button 20 / link 11 / input 3   （計 260）
```

この機械分類だけでは、**span で描かれた状態表示（ToggleSwitch のトラック・サム）と盤面セルが `static` に埋もれる**。そこで操作部品・状態表示・グラフィックに当たる候補は 1 件ずつ実装を読んで手で裁定した。以下の分類はその裁定込みである。

### 1.3 用途別の内訳（262 件・悉皆）

| 分類                                                   | 件数    | 内容                                                                 |
| ------------------------------------------------------ | ------- | -------------------------------------------------------------------- |
| **A** 操作部品の**状態表示**                           | 2       | ToggleSwitch のトラック地・サムの縁                                  |
| **B** **入力欄**の境界                                 | 3       | 自前実装の text input 3 つ                                           |
| **G** ゲーム**盤面の空きセル**                         | 3       | yoji-kimeru / kanji-kanaru の未回答セル                              |
| **D** ThemeToggle の状態表示（グレーゾーン）           | 2       | トラックの縁・サムの縁                                               |
| **C** 可視テキストを持つ操作部品の境界                 | 32      | Button・Pagination・SegmentedControl・タグチップ・各種リンクカード等 |
| **E** グラフィカルオブジェクト（可視の併記テキスト有） | 6       | 進捗バー3種・進捗ドット・RadarChart の格子/軸（TSX 2 件を含む）      |
| **F** 区画・一覧・表の罫（UI コンポーネントでない）    | 214     | 区画枠・一覧の行区切り・セクション区切り・表組み                     |
| **合計**                                               | **262** |                                                                      |

F 214 件のうち、**表組み（`table` / `tr` / `th` / `td` / `.row` / `.cell`）に当たるのは 13 件**:
`Shinagaki:43` / `RelatedTools:32` / `dictionary/humor/page:56` / `BlogList:19` / `PlayRecommendBlock:40` / `DictionaryEntryList:22` / `KanjiDetail:86` / `ColorDetail:75`（`.codeTable tr`）/ `ResultCard:335`（`.humorMetricsTable th, td`）/ `ContrarianFortuneContent:137` / `YojiKimeru:208` / `KanjiKanaru:249` / `KeigoReferenceTile:65`。
※ うち `YojiKimeru:208` と `KanjiKanaru:249` は「表の罫」ではなくゲーム盤面のセルなので、上表では G に計上している（重複計上はしていない。F の表組みは実質 11 件）。

**広告と本文の分離: 0 件**（§5 に詳述）。指示にあった 4 分類のうち「広告の分離」だけが母集団に存在しない。

---

## 2. 実測コントラスト（`tmp/contrast.ts` を再実行）

```
$ npx tsx tmp/contrast.ts
===== light =====
--rule         vs --paper    = 1.52:1   [3:1→不足]
--rule         vs --paper-2  = 1.43:1   [3:1→不足]
--rule-strong  vs --paper    = 12.70:1  [3:1→OK]
--ink          vs --paper    = 15.52:1  [3:1→OK]
--ink-2        vs --paper    = 6.93:1   [3:1→OK]
--accent       vs --paper    = 5.79:1   [3:1→OK]
===== dark =====
--rule         vs --paper    = 1.61:1   [3:1→不足]
--rule         vs --paper-2  = 1.49:1   [3:1→不足]
--rule-strong  vs --paper    = 12.21:1  [3:1→OK]
--ink          vs --paper    = 14.26:1  [3:1→OK]
--ink-2        vs --paper    = 7.06:1   [3:1→OK]
--accent       vs --paper    = 6.19:1   [3:1→OK]
```

課題文の実測値と一致した。判定に必要な追加の組み合わせも同じ計算器で出した:

| 組み合わせ                                               | light   | dark    | 3:1  |
| -------------------------------------------------------- | ------- | ------- | ---- |
| `--paper` vs `--paper-2`                                 | 1.06:1  | 1.08:1  | 不足 |
| `--paper` vs `--accent`（ON トラック上のサム）           | 5.79:1  | 6.19:1  | OK   |
| `--rule` vs `--accent`（OFF↔ON のトラック地の差）        | 3.81:1  | 3.84:1  | OK   |
| `--ink-2` vs `--paper-2`（ThemeToggle の非選択アイコン） | 6.53:1  | 6.54:1  | OK   |
| `--ink` vs `--paper-2`（ThemeToggle の選択中アイコン）   | 14.63:1 | 13.21:1 | OK   |
| `--ink` vs `--ink-2`（アイコン濃淡どうしの差）           | 2.24:1  | 2.02:1  | 不足 |
| `--rule-strong` vs `--paper-2`                           | 11.97:1 | 11.31:1 | OK   |

---

## 3. 一次資料の確認（自分で取得した）

```
$ curl -sS "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html" -o wcag1411.html
$ wc -c wcag1411.html   → 198313
$ grep -oic divider    wcag1411.html → 0
$ grep -oic separator  wcag1411.html → 0
$ grep -oic decorative wcag1411.html → 1
$ grep -oic placeholder wcag1411.html → 0
```

**「区切り線は対象外と明記されている」は誤りである。`divider` も `separator` も本文に 0 件で、区切り線を名指しで免除する記述は存在しない。** 区切り線が対象外になるのは「名指しの免除があるから」ではなく、**そもそも User Interface Component でも Graphical Object でもないから**である。理由が違うと、同じ `--rule` でも操作部品に使った瞬間に結論がひっくり返るため、この区別は実務上重要である。

`placeholder` も 0 件。プレースホルダを免除の根拠にする記述は一次資料に無い。

### 3.1 判定に使う 3 層（条文と Understanding の原文）

**層1 — User Interface Components（規範文）**

> Visual information required to identify user interface components **and states**, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author

**層2 — Boundaries の免除（Understanding 本文）**

> This success criterion does not require that controls have a visual boundary indicating the hit area. If a control has visible content (such as text or a sufficiently contrasting icon), which helps users identify **the presence of the control**, then a border or other indication of the overall boundary of the hit area is not required... Having a visual boundary indicating the hit area is only required when there is no other visual way to identify the presence of the control – and in those cases, the boundary must have sufficient non-text contrast.

**免除の射程は「presence（存在）の識別」に限られる。state（状態）の識別は層1 に残る**——ここが本件の分かれ目である。Understanding は状態表示について別立てで要求している:

> For visual information required to identify **a state**, such as the check in a checkbox or **the thumb of a slider**, that part might be within the component so the adjacent color might be another part of the component.
> Figure 4. Pass: A customized checkbox with light grey check (#E5E5E5), which has a contrast ratio of **5.6:1** with the purple box (#6221EA).

**層3 — Graphical Objects（規範文）**

> Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed.

### 3.2 本件に直撃する図版（原文引用）

**トグルスイッチ（Figure 23）——ToggleSwitch の判定そのもの:**

> Figure 23. Pass: The toggle button's internal background (#070CD5) has a good contrast with the external white background. **Also, the round toggle within (#7AC2FF) contrasts with the internal background.**

→ トグルは **(i) トラック vs 外側の地** と **(ii) サム vs トラック** の**両方**が要求される。

**入力欄（Figure 19 / 20 / 33）:**

> Figure 19. Pass: Where a text-input has a visual indicator to show it is an input, such as a bottom border (#767676), **that indicator must meet 3:1 contrast ratio**.
> Figure 20. Pass: Where a text-input has an indicator such as a complete border (#767676), **that indicator must meet 3:1 contrast ratio**.
> Figure 33. Fail: The text input lacks any form of label to hint at its presence. The border color (#AAA) has contrast lower than 3:1 against its adjacent white background. **As the border here is required to identify the presence of the input, it must have sufficient contrast.**

→ Figure 19/20 は**ラベル付き**（"A label with a text input"）の入力欄について、なお「その指標は 3:1 を満たさなければならない」と書いている。入力欄は、空のときに編集領域そのものに可視コンテンツが無く、ラベルは**コントロールの外**にあるため、層2 の免除に乗らない。

**チェックボックス（Figure 26 / 27）——ラベルがあっても枠に contrast を期待している:**

> Figure 26. Pass: A black border on a white background indicates the checkbox.
> Figure 27. Pass: A black border on a white background indicates the checkbox, the black tick shape indicates the state of checked.

---

## 4. 用途ごとの判定

「装飾か構造か」の二択は使わない。下表の「決め手」は必ず 3 層のいずれかを指す。

| #     | 用途                                             | 3:1    | 決め手                             | 理由                                                                                                    |
| ----- | ------------------------------------------------ | ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **A** | **ToggleSwitch の OFF 状態表示**                 | **要** | **層1**                            | 状態の識別。層2 は presence にしか効かない                                                              |
| **B** | **自前入力欄の境界**                             | **要** | **層2 の免除に当たらない**         | 空のとき編集領域に可視コンテンツが無い。Fig.19/20/33                                                    |
| **G** | **ゲーム盤面の空きセル**                         | **要** | **層3**                            | 残り回答数＝盤面構造の理解に必要。可視の併記テキスト無し                                                |
| D     | ThemeToggle の状態表示                           | グレー | 層1                                | 主手掛かり（サム）は 1.43:1 で不足。副次手掛かり（アイコン濃淡）は隣接比 6.5〜14.6:1 で条文は満たしうる |
| C     | 可視テキストを持つ操作部品の境界                 | 不要   | **層2**                            | ボタン・リンク・ページ番号・チップ等に可視テキストあり                                                  |
| C'    | `Button:disabled` の枠（`Button.module.css:86`） | 不要   | **層1 の明示除外**                 | 規範文 "except for **inactive components**"                                                             |
| E     | 進捗バー・進捗ドット・RadarChart                 | 不要   | **層3 に当たらない**               | 同じ情報が可視テキストで併記されている（後述）                                                          |
| F     | 区画・一覧・表の罫                               | 不要   | **層1/層3 のどちらにも該当しない** | 操作部品でなく、また理解に必要なグラフィックでもない                                                    |

### 4-A. ToggleSwitch —— **可視テキストは持つが、それでは免れない**

指示のとおりコードで確認した。**可視テキストは持つ**:

- `src/components/ToggleSwitch/index.tsx:6` — `label: React.ReactNode` は**必須 prop**（optional ではない）
- 同 `:63` — `<span className={styles.labelText}>{label}</span>` として実際に描画される
- `ToggleSwitch.module.css:98` — `.labelText` は視覚的に隠されていない

したがって**層2 により「存在の識別」は免除される**——ここまでは指示の想定（「可視テキストを持たない操作部品なら層2 の免除に当たらない」）とは逆の事実である。

**しかし状態の識別は免除されない。** Figure 23 の 2 条件を実測値で当てると:

| Figure 23 の条件           | 本実装                | light  | dark   | 判定     |
| -------------------------- | --------------------- | ------ | ------ | -------- |
| (i) トラック地 vs 外側の地 | `--rule` vs `--paper` | 1.52:1 | 1.61:1 | **不足** |
| (ii) サム vs トラック地    | `--paper` vs `--rule` | 1.52:1 | 1.61:1 | **不足** |

該当コード（`ToggleSwitch.module.css`）:

```
:46/:51  .track { … background: var(--rule); }                 /* OFF */
:59/:60  .input:checked ~ .track { background: var(--accent); }  /* ON */
:79/:86  .thumb { … border: 1px solid var(--rule); background: var(--paper); }
```

さらに悪いことに、**OFF 時はサムの縁（`--rule`）とトラック地（`--rule`）が同一色**——縁のコントラストは 1.00:1 で、縁は輪郭として一切機能しない。CSS のコメント（`:76-78`）は「トラックとサムの地の対比（`--rule` と `--paper`）+ 罫の縁取りだけで輪郭を示す」と書いているが、その縁取りは OFF 時には存在しないに等しい。

ON 状態は問題ない（`--accent` vs `--paper` = 5.79/6.19、サム vs トラック も同値）。**欠陥は OFF 状態に限局する。**

**来訪者に実際に届いている**（storybook だけではない）:

```
$ grep -rn "<ToggleSwitch" src/ --include=*.tsx
  PasswordGeneratorTile.tsx:202,207,212,217,222  （5 個）
  TextReplaceTile.tsx:193,200,210               （3 個）
  Base64Tile.tsx:195
  SqlFormatterTile.tsx:198
  LineBreakRemoverTile.tsx:182
  StorybookContent.tsx:489,503,512,517
```

公開ツール 5 本・計 11 個。パスワード生成ツールは 5 個のトグルで文字種を選ばせる UI で、**どれが ON でどれが OFF かが読み取れないと出力が予測できない**。来訪者価値への影響がもっとも大きいのはここである。

### 4-B. 入力欄 3 件 —— 共有コンポーネントは無事、自前実装だけが外れている

共有コンポーネントは既に正しい:

```
$ grep -n "border:" src/components/{Input,Textarea,Select}/*.css
Input/…:15     border: 1px solid var(--rule-strong);   → 12.70:1 / 12.21:1
Textarea/…:14  border: 1px solid var(--rule-strong);
Select/…:22    border: 1px solid var(--rule-strong);
```

`DESIGN.md` の意図（「入力欄は罫囲み（`--rule-strong`）」）どおりである。外れているのは共有コンポーネントを経由しない 3 つ:

| 箇所                             | 宣言                            | 可視コンテンツ                                                                |
| -------------------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `DictionarySearch.module.css:33` | `border: 1px solid var(--rule)` | placeholder のみ（`index.tsx:88,91`。`<label>` 要素は無く `aria-label` のみ） |
| `YojiKimeru.module.css:272`      | `border: 2px solid var(--rule)` | placeholder「四字熟語を入力」のみ（`GuessInput.tsx:100-101`）                 |
| `KanjiKanaru.module.css:313`     | `border: 2px solid var(--rule)` | 同上                                                                          |

3 件とも `--rule` を直書きしており、**同じファイル内のコメントが「入力欄は `--rule-strong`」と書いている共有コンポーネントの規約から外れている**（`DictionarySearch.module.css:26` は「罫囲み」とだけ書き、どの罫かを書いていない）。これは WCAG 以前に、体系の取りこぼし＝ツギハギである。

プレースホルダを免除根拠にはできない: 一次資料に `placeholder` は 0 件で、かつプレースホルダは入力が始まると消える。Figure 19/20 は**ラベル付きでも**指標が 3:1 を要ると明言している。

### 4-D. ThemeToggle —— グレーゾーン（断定しない）

コードで確認した事実:

- 可視テキストラベルは**持たない**（`index.tsx:20` のコメントが「テキストラベルは表示しない」と明記）
- 代わりに**可視アイコンを 2 つ持つ**（SunIcon / MoonIcon、`--ink-2` = トラック地に対し 6.53/6.54:1）
- `aria-label` はあるが可視ではない

| 部位                                                 | 実測            | 判定                                                               |
| ---------------------------------------------------- | --------------- | ------------------------------------------------------------------ |
| トラックの縁（`:43` `--rule` vs 外の `--paper`）     | 1.52 / 1.61:1   | **層2 で免除**——十分なコントラストのアイコンが存在を示す           |
| サムの縁（`:93` `--rule` vs トラック地 `--paper-2`） | 1.43 / 1.49:1   | **層1 で問題**——サムは Figure 23 の "round toggle within" に当たる |
| サムの地 vs トラック地（`--paper` vs `--paper-2`）   | 1.06 / 1.08:1   | ほぼ不可視                                                         |
| 副次手掛かり: 選択中アイコン `--ink` vs トラック地   | 14.63 / 13.21:1 | 隣接比としては十分                                                 |

**断定を避ける理由:** `ThemeToggle.module.css:10-11` は「現在状態は**サムの位置を主たる手掛かり**とし、アイコン色の濃淡を副次的な手掛かりとして添える」と自認している。その**主たる手掛かりが 1.43:1** である。一方、副次手掛かり（濃いアイコン）は隣接色に対して 13:1 以上あり、条文（「隣接色に対し 3:1」）は形式的には満たす。ただし濃淡どうしの差は 2.24 / 2.02:1 しかなく、**「どちらのアイコンが濃いか」を読み取れない来訪者には状態が判別できない**。

→ **形式適合は主張できるが、設計意図が破綻している 2 件。** 違反と断定はしない。A/B/G の是正時に同じ是正で拾えるので、併せて直すのが合理的。

### 4-E. 進捗バー等が「要らない」根拠（テキスト併記を実際に確認した）

層3 の免除に逃げていないことを示すため、併記テキストの実在をコードで確認した:

| 箇所                                                | 可視テキスト                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ProgressBar.module.css:26`（クイズ）               | `ProgressBar.tsx:19-21` が `{current} / {total}` を可視 span で描画                             |
| `GameContainer.module.css:20`（irodori 進捗ドット） | `irodori/ProgressBar.tsx:33-37` が `1/5` 等を可視 span で描画                                   |
| `ScienceThinkingResultExtra.module.css:55`          | 同ファイル `.scoreValue` が数値を可視描画                                                       |
| `BmiCalculatorTile.module.css:57`                   | CSS コメント `:50-52` のとおり目盛りラベル（10/18.5/25/30/40/50）と結果テーブル文言が併記       |
| `RadarChart.tsx:142,155`（格子・軸）                | `role="img"` + 軸ラベル。格子線は値の読み取りの補助であり、データ多角形（和色）自体は別トークン |

いずれも**同じ情報が可視テキストで冗長化されている**ため「理解に必要な部分（parts required to understand）」に当たらない。**逆に言えば、G（盤面の空きセル）には併記テキストが無いから結論が変わる**——判定は用途ごとに実際に見て分かれている。

### 4-G. ゲーム盤面の空きセル —— 併記テキストが無い

```
KanjiKanaru.module.css:243  .cellEmpty { border: 2px solid var(--rule); background-color: transparent; }
KanjiKanaru.module.css:204  .guessKanjiEmpty { composes: guessKanji; border-color: var(--rule); }
YojiKimeru.module.css:202   .cellEmpty { border: 2px solid var(--rule); background-color: transparent; }
```

`GuessRow.tsx:44-63`（kanji-kanaru）で、未回答行は `.guessKanjiEmpty` + `.cellEmpty` だけで描かれ、**中身は空**（`aria-label="未回答"` は付くが可視ではない）。つまり**空きセルの唯一の視覚的存在が 1.52 / 1.61:1 の罫**である。

Wordle 型のゲームで「あと何回試せるか」は盤面構造そのもので、**残り試行数は他のどこにも可視表示されていない**。層3 の「理解に必要なグラフィックの部分」に当たる。回答済みセルは和色ベタ塗り（`--wairo-*`）なので問題はなく、**欠陥は空きセルに限局する**。

**判定できなかったこと:** 空きセルが実機でどの程度見えるかの視覚確認は行っていない（本サイクルは `src/` 凍結の調査のみで、スクリーンショット取得を実施しなかった）。数値上は 1.52:1 で、`--paper` 地に対して境界がほぼ判別できない水準である。

---

## 5. 広告と本文の分離 —— **コンポーネントは存在しない**

指示どおり実装の有無を確認した。

```
$ grep -rn "adsbygoogle" src/ --include=*.tsx --include=*.ts --include=*.css
（0 件）
$ grep -rliE "\bad(slot|unit|banner|sense|container)\b|data-ad-client|AdLabel" src/ --include=*.tsx --include=*.ts --include=*.css
src/app/privacy/page.tsx        ← プライバシーポリシーの本文（第三者配信広告の説明文）のみ
$ grep -rn "広告" src/ --include=*.tsx --include=*.css --include=*.ts
globals.css:15,100              ← --paper-2 のコメント「（区画・コード・広告区画）」
StorybookContent.tsx:32         ← トークン一覧の説明文
privacy/page.tsx:137,141,144,150 ← ポリシー本文
```

**広告枠のコンポーネント・広告ラベル・`--paper-2` の広告区画は、いずれも実装されていない。** `DESIGN.md:124` の規定は仕様のみで、対応する `--rule` の使用箇所は **0 件**である（`DESIGN.md:111` 自身が「導出済み仮説」と位置づけ、`§9` は「AdSense 前提の**先行**設計」と題している。未実装と読める記述は事実だった）。

**将来実装したときの層3 判定（事前条件として記録）:**

広告と本文の分離は **層3（Graphical Objects）に当たる**。理由は 3 つで、いずれも今回の他の用途とは条件が異なる:

1. **「これは広告だ」という理解は、区画の境界が担う情報そのものである。** 層1 ではない——広告枠は操作部品ではない。層3 の「理解に必要な部分」に該当する。
2. **`DESIGN.md:68` が影（box-shadow）を原則禁止しているため、境界を示す代替手段が罫しかない。** 通常のサイトなら影や余白で面を分離できるが、本サイトの意匠ではそれが封じられている。
3. **地の差では代替できない。** `--paper` vs `--paper-2` は **1.06 / 1.08:1** で、面の切り替わりは事実上見えない。つまり `DESIGN.md:124` が定める「`--paper-2` の区画+罫」のうち、**区画の地は分離にほぼ寄与しておらず、分離は罫が単独で担っている**。その罫が `--rule`（対 `--paper-2` で 1.43 / 1.49:1）だと、**広告ラベルの文字だけが分離の手掛かりになる**。

ただし 3 つ目には留保がある。「広告」ラベル（可視テキスト）が併記されるなら、§4-E と同じ論法で「罫は理解に必要な唯一の手段ではない」と言える余地がある。**ラベルの可視性・位置・サイズが決まらないと最終判定はできない。** 現時点では「層3 に当たる蓋然性が高く、`--rule` のままだと分離がラベル文字のみに依存する」までが言えることで、**断定は実装時まで保留する**。

---

## 6. 是正案の比較（4 案・来訪者価値の観点）

### 案1: `DESIGN.md` の位置づけを変える（用途境界を明文化）

`--rule` を「**非操作部品の区切り専用**」と定義し直し、操作部品の状態表示・入力欄の境界・盤面セル・広告分離には `--rule-strong` を使うと `DESIGN.md §2`／`§4` に明記する。トークン値は動かさない。

- **来訪者価値**: 単独では**ゼロ**。文書を直しても画面は変わらない。
- **意義**: 再発防止。共有 `Input` は既に `--rule-strong` で正しく、外れたのは自前実装 3 件——**規約が「入力欄は `--rule-strong`」と書いてあるのに `--rule` が選ばれ続けている**のは、`DESIGN.md:68` の「構造の主役は `1px solid var(--rule)`。区画・品書きの区切り・表・**広告の分離**、すべて罫で組む」が包括的すぎて、操作部品もこれで組んでよいと読めるため。ここを直さないと同じ取りこぼしが再発する。
- **判定**: 単独では不可。ただし**他案と併用すれば必須**。

### 案2: `--rule` の値そのものを 3:1 まで引き上げる

3:1 を両方の地（`--paper` と `--paper-2`）に対して満たす境界を数値的に解いた:

```
light: L <= 0.635   dark: L >= 0.524
```

**変更後の全組み合わせ再計算**（`--rule` = `oklch(0.635 0.008 85)` / `oklch(0.53 0.008 80)`）:

| 組み合わせ                   | light      | dark       | 3:1                                 |
| ---------------------------- | ---------- | ---------- | ----------------------------------- |
| `--rule` vs `--paper`        | **3.19:1** | **3.29:1** | OK                                  |
| `--rule` vs `--paper-2`      | **3.01:1** | **3.05:1** | OK                                  |
| `--rule` vs `--ink`          | 4.86:1     | 4.33:1     | OK                                  |
| `--rule` vs `--ink-2`        | 2.17:1     | 2.14:1     | 不足                                |
| `--rule` vs `--rule-strong`  | 3.98:1     | **3.72:1** | OK（ただし現行 8.35/7.57 から半減） |
| `--rule` vs `--accent`       | 1.81:1     | 1.94:1     | 不足                                |
| `--rule-strong` vs `--paper` | 12.70:1    | 12.21:1    | 変化なし                            |
| `--paper` vs `--accent`      | 5.79:1     | 6.19:1     | 変化なし                            |

- **来訪者価値**: A/B/G/D の 10 件すべてが一撃で解消する。
- **代償が大きすぎる**: **262 箇所すべてが一斉に濃くなる。** `--rule` は 112 ファイル・214 件が区画枠と一覧の行区切りに使われており、そのすべてが現在の 1.52:1 から 3.19:1（light で約 2 倍のコントラスト）になる。`DESIGN.md §2` の意匠（生成りの紙・静かな帳面）と `§4`「構造の主役は罫」は、**罫が控えめであることを前提にした設計**である。全罫が濃くなるとワイヤーフレーム／表計算ソフトの見た目に寄り、`§8` が禁じる AI slop とは別方向だが、意匠の破壊としては同格の変更になる。
- **さらに罫の階層が壊れる**: `--rule` と `--rule-strong` の差が dark で 7.57:1 → **3.72:1** に縮む。`DESIGN.md:34` が `--rule-strong` を「強い罫（のれん罫・区切りの**主格**）」と定義している以上、主格と平の罫が見分けにくくなるのは体系の劣化である。
- **判定**: **採らない。** 実在欠陥 10 件のために無関係な 252 件を巻き添えにする。

### 案3: 該当箇所だけ `--rule-strong` に差し替える

A(2) + B(3) + G(3) = **8 件**、D を含めても **10 件**。`--rule-strong` は `--paper` に対し 12.70 / 12.21:1、`--paper-2` に対し 11.97 / 11.31:1 で、**3:1 を大きく超える**。

- **来訪者価値**: 欠陥が実在する箇所だけが直り、残る 252 件の意匠は無傷。**入力欄 3 件については、共有 `Input`/`Textarea`/`Select` が既に `--rule-strong` である体系に合流させるだけ**で、新しい判断を持ち込まない＝ツギハギを増やさない。
- **注意点（B/G は問題ないが、A は検討が要る）**: ToggleSwitch の **OFF トラックの「地」に `--rule-strong` を当てると、ほぼ黒（12.70:1）のベタ塗りになる**。OFF のほうが ON（`--accent` 朱・5.79:1）より重く見え、「消えている」の意味が反転しかねない。ここは地ではなく**サムの縁と、トラックの輪郭線**で解くほうが素直である（例: トラックを `--paper` 地 + `--rule-strong` の枠にし、サムを `--rule-strong` の塗りにする）。**具体形は実装時に視覚検証で決めるべきで、机上で確定させない。**
- **判定**: **推奨。** ただし A の具体形は視覚検証必須。

### 案4: 中間トークン `--rule-control` を新設する

3:1 をわずかに超える中間の罫（`oklch(0.60 0.008 85)` / `oklch(0.56 0.008 80)`）を新設し、操作部品・状態表示・盤面にのみ使う。**変更後の全組み合わせ再計算**:

| 組み合わせ                          | light  | dark   | 3:1  |
| ----------------------------------- | ------ | ------ | ---- |
| `--rule-control` vs `--paper`       | 3.67:1 | 3.76:1 | OK   |
| `--rule-control` vs `--paper-2`     | 3.46:1 | 3.49:1 | OK   |
| `--rule-control` vs `--ink`         | 4.22:1 | 3.79:1 | OK   |
| `--rule-control` vs `--ink-2`       | 1.89:1 | 1.88:1 | 不足 |
| `--rule-control` vs `--rule`        | 2.41:1 | 2.33:1 | —    |
| `--rule-control` vs `--rule-strong` | 3.46:1 | 3.24:1 | OK   |
| `--rule-control` vs `--accent`      | 1.58:1 | 1.64:1 | 不足 |

- **来訪者価値**: 案3 と同じ 8〜10 件が直り、かつ `--rule-strong`（12:1・ほぼ黒）より**柔らかく**当てられる。ToggleSwitch の OFF トラックを塗っても黒ベタにならない。
- **代償**: 罫のトークンが 3 段（`--rule` / `--rule-control` / `--rule-strong`）になる。`DESIGN.md §2` の色表が増え、「どれを使うか」の判断が 1 段増える。**取りこぼしが起きた原因が「規約が包括的すぎて選択を誤る」ことだった以上、選択肢を増やす方向は再発リスクを上げる。**
- **判定**: **次善。** 案3 で視覚的に不都合（黒ベタ問題）が出た場合の受け皿として持っておく。

### 推奨

**案3 ＋ 案1 の併用。** 案3 で実在する 8 件（＋グレーゾーン 2 件）を直し、案1 で `DESIGN.md` の用途境界を明文化して再発を止める。案3 の実装で ToggleSwitch の見た目が破綻する場合に限り、案4 の `--rule-control` へ切り替える。**案2 は採らない。**

---

## 7. 本サイクル（`src/` 凍結）でできること／できないこと

### できること（`src/` に触れない）

1. **本ドキュメント**——母集団 262 件の悉皆分類、3 層判定、実在欠陥 8 件＋グレーゾーン 2 件の特定。**完了。**
2. **`DESIGN.md` の用途境界の明文化（案1）。** `DESIGN.md` は `src/` 配下ではないため凍結対象外。ただし本 T3 の一存で正典を書き換えるべきではなく、**案3 の視覚検証の結果と合わせて一度に直す**ほうがツギハギを避けられる（`§8` の「文書のツギハギ禁止」）。→ **起票側に寄せる。**
3. **ADR 起票。** `--rule` の位置づけ変更は `docs/ADR/` の対象になりうる決定である。

### できないこと（`src/` の変更が必要）

以下は **backlog 起票**として提案する。

---

**起票案 1: ToggleSwitch の OFF 状態が WCAG SC 1.4.11 を満たしていない（公開ツール 5 本・11 個に影響）**

- 内容: OFF 時にトラック（`--rule`）が地（`--paper`）に対し 1.52/1.61:1、サム（`--paper`）がトラックに対し 1.52/1.61:1、さらにサムの縁とトラック地が同一色で 1.00:1。Understanding Figure 23 が要求する 2 条件の両方を満たさない。ON 状態は問題なし。
- 対象: `src/components/ToggleSwitch/ToggleSwitch.module.css:51,86`
- 影響: password-generator(5) / text-replace(3) / base64 / sql-formatter / line-break-remover
- **着手条件**: 案3（`--rule-strong`）と案4（`--rule-control` 新設）の両方を試作し、**take-screenshot スキルで light/dark 両テーマの ON/OFF 4 状態を実見**して決めること。OFF が ON より重く見える反転が起きていないことを確認するまで確定しない。優先度は本件が最も高い（来訪者が触る操作部品で、状態が読めないと出力が予測できない）。

**起票案 2: 自前実装の入力欄 3 件が共有 `Input` の規約（`--rule-strong`）から外れている**

- 内容: `DictionarySearch.module.css:33`（1px）/ `YojiKimeru.module.css:272`（2px）/ `KanjiKanaru.module.css:313`（2px）が `--rule` を直書き。共有 `Input`/`Textarea`/`Select` は `--rule-strong`（12.70/12.21:1）で正しい。Understanding Figure 19/20/33 より、入力欄の境界指標は 3:1 必須。
- **着手条件**: なし（単純な合流）。3 ファイルそれぞれ別タスクに分割して着手すること（CLAUDE.md「Keep task smaller」）。視覚差分の確認は必要だが、判断は共有コンポーネントに合わせるだけで新たな設計判断を含まない。

**起票案 3: ゲーム盤面の空きセルが視認できない（yoji-kimeru / kanji-kanaru）**

- 内容: `.cellEmpty` / `.guessKanjiEmpty` の 2px `--rule` 罫が空きセルの唯一の視覚的存在で 1.52/1.61:1。残り試行数は他に可視表示が無く、層3（理解に必要なグラフィック）に当たる。
- 対象: `YojiKimeru.module.css:208` / `KanjiKanaru.module.css:249,206`
- **着手条件**: **先に実機スクリーンショットで「盤面が何行あるか見えるか」を確認する**こと。本 T3 では視覚確認を行っていないため、数値上の不足のみを根拠にしている。2 ゲームは別タスクに分けること。

**起票案 4: ThemeToggle の状態手掛かりがサムからアイコン濃淡へ実質的に移っている**

- 内容: 実装コメントが「主たる手掛かり」と呼ぶサムの縁が 1.43/1.49:1、サム地とトラック地の差が 1.06/1.08:1。条文は副次手掛かり（アイコン `--ink` が 14.63/13.21:1）で満たしうるためグレーゾーンだが、設計意図と実装が乖離している。
- 対象: `src/components/ThemeToggle/ThemeToggle.module.css:43,93`
- **着手条件**: 起票案 1 の結論が出た後に、同じ流儀で直すこと（トグル 2 種の見た目を別々に決めない）。単独先行は不可。

**起票案 5: `DESIGN.md` の `--rule` の位置づけを「非操作部品の区切り専用」に改める**

- 内容: `DESIGN.md:68`「構造の主役は `1px solid var(--rule)`。区画・品書きの区切り・表・広告の分離、すべて罫で組む」が包括的すぎ、操作部品・状態表示・入力欄・盤面にも `--rule` が選ばれる原因になっている。用途境界を明記し、`§2` の色表に「操作部品・状態表示には使わない」を追記する。あわせて `§10` の品質バーに非テキスト 3:1 を追加する（現在は「コントラスト AA（4.5:1）以上」としか書かれておらず、SC 1.4.11 の 3:1 が品質バーに存在しない）。
- **着手条件**: 起票案 1〜3 の是正方針（`--rule-strong` か `--rule-control` か）が確定してから、**一度の書き換えで完成状態にする**こと。先行して書くと、後で値が決まったときに二度書きになりツギハギを生む。

**起票案 6: 広告枠を実装する際の非テキストコントラスト事前条件**

- 内容: 広告コンポーネントは現在 0 件。実装時、`--paper` と `--paper-2` の差は 1.06/1.08:1 しかなく面の分離に寄与しないため、分離は罫が単独で担う。`--rule` のままだと分離の手掛かりが「広告」ラベルの文字のみになる。`DESIGN.md:68` が影を禁じている以上、代替手段は無い。
- **着手条件**: 広告枠の実装を始めるとき。**着手時に、ラベルの可視性・位置・サイズを決めたうえで層3 判定を確定させる**こと（本 T3 では実装が無いため断定を保留した）。

---

## 8. 凍結の確認

```
$ git diff --stat 967d684 HEAD -- src/
（出力なし）
```

本 T3 で `src/` は一文字も変更していない。作成したのは本ドキュメント 1 ファイルのみ。計算用の一時スクリプトはスクラッチパッドに置き、リポジトリには追加していない（`tmp/contrast.ts` は既存のものを再実行しただけで、改変していない）。
