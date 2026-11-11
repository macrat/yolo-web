# T5-28 レビュー（Zen Antique の読み込みの前後で見出しの行の数を変えない）

## 判定

**changes-needed**

## 確かめたこと

HEAD を `git archive` で書き出し、T5-28 の6ファイル（`src/app/globals.css`・`src/middleware.ts`・`src/__tests__/middleware-gone-slugs.test.ts`・`docs/knowledge/web-fonts.md`・`DESIGN.md`・`.claude/skills/frontend-design/SKILL.md`）だけを重ねて確かめた。`DESIGN.md` と `SKILL.md` はファイルごと重ねたが、見たのは T5-28 の行（DESIGN.md §3 の 82 行目・§4 の 124 行目、SKILL.md の 123 行目）だけである。SKILL.md の 141 行目（DataTable）は T5-8 の行なので見ていない。

| 検査                                                                                                                                               | 結果                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `tsc --noEmit`                                                                                                                                     | 通る                                    |
| `eslint .`                                                                                                                                         | 通る                                    |
| prettier（6ファイル）                                                                                                                              | 通る                                    |
| `next build`                                                                                                                                       | 通る                                    |
| vitest（globals.css・middleware を読む6本: middleware-gone-slugs・design-gate・token-hex・container・ai-notice・mermaid-figure。`--maxWorkers=2`） | 6ファイル・133件が通る                  |
| vitest（見出しの書体に触れる4本: zen-antique-charset・answerFont・heading-font-coverage・nakamawake の GameContainer）と irodori の6本             | 4ファイル・67件、6ファイル・100件が通る |

本番のビルドを `next start` で配信し、`/opt/pw-browsers/chromium-1194` の Chromium（141.0.7390.37）だけで測った。端末の書体は、この機械の書体（和文は WenQuanYi Zen Hei）と、builder が取った書体のファイルを使って自分で作った fontconfig の2つの環境（BIZ UDGothic を足した環境、Noto Sans CJK JP を `sans-serif` にした Android の形の環境）で替えた。

### CSS の正しさ

- **`unicode-range` は重ならない。** BIZ UDGothic は「U+3005-3006・4E00-9FFF・F900-FAFF」「2025-2026・2500-257F・3000-3004・3007-30FF・FF00-FFEF」「00A0」、WenQuanYi Zen Hei は 3007-3040 / 3041-3096 / 3097-309A / 309B-309E / 309F-30A0 / 30A1-30FA / 30FB-30FF と隙間も重なりも無く割っている。ヒラギノ・游ゴシック・Noto は BIZ と同じ2つの範囲。
- **倍率は fontTools で読み直した値と合う。** Zen Antique ÷ BIZ UDGothic は漢字の範囲の 6718 字がすべて 0.996、100% の範囲の 401 字がすべて 1.0、U+00A0 は 0.56、「—」は 2.0（範囲の外で正しい）。Zen Antique ÷ WenQuanYi は漢字 6706 字がすべて 0.996、97.71% の範囲の仮名がすべて 0.9771、100% の範囲は「Ｑ」（0.912）・「｜」（0.979）の2字を除いて 1.0。
- **`local()` の名前は正しい。** `fc-query` で、BIZ UDGothic は full name「BIZ UDGothic」・PostScript「BIZUDGothic-Regular」、Noto Sans JP は「Noto Sans JP Regular」・「NotoSansJP-Regular」、Noto Sans CJK JP は「Noto Sans CJK JP」・「NotoSansCJKjp-Regular」、WenQuanYi は「WenQuanYi Zen Hei」・「WenQuanYiZenHei」。ヒラギノ（「Hiragino Kaku Gothic ProN W3」・「HiraKakuProN-W3」）と游ゴシック（「Yu Gothic Medium」・「YuGothic-Medium」）も、それぞれの書体の名前の表の値と合う。ビルドした CSS では引用符が外れる（`local(BIZ UDGothic)`）が、識別子の並びとして正しい。
- **読み込んだ Zen Antique の組みは変わらない（ただし指摘1）。** 代わりの書体の `@font-face` は `--font-zen-antique` の後ろにあり、Zen Antique にある字には効かない。Zen Antique に無い字は `data-heading-font="fallback"` で見出しごと本文の書体へ移るので、代わりの書体は使わない。
- **並びの順は正しい。** `--font-heading` は Plex → Plex の代わり → Zen Antique → 送り幅を合わせた代わりの書体（BIZ → ヒラギノ → 游 → Noto → WenQuanYi。本文の見出しの並びの順と、その後ろの `sans-serif` に当たる書体）→ `--font-ja-heading-fallback`。CDP の `CSS.getPlatformFontsForNode` で、Zen Antique を止めたときの h1 は、3つの環境でそれぞれ WenQuanYi Zen Hei・BIZ UDGothic・Noto Sans CJK JP で組まれた。
- **410 のページ。** `/blog/rss-feed` は 410 を返し、`--font-heading` は `"IBM Plex Sans Fallback", var(--font-ja-heading-fallback)`、h1 は `text-spacing-trim:space-all` を持つ。test は `--font-zen-antique-fallback` を除いた並びで globals.css と照らしており、通る。h1 の `space-all` の扱いは指摘1。

