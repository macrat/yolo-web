# T5-23 レビュー 2巡目（410 の見出しの区切りと GA）

対象: コミット 27b375db「T5-23: 410 heading breaks at hand-written phrases with keep-all and strict; page loads GA」と eedaa254「T5-23: one GA snippet source shared by the GoogleAnalytics component and the 410 page」。T5-23 の変更の全体を見直した。
照らしたもの: [review-t5-23.md](./review-t5-23.md) の指摘 1・2、t5-design.md 1-b・10-2 の T5-23 の行・10-4、DESIGN.md §4、CLAUDE.md（ツギハギ禁止）、index.md の T10、`/privacy`

## 判定: 承認

## 確かめたこと

- `npx vitest run src/lib/__tests__/google-analytics.test.ts src/components/GoogleAnalytics src/__tests__/middleware-gone-slugs.test.ts`: 3ファイル 58件すべて通る。`npx tsc --noEmit`: エラーなし（終了コード 0）。ビルドは共有のツリーでは走らせていない。

### 指摘 1（GA の文を1つの出どころに）: 直っている

- `src/lib/google-analytics.ts` が `gaTrackingId`・`gtagLoaderSrc`・`gtagInitScript` を持ち、import は `RELEASE_ID` だけ。`server-only` も React も使っていない。
- `GoogleAnalytics`（`<Script src>` と `<Script id="google-analytics">` の中身）と `middleware.ts` の `analyticsTags()` の両方が同じ関数を使う。リポジトリの中で `googletagmanager` と `NEXT_PUBLIC_GA_TRACKING_ID` を書いているのはこのモジュールだけ。
- ID の包み方は `encodeURIComponent` に1つに決まり、両方の側に同じく効く。
- テストは、URL と初期化の文をモジュールの試験で1度だけ完全一致で確かめ（release は固定の値にしている）、`GoogleAnalytics` の試験と 410 の試験はその関数の出力がそのまま入ることを確かめる形になった。410 の側に文字列の写しは残っていない。どちらかの側で文を書き替えれば、その側の試験が落ちる。
- 本番のページでの `GoogleAnalytics` の振る舞い: `strategy="afterInteractive"`・`id="google-analytics"`・`consent default` の `analytics_storage:'granted'`・`config` の ID と `release`（ともに `JSON.stringify`）は変わっていない。変わったのはインラインの文の空白が詰まったことと、URL の ID が `encodeURIComponent` で包まれたこと（`G-` と英数字の ID では結果が同じ）で、来訪者と計測には差がない。ID を読む位置がモジュールの上端から関数の中へ移ったが、`NEXT_PUBLIC_` の値はビルドで埋め込まれるので、ID が無いときに何も出さない振る舞いも同じ。空の文字列を ID の無い状態として扱うのも以前と同じ（`!GA_TRACKING_ID` → `|| undefined`）。
- `analyticsTags()` のコメントは、同じモジュールの URL と初期化の文を使うことを言う形に書き直されている。モジュールのコメントも、2つの使い手と React・server-only に頼らない理由を今の状態として書いていて、経緯の痕は無い。
- `GoogleAnalytics` の試験は `process.env` の直接の書き換えから `vi.stubEnv`／`vi.unstubAllEnvs` に替わり、試験のあいだで環境が漏れない。
- 受け持ち: t5-design.md の T5-23 の行と 10-4 に `src/lib/google-analytics.ts`（新規）と `src/components/GoogleAnalytics/index.tsx` が書き足されている（ec1cfb41）。

### 指摘 2（テストの名前）: 直っている

「見出しは文節の中では1行に収まらないときだけ折り、行頭の禁則を厳しい側で組み、auto-phrase に頼らない」になり、§4 の言い方と宣言（`keep-all`・`overflow-wrap:anywhere`・`line-break:strict`）に合う。

### 全体の見直し

- 見出し: `GONE_PAGE_HEADING_PHRASES` を `<wbr>` でつなぎ、`<title>` も同じ定数から作る。手の区切りが `splitIntoPhrases` の結果と同じことはテストが実際に呼んで確かめる。h1 の宣言は `PhrasedText.module.css` と同じ。1巡目で見た数とスクリーンショットの結果（既定の 320・375・1280 で文節の中の折れ・1字だけの行・禁則の破れ・はみ出しが 0、200% の 320・375 の文節の中の折れは6字の文節が1行に入らないためで §4 の受け入れの範囲）から、今回の直しは見出しに触れていないので変わらない。
- GA とプライバシー: 410 の同意の既定はほかのページと同じで、`/privacy` の記述（サイト全体で GA、アナリティクス用の Cookie は既定で有効）と食い違わない。下端から `/privacy` へ行ける。
- 計測の読み: 410 の `page_view` が出荷の日から新しく出ることは、index.md の T10 に書き足されている（題か `DELETED_BLOG_SLUGS` のパスを除く）。
- ツギハギ: 変更したソースとテストに、経緯・前の形を指す注記は残っていない。

## PM への連絡（判定には含めない）

- t5-design.md の T5-23 の行に「GA の読み込みを足す 。」と、句点の前に余分な空白がある。PM の cycle ドキュメントの字の乱れなので、次にこのファイルを触るときに直してください。
