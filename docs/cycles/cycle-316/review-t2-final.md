# レビュー: T2 の完了の判定（b9550ae・d4c98ba・9530e39）

レビュー日: 2026-09-25
対象: `git diff db7e525..9530e39 -- src DESIGN.md`。とくに b9550ae（補助情報と値札）・d4c98ba（色だけで示していた箇所）・9530e39（`data-inverted`・`data-thick-frame`・`DisclosureTriangle`）
根拠: `DESIGN.md`、`.claude/skills/frontend-design/SKILL.md`、[index.md](./index.md)（T2 の行・完了の条件・補足事項・レビュー結果）、[t2-inventory.md](./t2-inventory.md)、`docs/constitution.md`、`docs/anti-patterns/implementation.md`・`workflow.md`
範囲の外（指示のとおり）: 一覧の組み方は T3、結果と中身の色は T4、ページの余白と独自の規則は T5。ただし、後のタスクに回したものが担当の行に書かれていなければ指摘する

## 結論

**改善指示**（Blocker 0・Major 3・Minor 9）

T2 の中心の条件の「朱の色だけで示していたリンクや操作が、色に依らずに見分けられる」は、実物で満たされていた。機械の検査で見た 85 ページ（375px）では、下線・反転・現在地・無効のどれも持たないリンクとボタンは0件だった。残ったのは色見本となかまわけの語のマスで、どちらも形で状態を示す。hover で見え方が変わらないコントロールは、25 ページ（1280px・dark）で0件だった（無効を除く）。キーボードのフォーカスは、8 ページで Tab を送り、リングの見えない止まりどころは日付の欄の中だけだった（Minor-3）。

それでも、T2 の行が名指しするもののうち、次の3つが残っている。どれも、ほかのタスクの行にも書かれていない。

- 値札の形（細い線の枠と小さな字）が、PV の78%が集まる診断の結果に残っている。
- `Panel` が古いトークンを持ち、細い `--ink` の枠で道具の面を囲んでいる。§6 では hover と読み違える。
- ゲームの入力欄のエラーが §8 の形（太いボーダー）になっていない。

## 確かめたこと

作業ツリーは 9530e39（未コミットの変更なし）。`npm run build` のあと `next start`（ポート 3955）で開いた。Playwright MCP のブラウザ（chromium-1246）は入っていなかった。そのため `node_modules/playwright` を `/opt/pw-browsers/chromium-1194` で動かし、スクリプトで開いた。撮った画像とスクリプトは `tmp/review-t2-final/` に置いた。

- **テストほか**: `typecheck`・`lint`・`format:check`・vitest（330 ファイル・5510 件）・`build` がすべて通る
- **下線・反転の機械の検査**（`audit.mjs`）: 375px・light で次の 85 ページを見た。`/play` の直下の 20 本、診断の結果 11 本（各1件）、道具 36 本、辞典（一覧・漢字の詳細・四字熟語・色・笑辞典）、ブログ（一覧・分類・記事3本・タグ）、about・privacy・storybook。見たのは、見えている `a[href]`・`button`・`[role=button]`・`summary` のすべて。自分か子孫の字に下線がある、反転の地を持つ、`aria-current`・無効、開閉の三角を持つ、のどれかに当たるかを調べた。当たらないのは、伝統色の色見本（250個）となかまわけの語のマス（16個）だけ。どちらも `aria-pressed` の形で状態を示す。`scrollWidth` は 85 ページとも 375 だった
- **hover の検査**（`hover.mjs`）: 1280px・dark で 25 ページ、375px・light で 12 ページを見た。マウスを載せる前と後で、`box-shadow`・`::after` の `box-shadow`・下線の太さのどれも変わらないコントロールを探した。当たったのは次のものだけ。画面の外にあるスキップのリンク、storybook の無効の行（正しい）、ゲームの帰属表示の本文の中のリンク（Minor-6）
- **Tab の検査**（`tab.mjs`）: トップ・unit-converter・image-resizer・nakamawake・kanji-kanaru・漢字「木」・`/blog`・`/storybook` を 375px・dark で見た。止まりどころごとに、リングが出るかと画面の中にあるかを調べた。外れたのは日付の欄の中の暦のボタンだけ（Minor-3）
- **入力欄の字の大きさ**: 道具 36 本・ゲーム2本・辞典・ブログ・storybook の、書き込む欄と選ぶ欄のすべてが 16px 以上
- **流れ**: `/play/character-personality` を、375px・light でキーボードとマウスで結果まで進めた。漢字力診断を 320px・dark で結果まで進めた。kanji-kanaru では誤った字を送ってエラーを出した。nakamawake では語を選び、「チェック」の無効と理由を見た
- **撮ったもの**: トップ・道具5本（date-calculator・keigo-reference・image-resizer・unit-converter・password-generator）・四字熟語の詳細・ブログ記事・storybook を、320px・light と 1280px・dark で撮った。反転の hover とフォーカスは light と dark を3倍で撮った（`hero-all.png`）。語のマスは light と dark を 1倍と3倍で撮った（`nk-grid-*.png`・`nk-hover-*.png`）

