# T5-9 レビュー（3回目。辞典の詳細の枠）

判定: **改善指示（changes-needed）**

対象: 作業ツリーの未コミットの T5-9 のファイル全部。`src/dictionary/_components/{DictionaryDetailLayout,PlayRecommendBlock}.{tsx,module.css}`、`src/dictionary/_components/__tests__/{DictionaryDetailLayout,PlayRecommendBlock,KanjiDetail,YojiDetail,ColorDetail}.test.tsx`、`src/dictionary/_components/new/` の削除、`src/app/dictionary/{kanji/[char],yoji/[yoji],colors/[slug]}/page.tsx`、`src/dictionary/_components/{kanji/KanjiDetail,yoji/YojiDetail,color/ColorDetail}.{tsx,module.css}`。T5-7 の `ListView`・`_lib` は見ていない。2回目の指摘1・2の直しだけでなく、18本を頭から終わりまで読み直した。

確かめ方: HEAD（203dbe89。レビューのあいだに T5-15 の cec09cbf が入ったが、T5-9 のファイルには触れていない）を `git archive` でスクラッチの自分のディレクトリに書き出し、`node_modules` が無いことを確かめてから `cp -al` し、T5-9 の18本だけを重ねて `new/` を消した（18本は作業ツリーと `cmp` で一致）。`npm run generate:release-id` のあと、vitest（`--maxWorkers=2`）・tsc・eslint・prettier・`check:phrased-names` を走らせた。書き出しは終わったあとに消した。

## 2回目のあとに変わったもの

2回目のレビューが読んだ差分（2回目のレビューのセッションに残っていた `git diff` の出力）と、いまの差分を、同じ9本（3つの `page.tsx`・3つの Detail の `.tsx`・3つの Detail のテスト）で突き合わせた。違いは次のコメントだけで、コードの行は1行も変わっていない。

- `colors/[slug]/page.tsx`: 「辞典固有の JSON-LD のみ渡す。……手動呼び出し不要。」の2行を消した。
- `KanjiDetail.tsx:133`・`KanjiDetail.test.tsx:43`: 「カード/ピルではなく」を消し、「読点で組んだ一文で見せる」だけにした。
- `YojiDetail.tsx:125`: 「ピルにしない。」を消した。`YojiDetail.tsx` の「フッターにAI運営の旨が……不要」の行を消した。

`DictionaryDetailLayout.tsx` は、2回目のレビューが読んだ全文と突き合わせて、`jsonLd` の説明の1行（20行目に「パンくずの構造化データはパンくずが出すので含めない。」を足した）だけが違う。3つの Detail の `.module.css` は、HEAD からの差分が頭の注記だけである（`git diff` で確かめた）。`PlayRecommendBlock` とその CSS、2本のテスト、漢字と四字熟語の `page.tsx` は2回目のときのまま。

ランタイムのコードが変わっていないので、ビルドとブラウザでの測り直しはしていない。1回目の実測（パンくずの字の左端 27 / 179、見出しの段、罫線、ライトとダーク）がそのまま当たる。

## 機械の検査

- vitest: `src/dictionary` と `src/app/dictionary` の 15 ファイル・176 件がすべて通った（2回目と同じ数）。
- tsc: 通った（出力なし）。eslint（`src/dictionary/_components` と3つの詳細のページのディレクトリ）: 通った。prettier（`src/dictionary/_components` と `src/app/dictionary`）: 通った。
- `check:phrased-names` を T5-9 の8本の `.tsx` に絞って: 通った。
- `_components/new` の参照は `src` の `.ts`・`.tsx`・`.css` に残っていない（`docs/backlog.md` の B-567・B-775 の行だけ）。

## 2回目の指摘の確かめ

- **指摘1**: 挙げた5か所はどれも消えるか、いまの形だけを言う文になった。JSON-LD の約束は `DictionaryDetailLayout` の `jsonLd` の説明に移り、3つのページがそろった。ただし、移した説明が FAQ の構造化データに触れていない（下の指摘5）。
- **指摘2**: 3つの Detail の CSS の頭の注記から「器は静か」「ピル・色付きカード・影・角丸装飾なし・全トークン経由」「ただし成果物＝……」が消え、いまの組み方を言う文に書き直された。ただし、同じ 店構え の変更（cycle-279 の 86c711fc）で入った同じ語の注記が、`ColorDetail.module.css` の頭の外に残っている（下の指摘1）。
- **指摘3**（PM）: index.md（203dbe89 でコミット済み）の「T5-9 から T5-10〜T5-12 へ」の行の末尾に、ユーモア辞典の `page.module.css` の3行目と50行目の「器は静か」を T5-13 が消すことが書かれている。**直っている。** 句点のあとに半角の空白が1つ入っている（下の指摘6）。

