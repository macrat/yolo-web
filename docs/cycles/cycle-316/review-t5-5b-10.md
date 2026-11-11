# T5-5b 第10回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘（animal-personality の相性と招待のコメント）は、`ResultCard.tsx` と `MusicPersonalityContent.tsx` の関数の中のコメントとしては、コードと合う文になった。完了の条件6つも引き続き満たし、ビルド・試験・型・lint・整形もすべて通る。375 の画面では、どの診断でも 結果と共有 → このタイプについて → 次はこれを試してみよう → すべてのタイプ → よくある質問以降 の順で並び、music-personality に有効な `?ref=` を付けて解くと、「このタイプについて」の最後に相性が出て、そのあとに招待が続く。

今回も T5-5b の15ファイルのコメント・型・引数を1つずつコードと突き合わせた。前回の直しの入れ方に1つ、表記の食い違いに1つ、記録に1つの指摘がある（下の「指摘」）。どれも来訪者に見える動きを変えずに直せる。見つけたものはここにすべて挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行（10-4 の表）と、10-4 の受け持ちの表で `MusicPersonalityContent` と追加の読みもの3つが載る行（T5-5a → T5-27）。
  - index.md の「T5-5b の PM の判断」「T5-5b のレビューから次のタスクへ」。
  - review-t5-5b-1〜9.md。
  - コミット 37bd762f（22ファイル）の差分と、作業ツリーの15ファイルの差分。`src/play` と `src/app/play` の作業ツリーの差分は、この15ファイルだけである。
- 全文を読み、コメント・型・引数をコードと突き合わせたファイル
  - `ResultCard.tsx`・`QuizContainer.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`・`recommendationPlacement.ts`・`src/app/play/[slug]/page.tsx`・`MusicPersonalityContent.tsx`（頭から `buildAfterTodayAction` と props まで）。
  - 追加の読みもの3つ。character-fortune と japanese-culture は、診断の名前・データの読み込みの名前・招待の文のほかは同じ形であることを差分で確かめた。
  - 試験4つ（`ResultCard.test.tsx` の `next/dynamic` のモックの説明と分岐、`ResultExtraLoader.test.tsx`、`ResultReading.test.tsx` の理系思考の部分、`ScienceThinkingResultExtra.test.tsx`）と `recommendationPlacement.test.ts`。
