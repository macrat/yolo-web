# T5 設計のレビュー（タスクの分け方: 10章）

対象: [t5-design.md](./t5-design.md) 10章（10-1 順序・10-2 T5-1〜T5-26・10-3 道具ごと・10-4 受け持ち・10-5 T5 の行の項目の受け持ち）。突き合わせた先: index.md の T5・T5a の行と補足事項の T5 に触れる行、[t5-inventory.md](./t5-inventory.md)、[t6-design.md](./t6-design.md) 4章。0〜9章の決定そのものは別のレビューが見るので、ここでは決定をタスクへ落とした形だけを見た。事実は HEAD（`0dbfea7`）の `src/` を `grep`・`ls` で確かめた。

## 判定: 改善指示

T5 の行の項目はほぼすべて 10-5 でどれかのタスクに割り当てられていて、道具36本も 10-3 に漏れなく並んでいる。t6-design.md 4章の順序（T5-23 と T6-0 の `middleware.ts`、T5-22 → T6-10、`QuizContainer` の T5-4 → T5-5 → T5a → T6-6、T5-7・T5-14・T5-21 と T6-7、T5-20 と T6-9、T5-1 と T6-1）も食い違っていない。一方で、実コードと突き合わせると次の問題が見つかった。(1) 受け持ちの表に無い共有ファイルを、並行してよいとされたタスクどうしが触る。(2) ビルドが壊れる。(3) 完了の条件を満たせない。(4) T5 の行の項目のうち、確かめられる条件に落ちていないものがある。

## Major

### M1. 解き終えた画面（T5-5）と結果のページ（T5-6）が同じ部品を触るのに、並行してよい形になっている

「すべてのタイプ」の一覧（`OtherTypesNav`）は、`ResultCard` や `ResultPageShell` が直に置いているのではない。診断ごとの読みものの部品の中から描かれている（`CharacterPersonalityContent`・`AnimalPersonalityContent`・`TraditionalColorContent`・`MusicPersonalityContent`・`ImpossibleAdviceContent`・`ContrarianFortuneContent`・`YojiPersonalityContent`・`UnexpectedCompatibilityContent` が `OtherTypesNav` を import し、`placement` を渡す）。見出しの段は、共有の型 `ResultPlacement` と `SECTION_HEADING`（`OtherTypesNav.tsx`）が面ごとに決めている。これを `ResultReading.tsx`・`CompatibilitySection.tsx` も import している。

このため、次の2つはどちらもこれらの読みものの部品と `SECTION_HEADING` を書き換えることになる。

- T5-5: すべてのタイプを「次はこれを試してみよう」のあとへ送り、「このタイプについて」をセクション（h2）にする
- T5-6: 結果のページで共有をすべてのタイプの前へ送る

ところが 10-4 は `OtherTypesNav` を T5-5 に、`ContrarianFortuneContent` を T5-6 に割り当てている。残る7つの読みものの部品・`ResultReading`・`CompatibilitySection`・結果のページの `src/app/play/{[slug],character-fortune,character-personality,contrarian-fortune}/result/[resultId]/page.tsx` には受け持ちが無い。10-1 では、T5-5 と T5-6 は「受け持ちの表で触るファイルが分かれていれば並行してよい」面のタスクに入っている。これは 10章の頭の「共有の型を変えるタスクは使う側を同じタスクに入れ、並行させない」と、AP-WF07（同じファイルを含むタスクの並行アサイン）に当たる。

直し方の例: T5-5 → T5-6 を順にすることを 10-1 に書く。上のファイルを 10-4 に並べ、`OtherTypesNav`・読みものの部品は「T5-5 → T5-6 → T5a（触るなら）→ T6-6」とする。すべてのタイプを外へ出す組み替えを、先に1つの小さいタスクにする形でもよい。

### M2. `RecommendedContent`・`RelatedQuizzes` を T5-4 だけが持つが、ほかの面のタスクも同じ部品を描く

