# T5-5b 第11回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘3つは直った。`MusicPersonalityContent.buildAfterTodayAction` と `ResultCard.buildAnimalPersonalityAfterTodayAction` は関数の説明が1つずつになり、関数の中のコメントは消えた。「友だち」は3か所とも「友達」になった。index.md の「T5-5b の PM の判断」には、T5-5a の行にあるファイルへの T5-5b の変更が書き足された。完了の条件6つも引き続き満たす。ビルド・試験・型・lint・整形もすべて通る。375 の画面では、animal-personality と music-personality のどちらも、`?ref=` があってもなくても計画どおりの順で並ぶ。

今回も、前回の直しだけでなく T5-5b の全ファイルのコメント・型・引数を1つずつコードと突き合わせた。コードと合わない説明が2つある。相性と招待の説明にも、前回そろえると決めた言い方からずれた所が残る。記録にも1つ漏れがある（下の「指摘」）。どれも来訪者に見える動きを変えずに直せる。見つけたものはここにすべて挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行（10-4 の表）と、10-4 の受け持ちの表の `ResultCard.*`・`ResultNextContent.*`・`QuizContainer.tsx`・`QuizPlayPageLayout.tsx` と、T5-5a の行（`MusicPersonalityContent` と追加の読みもの3つが載る行）。
  - index.md の「T5-5b の PM の判断」（T5-5a の行にあるファイルへの変更の受け持ちを含む）と「T5-5b のレビューから次のタスクへ」。
  - review-t5-5b-1〜10.md。
  - コミット 37bd762f（22ファイル）の差分と、作業ツリーの15ファイルの差分。`src/play` と `src/app/play` の作業ツリーの差分は、この15ファイルだけである。
- 全文を読み、コメント・型・引数をコードと突き合わせたファイル
  - `ResultCard.tsx`（とその CSS）・`QuizContainer.tsx`（とその CSS）・`QuizPlayPageLayout.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`（とその CSS）・`recommendationPlacement.ts`・`src/app/play/[slug]/page.tsx`・`MusicPersonalityContent.tsx`。
  - 追加の読みもの3つ。character-fortune と japanese-culture は、診断の名前・データの読み込みの名前・招待の文のほかは同じ形であることを `diff` で確かめた。
  - 試験（`ResultCard.test.tsx` の `next/dynamic` のモックの説明と分岐、`ResultExtraLoader.test.tsx`、`ResultReading.test.tsx` の理系思考の部分、`ScienceThinkingResultExtra.test.tsx`、`recommendationPlacement.test.ts`）と、`StorybookContent.tsx` の変更。
