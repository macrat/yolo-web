# T6-2 のレビュー（2巡目。`1fa63d1` 行の折り方と案 b、`86823f9`、`106e161` のブログの `twitter-image.tsx` の削除）

## 判定: 改善指示

来訪者に見えるものは、直すべき所まで直っています。空白と閉じ括弧の直後で折れるようになり、画面の見出しと同じ所で折れる。「Git」だけの行は無くなり、長い題の段も上がった（69字は 48px から 72px、67字は 48px から 56px）。案 b で組み直したので、記事ごとの代替テキストが `og:image:alt` と `twitter:image:alt` の両方に出ている。画像はビルドで86枚書き出され、書体を取れないとビルドが止まる。

ただ、記録と設計が実装に追いついていません。t6-log.md は1回目のままで、いまは事実と合わない（案 c と書いている）。builder の逸脱（ページが画像を渡す形）も t6-design.md に入っておらず、このあとのタスクが実装できない指示を読むことになる。ほかに、共有する描き方に小さな直しが2つあります。

## 前回の指摘の確かめ

| 指摘                          | 結果                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Major-1 折り方                | **直った。** `lineBreakUnits` が、文節の切れ目・空白の後ろ（ダッシュの前と、行の頭に置かない約物の前を除く）・閉じ括弧の直後で分ける。段を選ぶ `everyUnitFits` も同じ単位で測る。`git-command-cheatsheet` の単位は `["Git","コマンド ","早見表 — ","用途別の","コマンド一覧"]`。PNG は「Gitコマンド 早見表 —」／「用途別のコマンド一覧」の2行で、画面の h1（Chromium、1280px）の1行目「Gitコマンド 早見表 —」と同じ所で折れる。375px の h1 は「Gitコマンド ／早見表 — ／用途別の／コマンド一覧」で、PNG の折れはどれもこの折り所のどれかに当たる。長い題の段と行は、下の「PNG を見たこと」の表のとおり |
| Major-2 案 b                  | **直った。** `opengraph-image/route.tsx` が `dynamic = "force-static"`・`dynamicParams = false`・`revalidate = false`・`generateStaticParams` を持つ。`shareOpenGraphImage` が同じ `ShareImageContent` から `url`・`width`・`height`・`alt` を作り、`generateMetadata` と JSON-LD の両方がそれを使う。`?v=` は `ShareImageContent` と枠の寸法のモジュールの値を、キーの名前の順に並べた JSON の sha256 の頭16字。別のプロセスで計算し直しても、ビルドの HTML と同じ値（`8c45d134982c98dd`）になった。配信で確かめたことは下の「ビルドと配信」                                                          |
| Minor-1 35字の名前            | **テストは直った**（`longestTypeName` を guardian-charger の35字にし、30字の鉤括弧の名前は `typeNameWithBrackets` として残した）。**t6-log.md の表の「30字」は直っていない**（Major-1）                                                                                                                                                                                                                                                                                                                                                                                                                |
| Minor-2 足りないテスト        | **直った。** 段の選び方のテストがある（`unitLimitedTitle`。実際の記事 `dark-mode-toggle` の題）。ブログの86本の題で、名前が3行以内・枠の縦に収まる・副題を切らないことを確かめるテストもある                                                                                                                                                                                                                                                                                                                                                                                                           |
| Minor-3 `setup.ts` のコメント | **直った。** `beforeEach` の `if (typeof window === "undefined") return;` のすぐ上に置き直した                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## builder の逸脱の評価

