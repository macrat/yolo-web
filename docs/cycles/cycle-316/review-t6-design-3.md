# T6 の設計（t6-design.md）のレビュー（3巡目）

- 対象: [t6-design.md](./t6-design.md)（b74ffa5 の時点）。2巡目の指摘は [review-t6-design-2.md](./review-t6-design-2.md)
- 突き合わせたもの: [index.md](./index.md) の T5・T5a・T6・T7・T10・T12 の行と完了の条件（B-644・B-650・札画像・favicon）、[t5-inventory.md](./t5-inventory.md)（1章・6章・9章）、`DESIGN.md` §2・§3・§8・§10、CLAUDE.md、`docs/constitution.md`、HEAD のコード、`node_modules/next`（16.3.0）の文書とソース、`.next` のビルド（`BUILD_ID` `mS-YRYlDIt2XYCV6LyG_E`）
- 参照したアンチパターン: `docs/anti-patterns/planning.md`、`docs/anti-patterns/workflow.md`
- サーバーは立てていない。画像も描いていない。

## 判定: 改善指示

2巡目の Major-1・Minor-1〜5 は、どれも設計の中で直っている（下の表）。`twitter-image.tsx` の数と、消したあとも `og:image` が残ることも確かめた。ただし、2巡目で足された知識のクイズの点数の画像が、画面の事実を取り違えたまま点数を画像のいちばん小さい段に置き、その行を描く口が T6-2 の描き方にも T6-1 の `DESIGN.md` にも無い（Major-1）。また、名前ごとの代替テキストの渡し方を T6-3 の builder に決めさせているが、その決定は T6-3・T6-4・T6-5・T6-7・T6-8 の並行する全ルートと、受け持ちの無い `src/play/seo.ts` に及び、選び方によっては X のカードが壊れる（Major-2）。ほかに小さな抜けがある。

---

## 2巡目の指摘の直り方

- **Major-1 T5・T5a・T7 との順序**: 直った。4章の頭の表で、404 と 410 の icon は T5 の 404・410 のタスクのあとに T5 が残した形へ足す、T6-6 は T5 の診断の面のタスクと T5a のあと、T6-7 の名前は h1 と同じ出どころから取り（完了の条件でテスト）、T7 の文言の見直しは T6-6 のあと、となった。`ResultCard` を使うのは解き終えた画面だけで、結果のページの共有の区画は `ResultPageShell` にあることもコードで確かめた（`ResultPageShell.tsx:4-6`）。
- **Minor-1 ゲーム4本**: 直った（1-1・T6-3・受け持ちの表。T6-3 の確かめる PNG に kanji-kanaru）。
- **Minor-2 `twitter-image.tsx`**: 直った。新しいルートには置かず、既存の40本を T6-3 で消す。`src/app` の `twitter-image.tsx` は40本（道具36・ルート・privacy・`blog/[slug]`・`dictionary/humor/[slug]`）で、どれも同じディレクトリの `opengraph-image.tsx` を再エクスポートするだけなので、消しても各ルートの `og:image` は残る。書き出す `twitter-image.body` の154枚は、36＋1＋1＋ブログ86＋ユーモア30 で合う。
- **Minor-3 知識のクイズの点数**: 案は3つで比べられ、b が勧められた。ただし中身に誤りと抜けがある（下の Major-1）。
- **Minor-4 import の直し先**: 直った（T6-0 の内容・3-6・受け持ちの表の「T6-0 → T6-11」）。
- **Minor-5 favicon の比べ方**: 直った。T6-0 はスクリプトの出力どうしを前後で比べる。T6-10 は 400 と 700 の 16px を同じスクリプトで作り、画素で比べる。

## 確かめて一致したもの

- `opengraph-image.tsx` 54本の内訳（1-1）と割り振り: `src/app` の `opengraph-image.tsx` は57本（テストを除く）。札の3本を除く54本が、T6-3 の45本（道具36・ブログ・プレイ面・daily・ゲーム4・ユーモア・privacy）・T6-4 の8本（`[slug]` の結果・専用の7本）・T6-7 のルート1本に漏れなく分かれる。
- 知識のクイズは10問で、点数から段位が1つに決まる（3-1 の b）: kanji-level・kotowaza-level・yoji-level とも `questionCount: 10`、段位の `minScore` は 0・3・5・7・9。3本で33枚は合う。
- T6-7 の354件: 283＋18＋35＋9＋9＝354。
- 3-8 の見積もり（約1.7分・80〜125 MiB）: 2,890 × 35ms ≒ 101秒。2,890 × 28〜44 KiB ≒ 79〜124 MiB。

