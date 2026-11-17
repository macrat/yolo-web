# T5-28 レビュー 第2回（Zen Antique の読み込みの前後で見出しの行の数を変えない）

## 判定

**changes-needed**

実装（CSS の変数で `space-all` を Zen Antique の見出しだけに掛ける形）は正しく、来訪者に見える結果に問題は見つからなかった。指摘は文書の2点だけである。

## 確かめたこと

HEAD（a8938343）を `git archive` で2つ書き出し、片方に T5-28 のソースと web-fonts.md（`globals.css`・`middleware.ts`・`middleware-gone-slugs.test.ts`・irodori の `share.ts`・`share.test.ts`・`docs/knowledge/web-fonts.md`）を重ね、両方を本番のビルドにして `next start` で並べて測った。ブラウザは `/opt/pw-browsers/chromium-1194` の Chromium だけを使った。端末の書体は、この機械の書体（和文は WenQuanYi Zen Hei）と、builder の書体のファイルを使って自分の作業場に作った fontconfig の2つの環境（BIZ UDGothic を足した環境、Noto Sans CJK JP を `sans-serif` にした Android の形の環境）で替えた。

| 検査                                                                                                                                                                                                                                                      | 結果                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `tsc --noEmit`                                                                                                                                                                                                                                            | 通る                    |
| `eslint .`                                                                                                                                                                                                                                                | 通る                    |
| prettier（T5-28 の8ファイル）                                                                                                                                                                                                                             | 通る                    |
| `next build`（T5-28 を重ねた組みと HEAD の両方）                                                                                                                                                                                                          | 通る                    |
| vitest `--maxWorkers=2`（middleware-gone-slugs・design-gate・token-hex・container・ai-notice・mermaid-figure・zen-antique-charset・heading-font-coverage・answerFont・nakamawake の GameContainer・KanjiDetail・LinkIndex・ResultReading・irodori の6本） | 19ファイル・326件が通る |

### 第1回の指摘

1. **解消。** `h1〜h6` は `text-spacing-trim: var(--heading-text-spacing-trim)` を読み、`:root` が `space-all`、`[data-heading-font="fallback"]` が `normal` を置く。ビルドした組みで次を確かめた。
   - 属性の無い見出し（`/dictionary/colors/toki` の h1・h2）は `space-all`。
   - 属性が見出しそのものに付く見出し（`/dictionary/colors/sohi` の h1、`/dictionary/kanji/剝` の h1）は `normal`。
   - 属性を包む要素に置いた見出し（ページに `<section data-heading-font="fallback"><div><h3>` を差し込んだもの）も `normal`。実際のページにも包む要素に置く所がある（`YojiDetail` の `kanjiLinks`）。
   - 包む要素の中の見出しでない段落は、どちらでも `normal` のまま（変数を読むのは見出しの規則だけ）。
   - 410（`/blog/rss-feed`）の h1 の CSS に `text-spacing-trim` は無く、計算値は `normal`。`--font-heading` は `"IBM Plex Sans Fallback", var(--font-ja-heading-fallback)`。
   - sohi: 今の HEAD の組みでは、Noto Sans CJK JP の環境の 375・390 の拡大 200% で h1「纁（sohi）」は1行（62.5px）で、`space-all` を掛けても変わらなかった（第1回のあとに T5-9 で辞典の詳細の枠が組み直されたためと見られる）。そこで、幅 300〜420px を 2px 刻みに、既定・拡大 200%・文字 200% の 183 通りで sohi の h1 の高さを測った。T5-28 の組みと HEAD の組みは 183 通りすべてで同じだった。`space-all` を無理に掛けると、300px・拡大 200% で 125px → 187.5px（第1回の「纁／（sohi／）」と同じ崩れ）になるので、測り方はこの差を拾える。T5-28 の組みはこの崩れを起こさない。
