# レビュー（5回目）: Web フォントの配り方と表示の速さの条件（fonts-decision.md）

レビュー日: 2026-09-25
対象: [fonts-decision.md](./fonts-decision.md)、[index.md](./index.md)（T1a・T1・T4 の行、「表示の速さ」、「A の代償」）、[options.md](./options.md)（66行目、「`DESIGN.md` を変えるとき」）、`.claude/skills/frontend-design/SKILL.md`「値を変えるときの手順」「実装の技術」
出典: `git show 487e5fc:docs/cycles/cycle-316/t1a-fonts.md`、[facts-speed-before.md](./facts-speed-before.md)、[review-fonts-decision-3.md](./review-fonts-decision-3.md)、`src/lib/fonts.ts`、`src/app/globals.css`、`DESIGN.md` §1・§3・§4・§12、`node_modules/next`（16.3.0）の next/font の実装。加えて、Microsoft Learn の Windows 10 の書体一覧を確かめた

## 結論: 改善指示（Blocker 0・Major 0・Minor 5）

判断は来訪者にとって釣り合っている。前回の Major 2件・Minor 5件は、すべて反映されていた。

- 本文を BIZ UDPGothic の Web フォントにすると、PV の78%が集まるプレイ面で +527.9KiB 増える。本文を配らないことで、この増分を払わせずに済む。
- 本文の並びの先頭に BIZ UDPGothic を置いたので、Windows の来訪者には転送量0で §3 の本文の書体が届く。
- 見出しの Zen Antique は §1 の仕掛けの1つなので残す。漢字辞典の詳細で増分が大きいことは、T4 に材料として渡している。
- 専用の配信の仕組みは作らない。

以上の4点に同意する。数字は出典と合っていた。判断を覆す指摘、実装できなくなる指摘は無い。

残る指摘は、事実の書き方の精度が2件、書き換え後の `DESIGN.md` の文言が1件、T1 に申し送る項目の不足が1件、取り下げた文書の扱いが1件である。どれも文書を直せば済む。

## Minor

### 1. 「Windows 10 1809 以降は BIZ UDPGothic を標準の書体として備える」は、条件が抜けている

- Microsoft Learn の Windows 10 の書体一覧では、BIZ UDPGothic（Regular・Bold）は基本の書体ではない。「Japanese Supplemental Fonts」という追加の書体の束（Feature On Demand）に入っている。
- 同じ一覧によれば、この束は、言語の設定で日本語を有効にすると Windows Update が自動で加える。したがって、日本語の Windows ならほぼ確実に入っている。一方、日本語を有効にしていない Windows には無い。
- そのため、fonts-decision.md の「捨てるもの」にある「BIZ UDPGothic の無い端末（iOS・macOS・Android）」には、日本語の書体の束が無い Windows と Linux が抜けている。
- 判断は変わらない。ただし、この文は `DESIGN.md` §3 の「端末にあれば」の根拠になる。
- **直すこと**: 「日本語を有効にした Windows 10 1809 以降は、BIZ UDPGothic を日本語の追加の書体として備える」のように、条件まで書くこと。「無い端末」の列挙も合わせて直すこと。

### 2. 「+100KiB を越えるページは 1,163 で、大半は漢字辞典の詳細（2,136 ページ。…）」は、数字の読み違いを招く

- 括弧の中の 2,136 は、漢字辞典の詳細のページ数である。1,163 の内訳ではない。
- しかし文の形からは、「1,163 のうち大半が漢字辞典の詳細で、その数が 2,136」と読めてしまう。2,136 は 1,163 より大きいので、読み手はここで引っかかる。
- 出典（review-fonts-decision-3.md）の内訳は「そのうち 1,036 が漢字辞典」である。漢字辞典の詳細だけの数ではない。
- **直すこと**: 「+100KiB を越えるページは 1,163 で、そのうち 1,036 が漢字辞典だった。漢字辞典の詳細（2,136 ページ）では、増分の中央値が約 +92KiB、最大が約 +223KiB だった」のように、2つの数を分けて書くこと。