| 逸脱                                                                                                                                                                                       | 評価                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateBlogPostMetadata` が、でき上がった画像（`ShareOpenGraphImage`）を引数で受け取り、`page.tsx` の `generateMetadata` が `shareOpenGraphImage(…, blogShareImageContent(post))` を渡す | **受け入れる。** `src/lib/seo.ts` は `Breadcrumb` を通して `"use client"` の `src/app/storybook/StorybookContent.tsx` から読まれる。`server-only` と `node:crypto` を持つ `share-image.tsx` の値を `seo.ts` から読むとクライアントのバンドルに入るので、型だけを読む形は正しい。ただし設計に入っていない（Major-2） |
| ブログの `ShareImageContent` を作る関数を `src/blog/_lib/share-image-content.ts` に置く                                                                                                    | **受け入れる。** 面の中身は面のディレクトリに置くのが自然で、`share-image` からは型だけを読むので、どこからでも import できる                                                                                                                                                                                       |

## 指摘

### Major-1: t6-log.md が1回目のままで、いまの実装と合わない

`1fa63d1` は t6-log.md を変えていない。いまの T6-2 の節は次のとおりで、実装と合わない。

- 「そのため案 c（動的なルートは画像の種類を言う文…）にした。画像の URL は `/opengraph-image` のまま」とある。いまは案 b で、代替テキストは記事ごとの画像の字、URL は `?v=` 付き。
- 表の「診断のタイプ名の最長（30字）」が残っている（前回の Minor-1）。
- 「69字のブログの題 48px 2行」は、直す前の組み。いまは 72px の3行。

t6-design.md の T6-2 の完了の条件（「t6-log.md の代替テキストの段落が、b にした判断と確かめた事実になっている」）と、前回の Major-1・Major-2・Minor-1 の直すことのうち記録の分が、どれもできていない。この記録は、T6-3 以降のタスクとレビューが読む事実の元になる。誤りのまま残すと、後のタスクに広がる。

直すこと（builder）:

- T6-2 の代替テキストの段落を、b にした判断と確かめた事実に書き直す: a が成り立たない理由、b の形（Route Handler の設定・`openGraph.images`・`?v=` の作り方）、ビルドの `.body` が86枚、`og:image`・`twitter:image`・JSON-LD の `image` が同じ URL で 200・PNG・`.body` とバイト単位で同じ、`og:image:alt` と `twitter:image:alt` が記事ごとの画像の字、無い記事の画像が 404、書体の取得先を壊すとビルドが止まる（b の Route Handler で `Error occurred prerendering page "/blog/…/opengraph-image"`、exit 1）。
- 逸脱2つ（ページが画像を渡す形とその理由、中身の関数の置き場所）を書く。
- 表を直す（35字の名前の段と行、69字の題の 72px・3行、足した試しの入力）。長い題（69・67・63・63字）の段が上がったことを、直す前と後の段で書く（前回の Major-1 の直すことの4つ目）。

### Major-2: builder の逸脱が t6-design.md に入っておらず、後のタスクの指示が実装できない

t6-design.md 3-2 の「b の組み方」は、「画像の Route Handler と、ページの `generateMetadata`（`src/lib/seo.ts` の `generate*Metadata`・`src/play/seo.ts`・結果と索引の `page.tsx`）の両方がそれを呼ぶ」としている。同じ章の「試しのルートのディレクトリの中身」の表は、ブログの `page.tsx` について「`generateMetadata` は触らない（画像は `generateBlogPostMetadata` の中で渡す）」としている。4章の T6-2 の行も同じ形で書いている。

実装はこれと違い、それには理由がある（逸脱の評価のとおり）。そして同じ理由は、ブログのほかにも当てはまる。

- `src/lib/seo.ts` は、`Breadcrumb` を通して `"use client"` の `StorybookContent.tsx` から読まれる。T6-3 以降が `generateKanjiPageMetadata`・`generateYojiPageMetadata`・`generateColorPageMetadata` などの中で `share-image` の関数を呼ぶと、同じ壁に当たる。
- `src/play/seo.ts` も、`src/play/games/shared/_lib/crossCategoryItems.ts` を通して、ゲームの `"use client"` の部品（`irodori`・`kanji-kanaru`・`nakamawake`・`yoji-kimeru` の `GameContainer.tsx` と、`kanji-kanaru`・`yoji-kimeru` の `GameResult.tsx`）から読まれる。3-2 の「プレイ面の3ページ」がいう「`generatePlayMetadata` は、診断・クイズのページにだけ `openGraph.images` を渡す」も、`play/seo.ts` の中で `share-image` を呼ぶ形では組めない。

どちらの形でも、画像は各面の `page.tsx`（または `server-only` の側）で作って渡すことになる。そうなると、T6 の各タスクが触る `page.tsx` が増え、4章の頭の受け持ちの表（T5 のタスクと並行させない組）が変わりうる。

直すこと（planner）:

- 3-2 の「b の組み方」「試しのルートのディレクトリの中身」「プレイ面の3ページ」と、4章の T6-2 の行を、実装した形に書き直す。画像はサーバーの側（`generateMetadata` を持つ `page.tsx`）で作り、`seo.ts`・`play/seo.ts` の関数には型だけで受け取らせる。`seo.ts` と `play/seo.ts` がクライアントから読まれることは、事実として書く。
- T6-3 以降の行で、`generateMetadata` を持つ `page.tsx` を触ることになるタスクを洗い出し、受け持ちの表と T5 のタスクとの順を見直す。
- ツギハギにしない。後から足した注記にせず、初めからこの形だったように書く。

### Minor-1: 空白の後ろで折るとき、丸括弧の一続きの中でも折れる

`splitAtInnerBreaks` は、丸括弧の中の空白の後ろでも単位を分ける。スクラッチのテストで確かめた:

- `lineBreakUnits("テキストとBase64の相互変換 (UTF-8 対応)")` → `[…,"相互変換 ","(UTF-8 ","対応)"]`
- `lineBreakUnits("AIエージェントの思考バイアスとコンテキストエンジニアリング（コンセプト再策定記 1/3）")` → `[…,"（コンセプト再策定記 ","1/3）"]`

§4 は「丸括弧で囲んだ一続きの中では折らない。一続きが1行に収まらないときだけ、その中で折る」とし、§10 は画像の「どの字も §4 の見出しの折り方で折る」としている。`splitIntoPhrases` は丸括弧の中に文節の切れ目を置かないが、画像の単位はそこを割る。いまのブログの86枚の PNG には丸括弧の中の折れは無い（全部の題の組みを出して数えた）。ただ、行の終わりがたまたま合えば、「（コンセプト再策定記」／「1/3）」のように読み仮名や添えた数が割れる。T6-3 以降で道具の副題（「(UTF-8 対応)」は T6-2 の試しの入力にもある）や伝統色の読みがこの関数を通るので、共有の描き方を作ったこのタスクで直す。

直すこと（builder）:

- 空白の後ろの折り所から、丸括弧の中を除く。数え方は `phrase-breaks.ts` の丸括弧の深さの数え方にそろえる（いま `share-image.tsx` は `CLOSING_BRACKET` を `phrase-breaks.ts` と同じ字で書き写している。同じ規則の定義を2か所に持たないよう、`phrase-breaks.ts` から出して使うことも考える）。1行に収まらない一続きは、いまの `breakUnits` の割り方のままでよい。
- テスト: 上の2つの文で、単位が丸括弧の中で割れないこと。名前のテストの `screenBreaks` も、丸括弧の中の空白を折り所から除く。

### Minor-2: 同じモジュールを2度 import している

`share-image.tsx` は `@/lib/share-image-frame` を、名前を並べた import（29〜59行）と `import * as frame`（60行）の2度読んでいる。ハッシュに使う値を `Object.entries(frame)` で集めるためだが、同じモジュールの import が2つ並ぶと、読む人がどちらを使えばよいか迷う。1つにまとめる（`frame.X` で読むか、名前の import だけにしてハッシュの値も名前で並べるか。後者は、値を足したときにハッシュへの入れ忘れが起きうるので、前者か、`share-image-frame.ts` の側で値をまとめた1つのオブジェクトを出す形がよい）。

## PNG を見たこと

ビルドの `.body` を縮めて並べて見た（長い題6本は幅 700px、短い題と中くらいの題の6本は幅 400px）。

| 記事                                                    | 字数   | 段・行（直す前 → 直した後）                                                           | 見て                                                                                                                  |
| ------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `git-command-cheatsheet`                                | 24     | 72px・3行（「Git」だけの行）→ 2行、「Gitコマンド 早見表 —」／「用途別のコマンド一覧」 | 語が割れず、一目で読める。ダッシュは1本の線で、前の語に付いている                                                     |
| `nextjs-global-not-found-for-multiple-root-layouts`     | 69     | 48px・2行 → 72px・3行                                                                 | 「Next.js複数root layoutで」／「not-found.tsx が効かない --」／「global-not-found.js での解決」。空白でだけ折れている |
| `nextjs-seo-metadata-and-json-ld-security`              | 67     | 48px・3行 → 56px・3行                                                                 | 幅で決まった段（64px では4行になる）                                                                                  |
| `scroll-lock-reference-counter-for-multiple-components` | 63     | 64px・3行                                                                             | 「scroll」／「lock」が空白で割れるが、画面の h1 も同じ所で折れうる（§4 どおり）                                       |
| `admonition-gfm-alert-support`                          | 63     | 56px・3行                                                                             | 「…（補足ボックス）」／「を実装する：…」。閉じ括弧の直後の折れで、画面の h1 も 1280px で同じ所で折れた                |
| `content-trust-levels`                                  | 52     | 56px・3行                                                                             | 「verified/curated/generated」は割れない                                                                              |
| 短い題2本・中くらいの題4本                              | 21〜52 | 56〜72px                                                                              | 400px でも名前・補助情報・サイト名が読める。罫線の十字の端、上下の切り取りの帯も崩れていない                          |

全86本の組みもスクラッチのテストで出した。どれも3行以内で、丸括弧の中で折れたものは無かった。

## ビルドと配信

HEAD（`f53a3fd`。`1fa63d1` の後は review-knowledge-docs-3.md だけ）を `git archive` でスクラッチの `r62b-src` に書き出し、`node_modules` を `cp -al` で置いて、共有の作業ツリーの外でビルドした。

- `npm run build` は exit 0（3分37秒）。`.next/server/app/blog/*/opengraph-image.body` は86枚（計 5.4 MB）。ブログの `twitter-image` は0枚。
- `next start -p 3962` で配信し、86本の記事ページすべてで確かめた: `og:image` の meta が1つ。`og:image` と `twitter:image` と JSON-LD の `image` が同じ URL（`?v=` 付き）。`og:image:alt` と `twitter:image:alt` が同じ文で、記事ごとに「yolos.net ブログ {題} {カテゴリ}」（画像に書いた字の順）。`og:image` の URL が 200・`image/png` を返し、`.body` とバイト単位で同じ。失敗0件。`twitter:card` は `summary_large_image`、`og:image:width`/`height` は 1200/630。
- 無い記事の画像（`/blog/no-such-post/opengraph-image`、`?v=` 付きも）は 404。下書きの記事（`url-rewrite-as-demand-signal`）は、ページも画像も 404。`?v=` を違う値にしても同じ PNG を返す。
- 画像の `cache-control` は `public, max-age=0, must-revalidate` で、規約のファイルのままのルート（`/opengraph-image`・`/tools/char-count/opengraph-image`）と同じ。規約のファイルからの変更で配信の仕方は変わっていない。
- `share-image.tsx` の Google Fonts の CSS の URL を壊してビルドすると、`Error occurred prerendering page "/blog/…/opengraph-image"` で exit 1 になった（確かめたあと元に戻した）。
- 配信は止めた（`npm exec next start`・`sh -c next start`・`next-server` の3つとも）。
- 同じ export で、関係する3ファイルのテスト（`share-image.test.tsx`・`seo.test.ts`・`src/app/blog/[slug]`）386本が通った。変えたファイルの eslint・prettier、`tsc --noEmit` も通った。
- 記録として: 1回目のビルドは、ほかのタスクのビルドが3つ並んでディスクが一杯になり、途中で止まった（ENOSPC）。そのときブログの画像8枚が「took more than 60 seconds」で1回ずつ取り直されていた。2回目はメモリ不足で止まった（SIGKILL）。どちらも環境が原因で、ほかのビルドが減ってからの3回目では取り直しは0件だった。ディスクを空けるため、数時間前に終わったタスクのスクラッチの `.next`（`r5d-tree`・`r5d2-tree`・`t5d-tree`・`wt`・`tree`）を消した。どれも、使っているプロセスが無いことを確かめてから消した。

## 範囲の外で見つけたこと（PM が振り分ける）

画面の見出しは、ハイフンの後ろでも折れる。語が1行に収まる幅でも、語の中で折れている。Chromium で配信した記事の h1 の行を数えた:

- 1280px: `nextjs-global-not-found-for-multiple-root-layouts`「layoutで not-」／「found.tsx が」、「効かない -- global-」／「not-found.js での解決」。`admonition-gfm-alert-support`「を実装する：marked-」／「alert の導入から」。`nextjs-seo-metadata-and-json-ld-security`「Twitter Card・JSON-」／「LDセキュリティまで」。
- 375px でも同じ種類の折れがある。

ブラウザはハイフンの後ろを折り所にする（`word-break: keep-all` でも止まらない）。§4「語の中で折れるのは、語が1行に入らないときだけ」に反する。画像はハイフンで折らないので、ここでは画像の側が §4 どおりで、画面の側がずれている。T6-2 の直しの対象ではない。見出しの組み（`PhrasedText`・`phrase-dashes.ts`）の受け持ちのタスクか、バックログに振り分けてほしい。ハイフンの後ろに語結合子を置くなどの直し方が考えられる。t4-design.md 1092行は「 -- 」の2つのハイフンのあいだの折れだけを扱っている。

## 良かった所（直さなくてよい）

- 画像と代替テキストと URL が、1つの `blogShareImageContent(post)` から作られるので、食い違いようが無い。題は h1 と同じ `post.title`。
- `stableJson` は `undefined` のキーを落とし、キーの順に依らない。テスト（版はキーの順に依らず、中身を変えたときだけ変わる）もある。
- `fillLines` は行の頭の空白を落とす。閉じ括弧の直後の空白が単位として1つだけ残る場合（「鴇（とき） 色」）も、行の頭に空白は出ない（名前の長さを変えて30通り描いて確かめた）。

## 次に進めること

1. planner が t6-design.md を直す（Major-2）。直した設計もレビューを受ける。
2. builder が Major-1（t6-log.md）・Minor-1・Minor-2 を直す。
3. もう一度レビューを受ける。前回の指摘だけでなく、全体を見直す。
4. 範囲の外で見つけた画面の見出しのハイフンの折れを、PM が振り分ける。
