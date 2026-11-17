# レビュー: T1 の土台（色・組版・線）と見出しの書体の当て方

レビュー日: 2026-09-25
対象: `git show 9fca564`（DESIGN.md の色・組版・線をサイト全体の基礎に入れる）、`git show 952b709`（見出しの書体を見出しにだけ当て、Zen Antique に無い字の見出しを本文の書体で組む）
根拠: `DESIGN.md` §2〜§6、[fonts-decision.md](./fonts-decision.md)、`.claude/skills/frontend-design/SKILL.md`、[index.md](./index.md) の T1〜T5 の分担と完了の条件、[review-t1-fonts.md](./review-t1-fonts.md)

## 結論

**改善指示**（Blocker 0・Major 5・Minor 7）

§2 の6色は light・dark とも `DESIGN.md` の値のとおりで、§4 の本文・補助情報・入力欄・見出しの5段と画面幅ごとの割り当ても表のとおりに入っている。ルートの文字サイズは固定されておらず、ブラウザの既定を 32px にすると本文は 34px、見出しの段と `rem` の閾値も一緒に動く（B-632 は土台の側では満たされた）。Zen Antique に無い字を含むデータの見出しは、見出し全体が本文の書体に切り替わり、字の表はクライアントのバンドルに入っていない。

一方で、`--accent` を墨に向けたことで、朱の色だけでリンクと分かっていた箇所が本文と見分けられなくなり、その痕跡も画面から消えた。T1 が足した組版のトークンは、このサイクルの完了の条件と食い違う。四字熟語の詳細では、952b709 が1行の中で書体を混ぜた。書き換えた行のコメントに、もう画面に無い「朱」が18行残っている。前回のレビューが求めた記録も、まだ cycle-316 の文書に無い。

## 確かめたこと

952b709 を `npm run build` して `next start` で配り、Playwright（Chromium）で確かめた。比べるために、変更前の 885c924 を `git worktree` で取り出して同じようにビルドし、並べて見た。

