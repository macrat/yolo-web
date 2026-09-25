# レビュー（4回目）: Web フォントの配り方と表示の速さの条件（fonts-decision.md）

レビュー日: 2026-09-25
対象: [fonts-decision.md](./fonts-decision.md)、[index.md](./index.md)（T1a・T1・T4 の行、「表示の速さ」、「A の代償」）、[options.md](./options.md)（66行目、「`DESIGN.md` を変えるとき」）、`.claude/skills/frontend-design/SKILL.md`「値を変えるときの手順」
出典: `git show 487e5fc:docs/cycles/cycle-316/t1a-fonts.md`、[facts-speed-before.md](./facts-speed-before.md)、[review-fonts-decision-3.md](./review-fonts-decision-3.md)、`src/lib/fonts.ts`、`src/app/globals.css`、`DESIGN.md` §1・§3・§4・§12、`node_modules/next`（16.3.0）の next/font の実装。加えて、`tmp/lh/before/*.json`（変更前の25回の Lighthouse）、`tmp/t1a/gf/zen/`（Google が配る Zen Antique の分割ファイル）、npm の `@ibm/plex-sans` 1.1.0 を直接調べた

## 結論: 改善指示

判断の方向は、来訪者にとって釣り合っている。本文を BIZ UDPGothic の Web フォントにすると、PV の78%が集まるプレイ面で +527.9KiB 増える。端末のゴシックにすれば、この増分を払わせずに済む。見出しの Zen Antique は §1 の仕掛けの1つなので残す。専用の配信の仕組みは作らない。この3点に同意する。前回の Major 2件・Minor 6件はすべて反映されていた。

ただし、「捨てるもの」の比べ方に抜けがある。BIZ UDPGothic は Windows に標準で入っていて、並びに加えれば転送量0で Windows の来訪者に届く。これを比べずに、BIZ UDPGothic の得を全部捨てたことになっている（Major 1）。また、書き換え後の §4「連続約物のアキを `text-spacing-trim` で詰める（実装しているブラウザで効き…）」は、見出しでは Chrome でも効かない。配る Zen Antique のファイルが、`text-spacing-trim` の効く条件を満たしていないからである（Major 2）。

## Major

### 1. BIZ UDPGothic が Windows に標準で入っていることを比べていない。転送量0で、§3 の本文の書体を Windows の来訪者に届けられる

- fonts-decision.md の「捨てるもの」は、「BIZ UDPGothic の、読みやすさのための字形の工夫は得られない」と書き、この損失を 460〜916KiB と比べている。
- しかし BIZ UDPGothic（Regular・Bold）は、Windows 10 October 2018 Update（1809）から Windows の標準の書体に入っている（モリサワの発表。下の参考）。本文の並びに `"BIZ UDPGothic"` を `"Yu Gothic Medium"` より前に置くだけで、Windows の来訪者には転送量0で `DESIGN.md` §3 が選んだ本文の書体が届く。これは配信の仕組みではなく、並びの順番の問題である。
- 並びに加えると、この文書が挙げているほかの2つの問題も Windows では消える。
  - **合成太字**: 文書は「Yu Gothic Medium に 700 を指定すると Windows で合成太字になる」を T1 で確かめるとしている。BIZ UDPGothic は Bold を持つので、§4「合成太字を作らない」を満たす。
  - **和欧混植の近似**: 文書は「游ゴシックは字面が小さい」ことを和欧混植が OS ごとの近似になる理由に挙げている。Windows で本文が BIZ UDPGothic になれば、Plex を合わせる相手が1つ減る。
- つまり今の比較は、「BIZ UDPGothic を Web フォントで配る」と「BIZ UDPGothic を一切使わない」の2つしか見ていない。3つ目の「端末に入っていれば使う」を見ていない。捨てるものを実際より大きく書いた比較になっている（AP-P02・AP-P17）。
- これで判断は覆らない。Web フォントで本文を配らない結論はそのままでよい。
- **直すこと**:
  - 「書体と配り方」の表と「捨てるもの」で、並びに BIZ UDPGothic を入れるかどうかを比べて決めること。入れるなら「`DESIGN.md` の変更」の §3 の書き方も合わせる（例:「端末のゴシック。Windows では BIZ UDPGothic」）。
  - 入れないなら、その理由を書くこと。
  - 来訪者の OS の内訳は GA で確かめられる（CLAUDE.md「Check Google Analytics」）。

### 2. 書き換え後の §4「`text-spacing-trim` で詰める」は、Zen Antique の見出しでは Chrome でも効かない