- 裏づけ
  - 結果ごとのおすすめの行き先は、診断のデータ全体で20通りある。区切りが3つのもの（色の項目5つと四字熟語の項目8つ）は、どれも `traditional-color.ts` と `yoji-personality.ts` にある。この2つは詳しい読みものを持つので、「このタイプについて」がリンク1つだけの区画になることはない。
  - `ResultCard.test.tsx` の `next/dynamic` のモックの説明は、分岐と合う。`AnimalPersonalityContent`・`TraditionalColorContent` は実物を、`MusicPersonalityContent` はモックを返す。スタブは4つで、残りの `CharacterPersonalityContent` は何も描かない。
  - `ResultExtraLoader.tsx` の頭の説明は、コードと合う。music-personality と character-personality は読みものの部品が自分で相性を組み、animal-personality は `ResultCard` が組んで `afterTodayAction` に渡す。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` した。15ファイルを重ね、`cmp` で作業ツリーと同じことを確かめた。
  - その書き出しで次を走らせた。
    - `npm run generate:release-id` と `npm run build` は、どちらも exit 0。
    - `vitest --maxWorkers=2 src/play` は141ファイル・2158件がすべて通った。
    - `tsc --noEmit` は exit 0（build のあとで走らせた）。
    - 15ファイルにかけた `eslint` は exit 0。
    - 15ファイルにかけた `prettier --check` も通った。
    - `npm run check:phrased-names` の出力のうち、T5-5b のファイルのものは `ResultCard.tsx:520` の「もう一度挑戦する」だけで、T5-3d が渡す分である。
- 画面
  - 書き出しで自分で `next start -p 3829` を立てた。`/opt/pw-browsers/chromium-1194` の Chromium を使い、375×800 のまま解き終えた画面まで実際に解いた。
  - animal-personality（`?ref=` なし）: 結果と共有 → このタイプについて（小見出し4つ）→ 「友達に診断を送る」→ 罫線 → 次はこれを試してみよう・「もう一度挑戦する」→ すべてのタイプ（12）→ よくある質問以降。
  - animal-personality（`?ref=nihon-zaru`）: 「今日試してほしいこと」のあとに「友達との相性」が出る。相性の名前・2人のタイプ・説明・共有が続き、そのあとに「友達との相性を調べてみよう」「友達に診断を送る」が来る。罫線を越えると次はこれを試してみよう。
  - music-personality（`?ref=` なし）: 「今日の音楽ライフのヒント」のあとに招待だけが出る。そのあとの並びは animal と同じで、すべてのタイプは（8）。
  - music-personality（`?ref=solo-explorer`）: 「今日の音楽ライフのヒント」のあとに相性（「秘境の同志」）が出て、招待が続く。
  - 4つとも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。横のはみ出しは 0、コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`npx next start` の親）と、その子の `sh`・孫の `next-server` だけを止めた。ポートが応えなくなったことを確かめてから、書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                           | 結果                                                                                                                                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `MusicPersonalityContent.buildAfterTodayAction` に説明が2つ並ぶ（ツギハギ） | 直った。関数の説明1つになり、関数の中のコメントは消えた。`ResultCard.buildAnimalPersonalityAfterTodayAction` も同じ形になった。ただし、追加の読みもの2つとは言い方がそろっていない（指摘2） |
| 2. 「友だち」と「友達」が混ざる                                                | 直った。3か所とも「友達」になった                                                                                                                                                           |
| 3.（PM）T5-5a の行にあるファイルへの T5-5b の変更を index.md に残す            | 書き足された。ただし、`ScienceThinkingResultExtra.tsx` の説明の書き換えが挙がっていない（指摘4）                                                                                            |

## 完了の条件

前回までのとおり、6つとも満たす。今回の変更はコメントだけで、どの結果の並びと置き場所も変わらない。上の「画面」でも、並びと置き場所は計画どおりである。

## 指摘

### 1.（builder）`ResultCard.tsx` の `quizTitle` の説明が、この部品が出さないはてなブックマークを言う

`ResultCard.tsx` 114行は次のとおり。

```ts
/** 診断の題（ハッシュタグと、共有シートとはてなブックマークに渡す題に使う） */
quizTitle: string;
```

この部品は `ShareButtons` を `sns={["x", "line", "copy"]}` で置くので、はてなブックマークのボタンは出ない（494行）。`quizTitle` が使われるのは、ハッシュタグ（409行）と、`ShareButtons` の `title` を通した端末の共有シートだけである。説明は、渡した題がはてなブックマークにも行くと読ませる。

この行は T4-5 が書いたものだが、T5-5b の受け持ちのファイルにあり、CLAUDE.md は見つけた食い違いをその場で直すことを求める。次のように直す。

```ts
/** 診断の題（ハッシュタグと、端末の共有シートに渡す題に使う） */
```

### 2.（builder）同じ形の相性と招待の説明が、ファイルによって違うことを言う

前回の指摘1は、同じ形の関数の説明を1つの言い方にそろえることを求めた。直しで入った `ResultCard.tsx` 215〜218行と `MusicPersonalityContent.tsx` 39〜42行の説明は、次のとおり。

> 友達の結果の共有のリンクから来て、そのタイプとの相性が引けたときは相性を出し、招待のボタンを続ける。そうでなければ招待のボタンだけを出す。

一方、コードが同じ形の `CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx` の31〜33行は、次のとおりである。

> 友達の結果の共有のリンクから来たときは相性を出し、招待のボタンを続ける。

どちらも T5-5b が受け持つ説明だが（index.md の「T5-5b の PM の判断」）、言い方は2通りある。追加の読みもの2つの説明は、ref が無いときと相性が引けないときに招待だけを出すことを言わない。32行は1行で120字の幅を大きく越え、ほかの説明のように折り返されていない。

`MusicPersonalityContent.tsx` の頭の説明（4〜5行）も、関数の説明とずれる。

> 解き終えた画面では、友達の結果から来たときの相性と招待もここで出す。

「友達の結果から来たときの」が「相性と招待」の両方にかかって読める。そう読むと、招待も友達の結果から来たときだけ出ることになる。これは、第9回・第10回で直した関数の説明と同じ読まれ方である。

直し方は次の2つ。どちらもコードは変えない。

- 追加の読みもの2つの関数の説明を、`ResultCard.tsx` と `MusicPersonalityContent.tsx` と同じ文にする（診断の名前だけ変える）。ほかの説明と同じ幅で折り返す。
- `MusicPersonalityContent.tsx` の頭の説明は、たとえば「解き終えた画面では、友達の結果から来たときの相性と、友達を誘う招待もここで出す。」のように、招待がいつも出ることが分かる文にする。

`CharacterPersonalityContent.tsx` にも同じずれがある。`CompatibilityArea` の説明（48〜50行）は「友達のタイプがあれば相性を読み込んで出し、読み込めなければ招待だけを出す」という二択で、相性が出たときも招待が続くこと（119〜147行）を言わない。頭の説明（4〜6行）も上と同じ文である。このファイルは T5-5b がまだ触っていない（10-4 の表で T5-5a）。そのため、同じ直しに含めるか T5-27 の行に書き足すかを PM が決め、index.md に残してください（指摘4）。

### 3.（builder）`ScienceThinkingResultExtra.tsx` の説明の「答えを受け取らないとき」が、空の答えのときを言わない

47行は「答えを受け取らないときは招待だけを出す」と言う。コードは、`answers` が無いときだけでなく、空の並びのときも招待だけを出す（59行 `if (!answers || answers.length === 0) return [];` と81行）。空の並びは「受け取っている」ので、説明とコードがずれる。前の言い方の「答えが無いとき」なら両方を含む。「答えが無いときは招待だけを出す」に戻してください（括弧の「結果のリンクから開いたとき」は、この部品が結果のページで使われないので、外したままにする）。

### 4.（PM）index.md の T5-5b の受け持ちの書き足しに、`ScienceThinkingResultExtra.tsx` の説明の書き換えを加える

index.md の「T5-5b の PM の判断」は、`ScienceThinkingResultExtra.tsx` について「使わない `referrerTypeId` を外す」だけを挙げる。T5-5b はこのほかに、部品の説明（47行。指摘3で直す所）も書き換えた。T5-27 がこのファイルの招待の文を触るときに説明の変更を知れるよう、「使わない `referrerTypeId` を外し、説明を直す」と書いてください。あわせて、指摘2の `CharacterPersonalityContent.tsx` の説明をどのタスクが直すかの決定も残してください。

## 良い点（来訪者の目で見て）

- 友達の共有のリンクから動物性格診断に来た来訪者は、「今日試してほしいこと」を読み終えたすぐ下で、2人のタイプと相性の説明を読める。そのまま次の友達を誘うボタンに着く。相性の区画は、読みものの小見出しと同じ細い罫線で分かれ、読みものの続きとして読める。
- `?ref=` が無いときは、読みもののすぐ後ろに「友達との相性を調べてみよう」と招待のボタンだけが出る。空の相性の区画は出ない。
- どちらの診断でも、太い罫線を1本越えると「次はこれを試してみよう」と「もう一度挑戦する」に着き、次の遊びの一覧、すべてのタイプと続く。読み終えた所から次の一歩までが近い。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T5-27: animal-personality の招待の文の診断の名前（index.md に記録済み）。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」、science-thinking の「思考プロフィー／ル」、朱色のおすすめの文言。