### t2-inventory.md の消し込み

| 節                               | 結果                                                                                                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-0 全体の既定                   | 消えた。`:where(a)` が細い下線、hover で下線が太くなる                                                                                                                                                    |
| 1-1 リンク 12 規則               | 消えた。12 規則とも下線を持つ（`.cta` は行の名前 `.title` が下線を持つ）                                                                                                                                  |
| 1-1 現在地 3 規則                | 消えた。`FacetIndex` は `aria-current` で太字・下線なし                                                                                                                                                   |
| 1-1 選択・状態 5 規則            | 難易度は RadioGroup、なかまわけは四角の塗りになった。`Input` の `.error` は `[data-field][aria-invalid]` の太い線になった。`FileDropZone` は前回までに直った。ゲームの入力欄のエラーは残る（**Major-3**） |
| 1-2 hover 69 規則                | 消えた。hover の検査で、変わらないコントロールは0件                                                                                                                                                       |
| 1-3 明度だけの hover 15 規則     | 消えた。`filter`・`opacity` の hover は0件。反転は `data-inverted` の線                                                                                                                                   |
| 1-4 全体の `a:hover` だけのもの  | 消えた                                                                                                                                                                                                    |
| 1-5 無効 19 規則                 | 消えた。`Button`・`Field` は太い破線と理由の文。なかまわけの「チェック」は破線の枠と「言葉を4つ選ぶとチェックできます」（`nk-dis-375.png`）                                                               |
| 1-6 色以外の手がかりもあったもの | 操作は §6 の形になった。値札の形の「診断完了」と伝統色の季節タグは残る（**Major-1**）。irodori の進みの点は T4、`.medalLabelDone`（運勢）は字で言う                                                       |
| 1-7 下線を持たないリンク         | 消えた（機械の検査で0件）                                                                                                                                                                                 |
| 1-9 T2 以外が名指しするもの      | T4 の行に残る。「エラーの文」は T2 で、ゲームの分が残る（**Major-3**）                                                                                                                                    |
| 2-1 部品                         | `SegmentedControl`・`ToggleSwitch`・`Nefuda` は消えた。`In`・`Tsutsumi` は T4                                                                                                                             |
| 2-2 独自のコントロール           | 反転の実行ボタンと枠の実行ボタンは `Button` になった。アイコンのボタンは字のボタン、開閉は `DisclosureTriangle` になった。`EmailValidatorTile` の印は T5、`rankBadge` は T4 にある                        |
| 3 古いトークン（部品）           | `Panel` の `--radius` が残り、どの行にも無い（**Major-2**）。`In`・`Tsutsumi` は T4                                                                                                                       |
| 4 入力欄の文字の大きさ           | 消えた（すべて 16px 以上）                                                                                                                                                                                |
| 5 フォーカス                     | 既定は二重リング。独自の `outline: 2px solid var(--accent)` は `src/` に0件。日付の欄の暦のボタンだけ既定のリングが出ない（Minor-3）                                                                      |

### 見てほしいと言われたことへの答え

- **太い枠のマスの並び（`--ink`・`--paper`・`--ink`・`--paper`）**: 計算と撮影で、外から次の順に並ぶことを確かめた。枠 0〜3px、`--paper` 3〜6px、外の輪 6〜9px、内の輪 9〜12px。§6 の表で、これをほかのもの（破線・20px の四角・入力欄のエラー・ボックス）と読み違えることはない。フォーカスのないマスは線が1本、フォーカスのあるマスは2本に見え、選択（四角の塗り）とも無効（破線）とも区別できる（`nk-grid-light.png`・`nk-grid-dark.png`）。ただし、§6 は「押せる範囲に密着した二重リング」と定める。このリングは枠から 3px 離れていて、`DESIGN.md` にも index.md にも書かれていない。マスの `--paper` の地の上では、内の輪は見えない。見え方としては、外の輪を枠に接して出すのと同じになる。hover の線も、この枠のせいで見えない（Minor-1）。これらは Minor-2 で扱う
- **反転の hover**: 縁から 3px 内側の、1px の `--paper` の線になる。§6 の「押せる範囲の内側に細いボーダーが現れる。外には出ない」は満たす。フォーカスのリング（3px）とも見分けられる（`hero-all.png`）。ただし、§5 は細い線の色を `--rule-2` と定めている。`--paper` を使うことは、どこにも書かれていない（Minor-2）