- MDN は、`text-spacing-trim` が効く条件を次のように書いている。「フォントが OpenType の `halt` か `chws`（または両方）を持つこと。どちらも無ければ `text-spacing-trim` は無効になる」。
- `next/font/google` が配るのは、Google の Zen Antique の分割ファイルである。`「」`（U+300C/300D）と `、。`（U+3001/3002）を含むファイル（`tmp/t1a/gf/zen/` の `.117`・`.119`）を fontTools で調べた。GSUB は `vert`・`vrt2`、GPOS は `kern` だけで、`halt`・`chws`・`palt` は無かった。ほかの面も GPOS は `kern`・`mark`・`mkmk` だけだった。
- そのため、見出しの連続約物（「」「」、」「など）は、Chrome でも全角のまま並ぶ。見出しは最大 `4.08rem` の、サイトで一番大きい字である。約物のアキが最も目立つのはここである。
- ところが fonts-decision.md は、§4 を「連続約物のアキを `text-spacing-trim` で詰める（実装しているブラウザで効き、ほかでは全角のまま組む）」と書き換えるとしている。これでは、書き換え後の `DESIGN.md` が見出しについて誤ったことを書く。「捨てるもの」も、約物が詰まらないのは「実装していないブラウザ」だけだとしていて、見出しを含めていない。
- **直すこと**:
  - §4 の書き換え案に、効く範囲を事実どおりに書くこと（例: 本文・UI は `text-spacing-trim` を実装したブラウザで詰まる。見出しの Zen Antique は `halt`・`chws` を持たないので全角のまま組む）。
  - 「捨てるもの」に、見出しの約物が詰まらないことを加えること。
  - 本文の端末のゴシックが `halt` か `chws` を持つかは、T1 で確かめる項目として書くこと（ヒラギノ・游ゴシック・Noto Sans CJK JP。Major 1 で入れるなら BIZ UDPGothic も）。

## Minor

1. **「変更前の値は facts-speed-before.md より 3.8〜6.5KiB 小さい」は、実際には 3.1〜6.6KiB である。** facts の値は丸めてあるので、`tmp/lh/before/*.json` の `total-byte-weight` の5回の中央値で計算した。プレイ面 557.98、結果面 548.59、ツール 492.91、辞典 1,435.13、ブログ 575.20KiB である。487e5fc の値との差は、3.08・4.89・4.01・6.63・4.00KiB になる。丸めた facts の値（558KiB）で計算しても、プレイ面の差は 3.1KiB で、3.8 にはならない。

2. **転送量の条件で比べる相手を「全ページで最大 +223KiB」にしているので、代表の5ページでは見込みから外れても気付けない。** +223KiB は、代表の5ページに入っていない漢字辞典の詳細（`/dictionary/kanji/撃` など）の値である。代表の辞典の詳細 `/dictionary/kanji/哀` の見込みは +85KiB で、出典の7ページの見込みは +6〜+85KiB である。たとえば PV の78%が集まるプレイ面で見込みの数倍の増分が出ても、+223KiB を越えなければ調べる条件に当たらない。見込みを大きく外れたら、それは決めたとおりに実装できていない兆しである。
   - **直すこと**: fonts-decision.md と index.md の条件を、各ページの見込み（同じ計算で求まる値）と比べる形にすること。計算は review-fonts-decision-3.md と同じ手元のデータで済み、新しい仕組みは要らない。

3. **§3 の最後の箇条「和文と欧文が切り替わっても、行の高さと字面が動かない」が、書き換えの一覧に入っていない。**
   - fonts-decision.md は §4 の和欧混植を「主要な OS の端末のゴシックに合わせる」（つまり OS ごとの近似）に改める。一方で §3 のこの箇条は「字面が動かない」のまま残る。このままでは、書き換えたあとの `DESIGN.md` が §3 と §4 で食い違う。
   - もう1つ、§4 の新しい書き方「主要な OS の端末のゴシックに合わせる」では、どの OS の書体に合わせるかが決まらない。Plex の大きさは1つしか決められないので、合わせられるのは1つの書体だけである（前回の Minor 2 で「どの書体に合わせるか」を決めるよう求めた点）。
   - **直すこと**: §3 のこの箇条を書き換えの一覧に加えること。合わせる書体を決めること。T1 で決めるなら、そう書くこと。

4. **frontend-design スキル「実装の技術」の1項目めが、この決定と食い違う。** スキルは「Web フォントは `font-display: swap` と `size-adjust` で、読み込みの前後で行の高さと字面を揃える。§12 の『読み込みのずれ』はこれで満たす」と書いている。しかし決定では、Zen Antique は `adjustFontFallback: false` で、`size-adjust` した代わりの書体を持たない。
   - Zen Antique の配信ファイルを調べると、仮名・漢字の送り幅は 1000 単位ではなく 996（6,718字）だった。GPOS の `kern` も持つ。代わりの端末のゴシックは 1000 単位で組むので、読み込みの前後で見出しの行の長さが変わる。行の終わりに近い見出しでは、折り返しが変わってその下が動きうる（§12）。
   - 判断は覆らない。スキルの「機械で確かめる」の「Web フォントで内容がずれない」（読み込みを止めた状態と読み込んだ状態の矩形を比べる）で見つけられる。
   - **直すこと**: スキルのこの項目を、Plex（範囲付きで寸法を合わせた代わりの書体）と Zen Antique（寸法を合わせた代わりの書体を持たない。ずれは機械の検査で確かめる）の実態に合わせて書き直すこと。「値を変えるときの手順」の節は決定と合っていた。

