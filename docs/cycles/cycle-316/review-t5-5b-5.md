# T5-5b 第5回レビュー（解き終えた画面の並びとセクション）

## 判定

**改善指示**

前回の指摘（`allResults` の説明と、頭の説明の折り返し）は直った。完了の条件6つも引き続き満たし、ビルド・試験・型・lint・整形もすべて通る。375 の画面は来訪者にとって分かりやすい。結果を読み終えた所から全幅の罫線を1本越えると、「次はこれを試してみよう」と「もう一度挑戦する」に着く。

ただ、今回は T5-5b の全ファイルのコメントを1行ずつ読み、書いてあることがコードと合っているかを確かめた。その結果、コードと合わない説明が3か所、使われていない型と試験のモックが2か所見つかった。今回言い直した `next/dynamic` のモックの説明にも、事実と違う所が1つある。どれもコードの動きは変えずに直せる。回数を重ねないよう、見つけたものはすべてここに挙げた。直したあと、全体の見直しを含めてもう一度レビューを受けてください。

## 確かめたこと

- コミット 37bd762f（22ファイル）の差分を、もう一度すべて読んだ。作業ツリーの6ファイルの差分も読んだ。`ResultCard.tsx`・`QuizContainer.tsx`・`ResultExtraLoader.tsx`・`ResultNextContent.tsx`・`QuizPlayPageLayout.tsx`・`recommendationPlacement.ts`・追加の読みもの3つ（`CharacterFortuneResultExtra.tsx`・`JapaneseCultureResultExtra.tsx`・`ScienceThinkingResultExtra.tsx`）は全文を読み、コメントを1つずつコードと突き合わせた。CSS と試験のコメントも読んだ。
- scratchpad の、自分だけが使うサブディレクトリに `git archive HEAD` で書き出した。`node_modules` が無いことを確かめてから `cp -al` し、作業ツリーの6ファイルを重ねた（`cmp` で同じことを確かめた）。
- その書き出しで次を走らせ、すべて通った。
  - `npm run build` は exit 0。
  - `vitest --maxWorkers=2 src/play` は141ファイル・2158件がすべて通った。
  - `tsc --noEmit` は exit 0。
  - コミットの `.ts`・`.tsx` と6ファイルにかけた `eslint` は exit 0。
  - コミットの全ファイルと6ファイルにかけた `prettier --check` もすべて通った。
- 同じ書き出しで、`ResultExtraLoader.test.tsx` から3つの `vi.mock("../*ResultExtra", …)` を消して試験を走らせた。9件すべて通った（下の指摘3）。確かめたあと、ファイルは元に戻した。
- 自分で `next start -p 3591` を立て（自分が記録した PID とその子だけを止めた）、`/opt/pw-browsers/chromium-1194` の Chromium で、375×800 で実際に解き終えた画面まで解いた。解いたのは science-thinking・character-personality・traditional-color・kanji-level・character-fortune（`?ref=commander`）の5つ。画像はリポジトリの `tmp/t5-5b-rv5/` にある。
  - 一番外側のセクションは、どれも「結果と共有 → このタイプについて → 次はこれを試してみよう → すべてのタイプ → よくある質問以降」の順だった。kanji-level だけは「結果と共有 → 次は → よくある質問以降」になる。
  - science-thinking では、「あなたの思考プロフィール」（レーダー・量の帯・招待）が「このタイプについて」の最後にある。そのすぐ下に全幅の罫線があり、そのあとに「次はこれを試してみよう」と「もう一度挑戦する」が来る。
  - character-personality では、「この結果を共有」（y=942）から「次はこれを試してみよう」（y=2600）まで 1,658 だった。index.md の 1,560〜1,730 の幅に入る。
  - kanji-level のおすすめ「漢字辞典で漢字の世界を探検しよう」（`/dictionary/kanji`）は、「次はこれを試してみよう」に入っていた。
  - 5つとも、結果に着いたときのフォーカスは結果のボックス（`section`、`tabindex=-1`）にあった。横のはみ出しは 0 だった。
- ポート 3517 の `next-server`（PID 20464）は自分のものではないので、触れていない。自分のサーバーを止め、書き出しを消した。

## 前回の指摘への対応

| 指摘                                                                      | 結果                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `allResults` の説明が並べ替える前の位置の言い方（builder）             | 直った。説明が「「次はこれを試してみよう」のあとの、最後のセクション「すべてのタイプ」に並べる」になり、頭の説明の 1〜4 の並びと合う                                                                                                                              |
| 1 のあわせ. 頭の説明の折り返し                                            | 直った。段落の折り返しがそろい、足した跡が見えなくなった。あわせて「リンクの行き先から recommendationPlacement が決める」と、決め方も分かる文になった                                                                                                             |
| builder が今回言い直したほかの2つ（おすすめのリンクの説明・モックの説明） | おすすめのリンクの説明（`ResultCard.tsx` 415〜416行）は、`recommendationPlacement.ts` の説明と index.md の「T5-5b の PM の判断」と同じ「行き先」の言い方になった。これは良い。モックの説明（`ResultCard.test.tsx` 18〜20行）には、事実と違う所がある（下の指摘1） |

## 完了の条件

前回までのとおり6つとも満たす（上の「確かめたこと」の画面の値のとおり）。

## 指摘（どれも builder が直す）

### 1. `ResultCard.test.tsx` の `next/dynamic` のモックの説明で、MusicPersonalityContent を「実物」と言っている

今回言い直した説明（18〜20行）は、次のとおり。

