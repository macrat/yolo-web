# T5 設計のレビュー 2巡目（タスクの分け方: 10章）

対象: [t5-design.md](./t5-design.md) 10章の全体（HEAD `4ae57cc`）。突き合わせた先: 1巡目の [review-t5-design-b.md](./review-t5-design-b.md)、index.md の T5・T5a の行、[t6-design.md](./t6-design.md) 4章。受け持ちは `src/` の import を `rg` で確かめた。見たのは次の3つだけ: builder どうしが同じファイルでぶつかるか、途中でビルドが壊れるか、T5 の項目に受け持ちの無いものが残るか。

## 判定: 改善指示

1巡目の Major 12・Minor 9 はどれも直っている（下の表）。t5-design 10章と t6-design 4章の順序も食い違っていない。ただし、分けたことで新しくぶつかる所が3つできた（Major 3）。

## 1巡目の指摘の確かめ

| 指摘   | 結果                                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M1     | 直った。`OtherTypesNav` を import する8つの読みものの部品・`ResultReading`・`CompatibilitySection`・結果のページ2本（`[slug]`・`character-fortune`。`rg` で import はこの2本だけ）が T5-5a の受け持ちになり、T5-5a → T5-6 の順 |
| M2     | 直った。`RecommendedContent` の使う側（`QuizPlayPageLayout`・`ResultPageShell`・daily・`GameLayout`）と `RelatedQuizzes` の使う側（`QuizPlayPageLayout`・`ResultPageShell`）を `rg` で確かめた。T5-4 → T5-6・T5-19・T5-20b     |
| M3     | 直った。T5-3c の条件にビルドがある。storybook の `page.tsx` はサーバーで、もう `splitIntoPhrases` を import してクライアントの `StorybookContent` に渡しているので、T5-3a・T5-3c が見本を同じコミットで直す形は成り立つ        |
| M4     | 直った。`Panel` は残す（`ItemList`・storybook）。10-3 と 10-4 の末尾にある                                                                                                                                                     |
| M5     | 直った。index.md の T5a の行に `QuestionCard` がある。10-4 と 10-1 に T5a → T5-25c がある                                                                                                                                      |
| M6     | 直った。「撮って確かめる状態」の (1)〜(4) が password-generator・html-entity の行と T5-26 に割り当てられている                                                                                                                 |
| M7     | 直った。9章の §4 に文があり、T5-25c の条件に計算値の `line-break` がある                                                                                                                                                       |
| M8     | 直った。T5-17 は値を記録するだけ。800 と 667 の条件は T5-18 の2本の行にある。途中で崩れる間のことも 10-1 に書かれている                                                                                                        |
| M9     | 直った。10章の頭で、ページのディレクトリのうち T5 が触るのは `page.tsx`・`page.module.css`・ページの試験だけと決めた。T5-15 と T6-2 の順は両方の文書にある                                                                     |
| M10    | 直った。T5-25a（生成）と T5-25b（計測の `variant`）に分かれ、`useId` を残す理由も書かれている                                                                                                                                  |
| M11    | 直った。`FileDropZone`・`ListControls` は T5-3b の受け持ち。2本の道具は T5-3b のあと                                                                                                                                           |
| M12    | 直った。T5-3a/3b/3c、T5-5a/5b/6、T5-20a〜e、T5-25a〜c に分けた                                                                                                                                                                 |
| m1〜m9 | どれも直っている（はみ出しの手順は10章の頭、パンくずは T5-26、markdown-preview は T5-16 のあと、T5-8 にコピーの列、出す順、password-generator の 320px、選ぶ欄の3本、足りなかったファイル、t6 の表の `DESIGN.md` の行）        |

t6-design 4章との突き合わせ: `DESIGN.md`（T5-1 と T6-1 を並行させない）、404・410（T5-22・T5-23 → T6-10）、`ResultCard`（T5-5a → T5-5b → T5a → T6-6）、`QuizContainer`（T5-4 → T5-5b → T5a → T6-6）、`analytics.ts`（T5-15 → T5-25b、どちらも T6-6 と並行させない）、`blog/[slug]/page.tsx`（T5-15 と T6-2）、irodori の `GameContainer`（T5-20a と T6-9）、画像のルートを T5 が触らないこと、T6-7 と T5-7・T5-14・T5-21。どの行も2つの文書で同じ向きになっている。

## Major

### N1. 区切りの並びを見出しの外で組む部品に受け持ちが無い。T5-3a・T5-3c・T5-8 は T5-3b の `PhrasedText` とぶつかるか、同じものを3つ作る

`src/components/PhrasedText` は、いま `as` に `h1`〜`h6` しか取らない（`PhrasedTag`）。区切りの並びのあいだに `<wbr>` を置き、ダッシュを前の語に付けて組む（`joinDashes`）のは、この部品だけである。ところが、見出しでない所で区切りの並びを組むタスクが4つある。

- T5-3a: `LinkIndex` の語（`<a>` の中）と、`IndexAccordion` の索引の名前（`Accordion` の `summary` に渡す）
- T5-3b: コントロールの名前（`<label>`・`<legend>`・`summary` など）
- T5-3c: FAQ の問い（`FaqSection` は問いを `Accordion` の `summary` に渡している。`FaqSection/index.tsx:43`）
- T5-8: 表のセル

