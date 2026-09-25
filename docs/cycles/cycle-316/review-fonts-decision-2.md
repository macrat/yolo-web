# レビュー（2回目）: Web フォントの配り方と表示の速さの条件（fonts-decision.md）

レビュー日: 2026-09-25
対象: [fonts-decision.md](./fonts-decision.md)、[index.md](./index.md)（T1a・T1 の行、「表示の速さ」、「A の代償」）、[options.md](./options.md)（66行目、「`DESIGN.md` を変えるとき」）、`.claude/skills/frontend-design/SKILL.md`「値を変えるときの手順」
出典: `git show 487e5fc:docs/cycles/cycle-316/t1a-fonts.md`、[facts-speed-before.md](./facts-speed-before.md)、`src/lib/fonts.ts`、`src/app/globals.css`、`DESIGN.md` §1・§3・§4・§12、`node_modules/next`（16.3.0）の next/font の実装

## 結論: 改善指示

判断の方向は、来訪者にとって釣り合っている。本文を BIZ UDPGothic で配ると、転送量は 1.4〜2.7 倍になる。PV の78%が集まるプレイ面では +527.9KiB 増える。一方で `DESIGN.md` §1 は、本文には読みやすさだけを求め、個性は罫線・見出し・コントロールに担わせている。いまの本文も端末のゴシックで組んでいるので、来訪者にとっては後退にならない。専用の配信の仕組みを作らない理由も妥当である。前回の指摘（Major 4件・Minor 8件）は、options.md 66行目の1点を除いて反映されていた。

ただし、決めた配り方をそのまま実装すると、前回の Major 1（和文の約物が欧文の字形で組まれる）が別の経路から再び起きる（Major 1）。また、本文を端末のゴシックにしても `DESIGN.md` §4 の約物の規定は変えないとしているが、この規定は端末のゴシックでは主要なブラウザの一部でしか満たせない（Major 2）。

## Major

### 1. `next/font/local` が自動で足す代わりの書体（Arial）は `unicode-range` を持たないので、和文の約物を Arial で組む

- `next/font/local` は、既定（`adjustFontFallback` を指定しないとき）で、`src: local("Arial")` とメトリクスの上書きを持つ代わりの書体の `@font-face` を自動で生成する。そして `variable` の値を `'<Plex>', '<Plex> Fallback'` の並びにする（`node_modules/next/dist/esm/build/webpack/loaders/next-font-loader/postcss-next-font.js`、`.../@next/font/dist/local/get-fallback-metrics-from-font-file.js` で確かめた）。
- `declarations` で指定した `unicode-range` が付くのは、Plex 本体の `@font-face` だけである（`.../@next/font/dist/local/loader.js`）。代わりの書体の `@font-face` には `unicode-range` が付かない。
- そのため本文も見出しも、書体の並びは「Plex（`U+0000-007F` だけ）→ Plex の代わりの書体（Arial。範囲の制限なし）→ Zen Antique ／ 端末のゴシック」になる。Plex を読み込んだあとも、`—`（U+2014）・`…`（U+2026）・`“”`・`×`・アクセント付きラテンは、Arial を持つ端末（Windows・macOS・iOS）では Arial で組まれる。**「——」「……」がベースラインに乗った欧文の字形になるのは、前回の Major 1 と同じ害である。** `DESIGN.md` §3（範囲の外の字は和文の書体が組む）と §4（三点リーダは「……」）に反する。見出しでは Zen Antique より前に Arial が来るので、見出しの約物も Arial になる。
- fonts-decision.md は、`next/font/local`＋`declarations` の `unicode-range` で §3 の範囲を守れると書いているが、この経路が抜けている。**代わりの書体をどう扱うかを決め、表の「配り方」に書くこと。** たとえば、`adjustFontFallback: false` にしたうえで、代わりの書体の `@font-face` を `unicode-range: U+0000-007F` 付きで自分で置く（`size-adjust` などの値は next/font が計算する値と同じでよい）。こうすれば、frontend-design スキル「実装の技術」の `size-adjust` の要件と両立する。専用の配信の仕組みは要らない。

### 2. `DESIGN.md` §4 の「連続約物のアキ調整」を残すなら、端末のゴシックでは Safari と Firefox で満たせない

- fonts-decision.md は、捨てるものに「BIZ UDPGothic の、約物が詰まる組み（§3）」を挙げている。一方で「§4 は変えない」とも書いている。§4 には「**約物**: 連続約物のアキ調整」がある。BIZ UDPGothic はプロポーショナルな書体で、約物そのものの幅が詰まっているので、どのブラウザでもこの規定を満たせた。
- 端末のゴシックの約物は全角の幅を持つ。「。」」「）、」のような連続約物のアキを CSS で詰める `text-spacing-trim` を実装しているのは Blink（Chrome・Edge）だけで、Gecko と WebKit は実装していない（MDN）。Blink でも、書体が `halt` か `chws` の機能を持つときだけ効く。ヒラギノ角ゴ・游ゴシック・Noto Sans JP は `halt` を持つので、Chrome では既定の `normal` で詰まる。しかし iOS の Safari では詰まらない。iOS では、どのブラウザも WebKit で表示する。
- つまり「§4 は変えない」と「約物が詰まる組みは得られない」は、互いに食い違っている。T1 の builder はこの規定を満たす手段を持たない。**次のどちらかに決めて、fonts-decision.md の「`DESIGN.md` の変更」と「捨てるもの」に書くこと。** (a) §4 を「対応するブラウザで連続約物のアキを詰める」のように、実装できる形に改める。この場合、options.md「`DESIGN.md` を変えるとき」の手順（来訪者が失うものを示す）に沿う。(b) §4 を残すなら、Safari で満たす手段を示す。(b) の手段が約物ごとのマークアップのような専用の仕組みになるなら、(a) を採るのが来訪者にとって釣り合う。この害は判断を覆すほど大きくないと考える。ただし、捨てるものとして正直に書くこと。

