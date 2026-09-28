# T4-20 のレビュー 4巡目（T4 の完了の監査の全体の見直し）

HEAD 560b994 で確かめた。3巡目の指摘への対応（f7181d5・560b994）に加え、T4 の行と棚卸し 11章の論点のうち、コードに残るものを grep で見直した。開発サーバーは立てていない（画面の変更が無いため）。

## 1. 3巡目の指摘

| 指摘                                   | 状態                                         | 根拠                                                                                                                                                                                                                      |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minor-1（src/tools の偽の記述と経緯）  | ほぼ直った。新しい偽の記述と取りこぼしが残る | 下の 2 と Minor-1〜3                                                                                                                                                                                                      |
| Minor-2（T6 の行に画像の生成器の注記） | 直った                                       | T6 の行に「画像の生成器（`oklchToHex.ts`・`utsuwaHex.ts`・`ogp-image.tsx`・`wairoHex.ts`・`fuda-image.tsx`）のコメントに残る古い語…と経緯の注記…を消し…（t4-design.md 7-1）」がある。テストの名の1件だけ漏れる（Minor-5） |

## 2. 560b994（84ファイル）

- **振る舞いは変わっていない**: 変更前と後の全84ファイルを、TypeScript の printer でコメントを除いて出力し（CSS はコメントを除いて空白を詰め）比べた。差は 23ファイルの `describe`・`it`・`test` の第1引数（テストの名）と、`useRegexWorker.ts` の Worker のソースの文字列の中のコメント2行（×2）だけ。行数の差は0。アサーション・UI の文字列・CSS の宣言は1つも変わっていない。スナップショットのテストは `src/tools` に無いので、名の変更が結果に響く所も無い。
- **消えたもの**: `src/tools` の `道具箱`・`個別論点`・`T-4b`・`cycle-NNN`・`低指摘`・`是正`・`旧実装`・`旧 E-n`・`B-NNN`・`[A-G]-n`・`U-n` は0件（`generated/` とデータを除く）。3巡目に挙げた行はすべて消えた。
- **「詳細ページが描画する」の新しい記述**: タイルを import するのは `src/app/tools/*/page.tsx` だけで（`src` を grep）、ここは正しい。ただし同じコメントの例が偽になった（Minor-1）。
- **V-n / T-n の番号**: 同じファイルの頭の一覧の索引として働いている所は受け入れてよい（読む者がファイルの中だけで閉じて使え、外の文書を指さない）。ただし一覧と食い違う所が4ファイルにある（Minor-3）。

## 3. T4 の行と論点の見直し

- `CountdownTimer`・`GameDialog`・`useDialog`・`rankBadge`・`--wairo`・`Tsutsumi`・`showMedal`・`medalWrap`・`medalLabel`・`resultVisual`・`accentColor`・`mistakePulse` は、ブログの記事（過去の記録）を除いて `src` に0件。
- 「成果物パレット」は `src/lib/oklchToHex.ts:5`（T6 の行が受け持つ）と `src/lib/__tests__/fuda-image.test.tsx:112` のテストの名（Minor-5）だけ。
- 1〜3巡目で確かめた T5・T5a・T7・T8・T9・T10・T11 への受け渡しは、行に残っている。f7181d5 で T5 の行から「古い点検表の番号（約200か所）」の句が消えた（`git log -S点検表`）。`src/tools` の分は 560b994 が消したが、`src/tools` の外の分がどの行にも無くなった（Minor-4）。

## 判定: 改善指示

### Major

無し。

### Minor

- **Minor-1（新しく書いた「使い方」が偽）**: 560b994 は「道具箱や詳細ページから同一エクスポートを描画する」を「ツールの詳細ページ（src/app/tools/<slug>/page.tsx）が描画する」に書き換えたが、その下の例が、詳細ページが描かない variant を並べたまま。詳細ページはどれも `variant="full"` だけを描く（`src/app/tools/*/page.tsx` を grep）。偽になったのは次の6ファイル。
  - `LineBreakRemoverTile.tsx:28-30`（`remove`・`replace-space`・`smart-pdf`）
  - `ColorConverterTile.tsx:26-28`（`hex`・`rgb`・`hsl`）
  - `HashGeneratorTile.tsx:41`（`sha256`）
  - `DateCalculatorTile.tsx:28-30`（`diff`・`add`・`wareki`）
  - `HtmlEntityTile.tsx:28-29`・`UrlEncodeTile.tsx:28-29`（`encode`・`decode`）

  例を `variant="full"` の1行にする（ほかの variant の型と作りは B-755 が消す。完了の条件 index.md:116）。

