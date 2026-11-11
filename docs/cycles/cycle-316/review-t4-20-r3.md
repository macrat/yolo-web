# T4-20 のレビュー 3巡目（T4 の完了の監査の全体の見直し）

HEAD d50c01a で確かめた。2巡目の指摘への対応（4bff5da・d50c01a）に加え、T4 の行と棚卸し 11章の24の論点、t4-design.md 7-1・9章の受け持ちの表を見直した。画面は `next dev -p 3611` を Chromium 1194（`/opt/pw-browsers/chromium-1194`、playwright のライブラリ）で開き、375×667 のライトとダークで `/play/daily` を撮った。触ったファイルのテスト（`src/play/fortune`・`src/app/about`・`bundle-budget`・`regex-tester`・`text-diff`、10ファイル161件）は通る。

## 1. 2巡目の指摘

| 指摘                                     | 状態         | 根拠                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minor-1（補足事項から行へ渡すもの）      | 直った       | 補足事項の 252・253・268・278（→T5）、260 の (6)（→T5 の「診断の結果のページの 375px でパンくずが2〜3行」）、281（→T5 の「320px と 1280px で撮って確かめる」）、273（→T6 の `resultHeadingName`）、279（→T6 の `generateResultImage`、→T10 の `surface="text"`）、277（→T10 の `content_end`）、251・254・263（→T9）、227・237・242（→T11 の T3 の `DESIGN.md` の言い方）、237 のブログのタグ（→T5 の索引の語）、247 の読み上げ（→T9 の (1)〜(5)）、289 の B-620（→T9 の二度打ち）。どれも行に届いている |
| Minor-2（T4 が書き換えたファイルの経緯） | 一部が直った | `types.ts` の B-024、道具のタイルの頭の cycle-22x、`HtmlEntityTile.module.css` の注記は消え、今のコードを言う文になった。ただし同じコミットが直したファイルの中に、同じ種類の注記と、今は偽の記述が残る（下の Minor-1）                                                                                                                                                                                                                                                                                  |
| Minor-3（占いの「明日も来てね！」）      | 直った       | 下の 2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## 2. d50c01a

- **振る舞い**: コメントを除く差分は `DailyFortuneCard.module.css` の `.comeback { margin-block-start: var(--space-16) }` の1行だけ。`middleware.ts` の `DELETED_BLOG_SLUGS` は値が同じで、行末のコメントだけが変わった。
- **占い（`/play/daily`、375px）**: 知らせの行（898〜924）の下端から「明日も来てね！」（940〜971）まで 16px、そこから「他のジャンルも試してみよう」（1003〜）まで 32px。「結果をコピー」を押して「コピーしました」が出ても、案内の文の位置は 940 のまま動かない。ダークも同じ間隔（829→845、877→909）。撮った画面では、知らせと案内の文が別の塊に見え、案内の文と次のセクションの見出しのあいだは、それより広い。横送りは 0。
- **`.comeback` のコメント**: 今の組み方（区画の外・知らせの行から 16px・知らせの行がいつも1行分の高さを取るので位置が変わらない）を正しく言う。
- **書き直した文の正しさ**: `regex-tester/meta.ts`「タイルのサンプルの選択肢に、この順で並ぶ」は、`REGEX_SAMPLE_INPUTS` を使うのが `RegexTesterTile.tsx` だけであることと合う。`TextDiffTile.tsx` の「振る舞い」の4項目、`bundle-budget.test.ts` の whitelist の説明、`about` のテストの説明も今のコードのとおり。
- **クイズのテストの `docs/cycles/cycle-29x/...md` の参照**（`character-personality.test.ts:24`・`:36`、`reachability.test.ts:9`・`:172`・`:336`）: **受け入れてよい**。どれも「一度きりの悉皆の検証の値」「写像表の出典」「計測の記録」がどこにあるかを今の事実として言う文で、何をどう変えたかの経緯を語っていない。CLAUDE.md は経緯と理由をサイクルの文書に置くと定めており、コードからその置き場所を指すのはその定めに沿う。指す4ファイルはすべてある。T5 の行の「`cycle-` の番号を語るコメント…13ファイル」は、これらを除いた数とちょうど合い、線引きがそろっている。

## 3. T4 の行と24の論点の見直し

1巡目の表（review-t4-20.md の (a)(b)）を HEAD で確かめ直した。

- `CountdownTimer`・`GameDialog`・`useDialog`・`gameTitle`・`coreSentence`・`rankBadge`・`--wairo`・`Tsutsumi`・`medal*`・`showMedal` は src に0件。`@keyframes spin` は `globals.css` に無い。`revealControl` は `src/lib/reveal.ts` にある。ゲーム4本とも `HowToPlay.tsx` を持つ。`0.8125rem` は `src/play` に0件。
- 棚卸し 7-3 の経緯のコメント（`StarRating.tsx`・`SolvedGroups.module.css`）は消えている。棚卸し 7-4 の古い語は、`src/play` と `src/components` の結果の部品には残っていない。
- t4-design.md 9章の表で T5・T5a・T7・T8・T9 に渡したものは各行にある。7-1 の受け持ちの表で T6 に渡したものだけが、T6 の行に無い（下の Minor-2）。

## 判定: 改善指示

### Major

無し。

### Minor

