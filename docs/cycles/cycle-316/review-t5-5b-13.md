# T5-5b 第13回レビュー（解き終えた画面の並びとセクション）

## 判定

**承認**

前回の指摘1は直った。`MusicPersonalityContent` の `afterTodayAction` と `CharacterPersonalityContent` の `afterCharacterMessage` の説明は、渡したときに解き終えた画面の相性と招待をまるごと置き換えることを言う。コードの動き（`buildAfterTodayAction` を呼ばない・`CompatibilityArea` を描かない）と合う。

今回も、前回の直しだけでなく、コミット 37bd762f と作業ツリーの17ファイルを最初から見直した。コメント・型・引数を1つずつコードと突き合わせたが、T5-5b の欠陥は見つからなかった。完了の条件6つも引き続き満たす。ビルド・試験・型・lint・整形もすべて通る。375 の画面は、どの診断でも計画どおりの順で並ぶ。

T5-5b の範囲の外で、前から残っている計測の抜けを1つ見つけた（下の「T5-5b の範囲の外で見つけたこと」）。T5-5b が入れたものではなく、T5-5b の完了の条件にも入らない。判定には数えないが、PM がバックログに起こすかを決めてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行（10-4 の表）と受け持ちの順。
  - index.md の「T5-5b の PM の判断」と「T5-5b のレビューから次のタスクへ」。
  - review-t5-5b-1〜12.md。
  - コミット 37bd762f（22ファイル）の差分と、作業ツリーの17ファイルの差分。`src/play` と `src/app/play` の作業ツリーの差分は、この17ファイルだけである。
  - `src/app/play/[slug]/page.tsx` を触る T5-22b（22d2632f）と T6-3（a5304a35）は、どちらももうコミットされている。T5-5b のコメントの直しと並行にはならない。
