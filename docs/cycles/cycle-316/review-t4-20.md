# T4-20 part B のレビュー（T4 の完了の監査）

HEAD 05362a4 のコードで確かめた。`npx tsc --noEmit` は通り、`src/test/design-gate.test.ts` は31件が通る。375px と 320px の測りは、`next start -p 3456` を Chromium 1194 で開いて行った。

## (a) index.md の T4 の行

| 項目                                                                          | 状態                  | 根拠                                                                                                                                 |
| ----------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| BudouX による文節の区切り（サーバーで `<wbr>`）と、タイプ名への適用           | 済み                  | `src/lib/phrase-breaks.ts`、`src/components/PhrasedText/index.tsx`、`ResultBox/index.tsx:129`                                        |
| GameDialog をやめ、結果を盤の下に置く                                         | 済み                  | src に `Dialog`・`useDialog` の一致が0件。4本のゲームとも375pxで `<dialog>` が0個                                                    |
| kanji-kanaru の盤が375pxではみ出さない                                        | 済み                  | 375pxで測ると `scrollWidth` が375                                                                                                    |
| behaviorsItem と `.layout` の余白                                             | 済み                  | `behaviorsItem` の一致が0件（Reading の部品に置き換えた。`ResultCard.tsx:185-200`）                                                  |
| ゲームの頭。入力欄の見えるラベルと、主操作をファーストビューに入れる（B-621） | 済み                  | ラベルは「中級の漢字を1字入力（あと6回）」「中級の四字熟語を入力（あと6回）」。375×667 で、送信ボタンの下端はそれぞれ 536px と 577px |
| 共有のボタンを1つにする                                                       | 済み                  | `GameShareButtons` と quiz の `ShareButtons` はコードに無い（記事の本文にだけ残る）                                                  |
| GFM Alert と `hr`                                                             | 済み                  | `Prose.module.css:50-63`（太い線の囲みと太字の見出し）、`globals.css:269`（`hr`）                                                    |
| 字形が主題の要素の書体                                                        | 済み                  | `KanjiDetail.module.css:22`、`YojiDetail.module.css:19`、`YojiKimeru.module.css:97`                                                  |
| 結果のボックス。包み（Tsutsumi）を置き換える                                  | 済み                  | `src/components/ResultBox`。`src/components/Tsutsumi` と `In` は消えている                                                           |
| 中身か装飾か（色・状態・字形・ブログの中身。B-641）                           | 済み                  | 下の (b) の 7〜19 と (c)                                                                                                             |
| `.table-scroll` に枠と `tabindex` を付ける                                    | 済み                  | `scroll-frame.ts:94-95`、`Prose.module.css:99-102`。320pxで測ると、横に送る枠は太さ3pxで `tabindex=0`                                |
| 和色のトークンを `globals.css` から消す                                       | 済み                  | CSS に `--wairo` が0件。hex は `src/lib/wairoHex.ts` にあり、OGP の側（T6）が使う                                                    |
| rankBadge を置き換える                                                        | 済み                  | 一致が0件                                                                                                                            |
| 色だけで伝わる判定に、字や形を足す                                            | 済み                  | `CharFeedbackCell.tsx:13`（◯△×）、`SolvedGroups.tsx:46`（難易度の語）、`RadarChart.module.css` は無彩                                |
| irodori の進みの点                                                            | 済み                  | `irodori/GameContainer.tsx:376` で `ProgressBar` を使う                                                                              |
| `accentColor` を型・データ・写し・テストから外す                              | 済み                  | src に一致は無い（記事 `2026-02-22-...md:133` にだけ残る。これは設計のとおり）                                                       |
| 結果の部品のコメントが指す節（「§2 成果物パレット」など）                     | 済み（T4 の範囲では） | `resultVisual.ts` は消えている。`fuda-image.tsx:71` と `oklchToHex.ts:5` に残るのは T6 の範囲（t4-design 7-1）                       |
| クラス名 `medalWrap`・`medalLabel`・`showMedal`                               | 済み                  | 一致が0件                                                                                                                            |
| 診断の結果の OGP 画像の確かめ                                                 | T6 に渡した           | t4-design 7-2 と index.md の T6 の行                                                                                                 |

