# レビュー: T1 の Web フォントの配り方（コミット 885c924）

レビュー日: 2026-09-25
対象: `git show 885c924`（Web フォントを Zen Antique と IBM Plex Sans に替え、書体の変数を役割で付け直す）
根拠: [fonts-decision.md](./fonts-decision.md)「決めたこと」「T1 で確かめること」、`DESIGN.md` §3・§4（df4bf9a）、`.claude/skills/frontend-design/SKILL.md`

## 結論

**改善指示**（Blocker 0・Major 4・Minor 4。ほかに作業の進め方の指摘1）

配り方そのもの（書体・`display`・preload・自動の代わりの書体・Plex の範囲・本文の並び・見出しの並び）は、決定の表のとおりで、ビルドの出力でもそうなっている。Plex のファイルと OFL は IBM の配布物とバイト単位で一致する。一方で、書体の変数の付け替えが旧い変数からの機械的な置き換えにとどまり、見出しでないボタンや一覧の名前が見出しの書体で組まれている。§3 の「Zen Antique に無い字を含む見出しは和文を丸ごと本文の書体で組む」も、判定の関数を足しただけで画面には効いておらず、実際に1つの見出しの中で書体が混ざっている。

## 確かめたこと

作業ツリーに別の作業の未コミットの変更（35ファイルの `font-weight` の削除）があったので、`git worktree` で 885c924 だけを取り出し、そこで `npm run build`・`vitest run`・`next start` を行った。

| 観点                                                                          | 結果                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Zen Antique: `swap`・preload なし・自動の代わりの書体なし                     | 合っている。CSS の `@font-face` は `font-display:swap` の122面、`Zen Antique Fallback` は0件、変数は `--font-zen-antique:"Zen Antique"` だけ。HTML に Zen Antique の preload は無い                                                                    |
| IBM Plex Sans: `next/font/local`・`U+0000-007F`・範囲付きの自作の代わりの書体 | 合っている。2面とも `unicode-range:U+0-7F`、`IBM Plex Sans Fallback` も `unicode-range:U+0-7F`。代わりの書体の値（101.13%・101.35%・27.19%・0%）は、Next.js の `getFallbackMetricsFromFontFile` に Regular のファイルを渡して得た値と一致する          |
| Plex の範囲が効いているか                                                     | 効いている。Chrome の `CSS.getPlatformFontsForNode` で、`/blog/sql-cheatsheet` の h1「SQL 早見表 — SELECT…」は Plex 23字・Zen Antique 13字で、「—」（U+2014）は Zen Antique が組んでいる。本文の段落の和文は端末の書体、ASCII は Plex                  |
| 本文の和文の並び                                                              | `"BIZ UDPGothic", "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Noto Sans JP", sans-serif`。決定・`DESIGN.md` §3 と一致                                                                                                                            |
| 見出しの並び                                                                  | `var(--font-plex-sans), "IBM Plex Sans Fallback", var(--font-zen-antique), var(--font-ja-body)`。決定の順と一致                                                                                                                                        |
| 数字                                                                          | 旧 `--font-number` はすべて `--font-body` に置き換わり、数字は Plex で組まれる。Plex の数字は既定で送り幅が揃っている（0〜9 がすべて 600）ので `tnum` が効かなくても桁は揃う。壊れは見当たらない                                                       |
| 取りこぼし                                                                    | `--font-mincho`・`--font-gothic`・`--font-number`・Noto Serif JP・Zilla Slab は `src/` に残っていない（OGP・札の画像の生成器の `minchoFamily`・`gothicFamily` は T6 の範囲なので除く）                                                                 |
| 字の表の再実行                                                                | `npm run generate:zen-antique-charset` を再実行して、差分0（7,786字・4,285範囲）。取得に使う User-Agent は `next/font/google` の `fetch-resource.js` と同じ                                                                                            |
| 試験・静的検査                                                                | `vitest run` 324ファイル・5,559件が通る。変更したファイルに eslint・prettier の違反は無い                                                                                                                                                              |
| ライセンス                                                                    | `IBMPlexSans-{Regular,Bold}-Latin1.woff2` の SHA-256 は IBM/plex の `packages/plex-sans/fonts/split/woff2/` と一致。`OFL.txt` は同じパッケージの `LICENSE.txt` と一致（Reserved Font Name "Plex" の記載を含む）。`@ibm/plex-sans` は依存に入っていない |
| 知識の記録（`docs/knowledge/nextjs.md` §13）                                  | 正しい。`fallback: []` を外して `next build --experimental-build-mode=compile` すると、`Zen Antique Fallback`（`local(Times New Roman)`）が生成され、変数にも入った                                                                                    |
| 転送量                                                                        | Playwright で読んだ Web フォントの合計は、プレイ面 255KiB（変更前 232KiB）、ツール 314KiB（同 270KiB）、ブログ記事 342KiB（同 278KiB）。測り方が変更前（Lighthouse の転送量）と違うので目安だが、決定の見込み（+85KiB 以内）に収まる                   |