## 指摘

### Major-1 値札の形が、診断の結果と伝統色の診断に残っている

T2 の行は「値札…の置き換え」と「告知・バッジのように、ほかのタスクの行に無い状態の示し方も T2 で扱う」を求める。b9550ae は `ResultNextContent`・`RecommendedContent`・`BlogList` の値札を文字にした。一方で、同じ形の次の2つが残っている。

- `src/play/quiz/_components/ResultCard.module.css` の `.medalLabelDone`: 1px の `--rule`（= `--ink`）の枠・`--radius-sm`・`0.75rem`（12px）で「診断完了」と出す。PV の78%が集まる `/play/character-personality` の結果の、いちばん上にある（`tmp/review-t2-final/cp-light-375-9result.png`）。コメントは「値札（メタ情報ラベル）の語彙」のまま
- `src/play/quiz/_components/TraditionalColorContent.module.css` の `.seasonTag`: 1px の `--ink` の枠・`0.8rem`（12.8px）の季節

来訪者から見ると、この枠は §6 の読み分けで「細い線で囲まれたもの＝hover」にあたる。押せないものが押せそうに見える。字も §4 の下限（14px）を下回る。T4 の行は包み（Tsutsumi）と rankBadge を名指しするが、この2つはどの行にも無い。前回（review-t2-replace）の Minor-3 と同じ種類の取り残しである（AP-WF04）。

**直し方**: builder が、2つを b9550ae と同じ形（枠と地を持たない 14px の `--ink-2` の文字）にする。`値札|バッジ|--radius-sm` で `src/play/` を grep し、残りが無いことを確かめる。結果を撮り直す。

### Major-2 `Panel` が古いトークンと細い `--ink` の枠を持ち、どの行にも無い

`src/components/Panel/Panel.module.css` は `border: 1px solid var(--rule)` と `border-radius: var(--radius)` を持つ。冒頭のコメントも「DESIGN.md フェーズ R・店構えへ変換」「§4『パネルには影をつけない』」で、いまの `DESIGN.md` と合わない。

- T2 の行は「部品が参照する古いトークン（…`--radius`…）を §2・§5 のトークンに置き換える」を求める。t2-inventory.md §3-2 の `Panel` の行が残っている。
- `Panel` は 36 の道具のルートである。1px の `--ink` の線は §5 の2種類のどちらでもない（細い線は `--rule-2`）。§6 の読み分けでは「細い線で囲まれたもの＝hover」になる。date-calculator では、この枠が入れ子になって3重に並ぶ（`tmp/review-t2-final/p1280D_tools_date-calculator.png`）。
- T5 の行は、細い枠で hover と読み違える面として GameDialog・NextGameBanner・behaviorsItem を挙げる。しかし `Panel` は挙げていない。同じ形の `1px solid var(--rule)` は `src/` に 154 か所ある（トップの目玉の `.hero` も含む。コメントはまだ「枠は --rule-strong」と書く）。

**直し方**:

- builder が、`Panel` を §5 のボックス（太い線）にするか、枠を持たないかを決めて直す。古いトークンと、経緯のコメントを消す。
- PM が、残る `1px solid var(--rule)` を §5 の線に直す作業を、T5 の行（またはページごとの行）に名前を挙げて書く。トップの `.hero` も含める。

### Major-3 ゲームの入力欄のエラーが §8 の形になっていない

t2-inventory.md §1-9 は、ゲームの `.errorMessage` を「T2『入力欄とラベルとエラー』」に割り当てている。d4c98ba は kanji-kanaru・yoji-kimeru の欄に `data-field` を付けた。しかし、エラーのときに `aria-invalid` を立てていない。そのため、欄は細い線のままである。エラーの文も `aria-describedby` で欄に結ばれていない（`src/play/games/kanji-kanaru/_components/GuessInput.tsx`、yoji-kimeru も同じ）。