## (b) 棚卸し 11章の24の論点

| #                                              | 状態                                  | 根拠                                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 解き終えた画面（折り方・並び・タイプ名の形） | 済み                                  | 並びは ResultBox → FudaActions → ShareButtons → もう一度挑戦する（`ResultCard.tsx:468-546`）。折り方は PhrasedText                                        |
| 2 包みの置き換え                               | 済み                                  | Tsutsumi とトップの見本は消えている（f4f8d32 の `page.tsx`）                                                                                              |
| 3 印                                           | 済み                                  | `src/components/In` は消えている                                                                                                                          |
| 4 道具の結果                                   | 済み（見本の5本）。残りは T5 に渡した | base64・char-count・age-calculator・qr-code・json-formatter が ResultBox を使う                                                                           |
| 5 ゲームのダイアログ                           | 済み                                  | (a) を見よ                                                                                                                                                |
| 6 rankBadge                                    | 済み                                  | (a) を見よ                                                                                                                                                |
| 7 判定の色                                     | 済み                                  | (a) を見よ                                                                                                                                                |
| 8 包みの記号面の和色                           | 済み（画面から消した）。画像は T6     | `fuda-image.tsx:108` は T6                                                                                                                                |
| 9 レーダー・帯・★                              | 済み                                  | `RadarChart.module.css:25-39`、`StarRating.module.css:8` はどちらも `--ink` と `--rule`                                                                   |
| 10 和色のトークン                              | 済み                                  | (a) を見よ                                                                                                                                                |
| 11 irodori の進み                              | 済み                                  | (a) を見よ                                                                                                                                                |
| 12 共有の文の絵文字                            | 済み                                  | src の .ts/.tsx に 🟩🟨⬜ が0件                                                                                                                           |
| 13 accentColor と icon                         | 済み                                  | `QuizResult.color` は traditional-color にだけ残る（`types.ts:270-271`、`ResultCard.tsx:464`）。`icon?:` は src/play に0件                                |
| 14 字形                                        | 済み                                  | (a) を見よ                                                                                                                                                |
| 15 GFM Alert                                   | 済み                                  | `Prose.module.css:50`                                                                                                                                     |
| 16 表                                          | 済み                                  | (c) の B-641 を見よ                                                                                                                                       |
| 17 コードのボックス                            | 済み                                  | `Prose.module.css:65-72`（地も枠も持たない。注釈だけ `--ink-2`）                                                                                          |
| 18 `hr` と引用                                 | 済み                                  | `globals.css:269`、`Prose.module.css:43-47`（細い線）                                                                                                     |
| 19 mermaid                                     | 済み                                  | `blog/[slug]/page.module.css:67-79`（`data-scrolls` の枠）、`MermaidRenderer` は `markScrollFrame` を使う                                                 |
| 20 登場の動きを1回にする                       | 済み                                  | `ResultBox` の `appear`（既定は false。`index.tsx:53-75`）                                                                                                |
| 21 flipIn・shake・spin                         | 済み                                  | src/play の CSS に `flipIn`・`shake`・`spin`・`mistakePulse` は0件。`prefers-reduced-motion` は `YojiKimeru.module.css:123`、`KanjiKanaru.module.css:146` |
| 22 自動で書き換わる表示                        | 済み                                  | NextPuzzleTime は時刻を1つの文で言う。unix-timestamp は止める・動かすのボタンを持つ（`UnixTimestampTile.tsx:197-201`）                                    |
| 23 古い語と経緯のコメント                      | **一部が済んでいない**                | 下の Minor-1                                                                                                                                              |
| 24 OGP 画像                                    | T6 に渡した                           | t4-design 7-2                                                                                                                                             |

## (c) B-578・B-641