| 観点                           | 結果                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §2 の6色（light・dark）        | `--paper`・`--paper-2`・`--ink`・`--ink-2`・`--rule`・`--rule-2` の値は `DESIGN.md` の表と一致する。`--rule` は両モードで `var(--ink)`。`:root.dark` の中で `--ink` が変わるので、同じ要素で解決される `--rule` もダークの墨になる。`color-scheme` も light・dark で切り替わる                                                                                                                                                           |
| §2 の hex（Satori 用）         | `utsuwaHex.ts` の `#fcfcfc`・`#0b0b0b`・`#525252`・`#868686` を oklch から計算し直して一致を確かめた（`wairoHex.test.ts` も通る）                                                                                                                                                                                                                                                                                                        |
| §4 の組版                      | 本文 `1.0625rem`・行間 `1.85`、補助情報 `0.875rem`、入力欄 `max(1.0625rem, 16px)`、見出しは行間 `1.25`・ウェイト 400・5段（1.0625／1.49／2.08／2.92／4.08rem）。`45rem`・`64rem` の閾値で主見出し・セクションの見出し・小見出しの段がそろって下がる。表のとおり                                                                                                                                                                          |
| B-632                          | `html`・`body` から `font-size: 16px` が消えた。CDP の `Page.setFontSizes` で既定を 32px にすると、トップ・`/blog/sql-cheatsheet`・`/tools/char-count` で本文 34px、ブログの h1 は 66.56px（1280px の画面は 32px の既定では `45rem`＝1440px 未満なので主見出しは 2.08rem）。どのページも横にはみ出さない                                                                                                                                 |
| §5 の線                        | `--rule-w: 3px`・`--rule-w-hair: 1px`。`pre` は太い線のボックス、表は外枠なしで細い線の区切り、`hr` は細い線                                                                                                                                                                                                                                                                                                                             |
| §6 のリンクの基礎              | `:where(a)` は墨・細い線の下線、`:where(a:visited)` は `--ink-2`。詳細度0なので部品のクラスが上書きできる                                                                                                                                                                                                                                                                                                                                |
| §3 見出しの書体                | h1〜h6 は `--font-heading`。並びは Plex → Plex の代わり → Zen Antique → `--font-ja-heading-fallback`（BIZ UDGothic・ヒラギノ角ゴ・Yu Gothic Medium・Noto Sans JP）。`palt` は `src/` から消えた。4つの書体はどれも `palt` を掛けなければ仮名が全角で、§3 の書き換えと合う                                                                                                                                                                |
| §3 Zen Antique に無い字        | `/dictionary/kanji/𠮟`（h1 と大字）・`/dictionary/kanji/radical/辵`・`/dictionary/colors/sohi`（纁）で `data-heading-font="fallback"` が付き、`font-family` から Zen Antique が外れる。スクリーンショットでも見出しの中で書体が混ざっていない。`/dictionary/kanji/山` には付かない                                                                                                                                                       |
| 見出しになるデータ             | 試験が照らす出どころのほかに、ブログのタグ（37件。タグ一覧の h1 に出る）を字の表と照らし、無い字は0件だった                                                                                                                                                                                                                                                                                                                              |
| 字の表とクライアントのバンドル | ビルドの `.next/static` に、表の `source` の URL も範囲の並びも現れない。表はサーバーのチャンク（`.next/server/chunks/ssr/`）にだけある。`ColorDetail`（`"use client"`）は型だけを読み込み、判定はサーバーのページで行う                                                                                                                                                                                                                 |
| 幅 375px・1280px × light・dark | トップ・`/play/character-personality`・`/tools/char-count`・`/dictionary/kanji/山`・`/blog/sql-cheatsheet`・`/dictionary/kanji/𠮟`・`/dictionary/kanji/radical/辵`・`/dictionary/colors/sohi` の32枚を撮った。ダークのクラスが付いていることも確かめた。T1 が原因の読めない・崩れた箇所は、下の Major-1・Major-3 のほかに無い。`/blog/sql-cheatsheet` の 375px で表が 16px はみ出して切れるのは、変更前の 885c924 でも同じ（申し送りへ） |
| 試験・静的検査                 | `npm run typecheck` が通る。`vitest run src/lib/__tests__ src/dictionary src/__tests__/middleware-gone-slugs.test.ts` は 27ファイル・526件が通る。`globals.css`・`DESIGN.md` は prettier に適合する                                                                                                                                                                                                                                      |

## 指摘

### Major-1: 朱の色だけでリンク・現在地を示していた箇所が、本文と見分けられなくなった

`--accent: var(--ink)` にしたことで、変更前に「朱・下線なし」でリンクと分かった要素が、本文と同じ墨・下線なしになった。変更前（885c924）と変更後を、同じページで比べた。

| ページ                        | 変更前は朱・下線なしで、いまは本文と同じ墨・下線なしのリンク                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `/play/character-personality` | パンくずの「ホーム」「遊ぶ」、「守護キャラ診断を受ける」「音楽性格診断を受ける」、おすすめの行 |
| `/tools/char-count`           | パンくず、関連ツールの行、関連記事の行                                                         |
| `/dictionary/kanji/山`        | パンくず                                                                                       |
| `/blog/sql-cheatsheet`        | 分類「ツールガイド」                                                                           |

計画は「朱で示していた操作は、§6 の下線・反転・形で示し直す」と定め（AP-P28）、その作業は T2 にある。PM の前提のとおり、別名が残っていること自体は T1 の欠陥として扱わない。問題は、**朱が消えたことで、どこが色だけで操作を示していたかが画面から読み取れなくなった**ことである。T2 以降のスクリーンショットの確認では、これらは「ただの文字」に見え、見落とされる。

