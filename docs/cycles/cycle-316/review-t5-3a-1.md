# T5-3a レビュー 第1回

対象: 未コミットの24パス（`src/lib/phrase-breaks.ts` とその試験、新しい `src/lib/index-phrases.ts` とその試験、`src/components/LinkIndex/*`・`src/components/IndexAccordion/*`、`src/dictionary/_lib/{kanji-list,yoji-list,color-list}.ts`、一覧の部品3つと `KanjiDetail`・`YojiDetail` とその試験、`BlogListView.tsx`、`OtherTypesNav.tsx` とその試験、`StorybookContent.tsx`）。HEAD は c4f0c041。

## 判定

**承認**（指摘なし）

下の「完了の記録に入れる事実」は、コードの直しではなく、PM がタスクの完了の記録に書く値である（T5-3d と同じ流れ）。

## 計画からの外れ（区切りを作る所）の判断

計画は、`src/dictionary/_lib/{kanji-list,yoji-list,color-list}.ts` が `LinkIndexItem` を組むときに区切ると書いている。builder は、この3つが区切る前の `IndexEntry` を返し、索引を置くサーバーの部品（一覧の部品3つ・`BlogListView`・`KanjiDetail`・`YojiDetail`）が新しい `src/lib/index-phrases.ts` で区切る形にした。

**この形が正しい。** 理由を確かめた:

- `color-list.ts` は `src/tools/traditional-color-palette/palette-list.ts` を通して `"use client"` の `TraditionalColorPaletteTile.tsx` から読み込まれている。`yoji-list.ts` は `src/tools/yoji-search/logic.ts` が読み込む。`phrase-breaks.ts` は `import "server-only"` を持つので、一覧の定義から値として読み込むとビルドが止まる（`docs/knowledge/nextjs.md` の server-only の項）。
- 一覧の定義が `index-phrases.ts` から読むのは `import type` だけで、型は消えるのでクライアントのバンドルには入らない。本番のビルドも通った。
- 区切りは、計画の「項目を組むサーバーの所で作る」の決まりどおり、サーバーの部品で作られている。区切りの関数は1つ（`phraseIndexEntries`・`phraseIndexGroups`）で、6つの使う側がそれを使い、自前の区切りを持たない。

計画の行（t5-design.md の T5-3a）は一覧の定義で区切ると書いたままなので、この外れと理由を完了の記録に書く。

## 区切りの規則（`countedName`）と試験

- `splitIntoPhrases(text, { countedName: true })` は BudouX を使わず、`splitNameAtWords` で、名前の中の語の切れ目（見出しの広い文節を分ける所と同じ `wordStartsOf`・`wordBreakRank` のうち、禁則を満たし、分けた両側が1行を作ってよい所）と、深さ0の始め括弧の前でだけ区切る。括弧の中には区切りを置かない。片仮名の続きの中は、続きが狭い見出しの行に収まらないときだけ語の頭で切る（「オンライン|ツール」は切り、「ツールガイド」「ワークフロー」は切らない）。§4 の規則と合っている。
- `PhraseOptions` を `tableCell` と `countedName` のどちらか一方だけの型にしたので、2つを同時に渡せない。
- 一覧の索引の語のすべて（ブログの分類・タグ、学年、画数、四字熟語のカテゴリ、色み）を区切って並べた結果を読んだ: 「開発|ノート」「AI|ワークフロー」「日本語・|文化」「Web|開発」「設計|パターン」「失敗と|学び」「UI|改善」「オンライン|ツール」「サイト|運営」「テキスト|処理」「ワークフロー|連載」「対立・|闘い」ほかは1語のまま（「ツールガイド」「中学以降」「小学1年」「Claude Code」など）。語を割る区切りは無い。「Claude Code」の空白はブラウザが折れる所で、語の切れ目なので規則に合う。
- 試験: 計画の3例（「オンライン／ツール」「カテゴリから／探す（10）」「部首／（198）」）、括弧の中で切れないこと、助詞・送り仮名・漢字どうしで切らないこと、片仮名の続きの扱い、禁則と切れ端の長さを確かめている。`index-phrases.test.ts` は一覧の索引の語のすべてを回して、つなぐと元の語に戻ることと `followsPhraseRules` を確かめ（あとから足した語も同じ試験にかかる）、手で書いたアコーディオンのラベル4つ（`BLOG_INDEX_SUMMARY` ほか）が `countedName` の分け方と同じで禁則を満たすことを確かめている（10章の頭の (c)）。`OtherTypesNav`・`KanjiDetail`・`YojiDetail` の試験は、見出しの `<wbr>` の並びが `countedName` の分け方と同じであることを確かめている。

