# T3 レビュー——`--rule` トークンのコントラスト判定

レビュー日: 2026-09-16 / 対象: [t3-rule-contrast.md](./t3-rule-contrast.md)（450行）/ 対象コミット: `d630f57a`

## 判定

**改善指示（REJECT）。**

| 重大度   | 件数   |
| -------- | ------ |
| 重大     | 4      |
| 重要     | 6      |
| 中程度   | 7      |
| 軽微     | 2      |
| **合計** | **19** |

核心の判定（A/B/G/D の3:1不足）は正しい。一次資料の読みも正しい。**しかし「悉皆」という文書最大の売りが成立していない**——色見本（swatch）群という一分類が丸ごと判定の外に落ち、可視テキストを持たない `<button>` が「可視テキストあり」の免除枠に入っている。加えて `DESIGN.md` の内容についての事実誤りと、本サイクル T5 との切り分け誤りがある。

---

## 0. PM の問いへの直接の回答

**A. 来訪者価値。**

- ToggleSwitch の規模「公開ツール5本・トグル11個」は**正しい**（§1 で実測）。欠陥も実見で確認した。
- ただし**被害の機序の説明が誤っており、最悪ケースを取り違えている**（M4）。password-generator は ON が朱・OFF が淡灰で判別は容易。実際に成立するのは base64 と line-break-remover の**単独 OFF トグル**。
- **過剰に問題視している箇所**: 起票案3 の表題「盤面の空きセルが視認できない」（M1）。実見すると faint だが判別できる。
- **より大きいのは逆方向（過小評価）**: 色見本7件以上が判定されていない（C1/C2）。F=214 を一行で不問にした根拠が示されていない（M6）。

**B. §4-A の論理。** **読みは正しい。免除の射程を狭く取りすぎても広く取りすぎてもいない。** 一次資料に直接の裏付けがある（m4 に逐語を掲げた）。ただし現状の文書は Figure 23（Pass 例）からの推論で支えており、規範的記述の直接引用を落としている。「サムの縁とトラック地が同一色で 1.00:1」は実装と一致（C2 の実装確認参照）。分類 C の免除は**甘い**（C2）。E と G の線引き自体は**恣意的でない**（E の4件・G の2件とも実コードで裏が取れた）が、**その線引きが色見本に一度も適用されていない**（C1）。

**C. 数値。** 262 の内訳合計は一致。§2 の実測値は独立実装で**全件一致**。案4 の表も全件一致。**案2 の dark 列だけ再現しない**（m1）。表組みの列挙は 13 ではなく 14（M5）。

**D. 案の比較。** 案2 却下の主根拠（252件の巻き添え）は妥当。副根拠（「階層が壊れる」）は過大（m2）。**比較が「据え置き or 3:1 まで跳躍」の二択に閉じており、中間案が未評価**（M6）。案3 の視覚リスク評価が ToggleSwitch に偏り盤面を見落としている（M2）。

**E. 起票6件。** **切り分けが誤っている。** 起票案5 は本サイクル T5 の射程に入る（C4）。

---

## 重大（4件）

### C1. 悉皆分類の取りこぼし——色見本（swatch）群が層3 判定を一度も受けていない

`--rule` を輪郭に使った**色見本が最低 8 宣言**ある。いずれも A/B/G/D/E のどれでもないので、消去法で F（「区画・一覧・表の罫（UI コンポーネントでない）」）に入っている。**色見本は区画でも一覧でも表でも罫でもない。**

```
$ grep -iE "swatch|colorDot|previewPatch" scratchpad/sel2.txt
src/app/storybook/page.module.css:111:                          [.swatch] border: 1px solid var(--rule);
src/dictionary/_components/DictionaryEntryList/DictionaryEntryList.module.css:58: [.swatch] border: 1px solid var(--rule);
src/dictionary/_components/color/ColorDetail.module.css:22:                  [.swatch] border: 1px solid var(--rule);
src/dictionary/_components/color/ColorDetail.module.css:167:                 [.relatedSwatch] border: 1px solid var(--rule);
src/play/games/irodori/_components/HslSliders.module.css:96:                 [.previewPatch] border: 1px solid var(--rule);
src/play/quiz/_components/TraditionalColorContent.module.css:174:            [.colorDot] border: 1px solid var(--rule);
src/tools/traditional-color-palette/TraditionalColorPaletteTile.module.css:54:  [.swatch] border: 2px solid var(--rule);
src/tools/traditional-color-palette/TraditionalColorPaletteTile.module.css:167: [.paletteColorSwatch] border: 1px solid var(--rule);
```