- B-578: 満たす。描かれない `color` は traditional-color のほかには残っていない。`accentColor` と `icon` は src のコードに0件。
- B-641: 満たす。320pxで `content-strategy-decision` と `cron-parser-guide` を開くと、文書の `scrollWidth` は320。列の多い表は枠（212px）の中で横に送る（表の幅は724px・893px）。いちばん狭いセルは 43〜120px で、字が1字ずつ縦に並ぶことは無い。

## (d) 2-3 の末尾の型を T9 に渡したか

**一部しか渡していない。** T9 の行には、VoiceOver の聞き取り（タイプ名の見出し、ListStatus）、「聞き方と直し方は t4-design.md の T9 に渡す型のとおり」、iOS の Safari で §4 の折り方を確かめることが入っている。一方、2-3 の末尾が T9 に渡すと決めた次の2つが、T9 の行に無い。

- **文字盤を開いた状態の送り方**（iPhone で推測を3回続けて送り、入力欄と送信のボタンが文字盤の上に見えているか）。2-6 と t4-design:352 も、これを T9 の実機の項目に渡すとしている。index.md のどこにも無い（`grep 文字盤` の一致が0件）。
- 320pt の端末と 200% の作り方（Safari の「aA」を使い、「文字サイズを大きく」は使わない）、括弧・！・…・「10年経っていた」の個別の文節。「t4-design の型のとおり」の参照が読み上げの聞き方についての文なので、これらが含まれるとは読めない。

## 判定: 改善指示

### Major

- **Major-1（d）**: 文字盤を開いた状態の送り方の確かめが、T9 の行に渡っていない。コンテナでは作れない状態で、mobile の来訪者が推測を続けるたびに入力欄が文字盤に隠れるかどうかを確かめる手段は、T9 のほかに無い。このままだと、確かめないまま出荷される。T9 の行に、「2-3 の末尾の型（t4-design.md「T9 に渡す、実機で確かめる項目」の5項目と、聞いたあとの分かれ道）のすべて」を確かめることとして書く。少なくとも、文字盤の項目と 320/200% の作り方は明記する。

### Minor

- **Minor-1（論点23）**: t4-design 7-1 は「T4 のタスクが書き換えるファイルでは、そのタスクが経緯のコメントをすべて直す」と決めている。ところが、T4-9（baac5eb）が書き換えた `src/play/registry.ts:114-116` に、経緯のコメント「旧トップページ専用だった … cycle-232 … で旧トップとともに削除した」が残っている。これは CLAUDE.md のツギハギの禁止にもあたるので、消す。T4-9 が触ったほかのクイズのデータの頭の「設計の正典: docs/cycles/cycle-303/redesign-v2.md」（`word-sense-personality.ts:17`）や、`character-personality.ts:568` の cycle-295 への参照も同じ観点で見直す。
- **Minor-2**: T4-19（f4f8d32）が `src/components/Tsutsumi` を消したため、`src/lib/fuda-image.tsx:14-17` のコメントが、存在しない部品を `{@link import("@/components/Tsutsumi")}` で指したままになっている（「画面の Tsutsumi と同じ視覚言語」）。ファイルの書き換えは T6 の受け持ちだが、この行が偽になったのは T4 の削除によるので、同じ所で直すか、T6 の行に明記する。
- **Minor-3**: t4-design 1187 行で T5 に渡したもの（`.prose h2` の細い下線 `1px solid var(--rule)`（`Prose.module.css:20`）、markdown-preview の外枠・ウェイト 600・h1 の大きさ）が、index.md の T5 の行に無い。t4-design の中の PM の決定にだけ書いてあると、T5 の builder とレビューが拾えない。T5 の行に書く。T4 の作業記録から T5・T6 に渡した他の項目（t4-design 9章の表、index.md 256 行など）も、T5・T6 の行か、その行が参照する文書に届いているかを確かめる。

### 修正の進め方

指摘が残っているので、次の順で進める。

1. index.md の T9・T5（と、必要なら T6）の行は、planner（または PM）が直す。`registry.ts` などのコメントは builder が直す。
2. 直したあと、もう一度レビューを受ける。そのレビューは、今回の指摘だけでなく全体を見直す。
