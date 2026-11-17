# T5-9 レビュー（4回目。辞典の詳細の枠）

判定: **改善指示（changes-needed）**

対象: 作業ツリーの未コミットの T5-9 のファイル全部（`review-t5-9-3.md` の「コミットするファイル」の18本と、`src/dictionary/_components/new/` の6本の削除）。T5-7 の `ListView`・`_lib` は見ていない。3回目の指摘1〜5の直しだけでなく、18本を頭から終わりまで読み直した。

確かめ方: HEAD（468663ca）を `git archive` でスクラッチの自分のディレクトリに書き出し、`node_modules` が無いことを確かめてから `cp -al` し、T5-9 の18本だけを重ねて `new/` を消した（18本は作業ツリーと `cmp` で一致）。`npm run generate:release-id` のあと、vitest（`--maxWorkers=2`）・tsc・eslint・prettier・`check:phrased-names` を走らせた。書き出しは終わったあとに消した。

## 3回目のあとに変わったもの

3回目のレビューは、HEAD からのランタイムのコードの差分が「`Section` で包み、`head` を受け取って最初に置く」ことと、3つのページの `shareHeading` と children の関数だけだと記している。いまの差分を `git diff HEAD -w --word-diff=porcelain` で読み、コメントでない行の変更を拾った。

- 3つの Detail の `.tsx`: コメントでない変更は `ReactNode` と `Section` の import、`head` の prop、`<Section>{head}…</Section>` の包みだけで、3回目の記述と同じ。
- 3つの `page.tsx`: import のパス、`shareHeading`、`{(head) => …}` だけで、3回目と同じ。
- 3つの Detail の `.module.css`: HEAD からの差分は注記の行だけ（値は1つも変わっていない）。
- 3回目のあとに変わった注記: `ColorDetail.module.css` の頭・色見本・表・値のセル、`KanjiDetail.module.css` の頭・大字・`@media`、`YojiDetail.module.css` の頭・大字、`YojiDetail.tsx` の `ORIGIN_LABELS` と `SOURCE_HOST_LABELS` の説明、`YojiDetail.test.tsx` の「不明」のテストのコメント、`DictionaryDetailLayout.tsx:20` の `jsonLd` の説明。builder の報告どおりで、ほかは変わっていない。

ランタイムのコードが変わっていないので、ビルドとブラウザでの測り直しはしていない。1回目の実測（パンくずの字の左端 27 / 179、見出しの段、罫線、ライトとダーク）がそのまま当たる。

## 機械の検査

- vitest: `src/dictionary` と `src/app/dictionary` の 15 ファイル・176 件がすべて通った（3回目と同じ数）。
- tsc: 通った（終了コード 0、出力なし）。eslint（`src/dictionary/_components` と3つの詳細のページのディレクトリ）: 通った。prettier（`src/dictionary/_components` と `src/app/dictionary`）: 通った。
- `check:phrased-names` を T5-9 の8本の `.tsx` に絞って: 通った。
- `_components/new` の参照は、書き出しの `src` の `.ts`・`.tsx`・`.css` に残っていない。

## 3回目の指摘の確かめ

- **指摘1**（店構え の言葉）: `ColorDetail.module.css` の「成果物」「主役」「器」「帳面」、`KanjiDetail.module.css`・`YojiDetail.module.css` の「（見出しの主役）」は消えた。**ただし、色見本の注記の書き直しが、CSS がしていることと合わない文になった**（下の指摘1）。
- **指摘2**（語の二重）: `ColorDetail.module.css:58` は「値のセル: HEX・RGB・HSL を、桁の揃う本文の書体の数字で組む。」になり、`font-family: var(--font-body)` と `font-feature-settings: "tnum"` のとおり。**直っている。**
- **指摘3**（`@media` の注記）: 「縦積み」「モバイル先行」「中央寄せはしない」が消え、「幅 640px 以下の画面では、大字と横の見出しのあいだを詰め、大字を小さくする。」になった。`gap` を 32 から 16 に、大字を 6rem から 4rem にする指定のとおりで、事実とは合う。ただし「横の見出し」の言い方が少し狭い（下の指摘2）。
- **指摘4**（`N-3` と「予定はない」）: `YojiDetail.tsx` と `YojiDetail.test.tsx` から「N-3」が消え（「憲法 Rule 2」も合わせて外し、「特定されていないことを示す」といまの動きを言う文になった）、「後続の他コンポーネントから再利用する予定はないため……」の行も消えた。**直っている。**
- **指摘5**（FAQ の構造化データ）: `DictionaryDetailLayout.tsx:20` が「パンくずと FAQ の構造化データは枠が出すので含めない。」になり、41行目の頭のコメントとテストの名前と合った。**直っている。**
- **指摘6**（index.md の空白）: コミット済み。