サイト自身のコードが「これは層3 の対象だ」と書いている:

- `TraditionalColorContent.module.css:165-166`: 「桜色等の**極淡色がリスト背景に溶け込まない**よう、light/dark それぞれで控えめな枠線を入れる。**色見本は装飾ではなく診断内容**」
- `ColorDetail.module.css:13-14`: 「**色見本（成果物＝色そのもの・主役）**: 大きな色面。…器は直角の帳面（角丸 0）＋**一本罫で囲む**」
- `DictionaryEntryList.module.css:49-50`: 「色見本（colors のみ）: **成果物の中身**＝和色（§2 の唯一の例外）。**罫で囲った小さな升**として出し」

つまり罫の仕事は「区切り」ではなく「グラフィックの輪郭」であり、CSS コメント自身が「淡色が地に溶けるのを防ぐため」と目的まで書いている。その罫が 1.52 / 1.43:1 では、書いてある目的を果たしていない。

**実見（本レビューで取得）:**

- `tmp/screenshots/rv-gofun-light_900x420+190+120.jpg` — `/dictionary/colors/gofun`（胡粉 `#fffffb`）light。200px×幅いっぱいの色見本の輪郭がほぼ判別できない。
- `tmp/screenshots/rv-kuro-dark_900x380+190+120.jpg` — `/dictionary/colors/kuro`（黒 `#080808`）dark。同じく輪郭が消える。

§4-E の枠（層3＋併記可視テキスト）を当てれば「色名が併記されているから免除」と結論しうる余地はある。**問題は結論ではなく、検討が一度も行われていないこと**である。文書は E（6件）に対しては「併記テキストの実在をコードで確認した」と丁寧に裏を取りながら、同じ性質の色見本群には枠を当てていない。E と F の境界が機能していない証拠であり、F=214 の残りも同様に信頼できない。

### C2. 可視テキストを持たない `<button>` が C（可視テキストありで免除）に入っている

`src/tools/traditional-color-palette/TraditionalColorPaletteTile.tsx:299-311`:

```tsx
<button
  type="button"
  className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ""}`}
  style={{ backgroundColor: color.hex }}
  aria-label={`${color.name} (${color.hex})`}
>
  <span className={styles.swatchTooltip}>
    {color.name} {color.hex}
  </span>
