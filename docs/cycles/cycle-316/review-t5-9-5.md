# T5-9 レビュー（5回目。辞典の詳細の枠）

判定: **承認（approved）**

対象: 作業ツリーの未コミットの T5-9 のファイル全部（`review-t5-9-4.md` の「コミットするファイル」の足す6本・変える12本と、`src/dictionary/_components/new/` の6本の削除）。T5-7 の `ListView`・`_lib` と、作業ツリーにあるほかのタスクのファイルは見ていない。4回目の指摘1・2の直しだけでなく、18本を頭から終わりまで読み直した。

確かめ方: HEAD（a8d60872）を `git archive` でスクラッチの自分のディレクトリに書き出し、`node_modules` が無いことを確かめてから `cp -al` し、T5-9 の18本だけを重ねて `new/` を消した（18本は作業ツリーと `cmp` で一致）。`npm run generate:release-id` のあと、vitest（`--maxWorkers=2`）・tsc・eslint・prettier を走らせた。書き出しは終わったあとに消した。

## 4回目のあとに変わったもの

- 4回目のレビュー（HEAD 468663ca）のあとに入ったコミット（21932347・2a6739ef・a8d60872。T5-7 とドキュメント）は、T5-9 の18本と `new/` に触れていない（`git diff --stat 468663ca HEAD` が空）。
- 18本の更新時刻を `review-t5-9-4.md` の書き出しの時刻（11:34）と比べると、あとで変わったのは `ColorDetail.module.css` と `KanjiDetail.module.css` の2本だけで、ほかの16本は4回目の前のまま。
- その2本の HEAD からの差分は、どちらも注記の行だけで、値は1つも変わっていない（`git diff HEAD` で確かめた）。4回目から変わったのは、builder の報告どおり次の2つの注記である。
  - `ColorDetail.module.css:12-13`「色見本: 幅いっぱいの大きな色面。地の色は項目の色で、インライン style の color.hex で与え、細い線で囲む。」
  - `KanjiDetail.module.css:125`「幅 640px 以下の画面では、大字と、その横の見出し・読み・意味の列とのあいだを詰め、大字を小さくする。」
- 3つの Detail の `.tsx` と3つの `page.tsx` の、コメントでない差分も読み直した。`ReactNode` と `Section` の import、`head` の prop、`<Section>{head}…</Section>` の包み、`shareHeading`、`{(head) => …}` だけで、4回目の記述と同じ。

ランタイムのコードが変わっていないので、ビルドとブラウザでの測り直しはしていない。1回目の実測（パンくずの字の左端 27 / 179、見出しの段、罫線、ライトとダーク）がそのまま当たる。

## 4回目の指摘の確かめ

- **指摘1**（色見本の「角を --radius で丸め」）: 角の話が消え、「幅いっぱいの大きな色面」（`width: 100%`・`height: 200px`）、「地の色は項目の色で、インライン style の color.hex で与え」（`ColorDetail.tsx:78` の `style={{ backgroundColor: color.hex }}`）、「細い線で囲む」（`border: 1px solid var(--rule)`）になった。どれも CSS と JSX のとおりで、`--radius` が `0px`（`globals.css:144`）なので角について何も言わないのも見た目と合う。**直っている。**
- **指摘2**（`@media` の「横の見出し」）: 詰める相手が「その横の見出し・読み・意味の列」になった。`.header` は `display: flex` の横並びで、`gap` は大字（`.character`）とその右の `.headerInfo`（`KanjiDetail.tsx:61-84` の h1・音読み・訓読み・意味）のあいだにかかる。`@media (max-width: 640px)` で `gap` を 32 から 16 に、大字を 6rem から 4rem にする指定のとおり。**直っている。**

## 注記と中身の突き合わせ

18本の注記を1つずつ、そのそばのコードと突き合わせた。4回目と同じ語（`店構え|器|帳面|成果物|主役|ピル|カード|予定|方針|静か|N-[0-9]|B-[0-9]|cycle|以前|旧|従来|変更|廃止|移行|TODO|暫定|今後|将来|丸め|誠実|設計契約|Rule`）に「縦積み」「モバイル先行」「角丸」を足して grep した。

