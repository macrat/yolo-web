# T5-7 レビュー 第2回

対象: 未コミットの23パス。review-t5-7-1.md と同じ一覧（`src/lib/{list-browse,phrased-name}.ts`、`src/components/{ListControls,ListStatus,BrowsableList,LinkIndex}/*`、一覧の部品7つ、`src/dictionary/_lib/{kanji-list,yoji-list}.ts`、`src/tools/keigo-reference/KeigoReferenceTile.tsx`、試験6つ）。builder の `files.txt` と `git status` を突き合わせて23パスを決めた。T5-8・T5-9・T5-15 などほかのタスクのファイルは重ねていない。書き出しは HEAD e619d2a6 から作った。レビューの途中で HEAD が cec09cbf（T5-15）に進んだが、`git diff e619d2a6 HEAD` で見ると23パスは変わっておらず、作業ツリーの23パスも、重ねたファイルと1バイトずつ同じだった。

今回は、第1回の指摘への直しだけでなく、変更の全体を見直した。

## 判定

**承認**（指摘0）

## 確かめたこと

### 機械の確認（書き出しに23パスだけを重ねた）

- `git archive HEAD | tar -x` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で入れた。
- `npm run generate:release-id` は通った。`tsc --noEmit`・`eslint .`・`prettier --check .` はどれも 0 で終わった。`npm run build` も 0 で通った。
- vitest（`--maxWorkers=2`）の全体の結果は、385 ファイルが通り、12 ファイル・16 件が落ち、2 ファイルを skip した。落ちた16件はどれもタイムアウト（`Test timed out` / `Hook timed out`）で、そのときのロードアベレージは約45だった（ほかのエージェントのビルドと試験が並んで走っていた）。落ちた12ファイルだけを、負荷が下がってから走らせ直すと、12 ファイル・708 件がすべて通った。したがって、全部で 397 ファイルが通っている。
- `npm run check:phrased-names`: 字で渡す名前は、T5-7 のファイルにはどれにも無い。残りの 104 は、道具の 86（T5-18 の受け持ち。keigo-reference の3つを含む）と `src/app` の 18（storybook など）である。値で渡す所のうち T5-7 の受け持ちは11か所ある。一覧の部品の並び順の 7 と種別の 2 に、`ListControls` の `label.name` と `label.selection` の 2 を足したもの。開閉のラベルは、計画では `controlsLabel` の1か所として数えていた。それが名前と括弧の一続きの2つに分かれたので、1か所増えている。どちらも下で開いた状態を測った。

### 第1回の指摘への直し

- **指摘1（括弧の一続きの中で折れる）は直っている。** 画面の上で、`controlsLabel` は `{ name, selection }` を返す。`ListControls` は、名前を `PhrasedText` で組み、そのあとに `<wbr>` を置き、括弧の一続きを `.selection` の `PhrasedText` で組む。`.selection` の指定は `display: inline-block; max-width: 100%` である。375px の既定では、`/tools` と `/play` が「絞り込みと並び順／（すべて、種別順）」、palette が「…／（すべて、色み順）」、yoji-search が「…／（すべて、読みの五十音順）」になった。括弧の一続きが1行に収まるのに、その中で折れた数（`inParenFit`）は、測ったどの状態でも 0 だった。
  - 括弧の一続きが1行に収まらないときは、中の区切りで折れる。yoji-search で3つの組を絞った状態（`?kind=conflict&level=1&origin=中国`）は、375px の既定で「絞り込みと並び順／（対立・闘い、初級、中国、／読みの五十音順）」になった。「、」の後ろで折れており、§4 の「収まらないときだけその中で折る」に合う。
  - 試験は、ラベルの全体を確かめる形になった（`slice` で規則を避けていない）。`ListControls.test.tsx` は、`.selection` の中の HTML と、名前の直後の `</span><wbr>` を確かめている。
  - `controlsLabel`・`ControlsLabel`・`.selection` の説明は、今の組み方だけを言っている。経緯の注記は無い。
- **指摘2（組み合わせの試験）は直っている。** `list-choice-names.test.ts` の「開閉のボタンのラベル」は、次のすべての定義を回す。一覧のページのすべての定義（tools・play・blog・humor・yoji・漢字の4つの scope・色の全体と系統ごと）と、一覧を持つ道具3本（keigo・palette・yoji-search）。組ごとに「すべて」か選択肢の1つを選び、その積に並び順を掛けた、すべての組を作る。そのうえで、ラベルが括弧で囲まれていること、括弧の一続きを1つの文節とした全体、括弧の中の区切りのそれぞれで `followsPhraseRules` を確かめている。定義を import して回すので、あとから足した選択肢も同じ試験にかかる。
  - 組を出すかどうかは、`BrowsableList` の決まり（`length >= 2`）を試験の中で書き写している。ただ、道具3本は組をいつも渡し、どれも選択肢が2つ以上あるので、今の定義では結果は変わらない。