## ツギハギ

- `LinkIndex.module.css` の `.counted` と `IndexAccordion.module.css` の `.name`、`IndexAccordion` の `IndexName`、`LinkIndex` の `ItemLabel`、`LinkIndexItem` の `label` は、`src/` のどこにも残っていない（grep で確かめた。`LinkIndexName` の `{ label: string }` は ul の名前の別の props で、語の欄ではない）。
- 自前の `<wbr>` の組み方は無くなり、どれも `PhrasedText` を通る。
- 注釈は今の形を言うだけで、経緯を書いたものは無い。`index-phrases.ts` の頭の「語を組む一覧の定義はクライアントの道具からも読み込まれるので、区切る前の語を返し、区切りはここに任せる」は、今の置き場所の理由で、経緯ではない。

## 読み上げの名前と `aria-labelledby`

本番のビルドで確かめた:

- 4つの一覧と2つの詳細で、`aria-labelledby` を持つ ul は、どれも参照先の要素がある（0件の欠け）。索引が1つの一覧（`/dictionary/yoji`・`/dictionary/colors`）では、ul は `PhrasedText` の span（`id`）を名前にし、名前は「カテゴリから探す（10）」になる。
- `ariaSnapshot` で、リンクの名前は「オンラインツール（12）」「設計パターン（28）」、リストの名前は「分類（5）」「タグ（29）」、詳細の見出しは「同じ部首の漢字（4字）」で、元の文のまま。
- CDP の `Accessibility.getFullAXTree` では、Chromium が `<wbr>` ごとに空白を入れる（「カテゴリから 探す （10）」「同じ 部首の 漢字 （4字）」「すべての タイプ （24）」）。これは `docs/knowledge/playwright-mcp.md` に書いてある `PhrasedText` 全体の性質で、HEAD の `IndexName` も同じく `<wbr>` を置いていたので、この変更で悪くなったものではない。

## `check:phrased-names`

HEAD と変更後の `src/` を `CHECK_PHRASED_NAMES=1 PHRASED_NAMES_REPORT_ONLY=1` で数え、24パスの出力を比べた。

- 全体: 字で渡すもの 112 → 112、値で渡すもの 56 → 56。
- 24パスで違うのは `IndexAccordion` の値で渡す2か所の式だけ（`<IndexName …/>` → `withCount(props.summary, props.index.length)` と `props.summary`）。T5-3a の受け持ちの2か所で、下の表のとおり閉じた状態を 320・375・1280 の既定と 200% で測り、名前の中の語の切れ目と始め括弧の前のほかの折れは0。
- 24パスに残る字で渡すものは、storybook の見本（T5-24）と一覧の部品の探す欄 `searchLabel` 4つ（T5-7）で、どれも HEAD にあったもの。T5-3a が足したものは無い。

## 測った値（本番のビルド・Chromium・`/opt/pw-browsers`）

`/blog`・`/dictionary/kanji`・`/dictionary/yoji`・`/dictionary/colors`（閉じた状態と開いた状態）、漢字「左」「水」、四字熟語「一期一会」、character-personality の結果のページ（blazing-strategist）、`/blog/tag/オンラインツール` を、320・375・1280 の既定と、同じ3つの幅の 200%（`default_font_size` 32）で測った。数えたのは、アコーディオンのラベル、索引の見出し、索引の語、括弧で数を添えた詳細の見出し。折れは字ごとの Range の位置で行に分け、`<wbr>` の所と始め括弧の前のほかで折れた数を数えた。

