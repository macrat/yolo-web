# T5-5b 第6回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘5つは、どれも直った。完了の条件6つも引き続き満たす。ビルド・試験・型・lint・整形もすべて通る。375 の画面は、来訪者にとって分かりやすい。結果を読み終えた所から全幅の罫線を1本越えると、「次はこれを試してみよう」と「もう一度挑戦する」に着く。

今回も、T5-5b の全ファイルのコメントと型を1つずつコードと突き合わせた。その結果、コードと合わない所がまだ3か所ある。

- コードと食い違う部品の説明が1つ。
- 渡されるだけで使われない引数が1つ。前回の指摘4と同じ種類のもの。
- 意味が2通りに読める props の説明が1つ。

どれもコードの動きは変えずに直せる。見つけたものは、ここにすべて挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行と 5-c、index.md の「T5-5b の PM の判断」と「T5-5b のレビューから次のタスクへ」、review-t5-5b-1〜5.md。
  - コミット 37bd762f（22ファイル）の差分。
  - 作業ツリーの8ファイルの差分。
- 全文を読み、コメントと型を1つずつコードと突き合わせたファイル
  - `ResultCard.tsx`・`QuizContainer.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`・`recommendationPlacement.ts`。
  - 追加の読みもの3つ（`CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`・`ScienceThinkingResultExtra.tsx`）。
  - `ResultExtraLoader.test.tsx`、`ResultCard.test.tsx` のモックの部分、`src/app/play/[slug]/page.tsx`。
  - コミットの CSS と、試験の説明の文。
- おすすめのリンクの行き先の数え方
  - 診断・クイズのデータの `recommendationLink` を、行き先ごとに数えた。
  - 辞典の項目は13（伝統色5・四字熟語8）。辞典の一覧は9（伝統色3・漢字2・四字熟語4）。ほかの遊びは17。
  - 一覧の9と遊びの17が、「次はこれを試してみよう」に入る（下の指摘1）。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。
  - `node_modules` が無いことを確かめてから `cp -al` した。作業ツリーの8ファイルを重ね、`cmp` で元と同じことを確かめた。
  - その書き出しで次を走らせ、すべて通った。
    - `npm run build` は exit 0。
    - `vitest --maxWorkers=2 src/play` は141ファイル・2158件がすべて通った。
    - `tsc --noEmit` は exit 0（build の前に走らせたときは、build が作る `release-id` が無いので落ちる。build のあとで走らせた）。
    - `src/__tests__/bundle-budget.test.ts` は7件すべて通った。
    - コミットの `.ts`・`.tsx` と8ファイルにかけた `eslint` は exit 0。
    - コミットの全ファイルと8ファイルにかけた `prettier --check` も通った。
- 画面
  - 自分で `next start -p 3693` を立てた。`/opt/pw-browsers/chromium-1194` の Chromium で、375×800 のまま解き終えた画面まで実際に解いた。
  - 解いたのは6つ。science-thinking・character-fortune（`?ref=commander`）・japanese-culture（`?ref=sado`）・character-personality・traditional-color・kanji-level。
  - science-thinking はライト、character-fortune はダークで、読みものから「次はこれを試してみよう」への境目も撮った。
  - 見たことは次のとおり。
    - 一番外側のセクションは、どれも「結果と共有 → このタイプについて → 次はこれを試してみよう → すべてのタイプ → よくある質問以降」の順だった。
    - 例外は2つある。kanji-level は「このタイプについて」と「すべてのタイプ」を持たない。japanese-culture は「すべてのタイプ」を持たない（前回までに T7 へ渡したとおり）。
    - science-thinking では、「あなたの思考プロフィール」（レーダー・量の帯・招待）が「このタイプについて」の最後にある。そのすぐ下に全幅の罫線があり、そのあとに「次はこれを試してみよう」と「もう一度挑戦する」が来る。前回リファクタした `RESULT_EXTRAS` の表を通しても、答えがレーダーまで届いている。
    - character-fortune と japanese-culture の相性（`ref` あり）は、「このタイプについて」の最後の小見出しとしてある。そのあとに招待があり、罫線を越えて「次は」が来る。
    - character-personality は、「この結果を共有」（y=942）から「次はこれを試してみよう」（y=2600）まで 1,658 だった。index.md の 1,560〜1,730 の幅に入る。
    - 6つとも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。横のはみ出しは 0 だった。コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`next start` の親）と、その子の `sh` と `next-server` だけを止めた。
  - 書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                         | 結果                                                                                                                                                           |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `ResultCard.test.tsx` のモックの説明で MusicPersonalityContent を「実物」 | 直った。「Animal・TraditionalColor は実物を、MusicPersonalityContent は下の vi.mock のモックを」と、133 行のモックと合う                                       |
| 2. `ScienceThinkingResultExtra.tsx` の「結果のリンクから開いたとき」         | 直った。「答えを受け取らないときは招待だけを出す」と、条件で言う形になった                                                                                     |
| 3. `ResultExtraLoader.test.tsx` の使われない3つの `vi.mock`                  | 消えた。あわせて、スタブが `referrerTypeId` と `answers` も属性に写し、3つの slug それぞれに渡る値を確かめる試験になった                                       |
| 4. 2つの `render*Extra` の戻り値の型の、使われない2つ目の引数                | 直った。3つとも `(resultId: string) => React.ReactNode` にそろった。`ResultExtraLoader` の3つの Wrapper の props の型も、1つの `ResultExtraProps` にまとまった |
| 5. `page.tsx` の説明が `ResultExtraLoader` の受け持ちを取り違えている        | 直った。「有効なタイプかを確かめるのは ref を受け取って相性を出す各部品」と、実際の受け持ちで言う                                                              |

