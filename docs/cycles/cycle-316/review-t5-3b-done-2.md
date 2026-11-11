# T5-3b 完了のレビュー（全体・第2回）

対象: T5-3b の全体（PART 1 011ec106〜3c2726e2、PART 2 80223ce3、PART 3 e78a5d7a）と、第1回の指摘への直し（作業ツリーにあってまだコミットしていないもの: `src/components/WordJoinerCopyFilter/`（部品と試験）、`src/app/layout.tsx` の配置、`src/lib/phrase-dashes.ts` の説明と `WORD_JOINER` の書き出し、`docs/knowledge/clipboard-and-copy.md`、`frontend-design` スキルの「実装の技術」の折り所の作り方の 5、index.md の T5-3b の記録）。照らしたもの: t5-design.md の T5-3b の行（内容と完了の条件）、index.md の決定 (6)・(7) と記録、review-t5-3b-done-1.md、CLAUDE.md（ツギハギ禁止はスキルと文書にも及ぶ）、`docs/anti-patterns/implementation.md`・`workflow.md`。作業ツリーにある T5-15・T5-5b の書きかけ（DESIGN.md・ブログの目次・`analytics.ts`・`ResultExtraLoader`）は見ていない。

## 判定: 改善指示

第1回の指摘 2・3 は直っていて、見出しの h1 と `Wi-Fi`・`URL-safe` などの名前からコピーした文に語結合子はもう入らない（下の「確かめたこと」）。ただ、コピーの受け手が組み直す text/html と text/plain が、ブラウザが自分で組むものより悪くなる所がある（指摘 1）。語結合子を含む選択はどれもこの受け手を通るので、来訪者が記事の頭を選んでメールや文書に貼ると、リンクが壊れ、隠れた要素や写さないはずの区切りが入る。

## 指摘

### 1. （中）受け手が組む text/html と text/plain が、ブラウザのコピーより崩れる

`removeWordJoinersFromCopy` は、text/html を `Range.cloneContents()` を並べた `innerHTML` から、text/plain を `Selection.toString()` から作る。どちらも、ブラウザがコピーのときに行う直しを通らない。書き出したビルド（HEAD に T5-3b の直しを重ねたもの）を Chromium で開き、記事 `nextjs-global-not-found-for-multiple-root-layouts` で次の2つを選んで Ctrl+C し、受け手があるときと、受け手を止めたとき（`window` の捕まえる段で `stopImmediatePropagation`）を比べた。

- **リンクが相対の URL のまま写る。** h1 から最初のリンクのある段落までを選ぶと、受け手の text/html の `href` は `/blog/category/dev-notes`・`/blog/nextjs-static-tool-pages-design-pattern`・`#まとめ` のような相対のままだった。ブラウザのコピーは `http://localhost:3417/blog/...` のように絶対の URL にする。相対の URL はメール・Google ドキュメント・Notion などに貼ると、貼った先の場所で解かれて行き先を失う（`navigator.clipboard.read()` で読み戻すと、`href=""` と `about:blank#…` になった）。記事の題と書き出しを引用して人に送るのはよくある使い方で、そのときにリンクだけが壊れる。
- **見えない要素と `<script>` が写る。** ページ全体（Ctrl+A）を選ぶと、受け手の text/html には `<script>` が 8 個（JSON-LD とページの中の JS、65,617 字）入り、1280px では隠れている2つ目の「目次」の見出し（`TableOfContents` の h2）も入った。ブラウザのコピーは、どちらも入れない（`<script>` 0、「目次」1）。書式を読む貼り先は CSS を知らないので、隠れた要素がそのまま出る。
- **写さないように組んだ字が写る。** パンくずの区切りの「/」（`Breadcrumb.module.css` の `user-select: none`）が、受け手の text/plain と text/html の両方に入った（ブラウザのコピーには入らない）。`Pagination` も同じ指定を持つ。`Selection.toString()` は `user-select: none` を見ない。

text/plain のほかの違いは、この「/」の3行と末尾の改行だけで、語結合子を除けばブラウザのコピーと同じだった。見出しだけを選んだとき（第1回の指摘の場面）の text/plain と text/html は、どちらも期待どおりである。

語結合子を含む選択が受け手を通る場面は、T5-16 で記事の本文の h2・h3 に同じ組み方が当たると、記事の中ほどを選ぶときにも広がる。直し方は builder に任せるが、たとえば次のどちらか。