| ページ                               | 既定（320・375・1280）                        | 200%（320）                                             | 200%（375・1280） |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------------------- | ----------------- |
| `/blog`（37要素）                    | 規則の外の折れ 0                              | 規則の外の折れ 2（下の「完了の記録に入れる事実」）      | 0                 |
| `/dictionary/kanji`（233要素）       | 0                                             | 0（「学年・画数・／部首から探す」「部首／（198）」）    | 0                 |
| `/dictionary/yoji`（11要素）         | 0                                             | 0（「カテゴリから／探す（10）」「対立・闘い／（26）」） | 0                 |
| `/dictionary/colors`（8要素）        | 0                                             | 0（「色みから探す／（7）」）                            | 0                 |
| 漢字「左」「水」の同じ部首の漢字     | 0（「水」320: 「同じ部首の漢字／（117字）」） | 0（「同じ部首の／漢字／（4字）」）                      | 0                 |
| 四字熟語「一期一会」の同じカテゴリ   | 0（「同じカテゴリの／四字熟語（57語）」）     | 0（「同じ／カテゴリの／四字熟語／（57語）」）           | 0                 |
| character-personality の結果のページ | 0                                             | 0（「すべての／タイプ／（24）」）                       | 0                 |

- どの幅と文字の大きさでも、測った要素のはみ出しは0。`main` の中の見える要素が画面の左右の端を越えるもの（横に送れる祖先の中と、祖先がすでに越えているものを除く）も0。
- 測った要素の計算値は、どれも `word-break: keep-all`・`overflow-wrap: anywhere`・`line-break: strict`。
- 詳細のページの FAQ の問い（アコーディオンのラベル）は語の中で折れているが、T5-3c（`FaqSection`）の受け持ちで、この変更は触っていない。
- 見た目: 320 の 200% の `/blog` の索引で、HEAD の「オンラインツー／ル（12）」「ワークフロー連／載（4）」が「オンライン／ツール（12）」「ワークフロー／連載（4）」になった（builder の前後の測りと同じ）。375 のダークで `/blog` と `/dictionary/yoji` の開いた索引を撮り、字・下線・三角・罫線の色が読めることを見た。1280 と既定の 320・375 では並びが変わらない。

## 完了の記録に入れる事実

- **計画からの外れ**: 区切りは一覧の定義でなく、索引を置くサーバーの部品が `src/lib/index-phrases.ts` で作る（上の「計画からの外れ」の理由）。
- **§4 が受け入れる折れ**: 320px の 200% の `/blog`（とタグのページ）で、「リファクタリング（5）」が「リファクタリン／グ（5）」、「アクセシビリティ（4）」が「アクセシビリテ／ィ（4）」と語の中で折れる。語の幅は 278px で、1行の字の幅 258px（ul 266px、リンクの左右の余白 8px）に収まらないので、§4 の「一語が1行に収まらないとき」に当たる。このため「グ（5）」の行の名前は1字になり、「ィ」が行頭に来る（`overflow-wrap: anywhere` の折れは禁則より先に効く）。frontend-design スキルは、200% の1行に収まらない語から出た1字の行と禁則の破れを受け入れ、数を記録すると決めているので、この2件をこの値とともに記録する。HEAD でも同じ2件が折れていた。

## 検査

HEAD を `git archive` で書き出し（書き出しに `node_modules` が無いことを確かめ、`cp -al` で入れた）、24パスを重ね、作業ツリーと `cmp` で同じことを確かめた。

- `npm run generate:release-id`: 通った。
- `npm run build`: 通った。
- `vitest run --maxWorkers=2`（全体）: 396 ファイル・6435 件が通った（1ファイル・1件は既定で飛ばす `check-phrased-names`）。
- `tsc --noEmit`: エラーなし。
- `eslint`（24パスのうち CSS を除くもの）: 指摘なし。
- `prettier --check`（24パス）: 通った。

起動したサーバーは、控えた自分の PID とその子だけを止め、書き出しは消した。