---

## Major

### Major-1 知識のクイズの点数の行が、画面の事実を取り違え、描く口と規定の受け持ちが無い

3-1 の b は「点数の字は、**画面と同じく**数字を IBM Plex Sans、『問中』『問正解』を本文の書体で、読みと同じ補助情報の位置に置く」とする。画面の事実は違う。

- 解き終えた画面の点数は `FittedNumber`（`ResultCard.tsx:482-488`）で、`FittedNumber.module.css` の `.number` は `font-family: var(--font-heading)`（Plex ＋ Zen Antique）、既定の段は `--text-heading-main`（§4 の主見出しの段）。`DESIGN.md` §8 の「数字・短い語」も「§4 の主見出しと同じ段で組む」。画面では、点数は結果のボックスの中でいちばん大きい字で、和文も見出しの書体である。
- 設計のとおりに作ると、持ち帰った画像では点数が補助情報の大きさ（36px。400px に縮めて約 12px）の本文の書体になり、画面でいちばん目立つ「8問正解」が画像ではいちばん小さい字になる。「持ち帰る画像が、画面の結果のボックスと同じ中身になる」という勧めの理由が、見た目の重みでは成り立たない。
- 同じ設計の 3-5（irodori）は、数字の結果（合計点「72点」）を名前の位置に見出しの書体で組むとしていて、同じ「数字の結果」の扱いが画像ごとに食い違う。
- T6-2 の描き方が受け取るのは「補助情報・名前・読み・副題・色見本」だけで、点数の行を置く口が無い。T6-1 が `DESIGN.md` §10 に書く組み方の一覧にも、点数の行が無い。T6-6 の builder は、T6-2 の受け持ちのモジュールを書き換えるか、点数を「読み」か「副題」に流し込むかを自分で決めることになる。

直し方: 3-1 の b の点数の行を、画面と §8 に合わせて決め直す（例: 段位の名前を名前の段に、点数を §8 の「数字・短い語」として見出しの書体で名前に負けない大きさに置くか、irodori と同じく点数を名前の位置に置いて段位を補助にするか。3-5 と同じ考え方で、画像の中の「数字の結果」をどう組むかを1つに決める）。その行を T6-2 の描き方の入力として持たせて T6-2 の条件に試しの入力を足し、T6-1 の `DESIGN.md` §10 の書き足しに含める。あわせて、3-1 の「1本に4〜5段位」は、3本とも5段位なので「5段位」に直す。

### Major-2 名前ごとの代替テキストの渡し方を、並行するタスクの1つに決めさせている

5章と 3-2 は「名前ごとの `alt` の渡し方（`generateImageMetadata` か、ページの `metadata.openGraph.images` の `alt`）を T6-3 の builder が確かめて選ぶ」とする。一方で 4章の順序では、T6-3・T6-4・T6-5・T6-7・T6-8 は T6-2 のあとに並行する。問題は3つある。

1. **決定が全ルートに及ぶのに、並行する1タスクの中で決まる。** 動的なセグメントのルート（ブログ・ユーモア・プレイ面・診断の結果・伝統色・索引・タグ・漢字・四字熟語）は、どれも同じ渡し方を要る。T6-4・T6-5・T6-7・T6-8 の builder は、T6-3 の決定を待たずに別々に選びうる。
2. **どちらの渡し方も、画像の URL が変わるか、別のファイルの形を要る。** `generateImageMetadata` を使うと、画像のルートは `…/opengraph-image/[__metadata_id__]` になる（`node_modules/next/dist/lib/metadata/get-metadata-route.js:158`）。ページの `metadata.openGraph.images` は、同じセグメントに規約のファイル `opengraph-image` があるとファイルの方が優先されるので、`alt` だけをページから渡すには、画像を規約のファイルでなく別のルートに置き直すことになる。5章の「画像の URL を変えずに」という条件は、どちらの案も満たさない見込みで、URL を変えることが来訪者に害かどうか（カードは頁の URL で引かれ、画像の URL が変わって困る来訪者はいない）も書かれていない。
3. **受け持ちの無いファイルが壊れる。** `src/play/seo.ts:41,66` の `generatePlayMetadata` は、``twitter.images: [`${canonicalUrl}/opengraph-image`]`` を明示している（`/play/[slug]`・`/play/daily`・`/play/music-personality` などが使う。`src/play/__tests__/seo.test.ts:136-160` が試す）。`generateImageMetadata` を選ぶと、この URL は存在しない画像を指し、X はまず `twitter:image` を読むので、プレイ面のカードが画像の無いものになる（B-644 に反する）。また、3-2 の「`twitter-image.tsx` を消すと `twitter:image` が消えて `og:image` だけになる」は、このファイルがある限りプレイ面では成り立たない。ページの `metadata` から渡す案を選べば、`src/lib/seo.ts`（道具・ブログの `generate*Metadata`）も書き換えることになり、並行する複数のタスクが同じファイルを触る。

