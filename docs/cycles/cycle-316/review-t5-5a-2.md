# T5-5a の第2回レビュー（0d946b90・24a26d7d）

判定: **改善指示**

対象: 0d946b90（T5-5a の本体）と 24a26d7d（review-t5-5a.md の指摘 1・2・4・5・6 の直し）。あわせて t5-design.md の T5-5a・T5-5b の行と 12 章の T7 の項目、index.md の T5-5a にかかわる記録（9732e657・3c40ce5f）。

見た資料: review-t5-5a.md、t5-design.md（10-2 の T5-5a・T5-5b の行、5-c、10-4）、index.md、アンチパターン集（implementation・workflow）、builder の撮り比べ `tmp/screenshots/t55a/{before,after}/`（`measure.json`・`compare.txt`・画像）。

## 確かめたこと

- HEAD（24a26d7d の時点）を scratchpad に書き出して確かめた。`npx vitest run src/play/quiz src/app/play src/app/storybook` は 99 ファイル・1,602 件すべて通る（前回の 100 ファイル・1,612 件から、消した `extractWithParam.test.ts` の分が減った）。`npm run build` は通る。変えたファイルの eslint はエラー 0、prettier はそろっている。サーバーは起こしておらず、書き出しは消した。
- 指摘 1（character-fortune の誘いが2本続く）: 直っている。`after/result-cf-375.png` と 1280 で、読みもののあとは「お前と相性がいいのは誰だ?…」→「診断して相性を見てみる」→「全8問 / 登録不要」→ すべてのタイプ（6）の順になり、同じ行き先のリンクは続かない。締めくくりの誘いを一覧のあとに戻さず1つにまとめた形は、ほかの結果のページ（誘いが読みものの最後に入る）と同じ位置で、来訪者が迷わない。試験も「このページの子の中で `/play/character-fortune` へのリンクは1本」を確かめている。
- 指摘 2（使われない相性の道）: `[slug]` の `searchParams`・`compatData`・`extractWithParam.ts` とその試験・`ResultPageShell` の `afterShare` はすべて消え、`grep` で残りは無い（AP-I13）。`CompatibilityDisplay` の説明は「読みもののセクションの最後に置く・h3」に直り、実際に使う3本（animal・character-personality・music）の置き方と合う。
- 指摘 4: `DEFAULT_READING_HEADINGS` は `readingHeadings.ts` の1か所になり、`[slug]` はそれを読む。禁則の試験は `readingHeadings.test.ts` が同じ値を見ているので、`[slug]` の試験から消しても抜けは無い。
- 指摘 5: 前の写真は f5abd2dc（T5-4 のあと）で撮り直され、解き終えた画面の h1 は前後とも 33.28px / 65.28px。結果のページ10本・`?with=` 3本・知識の結果1・解き終えた画面9つ（`ref` 付き4つ・science-thinking・japanese-culture・kanji-level を含む）が 320・375・1280・320 の 200%・375 ダークでそろい、320 のはみ出しは前後とも 0（`measure.json` を自分で読み直した）。見出しの並びの順は、どの面も「このタイプについて」が読みものの頭に加わっただけで変わらない。例外は下の (a) の1つだけである。
- 指摘 6: 使われないモックは消えた。
- 指摘 3・7（PM）: T5-5b の行と完了の条件に `ResultExtraLoader` の3つの置き場所が入り、12 章の T7 の項目にも「読みものの主語が色・キャラ・存在の診断がある」が入った。
- 画像を自分で見た: `result-cf-375`・`result-cf-1280`・`result-cf-375-dark`（前後）、`solved-cf-ref-375`、`solved-an-ref-375`（相性と招待の線と余白）、`result-mu-with-375-dark`（前後）。線は小見出しの細い線で、招待の上の余白と知らせの行も前回見た形のまま。崩れは無い。

## builder の気づきの判断

- (a) character-fortune の解き終えた画面に「すべてのタイプ（6）」が出るようになった: **来訪者にとって良い変化で、残す。** 結果のページには以前から同じ一覧があり、ほかの詳しい読みものを持つ診断は解き終えた画面にも一覧を持つ。キャラ占いは「ほかのキャラはどんな子か」を読みに行くことが楽しみの一部で、6行と短く、読みものを押し下げる量も小さい（375px で 588px）。5-c の解き終えた画面の並び（…→ すべてのタイプ）にも合う。ただし T5-5a の行は「並びはまだ変えない」としており、画面に見える変化なので、PM の判断として記録に残す（指摘 4）。
- (b) science-thinking の `RadarChart` が落ちる件: T5-5a の前からあり、index.md に記録されて別のタスクで直すので、この範囲では扱わない。

## 指摘

### 1. `CompatibilityDisplay.tsx` が、もう使わない `[slug]` のルートのディレクトリに残っている【builder】

24a26d7d で `[slug]` の相性の道を消したので、`src/app/play/[slug]/result/[resultId]/CompatibilityDisplay.tsx` を使うのは animal-personality・character-personality・music-personality の3本の結果のページだけになった。3本とも `@/app/play/[slug]/result/[resultId]/CompatibilityDisplay` という、別のルートの中のファイルを読み込んでいる。