## Minor

1. **「端末のゴシック（ヒラギノ角ゴ・游ゴシック・Noto Sans JP）は、どれも画面で読むために作られた書体」は事実と合わない。** ヒラギノ角ゴは、大日本スクリーンの依頼で字游工房が作った DTP 用の書体として 1994 年に出た。游ゴシック体も、もとは字游工房の印刷向けの書体である。「画面で読むために作られた」と言えるのは、Noto Sans JP（源ノ角ゴシック）の一部の性格だけである。この文は `DESIGN.md` §3 の理由（「画面で読むための書体が端末に備わっていて」）に書き写す予定になっているので、正典に誤りが入る。「端末に標準で入っていて、広く本文に使われている読みやすいゴシック」のような、確かめられる表現にすること。
2. **"Yu Gothic Medium" で 700 を指定すると、Windows で合成太字になるという報告がある。** いまの `--font-gothic` の並びは `"Yu Gothic Medium"` を名指ししている。このファミリー名で `font-weight: 700` を指定すると、Yu Gothic Bold ではなく Medium を太らせた合成太字になるという報告がある（[Neo's World](https://neos21.net/blog/2019/01/05-02.html)。2019年の Chrome での報告で、いまのブラウザでの再現は確かめていない）。fonts-decision.md は §4 を変えないとしているので、§4 の「和文も欧文もウェイト 700 を持つ（合成太字を作らない）」が残る。**T1 で並びを `DESIGN.md` に書き写すとき、各 OS で 700 が本物の太字になることを確かめる**と、fonts-decision.md の「`DESIGN.md` の変更」に一言添えること。
3. **options.md 66行目の最初の文が、決定と食い違ったまま残っている**（前回 Major 2 の1点目が未対応）。「和文2書体（BIZ UDPGothic は…、Zen Antique は…）を読み込むことになる」と、断定の形で書かれている。段落の末尾で決定に触れているが、先頭の断定と矛盾する。「`DESIGN.md` のとおりなら和文2書体を読み込むことになる」のように、決定の前の見積もりであることが分かる形にすること。
4. **index.md の T1a に、レビューが通る前にチェックが入っている**（`- [x] T1a`）。このレビューは改善指示なので、T1a はまだ完了していない（AP-WF23）。承認されるまでは `[ ]` に戻すこと。
5. **公開リポジトリに Plex のファイルを置くときのライセンス。** リポジトリ（github.com/macrat/yolo-web）は公開されている。IBM Plex Sans の OFL には「Reserved Font Name "Plex"」がある（google/fonts の `ofl/ibmplexsans/OFL.txt` で確かめた）。OFL は、再配布するときに著作権表示とライセンスを添えることを条件にしている。表の「配り方」に、**Google の配信ファイルを手を加えずに置き、OFL.txt を同じ場所に添える**と書くこと。サブセットし直したり名前を変えたりしないことも書くこと。これは、専用の仕組みを作らないという方針とも合っている。

## 確かめたこと

- 表の5ページの値（変更前・3書体とも `next/font/google`・差）、変更前の値が facts より 3.8〜6.5KiB 小さいこと、BIZ UDPGothic の各124分割と1ファイル平均約 23KB、A2 の +6〜+85KiB（7ページ・計算値・変更前の全ページで実際に読まれたファイルの集合と一致）、フォントの CSS が gzip で約 4KB 減ること、Zen Antique の1字あたり平均約 355B は、いずれも 487e5fc の t1a-fonts.md と一致した。
- 倍率を計算し直すと 1.37〜2.68 倍で、「1.4〜2.7 倍」は正しい。527.9÷200≒2.6秒も正しい。
- PV の78%（`/play/character-personality` の 78.08%。cycle-315 の facts-ga.md）、83.7%、LCP の5回の幅 722〜1,980ms（facts-speed-before.md）は、出典と一致した。
- Next.js 16.3.0 の `font-data.json` に、Zen Antique（400）と IBM Plex Sans（400・700・variable）がある。`next/font/local` の `declarations` で `unicode-range` を指定できる（禁止されているのは `src`・`font-display`・`font-weight`・`font-style` だけ）。
- `src/lib/fonts.ts` は Noto Serif JP 600 と Zilla Slab 500 を `next/font/google` で配っている。`src/app/globals.css` の `--font-gothic` は `"Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Noto Sans JP", sans-serif` である。どちらも fonts-decision.md の記述と一致した。
- index.md の「表示の速さ」（転送量・LCP・CLS の条件）は、fonts-decision.md と文言まで一致した。増分0・境界のページ・t1a-closure.md への参照は、index・options・スキルから除かれていた。
- frontend-design スキル「値を変えるときの手順」は、決定（`next/font` で配り、自前の切り出しを作らない）と合っていた。
- 前回の Minor 1〜8 は、すべて反映されていた。

## 参考

- [text-spacing-trim - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-spacing-trim)
- [Introducing four new international features in CSS - Chrome for Developers](https://developer.chrome.com/blog/css-i18n-features)
- [ウェブサイトに適用する游ゴシックフォントを見直しまくった最終解 - Neo's World](https://neos21.net/blog/2019/01/05-02.html)
- [ヒラギノフォント（Adobe Fonts パートナー紹介）](https://blog.adobe.com/jp/publish/2023/05/25/cc-design-adobefonts-partner-14-screen-ga)
- [游書体 - Wikipedia](https://ja.wikipedia.org/wiki/%E6%B8%B8%E6%9B%B8%E4%BD%93)
