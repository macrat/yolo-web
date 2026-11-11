# T5-5b 第12回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘4つは直った。相性と招待を組む部品の説明は、5か所とも同じ1つの文になった。Music・Character・Animal の `*Content` の頭の説明と props の説明は、解き終えた画面と結果のページでの動きを分けて言う。`quizTitle` の説明と、science-thinking の「答えが無いとき」も直った。index.md の「T5-5b の PM の判断」には、`ScienceThinkingResultExtra.tsx` の説明の書き換えと、`CharacterPersonalityContent.tsx`・`AnimalPersonalityContent.tsx` の説明の直しが書き足された。完了の条件6つも引き続き満たす。ビルド・試験・型・lint・整形もすべて通る。375 の画面では、character-personality は `?ref=` があってもなくても計画どおりの順で並ぶ。`?with=` 付きの結果のページも正しく並ぶ。

今回も、前回の直しだけでなく T5-5b の全ファイルのコメント・型・引数を1つずつコードと突き合わせた。説明が足りない所が1つ残る（下の「指摘」）。来訪者に見える動きは変えずに直せる。見つけたものはここにすべて挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行（10-4 の表）と、`src/app/play/[slug]/page.tsx` の受け持ち（T5-22b。T6-3 と並行させない）。
  - index.md の「T5-5b の PM の判断」（T5-5a の行にあるファイルへの変更の受け持ちを含む）と「T5-5b のレビューから次のタスクへ」。
  - review-t5-5b-1〜11.md。
  - コミット 37bd762f（22ファイル）の差分と、作業ツリーの17ファイルの差分。`src/play` と `src/app/play` の作業ツリーの差分は、この17ファイルだけである。37bd762f のあとに `src/play`・`src/app/play`・`src/app/storybook` を触ったコミットは、T5-3b と registry の試験の3つだけで、どれも T5-5b の並びを変えない。
- 全文を読み、コメント・型・引数をコードと突き合わせたファイル
  - `ResultCard.tsx`（とその CSS）・`QuizContainer.tsx`（とその CSS）・`QuizPlayPageLayout.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`（とその CSS）・`recommendationPlacement.ts`・`src/app/play/[slug]/page.tsx`。
  - `MusicPersonalityContent.tsx`・`CharacterPersonalityContent.tsx`・`AnimalPersonalityContent.tsx`。結果のページ `src/app/play/{music,character,animal}-personality/result/[resultId]/page.tsx` の3本と突き合わせた。結果のページは、music と animal が `?with=` の相性（引けたときだけ）と「あなたはどのタイプ? 診断してみよう」を、character がそれに招待を加えて渡す。頭の説明と props の説明は、この違いのとおりに書かれている。
  - 追加の読みもの3つ。character-fortune と japanese-culture は、診断の名前・データの読み込みの名前・招待の文のほかは同じ形であることを `diff` で確かめた。説明の診断の名前は、データの `title`（「あなたの守護キャラ診断」）と `shortTitle`（「日本文化適性診断」「動物性格診断」「音楽性格診断」）と合う。
  - `ScienceThinkingResultExtra.tsx` の説明の「答えが無いとき」は、59行（`!answers || answers.length === 0`）と81行に合う。この部品と `ResultExtraLoader` と2つの `render*Extra` を読み込むのは `QuizContainer.tsx` だけで、結果のページは使わない。
  - `src/app/play/[slug]/page.tsx` の43行（`ref` を確かめるのは相性を出す各部品）は、追加の読みもの2つの `isValid*TypeId`、`MusicPersonalityContent` と `ResultCard` の `isValid*TypeId`、`CharacterPersonalityContent` が読み込む `/api/quiz/compatibility`（型の id を確かめて 400 を返す）と合う。専用のルート `src/app/play/music-personality/page.tsx` も `ref` を確かめずに渡す。
  - `recommendationPlacement.ts` の説明の決まりを、`src/app/dictionary` の下の `page.tsx` 23個と突き合わせた。区切りが3つの経路は `colors/[slug]`・`humor/[slug]`・`kanji/[char]`・`yoji/[yoji]` だけで、どれも項目である。一覧は `/dictionary` と `/dictionary/{辞典}` の2つ以下か、ページ送り・分類・学年・部首・画数の4つ以上である。
  - 試験（`ResultCard.test.tsx` の `next/dynamic` のモックの説明と分岐、`ResultExtraLoader.test.tsx`、`ResultReading.test.tsx` の理系思考の部分、`ScienceThinkingResultExtra.test.tsx`、`recommendationPlacement.test.ts`）と、37bd762f の `StorybookContent.tsx` の変更。
  - `src/play` の中で相性と招待の動きを言う説明を grep で拾い、関数の説明5つが同じ文であること、「友だち」が残っていないことを確かめた。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` した。17ファイルを重ね、`cmp` で作業ツリーと同じことを確かめた。
  - その書き出しで次を走らせた。
    - `npm run generate:release-id` と `npm run build` は、どちらも exit 0。
    - `vitest --maxWorkers=2 src/play` は141ファイル・2158件がすべて通った。
    - `tsc --noEmit` は exit 0（build のあとで走らせた）。
    - 17ファイルにかけた `eslint` は exit 0。
    - 17ファイルにかけた `prettier --check` も通った。
    - `npm run check:phrased-names` の出力のうち、T5-5b のファイルのものは `ResultCard.tsx:520` の「もう一度挑戦する」だけで、T5-3d が渡す分である。
- 画面
  - 書き出しで自分で `next start -p 3847` を立てた。`/opt/pw-browsers/chromium-1194` の Chromium を使い、375×800 のまま解き終えた画面まで実際に解いた。
  - character-personality（`?ref=` なし）: 結果と共有（札の画像のボタンを含む）→ このタイプについて（小見出し3つ）→ 「友達との相性を調べてみよう」「友達に診断を送る」→ 罫線 → 次はこれを試してみよう・「もう一度挑戦する」・次の遊びの一覧 → すべてのタイプ（24）→ よくある質問・この診断を勧める・他のクイズ・診断も試してみよう・他のジャンルも試してみよう。
  - character-personality（`?ref=blazing-poet`）: 「キャラからのメッセージ」のあとに「友達との相性」の区画が出る。相性の名前・2人のタイプ・説明・共有が続き、そのあとに「友達との相性を調べてみよう」「友達に診断を送る」が来る。罫線を越えると次はこれを試してみよう。そのあとの並びは `?ref=` なしと同じ。
  - 結果のページ `/play/character-personality/result/blazing-strategist?with=blazing-poet`: 「キャラからのメッセージ」のあとに相性（「熱量の方向が違う同志」）、招待、「あなたはどのタイプ? 診断してみよう」が続き、すべてのタイプ（24）に進む。
  - 解き終えた画面の2つとも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。3つとも横のはみ出しは 0、コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`npm exec next start` の親）と、その子の `sh`・孫の `next-server` だけを止めた。ポートが応えなくなったことを確かめてから、書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                                   | 結果                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. `quizTitle` の説明が、この部品が出さないはてなブックマークを言う                    | 直った。「ハッシュタグと、端末の共有シートに渡す題に使う」になり、409行と `ShareButtons` の `title`（492行）と合う                                                                                                                               |
| 2. 同じ形の相性と招待の説明が、ファイルによって違う                                    | 直った。関数の説明5つ（`ResultCard`・`MusicPersonalityContent`・`CharacterPersonalityContent` の `CompatibilityArea`・追加の読みもの2つ）が同じ文になった。頭の説明も、招待がいつも出ると読める文になった。ただし props の説明に1つ残る（指摘1） |
| 3. `ScienceThinkingResultExtra.tsx` の説明の「答えを受け取らないとき」                 | 直った。「答えが無いときは招待だけを出す」になった                                                                                                                                                                                               |
| 4.（PM）index.md の T5-5b の受け持ちに、説明の書き換えと `CharacterPersonalityContent` | 書き足された。`CharacterPersonalityContent.tsx`・`AnimalPersonalityContent.tsx` の説明の直しも T5-5b の受け持ちとして残っている                                                                                                                  |

## 完了の条件

前回までのとおり、6つとも満たす。今回の変更はコメントだけで、どの結果の並びと置き場所も変わらない。上の「画面」でも、並びと置き場所は計画どおりである。

## 指摘

### 1.（builder）`afterTodayAction`・`afterCharacterMessage` の説明が、渡したときに招待も組まなくなることを言わない

`MusicPersonalityContent.tsx` 32〜35行と `CharacterPersonalityContent.tsx` 159〜162行は、次のとおり。

```ts
/**
 * 今日の音楽ライフのヒントのあと、読みものの最後に置くもの（結果のページの ?with= の相性と診断への誘い）。
 * 渡したときは、referrerTypeId から相性を組まない。
 */