`src/play/_components/RecommendedContent` は `QuizPlayPageLayout`（T5-4）のほかに、`ResultPageShell`（T5-6）・`src/app/play/daily/page.tsx`（T5-19）・`GameLayout`（T5-20）が使っている。`RelatedQuizzes` も `ResultPageShell` が使う。T5-4 が「関連・おすすめの見出しを §4 のセクションの見出しの段にする」と、T5-6・T5-19・T5-20 の見出しとセクションも同時に変わる。それなのに、10-1 はこれらを T5-4 と並行してよいとしている。T5-4 → T5-6・T5-19・T5-20 の順を書くか、部品の見出しの段を T5-4 で決めてほかは使うだけにすることを書く。

### M3. T5-3 が `FaqSection`・`LinkIndex` で `splitIntoPhrases` を呼ぶと、storybook のせいでビルドが止まる

`src/lib/phrase-breaks.ts` は `import "server-only"` を持つ。`src/app/storybook/StorybookContent.tsx` は `"use client"` で、`FaqSection`（:20、:1215・:1223 で描画）と `LinkIndex` を import している。4-i の決定「`FaqSection`（サーバーの部品）が `splitIntoPhrases` で区切る」をそのまま T5-3 で実装すると、このクライアントの部品を通して `server-only` が読み込まれ、`npm run build` が失敗する。storybook は T5-24 の受け持ちで、T5-24 は T5-3 のあとに来る。そのため、10章の頭の「どのタスクも終わった時点でビルドが通る」を T5-3 が満たせない。

T5-3 に storybook の該当する見本の直しを入れて、T5-3 → T5-24 の順で `StorybookContent.tsx` を受け持つと書く。あるいは、区切りをサーバーの側（ページ）で作って部品に渡す形にすることを T5-3 の内容に書く。

### M4. T5-25 の「使われなくなった `Panel` を消す」は事実に反する

`Panel` を使うのは道具31本だけではない。`src/components/ItemList/index.tsx:3`・`:169`（`<Panel as="div" rows>`。行の一覧のボックス）と `StorybookContent.tsx:4`・`:418`（見本「4. Panel」）も使っている。T5-18 で道具から外しても `Panel` は使われ続けるので、T5-25 で消すと ItemList が壊れる。T5-25 の完了の条件も `Panel` を確かめていない。

T5 の行が言うのは道具の結果から `Panel` を外すことで、部品を消すことではない。部品を残すなら、T5-25 の内容と 10-1・10-4・10-5 の「`Panel`」を外す。消すなら、ItemList と storybook を移すタスクを受け持ちに入れる（AP-P16・AP-WF12: 前提を実体で確かめていない）。

### M5. 回答中の画面の `QuestionCard.module.css:98` の `--radius` に受け持ちが無く、T5-25 の条件を満たせない

`--radius` の残りは、道具・storybook のほかに `src/play/quiz/_components/QuestionCard.module.css:98`・`ColorDetail`・`NextGameBanner`・humor・privacy がある（`grep`）。このうち `QuestionCard` だけは、10-4 にも 10-5 にも受け持ちが無い。5-a で `QuestionCard.*` は T5a の受け持ちとされているが、T5a の行は古いトークンに触れていない。10-1 も「すべての面のタスク → T5-25」で、T5a を T5-25 の前に置いていない。

このままだと、T5-25 の完了の条件「`src/` で古いトークンの参照が0」を満たすには、T5-25 が T5a のファイルに触ることになる。T5a → T5-25 の順を 10-1 に書き、T5a に `QuestionCard` の古いトークン（とフォーカスの `outline: none`）を渡すことを 10-5 に書く。

### M6. T5 の行の「無効の枠・破線・狭い画面の状態の線を撮って確かめる」が、確かめられる条件に落ちていない

T5 の行は、自前の余白を外したあと 320px と 1280px で次を撮って確かめるとしている。

- 無効のプライマリボタンの枠と、無効のプライマリでないボタンの破線の位置
- 狭い画面（内側の余白 8px）で、フォーカス・hover・無効のあいだの線がコンテナのボーダーに接する形

補足事項（index.md「コントロールの左端は…」の段落）も「T2・T5 の実装のレビューで、これらを撮って確かめる」と書いている。10-5 はこれを「面ごとのタスクのスクリーンショット（10章の頭）と T5-26」に割り当てている。しかし 10章の頭の撮り方は既定の状態の前後だけで、無効・フォーカス・hover の状態を撮ることを求めていない。T5-26 の条件にも、左端の数のほかにこれらは無い。

