# T5-5a のレビュー（0d946b90）

判定: **改善指示**

対象: 0d946b90「T5-5a: surfaces place the all-types list; reading section with one heading scale on solved screen and result page」

見た資料: t5-design.md（10-2 の T5-5a の行、5-c、10-4、10-1 の依存、12 章の T7 へ渡す文言）、DESIGN.md §4（見出しの3段）・§5（ページの割り方・線）、CLAUDE.md（ツギハギ禁止）、builder のスクリーンショットと `tmp/screenshots/t55a/{before,after}/measure.json`、アンチパターン集（implementation・workflow）。

## 確かめたこと

- `npx vitest run src/play/quiz src/app/play src/app/storybook` は 100 ファイル・1,612 件すべて通る。`npx tsc --noEmit` はエラー 0（どちらも共有の作業ツリーで走らせたので、ほかのタスクの未コミットの変更も含んだ結果である。ビルドはしていない）。
- 8つの読みものの部品（`*Content.tsx`）はどれも `OtherTypesNav` を import しない。すべてのタイプは面（`ResultCard`・`ResultPageShell`）が読みもののセクションのあとに置く。`SECTION_HEADING` は消え、`ResultPlacement` は「いまのタイプの行の示し方」だけに残った。読みものの小見出しはどちらの面でも h3、「このタイプについて」とすべてのタイプは h2 になった。
- 見出しの大きさ（`measure.json` を前後で並べ直した）: 375px・320px で セクションの見出し 23.84px（1.49rem）・小見出し 17px（1.0625rem）、1280px で 46.72px（2.92rem）・33.28px（2.08rem）。§4 の表と合う。結果のページで h2 なのに小見出しの大きさだった読みものの見出し（17px の h2）が無くなった。はみ出しは 320px・320px 200% で 0。
- 完了の条件「character-personality の 375px で、変更の前と後の見出しの並びの順が同じ」: 解き終えた画面は 共有 → 成り立ち → 日常 → メッセージ → すべてのタイプ（24）→ 次は、の順が保たれ、「このタイプについて」が読みものの頭に1つ加わっただけ。結果のページ4本（cp・cf・ws・tc）も同じ。
- 「このタイプについて」の直下の小見出しは線を持たず（§5「前に分ける内容を持たない小見出しは、線を持たない」）、2つ目からは細い線（`--rule-2`・1px）を持つ。`InviteFriendButton` の上の線も `--rule-w-hair` と `--rule-2` になった（5-c の最後の段落のとおり）。
- すべてのタイプの並び順: 以前 `CharacterPersonalityContent` は `CHARACTER_PERSONALITY_TYPE_IDS` の順に並べ直していたが、面が渡す `quiz.results`（batch1〜3 の連結）と順が同じであることを確かめた。色見本は、解き終えた画面は `resultColor`、結果のページは `swatch` で決まり、伝統色だけで出る（以前と同じ）。
- 見た目（375px・1280px・375px ダーク）: 解き終えた画面で、共有の区画のあとに「このタイプについて」が立ち、その下に小見出しが続く。読みものとすべてのタイプの切れ目が見出しの段で読み分けられるようになり、来訪者が「ここから自分のタイプの話」「ここから一覧」と分かる。全幅の罫線はまだ無いが、T5-5b の受け持ちである。
- 「このタイプについて」の文言は、t5-design.md 5-c（「T5-5a は仮の文言で組んで T7 に渡します」）と 12 章（「セクションの見出しの文言（「このタイプについて」…）: T5 は仮の文言で組み、T7 が §9 で見直す」）で T7 に渡っている。コードに「仮」の注記を残していないのも、ツギハギ禁止に合う。

## PM が挙げた逸脱の判断

- (1) T5-6 の受け持ちの結果のページ7本と試験3本を、消した props を外すためだけに触った: **よい。** props を消すコミットで使う側を直さないと型が通らない（AP-I09）。T5-6 はまだ始まっておらず、並行して触ってもいない。
- (2) `[slug]` と character-fortune で、2つ目の誘いが読みもののセクションの中、一覧の前に来た: **`[slug]` はよい。character-fortune は直す（指摘 1）。** `[slug]` の「あなたはどのタイプ? 診断してみよう」は、ほかの7本の結果のページ（誘いが `after*` で読みものの最後に入る）と同じ位置になり、読みものを読み終えた所で誘いに出会う。character-fortune は同じ行き先のリンクが2本続く。
- (3) `OtherTypesNav` の `aria-labelledby`、`InviteFriendButton` の知らせの上の余白 4→8px: **よい。** セクションが見出しの名前の region になり、読みものの `ReadingSection` と同じ組み方にそろう。8px は §5 の「8px の倍数」に合わせたもので、知らせの行は `min-height: 1lh` を保つので、出たり消えたりしても下は動かない。
- (4) `ResultExtraLoader` の読みものが「次はこれを試してみよう」のあとに残る、`DEFAULT_READING_HEADINGS` が2か所にある: **どちらも指摘（指摘 3・4）。**