- **指摘3（共有の部品を使うほかのページ・storybook）は記録された。** index.md の「T5-7 から T5-24 へ」の行が、`/storybook/list/{101,11}` の崩れの値と、T5-24 が `samples.ts` を `["読みの", "五十音順"]` にして測り直すことを書いている。自分の測りでも、`/storybook/list/101` は 375px の 200% で「並び順／（読みの五十音順／）」（「）」1字の行）、320px の 200% で「並び順／（読みの五十／音順）」だった。`/storybook/list/11` は 320px の 200% で「…／（すべて、／読みの五十音／順）」だった。記録の値と一致する。見本の名前が1続きの字であるためで、T5-3b の決定 (1) が受け入れた途中の状態に当たる。

### 測り（本番のビルド、Chromium `/opt/pw-browsers/chromium-1194`）

22か所を、組の開閉を開いた状態で測った。幅と文字の大きさは、320・375・1280px の既定と、320・375px の 200%（`default_font_size: 32`。ルートの字が 32px であることを確かめた）である。ダークモードは、`/tools`・`/blog`・`/dictionary/yoji`・yoji-search の3つを絞った状態を、375px の既定と 320px の 200% で撮った。

- 測ったページ: `/tools`、`/tools?kind=data&sort=newest`、`/play`、`/play?kind=personality`、`/blog`、`/blog/tag/オンラインツール`、`/dictionary`、`/dictionary/kanji`、`/dictionary/kanji?sort=reading`、`/dictionary/yoji`、`/dictionary/yoji/category/society`、`/dictionary/colors`、`/dictionary/humor`、漢字と四字熟語の詳細（`左`・`一期一会`）、keigo-reference、traditional-color-palette、yoji-search（既定と3つを絞った状態）、`/storybook/list/{11,100,101}`。
- 横のはみ出し（`scrollWidth - clientWidth`）は、どこでも 0 だった。
- 開閉のラベルでは、禁則の破れ・1字の行・収まる括弧の一続きの中の折れが、storybook を除いてどれも 0 だった（storybook は上の T5-24 の受け持ち）。三角は、ラベルが何行になっても1行目に並んでいた。
- `auto-phrase` のまま描かれる見出しは、一覧のページでは 0 だった。漢字の詳細は 2、四字熟語の詳細は 1 で、これは第1回と同じ数である（詳細のページのタスクの受け持ち）。
- 並び順の選択肢は、320px の 200% で「読みの／五十音順」と文節で折れた。件数の行は語の切れ目で折れた（例: `/dictionary/humor` の「全30語・／五十音順」は第1回で確かめた。今回の `/dictionary/kanji` は「全2,136字／のうち1〜／100字目」）。
- 読み上げの名前は、CDP の `Accessibility.getFullAXTree` で取った。開閉のボタンは、たとえば「絞り込みと 並び順 （すべて、 種別順）」「並び順 （読みの 五十音順）」だった。空白は `<wbr>` の位置にだけ入り、第1回で測った値と同じだった。`inline-block` の箱と、ラベルの中の `span` は、名前に空白も区切りも足していない。字は、画面の字と空白を除いて同じ。空白は、T5-3b の決定 (4) が受け入れたものである。
- **名前と `.selection` の箱のあいだの `<wbr>`、ラベルの中の要素について。** 箱の前の `<wbr>` は、箱の外（`keep-all` でない `.toggleLabel` の中）に置いた、はっきりした折り所である。ブラウザが atomic inline の前後を折り所にするかは実装によって違うが、それに頼っていない。ラベルの中の要素（名前の `span` と箱の `span`）は、ボタンの名前を1続きで読ませる。`ListControls` の説明は、`PhrasedText` の「字を要素で分けない」約束が見出しのためのものであり、ボタンでは当たらないことを書いている。見た目・名前・試験のどれにも問題は無い。
- 撮った画像は自分で見た: `/tools` 375px の既定（ライト）、1280px、320px の 200%（ダーク）、yoji-search の3つを絞った状態の 375px（ダーク）と 320px の 200%、`/dictionary/yoji` の 375px の 200%、`/storybook/list/101` の 375px の 200%。いまの選択が名前の下に1まとまりで並び、何を選んでいるかが一目で読める。ダークモードで、字の色と三角が地に沈むことは無い。括弧の一続きが2行目の頭に来るとき、全角の「（」の字面の左の空きで半字下がって見えるが、これは全角の約物の字面によるもので、組み方の崩れではない。