```ts
// AnimalPersonalityContent・MusicPersonalityContent・TraditionalColorContent は実物をファクトリの中で先に読み込んで
// おき、ほかの *Content は data-testid を持つスタブにする。
```

ところが、同じファイルの 133 行で `vi.mock("@/play/quiz/_components/MusicPersonalityContent", …)` がこの部品をスタブ（`data-testid="music-personality-content"`）に置き換えている。そのため、ファクトリの中の `await import(…MusicPersonalityContent)` が受け取るのは、このスタブである。実際、試験「MusicPersonalityContent コンポーネントがレンダリングされること」はスタブの `data-testid` で確かめている。

実物なのは Animal と TraditionalColor の2つだけである（どちらも、読むデータのモジュールはモックにしてある）。説明を、Music はファイルの下の `vi.mock` のスタブが使われる、と分かる言い方に直してください。

### 2. `ScienceThinkingResultExtra.tsx` の説明が、起こらない場面を言っている

部品の説明（53〜57行）は、T5-5b が1行を足した段落である。この段落の「答えが無いとき（結果のリンクから開いたとき）は招待だけを出す」は、実際のコードと合わない。

- この部品を描くのは `ResultExtraLoader` だけである。`ResultExtraLoader` は、解き終えた画面で来訪者の答え（`answers`）をいつも渡す。
- 結果のページ（`/play/science-thinking/result/[resultId]`）は、この部品を描かない（`src/app` とその下に使う所が無い）。

つまり「結果のリンクから開いたとき」にこの部品が答え無しで描かれることは無い。答えが空のときの分かれ道は、試験と守りのためだけにある。読む人は、結果のページにもレーダーの小見出しや招待が出ると読み違える。括弧の中を消し、「答えを受け取らないときは招待だけを出す」のように、場面でなく条件で言ってください。

### 3. `ResultExtraLoader.test.tsx` の3つの `vi.mock("../*ResultExtra", …)` は、使われていない

`next/dynamic` をモックにしているので、`ResultExtraLoader` の中の `import("./…ResultExtra")` は、文字列にされるだけで実行されない。3つのモジュールはどれも読み込まれず、これらのモックは何の働きもしていない。書き出しで3つを消して走らせたところ、9件すべて通った。

前回まではこの3つに「型エラー回避のため」という説明が付いていた（その説明も事実と違っていた）。今回その説明だけが消え、理由の書かれていないモックが残っている。3つの `vi.mock` を消してください。

### 4. `renderCharacterFortuneExtra`・`renderJapaneseCultureExtra` の戻り値の型に、使われていない2つ目の引数がある

この2つは、戻り値の型を `(resultId: string, refTypeId?: string) => React.ReactNode` としている。しかし、返す `ResultExtraRenderer` は `resultId` しか受け取らない。呼ぶ側（`ResultExtraLoader`）も1つしか渡さない。

同じ役目の `renderScienceThinkingExtra` の型は `(resultId: string) => React.ReactNode` で、3つの部品のあいだで型が食い違っている。読む人は、2つ目の引数で相性の相手を差し替えられると読み違える。2つの型を `(resultId: string) => React.ReactNode` にそろえてください。この2つのファイルは今回説明を直したファイルで、動きは変わらない。

### 5. `src/app/play/[slug]/page.tsx` の説明が、`ResultExtraLoader` の受け持ちを取り違えている

T5-5b のファイルの外だが、T5-5b の部品の受け持ちを言う説明なので、ここで挙げる。43 行の説明は次のとおり。

```ts
// バリデーションはクライアントサイドの ResultExtraLoader が担うため、ここでは渡すだけ
```

`ResultExtraLoader` は、`ref` の値を確かめない。確かめるのは、描かれる側の部品である。追加の読みもの（`isValidCharacterTypeId`・`isValidCultureTypeId`）、読みものの部品（`CharacterPersonalityContent`・`MusicPersonalityContent`）、`ResultCard` の `buildAnimalPersonalityAfterTodayAction`（`isValidAnimalTypeId`）がそれぞれ確かめる。

このファイルの順の決まり（T5-22b と T6-3 を並行させない）で先に触るタスクは、どちらも終わっている（22d2632f・a5304a35）。いま作業ツリーでこのファイルを触っている人もいない。「確かめるのは、`ref` を受け取って相性を出す各部品で、ここでは渡すだけ」のように、実際の受け持ちで言い直してください。

## 良い点（来訪者の目で見て）

- science-thinking では、自分の思考のレーダーと量の帯が「このタイプについて」の読みものの続きとして来て、招待で締まる。そのすぐ下の罫線のあとに「もう一度挑戦する」がある。読みものの途中に別の区画が割り込まず、読み終えた所で次の一歩が見つかる（`tmp/t5-5b-rv5/science-thinking-extra-375.png`）。
- 結果に着いたとき、結果のボックスが画面の上に来て、フォーカスもボックスに移る。狭い画面でも、来訪者は自分の結果から読み始められる。
- 知識クイズ（kanji-level）は、中身の無い「このタイプについて」を出さない。結果と共有のすぐ下で「次はこれを試してみよう」に着く。

## 次のタスクへ渡すこと（T5-5b の指摘ではない）

前回までに渡したものは変わらない。

- T5a: 二度打ち（kanji-level の 375×800）と、`QuestionCard` の説明に残る `.resultPhase`。
- T5-24: storybook 27 のあき。
- T5-6: `OtherTypesNav` の `margin-top`。
- T5-3d: 「もう一度挑戦す／る」。
- T7: japanese-culture の `?ref=` が無いときの「このタイプについて」と、science-thinking の「思考プロフィー／ル」。