## 指摘

### Major-1: 見出しでないボタン・一覧の名前・リンクに `--font-heading` が当たっている

旧い変数を1対1で置き換えた（`--font-mincho` → `--font-heading`、`--font-gothic`・`--font-number` → `--font-body`）ので、旧デザインで明朝にしていた見出しでない要素が、そのまま Zen Antique で組まれている。`DESIGN.md` §3 は Zen Antique を「見出しの和文」の書体と定め、§7 は一覧の行の名前を見出しとしていない。cycle-316 の計画が禁じる「トークンの別名で旧値を新値に付け替えて済ませない」（AP-P28）にも当たる。

見出しでないのに `--font-heading` のもの:

- **ボタン**: 診断の結果面10本の `.tryButton`（`src/app/play/*/result/[resultId]/page.module.css`）、`QuizContainer.module.css` の `.startButton`
- **一覧の行の名前・リンク**: `Shinagaki` `.name`、`RelatedTools` `.name`、`RelatedBlogPosts` `.postTitle`、`RecommendedContent` `.name`、`RelatedContentCard` `.name`、`DictionaryEntryList` `.name`、`FacetIndex` `.link`、`dictionary/kanji/page.module.css` `.facetLink`、`dictionary/humor/page.module.css` `.word`、`dictionary/humor/[slug]` `.relatedWord`、`YojiDetail` `.kanjiLink`・`.relatedLink`、`KanjiDetail` `.relatedLink`、`PlayRecommendBlock` `.title`、`blog/[slug]` `.navTitle`、`SeriesNav` `.quickNavTitle`、`app/page.module.css` `.heroLink`
- **字形や結果が主題のもの**（T4 で「中身か装飾か」を判定する対象）: `KanjiDetail` `.character`、`YojiDetail` `.character`・`.kanjiChar`、`KanjiKanaru`・`YojiKimeru` の `.resultAnswer`、`Tsutsumi` `.product`・`.symbol`・`.typeName`、`In` `.char`

来訪者への害は、見た目より転送量に出る。一覧の名前が見出しの書体だと、名前の字の数だけ Zen Antique の分割ファイルを読む。部首「辵」の一覧（`/dictionary/kanji/radical/辵`）は、Web フォントを84ファイル・約1.9MB 読んだ（見出しは「部首「辵」の漢字」の1つだけ）。Lighthouse のモバイルの既定の回線で約10秒にあたる。

直し方: ボタンと一覧の名前・リンクは `--font-body` にする。字形や結果が主題のものは、T4 で判定するまでの扱いを決め、その一覧を cycle-316 の文書に T4 への申し送りとして残す（黙って `--font-heading` のまま残さない）。直したあと、部首の一覧・漢字の詳細・トップの転送量を測り直す。

### Major-2: §3 の「Zen Antique に無い字を含む見出しは、和文を丸ごと本文の書体で組む」が画面に効いていない

`canSetInZenAntique`・`charsMissingFromZenAntique` は、試験のほかどこからも呼ばれていない。判定の形（文字列を受けて真偽を返し、ASCII を Plex の範囲として除く）は §3 を支えられるが、画面ではいまも1つの見出しの中で和文の書体が混ざる。

