# T5-5b 第9回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘2つは、どちらも直った。完了の条件6つも引き続き満たし、ビルド・試験・型・lint・整形もすべて通る。375 の画面では、結果を読み終えた所から全幅の罫線を1本越えると「次はこれを試してみよう」と「もう一度挑戦する」に着く。辞典の項目へのおすすめは「このタイプについて」の読みものの直後に、辞典の一覧やほかの遊びへのおすすめは「もう一度挑戦する」のすぐ下に出る。

今回も、前回の直しだけでなく、T5-5b の全ファイルのコメント・型・引数を1つずつコードと突き合わせた。コードと合わないコメントが1つ残っている（下の「指摘」）。来訪者に見える動きを変えずに直せる。見つけたものはここにすべて挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- 読んだもの
  - t5-design.md の T5-5b の行と、10-4 の受け持ちの表の T5-5b の行。
  - index.md の「T5-5b の PM の判断」「T5-5b のレビューから次のタスクへ」と、T7 への申し送り（朱色のおすすめの文言）。
  - review-t5-5b-1〜8.md。
  - コミット 37bd762f（22ファイル）の差分と、作業ツリーの14ファイルの差分。
- 全文を読み、コメント・型・引数をコードと突き合わせたファイル
  - `ResultCard.tsx`・`ResultCard.module.css`・`QuizContainer.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`（とその CSS）・`recommendationPlacement.ts`・`src/app/play/[slug]/page.tsx`。
  - 追加の読みもの3つ（`CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`・`ScienceThinkingResultExtra.tsx`）。character-fortune と japanese-culture の2つは、診断の名前と招待の文のほかは同じ形であることを差分で確かめた。
  - 試験（`recommendationPlacement.test.ts`・`ResultExtraLoader.test.tsx`・`ResultCard.test.tsx` の `next/dynamic` のモック・`ResultReading.test.tsx` の理系思考の部分・`ScienceThinkingResultExtra.test.tsx`）と、`StorybookContent.tsx` の変更。
  - `ResultCard.module.css` のクラスは、どれも `ResultCard.tsx` で使われている（使われないクラスは無い）。
- 前回の直しの裏づけ
  - `recommendationPlacement.ts`: `DICTIONARY_LIST_SEGMENTS` は消え、判定は「区切りが3つで、最初が `dictionary`」だけになった。関数の説明の決まり（区切りが3つなのは項目のページだけで、一覧は2つ以下か4つ以上）を、`src/app/dictionary` の下の経路すべてと突き合わせた。
    - 1つ: `/dictionary`（一覧）。
    - 2つ: `/dictionary/{colors,humor,kanji,yoji}`（一覧）。
    - 3つ: `colors/[slug]`・`humor/[slug]`・`kanji/[char]`・`yoji/[yoji]`（どれも項目）。`colors/category`・`kanji/grade` のような3つの一覧の経路は無い（`page.tsx` を持たない）。
    - 4つ: `colors/category/[category]`・`colors/page/[page]`・`humor/page/[page]`・`kanji/{grade,radical,stroke}/[…]`・`kanji/page/[page]`・`yoji/category/[category]`・`yoji/page/[page]`（どれも一覧）と、`humor/[slug]/opengraph-image`（ページでなく画像の経路で、おすすめの行き先にならない）。
    - 6つ: 分類のページ送り（`colors`・`kanji` の3つ・`yoji` の `…/[…]/page/[page]`。一覧）。
    - `next.config.ts` の `/page/1` の転送と `/colors` の転送も、この決まりを崩さない。説明の決まりは経路と合う。
  - 試験は 1・2・3・4・6 の区切りを持つパスを渡し、上の経路の区切りの数をすべて覆う。データの `recommendationLink` の20通り（`/dictionary/{colors,yoji,kanji}`・色と四字熟語の項目・遊び）の分かれ方は、試験の表（traditional-color の aboutType 5・next 3 など）と合う。
  - `ResultNextContent.tsx` の頭の説明は、見出しの下の操作を「「もう一度挑戦する」と、結果ごとのおすすめのリンク」と言い、`children` の説明・`ResultCard.tsx` 516〜519行と合う。「診断・クイズ」の言い方もそろった。