### 3. 書き換え後の §4「和欧混植」から、ベースラインの規定が消える

- 「`DESIGN.md` の変更」では、§4 の「両者の字面の大きさとベースラインが揃っていること」を、§3 の箇条を指す形に改めるとしている。
- ところが、指す先の §3 の新しい箇条は「行の高さが動かない」と「字面の大きさの揃いは近似とする」しか言っていない。ベースラインについては何も書いていない。
- このまま書き換えると、ベースラインを揃えるという規定を残すのか捨てるのかが、書き換え後の `DESIGN.md` から読み取れない。
- **直すこと**: 決めて、どちらかの箇条に書くこと。ベースラインは、ブラウザが欧文のベースラインに揃えるので満たせる。したがって、残すと決めるのが自然である。

### 4. T1 に申し送る項目（判断は覆さない）。「T1 で確かめること」に加えること

- **見出しの読み込み中の代わりの書体と、§12「読み込みのずれ」**
  - 読み込み中の見出しを何で組むかが、決まっていない。review-fonts-decision-3.md の見立てどおり本文の並びを使うと、Windows では BIZ UDPGothic になる。
  - BIZ UDPGothic は、仮名の送り幅がプロポーショナルな書体である（名前の「P」）。一方、Zen Antique の仮名・漢字は 996 単位でほぼ等幅である（review-fonts-decision-4.md）。
  - そのため、読み込みの前後で見出しの幅が仮名の数に応じて変わり、折り返しが変わってその下が動きうる。
  - いまの `globals.css` は見出しに `palt` を掛けている。これを引き継ぐと、ヒラギノでも同じことが起きる。
  - 機械の検査を回す環境（Linux。和文の書体は IPAGothic など）には、BIZ UDPGothic もヒラギノも無い。そのため、この差は検査に現れない。
  - T1 で、見出しの読み込み中の代わりの書体を、Zen Antique に寸法の近いもの（仮名が全角の書体、`palt` なし）として決めること。その決定を、スキルの「実装の技術」の見出しの和文の項目と食い違わないようにすること。
  - Zen Antique に無い字を含む見出し（§3。本文の書体で組む）とは別の話である。こちらは Web フォントを使わないので、ずれは起きない。
- **「行の高さが動かない」（書き換え後の §3）**
  - 行の高さを数値で指定しても、1行の中に上端と下端の比が違う書体（Plex と端末の和文の書体）が混ざると、行の高さが指定より大きくなりうる。游ゴシックのように上下の余白が大きい書体では、欧文を含む行だけが少し高くなる。
  - 端末の書体ごとに、欧文を含む行と含まない行の高さが揃うかを確かめること。
- **Zen Antique に無い字を含む見出しの組み方**
  - fonts-decision.md は、この規定をビルドの時の「試験で確かめる」とだけ書いている。どうやって本文の書体に切り替えるかは書いていない。
  - データから描く見出し（辞典の項目の名前など）を切り替えるには、Zen Antique の字の表をサーバー側で引く必要がある。
  - その字の表をどこから得るか、書体が更新されたときに表がずれないか（`next/font/google` はビルドのたびに Google から取得する）を、T1 で決めること。

### 5. 取り下げた [t1a-closure.md](./t1a-closure.md) と [t1a-fonts.md](./t1a-fonts.md) が、いまも有効な判断として読める

- fonts-decision.md は、この2つの判断を取り下げると書いている。しかし、2つの文書の側には何も書かれていない。
- とくに t1a-closure.md は「T1 の受け入れ条件に移す」「T1 で書き換える」と書いている。T1 の builder がこれを開くと、取り下げた配り方（ページごとの切り出し）や `DESIGN.md` の書き換え（BIZ UDGothic の派生、連続約物を詰めない）を指示と受け取るおそれがある。
- サイクルの文書なので、経緯を残してよい。
- **直すこと**: 2つの文書の冒頭に、取り下げたことと、いまの判断が fonts-decision.md にあることを1行で書くこと。

## 参考（直さなくてよい）