kanji-kanaru で「あ」を送ると、「常用漢字ではありません」は太字で出る。一方で、欄の線は 1px のままである（`tmp/review-t2-final/kk-err2-375.png`）。§8 の「エラーのときだけ太いボーダーになる。その直下に、何が問題でどう直すかを文字で書く」のうち、ボーダーが欠けている。文も「何が問題か」だけで、「どう直すか」を言わない。

**直し方**: builder が、エラーのあいだ欄に `aria-invalid="true"` と、エラーの文への `aria-describedby` を付ける。入力を変えたら外す。文には直し方を足す（例「常用漢字を1字入力してください」）。2本とも撮って確かめる。

### Minor-1 太い枠のマスでは、hover の線がほぼ見えない

語のマスの hover は、既定の `inset 0 0 0 1px var(--rule-2)` のままである。3px の `--ink` の枠のすぐ内側に 1px の灰の線が付くので、実寸では枠が少し太ったようにしか見えない（`tmp/review-t2-final/nk-grid-light.png` の「東武」が hover 中。3倍で撮った `nk-hover-light.png`・`nk-hover-dark.png` で、ようやく線が分かる）。反転では、同じ問題を「縁から 3px 内側に引く」ことで解いている。

**直し方**: builder が、`data-thick-frame` にも `--hover-line` を持たせる。枠から太い線の太さだけ内側に 1px の線を引く形にする。1倍で撮って確かめる。

### Minor-2 反転の hover の色と、太い枠のリングの位置が、どこにも書かれていない

- 反転の hover の線は `--paper` である。§5 は細い線の色を `--rule-2` と定める。3px 内側に引くなら、`--rule-2` でも `--ink` の地の上で見える（light はおよそ 5:1、dark はおよそ 4.8:1 と見積もった）。
- 太い枠のマスのリングは、§6 の「押せる範囲に密着」から 3px 離れている。
- `DESIGN.md` の §5・§6 には、「太い枠を持つコントロール」という種類そのものが無い。

index.md の補足事項にも、この判断は無い。`DESIGN.md` を実装に合わせて黙って変えない決まり（index.md「作業中に守ること」）の裏返しで、実装が `DESIGN.md` から外れたまま記録が無い状態である。

**直し方**: PM が、どちらかに決める。

- (a) 実装を §5 に戻す（反転の hover を `--rule-2` にする）。
- (b) 判断と理由を補足事項に書き、planner が §5・§6 に書き足してレビューを受ける。

太い枠のマスについては、なかまわけの盤を「太い枠を持つコントロール」とするか、マスの枠を持たない形（チェックボックスの行）にするかも、同じときに決める。

### Minor-3 日付の欄の暦のボタンに、二重リングが出ない

`type="date"` の欄は、年・月・日の後にもう1つ Tab の止まりどころ（暦を開くボタン）を持つ。そこでは入力が `:focus-visible` にならない。そのため、欄の二重リングが消え、Chrome の既定の細い輪が暦の印を囲むだけになる（`tmp/review-t2-final/date-picker-focus.png`）。date-calculator は4か所、age-calculator は2か所、storybook は2か所ある。

**直し方**: builder が、`[data-field]:focus-within` でも欄のリングを出すか、同じ働きの規則を足す。3つの面を Tab で送って確かめる。

### Minor-4 keigo-reference の開閉のボタンが、読み上げの名前で開閉を言う

`KeigoReferenceTile.tsx` の開閉のボタンの `aria-label` は「〜の例文を表示」「〜の例文を閉じる」である。このため、`aria-expanded` と合わせて状態を二度読む。index.md の補足事項は「アコーディオンは、三角の向きと読み上げの開閉の状態で示し、開閉を言う文言は足さない」と決めている。

**直し方**: builder が、`aria-label` を「〜の例文」にする（または外し、見える字を名前にする）。

### Minor-5 EntryRatingButton のコメントと、押したあとの状態

- JSDoc は「DESIGN.md §6: 見出し・ナビ・ボタンに絵文字を使わない」と書く。しかし、§6 にその文は無い（絵文字は §5「持たないもの」にある）。
- 押したあとも `aria-pressed="true"` の切り替えボタンとして読まれる。押しても戻らないので、読み上げが操作と合わない。見た目は、現在地と同じ太字・下線なしになる。
- ラベルが `0.875rem` で、ほかのボタン（本文の大きさ）と揃わない。