- 裏づけ
  - `recommendationPlacement.ts` の説明の決まり（区切りが3つなのは項目のページだけ）を、`src/app/dictionary` の下の `page.tsx` 23個と突き合わせた。3つの区切りの経路は `colors/[slug]`・`humor/[slug]`・`kanji/[char]`・`yoji/[yoji]` だけで、どれも項目である。
  - `page.tsx` 43行の「有効なタイプかを確かめるのは ref を受け取って相性を出す各部品」は、character-fortune・japanese-culture・music-personality・animal-personality が部品の中で `isValid*TypeId` を呼び、character-personality が相性の API（`isValidCharacterPersonalityTypeId`）に任せることと合う。
  - `ResultCard.tsx` 221行と `MusicPersonalityContent.tsx` 46行のコメントは、どちらも `myResult && friendResult && compatibility` のときに `CompatibilitySection` と `InviteFriendButton` を返し、そうでなければ `InviteFriendButton` だけを返すコードと合う。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` し、15ファイルを重ねて `cmp` で作業ツリーと同じことを確かめた。
  - その書き出しで次を走らせた。
    - `npm run generate:release-id` のあと `npm run build` は exit 0。
    - `vitest --maxWorkers=2 src/play` は141ファイル・2158件がすべて通った。
    - `tsc --noEmit` は exit 0（build のあと）。
    - 15ファイルにかけた `eslint` と、`src` 全体にかけた `eslint` は exit 0。
    - 15ファイルにかけた `prettier --check` は通った。
    - `npm run check:phrased-names` の出力のうち、T5-5b のファイルのものは `ResultCard.tsx:518` の「もう一度挑戦する」だけで、T5-3d が渡す分である（index.md の T5-3b の PM の決定）。ほかは storybook など、ほかのタスクの受け持ちである。
- 画面
  - 書き出しで自分で `next start -p 3811` を立て、`/opt/pw-browsers/chromium-1194` の Chromium で、375×800 のまま解き終えた画面まで実際に解いた。
  - music-personality（`?ref=solo-explorer`）: このタイプについての小見出し4つのあとに「友達との相性」（相性の名前・2人のタイプ・説明・共有）が出て、罫線のあとに「友達との相性を調べてみよう」「友達に診断を送る」が続く。そのあとの全幅の罫線を越えて「次はこれを試してみよう」「もう一度挑戦する」、次の遊びの一覧、すべてのタイプ（8）と並ぶ。
  - music-personality（`?ref=` なしと、`?ref=zzz`）: 相性は出ず、「今日の音楽ライフのヒント」のあとに招待だけが出る。
  - animal-personality（`?ref=nihon-zaru`）と character-fortune（`?ref=commander`）: 相性と招待が「このタイプについて」の最後にこの順で出る。
  - traditional-color（翡翠色）: 「日本の伝統色を探索する」（`/dictionary/colors`）は「もう一度挑戦する」のすぐ下にある。
  - yoji-level: 結果と共有 → 次はこれを試してみよう → よくある質問以降。「四字キメルで遊びながら覚えよう」は「もう一度挑戦する」のすぐ下にある。
  - science-thinking: 「あなたの思考プロフィール」が「このタイプについて」の最後の小見出しで、招待が続く。
  - どれも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあり、横のはみ出しは 0、コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`npx next start` の親）と、その子の `sh`・孫の `next-server` だけを止め、ポートが応えなくなったことを確かめた。書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                                                                     | 結果                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `ResultCard.tsx` の `buildAnimalPersonalityAfterTodayAction` のコメントが、ref が有効なときに招待を出さないと読ませる | 関数の中のコメントはコードと合う文になった。ただし、`MusicPersonalityContent.tsx` では同じ関数の説明（39行）が古い言い方のまま残り、2つの説明が並んだ。言い方も、前回そろえるよう求めた追加の読みもの2つの説明とそろっていない（下の指摘1） |

## 完了の条件

前回までのとおり、6つとも満たす（今回の変更はコメントだけで、どの結果の並びと置き場所も変わらない。上の「画面」でも並びと置き場所は計画どおりである）。

## 指摘

### 1.（builder）`MusicPersonalityContent.tsx` の `buildAfterTodayAction` に説明が2つ並び、関数の説明は前回直した言い方のまま残っている（ツギハギ）

`MusicPersonalityContent.tsx` の39行と46〜47行は次のとおり。

```ts
/** 解き終えた画面の相性と招待。友達のタイプが正しければ相性を出し、なければ招待だけを出す。 */
function buildAfterTodayAction(
  ...
  // 友達のタイプの id（ref）が有効で相性が引けたときは、相性を出して招待のボタンを続ける。そうでなければ
  // 招待のボタンだけを出す。
```

- 関数の説明（39行）は、前回の指摘で直した「有効なら相性、なければ招待」の二択と同じ組み立てで、ref が正しいときに招待が続くことを言わない。そのすぐ下に、同じ分かれ方を別の言い方でもう一度言うコメントが足された。1つの関数に同じことを言う説明が2つあり、しかも言うことが食い違う。あとから書き足した跡がそのまま残る形で、CLAUDE.md のツギハギ禁止に当たる。
- 前回は、追加の読みもの2つ（`CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`）の説明「友達の結果の共有のリンクから来たときは相性を出し、招待のボタンを続ける」と同じ言い方にそろえ、関数の説明にすることを例に挙げた。今回の2つのコメントは「友達のタイプの id（ref）が有効で相性が引けたときは…」と別の言い方で、関数の中のコメントとして書かれている。相性と招待を組む5つの所（追加の読みもの2つ・`ResultCard.tsx`・`MusicPersonalityContent.tsx`・`CharacterPersonalityContent.tsx`）のうち、同じことを3通りの言い方で書くことになる。

直し方: `MusicPersonalityContent.tsx` は、39行の関数の説明を追加の読みもの2つと同じ言い方に書き換え（たとえば「解き終えた画面の相性と招待。友達の結果の共有のリンクから来たときは相性を出し、招待のボタンを続ける。」）、46〜47行のコメントを消す。`ResultCard.tsx` の `buildAnimalPersonalityAfterTodayAction` も、221〜222行のコメントを消し、同じ言い方の関数の説明（「日本の固有種診断の解き終えた画面の相性と招待。…」）を付ける。どちらもコードは変えない。

### 2.（builder）「友だち」と「友達」が、同じファイルの中で混ざっている

T5-5b が書いた props の説明3つは「友だち」と書く。

- `ResultCard.tsx` 128行「相性を見る友だちのタイプの id（共有のリンクの ref）」
- `QuizContainer.tsx` 41行（同じ文）
- `ResultExtraLoader.tsx` 17行（同じ文に使い手を添えたもの）

一方、今回の直しの `ResultCard.tsx` 221行は「友達のタイプの id（ref）」と書き、同じファイルの中で同じものを2通りに書いている。`src` のほかの所（コメントと画面の文。「友達との相性」「友達に診断を送る」、追加の読みもの・`MusicPersonalityContent.tsx`・`page.tsx` の説明など）は、`src` の試験を除く `.ts`・`.tsx` 全体で「友達」が80か所、「友だち」はこの3か所だけである。来訪者が画面で読む語と同じ「友達」にそろえてください（3か所の「友だち」を「友達」にする）。

### 3.（PM）T5-5b が、10-4 の表で T5-5a の行に載るファイルを触ったことを index.md に残す

10-4 の受け持ちの表では、`CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`・`ScienceThinkingResultExtra.tsx`・`MusicPersonalityContent.tsx` は T5-5a の行に載り、招待の文は T5-27 が直す。index.md の「T5-5b の PM の判断」が T5-5b の変更として認めているのは、`ScienceThinkingResultExtra.tsx` の外側の `<Reading>` を Fragment にする変更だけである。

T5-5b は、このほかに次を変えた。

- `ScienceThinkingResultExtra.tsx`: 使われない `referrerTypeId` を props と `renderScienceThinkingExtra` の引数から外した（review-t5-5b-6.md の指摘2）。
- `CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`: 描く所の説明と、`render*Extra` の戻り値の型から使われない2つ目の引数を外した（review-t5-5b-3.md・review-t5-5b-5.md）。
- `MusicPersonalityContent.tsx`: 相性と招待のコメント（review-t5-5b-9.md が PM に決めるよう求めたもの）。

前回、`MusicPersonalityContent.tsx` を同じ直しで直すか T5-27 の行に書き足すかを PM が決めるよう求めたが、その決定は index.md に無い。T5-27 を受け持つ者が、これらのファイルの説明と型がすでに変わっていることを知れるよう、T5-5b の PM の判断に、上の変更を T5-5b の変更として認めたことを書き足してください。

## 良い点（来訪者の目で見て）

- 友達の共有のリンクから音楽性格診断に来た来訪者は、自分のタイプの読みものを読み終えたすぐ下で、友達との相性を読み、そのまま次の友達を誘うボタンに着く。相性が出ても招待が消えないので、共有のリンクが次の来訪者へつながる。
- ref が無いときや正しくないときは、相性の区画が空で出ることはなく、招待だけが出る。壊れたリンクから来ても、画面に欠けた所が見えない。
- 知識クイズ（四字熟語力診断）では、結果と共有のすぐ下の罫線のあとに「もう一度挑戦する」とおすすめが来る。読みものを持たないクイズで、空の区画を挟まずに次の一歩に着ける。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」、science-thinking の「思考プロフィー／ル」、朱色のおすすめの文言。