- ファイルの置き場所が「`[slug]` の結果のページが相性を出す」と読める形で残り、消した道の跡になっている（ツギハギ禁止。AP-I13 の「別の所に残った残骸」）。次にこのディレクトリを触る T5-22b・T5-6 が、`[slug]` にまだ相性の道があると読み違える。
- 部品の置き場所 `src/play/quiz/_components/`（`CompatibilitySection` の隣）へ動かし、試験 `__tests__/CompatibilityDisplay.test.tsx` も一緒に動かす。3本の `page.tsx` の import の行だけを直す（前回の (1) と同じく、動かすコミットで使う側を直さないと型が通らない。10-4 で3本は T5-5a → T5-22b → T5-6 の順で、まだ誰も触っていない）。

### 2. character-fortune の結果のページの「診断して相性を見てみる」が、解いたあとに相性を見せない【builder】

24a26d7d でこのページの締めくくりの誘いは「診断して相性を見てみる」の1つになった。リンク先は `/play/character-fortune` で、`?ref=` を持たない。解き終えた画面が相性を出すのは `?ref={タイプ}` で来たときだけなので（`QuizPlayPageLayout` → `CharacterFortuneResultExtra`。`solved-cf-ref-375.png` の「友達との相性」）、このリンクから解いた来訪者には相性が出ず、すぐ上の「お前と相性がいいのは誰だ? 相性診断で確かめてみろよ。」と、リンクの名前の約束が果たされない。

- このページに来る人の多くは、友だちが共有した結果のリンクから来る。その人が解いて自分とそのキャラの相性を見られることが、この誘いの値打ちである。
- リンク先を `/play/character-fortune?ref=${resultId}` にする（`InviteFriendButton` が作る招待のリンクと同じ形）。試験の `href` の期待も直す。ページの頭の「あなたはどのタイプ? 診断してみよう」は相性を約束していないので、今のままでよい。
- 同じファイルの `generateMetadata` の注記「searchParams処理不要（相性機能なし）」は、この診断が相性を持つ（解き終えた画面で相性を出し、`?with=` 付きの共有のリンクも作る）ので誤りである。このページが `?with=` を読まないことを、事実として書き直すか消す。
- 前の形（f5abd2dc）からある不具合だが、このファイルは 10-4 で T5-5a の受け持ちで、直しは1行で済み、24a26d7d がこのリンクを唯一の誘いにしたので、いま直す。

### 3. T5-5a の行が、T5-5b に回した `ResultExtraLoader` の読みものを T5-5a の仕事として書いたまま【PM】

t5-design.md の T5-5b の行には置き場所が入ったが、T5-5a の行は今も `CharacterFortuneResultExtra`・`JapaneseCultureResultExtra`・`ScienceThinkingResultExtra` を「1つのセクション「このタイプについて」とその中の小見出しの段にし」と書いている。T5-5a がしたのは見出しの段（h3・小見出しの大きさ）をそろえることだけなので、2つの行が同じ仕事を持つように読め、T5-5a の完了を確かめる人が「やり残し」と読み違える。T5-5a の行を「見出しの段をそろえる（置き場所は T5-5b）」と書き分ける。

### 4. T5-5a で決めたことを index.md に残す【PM】

次の2つは、T5-5a の行（「並びはまだ変えない」）から外れて画面に見える変化で、PM の判断として記録が要る。

- character-fortune の解き終えた画面に、すべてのタイプ（6）を置いた（上の (a) の判断）。
- character-fortune の結果のページの誘いを、相性の誘い1つにまとめた（review-t5-5a.md の指摘 1）。

## 範囲の外で見つけたこと（PM へ。T5-5a の判定には含めない）

- **相性の共有のリンクが、相性を出さないページに着く。** 解き終えた画面の相性の区画（`CompatibilitySection`）は `/play/{slug}/result/{自分のタイプ}?with={友だちのタイプ}` を共有する。japanese-culture（専用のルートが無く `[slug]` が描く）と character-fortune（専用のルートが `?with=` を読まない）では、そのリンクを開いた人に相性が出ず、共有の文の「相性は「…」でした!」と中身が合わない。24a26d7d で消した `extractWithParam` はもともと music-personality しか扱っておらず、この2つの診断は T5-5a の前から相性を出していなかったので、今回の直しで悪くなったものではない（前回のレビューで「相性の道は来訪者に届かない」と書いたのは、コードの上では正しいが、来訪者の側では「相性のリンクを受け取る人がいるのに届いていない」が正確である）。直すには、2つの結果のページが `?with=` を読んで相性を出す（animal など3本と同じ形）。T5 の面の組み替えとは別の仕事なので、PM が backlog に積むか、このサイクルのタスクにするかを決める。

## PM への指示

1. 指摘 1・2 を builder に直させる（1つのタスクずつ）。直したあと、character-fortune の結果のページ（375・1280・375 ダーク）でリンク先と並びを撮って確かめる。指摘 3・4 は PM が t5-design.md と index.md に書く。範囲の外の件は、扱いを決めて記録する。
2. 直したあと、もう一度レビューを依頼する。前回までの指摘だけでなく、全体を見直す。