2. **解消（ただし指摘2）。** §3 から倍率の数が消え、「送り幅を Zen Antique に揃えた代わりの書体で組み、読み込みの前後で見出しの折り返しを変えない」という決まりと、揃わない差があるので揃いは近似とする1文になった。WenQuanYi を「この並びの書体」とする誤りも消えた。
3. **解消。** web-fonts.md は「616 ページ」、「前後の差が大きくなったのは 25 通りで、うち 23 通りは、この組み方の前には行の数が変わらなかった」。builder の `compare.mjs` を `before-cjk.json` → `after4-cjk.json` で走らせ直し、better 1024・worse 25・sameNonzero 34（残り 59 = 25 + 34）を得た。index.md の PM の決定の行も 23 件になっている。
4. **解消。** web-fonts.md 2章の末尾が、読み込みの前の見出しを組む書体を「Windows 10 1809 以降は BIZ UDGothic、macOS・iOS はヒラギノ角ゴ ProN、Android は Noto Sans CJK JP、游ゴシック Medium は BIZ UDGothic の無い Windows」と書き分け、実機で確かめる相手（macOS・iOS の Safari、Windows の Chrome・Edge、Android の Chrome）を並べている。index.md の T9 の行も、Windows の Edge で `local("BIZ UDGothic")` が当たるか、Android の Chrome で `local("Noto Sans CJK JP")` が当たるかを、Zen Antique を止めた状態と読み込んだ後で比べる形になった。
5. **解消。** `pageFontFamilies` の `ja` は `--font-zen-antique`・`--font-zen-antique-fallback`・`--font-ja-heading-fallback` から作る。`share.test.ts` の並びの例と、`document.fonts.load` に渡す組の期待値にも「Zen Antique Fallback BIZ UDGothic」と「点」の組が入った。irodori の6本は通る。
6. **解消。** `--font-ja-heading-fallback` の注釈が、読み込みのあいだに範囲から外した字（欧文の約物・「×」・BIZ UDGothic 以外の U+00A0 など）と、代わりの書体がどれも端末に無いときの和文も組むことを書いている。

### 行の数（読み込みの前と後。自分で測った数）

19ページ（記事7本: cron-cheatsheet・site-rename-yolos-net・git-command-reference・character-counting-guide と、builder の Android の残りに挙がった3本、トップ・道具・遊び・ブログ・辞典・色・ユーモア辞典の一覧、色の sohi・toki、漢字の「剝」、漢字カナール、診断の結果 star-chaser）を 320・375 で、既定と文字 200% の2通りで測った。**ネットワークで Zen Antique の 122 の分割ファイルを止めた組み**と、読み込んだ組みを別々に開いて比べた。見出しは1環境につき 328 本（うち `normal` で組むのは sohi と「剝」の h1 の4本、残り 324 本が `space-all`）。

| 環境             | 既定で行の数が変わる見出し | 文字 200% で行の数が変わる見出し |
| ---------------- | -------------------------: | -------------------------------: |
| WenQuanYi        |                          0 |                                0 |
| BIZ UDGothic     |                          0 |                                0 |
| Noto Sans CJK JP |                          1 |                                4 |

- Noto の5件は、どれも 320px の h1 で、builder の `after4-cjk.json` の「worse」に挙がる件（a11y-static-green-but-broken-dynamic-audit の既定と文字 200%、removing-ai-slop-and-the-absent-writer・gamification-built-measured-removed・star-chaser の文字 200%）と一致する。わざとこの記事を選んで入れたもので、PM が受け入れた仮名のカーニングの残りである。
- 対照として、同じ測り方で HEAD の組みを測ると、WenQuanYi の環境の 320px で cron-cheatsheet と site-rename-yolos-net の h1 の行の数が変わった。測り方は差を拾える。
- Zen Antique を止めた組みと読み込んだ組みの cron-cheatsheet の h1 を、Noto Sans CJK JP の環境の 320px で撮って見比べた。どちらも「Cron式 早見表 —／フィールド・／特殊文字・／実用パターン一覧」の4行で、折れる所が同じだった。読み込みの前の字面も不自然に小さくも大きくもない。

builder の全ページの結果も走らせ直した。`before-*.json` と `after4-*.json` を `compare.mjs` で比べると、3つの環境とも `loadedChanged: 0`（82,320 の見出し）で、報告と合う。

### 読み込んだあとの見た目（HEAD との画素の比べ）

`/`・`/blog/cron-cheatsheet`・`/dictionary/colors/sohi`・`/dictionary/kanji/剝`・`/play/character-personality/result/star-chaser` を、320 と 1280 で、Zen Antique を読み込み終えてからページ全体を撮った。WenQuanYi の環境と Noto Sans CJK JP の環境で、T5-28 の組みと HEAD の組みの 20 組が、PNG のバイト列まですべて同じだった。本文の書体で組む見出し（sohi・「剝」）を含むページでも、読み込んだあとの見た目は変わっていない。

