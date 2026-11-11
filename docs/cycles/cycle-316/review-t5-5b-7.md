# T5-5b 第7回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘3つは、どれも直った。完了の条件6つも引き続き満たし、ビルド・試験・型・lint・整形もすべて通る。375 の画面は来訪者にとって分かりやすい。結果を読み終えた所から全幅の罫線を1本越えると、「次はこれを試してみよう」と「もう一度挑戦する」に着く。

今回も、T5-5b の全ファイルのコメント・型・引数を1つずつコードと突き合わせた。コードと合わない所、または読み違えを招く所が4つ残っている（下の「指摘」）。どれもコードの動きを変えずに直せる。見つけたものはここにすべて挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行・5-c・10-4 の受け持ちの表の T5-5b の行。
  - index.md の「T5-5b の PM の判断」と「T5-5b のレビューから次のタスクへ」。
  - review-t5-5b-1〜6.md。
  - コミット 37bd762f（22ファイル）の差分と、作業ツリーの11ファイルの差分。
- 全文を読み、コメント・型・引数をコードと突き合わせたファイル
  - `ResultCard.tsx`・`QuizContainer.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`（とその CSS）・`recommendationPlacement.ts`・`QuizPlayPageLayout.tsx`・`QuizContainer.module.css`・`ResultCard.module.css`。
  - 追加の読みもの3つ（`CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`・`ScienceThinkingResultExtra.tsx`）。
  - 試験4つ（`ResultCard.test.tsx` の `next/dynamic` のモックとセクションの並びの試験、`ResultExtraLoader.test.tsx`、`ResultReading.test.tsx` の理系思考の部分、`ScienceThinkingResultExtra.test.tsx`）と `src/app/play/[slug]/page.tsx`。
- 計画との突き合わせ
  - 解き終えた画面は「最初のセクション（頭・結果・共有）→ このタイプについて → 次はこれを試してみよう（見出しのすぐ下に「もう一度挑戦する」、その下に次の遊びの一覧）→ すべてのタイプ」の兄弟の `Section` で、5-c の B の並びと合う。
  - 追加の読みもの3つは「このタイプについて」の最後に置かれる。おすすめのリンクは行き先で分かれる（index.md の PM の判断のとおり）。
  - `QuizContainer` がどの段階でもページのセクションを描き、`page.module.css` の `.head` は `QuizContainer.module.css` に移っている（10-4 の表のとおり）。
- 消した引数の残り（AP-I13）
  - `renderScienceThinkingExtra` を呼ぶ所を `src/` 全体で探した。3か所（`ResultExtraLoader.tsx`・`ResultReading.test.tsx`・`ScienceThinkingResultExtra.test.tsx`）とも、答えだけを渡す形になっている。`RESULT_EXTRA_SLUGS` も残っていない。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` した。11ファイルを重ね、`cmp` で作業ツリーと同じことを確かめた。
  - その書き出しで次を走らせ、すべて通った。
    - `npm run build` は exit 0。
    - `vitest --maxWorkers=2 src/play` は141ファイル・2158件がすべて通った。
    - `tsc --noEmit` は exit 0（build のあとで走らせた）。
    - `src/__tests__/bundle-budget.test.ts` は7件すべて通った。
    - コミットの `.ts`・`.tsx` と11ファイルにかけた `eslint` は exit 0。
    - コミットの `src/` のファイルと11ファイルにかけた `prettier --check` も通った。
- 画面
  - 自分で `next start -p 3747` を立て、`/opt/pw-browsers/chromium-1194` の Chromium で、375×800 のまま解き終えた画面まで実際に解いた。解いたのは science-thinking・traditional-color・character-fortune（`?ref=commander`）の3つ。
  - 3つとも、一番外側のセクションは「結果と共有 → このタイプについて → 次はこれを試してみよう → すべてのタイプ → よくある質問 → この診断を勧める → 他のクイズ・診断も試してみよう → 他のジャンルも試してみよう」の順だった。
  - science-thinking では、「あなたの思考プロフィール」（y=3086。レーダー・量の帯・招待）が「このタイプについて」の最後にあり、そのあとの罫線を越えて「次はこれを試してみよう」（y=3854）が来る。小見出しの上の線とあきも、ほかの小見出しと同じだった。
  - traditional-color では、色見本が結果のボックスの中の名前と読みのすぐ下にあり、名前と同じ左端から始まり、細い線で囲まれている。辞典の項目へのリンク「藍色の詳しい解説を見る」は「このタイプについて」の最後にあり、罫線のあとに「次はこれを試してみよう」と「もう一度挑戦する」が来る。
  - 3つとも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。横のはみ出しは 0、コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`npm exec next start` の親）と、その子の `sh` と `next-server` だけを止めた。
  - 書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                             | 結果                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `ResultCard.tsx` の頭の説明が「次は」のおすすめを「ほかの遊びへの」とだけ言う | 直った。「辞典の一覧やほかの遊びへの結果ごとのおすすめ」になり、同じファイルの 415〜416 行と `recommendationPlacement.ts` の分け方と合う                                                                   |
| 2. `ScienceThinkingResultExtra` の使われない `referrerTypeId`                    | 直った。`renderScienceThinkingExtra` の引数・部品の props・`ResultExtraLoader` の Wrapper から消えた。呼ぶ所の2つの試験（`ScienceThinkingResultExtra.test.tsx`・`ResultReading.test.tsx`）も答えだけを渡す |
| 3. `QuizContainer.tsx` の `referrerTypeId` の説明が2通りに読める                 | 直った。「相性を見る友だちのタイプの id（共有のリンクの ref）」と、`ResultCard.tsx` と同じ言い方の日本語になった                                                                                           |

## 完了の条件

前回までのとおり、6つとも満たす（上の「画面」のとおり。character-personality の距離は前回の 1,658 から、この変更で動く所は無い）。

## 指摘（どれも builder が直す）

### 1. `ResultCard.test.tsx` の `next/dynamic` のモックの説明が、CharacterPersonalityContent もスタブにすると言っている

前回言い直した説明（18〜20行）の最後は、次のとおり。

```ts
// ファクトリの中で先に読み込んでおく。ほかの *Content は data-testid を持つスタブにする。
```

ところが、モックが `data-testid` を持つスタブにするのは Yoji・UnexpectedCompatibility・ImpossibleAdvice・ContrarianFortune の4つだけである。`ResultCard` が読み込む `CharacterPersonalityContent` には分かれ道が無く、最後の `else`（「未知のコンポーネントはfallback」）の `() => null` になり、何も描かない。character-personality の variant を描く2つの試験（556 行から）も、読みものが空のまま走っている。

読む人は、character-personality の読みものも `data-testid` で確かめられると読み違える。「ほかの4つの *Content は data-testid を持つスタブに、どれにも当たらない部品（CharacterPersonalityContent）は何も描かない部品にする」のように、実際の分かれ道で言い直してください。

### 2. `ResultExtraLoader.tsx` の頭の説明が、animal-personality の相性と招待の受け持ちを取り違えている

頭の説明（T5-5b が書いた文）の最後は、次のとおり。

```ts
 * その診断を解き終えたときだけ読み込む。ほかの診断の相性と招待は、読みものの部品（*Content）が持つ。