- index.md の「レビュー結果」の表には、計画のレビューしか載っていない。T1a の6巡と、この判断のレビュー（5巡）は載っていない。サイクルを閉じるとき（cycle-completion スキル）には必要になるので、T1a を閉じる時点で加えておくと追いやすい。

## 確かめたこと

- **表の値と倍率**: 5ページの値（変更前・3書体とも `next/font/google`・差）と、1.4〜2.7倍（1,962.5÷1,428.5、1,459.4÷543.7）は、487e5fc の t1a-fonts.md と一致した。
- **BIZ UDPGothic の見積もり**: 各124分割、1ファイル平均約 23KB は出典と一致した。約2.6秒（527.9KiB ÷ 204.8KB/秒）も正しい。
- **Zen Antique と Plex だけを配ったときの見積もり**
  - 7ページの +6〜+85KiB、計算がブラウザの実際と一致したこと、フォントの CSS が gzip で約 4KB 減ること、1字あたり約 355B は、出典（A2 の段落と「見積もりの方法」4）と一致した。
  - 全ページの中央値 約 +70KiB、1,163 ページ、2,136 ページ、中央値 約 +92KiB・最大 約 +223KiB は、review-fonts-decision-3.md と一致した。
  - 条件の +85KiB は、代表のページ `/dictionary/kanji/哀` の見込みで、7ページの最大である。fonts-decision.md と index.md で同じ値だった。
- **変更前の値との差**: 3.1〜6.6KiB は、前回のレビューの再計算と一致した。LCP の幅 722〜1,980ms は facts-speed-before.md と一致した。
- **Next.js 16.3.0 の next/font**
  - `next/font/local` の `declarations` で禁止されているのは `src`・`font-display`・`font-weight`・`font-style` だけで、`unicode-range` は指定できる。`preload` の既定は true である。
  - Zen Antique は `font-data.json` にある（400、subsets は cyrillic・greek・latin・latin-ext）。
- **BIZ UDPGothic**: Microsoft Learn によれば、BIZ UDPGothic・BIZ UDPGothic Bold は Windows 10 1809 で Japanese Supplemental Fonts に加わった。「Regular・Bold を持つ」は正しい（条件は Minor 1）。
- **書体の変数**: いまの `--font-gothic` と `src/lib/fonts.ts`（Noto Serif JP 600・Zilla Slab 500）は、文書の「いまのサイト」の記述と合う。
- **文書の間の整合**
  - index.md の「表示の速さ」は、fonts-decision.md の条件と一致した。T1 の行は §3・§4 の書き換えを fonts-decision.md に従うとしている。T1a は `[ ]` のままである。
  - options.md 66行目と「A の代償」の段落は、決定と合う。「`DESIGN.md` を変えるとき」の手順（払わせる量を測り、得と比べて示す）にも沿っている。
- **スキル**: 「値を変えるときの手順」は決定と合う。「実装の技術」は Plex（範囲付きでメトリクスを合わせた代わりの書体）と見出しの和文（前後で見比べる）に分けて書き直されていて、前回の Minor 4 は反映されていた。
- **取り下げた道の残り**: `DESIGN.md`・スキル・docs 直下・`docs/knowledge` に、取り下げた道（増分0・方式 C）は残っていなかった。
- **来訪者にとっての釣り合い**: 本文を配らないことで払わせずに済む量（460〜916KiB）は、捨てるもの（Windows 以外で本文が §3 の書体にならない、見出しの連続約物が詰まらない、和欧混植が近似になる）より大きい。この比較は妥当である。

## 参考

- [Font List Windows 10 - Microsoft Learn](https://learn.microsoft.com/en-us/typography/fonts/windows_10_font_list)（Japanese Supplemental Fonts の中身と、言語を有効にすると自動で加わること）
- [BIZ UDGothic font family - Microsoft Learn](https://learn.microsoft.com/en-us/typography/font-list/biz-udgothic)
- [List of typefaces included with Microsoft Windows（Wikipedia）](https://en.wikipedia.org/wiki/List_of_typefaces_included_with_Microsoft_Windows)（BIZ UDPGothic はプロポーショナルな仮名を持つ）