- 全文を読み、コメント・型・引数をコードと突き合わせたファイル
  - `ResultCard.tsx`: 頭の説明の4つのセクションと、描く条件（2 は `detailedContent || aboutLink || extra`、4 は `detailedContent`）が503行・523行と合う。`quizTitle`・`referrerTypeId`・`extra`・`nextItems`・`allResults`・`resultBoxRef` の説明も、使う所と合う。
  - `QuizContainer.tsx`: 頭の説明（開始と設問は1つのセクション、解き終えた画面は兄弟のセクション）と `head`・`referrerTypeId`・`recommendedContents` の説明が合う。`extra` は `hasResultExtra` のときだけ渡す（262〜271行）。
  - `ResultExtraLoader.tsx`: 頭の説明の、診断ごとに描くもの（science-thinking は思考プロフィールと招待、ほかの2つは相性と招待）と、ほかの診断の相性と招待の組み手（music と character は `*Content`、animal は `ResultCard` が組んで `afterTodayAction` に渡す）が合う。`ResultExtraProps` の `referrerTypeId`・`answers` の「使う診断」も、3つの `Wrapper` が渡すものと合う。
  - `ResultNextContent.tsx`: `children` と `items` の説明、頭の説明が描く順（見出し → 操作 → 一覧）と合う。
  - `recommendationPlacement.ts`: 説明の決まり（区切りが3つの辞典のパスは項目だけ）を `src/app/dictionary` の下の `page.tsx` 23個と突き合わせた。区切りが3つの経路は `colors/[slug]`・`humor/[slug]`・`kanji/[char]`・`yoji/[yoji]` だけで、どれも項目である。試験に足した `/dictionary` と `/dictionary/colors/category/red/page/2` も、この決まりの両端を押さえる。
  - `CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`: `diff` で、診断の名前・データの読み込み・招待の文のほかは同じ形であることを確かめた。`render*Extra` の戻りの型 `(resultId: string) => React.ReactNode` は、`ResultExtraLoader` の呼び方と合う。
  - `ScienceThinkingResultExtra.tsx`: 使わない `referrerTypeId` が型・引数・呼び出し側（`ResultExtraLoader` と試験2本）からすべて外れた。「答えが無いときは招待だけを出す」は59行と81行に合う。
  - `MusicPersonalityContent.tsx`・`CharacterPersonalityContent.tsx`・`AnimalPersonalityContent.tsx`: 頭の説明と props の説明を、結果のページ `src/app/play/{music,character,animal}-personality/result/[resultId]/page.tsx` の3本と突き合わせた。music と animal は `?with=` の相性（引けたときだけ）と診断への誘いを、character はそれに招待を加えて渡す。説明はこの違いのとおりである。`afterTodayAction`・`afterCharacterMessage` を渡すのは、この3本と `ResultCard` の animal だけである（grep）。`CompatibilityArea` の説明の「読み込むあいだは読み込んでいることを文で言う」は106行と合う。
  - `src/app/play/[slug]/page.tsx` の43行は、`ref` を確かめる各部品（`isValid*TypeId` と `/api/quiz/compatibility`）と合う。
  - 試験: `ResultCard.test.tsx` の `next/dynamic` のモックの説明は、実物を返す3つ・スタブを返す4つ・何も描かないそのほか、の分岐と合う。`ResultExtraLoader.test.tsx` は、スタブが props を data 属性に写し、3つの診断で `resultId`・`referrerTypeId`・`answers` が部品まで届くことと、持たない診断で何も描かないことを確かめる。`ResultReading.test.tsx`・`ScienceThinkingResultExtra.test.tsx` は新しい引数の形で呼ぶ。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` した。17ファイルを重ね、`cmp` で作業ツリーと同じことを確かめた。
  - その書き出しで次を走らせた。
    - `npm run generate:release-id` と `npm run build` は、どちらも exit 0。
    - `vitest --maxWorkers=2 src/play` は141ファイル・2158件がすべて通った。
    - `tsc --noEmit` は exit 0。
    - 17ファイルにかけた `eslint` は exit 0、`prettier --check` も通った。
    - `npm run check:phrased-names` の出力のうち、T5-5b のファイルのものは `ResultCard.tsx:520` の「もう一度挑戦する」だけで、T5-3d が渡す分である。
- 画面（375×800、`/opt/pw-browsers/chromium-1194` の Chromium、書き出しで立てた `next start`）
  - 5つの診断を実際に解いて、解き終えた画面の見出しの順を取った。どれも、結果と共有 → このタイプについて → 次はこれを試してみよう（すぐ下に「もう一度挑戦する」）→ すべてのタイプ → よくある質問から後ろ、の順だった。
    - character-personality（`?ref=` なし）: 「キャラからのメッセージ」のあとに「友達に診断を送る」、罫線を越えて「次はこれを試してみよう」。
    - character-personality（`?ref=blazing-poet`）: 「キャラからのメッセージ」のあとに「友達との相性」の区画（相性の名前・2人のタイプ・説明・共有）、そのあとに「友達に診断を送る」。罫線を越えて「次はこれを試してみよう」と「もう一度挑戦する」、次の遊びの一覧、すべてのタイプ（24）。
    - japanese-culture: 「このタイプについて」の中に招待があり、「次はこれを試してみよう」の「もう一度挑戦する」の下に、ほかの遊びへのおすすめ（斜め上の相性診断）がある。
    - science-thinking: 「この思考をもっと活かすには」のあとに「あなたの思考プロフィール」と招待が「このタイプについて」の中にあり、「次はこれを試してみよう」のあとには残っていない。
    - traditional-color（2回解き、紺色と桜色が出た。どちらも辞典の項目へのリンクを持つ結果）: その色の辞典の項目へのリンク（桜色では「桜色の詳しい解説を見る」）が「この色からのひとこと」のすぐ下、「このタイプについて」の中にある。「次はこれを試してみよう」には「もう一度挑戦する」と次の遊びの一覧だけが並ぶ。
  - 5つとも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。横のはみ出しは 0、コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`npm exec next start` の親）と、その子の `sh`・孫の `next-server` だけを止めた。ポートが応えなくなり、3つのプロセスが消えたことを確かめてから、書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                                                  | 結果                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. `afterTodayAction`・`afterCharacterMessage` の説明が、渡したときに招待も組まなくなることを言わない | 直った。「渡したときは、解き終えた画面の相性と招待（buildAfterTodayAction / CompatibilityArea）を組まず、これだけを置く。」になり、`MusicPersonalityContent.tsx` 96〜99行と `CharacterPersonalityContent.tsx` 155〜160行と合う |

## 完了の条件

前回までのとおり、6つとも満たす。今回の変更はコメントだけで、どの結果の並びと置き場所も変わらない。上の「画面」でも、並びと置き場所は計画どおりである。

## 指摘

なし。

## 良い点（来訪者の目で見て）

- 友達の共有のリンクから似たキャラ診断に来た来訪者は、キャラからのメッセージを読み終えたすぐ下で、2人のタイプと相性の説明を読め、そのまま次の友達を誘うボタンに着く。
- 太い罫線を1本越えると「次はこれを試してみよう」と「もう一度挑戦する」に着く。読み終えた所から次の一歩までが近い。
- 伝統色診断では、その色の辞典の項目へのリンクが読みもののすぐ後ろにあり、結果の続きを同じ区画で見つけられる。ほかの遊びへの誘いは「次はこれを試してみよう」にまとまる。
- science-thinking の思考プロフィールが「このタイプについて」の中に入り、読みものの続きとして読める。

## T5-5b の範囲の外で見つけたこと（判定に数えない。PM が受け持ちを決める）

### 解き終えた画面の招待のほとんどが計測されない

`InviteFriendButton` は `contentId` を渡されたときだけ `share`（surface `invite`）を送る（`InviteFriendButton.tsx` 17〜20行・60行・87行）。`contentId` を渡しているのは、animal-personality の解き終えた画面（`ResultCard.tsx` 251行・263行）と、character-personality の結果のページだけである。次の解き終えた画面の招待は `contentId` を渡さないので、押されても GA に何も残らない。

- `CharacterPersonalityContent.tsx`（97・111・140行）。PV の 74.87% を占める `/play/character-personality` の解き終えた画面の招待である。
- `MusicPersonalityContent.tsx`（71・82行）・`CharacterFortuneResultExtra.tsx`（65・76行）・`JapaneseCultureResultExtra.tsx`（65・76行）・`ScienceThinkingResultExtra.tsx`（74行）。

cycle-280 の c2b3fd6f が「面ごとに順に広げる」として任意の引数にしたまま、残りの面に広がっていない。T5-5b が入れたものではなく、T5-5b は招待の動きを変えない。ただ、ADR009 の前後の読みや招待の効果を GA で見るときに、最も来訪者の多い面の招待が数えられていないことになる。バックログに起こすか、`src/lib/analytics.ts` を触る T5-25b などに含めるかを PM が決めてください。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T5-27: animal-personality の招待の文の診断の名前（index.md に記録済み）。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」、science-thinking の「思考プロフィー／ル」、朱色のおすすめの文言。