## 注記と中身の突き合わせ

18本の注記を1つずつ、そのそばのコードと突き合わせた。`店構え|器|帳面|成果物|主役|ピル|カード|しない|せず|ではなく|不要|予定|方針|静か|なし|ただし|N-[0-9]|B-[0-9]|cycle|以前|旧|従来|変更|廃止|移行|TODO|暫定|今後|将来|丸め|誠実|設計契約|Rule` でも grep した。

- 経緯の語（店構え・器・帳面・成果物・主役・ピル・カード・予定・N-3・cycle など）は、T5-9 の18本に1つも残っていない。
- 当たった行のうち、`YojiDetail.module.css:71`「枠や地で囲まず」・`:113`「リンクにせず」、`YojiDetail.tsx:77`「壊さない方針」、`YojiDetail.test.tsx:30` のテストの名前（「h1 は Detail 内部で管理」）は、どれもいまの形といまのコードの理由を言っており、3回目の判断のまま残してよい。`ColorDetail.tsx` の英語のコメント（決まった順の並べ替えの理由）も同じ。
- 色見本の注記（`ColorDetail.module.css:13`）だけが、コードと合わない（指摘1）。

そのほかの注記はコードと合う。たとえば `ColorDetail.module.css` の頭の「値の横にコピーのボタンを置く」は `.codeAction` の `CopyButton` のとおり、`KanjiDetail.module.css:103`「IBM Plex Sans の数字は既定で桁が揃う」は `DESIGN.md` §3（81行目）のとおり、`YojiDetail.module.css` の構成漢字・分類の行・例文の注記もそれぞれの指定のとおり。

`KanjiDetail.module.css:5` と `YojiDetail.module.css` の頭の「左揃え（§5）」が `.detail` の `margin: 0 auto` と合わないことは、3回目の申し送りのとおり T5-10・T5-11 が中央寄せを外して解く。T5-9 では直さない。

## 指摘

1. **`ColorDetail.module.css:13` の「角を --radius で丸め」は事実と合わない。直すこと（builder の作業）。** `--radius` は `globals.css:56` で `0px` なので、この `border-radius: var(--radius)` は角を丸めない。見た目の角は直角で、`DESIGN.md` §5（233行目）も「角丸は 0px」と言う。いまの注記を読んだ人は、色見本の角が丸いと受け取る。3回目の直す前の注記（「角丸 0」）は事実としては正しかったので、書き直しで事実が崩れた形である。書き直すなら、見た目としてしていることだけを言う。たとえば「色見本: 幅いっぱいの大きな色面。地の色は項目の色で、インライン style の color.hex で与え、細い線で囲む。」とし、角のことは言わない（`--radius` のトークンと色見本の線の色は T5-12 が §2 の `--rule-2` の線に替えるときに扱う。t5-design.md の T5-12 の行）。
2. **`KanjiDetail.module.css:125` の「大字と横の見出しのあいだを詰め」を、詰める相手が分かる言い方にすること（builder の作業）。** `.header` の `gap` は、大字と、その右の `.headerInfo`（h1・音読み・訓読み・意味の段）のあいだである。「横の見出し」は h1 だけを指すように読める。たとえば「幅 640px 以下の画面では、大字を小さくし、大字と右の見出し・読み・意味の段のあいだを詰める。」のように、`.headerInfo` の中身をそのまま言う。

指摘1・2はどちらも注記だけの変更で、見た目と動きは変わらない。

## anti-patterns/implementation.md の点検

