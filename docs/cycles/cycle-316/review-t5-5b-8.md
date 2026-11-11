# T5-5b 第8回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘4つは、どれも直った。完了の条件6つも引き続き満たし、ビルド・試験・型・lint・整形もすべて通る。375 の画面は来訪者にとって分かりやすい。結果を読み終えた所から全幅の罫線を1本越えると、「次はこれを試してみよう」と「もう一度挑戦する」に着く。

今回も、前回の直しだけでなく、T5-5b の全ファイルのコメント・型・引数を1つずつコードと突き合わせた。コードと合わない所、または読み違えを招く所が2つ残っている（下の「指摘」）。どちらも来訪者に見える動きを変えずに直せる。見つけたものはここにすべて挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行・10-4 の受け持ちの表の T5-5b の行（`QuizContainer.tsx`・`ResultCard.*`・`ResultNextContent.*`）・依存の行。
  - index.md の「T5-5b の PM の判断」と「T5-5b のレビューから次のタスクへ」。
  - review-t5-5b-1〜7.md。
  - コミット 37bd762f（22ファイル）の差分と、作業ツリーの11ファイルの差分。
- 全文を読み、コメント・型・引数をコードと突き合わせたファイル
  - `ResultCard.tsx`・`QuizContainer.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`（とその CSS）・`recommendationPlacement.ts`・`QuizPlayPageLayout.tsx`・`QuizContainer.module.css`・`ResultCard.module.css`・`src/app/play/[slug]/page.tsx`。
  - 追加の読みもの3つ（`CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`・`ScienceThinkingResultExtra.tsx`）。
  - 試験（`ResultCard.test.tsx` の `next/dynamic` のモックとセクションの並びの試験、`ResultExtraLoader.test.tsx`、`ResultReading.test.tsx` の理系思考の部分、`ScienceThinkingResultExtra.test.tsx`、`recommendationPlacement.test.ts`、`ResultNextContent.test.tsx`、`QuizContainer.*.test.tsx`、`QuizPlayPageLayout.test.tsx`）と、`StorybookContent.tsx` の変更。
