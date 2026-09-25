# レビュー（3回目）: Web フォントの配り方と表示の速さの条件（fonts-decision.md）

レビュー日: 2026-09-25
対象: [fonts-decision.md](./fonts-decision.md)、[index.md](./index.md)（T1a・T1 の行、「表示の速さ」、「A の代償」）、[options.md](./options.md)（66行目、「`DESIGN.md` を変えるとき」）、`.claude/skills/frontend-design/SKILL.md`「値を変えるときの手順」
出典: `git show 487e5fc:docs/cycles/cycle-316/t1a-fonts.md`、[facts-speed-before.md](./facts-speed-before.md)、`src/lib/fonts.ts`、`src/app/globals.css`、`DESIGN.md` §1・§3・§4・§12、`node_modules/next`（16.3.0）の next/font の実装。加えて、T1a の最初の版の計算に使った `tmp/t1a/`（`all.jsonl`・`model.py`・`analyze.py`）で、全ページの増分を計算し直した

## 結論: 改善指示

判断の方向は、来訪者にとって釣り合っている。本文を BIZ UDPGothic で配ると、PV の78%が集まるプレイ面で +527.9KiB 増える。本文を端末のゴシックにすれば、この増分を払わせずに済む。見出しの Zen Antique は `DESIGN.md` §1 の3つの仕掛けの1つなので、残す判断も妥当である。専用の配信の仕組みを作らないことにも同意する。前回の Major 2件と Minor 5件はすべて反映されていた。Plex の代わりの書体を範囲付きで自分で置く形も、§4 の連続約物を実装できる形に改めることも、実装で成り立つことを確かめた。

ただし、「増分は数十 KiB にとどまる」は7ページだけから言っている。出典と同じデータで全ページを計算し直すと、全ページの約6割を占める漢字辞典の詳細では、増分の中央値が約 92KiB、最大で約 223KiB になる（Major 1）。また、表の Zen Antique の配り方には preload の指定が無い。いまの `fonts.ts` と同じ `subsets: ["latin"]` で書くと、使わない約 16KiB のファイルを全ページが読む（Major 2）。

## Major

### 1. 「増分は数十 KiB にとどまる」は7ページだけの値で、全ページの約6割を占める漢字辞典の詳細では 100KiB を越える

- fonts-decision.md は「**本文を端末のゴシックにすると、増分は数十 KiB にとどまる。**」と見出しに書き、「表示の速さの条件」の見込みも「数十 KiB」としている。根拠は、出典（487e5fc の A2）の7ページの値 +6〜+85KiB だけである。出典は全ページについて「3,318 ページで増える」とだけ書いていて、増分の大きさは書いていない。
- 出典と同じデータ（`tmp/t1a/all.jsonl` のページごとの字の集合）と同じモデル（`tmp/t1a/analyze.py` の `before_model`、Zen Antique の Google の分割、Plex の latin ファイル）で、A2（Zen Antique＋Plex、本文は端末のゴシック）を全 3,526 ページについて計算し直した。7ページの値は +6.3〜+85.2KiB で、出典と一致した。全ページでは次のとおりである。
  - 増分の中央値は約 +70KiB。+100KiB を越えるページは 1,163 あり、そのうち 1,036 が漢字辞典である。+150KiB を越えるページは 532、+200KiB を越えるページは 97 あり、どちらもすべて漢字辞典だった。最大は `/dictionary/kanji/撃` などの約 +223KiB である。
  - 漢字辞典の詳細（2,136 ページ。全ページの約6割）では、増分の中央値が約 +92KiB だった。代表の `/dictionary/kanji/哀`（+85KiB）は、この面の中で小さいほうにあたる。
- これは判断を覆さない。本文の BIZ UDPGothic の増分（数百 KiB）とは桁が違い、Zen Antique は §1 の仕掛けである。ただし、次の2点で、来訪者に払わせる量を正しく示せていない。
  - 辞典は、検索の表示回数の76〜79%を占める面である（cycle-315 の facts-ga.md）。この面で +100〜+220KiB を払わせることは、「捨てるもの」と並べて書くべき代償である。
  - この値は、変更前に Noto Serif JP で組んでいた要素を、そのまま Zen Antique に置き換えた場合の値である。漢字辞典の詳細で見出しの書体を使う要素（関連する字のリンクなど、字形が主題の要素）を、刷新後もアンティーク体で組むかどうかは、T4 の「中身か装飾か」の判定で決まる。その判定の材料として、この転送量を渡す必要がある。