**直し方**: builder が、コメントの節を正しくする。押したあとの状態の示し方（`aria-pressed` をやめて字で言う、など）と大きさを、§6 に合わせて直す。

### Minor-6 ゲームの帰属表示のリンクに hover が出ない

`src/play/games/_components/new/GameLayout.module.css` の `.attribution a { text-decoration: underline }` は、ショートハンドなので `text-decoration-thickness` を既定に戻す。詳細度が 0 の hover の規則（下線を太くする）が負け、kanji-kanaru の「KANJIDIC2」「漢字辞典」と、yoji-kimeru の「四字熟語辞典」は hover で見え方が変わらない。同じ規則は `--accent` と `0.75rem` も持つ（T5 の範囲）。

**直し方**: builder が、この宣言を消して `a` の既定に任せる。

### Minor-7 d4c98ba・9530e39 の判断が記録されていない

次の判断が、index.md の補足事項に無い。

- なかまわけの語のマスを「太い枠の中に 20px の四角」にした
- 難易度を RadioGroup にした
- 笑辞典の評価を押したあとを太字で示した
- `data-inverted`・`data-thick-frame` を共通の仕組みにした

前回（review-t2-replace）の Minor-7 で、判断を記録するよう求めたのと同じ種類である。

**直し方**: PM が、上の判断と理由を補足事項に書く（Minor-2 の決定と合わせてよい）。

### Minor-8 kanji-kanaru の盤が、375px でコンテンツ幅から右へはみ出す

盤（`.board`）と列の見出しが、画面の右端（x=375）まで伸びる。右端の列「訓読み数」は、盤の中の横送りでしか見えない（`tmp/review-t2-final/kk-err-375.png`）。T2 の変更によるものではない。一方で、T5 の行は kanji-kanaru について見出しと入力欄のラベルしか挙げていない。

**直し方**: PM が、この盤の組み方を T5（または T4 の判定のマス）の行に名前を挙げて書く。

### Minor-9 ブログの目次で、2行に折れた項目どうしの境目が見えない

目次のリンクは 44px の押せる範囲を上下に接して並べる（§5 のとおり）。しかし、2行に折れた項目が続くと、下線付きの行が等間隔に並び、どこで項目が変わるかが分からない（`tmp/review-t2-final/p1280D_blog_personality-quiz-tie-enumeration.png` の右の目次）。

**直し方**: builder が、項目のあいだを 8px あけるか、項目の中の行間を詰めて、項目の境目が見えるようにする。1280px と 375px で撮って確かめる。

## 前回の指摘の扱い（review-t2-replace）

| 前回                                 | いま                                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Minor-1 ラベルが語の途中で折れる     | T5 の行に、ラベルの言い方を見直すことが書かれた                                               |
| Minor-2 「・」でつなぐ種別           | 直った。16px の間隔で並ぶ                                                                     |
| Minor-3 自前の値札                   | 挙げた3つは直った。同じ形がほかに2つ残る（Major-1）                                           |
| Minor-4 絞り込みが一覧を押し出す     | T3 の行に書かれた                                                                             |
| Minor-5 消した部品の名前             | 変更したファイルからは消えた                                                                  |
| Minor-6 「種別」の呼び方             | 補助情報に呼び替えられた                                                                      |
| Minor-7 記録・hover の線・組の見出し | 候補の hover は §6 と補足事項に書かれ、四辺に出る。見出しは揃った。新たな判断の記録は Minor-7 |

## 作業の進め方について

- Major-1 は、前回の Minor-3 と同じ取り残しである。直すときに、inventory の §1-6・§2-2 の行と `値札|バッジ` の grep を上から消し込む手順を踏む（AP-WF04）。
- `DESIGN.md` から外れる実装（Minor-2）は、実装のコミットと同時に補足事項へ書く。後から記録を足す形にすると、次のレビューまで規定と実装が食い違ったまま残る。

## 次の作業

1. PM は builder に、Major-1〜3 と Minor-1・3〜6・9 を直させる。
2. PM は、Major-2 の残りの細い枠の割り当て、Minor-2 の判断、Minor-7 の記録、Minor-8 の割り当てを index.md に書く。`DESIGN.md` を書き足すなら planner に書かせ、レビューを受ける。
3. 直したあと、もう一度レビューを受ける。そのレビューでは、前回の指摘だけでなく全体を見直す。