## `ColorDetail.module.css:13` の判断

builder は「器は直角の帳面（角丸 0）＋一本罫で囲む」を、T5-12 が書き換えるいまの色見本の説明として残した。**いまの色見本の説明ではあるが、T5-9 がいま消すべき経緯の注記である。** 理由は次のとおり。

- この行と直前の「色見本（成果物＝色そのもの・主役）」は、「器は静か」と同じく cycle-279 の 店構え の変更（`git log -S"直角の帳面"` → 86c711fc「辞典詳細4種+共有詳細レイアウトを店構えへ」）で入った。「器」「帳面」「成果物」は 店構え のころの言葉で、`DESIGN.md` にも `src` のほかのどこにも無い（「帳面」は `src` でこの1行だけ）。
- builder は同じファイルの頭の注記から「ただし成果物＝色そのものが主役」「器（見出し・表・導線）は静か」を消し、「色そのものが中身なので……（コンテンツの色・§2）」と書き直した。12〜13行目はそれと同じことを 店構え の言葉で言い直しているので、1つのファイルの中に新しい言い方と古い言い方が並ぶ。これは CLAUDE.md が禁じるツギハギの形そのものである。
- T5-12 の行は、色見本の線を `--rule-2` に替えることを受け持つが、注記を書き換えることは受け持たない。線の色の1語を替えるだけで済む変更なので、この注記はそのまま残りうる。10-5 の表は、辞典の経緯の注記（「店構え」）を T5-9 に渡している。
- 直しは注記の2行だけで、見た目も T5-12 の作業も変わらない。いま直さない理由が無い。

## 読み直して見つけたこと

枠の2つの部品とその CSS・テスト、3つの `page.tsx` の枠への渡し方、3つの Detail の `Section` と `{head}` の置き方、頭の置き場所のテストは、1回目・2回目の判断のまま受け入れる。

一方、T5-9 のファイルに経緯の語や事実と合わない注記がまだ残っている。`店構え|器|帳面|成果物|主役|ピル|カード|しない|せず|ではなく|不要|予定|方針|静か|なし|ただし|N-[0-9]|B-[0-9]|cycle` などで18本を grep し、当たった行を1つずつ判断した。

- 残すもの: `YojiDetail.module.css` の「字で区切らず間隔をあけて」（48行目）・「枠や地で囲まず、補助情報の文字で置く」（71行目）は、`ItemList.module.css`・`QuizContainer.module.css`・`src/app/page.module.css` と同じ、いまのデザインの規則を言う書き方で、前にあった形を言っていない。「辞典に無い字はリンクにせず」（113行目）は、いまの動き（リンクでない字）の説明。`YojiDetail.tsx:78` の「壊さない方針」、`ColorDetail.tsx` の英語のコメント（決まった順の並べ替えの理由）も、いまのコードの理由である。
- 直すもの: 下の指摘1〜4。

## 指摘