10-4 は `PhrasedText` と `Accordion` を T5-3b だけに持たせている。一方 10-1 は、T5-3a・T5-3b・T5-8 を「並行してよい」とし、T5-3b と T5-3c の順も書いていない。builder の取れる道は2つしかない。(a) 3人がそれぞれ `PhrasedText` を見出しの外へ広げる。これは同じファイルを並行して触ることになる（AP-WF07）。(b) 3人がそれぞれ自前の `<wbr>` の組み方を作る。こちらは同じ仕組みが4つに分かれ、ダッシュの扱いのような禁則の直しが揃わなくなる（ツギハギ）。T5-3c は、`Accordion` の `summary` に区切りを渡す形も T5-3b が決めるものなので、それを待つ理由がもう1つある。

直し方の例: 「`PhrasedText` が見出しの外の要素（`span` など）でも組めるようにし、`Accordion` の `summary` が区切りの並びを受け取れるようにする」ことを T5-3b に入れる（あるいはその分だけの小さなタスクを先に置く）。そのうえで、10-1 と 10-4 に T5-3b → T5-3a・T5-3c・T5-8 を書く。T5-3a・T5-8 が T5-1 の直後に T5-3b と並行してよい、という文は外す。

### N2. `TileInteractionTracker.tsx` を T5-17 と T5-25b の両方が触るのに、順序が無い

10-4 は、`src/tools/_components/ToolPageLayout/*` を T5-3c → T5-17 に持たせ、その中の `ToolPageLayout/TileInteractionTracker.tsx` を T5-25b に持たせている。2つの行が同じファイルを含んでいる。しかも `TileInteractionTracker` は、道具の本体の `<section>` を描く部品である（`ToolPageLayout/index.tsx:61-69`）。T5-17 が 4-b のセクションで頭を組み直せば、このファイルに手が入りうる。10-1 の依存に書かれているのは T5-15 → T5-25b だけで、T5-17 → T5-25b は「出す順」（来訪者の数の順）にしか現れない。出す順は「依存が許すものの中で」の順なので、並行を止める決まりにならない。T5-25b が `TileInteractionTracker` の props から `variant` を外せば、使う側の `ToolPageLayout/index.tsx`（T5-17）も同じコミットで直すことになる。

直し方: 10-1 の依存に T5-17 → T5-25b を書く。10-4 の `TileInteractionTracker.tsx` の行を「T5-17 → T5-25b」にし、`ToolPageLayout/*` の行からそのファイルを外すか、同じ順を書く。

### N3. storybook の順（T5-3a → T5-3c → T5-5a → …）が、診断の順と出す順に食い違う

10-1 の診断の行は、T5-5a を T5-4 と並行させ、T5-3c を T5-4 のあとに置いている。出す順も「T5-4・T5-5a → … T5-3c」である。つまり T5-5a は T5-3c より先に動く。ところが 10-1 の storybook の行と 10-4 の `StorybookContent.tsx` の行は「T5-3a → T5-3c → T5-5a → T5-5b → T5-24」で、T5-5a を T5-3c のあとに置く。

この食い違いを文字どおりに読むと、T5-5a は T5-3c を待ち、T5-3c は T5-4 を待つので、「T5-4 と並行して T5-5a」が成り立たない。PV の 81% の面の仕事が1つ遅れる。診断の行のほうを採れば、T5-5a と T5-3c が `StorybookContent.tsx` を同時に触りうる。どちらの読み方でも、builder は決められない。

直し方: storybook の順を、診断の順と出す順に合わせて1つにする（例 T5-3a → T5-5a → T5-3c → T5-5b → T5-24）。T5-5a が T5-3a を待つことになるなら、それも診断の行に書く。10-1 と 10-4 の2か所を同じにする。

## Minor

- **n1. `LinkIndexItem` を組むファイルが T5-3a に無い**: `LinkIndex` の型（`LinkIndexItem`・`LinkIndexGroup`）を作っているのは `src/dictionary/_lib/{kanji-list,yoji-list,color-list}.ts` で、一覧の部品はそれを呼ぶだけである。T5-3a の「使う側」と 10-4 に、この3ファイルを足す。語の区切りをどこで作るか（`_lib` か一覧の部品か）も、T5-3a の中身に一言あると迷わない。
- **n2. 読みものの周りのファイル**: `InviteFriendButton` を描くのは、読みものの部品のほかに `CharacterFortuneResultExtra`・`JapaneseCultureResultExtra`・`ScienceThinkingResultExtra`（`ResultExtraLoader` から描かれる）と `src/app/play/character-personality/result/[resultId]/page.tsx` である。T5-5a が「このタイプについて」を組むときに触りうるので、10-4 の T5-5a の行（→ T5-5b。結果のページの分は → T5-6）に足す。`src/play/quiz/solvedScreenHeadings.ts`・`readingHeadings.ts` も同じく足す。新しい見出しの区切りを `QuizPlayPageLayout` 経由で渡す必要が出たら、それは T5-4・T5-3c の受け持ちとぶつかる。そうしないこと（`QuizPlayPageLayout` を触らないこと）か、触るならその順を T5-5a・T5-5b に書く。
- **n3. T5-24 の依存**: T5-24 は T5-3b と T5-8 の部品の見本を足すが、10-1 の依存に T5-3b → T5-24 と T5-8 → T5-24 が無い（出す順では満たされる）。依存の行に足す。

## 次の手順

指摘は Major 3・Minor 3。planner に 10章（10-1・10-2 の T5-3a〜c と T5-8・10-4）を直させる。N1〜N3 で t6-design.md 4章に響く行は無い。直したあと、今回の指摘だけでなく 10章の全体をもう一度レビューに出すこと。