- AP-I01（来訪者の目で見たか）: ランタイムのコードは1回目から変わっておらず、1回目が本番ビルドを 320・375・1280px・200%、ライトとダークで撮って見た結果がそのまま当たる。今回の指摘は来訪者の目には見えないが、次に Detail を組み直す T5-10〜T5-12 の builder が、事実と合わない注記（丸い角があるという記述）に引きずられないために要る。
- AP-I02（場当たりの回避）: 当たらない。`head` は必須の prop のままで、オプショナルにも個別の分岐にもしていない。
- AP-I03（Core Vitals・バンドル）: 当たらない。3回目からの変更はコメントだけで、import も静的なデータも増えていない。`ColorDetail` だけが `"use client"` で、これは HEAD から同じ。
- AP-I04（指標を目的に配置）: 当たらない。共有の見出しは 7-e の決定による。
- AP-I05（目的と無関係な中身）: 当たらない。
- AP-I06（反対の極端）: 当たらない。3回目の指摘への直しは挙げた注記の書き直しと削除に留まり、残すべき理由のコメント（「壊さない方針」、並べ替えの理由）は残っている。ただし色見本の注記は、古い言葉を消すことに寄せすぎて、正しかった事実（角が直角）まで言い換えで崩した（指摘1）。
- AP-I07（jsdom で分からないもの）: 当たらない。今回の変更はコメントだけで、左端・罫線・見出しの大きさは1回目に本番ビルドで測った。
- AP-I08（DESIGN.md に無い見た目）: 当たらない。CSS の値は1回目から変わっていない。
- AP-I09（コミットの順）: 移したファイル・消した `new/`・3つの `page.tsx`・Detail とテストは、分けると途中でビルドかテストが壊れる。指摘1・2の直しを含めて1つのコミットにまとめること。
- AP-I10（keyframes）: 当たらない（アニメーションを足していない）。
- AP-I11（タイマー）: 当たらない（タイマーを足していない）。
- AP-I13（撤去の網羅）: `_components/new` は `src` に残っていない。店構え の言葉（「店構え」「器」「帳面」「成果物」「主役」）は T5-9 の18本に残っていない。
- AP-I14（共有の部品の変更）: T5-9 は共有の部品を変えていない。`DictionaryDetailLayout` と `PlayRecommendBlock` を使うのは3つの `page.tsx` だけで、1回目に3つとも測った。

workflow.md の点検: 3回目の指摘1〜5は builder が、指摘6は PM が直し、受け持ちのとおり（AP-WF08・AP-WF13）。「コメントだけが変わった」という報告は、自己申告を受け入れず、HEAD からの差分をコメントでない行に絞って読み、3回目の記述と突き合わせて確かめた（AP-WF14）。指摘1は `globals.css` の `--radius` の値を一次の資料として確かめてから判断した（AP-WF09）。

## PM への申し送り

- 指摘1・2を builder が直したあと、全体を見直すレビューをもう一度受けること。注記だけの変更なので、ビルドと測り直しは要らないはずだが、ランタイムのコードに触れたときは測り直す。
- コミットは、T5-9 のファイルと `new/` の削除だけを1つにし、作業ツリーのほかのタスク（T5-7 の `ListView`・`_lib` など）のファイルを入れない。入れるものは次のとおり（このレビューの記録 `review-t5-9-4.md` は別のドキュメントのコミットでよい）。
  - 足す: `src/dictionary/_components/DictionaryDetailLayout.tsx`、`src/dictionary/_components/DictionaryDetailLayout.module.css`、`src/dictionary/_components/PlayRecommendBlock.tsx`、`src/dictionary/_components/PlayRecommendBlock.module.css`、`src/dictionary/_components/__tests__/DictionaryDetailLayout.test.tsx`、`src/dictionary/_components/__tests__/PlayRecommendBlock.test.tsx`
  - 変える: `src/app/dictionary/kanji/[char]/page.tsx`、`src/app/dictionary/yoji/[yoji]/page.tsx`、`src/app/dictionary/colors/[slug]/page.tsx`、`src/dictionary/_components/kanji/KanjiDetail.tsx`、`src/dictionary/_components/kanji/KanjiDetail.module.css`、`src/dictionary/_components/yoji/YojiDetail.tsx`、`src/dictionary/_components/yoji/YojiDetail.module.css`、`src/dictionary/_components/color/ColorDetail.tsx`、`src/dictionary/_components/color/ColorDetail.module.css`、`src/dictionary/_components/__tests__/KanjiDetail.test.tsx`、`src/dictionary/_components/__tests__/YojiDetail.test.tsx`、`src/dictionary/_components/__tests__/ColorDetail.test.tsx`
  - 消す: `src/dictionary/_components/new/DictionaryDetailLayout.tsx`、`src/dictionary/_components/new/DictionaryDetailLayout.module.css`、`src/dictionary/_components/new/PlayRecommendBlock.tsx`、`src/dictionary/_components/new/PlayRecommendBlock.module.css`、`src/dictionary/_components/new/__tests__/DictionaryDetailLayout.test.tsx`、`src/dictionary/_components/new/__tests__/PlayRecommendBlock.test.tsx`
- `docs/backlog.md` の B-567 は、コミットのあとで済みにする。