### 文書

- DESIGN.md §4 の約物の行（124 行目）は、第1回の直し方どおり「Zen Antique で組む見出しは、読み込みの前も連続約物を全角のまま組む」「本文の書体で組む見出しは、本文と同じく書体に従って詰める」になり、主語と述語の結びも読める。
- SKILL.md の 123 行目は、代わりの書体の置き方と、`--font-zen-antique` を無い書体の名前に差し替えて読み込みの前後を比べる確かめ方を書き、web-fonts.md を指している。実装と合う。
- web-fonts.md の3章の1つ目の項目は、`space-all` を Zen Antique で組む見出しだけに掛ける理由と、変数で掛け分ける理由を書いている。`space-all` が行末の閉じ括弧も詰めないこと（`normal` は `allow-end` を含む）は CSS Text 4 の定義と合う。
- 3つの文書に `tmp/` の道筋や作業場の道筋は無い。
- globals.css・middleware.ts・test・share.ts の注釈は、今の形だけを書いており、経緯を持たない。

## 指摘

1. **web-fonts.md 2章の「送り幅が字ごとにまちまちな字は、どの範囲にも入れない。」の項に、経緯の言い方が残っている。** 「範囲に入れなければ、今までどおり並びの後ろの書体で組む。」の「今までどおり」は、この組み方を入れる前と比べた言い方で、初めから正しく書いた文書として読むと何と比べているのか分からない。
   - 直し方: 「範囲に入れなければ、その字は並びの後ろの書体（`--font-ja-heading-fallback`）で組む。」のように、今の働きだけを書く。

2. **DESIGN.md §3（82 行目）の最後の文が、決まりでなく、調べの今の状態を持っている。** 「送り幅を測れない書体（ヒラギノ・游ゴシック）は全角の書体とみなして揃えるので」は、書体のファイルが手元に無いという今の事情である。T9 の実機でヒラギノの幅を確かめれば古くなり、DESIGN.md を書き直すことになる。この事情と確かめ方は web-fonts.md 2章の末尾にすでにあるので、DESIGN.md に置く必要が無い。また、この文は理由を3つ（カーニング・欧文の約物・測れない書体）つないだ1文で、読み取りにくい。
   - 直し方: 最後の文を、揃わない理由だけの決まりにする。たとえば「書体のカーニング（Noto Sans CJK JP の仮名の組など）と、字ごとに幅の違う欧文の約物は倍率で揃わないので、読み込みの前後の折り返しの揃いは近似とする。」。ヒラギノ・游ゴシックの倍率が推論であることは web-fonts.md に任せる。

## アンチパターンの照らし合わせ（docs/anti-patterns/implementation.md）

- **AP-I01（来訪者にとって最高の体験か）**: 遅い回線で記事を開いた来訪者の、題の下の本文が跳ねる体験を消し、読み込んだあとの見た目は画素まで変えていない。第1回の sohi の崩れ（行の頭の「）」）も起きない。**該当なし**
- **AP-I02（場当たりでなく根本を直しているか）**: 送り幅の差という原因を、サイト全体の書体の並びで直している。`space-all` の掛け分けも、属性の置き場所ごとの特別扱いでなく、属性が変数を替える1か所で済ませている。**該当なし**
- **AP-I03（Core Vitals・バンドル）**: CLS が下がる。足したのは `local()` の `@font-face` と変数だけで、JS のバンドルも書体のファイルの読み込みも増えない。**該当なし**
- **AP-I04（指標を直接の目的にしていないか）**: 読む体験を直す変更で、指標を操作していない。**該当なし**
- **AP-I05（目的に無関係な追加）**: 中身を足していない。**該当なし**
- **AP-I06（反対の極端）**: 第1回の指摘に対し、`space-all` をやめるのでも全体に広げるのでもなく、Zen Antique で組む見出しに絞った。**該当なし**
- **AP-I07（本番ビルドでの Playwright 検証）**: 本番のビルドを Chromium で、ネットワークで Zen Antique を止めた組みでも測った。**該当なし**
- **AP-I08（DESIGN.md に無い視覚表現）**: 新しい見た目は足していない。**該当なし**
- **AP-I09（コミットの順）**: `globals.css`・`middleware.ts`・`middleware-gone-slugs.test.ts` は test が globals.css と middleware の一致を見るので同じコミットに入れる。`share.ts`・`share.test.ts` も `--font-zen-antique-fallback` を読むので同じコミットに入れる。DESIGN.md と SKILL.md は下の手順で T5-28 の塊だけを入れる。**注意（下の「コミットの分け方」）**
- **AP-I10（`@keyframes` の参照）**: 触れていない。**該当なし**
- **AP-I11（タイマーの片付け）**: 触れていない。**該当なし**
- **AP-I13（撤去のときの一括 grep）**: 撤去は無い。足した変数を読む既存のコード（irodori の `share.ts`）は第1回の指摘5で直った。`--font-heading` を見出しでない要素で読む所（`Header` のサイト名・`FittedNumber`・辞典の大字・ゲームの字など17か所）も見たが、欧文か1字の字で、連続約物を持たない。**該当なし**
- **AP-I14（共有の部品を変えたとき、すべてのページを撮り比べたか）**: globals.css の見出しの規則はすべてのページに効く。builder は全 616 ページの見出しを読み込んだ状態で前後に比べ（3環境で `loadedChanged: 0`）、私はそれを走らせ直して同じ値を得た。加えて5ページ × 2幅 × 2環境で HEAD と画素まで同じことを確かめた。**該当なし**