- **Minor-2（src/tools に残る経緯・進め方の注記）**: コミットの題（「drop toolbox, process and checklist-id notes」）が言う掃除から漏れている。
  - `text-diff/__tests__/TextDiffTile.test.tsx:413`「reviewer 指摘: …」（このコミットが触ったファイル）
  - `cron-parser/__tests__/CronParserTile.test.tsx:607`「かつて h3 で描画され h1→h3 とレベルを飛ばしていた回帰を防ぐ」（このコミットが書き換えたブロックの中。直前の行の「h1 直下なので h2 が正」で足りる）
  - `csv-converter/logic.ts:195`・`csv-converter/__tests__/logic.test.ts:169`・`:197`「ux-gate-findings.md の指摘…欠落を統一」（指す文書は `docs/archive/cycle-225/` にある過去の記録。今の理由は「エラーの文は句点で終える」だけ）
  - `dummy-text/DummyTextTile.tsx:105`・`:186`「文数は廃止」（理由の「日本語の文の素材が2文を含むので入力の文数と合わない」は残し、「廃止」を今の振る舞いの言い方にする）
  - `regex-tester/__tests__/RegexTesterTile.test.tsx:532`「（a11y 回帰防止）」
  - テストの名の「旧トークン」: このコミットは `BmiCalculatorTile`・`BusinessEmailTile`・`SqlFormatterTile`・`UnitConverterTile` などの名から「旧」を外したが、同じ形の名とコメントが約20か所に残り（`HtmlEntityTile.test.tsx:285`・`CronParserTile.test.tsx:654`・`ImageBase64Tile.test.tsx:705` など）、ファイルによって言い方が割れた。どちらかにそろえる。
- **Minor-3（V-n / T-n の番号が頭の一覧と食い違う）**: 番号を残すなら、同じファイルの一覧と一対一であることが条件。次は満たさない。
  - `csv-converter/__tests__/CsvConverterTile.test.tsx:18` の一覧に「V-14: 変換後に形式変更すると旧結果がクリアされない」があるが、そのテストが無い（無い検証をあると言う）
  - `sql-formatter/__tests__/SqlFormatterTile.test.tsx:261`「V-11」と `line-break-remover/__tests__/LineBreakRemoverTile.test.tsx:423`「V-14」が、頭の一覧に無い
  - `regex-tester/__tests__/RegexTesterTile.test.tsx` は頭の一覧が無いのに T-1〜T-13 を振り、T-13（:532）が T-12（:563）の前にある（足した順の跡）

  この4ファイルは、一覧とテストを合わせるか、番号を外す（番号を外したほかのファイルとそろう）。

- **Minor-4（src/tools の外の点検表の番号と経緯が、どの行にも無い）**: f7181d5 で T5 の行の「古い点検表の番号」の句が消えたので、次が受け手を失った。T5 の「cycle- の番号を語るコメント 13ファイル」には入らない。
  - `src/app/tools/hash-generator/page.tsx:30`「A-4:」
  - `src/blog/_components/__tests__/MobileToc.test.tsx:87`「U-1」
  - `src/play/__tests__/registry.test.ts:294`「B-209」
  - `src/play/quiz/data/word-sense-personality.ts:21`・`:26`「B-1」「A-3」
  - `src/play/games/kanji-kanaru/_lib/storage.ts:172`・`:184`「pre-B-190 format」（保存の形の互換の説明としては要るので、番号でなく形の違い（`feedbacks` を持たない）で言う）
  - `src/lib/__tests__/site-metadata.test.ts:21`・`:31`「道具箱中心から診断中心へ刷新した」「旧自己定義の核…降ろした」

  builder が今直すか、T5 の行に「src に残る点検表・backlog の番号（`A-4`・`U-1`・`B-209` など）と刷新の経緯のコメント」と書く。

- **Minor-5（T6 の行のテストの名）**: `src/lib/__tests__/fuda-image.test.tsx:112`「記号面の地に和色 hex（成果物パレット）を使う」が、T6 の行の列挙（生成器5ファイルのコメント）に入らない。3巡目 Minor-2 と同じ理由で、行に「とそのテストの名」を足す。

### 修正の進め方

1. Minor-1〜3 と Minor-4 の直す分は builder が行う（コメントとテストの名だけ。振る舞いを変えないことを、今回と同じくコメントを除いた比較で確かめる）。Minor-4 を T5 に渡す場合と Minor-5 は、planner（または PM）が index.md の行に書き足す。
2. 直したあと、もう一度レビューを受ける。そのレビューは、今回の指摘だけでなく全体を見直す。