- `/dictionary/kanji/𠮟` の h1「漢字「𠮟」」は、Zen Antique 4字と端末のゴシック1字（`getPlatformFontsForNode` で確認。スクリーンショットでも「漢字「」」だけがアンティーク体）。大きな見出し字 `.character` も同じ。剝・塡・頰も同じ
- `/dictionary/kanji/radical/辵` の h1「部首「辵」の漢字」も混ざる。彐・黃・疒も同じで、部首の索引（`FacetIndex`）は漢字の詳細の全ページに出る
- 伝統色「纁」（`/dictionary/colors/sohi`）の名前
- 漢字カナールの答え（`joyo-kanji-set.ts` に 𠮟剝塡頰 を含む）

試験も、決定が求める範囲（ビルドの時に決まる見出し。コードに書かれた見出しと、データから描く見出し）を覆っていない。いまは漢字辞典の `character` だけを照らしていて、上の部首4字と「纁」は試験に現れない。`src/` 全体を字の表と照らすと、見出しになりうるデータで無い字は 𠮟剝塡頰（漢字）・彐辵黃疒（部首）・纁（色名）だった。

直し方: データから描く見出しで判定を使い、組めないときは見出し全体を本文の書体に切り替える。試験は、漢字・部首・色名・四字熟語・ユーモア辞典の語・ブログの題と見出し・診断とツールの名前など、見出しになるデータ全体を照らす形にする。絵文字のように和文でない字を「無い字」に数えるかも決めて書く（いまは数えるので、絵文字を含む見出しは丸ごと本文の書体になる）。字の表の JSON（約4,300行）は、クライアントのコンポーネントから読むとバンドルに入るので、判定はサーバー側で行う（AP-I03）。決定の「来訪者の入力を見出しとして描く面の洗い出し」も、結果を cycle-316 の文書に残す。

### Major-3: 見出しの読み込みのあいだの代わりの書体が決まっておらず、読み込みの前後で見出しの折り返しが変わりうる

決定の「T1 で確かめること」は、見出しの代わりの書体を「仮名が全角で `palt` を掛けない」ものにすると決めている。実装では、Zen Antique の読み込み中は `--font-ja-body`（BIZ UDPGothic・ヒラギノ角ゴ）に落ち、h1〜h6 には `font-feature-settings: "palt"` が掛かっている。BIZ UDPGothic は仮名がプロポーショナル、ヒラギノは `palt` で詰まる。Zen Antique の仮名はほぼ全角（送り幅 996）で `palt` を持たないので、差し替わると見出しの幅が広がり、折り返しが1行増えうる。Zen Antique は preload しないので、初めての来訪ではほぼ必ず差し替えが起きる。ブログ記事では LCP の要素が見出しである（[facts-speed-before.md](./facts-speed-before.md)）。

このレビューの Linux の環境（WenQuanYi Zen Hei）では、Zen Antique を止めた状態と読んだ状態で見出しの矩形は変わらなかった。ただしこの環境の書体は仮名が全角なので、ヒラギノや BIZ UDPGothic での差は現れない。決定も「主要な OS の書体で見比べる」としている。

直し方: 見出しの並びの Zen Antique の後ろに置く代わりの書体を決め、`palt` が代わりの書体に掛からないようにする。iOS・macOS・Windows の書体で、読み込みの前後の見出しの矩形を比べた結果を残す。

### Major-4: 見出しの書体を「明朝」と書いたコメントが108行残っている

変数は `--font-heading` になったが、`src/` の56ファイル・108行のコメントが、見出しの書体を「明朝」と書いている（例: `Header.module.css`「店号: サイト名・明朝（§4）」、`Shinagaki.module.css`「品名…明朝で組む」、辞典の各ページの「サイズ・明朝・詰めは globals.css の見出し基層が与える」、`In/index.tsx`「印の一文字（明朝で組む）」）。コードと食い違うコメントは、次に触る人に誤った前提を渡す。CLAUDE.md のツギハギ禁止に当たる。

直し方: 見出しの書体を指すコメントは、書体名でなく役割（見出しの書体）で書き直す。Major-1 で役割を付け直すファイルと重なるので、同じ作業で直す。

### Minor-1: Plex の Bold を preload するかが決まっていない