- 経緯の語は残っていない。当たったのは `followsPhraseRules`（関数名）、`YojiDetail.tsx:77`「壊さない方針」、`YojiDetail.test.tsx:30` のテストの名前（「h1 は Detail 内部で管理」）だけで、どちらもいまのコードの理由と形を言うもので、3回目・4回目の判断のまま残してよい。
- 採らなかった形を言う注記、つぎはぎの痕（後から足した但し書き・例外の言い訳）は無い。
- `DictionaryDetailLayout.tsx` の注記（props の説明、ページの4つの部分）、`.module.css` の注記（`.head`・`.valueProposition`・`.sectionHeading`）、`PlayRecommendBlock` の注記は、いまのコードのとおり。`jsonLd` の説明（20行目）はテストの名前（168行目）と合う。
- `KanjiDetail.module.css:103` の数字の注記、`YojiDetail.module.css` の分類の行・構成漢字・出典のリンク・例文の注記、`ColorDetail.module.css:76-92` のリンクの注記も、それぞれの指定のとおり。

次の2つは、いまのコードと完全には合わないが、受け持ちが index.md の「T5-9 から T5-10〜T5-12 へ」に記録されており、そのタスクの完了で注記のほうが正しくなる。T5-9 では直さない（3回目・4回目の判断と同じ）。

- `KanjiDetail.module.css:5` と `YojiDetail.module.css:2` の「左揃え（§5）」は、`.detail` の `margin: 0 auto` と合わない。T5-10・T5-11 は完了の条件（h1 の左端 27 / 179）で、T5-12 は index.md の (1) で中央寄せを外す。
- `DictionaryDetailLayout.tsx:29-30`・`:39-40` は、同じ仲間の索引と関連が「そのあとのセクションになる」と枠と Detail の約束を言うが、いまの3つの Detail はそれを1つの `Section` の中に置いている。T5-10・T5-11 は行の「セクション（7-e）」、T5-12 は index.md の (3) で分ける。枠のテスト（`DictionaryDetailLayout.test.tsx` の `detail`）はこの約束の形で書かれている。出荷はサイクルの終わりの1度だけなので、途中の形は来訪者に出ない。

## 機械の検査

- vitest: `src/dictionary` と `src/app/dictionary` の 15 ファイル・176 件がすべて通った（4回目と同じ数）。
- tsc: 通った（終了コード 0、出力なし）。
- eslint（`src/dictionary/_components` と3つの詳細のページのディレクトリ）: 通った。
- prettier（`src/dictionary/_components` と `src/app/dictionary`）: 通った。
- `_components/new` の参照は、書き出しの `src` の `.ts`・`.tsx`・`.css` に残っていない。
- `check:phrased-names` は、4回目から `.tsx` が変わっていないので走らせていない（4回目に T5-9 の8本の `.tsx` で通っている）。

## 指摘

無し。

## anti-patterns/implementation.md の点検