- **直すこと**: 「なぜこの形か」の2つ目の箇条を、全ページの分布（中央値・漢字辞典の詳細の中央値・最大）で書き直すこと。「表示の速さの条件」の転送量の見込みも、実態に合う値にすること（例: 代表の5ページは数十 KiB、辞典の詳細は 100KiB 前後）。漢字辞典の詳細の増分を T4 の判定の材料にすることを、index.md の T4 か fonts-decision.md に一言書くこと。計算は新しい仕組みを要さず、手元のデータで済む。

### 2. Zen Antique の preload を決めていない。いまの `fonts.ts` と同じ書き方では、全ページが使わない latin のファイル（約 16KiB）を読む

- `next/font/google` は、`preload`（既定は true）のときに `subsets` の指定を求める。指定が無いとビルドが止まる（`node_modules/next/dist/compiled/@next/font/dist/google/validate-google-font-function-call.js`）。いまの `src/lib/fonts.ts` は Noto Serif JP を `subsets: ["latin"]` で書いていて、その latin のファイルを全ページで preload している。
- fonts-decision.md の表は、Zen Antique の配り方を「`next/font/google`、`display: swap`」としか書いていない。T1 の builder が、いまの書き方をそのまま写すと、Zen Antique の latin のファイル（16,032B。Google Fonts の CSS API で 2026-09-25 に確かめた）が全ページで preload される。
- 刷新後は、見出しの `U+0000-007F` を Plex が組む。そのため Zen Antique の latin のファイルが使われるのは、見出しに「——」「……」「“”」などがあるときだけである。変更前は Noto Serif JP の latin のファイルが見出しの欧文を組んでいたので、preload は無駄ではなかった。刷新後は、ほとんどのページで使わないファイルを読ませることになる。preload は LCP の文字の描画と回線を奪い合う。
- 上の A2 の計算（Major 1）は、ページが実際に描く字の範囲のファイルだけを数えていて、この preload を含まない。含めると、全ページの増分の中央値は約 +70KiB から約 +85KiB に上がる。
- **直すこと**: 表の Zen Antique の「配り方」に `preload: false` を書くこと。日本語の分割ファイルはもともと preload の対象にならない（[facts-external-specs.md](./facts-external-specs.md) §3）ので、失うものは無い。

## Minor

1. **Zen Antique の自動の代わりの書体（Times New Roman）も、範囲を持たずに並びに入る。** `next/font/google` は、Zen Antique にも `local("Times New Roman")` の代わりの書体（`size-adjust: 120.12%`。`capsize-font-metrics.json` の `category: serif` から決まる）を自動で作る。この書体には `unicode-range` が付かない。見出しの並びは「Plex → Plex の代わり → Zen Antique → Zen Antique の代わり（Times）→ 端末のゴシック」になる。そのため、Zen Antique を読み込むまでのあいだ、見出しの「——」「……」「“”」は Times の欧文の字形で描かれ、読み込んだあとに Zen Antique の全角の字形に切り替わる。前回の Major 1 と同じ害だが、読み込みのあいだだけに起きる。和文は Times に無いので、代わりの書体は見出しの和文には効かない。表の Zen Antique の配り方にも `adjustFontFallback: false` を書くこと。
2. **§4「和欧混植: 両者の字面の大きさとベースラインが揃っていること」と §3「字面が動かない」が、端末のゴシックでは OS ごとの近似になる。** ベースラインはブラウザが揃える。一方で和文の字面は、ヒラギノ角ゴ・游ゴシック・Noto Sans CJK JP で大きさが違う（游ゴシックは字面が小さい）。Plex の大きさは1つしか決められないので、揃うのはどれか1つの書体に対してだけになる。BIZ UDPGothic なら1組に合わせられたので、これも「捨てるもの」の1つである。「捨てるもの」に書き、「`DESIGN.md` の変更」で §4 の和欧混植の書き方（どの書体に合わせ、ほかでは近似になるか）を決めること。
3. **「端末のゴシック（ヒラギノ角ゴ・游ゴシック・Noto Sans JP）は、各 OS が日本語の標準として備える」は、Android について不正確である。** Android が備えるのは Noto Sans CJK JP で、`"Noto Sans JP"` という名前では見つからない。いまの並びでは、末尾の `sans-serif` から、`lang="ja"`（`src/app/layout.tsx`）によって Noto Sans CJK JP に解決される。この文は `DESIGN.md` §3 の理由に書き写す予定なので、「並び（ヒラギノ角ゴ・游ゴシック・Noto Sans JP・`sans-serif`）で、各 OS の標準の日本語ゴシックに解決される」のように、並びの末尾まで含めた、確かめられる書き方にすること。
4. **Plex の配信ファイルと OFL の Reserved Font Name。** IBM Plex Sans の OFL は「Reserved Font Name "Plex"」を持つ（google/fonts の `ofl/ibmplexsans/OFL.txt`）。OFL の FAQ（openfontlicense.org「Webfonts and Reserved Font Names」）は、Web フォントのサブセットを Modified Version（RFN を名乗れない）とみなす。Google の latin のファイルは Google が作ったサブセットなので、「手を加えずに置く」だけでは、この問いに答えたことにならない。これは `next/font/google` で Plex を配っても同じで、実害の見込みは小さい。それでも、同じ手間で避けられる道がある。IBM 自身が配る分割ファイル（npm の `@ibm/plex-sans` 1.1.0 の `fonts/split/woff2/IBMPlexSans-{Regular,Bold}-Latin1.woff2`。各約 21KB で、`U+0020-007E` をすべて含み、ライセンスが同梱されている）は作者の配布物で、この問いが起きない。どちらを使うかを決めて、表に書くこと。
5. **index.md の T1 の行が、§3 の書き換えしか挙げていない。** fonts-decision.md は、T1 で §4 の「約物」も書き換えると決めている。T1 の行を「§3・§4 の書き換え」とすること。
6. **§1 の引用。** 「`DESIGN.md` §1 は、本文の仕事を読みやすさとし」とあるが、「本文の仕事は読みやすさである」は §3 の箇条である（§3 が §1 を引いている）。「§3（§1 を引く）」か「§1・§3」と書くこと。