`ResultExtraLoader.tsx` は、Wrapper の props の型をまとめたうえで、slug の分岐3つも `RESULT_EXTRAS` の表1つにした。`hasResultExtra` が同じ表を見るので、追加の読みものを足す人が片方だけ直して崩す心配が無い。

## 完了の条件

前回までのとおり、6つとも満たす（上の「画面」の値のとおり）。

## 指摘（どれも builder が直す）

### 1. `ResultCard.tsx` の頭の説明が、「次は」に置くおすすめを「ほかの遊びへの」とだけ言っている

頭の説明の 11 行は次のとおり。

```ts
 *   3. 次はこれを試してみよう（「もう一度挑戦する」と、ほかの遊びへの結果ごとのおすすめ、次の遊びの一覧）
```

`recommendationPlacement` が「次は」に置くのは、ほかの遊びと、辞典の一覧である。このことは、`recommendationPlacement.ts` の説明（「ほかの遊びや、辞典の一覧への誘い」）と、同じファイルの 415〜416 行（「辞典の一覧やほかの遊びなら「次はこれを試してみよう」に置く」）に書いてある。実際のデータでも、「次は」に入る26本のうち9本は辞典の一覧である。kanji-level の「漢字辞典で漢字の世界を探検しよう」（`/dictionary/kanji`）などがそうだ。

同じファイルの中で、頭の説明と 415 行が食い違っている。頭の説明だけを読む人は、辞典へのリンクはどれも「このタイプについて」に入ると読み違える。「ほかの遊びや辞典の一覧への結果ごとのおすすめ」のように、415 行と同じ分け方で言い直してください。

### 2. `ScienceThinkingResultExtra` の `referrerTypeId` は、渡されるだけで使われていない

`referrerTypeId` は次の順に3か所で受け渡されるが、どこでも使われない。

1. `ResultExtraLoader` の science-thinking の Wrapper が、`renderScienceThinkingExtra(referrerTypeId, answers)` と渡す。
2. `renderScienceThinkingExtra` の1つ目の引数が、それを部品の props の `referrerTypeId` に渡す。
3. 部品 `ScienceThinkingResultExtra` は `resultId` と `answers` しか取り出さない。

理系思考タイプ診断は相性のデータを持たない（`src/play/quiz/data/science-thinking.ts` に `getCompatibility` も `isValid…TypeId` も無い）。そのため、この値の行き先は無い。

読む人は、理系思考タイプ診断でも友だちの `ref` で何かが変わると読み違える。`ResultExtraLoader.tsx` の頭の説明にある「相性」が、この部品にもあるように見える。前回の指摘4（使われない2つ目の引数）と同じ種類で、前回の2つを直した今は、3つの部品のうちこれだけが食い違っている。

次の3つから `referrerTypeId` を外してください。

- `renderScienceThinkingExtra` の引数
- `ScienceThinkingResultExtraProps`
- `ResultExtraLoader` の science-thinking の Wrapper（`{ resultId, answers }` だけを取る）

`ScienceThinkingResultExtra.test.tsx` の `renderScienceThinkingExtra(undefined, answers)` も、あわせて直す。`ResultExtraLoader` の `ResultExtraProps` の `referrerTypeId` は、ほかの2つが使うので残す。画面の動きは変わらない。

### 3. `QuizContainer.tsx` の `referrerTypeId` の説明が、2通りに読める

`QuizContainer.tsx` の 41 行は次のとおり。

```ts
/** Optional referrer type ID from URL search params (for compatibility) */
```

T5-5b が書き直した props の説明のうち、これだけが英語のまま残っている。それよりも問題なのは、「for compatibility」である。これは「互換性のため（古い形を残すため）」とも読めるが、実際は相性（友だちとの相性）を出すための値である。

同じ値を受け取る `ResultCard.tsx` の説明は「相性を見る友だちのタイプの id（共有のリンクの ref）」と書いている。これと同じ言い方で、ほかの props の説明と同じく日本語にしてください。コードの動きは変わらない。

## 良い点（来訪者の目で見て）

- 理系思考タイプ診断では、自分の思考のレーダーと量の帯が、読みものの続きとして来て、招待で締まる。そのすぐ下の罫線のあとに「もう一度挑戦する」がある。読みものの途中に別の区画が割り込まず、読み終えた所で次の一歩が見つかる。
- 友だちの共有のリンクから来た来訪者（character-fortune・japanese-culture）は、自分のタイプを読み終えた所で相性を読む。そのあとに招待が来て、それから次の遊びに進める。結果についてのものが1つのセクションにまとまっている。
- character-personality では、共有から次の遊びまでが 3,954 から 1,658 に縮んだ。24行の一覧は、次の遊びのあとに全件残っている。ほかのタイプを眺めたい来訪者も困らない。
- 知識クイズ（kanji-level）は、中身の無い「このタイプについて」を出さない。結果と共有のすぐ下で「次はこれを試してみよう」に着く。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」と、science-thinking の「思考プロフィー／ル」。