- **Minor-1（d50c01a が直したファイルに残る、偽の記述と経緯）**: d50c01a は「触ったファイルの経緯のコメントを消す」コミットで、道具のタイルの頭の cycle-22x の注記を消したが、同じファイルの中に次が残る。
  - **消えた機能を今あるものとして言う記述**: 道具箱（`/toolbox`）は撤去され `/tools` へ転送している（`src/__tests__/redirects.test.ts`）のに、「道具箱や詳細ページから同一エクスポートを描画する」（`BmiCalculatorTile.tsx:25`・`ColorConverterTile.tsx:24`・`DateCalculatorTile.tsx:26`・`EmailValidatorTile.tsx:24`・`HashGeneratorTile.tsx:39`・`HtmlEntityTile.tsx:26`・`LineBreakRemoverTile.tsx:26`・`MarkdownPreviewTile.tsx:35`・`TextReplaceTile.tsx:25`・`UnitConverterTile.tsx:24`・`UrlEncodeTile.tsx:26`）、「道具箱で同居しても」（`MarkdownPreviewTile.tsx:25`・`PasswordGeneratorTile.tsx:22`・`RegexTesterTile.tsx:12-13`・`ByteCounterTile.tsx:13`・`CsvConverterTile.tsx:17`・`SqlFormatterTile.tsx:18`・`:23`・`UnitConverterTile.tsx:19`）、テストの「道具箱同居テスト」（`BmiCalculatorTile.test.tsx:10`・`:269`、`RegexTesterTile.test.tsx:398-400`）。`src/tools` の `道具箱` は27行（`src/__tests__/redirects.test.ts` などの撤去を確かめる行は除いた数）。経緯より悪く、今のコードの説明として偽である。
  - **同じファイルの中で半分だけ直した経緯**: `ImageResizerTile.tsx` は頭の「（個別論点①-5）」を消したが、`:155`「個別論点①-5: GIF誤誘導解消」と `:398` が残る。`DateCalculatorTile.tsx` は頭の「（8個超の hardcoded id を移行）」を消したが、`:84`「旧実装の hardcoded id（…）」が残る。ほかに `BmiCalculatorTile.tsx:73`「T-4b 確定」、`CronParserTile.test.tsx:308`「T-4b 方針」、`ImageResizerTile.test.tsx:342`「T-4b」、`KanaConverterTile.test.tsx:24`・`:26`・`:347`・`:392`「旧 E-6 相当」「旧 E-8 相当」、`LineBreakRemoverTile.test.tsx:422`「旧 E-12 相当」、`TextDiffTile.test.tsx:221`・`:264`「①-12 個別論点」「①-2 個別論点」（同じファイルの頭の「個別論点」は書き直した）。
  - T5 の行の「古い点検表の番号（(A-6)・C-3 準拠・E-12 など約200か所）」は番号を消す作業として読め、「道具箱」の記述・「旧実装」「旧 E-6 相当」の経緯・cycle-228 のタスク番号（T-4b）・「個別論点①-5」を含むとは読みにくい（B-755 の「同居を前提にした作り」を消す作業が頭のコメントに及ぶかも、行からは分からない）。builder が d50c01a の触ったファイルでこれらを直すか、T5 の行に「道具のタイルとテストに残る、撤去した道具箱を今あるものとして言う記述と、`旧 …`・`T-4b`・`個別論点①-n` の経緯」と明記する。直すなら、同じファイルで直した所と直さない所が並ぶ今の状態を解消する方を勧める。
- **Minor-2（T6 の行に無い、t4-design.md 7-1 で T6 に渡した注記）**: 7-1 の受け持ちの表は、棚卸し 7-4 の古い語のうち `fuda-image.tsx`・`ogp-image.tsx`・`wairoHex.ts`・`utsuwaHex.ts`・`oklchToHex.ts` の分と、`fuda-image.tsx` の経緯のコメント（今は `:99`「未指定なら従来どおり … 既存挙動を完全に保つ」）を T6 に渡した。T6 の行は t4-design.md の 7-2（画像の §10 との食い違い）だけを指し、これらを言っていない。いまも `oklchToHex.ts:5`「成果物パレット（和色）」、`utsuwaHex.ts:2`・`:8`・`:10`「器（うつわ）の色」「器定数」、`ogp-image.tsx:8`・`:210`・`:270`「のれん帯」「品名」「店号」が残る。`ogp-image.tsx` は画像を組み直すときに書き換わりうるが、`oklchToHex.ts`・`utsuwaHex.ts`・`fuda-image.tsx:99` は画像の見た目の直しでは触らないこともあり、行だけを読む T6 の builder とレビューは拾えない（2巡目の Minor-1 と同じ理由）。T6 の行に、「`fuda-image.tsx`・`ogp-image.tsx`・`wairoHex.ts`・`utsuwaHex.ts`・`oklchToHex.ts` の古い語（成果物・器・のれん・パレットなど。棚卸し 7-4）と `fuda-image.tsx` の経緯のコメントを、今の §2・§10 の語で言い直す（札を消すなら、消えるファイルの分は要らない）」と書く。2巡目のレビューが t4-design.md から T5〜T9 に渡したものを確かめたとき、7-1 の表のこの行を見落としていた。

### 修正の進め方

1. Minor-1 のコメントは builder が直す（T5 に渡すと決めるなら、T5 の行の書き足しを planner（または PM）が行う）。Minor-2 の T6 の行の書き足しは planner（または PM）が行う。
2. 直したあと、もう一度レビューを受ける。そのレビューは、今回の指摘だけでなく全体を見直す。