### 全体の見直し（第1回で通ったものの再確認）

- `sortLabel`・`sortLabelWords`・`selectedText` の名前は、`src/`・`docs/*.md`・`DESIGN.md`・`.claude/` のどこにも残っていない。keigo-reference の変更は `sortName={SORT.name}` だけである。
- `statusWords` は、並び順を `phrasedNamePhrases(sortName)` で組む（第1回の判断2）。`LinkIndex` の区切りの見出しは、1つの文節として `PhrasedText` で組む（判断3）。どちらも変わっていない。
- 見えない h2 の「記事の一覧」「漢字の一覧」は、区切りの並びで組んでいる。読み上げの名前に `<wbr>` の空白が入るが、これも決定 (4) の範囲である。
- `LinkIndex` を使うほかの所（`IndexAccordion`・`/dictionary`・`/storybook` の見本）の区切りの見出しは、「5画」「1年」のような2字ほどの語で、1つの文節で組んでも折れようがない。見出しは、漢字と四字熟語の詳細の測りで折れていないことを確かめた。

## PM に渡す観察（指摘には含めない）

- **括弧の一続きを1つの箱にしたことで、200% で1行増える所がある。** `/dictionary/yoji`・`/dictionary/yoji/category/society`・`/dictionary/kanji?sort=reading` の 375px の 200% は、HEAD では「並び順（読みの／五十音順）」の2行だった。今は「並び順／（読みの／五十音順）」の3行になる。一続きが1行に収まらないので、HEAD の折れも §4 に合っていた。行は増えるが、どの状態でも §4 に合い、既定の文字サイズでの改善（375px の「…／（すべて、種別順）」）のほうが、来訪者の多い状態に効く。第1回で見越した取り引きの範囲なので、指摘にしない。
- 第1回の観察（`/dictionary/colors` の h1 が 200% で「伝統色辞／典」になる）は変わっていない。今回も 320・375px の 200% で出た。T5-26 などで扱うかは PM が決める。

## アンチパターンの確認（docs/anti-patterns/implementation.md）

- AP-I01: 該当しない。機械の確認に加えて、画像を来訪者の目で見た。ボタンの名前と、いまの選択が行を分けて読めることを確かめた。
- AP-I02: 該当しない。括弧の中の折れを、ラベルごとの例外で逃げていない。一続きを1つの箱にするという、組み方の側で直している。`selection` が空のときの分岐は、並び順の値が選択肢に無いときだけ通る。そのときも「並び順」と名前だけを出す、筋の通った振る舞いになる。
- AP-I03: 該当しない。足したのは、小さな関数（`phrasedNamePhrases`）と CSS の1規則だけで、データの import は増えていない。
- AP-I04・AP-I05: 該当しない。指標のための配置も、目的に無関係な追加も無い。
- AP-I06: 該当しない。括弧を1つの箱にしたが、中の区切りを消す極端には振れていない。1行に収まらないときの折り所は残した。
- AP-I07: 該当しない。組み方は、本番のビルドを Playwright で測って確かめた。
- AP-I08: 該当しない。新しい色・大きさ・動きは足していない。`inline-block` は §4 の折り方を形にしたもの。
- AP-I09: コミットはまだ無い。23パスは互いに依存するので、1つのコミットにまとめるのがよい（`ControlsLabel` の型と `ListControls`・試験は同時でないとビルドが壊れる）。
- AP-I10・AP-I11: 該当しない（keyframes もタイマーも無い）。
- AP-I13: 撤去した識別子（`sortLabel`・`sortLabelWords`・`selectedText`）を一括で grep し、残骸が無いことを確かめた。
- AP-I14: `ListControls`・`ListStatus`・`LinkIndex`・`BrowsableList` を使うページを grep で洗い出した。一覧のページ・道具3本・詳細2つ・storybook の一覧の見本を、幅と文字の大きさごとに、開いた状態で測った。`/storybook` の LinkIndex の見本の見出しは測っていないが、「5画」「6画」の2字で、組み方が変わっても折れようがない。

workflow.md: 第1回の指摘はすべて直っている（AP-WF01）。数と状態は自分で数え直した（AP-WF14）。builder の報告の「375 の変化」「組み合わせの試験」「名前の変化なし」は、どれも自分の測りと一致した。

## 後始末

自分の書き出し（`.next` を含む）は消した。サーバーはコンテナの再起動のあとも残っていたので、書き出しの下で動いていることを確かめてから、自分のプロセスグループだけを `kill -- -3717` で止めた。測りの値（`m.json`）と画像は、`/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/rv-t57-2/` に残した（5MB）。