5. **T1 に申し送る項目**（判断は覆さない）
   - **Plex の preload**: `next/font/local` は preload が既定で true である（`local/validate-local-font-function-call.js`）。Regular と Bold の2ファイル（20,984B・21,256B）が全ページで preload される。見込みは Google の可変ファイル1本（45,712B）で計算しているので、量はほぼ同じである。Bold を preload するかは T1 で決める。
   - **`local("Arial")` が無い端末**: Android には Arial が無い。そこでは Plex の代わりの書体が効かず、ASCII は並びの後ろの端末の書体で描かれ、読み込んだあとに差し替わる。Lighthouse を回す Linux の Chromium でも同じことが起こりうる。CLS の条件を判定する前に、計測する環境で代わりの書体が効いているかを確かめる。
   - **Plex のファイルの入れ方**: npm の `@ibm/plex-sans` は `postinstall` で `ibmtelemetry` を実行し、`@ibm/telemetry-js` に依存する。決定どおり、ファイルと OFL だけをリポジトリに写すこと（依存に加えない）。同梱の LICENSE.txt は `Reserved Font Name "Plex"` の OFL 1.1 で、Regular・Bold の Latin1 ファイルは `U+0020-007E` をすべて含み、数字 0〜9 は 600 単位の等幅だった。
   - **入力から描く見出し**: `DESIGN.md` §3「Zen Antique に無い字を含む見出しは、その和文を丸ごと本文書体で組む」は残す。ところが決定は、入力から描く見出しを確かめる対象から外している。T1 で、来訪者の入力を見出しとして描く面があるかを洗い出すこと。あれば、その見出しは初めから本文の書体で組むなど、§3 と食い違わない形にすること。

## 確かめたこと

- 表の5ページの値（変更前・3書体とも `next/font/google`・差）、1.4〜2.7倍、BIZ UDPGothic の各124分割と1ファイル平均約 23KB、7ページの +6〜+85KiB、フォントの CSS が gzip で約 4KB 減ること、Zen Antique の1字あたり平均約 355B は、487e5fc の t1a-fonts.md と一致した。約2.6秒（527.9KiB ÷ 約 200KiB/秒。Lighthouse のモバイルの既定は 1,638.4Kbps）も正しい。
- 全ページの増分（中央値 約 +70KiB、+100KiB を越えるページが 1,163、漢字辞典の詳細 2,136 ページで中央値 約 +92KiB・最大 約 +223KiB）は、review-fonts-decision-3.md と一致した。
- 83.7% は cycle-315 の facts-ga.md（全着地の1PV率・28日）と一致した。
- `next/font/google` は `preload: false` なら `subsets` を求めない。`adjustFontFallback`・`display` も指定できる（`google/validate-google-font-function-call.js`）。`next/font/local` は `declarations`・`adjustFontFallback`・`preload` を受け付ける。Zen Antique は Next.js 16.3.0 の `font-data.json` にある。
- `@ibm/plex-sans` の最新は 1.1.0 で、`fonts/split/woff2/IBMPlexSans-{Regular,Bold}-Latin1.woff2` は 20,984B・21,256B だった（「各約 21KB」は正しい）。
- いまの `--font-gothic` は `"Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Noto Sans JP", sans-serif` で、`src/app/layout.tsx` は `lang="ja"` である。文書の記述と合う。
- index.md の「表示の速さ」は fonts-decision.md と文言まで一致した。T1 の行は「§3・§4 の書き換え」を fonts-decision.md に従うとしていて、T1a は `[ ]` のままである。options.md 66行目と「A の代償」の段落は決定と合う。options.md「`DESIGN.md` を変えるとき」の手順（測って得と比べる）にも沿っている。ただし比べた選択肢に抜けがある（Major 1）。
- `DESIGN.md`・スキル・docs 直下に、取り下げた道（サブセットの作り直し・増分0）は残っていなかった。

## 参考

- [モリサワ「Windows 10 October 2018 Update」での「BIZ UDゴシック/明朝」の正式採用を発表](https://www.morisawa.co.jp/about/news/4010)
- [List of typefaces included with Microsoft Windows（Wikipedia）](https://en.wikipedia.org/wiki/List_of_typefaces_included_with_Microsoft_Windows)
- [text-spacing-trim - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-spacing-trim)
- [[css-text-4] `text-spacing` and OpenType halt/vhal/chws/vchw features · w3c/csswg-drafts #8293](https://github.com/w3c/csswg-drafts/issues/8293)