### 行の数（自分で測った数）

31ページ（builder の読み込み前の差がいちばん多かった記事14本、cron-cheatsheet・site-rename-yolos-net・character-counting-guide、トップ・道具・遊び・辞典の一覧、色・ユーモア辞典・ゲーム・診断）を使った。**Zen Antique を CSS の変数で外すのではなく、ビルドした CSS から読んだ Zen Antique の 122 の分割ファイルをネットワークで止めた組み**と、読み込んだ組みを別々に開いて比べた。見出しは1通りにつき 458 本。

| 環境             | 320 既定 | 375 既定 | 320・文字 200% | HEAD を模した対照（320 / 375 / 320・200%） |
| ---------------- | -------: | -------: | -------------: | -----------------------------------------: |
| WenQuanYi        |        0 |        0 |              0 |                                24 / 5 / 17 |
| BIZ UDGothic     |        0 |        0 |              0 |                                 9 / 0 / 14 |
| Noto Sans CJK JP |        0 |        0 |              6 |                                 7 / 1 / 12 |

- 対照は、止めた組みに `--font-zen-antique-fallback` を無い書体にし、見出しの `text-spacing-trim` を `normal` に戻した style を足したもの（HEAD の CSS と同じ働き）。測り方が差を拾えることを、これで確かめた。
- BIZ の環境の1回目の走らせで `/play/daily` の h2 が2本ずれたが、2回走らせ直すと0だった。「占っています……」の読み込み中の見出しで、開くたびに中身が変わるためである。
- Noto の環境の6本はどれも文字サイズ 200% の記事の h1（と h2 1本）で、builder が報告した Android の残り（仮名のカーニング）と合う。PM が受け入れた範囲である。
- builder の全ページの結果（`after3-*.json`）も読み直した。WenQuanYi と BIZ はどの幅・どの通りでも0、Noto Sans CJK JP は 1060 → 59 で、報告と合う。

### CLS（自分で測った数）

builder と同じ条件（50KB/s・400ms・CPU 4倍・375 相当のモバイル・load の4秒後まで）で、Zen Antique が届いたことを `document.fonts` で確かめたうえで測った。

| 記事                  | 幅  | T5-28  | HEAD を模した対照 |
| --------------------- | --- | ------ | ----------------- |
| cron-cheatsheet       | 320 | 0.0000 | 0.0996            |
| site-rename-yolos-net | 320 | 0.0000 | 0.1191            |
| git-command-reference | 320 | 0.0000 | 0.1902            |
| 3本とも               | 375 | 0.0000 | 0.0005〜0.0009    |

対照の値は builder の「前」（0.0996・0.1191・0.0951）と合う。git-command-reference の対照は 0.095 の揺れが2回起きた。T5-28 では3本とも揺れが無い。

### 読み込んだあとの見た目

`/`・`/blog/site-rename-yolos-net`・`/dictionary`・`/dictionary/colors`・`/dictionary/colors/toki`・`/play/kanji-kanaru`・`/tools` を、320 と 1280 で、T5-28 の組みと HEAD を模した組み（上の対照と同じ style）で全ページのスクリーンショットに撮り、画素で比べた。3つの書体の環境で、42組がすべて同じだった。全 572 ページの見出しで `space-all` と `normal` の幅を比べても（375・拡大なし）、どの環境でも差は0だった。差が出るのは、行の頭に来た括弧を詰める、狭い幅の組みだけである（指摘1）。

## 指摘