## 指摘

### 1. character-fortune の結果のページで、同じページへのリンクが2本続く【builder】

`src/app/play/character-fortune/result/[resultId]/page.tsx` の子は `ResultPageShell` の `ReadingSection` にまとめて入るので、以前は すべてのタイプ（6行）を挟んでいた「診断して相性を見てみる」と「あなたはどのタイプ? 診断してみよう／全8問 / 登録不要」が、いまは続けて並ぶ（`after/result-cf-375.png` の y≈1990〜2170）。どちらも `/play/character-fortune` へ行く。

- 来訪者には、言い方の違う2つのリンクが同じ所に続けてあり、違う所へ行くのかと迷わせる。「読みものを締めくくる」誘いが、相性の誘いのすぐ下では締めくくりにもならない。
- T5-5a の行は「並びはまだ変えない」としている。このページでは、2本のリンクとすべてのタイプの並びが変わった。
- character-fortune の `page.tsx` は 10-4 で T5-5a の受け持ちなので、いま直す。直し方は builder が選ぶ（例: 相性の誘いと締めくくりの誘いを1つの区画にまとめる、または `ResultPageShell` に「すべてのタイプのあと」に置く口を持たせて締めくくりの誘いを一覧のあとへ戻す）。どの形でも、同じ行き先のリンクが続けて並ばないことを 375px で撮って確かめる。口を足すなら、T5-6 の並び（共有 → すべてのタイプ → 他）でも使える位置と名前にし、T5-6 が作り直さずに済むようにする。

### 2. `CompatibilityDisplay.tsx` の説明が、変えた見出しの段と食い違う。`[slug]` の相性の道は使われない【builder】

- `src/app/play/[slug]/result/[resultId]/CompatibilityDisplay.tsx` の説明は「結果のページではタイプ名が h1 なので、相性の見出しはその下の h2 になる」のままで、このコミットで `CompatibilitySection` は h3 になった（試験も h3 に直している）。説明を、読みもののセクションの中の小見出し（h3）に書き直す。
- 同じ試験の注記「相性は読みもののセクションの中に置くので」は、`animal-personality`・`character-personality`・`music-personality` の `after*` から入れる場合には正しいが、`[slug]` の `page.tsx` は `CompatibilityDisplay` を `afterShare`（共有の区画のあと、読みもののセクションの外）に置いている。そこで h3 にすると「この結果を共有」の下の小見出しになる。
- ただし `[slug]` の相性の道は来訪者に届かない: `extractWithParam` が値を返すのは `slug === "music-personality"` のときだけで、music-personality は専用のルートが優先される。つまり `[slug]` の `compatData`・`afterShare` の口・`extractWithParam.ts`（とその試験）は使われない残骸で、ツギハギ禁止の「見つけたらその場で直す」に当たる。`[slug]` の `page.tsx` と `ResultPageShell` は 10-4 でいま T5-5a の受け持ちなので、この道と `ResultPageShell` の `afterShare` をいま外す。残すと、T5-6 が共有の位置を動かすときに、使われない口に合わせて並びを考えることになる。

### 3. `ResultExtraLoader` の読みものを T5-5b へ回したことが、どこにも書かれていない【PM】

T5-5a の行は `CharacterFortuneResultExtra`・`JapaneseCultureResultExtra`・`ScienceThinkingResultExtra` を「1つのセクション「このタイプについて」とその中の小見出しの段」にするとしている。このコミットは見出しの段（h3・小見出しの大きさ）を合わせただけで、3つは `QuizContainer` の中で「もう一度挑戦する」と「次はこれを試してみよう」のあと、セクションの外に残る（science-thinking の「あなたの思考プロフィール」、character-fortune・japanese-culture の相性と招待）。