</button>
```

`.swatchTooltip` は `opacity: 0`（`TraditionalColorPaletteTile.module.css:93`）で、hover まで不可視。`aria-label` も不可視。**この `<button>` の可視内容は背景色だけ**で、枠は `border: 2px solid var(--rule)`（同 `:54`）。

一次資料（Boundaries・自分で取得した本文 `wcag.txt:53`）:

> Having a visual boundary indicating the hit area is **only required when there is no other visual way to identify the presence of the control** – and in those cases, the boundary must have sufficient non-text contrast in order to pass this success criterion.

淡色の swatch では色面自体が presence を示さない。よって枠が唯一の presence 指標になり、1.52 / 1.61:1 では層2 の免除に乗らない。**これは B（入力欄3件）と同じ構造の 9 件目の候補**である。

§4 の C 行は「ボタン・リンク・ページ番号・チップ等に可視テキストあり」と**カテゴリ単位で断定**しており、32件を1件ずつ見ていない。§1.2 は「操作部品・状態表示・グラフィックに当たる候補は 1 件ずつ実装を読んで手で裁定した」と書いているが、この1件は裁定を通っていない。**PM の問い「C の免除判定が甘くないか」への答えは「甘い」。**

### C3. `DESIGN.md` の内容についての事実誤り

§4-B 冒頭:

> `DESIGN.md` の意図（「入力欄は罫囲み（`--rule-strong`）」）どおりである。

§6 案1:

> **規約が「入力欄は `--rule-strong`」と書いてあるのに `--rule` が選ばれ続けている**のは、`DESIGN.md:68` の…が包括的すぎて

実測:

```
$ grep -n "入力欄" DESIGN.md
69:- **角丸**: **0px 基調**（帳面・棚の直角）。例外は2つだけ——値札ラベルと入力欄の `2px`。…
$ grep -n "rule-strong" DESIGN.md
34:| `--rule-strong` | `oklch(0.30 0.01 80)` | `oklch(0.88 0.005 90)` | 強い罫（のれん罫・区切りの主格） |
70:- **のれん（ヘッダ）**: 店号（サイト名・明朝）+ 下に一本の `--rule-strong` 罫。…
```

**`DESIGN.md` に「入力欄は `--rule-strong`」という記述は存在しない。** 69行目は角丸 2px の例外の話で、色には触れていない。引用された文字列は `src/components/Input/Input.module.css:2` のコメント逐語（`Textarea`/`Select` にも同文）である。

これは §3 が自ら訂正した誤り（「区切り線は対象外と**明記されている**」と書いて誤りだった）と**同型**を、今度は `DESIGN.md` に対して犯している。文書自身が「理由が違うと結論がひっくり返るため、この区別は実務上重要である」と書いた直後に、同じ種類の誤帰属をしている。

**帰結が実質的である。** 案1 の因果説明（「規約に書いてあるのに守られない ← `DESIGN.md:68` が包括的すぎるから」）は前提から崩れる。実際の原因は「入力欄の罫の規約が**共有コンポーネントのコメントにしか無く、正典に無い**」であり、是正の形が変わる——`DESIGN.md:68` の文言を絞るだけでは足りず、**正典に新規に書き起こす**必要がある。

### C4. 本サイクルでできる／できないの切り分けが誤っている——`DESIGN.md` は本サイクルで書き直される

§7 は「`DESIGN.md` は `src/` 配下ではないため凍結対象外」と正しく認識しながら、案1 を「起票側に寄せる」（起票案5・着手条件「起票案 1〜3 の是正方針が確定してから」）としている。

しかし `index.md` の未完了タスクに **T5 がある**:

```
- [ ] T5: `DESIGN.md` を T4 から**§単位**に再導出する。§1〜§11 の**節番号と主題は保存する**。各 § ごとにレビューを受ける
```

つまり `DESIGN.md` の §2（トークン表）・§4（罫の規定）・§10（品質バー）は、**本サイクル中に書き直される**。起票案5 を次サイクル以降へ送ると、**T5 が作った「最初からそう書かれていたかのように読める単一 coherent 状態」に既知の欠落を残したまま出し、後日パッチを当てる**ことになる。これは CLAUDE.md「No patchwork」と本サイクルの目的（B-651）に正面から反する。

しかも**待つ必要がない**:

- 用途境界の文言（「`--rule` は非操作部品の区切り専用。操作部品・状態表示・入力欄・盤面・広告分離には使わない」）は、置換先が `--rule-strong` か `--rule-control` かに**依存しない**。
- §10 品質バーへの非テキスト 3:1 の追加も依存しない。現状の §10（`DESIGN.md:130`）は「コントラスト AA（4.5:1）以上」としか書いておらず、**SC 1.4.11 の 3:1 が品質バーに存在しない**——起票案5 自身がそう指摘している。

§7 は「先行して書くと、後で値が決まったときに二度書きになりツギハギを生む」と理由を述べるが、**二度書きになるのは T5 の側**である。T3 は T5 に渡す入力（用途境界の文案・品質バーの追記案）を本サイクル中に出すべきで、それは `src/` 凍結に抵触しない。

---

## 重要（6件）

### M1. 起票案3 の表題が、同じ文書の自己申告と矛盾する断定

- 起票案3 表題: 「**ゲーム盤面の空きセルが視認できない**（yoji-kimeru / kanji-kanaru）」
- §4-G: 「**判定できなかったこと:** 空きセルが実機でどの程度見えるかの**視覚確認は行っていない**（本サイクルは `src/` 凍結の調査のみで、スクリーンショット取得を実施しなかった）」

視覚確認をしていないと明記した直後に、視覚的事実（「視認できない」）を起票の表題に置いている。

**実見（本レビューで取得。`tmp/shot.ts` で HowToPlay モーダルを閉じてから撮影）:**

- `tmp/screenshots/rv-yoji-light_700x600+300+350.jpg`（light）
- `tmp/screenshots/rv-yoji-dark_700x600+300+350.jpg`（dark）

両テーマとも、2px `--rule` の空きセルは**faint だが判別できる**。6行×4列の盤面構造は読み取れる。「視認できない」は測定にも実見にも裏付けがない。言えることの上限は「低コントラストで、低視力の来訪者には読み取りにくい」。

検証していない断定を起票の表題に置くと、次の担当者が優先度を誤る（AP-WF12 / AP-P02）。**なお `src/` 凍結はスクリーンショット取得を妨げない**——撮影は読み取りであって変更ではない。「凍結だから撮らなかった」という §4-G の理由づけ自体が成り立たない。

### M2. 案3 の視覚リスク評価が ToggleSwitch に偏り、盤面（2px × 数十セル）を見落としている

§6 案3 は「注意点（B/G は問題ないが、A は検討が要る）」として ToggleSwitch の黒ベタ問題だけを挙げ、**G は「問題ない」と断じている**。

`--rule-strong` は light で 12.70:1（ほぼ黒）。これを **2px** で yoji-kimeru（6行×4セル=24）・kanji-kanaru（6行×7セル=42）に当てると、方眼紙／表計算ソフトの見た目になる。**これは案2 を却下した理由そのもの**である:

> 全罫が濃くなるとワイヤーフレーム／表計算ソフトの見た目に寄り、`§8` が禁じる AI slop とは別方向だが、意匠の破壊としては同格の変更になる。

同じ懸念が、同じ文書の推奨案に適用されていない。しかも起票案の着手条件が非対称:

- 起票案1（ToggleSwitch）: 「案3 と案4 の**両方を試作**し、take-screenshot で light/dark の ON/OFF **4状態を実見**」「OFF が ON より重く見える反転が起きていないことを確認するまで確定しない」
- 起票案3（盤面）: 「**先に**実機スクリーンショットで『盤面が何行あるか見えるか』を確認する」——**是正後の見え方を確認する条件が無い**

同種のリスクに対する検証強度を、結論の重さで変えている（AP-P02「検証の非対称」）。

### M3. 来訪者価値の測度が「箇所数」に閉じており、PV による重み付けがない

§4-A は「**来訪者価値への影響がもっとも大きいのはここである**」と断定するが、根拠は「公開ツール 5 本・計 11 個」という**実装側の数**だけである。password-generator / base64 / yoji-kimeru / 伝統色辞典のどれが実際に見られているかを一度も見ていない。

CLAUDE.md:

> **Check Google Analytics**: Always check Google Analytics data before making any decisions that may impact user experience or traffic.

優先度を決める文書（起票案1 に「優先度は本件が最も高い」と書いている）でこれを飛ばしている。**箇所数は来訪者価値の代理指標として弱い**——AP-P02 が名指しする「厳格さの演出（悉皆列挙）が、測っている測度が問いとずれていることを隠す」形である。

（本レビュー環境では GA 認証情報が無く代行できなかった: `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts` → `Unable to detect a Project Id in the current environment.`。PM 側での実行が必要。）

### M4. 被害の機序の説明が実態と合っておらず、最悪ケースを取り違えている

§4-A:

> パスワード生成ツールは 5 個のトグルで文字種を選ばせる UI で、**どれが ON でどれが OFF かが読み取れないと出力が予測できない**。

**実見すると、password-generator では ON/OFF の判別は容易**である（`tmp/screenshots/2026-09-16T12-54-35_..._password-generator_w1280_600x300+180+300.jpg` / 同 `_dark_...`）。ON は朱のトラック、OFF は淡灰。文書自身が §2 で `--rule` vs `--accent` = 3.81 / 3.84:1 と測っている。さらに既定値は 4 ON / 1 OFF なので、常に比較対象が画面にある:

```
$ sed -n '17,24p' src/tools/password-generator/logic.ts
export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16, uppercase: true, lowercase: true, digits: true, symbols: true,
  excludeAmbiguous: false,
};
```

**機序が実際に成立するのは単独 OFF トグル**である:

```
$ grep -n "useState(false)" src/tools/base64/Base64Tile.tsx
109:  const [urlSafe, setUrlSafe] = useState(false);
$ grep -n "mergeConsecutive.*useState" src/tools/line-break-remover/LineBreakRemoverTile.tsx
114:  const [mergeConsecutive, setMergeConsecutive] = useState(false);
```

`tmp/screenshots/2026-09-16T12-52-37_..._base64_w1280_260x60+195+300.jpg` で確認すると、比較対象のない淡灰の矩形は「スイッチである」ことも「OFF である」ことも伝えず、読み込み中のプレースホルダに見える。dark では サムが `--paper`（トラックより暗い）になり、さらに読めない。

**結論（A は 3:1 不足）は変わらないが、是正の設計が変わる**——「どの状態を基準に見た目を決めるか」は、単独 OFF が成立することを前提にしないと誤る。文書が「最大」と名指ししたツールが最悪ケースではない。

### M5. 262件の分類が再現不能で、列挙された部分にすでに漏れがある

§1.2:

> スクリプトは `scratchpad/` に一時生成、**恒久ファイルは作っていない**

文書には F=214 の内訳が無く（表組み13件のみ列挙）、分類の全件表も無い。つまり**この文書の中心的な成果である 262 件の分類を、次サイクルは検証できない**——ゼロから再導出するしかない。

そして**列挙された部分にすでに漏れがある**。§1.3:

> F 214 件のうち、**表組み（`table` / `tr` / `th` / `td` / `.row` / `.cell`）に当たるのは 13 件**

実測は 14 件:

```
$ grep -iE "\[[^]]*(table|tr\b|th\b|td\b|row|cell)" sel2.txt | wc -l
14
```

欠けているのは:

```
src/app/blog/[slug]/page.module.css:187: [.prose th, .prose td] border: 1px solid var(--rule);
```

**全ブログ記事の Markdown 表の罫**——サイト内で最も多くの来訪者の目に触れる表組みである。`th` / `td` という、文書自身が挙げた検索語に literal に一致する。

（機械分類の「button 20」も再現できなかった。セレクタ名だけで button と分かるものが 22 件あり、`.swatch`（実体は `<button>`）と `.variantDefault` を加えるとさらに増える。スクリプトが残っていないため差の原因を特定できない。）

**是正**: 分類結果の全件表（`ファイル:行 → 分類`）を文書に載せるか、スクリプトを `scripts/` に残すこと。列挙できる部分の精度がこれなら、列挙していない 214 件は信頼の対象にならない。

### M6. 「3:1 を満たすか」という測度が、PM の問い（来訪者の何を損なっているか）と一致していない

文書は F=214（母集団の 82%）を、§4 の1行で処理している:

> F 区画・一覧・表の罫 | 不要 | **層1/層3 のどちらにも該当しない** | 操作部品でなく、また理解に必要なグラフィックでもない

8 件には数ページを割き、214 件には1行。**しかも文書自身が、その1行を疑うべき事実を §5 で書いている**:

> **地の差では代替できない。** `--paper` vs `--paper-2` は **1.06 / 1.08:1** で、面の切り替わりは事実上見えない。つまり…**区画の地は分離にほぼ寄与しておらず、分離は罫が単独で担っている**。

この事実は**将来の広告枠だけでなく、いま実装されている区画枠すべてに当てはまる**。同じ数値から、結論は「将来の広告は問題」で止まり、「現在の区画はどうか」へは進まない。**作業の増える方向にだけ結論を止めている**（AP-P02「留保の選択的適用」）。

**実見**: `tmp/screenshots/2026-09-16T12-55-19_..._yoji-kimeru_w1280.jpg`（404 ページ）の「主要コンテンツ」カード4枚は `--rule` 枠で、1280px light で輪郭がほとんど見えない。

一次資料の側でも、divider の免除は無条件ではない（[Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) には divider の語が無く、実務解説も「構造の理解に不可欠なら 3:1 が要る」とする — [BarrierBreak](https://www.barrierbreak.com/decoding-wcag-1-4-11-non-text-contrast/) / [Stark](https://www.getstark.co/wcag-explained/perceivable/distinguishable/non-text-contrast/)）。本サイトは `DESIGN.md:68` で罫を「構造の主役」と定め、影を禁じ、`--paper-2` との差も 1.06:1 しかない——**罫は装飾ではなく唯一の構造伝達手段**である。少なくとも一段の検討を要する。

さらに constitution 4 は「Maintain all contents have the best quality in **every aspect** for visitors」を課しており、**WCAG AA 適合は下限であって価値の上限ではない**。文書は §4 冒頭で「『装飾か構造か』の二択は使わない」と宣言したが、代わりに置いた「WCAG 3層」も、`不要` と書けば検討が終わる二択として働いている。

**是正案の比較への影響**: §6 は `--rule` の値について「据え置き（1.52:1）」か「3:1 まで上げる（3.19:1）」の二択しか評価していない。**中間（例: 2.0〜2.5:1）+ 案3** という組み合わせが未評価である。案2 の却下根拠（意匠の破壊）は 3.19:1 への跳躍に対するもので、中間値には当たらない。214 件の来訪者価値を測ってから二択にすること。

---

## 中程度（7件）

### m1. 案2 の dark 列が、文書自身が示した `--rule` 値から再現しない

文書は「`--rule` = `oklch(0.635 0.008 85)` / `oklch(0.53 0.008 80)`」として表を掲げる。独立実装（Python / OKLab→sRGB→WCAG）で再計算した:

| 組み合わせ                  | 文書(dark) | 再計算(L=0.53) | 差  |
| --------------------------- | ---------- | -------------- | --- |
| `--rule` vs `--paper`       | 3.29       | **3.32**       | ✗   |
| `--rule` vs `--paper-2`     | 3.05       | **3.07**       | ✗   |
| `--rule` vs `--ink`         | 4.33       | **4.30**       | ✗   |
| `--rule` vs `--ink-2`       | 2.14       | **2.13**       | ✗   |
| `--rule` vs `--rule-strong` | 3.72       | **3.68**       | ✗   |
| `--rule` vs `--accent`      | 1.94       | **1.87**       | ✗   |

light 列は 6 件すべて完全一致（3.19 / 3.01 / 4.86 / 2.17 / 3.98 / 1.81）。案4 の表も light/dark 12 件すべて一致（`--rule-control` vs `--rule` の 2.41 が 2.42 の丸め違いのみ）。**案2 の dark 列だけがずれる。**

L を走査すると L≈0.528 で前 5 件はほぼ一致するが、`--rule` vs `--accent` の 1.94 は**どの L でも出ない**（L=0.52 で 1.95、L=0.53 で 1.87）。表の一部が計算し直しでなく転記になっている疑いがある。

結論（案2 却下）は変わらないが、`--rule` vs `--paper-2` は 3:1 の判定境界のすぐ上（3.01〜3.07）にあり、値の精度が結論に効く位置にある。**採用する L を確定し、全セルを同じ L で計算し直すこと。**

（なお §2 の実測値は独立実装で**全 12 組が完全一致**した。`tmp/contrast.ts` のトークン値も `src/app/globals.css:14-20,99-105` と一致する。閾値解 `light L <= 0.635 / dark L >= 0.524` も再現した——二分探索で light 0.6358 / dark 0.5243。）

### m2. 「罫の階層が壊れる」は数値の裏付けを超えた表現

> さらに罫の階層が壊れる: `--rule` と `--rule-strong` の差が dark で 7.57:1 → **3.72:1** に縮む。

現行 8.35 / 7.57 は再現した。半減も事実。**しかし 3.68〜3.72:1 は 3:1 を超えており、2 段の罫として十分識別できる**。「階層が壊れる」という断定は数値が支えていない。案2 却下の実質的な根拠は「252 件の意匠が一斉に変わる」の方であり、そちらだけで足りる。弱い論拠を積むと却下の判断自体が疑わしく見える。

### m3. §4-B の第1論拠が、§3 が自ら否定した論法の裏返し

> プレースホルダを免除根拠にはできない: **一次資料に `placeholder` は 0 件で**、かつプレースホルダは入力が始まると消える。

§3 は「`divider` が 0 件だから免除される、は誤り」と正しく書いた。同じ基準なら「`placeholder` が 0 件だから免除できない」も成立しない。**沈黙からの推論を、自分に不利な向きでは退け、有利な向きでは使っている**（AP-P02）。

結論自体は第2の理由（入力が始まると消える）と Figure 19/20 が支えるので変わらない。**第1の理由を削り、代わりに Figure 22 を引くこと**——`wcag.txt:184-187`:

> Figure 22. Pass: Text inputs that have **no border and are differentiated only by a background color must have a 3:1 contrast ratio** to the adjacent background (#043464).

対比として Figure 18（ボタン）は「does **not** need a contrasting visual indicator」と書いており、**一次資料は入力欄とボタンを明示的に別扱いしている**。これが B（入力欄）と C（ボタン）を分ける最も強い根拠である。

### m4. 層1 の引用が、原文で最も直接的な一文を落としている

§4-A の中心的論理（免除は presence にしか及ばず、state は層1 に残る）の**直接の一次根拠**は、文書が引いていない次の 2 文である（`wcag.txt:50-51`）:

> Unless the control is inactive, any visual information provided that is necessary for a user to identify that a control is present and how to operate it must have a minimum 3:1 contrast ratio with the adjacent colors. **Also, any visual information necessary to indicate state, such as whether a component is selected or focused must also ensure that the information used to identify the control in that state has a minimum 3:1 contrast ratio.**

> …However, the component must not lose contrast with the adjacent colors, and **non-text indicators such as the check in a checkbox, or an arrow graphic indicating a menu is selected or open must have sufficient contrast to the adjacent colors.**

現状の文書は Figure 23（**Pass 例**）から「トグルは (i) と (ii) の両方が要求される」を導いているが、**Pass 例に2つの条件が書いてあることは、両方が必須であることを論理的に含意しない**（Pass 例は十分条件の一例にすぎない）。上記2文を引けば推論を経ずに確定する。

**判定自体は正しい。** 免除の射程を狭く取りすぎても広く取りすぎてもいない。根拠の置き方だけを直すこと。

### m5. C'（inactive components）の列挙が不完全

文書は `Button.module.css:86` のみを挙げるが、規範文 "except for inactive components" が同様に効くのは:

```
src/components/Pagination/Pagination.module.css:67:   [.disabled] border-color: var(--rule);
src/play/quiz/_components/FudaActions.module.css:88:  [.saveButton:disabled, .shareButton:disabled] border-color: var(--rule);
```

判定は変わらないが、「悉皆」を掲げる文書の列挙としては不足。

### m6. `.guessKanjiEmpty` の指摘が実装と半分ずれている

```
$ sed -n '191,207p' src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css
.guessKanji { … border: 2px solid var(--rule); border-radius: var(--radius); background-color: var(--paper); … }
.guessKanjiEmpty { composes: guessKanji; border-color: var(--rule); }
```

合成元 `.guessKanji` が既に `2px solid var(--rule)` なので、`:206` の `border-color: var(--rule)` は**視覚的に無効果（no-op）**である。「空きセル固有の欠陥」として A/B/G の 8 件に数えるのは正確でない。

逆に、`:206` だけを `--rule-strong` へ差し替えると**空きセルだけが変わり、回答済みセル（`.guessKanji`・`--paper` 地に `--rule` 罫）はそのまま残る**。その段差が意図どおりかは検討されていない。是正案の具体形に効く。

### m7. `--rule` を「面」に塗っているのは 2 箇所だけ——案3/案4 の設計に直接効く事実が書かれていない

```
$ grep -viE "border" sel2.txt
src/components/ToggleSwitch/ToggleSwitch.module.css:51:            [.track] background: var(--rule);
src/play/games/irodori/_components/GameContainer.module.css:20:   [.progressDot] background: var(--rule);
```

262 件のうち 260 件は border、**面塗りは 2 件だけ**。§6 案3 の「黒ベタ問題」はこの 2 件にしか起きない——一般則として書けば、案3 の適用範囲（8件中 1 件だけが要検討）が一目で分かり、案4 を持ち出す必要の有無も判断しやすくなる。

---

## 軽微（2件）

### n1. 同じ箇所に 2 種類の行番号が混在している

§0 / §1.3 / 起票案は**宣言行**（`YojiKimeru:208` / `KanjiKanaru:249,206`）、§4-G のコードブロックは**セレクタ行**（`:202` / `:243,204`）を使う。どちらも実在の行として正しいが（確認済み）、読者は齟齬と受け取る。どちらかに統一すること。

### n2. §1.1 のコメント 5 行の内訳がパス途中からで、`grep` で引けない

`TraditionalColorPaletteTile.module.css:7` / `url-encode/UrlEncodeTile.module.css:4` 等。実パスは `src/tools/traditional-color-palette/…` / `src/tools/url-encode/…`。次サイクルが検証できるよう `src/` からのフルパスで書くこと。

---

## 検証して正しかったこと（維持すべき）

| 検証項目                                                     | 結果                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| §2 の実測コントラスト 12 組                                  | **全件一致**（独立 Python 実装・OKLab→sRGB→WCAG 相対輝度）                                              |
| `tmp/contrast.ts` のトークン値 vs `globals.css:14-20,99-105` | **一致**                                                                                                |
| §3 の一次資料検証                                            | **完全に再現**（198313 bytes / divider 0 / separator 0 / decorative 1 / placeholder 0）                 |
| Boundaries / Figure 19,20,22,23,26,27,33 の逐語              | **全て原文どおり**（本レビューで独自に取得・整形して照合）                                              |
| §4-A の中心的論理（免除は presence のみ、state は層1）       | **正しい**（原文に直接の裏付けあり。m4 参照）                                                           |
| 「サムの縁とトラック地が同一色で 1.00:1」                    | **実装と一致**（`.track background: var(--rule)` :51 / `.thumb border: 1px solid var(--rule)` :86）     |
| ToggleSwitch の規模「公開ツール5本・トグル11個」             | **正しい**（password-generator 5 / text-replace 3 / base64 1 / sql-formatter 1 / line-break-remover 1） |
| 内訳合計 A2+B3+G3+D2+C32+E6+F214                             | **= 262**（一致）                                                                                       |
| 268 → CSS宣言 260 + TSX stroke 2 + test 1 + comment 5        | **再現**（CSS コメント 4 + TSX コメント 1）                                                             |
| §4-E の免除根拠（併記可視テキストの実在）4 件                | **全件確認**（irodori は `ProgressBar.tsx:33-37` で `1/5` を可視描画・文書の記載どおり）                |
| G の前提「残り試行数は他に可視表示が無い」                   | **確認**（ResultModal と HowToPlayModal 以外に表示なし）                                                |
| §5 の「広告コンポーネント 0 件」                             | **再現**                                                                                                |
| §4-D の ThemeToggle 実測値                                   | **実装と一致**（`.track` `--paper-2` 地 + `--rule` 罫 :43 / `.thumb` `--paper` 地 + `--rule` 罫 :93）   |
| `DESIGN.md:34 / 68 / 124` の引用                             | **全て正確**                                                                                            |
| 閾値解 light L<=0.635 / dark L>=0.524                        | **再現**（二分探索 0.6358 / 0.5243）                                                                    |
| 案4 の表 14 組                                               | **全件一致**（丸め 1 件のみ）                                                                           |
| `git diff --stat 967d684 HEAD -- src/`                       | **空**（凍結は守られている）                                                                            |

前サイクルの誤り（「区切り線は対象外と明記されている」）を、自分で一次資料を取得して訂正した作法は正しい。§3 の「区切り線が対象外になるのは名指しの免除があるからではなく、そもそも User Interface Component でも Graphical Object でもないから」という区別は本件の要であり、これを言語化した価値は大きい。**本レビューの重大指摘は、まさにこの区別が母集団の一部（色見本）に適用されていないこと**である。

---

## 是正の方向（優先順）

1. **C4**: 起票案5 を取り下げ、`DESIGN.md` の用途境界の文案と §10 品質バーへの非テキスト 3:1 の追記案を、**本サイクル T5 への入力として T3 側で用意する**。トークン名の確定を待つ必要はない。
2. **C1 / C2**: 色見本 8 宣言と `.swatch`（textless button）に 3 層判定を当て、分類表を更新する。免除するなら根拠を明示する。
3. **C3**: `DESIGN.md` への誤帰属を削除し、案1 の因果説明を「規約が正典に無く、共有コンポーネントのコメントにしか存在しない」に置き換える。
4. **M5**: 262 件の全件分類表を文書に載せる（または分類スクリプトを残す）。`.prose th/td` を表組みに追加する。
5. **M3**: GA で対象ページの PV を取り、起票 6 件の優先度を PV で重み付けし直す。
6. **M1 / M2 / M4**: 起票案3 の表題を実見に合わせて訂正し、是正後の視覚確認を着手条件に追加する。§4-A の機序を単独 OFF トグル（base64 / line-break-remover）基準に書き直す。
7. **M6**: F=214 の不問判断に、来訪者価値からの根拠を付ける。`--rule` の値について中間案（3:1 未満で穏やかに濃くする）を 5 案目として評価する。
8. **m1〜m7 / n1〜n2**: 数値の再計算、根拠の置き換え、列挙の補完、行番号の統一。

**修正は本文全体を書き直す形で行うこと**（CLAUDE.md「No patchwork」）。訂正の跡が残る追記は認められない。修正後は前回指摘だけでなく全体の見直しを含めて再レビューを受けること。