- AP-I01（来訪者の目で見たか）: ランタイムのコードは1回目から変わっておらず、1回目が本番ビルドを 320・375・1280px・200%、ライトとダークで撮って見た結果がそのまま当たる。今回の変更は注記2つだけで、来訪者の目に見えるものは変わらない。
- AP-I02（場当たりの回避）: 当たらない。`head` は必須の prop のままで、オプショナルにも個別の分岐にもしていない。
- AP-I03（Core Vitals・バンドル）: 当たらない。4回目からの変更は CSS のコメントだけで、import も静的なデータも増えていない。`"use client"` は `ColorDetail` だけで、HEAD から同じ。
- AP-I04（指標を目的に配置）: 当たらない。共有の見出しとセクションの並びは 7-e の決定による。
- AP-I05（目的と無関係な中身）: 当たらない。足した要素は共有の見出しだけで、7-e の決定による。
- AP-I06（反対の極端）: 当たらない。4回目の指摘1は、事実と合わない一句（角を丸める）を消し、正しい事実（幅いっぱい・地の色の与え方・線で囲む）は残した。指摘2は詰める相手を広げて正確にしただけで、ほかの注記を削っていない。
- AP-I07（jsdom で分からないもの）: 当たらない。今回の変更はコメントだけで、左端・罫線・見出しの大きさは1回目に本番ビルドで測った。
- AP-I08（DESIGN.md に無い見た目）: 当たらない。CSS の値は1回目から変わっていない。
- AP-I09（コミットの順）: 移したファイル・消した `new/`・3つの `page.tsx`・Detail とテストは、分けると途中でビルドかテストが壊れる（`page.tsx` の import 先、Detail の必須の `head`）。下の24本を1つのコミットにまとめること。
- AP-I10（keyframes）: 当たらない（アニメーションを足していない）。
- AP-I11（タイマー）: 当たらない（タイマーを足していない）。
- AP-I13（撤去の網羅）: `_components/new` は `src` に残っていない。店構え の言葉（「店構え」「器」「帳面」「成果物」「主役」）は T5-9 の18本に残っていない。
- AP-I14（共有の部品の変更）: T5-9 は共有の部品（`Section`・`Breadcrumb`・`FaqSection`・`ShareButtons`・`ItemList`）を変えていない。`DictionaryDetailLayout` と `PlayRecommendBlock` を使うのは3つの `page.tsx` だけ（`grep` で確かめた）で、1回目に3つとも測った。

workflow.md の点検: 4回目の指摘1・2は builder が直し、受け持ちのとおり（AP-WF08・AP-WF13）。「2つの注記だけが変わった」という報告は、自己申告を受け入れず、更新時刻・`git diff HEAD`・HEAD の移り変わりの3つで確かめた（AP-WF04・AP-WF14）。機械の検査は自分の書き出しで走らせ直した（AP-WF09）。

## PM への申し送り

- コミットは、T5-9 のファイルと `new/` の削除だけを1つにし、作業ツリーのほかのタスクのファイル（`src/components/DataTable/`、`src/tools/`・`src/play/` の変更、`DESIGN.md`、`globals.css` など）を入れない。入れるものは次の24本（このレビューの記録 `review-t5-9-5.md` は別のドキュメントのコミットでよい）。
  - 足す: `src/dictionary/_components/DictionaryDetailLayout.tsx`、`src/dictionary/_components/DictionaryDetailLayout.module.css`、`src/dictionary/_components/PlayRecommendBlock.tsx`、`src/dictionary/_components/PlayRecommendBlock.module.css`、`src/dictionary/_components/__tests__/DictionaryDetailLayout.test.tsx`、`src/dictionary/_components/__tests__/PlayRecommendBlock.test.tsx`
  - 変える: `src/app/dictionary/kanji/[char]/page.tsx`、`src/app/dictionary/yoji/[yoji]/page.tsx`、`src/app/dictionary/colors/[slug]/page.tsx`、`src/dictionary/_components/kanji/KanjiDetail.tsx`、`src/dictionary/_components/kanji/KanjiDetail.module.css`、`src/dictionary/_components/yoji/YojiDetail.tsx`、`src/dictionary/_components/yoji/YojiDetail.module.css`、`src/dictionary/_components/color/ColorDetail.tsx`、`src/dictionary/_components/color/ColorDetail.module.css`、`src/dictionary/_components/__tests__/KanjiDetail.test.tsx`、`src/dictionary/_components/__tests__/YojiDetail.test.tsx`、`src/dictionary/_components/__tests__/ColorDetail.test.tsx`
  - 消す: `src/dictionary/_components/new/DictionaryDetailLayout.tsx`、`src/dictionary/_components/new/DictionaryDetailLayout.module.css`、`src/dictionary/_components/new/PlayRecommendBlock.tsx`、`src/dictionary/_components/new/PlayRecommendBlock.module.css`、`src/dictionary/_components/new/__tests__/DictionaryDetailLayout.test.tsx`、`src/dictionary/_components/new/__tests__/PlayRecommendBlock.test.tsx`
- `docs/backlog.md` の B-567 は、コミットのあとで済みにする。
- 「左揃え（§5）」と「そのあとのセクションになる」の2つの注記は、T5-10〜T5-12 の完了で正しくなる。それぞれのレビューで、中央寄せを外したこととセクションを分けたことを確かめる。