- 置き場所を動かすには `QuizContainer.tsx` を触る必要があり、10-4 で `QuizContainer` の結果の段階は T5-5b の受け持ちなので、T5-5b に回すこと自体はよい。
- しかし T5-5b の行は「結果と共有 → このタイプについて → 次はこれを試してみよう → すべてのタイプ」と書くだけで、この3つを「このタイプについて」の最後の小見出しとして入れることを言っていない。cycle の index.md にも記録が無い。このままでは T5-5b が見落とし、3つの診断で、読みものが「次はこれを試してみよう」の下の小見出しに見える形が残る。
- t5-design.md の T5-5b の行（と完了の条件）に「`ResultExtraLoader` の読みものを、読みもののセクションの最後の小見出しとして置く（相性の区画と同じ。5-c）」を書き足し、3つの診断の解き終えた画面を撮ることを完了の条件に入れる。

### 4. `DEFAULT_READING_HEADINGS` が2か所にある【builder】

`src/play/quiz/readingHeadings.ts` と `src/app/play/[slug]/result/[resultId]/page.tsx` の両方に、同じ既定の小見出し（「この／タイプの／特徴」など）を持つ `DEFAULT_READING_HEADINGS` がある。前のサイクルからの重複だが、片方だけ直すと解き終えた画面と結果のページで小見出しが食い違う（面をそろえるのが T5-5a の目的そのもの）。10-4 で `readingHeadings.ts` も `[slug]` の `page.tsx` もいま T5-5a の受け持ちなので、いま1つにする。`readingHeadings.ts` から出し、`[slug]` の `page.tsx` と試験はそれを使う（ページのファイルから決まった値を export している形もなくなる）。

### 5. 共有の部品を変えたのに、使う面の多くを撮っていない。前の写真が親のコミットでない【builder】

- AP-I14: `ResultReading`・`CompatibilitySection`・`InviteFriendButton`・`OtherTypesNav`・`ResultPageShell` はどれも共有の部品で、使う面は結果のページ10本と、詳しい読みものを持つ診断の解き終えた画面すべてである。撮ったのは結果のページ4本（cp・cf・ws・tc）と解き終えた画面2本（cp・tc）だけ。次を前後で撮り、見出しの y と大きさを `measure.json` と同じ形で並べる。
  - 結果のページの残り6本（animal-personality・music-personality・yoji-personality・impossible-advice・contrarian-fortune・unexpected-compatibility）。
  - 相性と招待が出る形: character-personality・animal-personality・music-personality の結果のページの `?with=`、解き終えた画面を友だちの結果のリンク（`ref`）から開いた形。`InviteFriendButton` の上の線が小見出しの細い線になっていることと、知らせの行の余白を見る。
  - `ResultExtraLoader` を持つ3つ（science-thinking・character-fortune・japanese-culture）と、詳しい読みものを持たない知識の診断（kanji-level など。「このタイプについて」もすべてのタイプも出ないこと）の解き終えた画面。
  - 375px・1280px とダークを、少なくとも各面1枚。
- `before/measure.json` の解き終えた画面は h1 が 17.6px（1280px で 20px）で、T5-4（597d2925。h1 を 33.28 / 65.28px にした）より前の状態を撮っている。親のコミット（f5abd2dc）の状態で前の写真を撮り直す。見出しの並びの順の比べは今回の結論を変えないが、y の差（例: 型の名前の見出しが 102px 上がった）に T5-4 の変化が混ざり、T5-5b が距離を測り直すときの基準にならない。

### 6. character-personality の結果のページの試験に、使われないモックが残る【builder】

`src/app/play/character-personality/result/[resultId]/__tests__/page.test.tsx` の `vi.mock("@/play/quiz/data/character-personality")` は `CHARACTER_PERSONALITY_TYPE_IDS` を返すが、このページから読み込むモジュールで、いまそれを使うものは無い（全タイプを並べ直していた `CharacterPersonalityContent` の定数はこのコミットで消えた）。モックから外す。

### 7. T7 へ渡す文言に、読みものの中身が「タイプ」でない診断があることを書き足す【PM】

「このタイプについて」は、伝統色診断では読みものの小見出しが「この色の物語」「この色からのひとこと」、キャラ占い・似たキャラ診断では「このキャラの…」、意外な相性診断では「この存在の本質」で、セクションの見出しの「タイプ」と小見出しの主語がずれる（`after/result-tc-375.png`）。文言を見直すのは T7 だが、渡すときに「診断ごとに読みものの主語が違う（色・キャラ・存在）」という観察を t5-design.md 12 章の T7 への項目に添えておく。T7 が1つの文言で足りるか、診断ごとに言い替えるかを判断する材料になる。

## PM への指示

1. 指摘 1・2・4・5・6 を builder に直させる（1つのタスクずつ。指摘 5 の撮影は、直したあとの状態で行う）。指摘 3・7 は PM が t5-design.md に書き足す。
2. 直したあと、もう一度レビューを依頼する。前回の指摘だけでなく、全体を見直す。