棚卸し 4-2 の「無効のボタンの位置」の2例（password-generator で文字の種類をすべて外したときの「パスワード生成」、html-entity の開いた直後の「コピー」）と、フォーカス・hover の線を、どのタスクで・どの幅で撮るかを完了の条件に書く（例: T5-18 の password-generator と html-entity の行と T5-26）。

### M7. 「`line-break: strict` を §4 に書く」を受け持つタスクが無い

T5 の行は「見出しの行頭に小書きの仮名や長音符が来ないよう、`line-break: strict` を §4 に書いて見出しに掛ける」としている。HEAD の `DESIGN.md` と `globals.css` には `line-break` が0件（`grep`）。ところが 9章の表の8つの文にこの文は無く、T5-1 は「9章の8つの文を書く」だけである。10-5 もこの項目を「T5-25（`globals.css`）」に割り当てるだけで、`DESIGN.md` に書く側が抜けている。さらに T5-25 の完了の条件も、見出しに `line-break: strict` が掛かったことを確かめていない。9章に文を足して T5-1 で書くこと、T5-25 の条件に「見出しの計算値の `line-break` が `strict`」を入れることを直す。

### M8. T5-17 の完了の条件（yoji-search の 1280×800 で 800 以下）を、T5-17 の中では満たせない

0-2 の O3（786）は「h1 を §4 ＋ `Panel` を外す ＋ 説明を頭から出す」の値である。`Panel` は `src/tools/yoji-search/YojiSearchTile.tsx` が自分で import していて、外すのは T5-18 の yoji-search のタスク（`src/tools/<道具>/*` の受け持ち）で、T5-17 より後に来る。T5-17 の中でできるのは O1 から説明を出すところまでで、0-2 の差から見ると約 805 になり、800 を越える。

完了の条件の括弧の「Panel を外す前の値も記録する」は、この食い違いに気づいた書き方に読めるが、条件の本文は「800 以下」のままで、builder はどちらを満たせばよいか決められない。T5-17 は「`Panel` を外す前の値を記録する」だけにし、800 以下は T5-18 の yoji-search の行（いま「T5-17 の値を保つ」）の条件に移す。あるいは yoji-search と keigo-reference の `Panel` 外しを T5-17 に入れる。T5-17 から yoji の T5-18 までのあいだ、T3-9 の条件が一時的に崩れることも記録に残す。

### M9. 10-4 のディレクトリの受け持ちが、T6 の画像のルートのファイルと重なるのに、順序がどちらの設計にも無い

10-4 は `src/app/blog/[slug]/*`（T5-15）・`src/app/dictionary/humor/[slug]/*`（T5-13）・`src/app/privacy/*`（T5-21）・`src/app/play/daily/*`（T5-19）・`src/app/about/*`（T5-21）をディレクトリごと受け持たせている。ところがこれらのディレクトリには、T6 が触るファイルが入っている（`ls` で確かめた）。

- `src/app/blog/[slug]/` の `opengraph-image.tsx`・`twitter-image.tsx`・`page.tsx`: t6 の T6-2 がブログを試しのルートにしたとき、`twitter-image.tsx` を消し、`page.tsx` の JSON-LD の `image` を直す。そのあと T6-3
- humor・privacy の `opengraph-image.tsx`・`twitter-image.tsx`: T6-3 が移し、`twitter-image.tsx` を消す
- `/about`: T6-7 が画像のルートを新しく置く

`src/app/blog/[slug]/page.tsx` は、T5-15 と T6-2 の両方が中身を書き換える同じファイルである。しかし t6-design.md 4章の「重なるファイル」の表にも、t5-design.md 10-1 にも、この順序が無い。10-4 の受け持ちを「ページの `page.tsx`・`page.module.css`」に絞り、画像のルートのファイルを外すことを書く。`src/app/blog/[slug]/page.tsx` は T5-15 と T6-2（→ T6-3）の順を 10-1 に書く（t6 側の表にも同じ行が要る旨を PM に渡す）。daily の行の「T6-3 の daily の画像のルートとは別のファイル」も、ディレクトリの受け持ちと食い違っている。