- 書き出しと試験
  - scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` した。14ファイルを重ね、`cmp` で作業ツリーと同じことを確かめた。`src/play` と `src/app/play` の作業ツリーの差分は、この14ファイルだけである。
  - その書き出しで次を走らせ、すべて通った。
    - `npm run build` は exit 0。
    - `vitest --maxWorkers=2 src/play` と `src/__tests__/bundle-budget.test.ts` は142ファイル・2165件がすべて通った。
    - `tsc --noEmit` は exit 0（build のあとで走らせた）。
    - コミットの `src/` の `.ts`・`.tsx` と14ファイルにかけた `eslint` は exit 0。
    - コミットの `src/` のファイルと14ファイルにかけた `prettier --check` も通った。
    - `npm run check:phrased-names` の出力のうち T5-5b のファイルのものは `ResultCard.tsx:517` の「もう一度挑戦する」だけで、T5-3d が渡す分である（index.md の T5-3b の PM の決定）。
- 画面
  - 自分で `next start -p 3793` を立て、`/opt/pw-browsers/chromium-1194` の Chromium で、375×800 のまま解き終えた画面まで実際に解いた。
  - traditional-color（選ぶ選択肢を変えて5回。翡翠色・朱色・若草色・藍色・山吹色）: どれも 結果と共有 → このタイプについて → 次はこれを試してみよう → すべてのタイプ（8）→ よくある質問以降の並び。藍色と山吹色では「〇〇色の詳しい解説を見る」（`/dictionary/colors/ai` など）が「このタイプについて」の最後の小見出し「この色からのひとこと」の文のすぐ下にあり、罫線を越えて「次はこれを試してみよう」「もう一度挑戦する」が続く。翡翠色・若草色の「日本の伝統色を探索する」と朱色の「朱色の詳しい解説を見る」（行き先は一覧 `/dictionary/colors`）は「もう一度挑戦する」のすぐ下にある。朱色の文言と行き先の食い違いは T7 に申し送り済みである。
  - yoji-level（2回）: 結果と共有 → 次はこれを試してみよう（752）→ よくある質問以降。「このタイプについて」と「すべてのタイプ」は無い（計画どおり）。おすすめ（「四字熟語辞典で学ぼう」・「四字キメルで遊びながら覚えよう」）は「もう一度挑戦する」のすぐ下で、押せる高さは 44px。
  - どれも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。横のはみ出しは 0、コンソールのエラーも 0 だった。
- 後片づけ
  - 自分が記録した PID（`npx next start` の親）と、その子の `sh` と孫の `next-server` だけを止め、ポートが空いたことを確かめた。
  - 書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                                                    | 結果                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `recommendationPlacement.ts` の `DICTIONARY_LIST_SEGMENTS` は、どのリンクの分け方も変えない          | 直った。集合とそのコメントが消え、関数の説明が実際に分けている区切りの数の決まりを言う。決まりは `src/app/dictionary` の全経路と合う（上の裏づけ） |
| 2. `ResultNextContent.tsx` の頭の説明が、見出しの下に置くものを「同じ診断をもう一度解く操作」とだけ言う | 直った。「もう一度挑戦する」と結果ごとのおすすめのリンクを言い、`children` の説明と同じものを指す。「診断・クイズ」もそろった                      |

## 完了の条件

前回までのとおり、6つとも満たす（今回の変更は `recommendationPlacement.ts` の判定から効かない集合を除いたものと、コメント・型・試験だけで、どの結果の置き場所も変わらない。上の「画面」でも並びと置き場所は計画どおりである）。

## 指摘（builder が直す）

### 1. `ResultCard.tsx` の `buildAnimalPersonalityAfterTodayAction` のコメントが、ref が有効なときに招待を出さないと読ませる

`ResultCard.tsx` 221行のコメントは次のとおり。

```ts
// 相性セクション: referrerTypeIdが有効な場合は相性表示、なければ招待ボタン
```

コードは、ref が有効で相性が引けたときは `CompatibilitySection` と `InviteFriendButton` の両方を返し（228〜250行）、そうでないときは `InviteFriendButton` だけを返す（255〜262行）。コメントは「有効なら相性、なければ招待」の二択に読め、友だちの共有のリンクから来た来訪者には招待が出ないと読ませる。

`ResultExtraLoader.tsx` の頭の説明が animal-personality の相性と招待の組み方をこの関数に案内するようになったので、ここを読む人は増える。同じ組み方の `CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx` の説明は「友達の結果の共有のリンクから来たときは相性を出し、招待のボタンを続ける」と正しく言っている。これと同じ言い方にそろえてください（たとえば、コメントを関数の説明にして「日本の固有種診断の解き終えた画面の相性と招待。友達の結果の共有のリンクから来たときは相性を出し、招待のボタンを続ける。AnimalPersonalityContent の afterTodayAction に渡す。」）。

`MusicPersonalityContent.tsx` 46行の `buildAfterTodayAction` にも同じ文のコメントがあり、コードも同じ形である。このファイルは T5-5b の受け持ちではない（10-4 の表で T5-5a。招待の文は T5-27 が直す）が、`ResultExtraLoader.tsx` の説明が案内する先であり、CLAUDE.md は見つけた食い違いをその場で直すことを求める。PM が、同じ直しで一緒に直すか、T5-27 の行に書き足すかを決めてください。

## 良い点（来訪者の目で見て）

- 伝統色診断で藍色や山吹色になった来訪者は、自分の色の読みもの（「この色からのひとこと」）を読み終えたすぐ下で「〇〇色の詳しい解説を見る」に出会う。自分の結果の続きを、同じ区画のまま辞典で読める。
- 一覧へのおすすめ（「日本の伝統色を探索する」「四字熟語辞典で学ぼう」）は「もう一度挑戦する」と並び、次の遊びの一覧の上に来る。結果について読むものと、次にすることが区画で分かれている。
- 知識クイズ（四字熟語力診断）では、結果と共有のすぐ下の罫線のあとに「もう一度挑戦する」とおすすめが来る。読みものを持たないクイズで、空の区画を挟まずに次の一歩に着ける。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」、science-thinking の「思考プロフィー／ル」、朱色のおすすめの文言。