直し方: 渡し方の決定を T6-2 に移す（T6-2 の中で、動的なセグメントのルート1本で試し、HTML の `og:image`・`og:image:alt`・画像の URL と、ビルドが書き出す PNG を確かめてから決める）。決めた形を T6-2 の完了の条件に入れ、T6-3 以降はそれに従う。`src/play/seo.ts` の `twitter.images` の明示（とそのテスト）を消すか決めた URL に合わせるタスクを1つに決めて受け持ちの表に載せ、`src/lib/seo.ts` を触るならその受け持ちも1つのタスクに置く。5章の「URL を変えずに」は、来訪者から見て要る条件かどうかで書き直す。

---

## Minor

### Minor-1 `twitter-image.tsx` を消すと落ちるテストが、受け持ちに無い

`src/app/tools/__tests__/page-coverage.test.ts` は、道具ごとに `twitter-image.tsx` があることを試している（`REQUIRED_FILES`）。T6-3 が40本を消すと、このテストが落ちる。T6-3 の内容と受け持ちの表に、このテストの `REQUIRED_FILES` から `twitter-image.tsx` を外すこと（とファイルの頭の説明を直すこと）を入れる。

### Minor-2 ルートの `twitter-image.tsx` を消すタスクと、ルートの画像を移すタスクが並行する

`src/app/twitter-image.tsx` は `./opengraph-image` から `default, alt, size, contentType` を再エクスポートしている。これを消すのは T6-3、`src/app/opengraph-image.tsx` を移すのは T6-7 で、2つは並行してよいとされている。T6-7 が先にルートの画像の書き出すもの（`alt` の形など）を変えると、T6-3 が消す前の `twitter-image.tsx` がビルドを壊しうる。ルートの `twitter-image.tsx` を消すのは T6-7 に持たせる（または T6-3 → T6-7 の順にする）。

### Minor-3 irodori の画像の保存だけ、`surface` を持たない

3-1 は `surface="fuda"` を「結果の画像」を指す値として `ShareSurface` で説明するとし、3-5 は irodori の画像の保存を `surface` 無しで送るとしている。同じ「結果の画像の保存」が、診断では `surface="fuda"`、irodori では無しになり、`surface` で結果の画像の保存を数えると irodori が漏れる。irodori にも `"fuda"` を渡すか、渡さないなら、`ShareSurface` の説明を「診断・クイズの結果の画像」に限る理由を書く。

### Minor-4 T6-10 の「Chromium のタブのスクリーンショット」は撮れない

Playwright の Chromium（ヘッドレス）のスクリーンショットはページの中だけで、タブとブラウザの枠を写さない。このままでは builder が条件を満たせない。代わりに、`icon.svg` を `prefers-color-scheme` の light と dark で（`emulateMedia`）16px と 32px に描き、ライトとダークのタブの地の色の上に並べて撮る形にする。実際のタブでの見え方は T9（または T12）で人の目で確かめる、と書く。

### Minor-5 irodori の `GameContainer.tsx` が 4章の頭の表に無い

4章の頭は irodori の `share.ts` を「T5 と並行してよい」とするが、T6-9 は `GameContainer.tsx` の保存の行も触る。T5 はゲームのページの罫線と結果の組み方（t5-inventory.md 6-c・`FinalResult.tsx`）を直しうる。`GameContainer.tsx` を表に加え、T5 のゲームの面のタスクとは並行させないと書く。

---

## PM への指示

1. planner に t6-design.md を直させる（Major-1・Major-2、Minor-1〜5）。
2. 直したら、もう一度レビューに出す。そのときは、この指摘の直り方だけでなく、設計の全体を見直す。
