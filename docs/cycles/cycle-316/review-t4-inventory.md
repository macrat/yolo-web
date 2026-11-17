# T4 着手前の洗い出しのレビュー（t4-inventory.md）

対象: [t4-inventory.md](./t4-inventory.md)（`e94d007`）。
確かめ方: `e94d007` を別の worktree に取り出し、`npm run build` のあと `next start`（ポート 3587）で配信したものを、`/opt/pw-browsers/chromium` の Playwright で 375×667・1280×800（ライト。1枚だけダーク）で開いた。コードは同じコミットを読み、GA は `.claude/skills/analyze-bigquery` の `query.ts` で同じ期間（2026-08-29〜09-25、BigQuery の最新の日は 20260925）を集計し直した。

## 確かめて合っていたもの

- **伝統色診断の包みの色**: `/play/traditional-color/result/ai` の記号面は `data-color="kurenai"`、地の計算値 `lab(40.1569 54.7677 23.3408)`（375・1280 とも）。`pickResultWairoColor("ai")` は (97×31+105) mod 8 = 0 で紅。OGP（`/play/traditional-color/result/ai/opengraph-image`）の記号面は `#0d5661` の藍。画面は紅の地に「藍」、OGP は藍の地に「藍」で、食い違いは実物のとおり。
- **印の大きさ**: 375 で 49×13px・字 9.35px、1280 で 63×14px・字 9.35px。字と線の色は `--ink`（`--accent` → `--ink`）。
- **Zen Antique に無い字**: `src/data/zen-antique-charset.json` で 𠮟・剝・塡・頰（と 纁）が無く、診・占・観はある。ビルドの CSS の Zen Antique の `@font-face` は 122件。`/dictionary/kanji/𠮟` の大字は `data-heading-font="fallback"`。常用漢字 2,136字のうち4字で4字とも学年7、初級 240字・中級 1,026字。出題表で当たるのは上級の 2026-08-10「塡」だけ。四字熟語 400語は0、伝統色 250色は「纁」1色。診断・占いの `title:` は190件。
- **nakamawake の統計の強調**: `.distributionBarHighlight` は `StatsModal.module.css` にあるが `StatsModal.tsx` は使わない。kanji-kanaru・yoji-kimeru は `isHighlight` で使う。
- **irodori の進みの点**: 5つの点の計算値がすべて `lab(3.04863 0 0)`・10px（いまの点を含む）。`aria-valuenow` は 0、見える字は「1/5」。
- **`accentColor` の表示での使用**: `src/` 全体で読むのは `src/play/registry.ts:20`・`:45` の写しだけ。テストは32ファイル・72行。
- **GA のうち表示と診断の数**: `page_view` 3,327（mobile 2,533・desktop 696・tablet 98）、診断のプレイ面 2,716、結果のページ 35、ブログ記事 71（PC 63・スマホ 8）、辞典・道具・ゲーム・`/play/daily` の数、診断ごとの `level_start`・`level_end`、保存 34（mobile 29）、共有 16（全て mobile）、`tile_first_interaction` の3件は、どれも9章と一致した。
- そのほか、クイズの `color`・`icon` の件数、ブログの GFM Alert（42本・100件と種別ごと）・`hr`（7本・19件）・コード（59本・408）・mermaid（10本・19）、`globals.css` の和色の行、`resultVisual.ts`・`ResultCard.tsx`・`ResultPageShell.tsx`・`In.module.css`・`FinalResult`・`FeedbackCell`・`CharFeedbackCell`・`StarRating` の記述と行番号、結果の CSS の件数の表（`--paper-2` は宣言の行数）は実物と合っていた。
- `tmp/` のパスは書かれていない。

## 指摘

### 1. [Major] ゲームの結果に着いた回数は GA から分かる（9-2 の誤り）

9-2 は「`level_end` は診断を解き終えて結果を出したときに送られる」「ゲームの結果に着いた回数は GA からは分からない」と書くが、ゲーム4本も終わったときに `level_end` を送っている（`kanji-kanaru/_components/GameContainer.tsx:281`・`yoji-kimeru/…:288`・`nakamawake/…:180`・`irodori/…:196` の `trackContentEnd`）。送らないのは `level_start` だけである。BigQuery でも、2026-06-01〜09-25 に `level_end` が kanji-kanaru 12・irodori 7・yoji-kimeru 7・nakamawake 5 届いている。

したがって直近28日の「ゲームの結果に着いた回数」は **1回**（kanji-kanaru、tablet）と分かる。ゲームの結果（ダイアログ・rankBadge・統計の強調・判定のマス）の手直しがどれだけの来訪者に効くかを決める数なので、「分からない」ではなく「28日で1回（表示 24 のうち desktop 20）」と書く。`level_end` の説明の文も、診断とゲームの両方が送ると直す。

### 2. [Major] いちばん見られている結果の面（性格診断の解き終えた画面）を実物で測っていない。印が品名の字に重なっている