1. **`text-spacing-trim: space-all` を、Zen Antique で組まない見出しにも掛けており、読み込んだあとの見た目が変わる。行の頭に閉じ括弧だけが残る組みも生まれる。** `h1〜h6` のすべてに掛けているので、`data-heading-font="fallback"` の見出しにも掛かる。これらの見出しは和文を初めから本文の書体で組み、読み込みの前後で和文の書体が替わらない。だから、詰めを止めても読み込みの前後の揃いには何も効かず、読み込み後の組みが変わるだけである。builder の報告の「句読点が詰まらなくなった色の1件」は `/dictionary/colors/sohi` の h1「纁（sohi）」で、Noto Sans CJK JP の環境の 375・390 の拡大 200% で起きる。これを撮り比べた。`normal` では「纁／（sohi）」の2行（高さ 125px）だが、`space-all` では「纁／（sohi／）」の3行（187.5px）になる。「）」が1字だけで行の頭に立ち、DESIGN.md §4 の禁則（行の頭に閉じ括弧を置かない）に反する。高さも 62.5px 伸びる。PM は `font-kerning: none` を「読み込んだあとの見た目を変えない約束に反する」として退けた。これは同じ約束に反し、しかも避けられる。
   - 直し方: `space-all` は Zen Antique で組む見出しだけに掛け、`data-heading-font="fallback"` の見出しは今までどおり `normal` で組む。属性は見出しそのものに付くことも、見出しを包む要素に付くこともあるので、どちらでも外れるように書く。410 の h1 も、初めから Zen Antique を読まない本文の書体の見出しなので `space-all` を外し、`middleware.ts` を globals.css と揃える。
   - あわせて、DESIGN.md §4 の約物の行を「Zen Antique で組む見出しは、読み込みの前も連続約物を全角のまま組む（Zen Antique は `halt`・`chws` を持たない）」という中身に書き直す。今の2文目（「Zen Antique は `halt`・`chws` を持たず、読み込みの前に組む書体でも同じ字幅になる」）は、主語と述語の結びが読み取りにくいので、書き直すときにあわせて直す。globals.css の見出しの規則の注釈と、web-fonts.md の3章の1つ目の項目も同じ範囲に揃える。
   - 直したあとに、全ページの見出しを読み込んだ状態で、拡大 200% と文字 200% を含めて HEAD と比べ、行の数と高さの差が0であることを確かめる（builder の `compare.mjs` の `loadedChanged` が0になること）。

2. **DESIGN.md §3 の追加の文が、実装と合わない数と、実装が守れない言い切りを持つ。**
   - 「漢字は 99.6%、仮名・和文の約物・全角の形は 100%」は、WenQuanYi Zen Hei の仮名の 97.71% と、BIZ UDGothic の U+00A0 の 56% を含まない。
   - 「この並びの書体に」とあるが、WenQuanYi Zen Hei は並びに無い（`sans-serif` に当たる書体）。
   - 「読み込みの前後で見出しの行の数が変わらない」と言い切っている。しかし、Noto の仮名のカーニングによる差（Android の形の環境で 59 通り）を PM が受け入れて残している。ヒラギノ・游ゴシックの幅は、まだ確かめていない。
   - 直し方: 倍率の数は globals.css と web-fonts.md に任せ、§3 からは外す。§3 は「端末の書体ごとに、字の種類ごとの `size-adjust` で送り幅を Zen Antique に揃えた代わりの書体で組み、読み込みの前後で見出しの折り返しを変えない」という決まりとして書く。そのうえで、揃わない差（書体のカーニング・字ごとに幅の違う欧文の約物）が残ることを、実装と矛盾しない形で1文にする。§3 の他の行（「和文と欧文の字面の大きさの揃いは近似とする」）と同じ書き方にする。
   - ここは決まりの一部として書く。後から足した注意書きに見えないようにする。

3. **web-fonts.md の数が、builder 自身の結果と合わない。**
   - 3章と4章の「617 ページ」は、`after3-*.json` では 616 ページである（617 は 320・既定の h1 の本数）。
   - 3章の「このうち 25 通りは、この組み方の前には行の数が変わらなかった」は誤りである。`compare.mjs` の `worse: 25` は、前後の差が大きくなった件の数である。前は差が0で今は差がある件は、見出しの文字列で照らすと 23 通りで、残りの2通りは前から差があって大きくなった件である。「直った 1024 通り」（1060 − 前から残る 36）は 23 と合う。
   - 直し方: 23 に直すか、「前後の差が大きくなったのは 25 通り（うち 23 通りは前は揃っていた）」と書く。index.md の PM の決定の行（「前は揃っていて悪くなった25件」）も、PM が同じく直す。