afterTodayAction?: React.ReactNode;
```

```ts
/**
 * キャラからのメッセージのあと、読みものの最後に置くもの（結果のページの ?with= の相性・招待・診断への誘い）。
 * 渡したときは、referrerTypeId から相性を読み込まない。
 */
afterCharacterMessage?: React.ReactNode;
```

コードでは、渡したときは解き終えた画面の相性と招待をまるごと置き換える。`MusicPersonalityContent` は `buildAfterTodayAction` を呼ばず（96〜99行）、`CharacterPersonalityContent` は `CompatibilityArea` を描かない（273〜278行）。どちらも、招待のボタンも出さなくなる。実際に music の結果のページには招待が無く、character の結果のページは招待を自分で渡している。

説明の2文目は相性のことしか言わないので、渡しても招待は部品が足すと読める。前回の指摘2で直した `CompatibilityArea` の説明（二択で、招待が続くことを言わなかった）と同じ種類の抜けである。結果のページに招待を出したい人がこの説明を信じると、招待が出ないことに気づけない。

たとえば次のように、置き換えることを言う文にする。コードは変えない。

- `MusicPersonalityContent.tsx`: 「渡したときは、解き終えた画面の相性と招待（buildAfterTodayAction）を組まず、これだけを置く。」
- `CharacterPersonalityContent.tsx`: 「渡したときは、解き終えた画面の相性と招待（CompatibilityArea）を組まず、相性も読み込まない。」

## 良い点（来訪者の目で見て）

- 友達の共有のリンクから似たキャラ診断に来た来訪者は、キャラからのメッセージを読み終えたすぐ下で、2人のタイプと相性の説明を読める。そのまま、次の友達を誘うボタンに着く。相性の区画は読みものの小見出しと同じ細い罫線で分かれ、読みものの続きとして読める。
- `?ref=` が無いときは、読みもののすぐ後ろに「友達との相性を調べてみよう」と招待のボタンだけが出る。空の相性の区画は出ない。
- 太い罫線を1本越えると「次はこれを試してみよう」と「もう一度挑戦する」に着き、次の遊びの一覧、すべてのタイプと続く。読み終えた所から次の一歩までが近い。
- 相性の共有のリンク（`?with=`）を受け取った人は、結果のページで同じ位置に相性を読め、そのすぐ下で自分も診断を始められる。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T5-27: animal-personality の招待の文の診断の名前（index.md に記録済み）。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」、science-thinking の「思考プロフィー／ル」、朱色のおすすめの文言。