9章のとおり、結果に着いた回数の 9割以上は character-personality の解き終えた画面（`ResultCard` の包み）で、87% が mobile である。ところが実測（y 座標・幅・画面）は結果のページ（`ResultPageShell`）とトップにしか無く、`ResultCard` の行は組み方の列挙だけである。2-2 の「幅は 375px で 273px」も結果のページの値で、解き終えた画面では 297px になる。

解き終えた画面を 375×667 で最後まで解いて開くと、次のことが起きている（棚卸しに無い）。

- **印が品名の最後の字に重なる。** 包みが 297px になると品名「あなたに似たキャラ診断」が店号と同じ行に並び、右上に絶対配置の印（x=258・y=74、54×13px）が品名（x=130〜295・y=63〜91）の「断」の上に載る。結果のページ（273px）では品名が次の行に落ちるので重ならない。いちばん多い来訪者が見る結果の見出し帯で、字が欠けて見える。
- **包みが最初の画面をほぼ占める。** 包みの高さは 540〜584px（タイプ名の長さで変わる）で、「この結果を札として持ち帰る」（`FudaActions`、札の保存 34回・共有 9回の入口）は 606〜650px から始まり、最初の画面の下端に掛かる。
- **タイプ名が語の途中で折れる。** `1.9375rem` のタイプ名が「夢を語りながら／「でも／これ普通じゃな／いよね」と／逆張りする／妄想家」「「よし行く／ぞ！」と叫んで」のように折れる。§4「見出しは意味の切れ目で折る。語の途中で折らない」と食い違う（結果のページ・ダークでも同じ）。

解き終えた画面の 375 の実測（包み・印・品名・タイプ名・`FudaActions` の位置、タイプ名の折れ方）を 2-2 と 1-2 に足す。1280 でも同じ画面を測る。

### 3. [Major] 「色で状態を示している面」を、§2 の「区別のために色を足さない」「色の上に文字を置かない」と突き合わせていない（設計の論点の漏れ）

T4 の行は「判定が色だけで伝わっているものを、字か形でも伝わるようにする」と書くが、DESIGN.md §2 はそれより強く、「区別・強調・気分のために色を足すことは、コンテンツであっても認めない」「コンテンツの色の上に文字を置かない」と定めている。字や形を足しても、判定のマスの常磐・山吹、nakamawake の難易度の4色、統計の強調の常磐、占いの★の山吹、理系思考タイプ診断のレーダーと帯の色は、どれも区別・強調・気分のための色で、しかも多くはその色の地の上に字（判定の語、推測した字、グループ名と語、回数）を載せている。

4-2 の表には「色のほかに伝えるもの」の列しか無く、1-1・2-2 のような「DESIGN.md との食い違い」の列が無い。このままだと、設計が「字を足せば済む」側に寄り、§2 と食い違ったまま残る案を選びうる。4-2 に「§2 との食い違い（区別のための色か・色の上に字があるか）」の列を足し、それぞれの色を「中身の色か、区別の色か」で書き分ける。とくに次の2つは、T4 の行の言い方と §2 のどちらに従うかを設計で決める論点として書き出す。

- 判定の色を残して字・形を足すか、§2 のとおり色を外して字・形だけで示すか（ゲームは 28日で表示 24・結果1回）。
- 包みの記号面の和色（id のハッシュで選ぶ色）を残すか。§2 の「その色がコンテンツそのものであるときだけ」に照らすと、伝統色診断の結果の色だけが中身の色になる。

### 4. [Major] 結果の登場の動き（§11）と、ゲームの結果のダイアログが DESIGN.md に無いことが、論点として挙がっていない

- **動き**: `ResultCard.module.css` は結果全体（`.card` の `fadeIn 0.4s`）と包み（`.medalWrap` の `medalReveal 0.4s`）の2つに登場の動きを持ち、`DailyFortuneCard.module.css:11` は `reveal 350ms` を持つ（どちらも `prefers-reduced-motion` で止める）。ほかにも `CompatibilitySection`・`RadarChart`・ゲームの CSS に `@keyframes` がある。§11 は「結果の登場（1回・250–400ms）」と決め、cycle-316 の完了の条件（index.md の「`prefers-reduced-motion` のとき結果の登場は即時表示になる」）にも入っているが、棚卸しには結果の動きの列挙が無い。入れ子の2つの動きが「1回」にあたるかは、設計で決める論点になる。
- **ダイアログ**: 1-4 は「結果はどれも `GameDialog` の中に出る。ボックスは持たない」と書くが、DESIGN.md にダイアログの定義が無いこと（§5・§6・§8 のどこにも無い）を書いていない。§8 の「結果はボックスにある」とどう合わせるか、ダイアログを DESIGN.md に足すかは、ゲームの結果・統計・遊び方の組み方を決める前提なので、論点として書き出す。

### 5. [Minor] 結果の面の位置の実測が実物と違う