- (a) 組み直しをブラウザに任せる: 選んだ範囲の複製から語結合子を除いたものを、画面の外の入れ物に入れて選び直し、ブラウザのコピーをそのまま走らせ（`preventDefault` しない）、すぐに元の選択に戻す（コピーに署名を足すときによく使われる組み方）。リンクの絶対化・見えない要素・`user-select: none`・折れない空白の扱いは、ブラウザが自分で行う。入れ物に置いた複製が、元の場所と同じクラスで隠れるか、画面の外に置いても選べるかを測って確かめる。
- (b) 複製を自分で直す: 複製の `href`・`src`（`srcset` があればそれも）を元の要素の絶対の URL にし、`script`・`style`・`noscript`・`template` と、元の要素が描かれていないもの・`user-select: none` のものを除く。text/plain も、その直した複製から作る（`Selection.toString()` はやめる）。

どちらでも、Chromium で「見出しだけ」「見出しから段落のリンクまで」「ページ全体」を選び、語結合子を除けばブラウザのコピーと同じ text/plain になり、text/html のリンクが絶対の URL で、`<script>`・隠れた要素・パンくずの「/」が無いことを測る（jsdom はブラウザのコピーの直しを持たないので、AP-I07 のとおり本番のビルドで測る）。試験にも、相対のリンクと `user-select: none` と隠れた要素の場面を足す。

### 2. （小）DESIGN.md に、来訪者から見た約束が無い

DESIGN.md §4 の折り方（ダッシュを前の語に付ける文）は、語結合子を置く組み方の来訪者から見た決まりを書いているが、そのために置く見えない字が写した文に入らないことは書いていない。§6 の数の区切りには「空きは字でないので、選んで写しても数字だけが写る」と、写した結果の約束がある。同じ形で、§4 のダッシュの文の近くに「折り方を組むために置いた見えない字は、選んで写した文に入らない」ことを書く。スキルと知見の文書だけでは、組み方を変えるとき（受け手を外す、ほかの見えない字を使う）に、DESIGN.md に照らして気付けない。DESIGN.md には T5-15・T5-5b の書きかけがあるので、コミットではこの行の変更だけを入れるよう、PM が builder に伝える。

### 3. （小）語結合子の出どころの書き方が1つに寄っている

`docs/knowledge/clipboard-and-copy.md` の 1 は、語結合子を「`joinDashes` がハイフンの後ろやダッシュのあいだに置く」ものとして書き、スキルも見出しの折り所の 5 の中でだけ受け手に触れる。実際には json-formatter の `keepTogether`（`src/tools/json-formatter/JsonFormatterTile.tsx`）も、誤りの文「（1行目、9文字目付近）」の字のあいだに語結合子を置いている。受け手はこれも除く（測った。受け手があると text/plain に語結合子は 0）ので来訪者は困らないが、文書には、語結合子を置く所が2つあることと、折らないために見えない字を置くときは U+2060 を使えば受け手が除く（ほかの見えない字は除かない）ことを書く。指摘 1 の直しで分かった、`Selection.toString()`・`cloneContents()` とブラウザのコピーの違い（相対の URL・隠れた要素・`user-select: none`）も、知見としてここに残す。

### 4. （小）試験の中の語結合子が見えない字のまま書かれている

`WordJoinerCopyFilter.test.tsx` の3か所（`"<h1>not-⁠found.tsx が<wbr>効かない</h1>"`・`"<p>a-⁠b</p>…"`・`"JSON-⁠LD"`）は U+2060 をそのまま書いていて、読む人には `not-found.tsx` と見分けがつかない。同じファイルの2つ目の試験と、`phrase-dashes.test.ts`・`PhrasedText.test.tsx` は `⁠` で書いているので、それにそろえる。入力欄の試験は `textarea` だけなので、`input` と `contenteditable` の場面も足す。

## 確かめたこと（問題なし）

**書き出しとビルド**: HEAD（958b9704）を scratchpad に `git archive` で書き出し、`node_modules` が無いのを確かめてから `cp -al` で置き、T5-3b の作業ツリーのファイル（`WordJoinerCopyFilter` の2つ・`layout.tsx`・`phrase-dashes.ts`・知見の文書・スキル・index.md）を重ねた。`layout.tsx` の差分は受け手の読み込みと配置の2行だけだった。`npm run build` が通り、vitest の全体（`--maxWorkers=2`）は 395 ファイル・6409 件が通った（1 ファイル・1 件は前から skip）。`tsc --noEmit` も通り、直したファイルの eslint と prettier も通った。

**コピー（受け手あり、Chromium）**:

- 見出しだけを選んだとき、語結合子は text/plain・text/html のどちらにも 0 個だった。記事 global-not-found の h1 は「Next.js複数root layoutで not-found.tsx が効かない -- global-not-found.js での解決」（受け手を止めると両方に 4 個残る）。site-search-feature の h1（「-⁠-」、止めると 1 個）、sns-optimization-guide の h1（「⁠─⁠─」、止めると 2 個）、`/dictionary/humor/wifi` の h1「Wi-Fi」（止めると 1 個）、base64 の「URL-safe形式で出力」、password-generator の「大文字 (A-Z)」も 0 個。text/plain の折れない空白は空白になり、text/html は `&nbsp;` と `<wbr>` を持つ。見出しだけのときの text/html は、ブラウザのコピーが付ける 65px の字の大きさなどの書式を持たず、題の字だけなので、貼り先で扱いやすい。
- 語結合子の無い選択（記事の最初の段落）は、受け手があってもなくてもクリップボードの中身が同じだった。
- json-formatter の入力欄に `{"a-⁠b": 1}` を入れて Ctrl+A・Ctrl+C すると、語結合子は残った（来訪者が入れた字をそのまま写す）。誤りの文を選んでコピーすると、語結合子は除かれた。

**決定 (6) の折れ（直しは描画に触れないので、測り直して同じことを確かめた）**: 記事 global-not-found の h1 は、320px の既定で「global-not-fou／nd.js」、375px の既定で「not-found.tsx が」が1行・「global-not-found.j／s」、375px・200% で「global-n／ot-found／.js」。index.md の決定 (6) の結果の判断の書き足しと同じ。200% のルートの字は 32px（プロファイルの `default_font_size: 32`）。

**数え方**（`npm run check:phrased-names`、出すだけの指定）: `src/` の全体は `.tsx` 332、字で渡すもの 114、値で渡すもの 56。index.md の記録は e78a5d7a の数（`.tsx` 331）で、差の1つは今回足した `WordJoinerCopyFilter/index.tsx`（名前と面を持たない）なので、ほかの数は同じ。この行が触ったファイル（index.md が挙げる9つのパス、`.tsx` 33）は、字で渡すもの 0、値で渡すもの 10 で、位置（`ShareButtons` 189:22・199:26、`PaginationButtons` 57:12、2本の `DifficultySelector` 26:16・29:16、2本の `GameContainer` 466:22・495:22、irodori の `GameContainer` 481:20、`FudaActions` 208:18・210:46）も index.md の記録と同じ。受け持ちの内訳（字で渡すもの 86＋19＋7＋2＝114、値で渡すもの 11＋23＋10＋5＋2＋2＋1＋1＋1＝56）も合う。

**第1回の指摘 2・3**: スキルの 5 は、ハイフンで結んだ語の組み方（語の中の1つの「-」の後ろに語結合子、数字の前と「--」には置かない、1行に入らないときは字の所で割れる）と、コピーで受け手が除くことを、ダッシュの組み方と1つの流れで書いていて、足した跡が残っていない。index.md には、数・値で渡すもの 10 の位置と状態と測った値・T5-18 に渡す道具の折れ・200% のルートの字・決定 (6) の 320px の既定の折れが書かれている。`phrase-dashes.ts` の説明も、コピーで受け手が除くことを書き、書き足した跡が無い。

**PART 1〜3 の全体**: 第1回で確かめたこと（`joinDashes` の正規表現、`share-labels.ts` と `guessLabel.ts` の並びと試験、`ListStatus`・遊び方・もう一度読み込むなどの区切り、`.remaining` の削除、スキルと型の突き合わせ）から、コードは変わっていない。

**作業の進め方**: 直しは受け持ちのファイルに収まっていて、ほかの作業者の書きかけのファイルに触れていない（`layout.tsx` の差分は受け手の2行だけ）。ただし、このレビューのあいだに、index.md の T5-3b の記録（決定 (6) の結果の判断の書き足し・数・値で渡すもの 10 の測り・T5-18 に渡す道具の折れ）が、T5-5b の記録のコミット f7179b8f（「T5-5b round-3 review record and T7 handoff」）に入った。中身はこのレビューで見たものと同じだが、T5-3b の記録が T5-5b の名前のコミットにあると、あとで T5-3b の経緯を追えない。PM は、作業ツリーのほかの作業者の変更をコミットに入れないよう（`git add` でファイル全体を足さず、自分の行だけを入れるよう）作業者に伝え、T5-3b の承認のコミットのメッセージで、記録が f7179b8f に入ったことに触れる。

## PM への依頼

1. 指摘 1〜4 を builder に直させる（指摘 1 は Chromium の本番ビルドで測らせる。指摘 2 の DESIGN.md は、この行の変更だけをコミットに入れさせる）。
2. 直したあと、もう一度レビューを頼む。そのときは、今回の指摘だけでなく全体も見直す。