### M10. B-755 の完了の条件のうち、GA の `variant` と同居用の id 生成が、どのタスクにも入っていない

index.md の完了の条件の B-755 は「ツールの部品に、同居を前提にした作り（`variant`・同居用の id 生成）と道具箱の生成スクリプトが残っていない」である。cycle-315/index.md の実測（B-755 の根拠）は、次も対象に挙げている。

- `src/lib/analytics.ts` の道具の計測の `variant` の欄と `buildTileParams`、`TileSurface`（HEAD の :257〜:290 に残る）
- 同居しても id が衝突しない構造

T5 の設計が受け持たせているのは、`*TileVariant` の型と `variant` の prop（T5-18）と、生成スクリプト（T5-25）だけである。`analytics.ts` は t6 で T6-6 の受け持ちなので、順序も要る。ほかにも、生成スクリプトを消すと書き換えが要る `src/tools/registry.ts`・`src/tools/generated/tools-registry.ts` が 10-4 に無い。これらの受け持ちと、T6-6 との順を足す。

### M11. 道具の「ファイルの欄のラベル」は共有の `FileDropZone` の中にあり、2つの道具のタスクが同じファイルを触る

「ファイルを選ぶ（ここにファイルを落としても選べます）」は `src/components/FileDropZone/index.tsx:151` の字で、image-base64 と image-resizer はこの部品を使うだけである。10-3 は、4-g の言い回しの直し（説明をラベルの外へ出す）を2つの道具の行にそれぞれ置き、2本は「並行してよい」とされている。しかし `FileDropZone` は 10-4 のどこにも無い。

同じく、ラベルに区切りを渡すのに通り道になる `src/components/ListControls`（クライアントの部品。辞典の一覧の T5-7 と、yoji-search・keigo-reference・traditional-color-palette の T5-18 が使う。`Field`・`RadioGroup` にラベルを渡す）も受け持ちが無い。どちらも、ラベルの部品を持つ T5-3 に入れるのがよい。

### M12. T5-3 と T5-20 は1人の builder に大きすぎる（CLAUDE.md「Keep task smaller」）

- **T5-3** は、互いに独立な3つの仕事を1つにしている。(a) `splitIntoPhrases` の新しい指定と、`LinkIndex`・`IndexAccordion`・ブログのタグ。(b) 5つのラベルの部品が区切りの並びを受け取れるようにし、`Field` の「（必須）」を直す。(c) `FaqSection` をサーバーで区切り、線を外す（M3 のビルドの問題を含む）。触るファイルも確かめ方も別々である。
- **T5-20** は4つを1つにしている。(a) `new/` の2ディレクトリの移動（13ファイルの import を書き換える機械的な作業。B-567）。(b) `GameLayout` のセクションと、2つのバナーの組み直し・数え方。(c) 4本の結果の表5つを T5-8 の部品で組む。(d) `GuessInput` 2本と `Field` の無効の理由、経緯の注記。

どちらも、失敗したときに切り分けられるよう、3〜4 のタスクに分ける。特に移動（20-a）は見た目を変えないので、先に単独で済ませると、あとのタスクの差分が読みやすくなる。

## Minor