1. **`ColorDetail.module.css` に残る 店構え の言葉の注記を、いまの組み方を言う文に書き直すこと（builder の作業）。** 12〜13行目「色見本（成果物＝色そのもの・主役）: 大きな色面。……器は直角の帳面（角丸 0）＋一本罫で囲む。」は上の判断のとおり。同じ変更で入った「主役」の言い方も合わせて直す: `ColorDetail.module.css:43`「罫で組む（区切りは罫が主役）」、`KanjiDetail.module.css:18`・`YojiDetail.module.css:14`「（見出しの主役）」。書き直すなら、たとえば「色見本: その色の大きな色面。背景色は項目の色（インラインの style）で与え、細い罫線で囲む」のように、CSS がしていることだけを言う。
2. **`ColorDetail.module.css:58` の壊れた注記を直すこと（builder の作業）。** 「値セル: HEX/RGB/HSL は桁が揃う 桁の揃う数字でコピーしやすく。」は、前のサイクルの機械的な言い換え（2510200a）で語が二重になった跡で、日本語として読めない。頭の注記（「HEX・RGB・HSL は桁の揃う数字で組み」）と同じ言い方で1回だけ言う。
3. **`KanjiDetail.module.css:125` の、事実と合わない注記とほかの形の否定を直すこと（builder の作業）。** 「モバイル先行（375）: 大字を縦積みにして読みやすさを保つ。中央寄せはしない（左揃え・§5）。」のうち、この `@media (max-width: 640px)` は横並びの間隔と大字の大きさを小さくするだけで、縦積みにしていない（`.header` は `display: flex` のまま。HEAD から同じ）。`max-width` の問い合わせなので「モバイル先行」でもない。「中央寄せはしない」は採らなかった形の否定である。「狭い画面では、大字を小さくし、大字と見出しのあいだを詰める」のように、いまの指定がすることだけを言う。
4. **`YojiDetail.tsx` とそのテストに残る経緯の注記を消すこと（builder の作業）。**
   - `YojiDetail.tsx:49` と `YojiDetail.test.tsx:141` の「（憲法 Rule 2 / N-3）」の「N-3」は、cycle-246 の計画の項目の番号（e4a21903 で入った）で、ファイルだけを読む人には意味が分からない経緯の参照である。「N-3」を外す（「憲法 Rule 2」は残してよい）。
   - `YojiDetail.tsx:64`「後続の他コンポーネントから再利用する予定はないため component ローカルに置く。」は、採らなかった置き場所（共有のモジュール）と、来るかどうか分からない先の予定を言っている（AP-I13 の (3) と同じ形）。消す。
5. **`DictionaryDetailLayout.tsx:20` の `jsonLd` の説明に、FAQ の構造化データも含めないことを書くこと（builder の作業）。** 枠は、パンくず（`Breadcrumb`）に加えて FAQ（`FaqSection` が FAQPage を出す）の構造化データも出す。枠の頭のコメント（41行目「よくある質問（FAQPage の JSON-LD を持つ）」）とテストの名前（「パンくずと FAQ の分が加わる」）もそう言っている。いまの説明はパンくずだけを挙げるので、FAQPage を渡してよいと読める。2回目の指摘1が示したとおり「パンくずと FAQ の構造化データは枠が出すので含めない」とする。
6. **index.md の「T5-9 から T5-10〜T5-12 へ」の行の、句点のあとの半角の空白を消すこと（PM の作業）。** 「……§4 が受け入れる）。 ユーモア辞典の詳細の……」の「。」と「ユーモア」のあいだに半角の空白がある。

指摘1〜5はどれも注記だけの変更で、見た目と動きは変わらない。

## 申し送りの確かめ（T5-10 への残り）

`KanjiDetail.module.css:5`「読む面に絞り、左揃えにする（§5）。」は、同じ規則の `.detail` が `margin: 0 auto` で中央に寄っているので、いまは事実と合わない。ただし中央寄せを外すことは T5-10 の完了の条件（0-5 の h1 の左端 27 / 179）が受け持ち、外せばこの注記は正しくなる。T5-9 では直さない。四字熟語（T5-11）も同じ。

## anti-patterns/implementation.md の点検