## 確かめたこと

- 表の5ページの値（変更前・3書体とも `next/font/google`・差）、1.4〜2.7倍、BIZ UDPGothic の各124分割と1ファイル平均約 23KB、約2.6秒、7ページの +6〜+85KiB（計算値で、変更前の全ページでブラウザが実際に読んだファイルの集合と一致）、フォントの CSS が gzip で約 4KB 減ること、Zen Antique の1字あたり平均約 355B は、いずれも 487e5fc の t1a-fonts.md と一致した。7ページの値は、手元の計算でも再現した。
- `next/font/local` は、`declarations` の `unicode-range` を本体の `@font-face` に付ける。禁止されている `prop` は `src`・`font-display`・`font-weight`・`font-style` だけである。`adjustFontFallback: false` のとき、代わりの書体の `@font-face` は作られず、変数は本体の家族名だけになる（`local/loader.js`・`postcss-next-font.js`）。範囲を付けた代わりの書体を CSS に自分で置く形は、実装で成り立つ。
- Google の Plex の latin ファイルは 45,712B の可変フォント（wght 100〜700）で、400 と 700 が同じファイルである。数字は 0〜9 がすべて 600 単位の等幅だった。Zen Antique の latin のファイルは、`—`・`…`・`×` を全角（1000 単位）で持つ。そのため、Plex を `U+0000-007F` に絞れば、見出しの約物は Zen Antique の全角で組まれる。
- `text-spacing-trim` は Chrome と Edge（123 以降）だけが実装していて、Safari（iOS を含む）と Firefox は実装していない（Can I use、2026-09-25）。「Safari と Firefox では約物が全角のまま並ぶ」は正しい。
- LCP の5回の幅 722〜1,980ms、PV の78%、83.7% は出典と一致した。index.md の「表示の速さ」は fonts-decision.md と文言まで一致した。T1a の行は `[ ]` に戻っていた。
- options.md 66行目は「`DESIGN.md` §3 のとおりなら」と、決定の前の見積もりと分かる形になっていた。118分割は、Google の122面から cyrillic・greek・latin・latin-ext の4面を除いた数で、正しい。
- frontend-design スキル「値を変えるときの手順」は、決定（`next/font` で配り、自前の切り出しは作らない）と合っていた。スキルのほかの箇所に、取り下げた道（サブセットの作り直し・BIZ UDPGothic）は残っていなかった。

## 参考

- [text-spacing-trim - Can I use](https://caniuse.com/mdn-css_properties_text-spacing-trim)
- [text-spacing-trim - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-spacing-trim)
- [Webfonts and Reserved Font Names - SIL Open Font License](https://openfontlicense.org/webfonts-and-reserved-font-names/)
- [IBM Plex Sans OFL.txt（google/fonts）](https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/OFL.txt)
- [@ibm/plex-sans（npm）](https://www.npmjs.com/package/@ibm/plex-sans)