```

music-personality と character-personality は、たしかに読みものの部品（`MusicPersonalityContent`・`CharacterPersonalityContent`）が `referrerTypeId` から相性と招待を組む。しかし animal-personality の相性と招待は、`ResultCard.tsx` の `buildAnimalPersonalityAfterTodayAction`（215〜263行）が組み、`AnimalPersonalityContent` には `afterTodayAction` として渡して置かせるだけである。

読む人が animal-personality の相性を直そうとして `AnimalPersonalityContent.tsx` を開いても、そこには組む所が無い。「ほかの診断の相性と招待は、読みものの部品（*Content）の中に置く（animal-personality は ResultCard が組んで渡す）」のように、組む所と置く所を分けて言ってください。

### 3. `ResultExtraProps` の `referrerTypeId` だけに説明が無い

`ResultExtraLoader.tsx` の `ResultExtraProps`（13〜18行）では、`answers` には「来訪者の答え。答えから来訪者ごとのスコアを出す診断（science-thinking）が使う。」と、どの診断が使うかまで書いてある。一方 `referrerTypeId` には説明が無い。

前回の指摘2で、science-thinking はこの値を使わなくなった。その結果、この型の2つの任意の値は、それぞれ別の診断だけが使う。答えのほうだけ使い手を書くと、読む人は `referrerTypeId` を3つとも使うと読みやすい。同じ値は `QuizContainer.tsx` と `ResultCard.tsx` で「相性を見る友だちのタイプの id（共有のリンクの ref）」と書いてある。ここも同じ言い方に使い手を添えて、「相性を見る友だちのタイプの id（共有のリンクの ref）。相性を出す診断（character-fortune・japanese-culture）が使う。」のように書いてください。

### 4. `ResultExtraLoader.test.tsx` のモックの説明の「ローダー」が、2通りに読める

前回書き直した説明（4〜5行）は、次のとおり。

```ts
// スタブは受け取った props を data 属性に写すので、ローダーが渡した値を確かめられる。
```

このモックの中では、`next/dynamic` に渡す読み込みの関数の引数が `loader` という名前である。そのため「ローダーが渡した値」は、その `loader`（import の関数）が渡した値とも読める。実際に確かめているのは、試験する部品 `ResultExtraLoader` が props として渡した値である。「ResultExtraLoader が渡した値」と、部品の名前で言ってください。

## 良い点（来訪者の目で見て）

- 理系思考タイプ診断では、自分の思考のレーダーと量の帯が、読みものの続きとして来て、招待で締まる。そのすぐ下の罫線のあとに「もう一度挑戦する」がある。読みものの途中に別の区画が割り込まず、読み終えた所で次の一歩が見つかる。
- 伝統色診断では、結果の色が名前と読みのすぐ下に大きく出て、結果そのものを色で受け取れる。色の辞典の項目へのリンクは読みものの最後にあり、自分の色をもっと知りたい来訪者が同じ区画で続きを見つけられる。
- 友だちの共有のリンクから来た来訪者（character-fortune）は、自分のタイプを読み終えた所で相性を読み、そのあとに次の遊びへ進める。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」と、science-thinking の「思考プロフィー／ル」。