- 1-2・2-2: 「375px で h1 は y=287、包みは y=207〜667 の範囲に続き、最初の画面の下端で切れる」。h1 は包みより前にあるので、包みが h1 より上（207）から始まることは無い。実測では、`/play/character-personality/result/blazing-poet` で h1 y=287〜332・包み y=344〜804、`/play/traditional-color/result/ai` で h1 y=268〜290・包み y=302〜660（下端で切れない）。どの結果で測ったかも書かれていない。測った URL を書き、値を直す。
- 1-6: 「375px で y=128〜538」。実測ではトップの包みは y=839〜1249 で、最初の画面（〜667）には入らない。見本が最初の画面に入るかどうかは設計の材料なので直す。
- 2-2 の印の行は「実測は375px で幅 49×高さ 13px … （375・1280 の両方）」と書くが、1280 の値（63×14px）が無い。トップの印は 40×12px。値を並べる。

### 6. [Minor] 数え違い・食い違い

- 1-1 の下の「細い `--ink` の枠を結果の区画に持つ道具は 17本」に bmi-calculator が無い。同じ節の表は bmi の `.meterTrack` を「細い枠」と書いており（`BmiCalculatorTile.module.css:49` `border: 1px solid var(--rule)`）、18本になる。
- 1-2 の見出し「ほか専用8本」: 専用の結果ページは animal・character-fortune・character-personality・contrarian・impossible・music・traditional-color・unexpected・yoji の9本（`src/app/play/*/result/[resultId]/page.module.css` が `[slug]` を除いて9つ。8章の列挙とも9本で合う）。表の最後の行も「7本」と書いて8つの名を並べている（character-fortune を別の行にしたので8本）。
- nakamawake の `ResultModal.module.css` の行が 4-2 では `:35-53`、5-2 では `:36-52` で揃っていない。
- 2-2 の記号面の行「和色は結果の中身ではない（2-4）」の参照先は 2-3（2-4 は OGP との関係）。
- 1-4 の yoji-kimeru の行は、セルの中の「`|` 区切り」の `|` が表の区切りとして読まれ、列がずれて壊れている（「組み方」の列が5列目にはみ出す）。`\|` にするか言い換える。
- 1-1 の数字の行は char-count の補助の字（`.primaryStatLabel` 0.85rem・`.statLabel` 0.8rem・`:111` 0.7rem）が §4 の下限未満であることを書いていない（ほかの行は下限未満を書いている）。irodori の「n/5」（`.progressText` 0.85rem・600）も同じ。

### 7. [Minor] T4 の行にある「結果の包みのクラス名」が棚卸しに無い

T4 の行は `medalWrap`・`medalLabel`・`showMedal` を今の見た目の呼び名にすると書くが、棚卸しにはその所在が無い。実物では `ResultCard.tsx`・`ResultCard.module.css`・`ResultPageShell.tsx`・`ResultPageShell.module.css` に加えて、`DailyFortuneCard.tsx`・`DailyFortuneCard.module.css` にもあり、名前は `medalWrap`・`medalLabel`・`medalLabelDone`・`medalHeading`・`medalReveal`・`showMedal` の6つある。7章のコメントの表と同じ形で所在を足す。あわせて、結果の部品に残る経緯のコメント（`StarRating.tsx:4-7` の「cycle-232 … T-6 r1 N-1」、`fuda-image.tsx:104` の「従来どおり … 既存挙動を完全に保つ」）も7章に足す。T4 でこれらのファイルに触るときに、CLAUDE.md のツギハギ禁止で消すものである。

### 8. [Minor] ダークを見ていない

冒頭のとおり画面はライトだけで測っている。T4 はダークに別の値を持つもの（和色の dark の8色、Shiki の `--shiki-dark-bg` `#121212`、mermaid の `dark`）を扱い、AP-WF05 もダークの確認を求める。少なくとも包み（解き終えた画面と結果のページ）とブログのコード・表・GFM Alert は、ダークの 375 でも見て、ライトと違う点があれば書く（ダークの結果のページを1枚見た範囲では、印と品名の位置・タイプ名の折れ方はライトと同じだった）。

### 9. [Minor] index.md から辿れない

`index.md` に `t4-inventory.md` へのリンクが無い（T2 の棚卸しは「T2 着手前の洗い出し」の行から辿れる）。`.claude/rules/doc-directory.md` のとおり、index.md から辿れるようにする。

## 設計の材料としての見立て

GA の数（9章）はおおむね正しく、「結果に着いた回数の 9割以上が character-personality の解き終えた画面で、87% が mobile」という優先の軸は正しく読み取れる。ただし、その面の実物（指摘2）が棚卸しに無いので、優先すべき面の問題（印が字に重なる、タイプ名が語の途中で折れる、包みが最初の画面を占め札の保存の入口が下端に掛かる）が材料に載っていない。逆に、ゲーム（28日で結果1回）は GA から分かる（指摘1）ので、ゲームの手直しの優先度が低いことを数で示せる。

## 合否

**不合格（改善指示）。** Major 4件（指摘1〜4）、Minor 5件（指摘5〜9）。

planner（または棚卸しを書いたエージェント）に全件を直させ、直したあと、今回の指摘だけでなく全体をもう一度レビューに出すこと。