- 前回の直しの裏づけ（新しいコメントの主張を、それを支えるコードの行と1つずつ突き合わせた）
  - `ResultCard.test.tsx` 18〜22行: モックの分かれ道は Animal（38行）・Music（42行）・TraditionalColor（46行）が先に読み込んだ部品、Yoji（50行）・UnexpectedCompatibility（60行）・ImpossibleAdvice（71行）・ContrarianFortune（82行）が `data-testid` のスタブ、残りが `() => null`（96行）。Music の「下の vi.mock のモック」は 135行にある。`ResultCard.tsx` が `next/dynamic` で読み込む8つ（65〜103行）のうち、どの分かれ道にも当たらないのは `CharacterPersonalityContent`（85行）だけで、説明と合う。
  - `ResultExtraLoader.tsx` 7〜13行: science-thinking の思考プロフィールと招待（`ScienceThinkingResultExtra.tsx` の `ReadingHeading`・`RadarChart`・`QuantityBars`・`InviteFriendButton`）、character-fortune と japanese-culture の相性と招待（各 `*ResultExtra.tsx` の `CompatibilitySection`・`InviteFriendButton`）、music-personality は `MusicPersonalityContent.tsx` の `buildAfterTodayAction`（40・97行）、character-personality は `CharacterPersonalityContent.tsx` の `CompatibilityArea`、animal-personality は `ResultCard.tsx` の `buildAnimalPersonalityAfterTodayAction`（215〜263行）を `afterTodayAction` に渡す所（300〜311行）。`src/` で `InviteFriendButton`・`CompatibilitySection` を使うのはこれらと結果のページだけで、解き終えた画面の相性と招待はこれで全部である。3つとも診断のデータを丸ごと import する。
  - `ResultExtraLoader.tsx` 17行: `referrerTypeId` を読むのは character-fortune（26行）と japanese-culture（50行）の Wrapper だけで、science-thinking の Wrapper（38行）は読まない。説明と合う。
  - `ResultExtraLoader.test.tsx` 4〜5行: 試験は `ResultExtraLoader` に props を渡し、`RESULT_EXTRAS` がそれをそのまま `next/dynamic` の返す部品（スタブ）に渡す。「ResultExtraLoader が渡した値」と合う。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` した。11ファイルを重ね、`cmp` で作業ツリーと同じことを確かめた。
  - その書き出しで次を走らせ、すべて通った。
    - `npm run build` は exit 0。
    - `vitest --maxWorkers=2 src/play` と `src/__tests__/bundle-budget.test.ts` は142ファイル・2165件がすべて通った。
    - `tsc --noEmit` は exit 0（build のあとで走らせた）。
    - コミットの `src/` の `.ts`・`.tsx` と11ファイルにかけた `eslint` は exit 0。
    - コミットの `src/` のファイルと11ファイルにかけた `prettier --check` も通った。
- 画面
  - 自分で `next start -p 3781` を立て、`/opt/pw-browsers/chromium-1194` の Chromium で、375×800 のまま解き終えた画面まで実際に解いた。今回は前回と違う4つを解いた。japanese-culture（`?ref=sado`）・animal-personality（`?ref=nihon-zaru`）・yoji-personality・kanji-level。
  - 一番外側のセクションの並び（見出しの y）。
    - japanese-culture: 結果と共有 → このタイプについて（1226）→ 次はこれを試してみよう（2071）→ よくある質問 → この診断を勧める → 他のクイズ・診断も試してみよう → 他のジャンルも試してみよう。詳しい読みものを持たないので「すべてのタイプ」は無い（計画どおり）。「このタイプについて」の中は、相性（「静寂の求道者」、友達は茶道タイプ）→ 細い罫線 → 招待で、そのあとの罫線を越えて「もう一度挑戦する」が来る。
    - animal-personality: このタイプについて（1274）→ 次はこれを試してみよう（3203）→ すべてのタイプ（12）（3809）→ よくある質問以降。「今日試してほしいこと」のあとに相性と招待が続き、罫線のあとに「もう一度挑戦する」が来る。
    - yoji-personality: このタイプについて（835）→ 次はこれを試してみよう（2133）→ すべてのタイプ（8）（2739）。「四字熟語辞典で「一期一会」の詳しい解説を見る」は「このタイプについて」の中にある。
    - kanji-level: 結果と共有 → 次はこれを試してみよう（717）→ よくある質問以降。「このタイプについて」と「すべてのタイプ」は無い（計画どおり）。
  - 4つとも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。横のはみ出しは 0、コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`npm exec next start` の親）と、その子の `sh` と孫の `next-server` だけを止め、ポートが空いたことを確かめた。
  - 書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                                       | 結果                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `ResultCard.test.tsx` のモックの説明が CharacterPersonalityContent もスタブにすると言う | 直った。3つの扱い（先に読み込んだ部品・`data-testid` のスタブ・何も描かない部品）を、実際の分かれ道のとおりに部品の名前で言う（上の「前回の直しの裏づけ」）                               |
| 2. `ResultExtraLoader.tsx` の頭の説明が animal-personality の受け持ちを取り違えている      | 直った。music-personality と character-personality は読みものの部品が自分で組み、animal-personality は ResultCard が組んで `afterTodayAction` に渡す、と組む所と置く所を分けて言う        |
| 3. `ResultExtraProps` の `referrerTypeId` だけに説明が無い                                 | 直った。「相性を見る友だちのタイプの id（共有のリンクの ref）。character-fortune と japanese-culture が使う。」で、`QuizContainer.tsx`・`ResultCard.tsx` と同じ言い方に使い手が添えてある |
| 4. `ResultExtraLoader.test.tsx` のモックの説明の「ローダー」が2通りに読める                | 直った。「ResultExtraLoader が渡した値」と部品の名前で言う                                                                                                                                |

## 完了の条件

前回までのとおり、6つとも満たす（今回の11ファイルの変更はコメント・型・試験だけで、画面の並びと測った値を動かす所は無い。上の「画面」でも並びは変わっていない）。

## 指摘（どちらも builder が直す）

### 1. `recommendationPlacement.ts` の `DICTIONARY_LIST_SEGMENTS` は、どのリンクの分け方も変えない

`recommendationPlacement` は、次の形で辞典の項目かを決める。

```ts
const isDictionaryItem =
  segments.length === 3 &&
  segments[0] === "dictionary" &&
  !DICTIONARY_LIST_SEGMENTS.has(segments[2]);