- **m1. 「横のはみ出し0」の数え方**: 10-3 の共通の条件と T5-26 の「横のはみ出し0」が、`scrollWidth`（12章の68ページの手順）か要素の矩形（12章「はみ出し（4-2・4-3）」）かを言っていない。コンテナの `overflow-x: clip` は切って隠すので `scrollWidth` では見つからない（棚卸し 4-2 の sql-formatter、T8 の行）。要素の矩形の手順を指定し、200% の 320px も含める。
- **m2. パンくずの高さ**: T5-26 に「どのページもパンくずの上端が 79 / 87」を足す。4-a の C の決定が「パンくずはどのページでも同じ高さになる」を来訪者の得として挙げているのに、どのタスクもページをまたいでそれを確かめていない（T5-2 は一覧だけ）。
- **m3. markdown-preview の順序**: markdown-preview は `Prose` を使う（`MarkdownPreviewTile.tsx:53`）。T5-16 が `Prose.module.css` の `h2`・`h3` の形を変えるので、T5-18 の markdown-preview（見出しを1段下げる）は T5-16 のあとにする旨を 10-1 に書く。
- **m4. T5-8 の部品が受け持つ範囲**: T5-12 は 7-f の「200% でコピーのボタンをどの行も値の次の行に送る」を T5-8 の部品で組むとしているが、T5-8 の内容にこの能力が無い。T5-8 に入れるか、T5-12 が部品を拡げる（その間、ほかの使う側を並行させない）ことを書く。7-b で値の並びを §5 の表にする T5-10・T5-11 が T5-8 の部品を使うかどうかも、10-1 の「T5-8 → 表を持つ面」に書く。
- **m5. 来訪者の数の順が 10-1 に無い**: 1章は「直す順は来訪者の数の順」とするが、10-1 は依存だけで、並行してよい面のタスクの中でどれを先に出すかを言っていない。また T5-4（PV の 81%）が T5-3 を待つ理由が無い。T5-4 の内容と条件は文節の区切りの部品を使わず、FAQ の線も条件に含まない。T5-4 を T5-2 だけのあとにし、面のタスクの出す順（T5-4 → T5-5 → T5-6 → T5-7 → 辞典 → トップ → ブログ → 道具 → ゲーム → その他）を書く。
- **m6. password-generator の条件**: T5 の行は、スライダーを組み直したあと「主操作が 320px と 375px の最初の画面に入るかを測る」としている。10-3 の password-generator の条件は 375px だけなので、320px も記録する。
- **m7. 選ぶ欄の3本**: 4-h で qr-code・regex-tester・unit-converter の2行の選ぶ欄を受け入れたことが、10-5 の「200% で2行以上の選ぶ欄 → T5-18」と 10-3 の3本の行に出ていない。T5 の行の「7本を直す」と見比べる人が抜けと読むので、10-5 に「3本は 4-h で受け入れ、T5-26 で高さを記録」と書く。
- **m8. 受け持ちに無いファイル**（M1・M9〜M11 のほか）: T5-9 がディレクトリを移すと import の行を書き換える `src/app/dictionary/{kanji/[char],yoji/[yoji],colors/[slug]}/page.tsx` と、T5-20 の移動で書き換える `src/app/play/{kanji-kanaru,yoji-kimeru,nakamawake,irodori}/page.tsx`・各ゲームの `GameContainer.tsx`・`GameResult.tsx` を 10-4 に書く。`/play/daily` の本体 `src/play/fortune/_components/DailyFortuneCard.*` を T5-19 が触るなら、それも書く。
- **m9. t6-design.md との表の食い違い**（この文書では直せないので PM に渡す）: t6 の 4章の受け持ちの表は、`DESIGN.md`・`SKILL.md` を T6-1 だけとしていて、T5-1 と並行させないことが t6 側に無い。T5 の 9章・10-1 は並行させないと書いているので、t6 の表にも同じ行を足す。

## 確かめたが問題の無かったもの

- 道具36本（`src/tools/` の36ディレクトリ）は、10-3 に1本ずつ現れる。
- 棚卸し 10-1（古いトークン）・10-3（細い線の35ファイル）・10-7（下限未満の字）・10-8（経緯の注記）・10-9（記事の外の表9つ）・10-10（長い値）のファイルは、M5 の `QuestionCard` のほかは、どれかのタスクが受け持つ。
- 棚卸しの「無効の理由の無い `CopyButton` 29か所・18ファイル」と自前のラベル 81 か所は、どれも `src/tools/` の中にある。T5-18 の受け持ちで足りる。
- `disabled={!mounted}` は `src/` で unix-timestamp の2か所だけで、4-f が当てる先は T5-18 の unix-timestamp の行で尽きる。
- 補足事項の T5 に触れる行（T3-9・T3-6/8・`Unix／タイムスタンプ`・unix-timestamp の表・T4-7 の (6)・T4-17・T4-4c）は、M6 の「撮って確かめる」を除き、10-5 のどれかの行に落ちている。

## 次の手順

指摘は Major 12・Minor 9。planner に 10章（と、M7 のために 9章の表の1行）を直させ、直したあと、今回の指摘だけでなく 10章の全体をもう一度レビューに出すこと。