決定は「Plex の Bold を preload するかを決める」を T1 に渡している。`fonts.ts` は `preload` を指定せず既定のままなので、全ページで Regular と Bold（20,984B・21,256B）が preload される。見出しのウェイトを 400 に揃える作業（いま進んでいる次のタスク）のあと、Bold の欧文を使うのは本文の太字などに限られ、多くのページで使わない Bold を LCP と同時に読むことになりうる。見出しのウェイトを決めたあとに、使われ方を見て決め、`preload` を明示し、判断を cycle-316 の文書に残す。

### Minor-2: 410 のページの書体の並びのコメントが中身と食い違う

`src/middleware.ts` のコメントは「この静的HTMLは Web フォントを読み込まないので、端末にある書体だけで組める並びにする」と書くが、`HEADING_STACK` は端末に無い `'Zen Antique'` で始まる。Zen Antique を手元に入れている人だけに効く指定で、コメントとも合わない。`'Zen Antique'` を外すか、外さないならその理由をコメントに正しく書く。試験（`h1{font-family:'Zen Antique',`）もあわせて直す。

### Minor-3: `globals.css` のコメントに事実と合わない箇所と過去の経緯が残っている

- 「`--font-zen-antique` と `--font-plex-sans` は layout.tsx が next/font で `<html>` に置く」とあるが、`global-not-found.js` も置いている。
- このコミットで書き換えたファイルの冒頭のコメントに「cycle-279 C1 で (legacy)/ 一式・old-globals.css を削除し…」、`:root` の色のコメントに「旧値の青紫…フェーズ R で朱へ再定義済み（旧 --accent-strong/--accent-soft の別名は cycle-279 C1 で…廃止）」と、経緯と cycle 番号が残っている。以前のサイクルからあるものだが、CLAUDE.md は見つけたときに直すと定めている。色のトークンを §2 に合わせる T1 の作業で書き換えるなら、そのときに消す。

### Minor-4: 「T1 で確かめること」の残りの項目の扱いが記録されていない

次の項目について、このコミットでも cycle-316 の文書でも、確かめた結果か、どのタスクで扱うかが書かれていない。

- 本文の並びの各書体の 700 が合成太字にならないか（とくに `"Yu Gothic Medium"`）
- 本文の並びの各書体が `halt`・`chws` を持ち、`text-spacing-trim` が効くか
- Arial の無い計測の環境で、Plex の代わりの書体が効かないことを踏まえた CLS の判定の仕方
- Plex と和文の書体が1行に混ざったときに、その行だけ高くならないか
- 書体の更新で字の表がずれないか（`next/font/google` はビルドのたびに Google の最新版を取るが、表は `v14` の時点のもの。ずれを知る仕組みが無い）

各項目に、結果か、扱うタスクを書く。

## 作業の進め方の指摘

### Workflow-1: このレビューの結論が出る前に、同じファイルを書き換える次の作業が始まっている

作業ツリーに、35ファイルの `font-weight` を削る未コミットの変更がある（`Footer.module.css`・`GameLayout.module.css`・`KanjiKanaru.module.css`・診断の結果面の CSS など）。これは Major-1・Major-4 の直しと同じファイルに触る。CLAUDE.md は、レビューの指摘に対応してから次に進むと定めており、同じファイルを触る作業は直列にすると cycle-316 の計画も定めている（AP-WF07）。先に 885c924 の直しとその再レビューを終えてから、次の作業を進める。進んでいる変更を捨てる必要はないが、どちらの作業が先に入るかを決め、直しがその上に正しく乗ることを確かめる。

## 申し送り（今回の対象外）

- 見出しは `font-weight: 600` のまま、Zen Antique はウェイト400の1本なので、スクリーンショットでは見出しの和文が合成太字で太って見える。`DESIGN.md` §3「見出しにウェイトの差を使わない」・§4「合成太字を作らない」に当たる。次のタスク（見出しの大きさ・ウェイト・字間の組み直し）で必ず解消すること。
- 自作の Plex の代わりの書体は `local("Arial")` の1面だけなので、読み込みのあいだの欧文の太字は Arial の合成太字になる。一時的な表示で、next/font の自動の代わりの書体も同じ形なので、指摘にはしない。