直し方: T2 に入る前に、`--accent`・`--accent-weak`・`--rule-strong` を参照している宣言のうち、それが操作・現在地・hover の唯一の手がかりになっている箇所（例: `color: var(--accent)` と `text-decoration: none` の組、`aria-current` の着色、hover の座布団）を `src/` から洗い出して一覧にし、T2 の完了の条件として cycle-316 の文書に残す。一覧は変更前のコードから作れる。

### Major-2: T1 が足した組版のトークンが、このサイクルの完了の条件と食い違う

[index.md](./index.md) の「機械で確かめる」は、「`src/` で UI のトークンとして定義する CSS 変数は、`DESIGN.md` に名のあるもの（§2 の6色・§5 の `--rule-w`・`--rule-w-hair`・`--max-width`・`--measure`）と、§3 の4書体の役割を表す書体の変数だけ」と定めている。9fca564 は、`DESIGN.md` に名の無い次の変数を新しく定義した。

- `--text-body`・`--text-small`・`--text-input`・`--text-step-1`〜`--text-step-5`・`--text-heading-main`・`--text-heading-section`・`--text-heading-sub`
- `--leading-body`・`--leading-heading`
- `--box-padding`

このままでは T8 の検査で落ちる。T2〜T5 の部品と面は、これから土台のトークンを参照して作られるので、いま決めないと、後で数十のファイルを書き直すことになる。

直し方: どちらかを選び、判断を cycle-316 の文書に残してレビューを受ける。(a) 組版の値を1か所で持つ得（§4 の段と画面幅の割り当てを部品が再現しなくて済む）を理由に、完了の条件の許す変数に §4・§5 の値を加える（計画の変更なので planner）。(b) 条件を守り、見出しの大きさなどは要素の規則とメディアクエリの中に値として書き、部品には変数を渡さない。どちらでも、`DESIGN.md` に無いトークンを部品が使い始める前に決める。

### Major-3: 四字熟語の「構成漢字」で、1行の中の字の書体が混ざった

952b709 は `YojiDetail.module.css` の `.kanjiLink`（漢字辞典にある字のリンク）を本文の書体にし、同じ行に並ぶ `.kanjiChar`（辞典に無い字）を見出しの書体のまま残した。`/dictionary/yoji/切磋琢磨` の 375px では、「切」「磨」がゴシック、「磋」「琢」がアンティーク体で並ぶ（`.kanjiChar` は `--ink-2` でもある）。辞典に無い字を含む四字熟語は 400件中89件あり、そのすべてで同じ行に2つの書体が並ぶ。字の違いが書体の違いに見え、壊れて見える。`.kanjiChar` は見出しでもなく、Zen Antique にある字かも判定されていない。

直し方: `.kanjiChar` を `.kanjiLink` と同じ本文の書体にする。字形を見せるためにアンティーク体で組むかは、T4 が大字と一緒に判定する（その場合も行の中で揃える）。

### Major-4: 書き換えた行と土台のファイルに、事実と合わない説明が残っている

前回の Major-4（「明朝」のコメント）と同じ種類で、今回の2つのコミットが新しく書いた行にも起きている。9fca564 で UI から朱が消えたあとに、952b709 が「明朝」を「見出しの書体」「本文の書体」へ書き換えた行のうち18行が、同じ文の中で「朱」を残している。

- 「hover で朱＋下線」「現在地は朱」: `FacetIndex/index.tsx`・`FacetIndex.module.css`・`dictionary/humor/page.tsx`・`dictionary/humor/[slug]/page.module.css`・`dictionary/kanji/page.module.css`・`RelatedTools.module.css`・`RecommendedContent.module.css`・`RelatedContentCard.module.css`・`PlayRecommendBlock.module.css`・`KanjiDetail.module.css`・`YojiDetail.module.css`
- 「ドット（"."）のみ朱」「現在地は朱」: `Header.module.css`
- 「朱一色（`--accent`）」: `In/index.tsx`・`In.module.css`
- 「hover 朱-weak 座布団」: `QuestionCard.module.css`

ほかに、次も事実と合わない。