workflow.md では、AP-WF09（推測を「対応済み」にしない）に照らした。ヒラギノ・游ゴシックの値と、Windows・Android で `local()` が当たるかは、web-fonts.md に推論と明記され、index.md の T9 の行に実機の確かめ方として渡っている。AP-WF14（数を自分で集計したか）に照らして、builder の 25・23・1024・59 と `loadedChanged: 0` を `compare.mjs` で走らせ直し、行の数は自分の測りでも確かめた。AP-WF07（同じファイルを並行して触るタスク）に照らして、DESIGN.md と SKILL.md に T5-29 の行があるので、下の手順で分けて入れる。

## コミットの分け方

DESIGN.md と SKILL.md には T5-29 の塊（DESIGN.md の 109 行目、SKILL.md の 46 行目と 129 行目）が同じファイルに入っている。T5-28 の塊は DESIGN.md の 82 行目・124 行目と、SKILL.md の 123 行目だけである。対話の `git add -p` は使えないので、塊を取り出したパッチを索引にだけ当てる。

```sh
cd /home/user/yolo-web
# T5-28 の塊だけのパッチを作る（ヘッダーの @@ -N は HEAD 側の行の番号。コミットの直前に `git diff -U0 DESIGN.md .claude/skills/frontend-design/SKILL.md | grep '^@@'` で番号を確かめ直す）
git diff -U0 DESIGN.md | awk '/^@@ -109 /{skip=1;next} /^@@/{skip=0} !skip' > tmp/design-t528.patch
git diff -U0 .claude/skills/frontend-design/SKILL.md | awk '/^@@ -(46|129) /{skip=1;next} /^@@/{skip=0} !skip' > tmp/skill-t528.patch
grep '^@@' tmp/design-t528.patch tmp/skill-t528.patch   # -82・-124・-123 の3つだけであること
git apply --cached --unidiff-zero tmp/design-t528.patch tmp/skill-t528.patch
git add src/app/globals.css src/middleware.ts src/__tests__/middleware-gone-slugs.test.ts \
  src/play/games/irodori/_lib/share.ts src/play/games/irodori/_lib/__tests__/share.test.ts \
  docs/knowledge/web-fonts.md
git diff --cached --stat    # 8ファイル。DESIGN.md は 2 行、SKILL.md は 1 行の差し替えだけ
git diff --cached -U0 DESIGN.md .claude/skills/frontend-design/SKILL.md | grep '^@@'
```

この手順は、一時の索引（`GIT_INDEX_FILE`）で試し、DESIGN.md の 82・124 行目と SKILL.md の 123 行目だけが載ることを確かめた。T5-29 が先にコミットして行の番号が動いたときは、`@@` の番号を読み直してから同じ形で取り出す。

## PM への依頼

- 指摘1・2を builder に直させ、直したあとで、前回の指摘だけでなく全体を見直すレビューをもう一度依頼すること。
- builder の作業場 `t528/` には書き出しや測りの結果（225MB）が残っている。ディスクの空きは 6GB ほどなので、T5-28 が終わったら消すこと。私の作業場は消した。