- AP-I01（来訪者の目で見たか）: ランタイムのコードは1回目から変わっておらず、1回目が本番ビルドを 320・375・1280px・200%、ライトとダークで撮って見た結果がそのまま当たる。今回の指摘は来訪者の目には見えないが、次に Detail を組み直す T5-10〜T5-12 の builder が、事実と合わない注記や古い言葉に引きずられないために要る。
- AP-I02（場当たりの回避）: 当たらない。`head` は必須の prop のままで、オプショナルにも個別の分岐にもしていない。
- AP-I03（Core Vitals・バンドル）: 当たらない。2回目からの変更はコメントだけで、import も静的なデータも増えていない。
- AP-I04（指標を目的に配置）: 当たらない。共有の見出しは 7-e の決定による。
- AP-I05（目的と無関係な中身）: 当たらない。
- AP-I06（反対の極端）: 当たらない。2回目の指摘への直しは、挙げた注記の削除と書き直しに留まり、ほかの注記まで一律に消してはいない（残すべき理由のコメントは残っている）。
- AP-I07（jsdom で分からないもの）: 当たらない。今回の変更はコメントだけで、左端・罫線・見出しの大きさは1回目に本番ビルドで測った。
- AP-I08（DESIGN.md に無い見た目）: 当たらない。CSS の値は1回目から変わっていない。
- AP-I09（コミットの順）: 移したファイル・消した `new/`・3つの `page.tsx`・Detail とテストは、分けると途中でビルドかテストが壊れる。指摘1〜5の直しを含めて1つのコミットにまとめること。
- AP-I10（keyframes）: 当たらない（アニメーションを足していない）。
- AP-I11（タイマー）: 当たらない（タイマーを足していない）。
- AP-I13（撤去の網羅）: `_components/new` は `src` に残っていない。「店構え」「器は静か」「帳面」を `src` で grep すると、T5-9 のファイルでは `ColorDetail.module.css:13` だけが残る（指摘1）。ほかは T5-13 が受け持つユーモア辞典の CSS、T5-18 の範囲の道具の CSS（`BmiCalculatorTile`・`TextDiffTile`）、ほかの面のテストの describe の名（`middleware-gone-slugs.test.ts`・`ogp-image.test.tsx`）。同じ 店構え の変更で入った「主役」「成果物」も grep し、指摘1に挙げた。「予定」の grep で、来ない先の計画を言う注記（`YojiDetail.tsx:64`）が見つかった（指摘4）。
- AP-I14（共有の部品の変更）: T5-9 は共有の部品を変えていない。`DictionaryDetailLayout` と `PlayRecommendBlock` を使うのは3つの `page.tsx` だけで、1回目に3つとも測った。

workflow.md の点検: 2回目の指摘1・2は builder が、指摘3は PM が直し、受け持ちのとおり（AP-WF08・AP-WF13）。「コメントだけが変わった」という報告は、自己申告を受け入れず、2回目のレビューが読んだ差分と全文を一次の資料として突き合わせて確かめた（AP-WF14）。`ColorDetail.module.css:13` を残した判断も、`git log -S` でその行が入った変更を確かめてから判断した（AP-WF09）。

## PM への申し送り

- 指摘1〜5を builder が直したあと、全体を見直すレビューをもう一度受けること。注記だけの変更なので、ビルドと測り直しは要らないはずだが、ランタイムのコードに触れたときは測り直す。指摘6は PM が index.md を直す。
- コミットは、T5-9 のファイルと `new/` の削除だけを1つにし、作業ツリーのほかのタスク（T5-7 の `ListView`・`_lib` など）のファイルを入れない。入れるものは次のとおり（レビューの記録 `review-t5-9-3.md` と、その後のレビューの記録は別のドキュメントのコミットでよい）。
  - 足す: `src/dictionary/_components/DictionaryDetailLayout.tsx`、`src/dictionary/_components/DictionaryDetailLayout.module.css`、`src/dictionary/_components/PlayRecommendBlock.tsx`、`src/dictionary/_components/PlayRecommendBlock.module.css`、`src/dictionary/_components/__tests__/DictionaryDetailLayout.test.tsx`、`src/dictionary/_components/__tests__/PlayRecommendBlock.test.tsx`
  - 変える: `src/app/dictionary/kanji/[char]/page.tsx`、`src/app/dictionary/yoji/[yoji]/page.tsx`、`src/app/dictionary/colors/[slug]/page.tsx`、`src/dictionary/_components/kanji/KanjiDetail.tsx`、`src/dictionary/_components/kanji/KanjiDetail.module.css`、`src/dictionary/_components/yoji/YojiDetail.tsx`、`src/dictionary/_components/yoji/YojiDetail.module.css`、`src/dictionary/_components/color/ColorDetail.tsx`、`src/dictionary/_components/color/ColorDetail.module.css`、`src/dictionary/_components/__tests__/KanjiDetail.test.tsx`、`src/dictionary/_components/__tests__/YojiDetail.test.tsx`、`src/dictionary/_components/__tests__/ColorDetail.test.tsx`
  - 消す: `src/dictionary/_components/new/DictionaryDetailLayout.tsx`、`src/dictionary/_components/new/DictionaryDetailLayout.module.css`、`src/dictionary/_components/new/PlayRecommendBlock.tsx`、`src/dictionary/_components/new/PlayRecommendBlock.module.css`、`src/dictionary/_components/new/__tests__/DictionaryDetailLayout.test.tsx`、`src/dictionary/_components/new/__tests__/PlayRecommendBlock.test.tsx`
- `docs/backlog.md` の B-567 は、コミットのあとで済みにする。