- `src/app/globals.css` の和色の注記: 「器は紙・墨・朱のまま」、`DESIGN.md` に無い節「§2『成果物パレット（中身の色・唯一の例外）』」「§8-1 ゲート」「DESIGN §2 の実測手法」、計測日「2026-07-12」。完了の条件の「書き換えたファイルに `DESIGN.md` に無い節番号の参照が0件」にも当たる。和色をどう扱うかは T4 で決まるが、注記の誤りはいま直せる
- `src/app/about/page.tsx`: 952b709 が書き換えた行が「16px/1.9 の本文を --measure 幅（約42rem）に」と書く。本文はいま 17px・行間 1.85
- `src/lib/ogp-image.tsx`: 「朱の識別マーク」「素の朱（ACCENT）の明朝 y」。9fca564 が `ACCENT` を墨にしたので、画像の y はもう墨で描かれる

直し方: 今回書き換えた行からは「朱」を消し、色でなく役割（リンク・現在地）で書く。部品の見た目が T2 で決まるまで書けないことは書かない。`globals.css` の和色の注記は、事実だけに削る。`about/page.tsx` と `ogp-image.tsx` の該当行も直す。

### Major-5: 前回のレビューが求めた記録が、cycle-316 の文書に無い

[review-t1-fonts.md](./review-t1-fonts.md) は次を cycle-316 の文書に残すよう求めた。コードは直ったが、記録はどの文書にも無い（`grep` で確かめた）。

- **来訪者の入力を見出しとして描く面の洗い出し**の結果（前回の Major-2。[fonts-decision.md](./fonts-decision.md)「T1 で確かめること」の項目でもある）
- **見出しの代わりの書体の見比べ**: iOS・macOS・Windows の書体で、Zen Antique の読み込みの前後の見出しの矩形を比べた結果（前回の Major-3）。T9 に割り当てた4項目にも入っていない
- **Plex の Bold を preload する判断**（前回の Minor-1）。`fonts.ts` のコメントに「強調と表の見出しで本文に広く出る」とあるが、使われ方を測った記録が無い
- **書体の更新で字の表がずれないか**の扱い（前回の Minor-4 の最後の項目）。`next/font/google` はビルドのたびに最新版を取り、表は `v14` の時点のもの

直し方: 各項目に、確かめた結果か、扱うタスクと完了の条件を cycle-316 の文書に書く。見出しの代わりの書体の見比べは、T9 の項目に加えるのでもよい。

### Minor-1: コンテナの幅のトークンが §5 と違うのに、注記は §5 を名乗っている

`globals.css` は `--measure: 42rem`・`--max-width: 960px` を「§5 余白と間隔（8px の倍数）・幅」の下に置く。§5 は `--max-width` を `60rem`、`--measure` を `40rem` と定めている。`960px` はブラウザの既定を大きくしても広がらない（B-632）。§5 の間隔の 96 も無い。コンテナは T1 の残りの作業に入っているはずなので、そこで §5 の値にする。それまで §5 を名乗る注記は外すか、値を先に直す。

### Minor-2: `text-spacing-trim: normal` は初期値で、宣言しても何も変わらない

`text-spacing-trim` の初期値は `normal` で、継承もされる（MDN）。`body` に書いても挙動は変わらず、注記の「連続約物のアキを詰める」は、この宣言が詰めているように読める。宣言を消すか、既定の挙動を確かめるための宣言であることが分かる形にする。

### Minor-3: 表の外枠を消す選択子が、`caption`・`colgroup` のある表で効かない

`:where(table > :first-child > tr:first-child > *)` は、表の最初の子が `thead`・`tbody` のときだけ効く。`caption` か `colgroup` が先に来ると、先頭の行の上に細い線が残り、§5「表は外枠を持たない」に反する。いまのブログの表はマークダウンから作られ `caption` を持たないが、土台の規則なので、どの表でも効く形にする。