4. **Windows で読み込みの前に組む書体を、游ゴシックとしている。実機で確かめる項目に Android が無い。**
   - BIZ UDGothic は Windows 10 October 2018 Update（1809）から OS の標準の書体である（[モリサワの発表](https://www.morisawa.co.jp/about/news/4010)）。並びの先頭にあるので、日本語の Windows の Chrome・Edge では、読み込みの前の見出しは BIZ UDGothic で組まれる。これはこの環境で確かめて0である。
   - web-fonts.md の2章の末尾の「ヒラギノ角ゴ ProN と游ゴシック Medium は…実機（macOS・iOS・Windows）で」は、Windows で確かめる相手が BIZ UDGothic であることが読み取れない。index.md の T9 の行の「Windows の Edge（Yu Gothic）」も同じである。
   - Windows に入っている BIZ UDGothic は Google Fonts の版と別のファイルなので、T9 では、Windows で `local("BIZ UDGothic")` が当たることと、行の数が変わらないことを確かめる形にする。游ゴシックは、BIZ UD の無い Windows で当たる書体として書く。
   - Android の改善（1060 → 59）は、Android の Chrome が `local("Noto Sans CJK JP")`・`local("NotoSansCJKjp-Regular")` を端末の書体に照らせることに懸かっている。これはこの環境の再現で確かめただけである。T9 の行に、Android の Chrome の実機で、Zen Antique を止めた状態（開発者ツールでの遮断、または遅い回線）と読み込んだ後の見出しの行の数を比べる項目を足す。
   - 書体の名前が当たらなくても、今より悪くはならない（前と同じ組みに戻るだけ）。ただし、効いているかを誰も確かめないまま「約95%が消える」と記録することになる。

5. **irodori の結果の画像が、見出しの書体の並びを読み分ける所と合わなくなった。** `src/play/games/irodori/_lib/share.ts` の `pageFontFamilies` は、見出しの和文の並びを `--font-zen-antique` と `--font-ja-heading-fallback` から作る。`--font-heading` から、この2つに入らない書体を「欧文の書体」とみなす。T5-28 で `--font-heading` に `--font-zen-antique-fallback` が入ったため、「Zen Antique Fallback …」の5つの和文の書体が欧文の書体に数えられた。そのうえで欧文の字と組にして `document.fonts.load` に渡している（範囲に字が無いので何も読まない）。和文の箱の上下の高さは代わりの書体を除いた並びで測り、描くときは代わりの書体を含む並びで描く。今は見える差はほとんど無い（漢字の 0.4%）。しかし、並びを読み分ける決まりが並びの中身と合わなくなっている。
   - 直し方: `ja` を `--font-zen-antique`・`--font-zen-antique-fallback`・`--font-ja-heading-fallback` から作る。`share.test.ts` の並びの例も同じ形にする。

6. **globals.css の `--font-ja-heading-fallback` の注釈の、使われる場面の説明が足りない。** 注釈は「Zen Antique に無い字を含む見出しと、Zen Antique の読み込みのあいだに下の送り幅を合わせた書体がどれも端末に無いときに使う」とある。しかし、読み込みのあいだにも、代わりの書体の範囲に入れなかった字を組む。欧文の約物・「×」・BIZ 以外の U+00A0・WenQuanYi 以外の「—」などである。先頭の `@font-face` の注釈（「範囲に入れず、後ろの並びに任せる」）とあわせて読めば分かるが、この変数の注釈だけを読むと場面を読み違える。範囲に入れなかった字もこの並びで組むことを、注釈に含める。

## 質問への答え

- **色の項目の句読点の変化は DESIGN.md に照らして受け入れられるか。** 受け入れられない（指摘1）。句読点が詰まらなくなるだけではない。行の頭に「）」が1字で立つ禁則の崩れと、行の数の増加が起きる。しかも、読み込みの前後の揃いには何も寄与しない変化である。
- **全見出しへの `space-all` は §3・§4 と合うか。** Zen Antique で組む見出しについては合う。Zen Antique は `halt`・`chws` を持たず、読み込んだあとの組みは `space-all` でも `normal` でも画素まで同じだった。読み込みの前の組みを読み込み後に揃える働きだけを持つ。本文の書体で組む見出し（`data-heading-font="fallback"` と 410）については合わない。§4 は「書体が `halt` か `chws` を持つときに詰める」を基本としており、本文の書体で組む見出しで詰めを止める理由が無い（指摘1）。
- **ほかのタスクとの衝突。** 作業場の `globals.css` の差分は T5-28 の部分だけで、ほかの未コミットの変更に `text-spacing-trim`・`font-kerning`・`--font-heading` を触るものは無い。`DESIGN.md` の差分も T5-28 の2か所だけである。`SKILL.md` には T5-8 の DataTable の行（141 行目）が同じファイルに入っているので、コミットするときは T5-28 の行（123 行目）だけを分けて入れる。
- **`font-kerning: none` を退けた決定。** 同意する。builder の `kernoff-cjk.json` でも、読み込み後の行の数が変わる件が 31（色の sohi の2件を除くと 29）あり、読み込み後の見た目を変える。

## アンチパターンの照らし合わせ（docs/anti-patterns/implementation.md）

- **AP-I01（来訪者にとって最高の体験か）**: 遅い回線で記事を開いた来訪者が、題の下の本文が 0.1 前後跳ねる体験を消している（CLS 0.0996〜0.1902 → 0）。価値は大きい。ただし、本文の書体の見出しで、読み込み後の見た目を理由なく変えている（指摘1）。**該当あり（指摘1）**
- **AP-I02（場当たりでなく根本を直しているか）**: 記事だけの CSS で余白を調整するのでなく、送り幅の差という原因を、サイト全体の書体の並びで直している。`space-all` の掛け方が広すぎるのは指摘1。**該当なし（根本を直している）**
- **AP-I03（Core Vitals・バンドル）**: CLS が下がる。足したのは CSS の `@font-face` 12個と変数だけで、JS のバンドルは変わらない。`local()` なのでファイルの読み込みも増えない。**該当なし**
- **AP-I04（指標を直接の目的にしていないか）**: 来訪者の読む体験を直す変更で、指標を操作していない。**該当なし**
- **AP-I05（目的に無関係な追加）**: 中身を足していない。**該当なし**
- **AP-I06（反対の極端）**: `font-kerning: none` を退け、`space-all` の範囲も読み込みの揃いに必要な範囲に留めるべきところ、全見出しに掛けている。極端に振れたとまでは言えないが、指摘1で範囲を締める。**該当なし（指摘1で対応）**
- **AP-I07（本番ビルドでの Playwright 検証）**: builder も私も、本番のビルドを Chromium で測った。私はネットワークで Zen Antique を止めた組みでも確かめた。**該当なし**
- **AP-I08（DESIGN.md に無い視覚表現）**: 新しい見た目は足していない。読み込みの前の組みを読み込み後に寄せる変更である。**該当なし**
- **AP-I09（コミットの順）**: `globals.css`・`middleware.ts`・その test は同じコミットに入れる必要がある（test が globals.css と middleware の一致を見る）。`SKILL.md` は T5-8 の行と分けて入れる。**注意（上の「ほかのタスクとの衝突」）**
- **AP-I10（`@keyframes` の参照）**: 触れていない。**該当なし**
- **AP-I11（タイマーの片付け）**: 触れていない。**該当なし**
- **AP-I13（撤去のときの一括 grep）**: 撤去は無い。ただし、足した変数を読み分ける既存のコード（irodori の `share.ts`）を見落としている（指摘5）。**関連して指摘5**
- **AP-I14（共有の部品を変えたとき、使うすべてのページを撮り比べたか）**: globals.css の見出しの規則はすべてのページに効く。builder は全 616 ページの見出しの行の数と高さを、読み込み後について前後で比べた（`loadedChanged: 2` = sohi）。その2件を「句読点が詰まらなくなった」と軽く扱ったのが指摘1。**該当あり（指摘1）**

workflow.md では、AP-WF09（推測を「対応済み」にしない）に照らした。ヒラギノ・游ゴシックの値が推測であることは、web-fonts.md に明記され、T9 に渡されている。ただし、Windows の相手の取り違えと、Android の実機の欠けを指摘4で直す。AP-WF14（数を自分で集計したか）に照らして、builder の数は `after3-*.json` を自分で集計し直し、25 と 23 の食い違いを見つけた（指摘3）。

## PM への依頼

- 指摘1〜6を builder に直させ、直したあとで、前回の指摘だけでなく全体を見直すレビューをもう一度依頼すること。指摘3の index.md の PM の決定の行と、指摘4の T9 の行は、PM が直す。
- builder の作業場 `t528/` に、書き出した `after/`・`before/`（`node_modules` と `.next` を含む）が残っている。ディスクの空きは 6.5GB なので、T5-28 が終わったら消すこと。