```

`DICTIONARY_LIST_SEGMENTS`（`page`・`category`・`grade`・`radical`・`stroke`）が効くのは、`/dictionary/kanji/grade` のような3段のパスだけである。ところが `src/app/dictionary` の一覧のページは、どれも `/dictionary/kanji/grade/[grade]`・`/dictionary/yoji/page/[page]` のような4段以上で、3段の一覧は1つも無い（`find src/app/dictionary -name page.tsx` で確かめた）。4段以上は `segments.length === 3` だけで `next` になる。

- いまの診断のデータの `recommendationLink`（2段の一覧と遊び、3段の項目）にも、`recommendationPlacement.test.ts` が渡すパスにも、この集合で分け方が変わるものは無い。試験の `/dictionary/yoji/page/2` などは長さで落ちている。つまり、この集合を消しても、どの結果の置き場所も試験の結果も変わらない。
- それでいて、頭のコメント「辞典の中で、項目でなく一覧を出すパスの区切り（ページ送り・分類・学年・部首・画数）」は、一覧のページをこの集合が見分けていると読ませる。読む人は、辞典に一覧の種類を足すたびにこの集合を書き足す必要があると思い込む。実際には長さの判定がすべて受け持っている。

何も受け持たない集合と、それを説明するコメントを残すのは、ツギハギ禁止（試行錯誤の複雑さを残さない）に反する。集合とそのコメントを消し、関数の説明で「辞典の項目は `/dictionary/{辞典}/{項目}` の3段のパスで、一覧は2段か、分類・ページ送りを含む4段以上のパスである」と、実際に分けている決まりを言ってください。

### 2. `ResultNextContent.tsx` の頭の説明が、見出しの下に置くものを「同じ診断をもう一度解く操作」とだけ言う

頭の説明は次のとおり。

```ts
 * 診断・クイズを解き終えた画面のセクション「次はこれを試してみよう」。見出しのすぐ下に、同じ診断をもう一度解く
 * 操作を置き、その下に次の遊びの一覧を置く。
```

これには、コードと合わない所が2つある。

- 見出しのすぐ下の `children` には、「もう一度挑戦する」のほかに、行き先が辞典の一覧やほかの遊びの結果ごとのおすすめのリンクも入る（`ResultCard.tsx` 516〜519行。同じファイルの `children` の説明も「「もう一度挑戦する」と、結果ごとのおすすめのリンク」と言う）。kanji-level・kotowaza-level・yoji-level・word-sense-personality の全結果と、traditional-color の3つの結果で、ここにおすすめのリンクが出る（`recommendationPlacement.test.ts` の表）。
- この部品は知識クイズ（kanji-level など）の解き終えた画面にも出る。1行目で「診断・クイズ」と言いながら、2行目で「同じ診断」と言っている。

前回の指摘1（`ResultCard.tsx` の頭の説明が「次は」のおすすめを狭く言っていた）と同じ形の食い違いで、この部品だけを読む人は、見出しの下にはボタン1つしか来ないと読む。たとえば「見出しのすぐ下に、もう一度挑戦する操作と、結果ごとのおすすめのリンクを置き、その下に次の遊びの一覧を置く」のように、`children` の説明と同じものを言い、「診断」を「診断・クイズ」とそろえてください。

## 良い点（来訪者の目で見て）

- 友だちの共有のリンクから日本文化適性診断に来た来訪者は、自分のタイプを読んだすぐあとの「このタイプについて」で、友だちとの相性（「静寂の求道者」）を読める。そのあとに招待が続き、罫線を越えると「もう一度挑戦する」がある。相性の読みものが次の遊びの一覧に紛れず、読み終えた所で次の一歩に進める。
- 日本の固有種診断では、長い読みもの（強み・弱み・あるある・今日試してほしいこと）のあとに相性が続くので、自分のタイプを知ったうえで友だちとの組み合わせを読める。
- 知識クイズ（漢字力診断）では、結果と共有のすぐ下の罫線のあとに「もう一度挑戦する」が来る。読みものを持たないクイズで、空の区画を挟まずに再挑戦に着ける。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」と、science-thinking の「思考プロフィー／ル」。