### Minor-4: `button` の文字サイズが継承されない

`input`・`select`・`textarea` には `--text-input` を当て、`button` には `font-family: inherit` だけを当てている。部品が大きさを決めていないボタンは、ブラウザの既定（既定のルートで 13.33px）になり、§4 の補助情報の下限 14px を割る。いまは字を持たないアイコンのボタン（テーマ切替・メニュー）だけなので、見える害は無い。§5 はラベルを本文の大きさで組むと定めているので、`button` も `font-size: inherit` にしておく。

### Minor-5: GFM Alert と `hr` に、`DESIGN.md` に無い見た目を新しく書いた

9fca564 は `.markdown-alert` を「`--paper-2` の地・細い線の囲み・注意の種別だけ左に太い線」に書き換えた。§2 は `--paper-2` をコードのボックスの背景と定め、§6 は細い線で囲まれたもの（色見本・入力欄・候補でないもの）を hover と読むと定めている。左だけの太い線も §5 に無い形である。ブログの42記事が Alert を使っている。`hr` の細い線も、§5 の線の使い場所に無い。

どちらもブログ本文の中身として T4 が扱う面なので、T1 で作り直す必要はない。ただ、T1 が書いた見た目が `DESIGN.md` どおりだと受け取られないよう、T4 への申し送りとして cycle-316 の文書に残す（AP-I08）。

### Minor-6: 字の表をバンドルに入れない試験が、取りこぼしうる

`zen-antique-charset.test.ts` の試験は、`/^["']use client["']/`（フラグ無しなのでファイルの先頭だけ）に当たるファイルが判定を値として読み込んでいないかを見る。`CharacterPersonalityContent.tsx`・`MusicPersonalityContent.tsx` のように、`"use client"` の前にコメントを置いたクライアントのファイルはこの正規表現に当たらない。サーバーのつもりのコンポーネントをクライアントのコンポーネントが読み込んだ場合も捕まえられない。いまのビルドでは表はクライアントに入っていない（上の確認）。試験は、ビルドの `.next/static` に表の範囲が現れないことを見る形か、`"use client"` を先頭のコメントを飛ばして探す形にする。

### Minor-7: T1 のレビューの記録が index.md のレビュー結果の表に無い

[review-t1-design.md](./review-t1-design.md)・[review-t1-fonts.md](./review-t1-fonts.md) と、このレビューの行が「レビュー結果」の表に無い。T1a までと同じ形で加える。

## 作業の進め方の指摘

- 前回のレビューの記録の依頼が、コードの修正だけで閉じられている（Major-5）。レビューの指摘への対応は、指摘が求めたものすべてで完了とする（AP-WF01）。
- 952b709 は、見出しの書体の当て分けと、`DESIGN.md` §3 の変更と、410 のページの書体の並びと、T4 の申し送りを1つのコミットにまとめている。今回は変更の筋が1本なので指摘にしないが、`DESIGN.md` の変更は、その判断の根拠（なぜ BIZ UDGothic の並びか）を cycle-316 の文書にも残す（Major-5 の記録と一緒でよい）。

## 申し送り（今回の対象外）

- **B-641（T4）**: `/blog/sql-cheatsheet` の 375px で、3列の表（「DB」「構文」「新しい値の参照」）が画面の右へ 16px はみ出し、`html` の `overflow-x: clip` で右端の列の字が切れて読めない。変更前の 885c924 でも同じ。T4 で表をボックスに入れて横に送るときに、この表を境界の値に含める。
- 部品ごとの見出しの大きさはまだ `DESIGN.md` と違う（例: 診断の結果面の h1 が 16px、`/tools/char-count` の h1 が 1280px で 25px）。前提のとおり T5 の範囲。
- `/dictionary/kanji/radical/辵` の件数（「51字を収録しています。」）は 13px で、§4 の補助情報の下限 14px を下回る（部品の CSS が決めている大きさ）。T3・T5 で §4 の下限を確かめる。
