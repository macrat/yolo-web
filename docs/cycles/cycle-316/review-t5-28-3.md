# T5-28 レビュー 第3回（Zen Antique の読み込みの前後で見出しの行の数を変えない）

## 判定

**approved**

第2回の指摘2点は、どちらも直っている。T5-28 の文書と注釈を全体に読み直したが、誤り・経緯の言い方・ツギハギは見つからなかった。第2回のあと、実行されるコードは変わっていない。

## 確かめたこと

HEAD（2518fdd2）を `git archive` で作業場の外に書き出した。書き出した先に `node_modules` が無いことを確かめてから `cp -al` で置いた。そこに T5-28 の8ファイル（`src/app/globals.css`・`src/middleware.ts`・`src/__tests__/middleware-gone-slugs.test.ts`・irodori の `share.ts`・`share.test.ts`・`docs/knowledge/web-fonts.md`・`DESIGN.md`・`.claude/skills/frontend-design/SKILL.md`）を重ね、`npm run generate:release-id` を走らせてから検査した。検査のあと、書き出しは消した。

| 検査                                                                                                                                                                                                                                                                                                                                                | 結果                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `tsc --noEmit`                                                                                                                                                                                                                                                                                                                                      | 通る                    |
| `eslint .`                                                                                                                                                                                                                                                                                                                                          | 通る                    |
| prettier（T5-28 の8ファイル）                                                                                                                                                                                                                                                                                                                       | 通る                    |
| vitest `--maxWorkers=2`。globals.css を読む4本（middleware-gone-slugs・design-gate・token-hex・mermaid-figure）、見出しの書体に触れる10本（zen-antique-charset・heading-font-coverage・answerFont・nakamawake の GameContainer・KanjiDetail・LinkIndex・ResultReading・PhrasedText・privacy の page・index-phrases）、irodori の6本（share を含む） | 20ファイル・346件が通る |

irodori の6本のうち、T5-20d の `FinalResult.*` と `GameContainer.test.tsx` は HEAD の版のまま走らせた。T5-28 の `share.ts` と `share.test.ts` だけを重ねている。

### 第2回の指摘

1. **解消。** web-fonts.md 2章の44行目は「範囲に入れない字は、並びの後ろの書体（`--font-ja-heading-fallback`）で組む。」になり、「今までどおり」が消えた。働きも実装と合う。`--font-heading` で `--font-zen-antique-fallback` の次に来るのは `--font-ja-heading-fallback` である。読み込みのあいだは Plex と Zen Antique もまだ無いので、範囲の外の字（欧文の約物など）はこの並びで組まれる。
2. **解消。** DESIGN.md §3 の82行目の最後の文は「書体のカーニング（Noto Sans CJK JP の仮名の組など）と、字ごとに幅の違う欧文の約物は倍率で揃わないので、読み込みの前後の折り返しの揃いは近似とする。」になった。揃わない理由だけを持つ決まりの文である。ヒラギノ・游ゴシックを測っていないという今の事情は DESIGN.md から消え、web-fonts.md 2章の末尾（63行目）にだけ残る。

### T5-28 の文書と注釈の読み直し

- **DESIGN.md §3（82行目）。** 本文書体の並びの定義に続けて、読み込みのあいだの見出しの組み方と、揃いが近似であることを決まりとして書いている。前の版の「Zen Antique の仮名はほぼ全角なので」の言い方は残っていない。ほかの文書に同じ言い方が残っていないことも grep で確かめた。
- **DESIGN.md §4（124行目）。** 「書体が `halt` か `chws` を持つときに効き、ほかでは全角のまま組む」という基本を先に置く。そのあとに、Zen Antique で組む見出しは `space-all` で読み込みの前も全角のまま組むこと、その理由、本文の書体で組む見出しは書体に従うことを続けている。実装（`:root` の `--heading-text-spacing-trim: space-all` と `[data-heading-font="fallback"]` の `normal`）と合う。
- **SKILL.md（123行目）。** 代わりの書体の置き方、`globals.css` の変数の名前、web-fonts.md への道筋、`--font-zen-antique` を無い書体の名前に差し替える確かめ方を書いている。実装とも web-fonts.md 4章とも合う。
- **web-fonts.md。** 1章の数（265.2px・266.24px・266px・33.28px）は互いに合う。2章の CSS の例は globals.css の BIZ UDGothic の3つの face と同じである。表の値は globals.css の倍率と合う（WenQuanYi の仮名 97.71%、BIZ の U+00A0 56%）。49行目の `line-height: 1.25` は `--leading-heading: 1.25` と合う。3章の `space-all` の説明（行末の閉じ括弧も詰めない）は、`normal` が `allow-end` を持つという CSS Text 4 の定義と合う。3章の「この組み方の前の 1060 通りから 59 通り」などの前後の比べは、この組み方の効き目を示す測った結果である。文書の成り立ちの経緯ではないので、知識の文書に置いてよい。
- **globals.css の注釈。** 先頭の代わりの書体の注釈、Noto の face の注釈、WenQuanYi の face の注釈、`--font-ja-heading-fallback`・`--font-zen-antique-fallback`・`--heading-text-spacing-trim` の注釈、見出しの規則と `[data-heading-font="fallback"]` の規則の注釈は、どれも今の働きだけを書いており、経緯を持たない。
- **middleware.ts と test の注釈。** 410 の書体の並びから除く3つの変数と、その理由（Web フォントを読み込まない）を書いており、`toGonePageFontStack` の正規表現と合う。
- **share.ts の注釈。** Zen Antique を読み込めないときの見出しの字を「§3 の送り幅を Zen Antique に揃えた代わりの書体と、仮名を全角で組む並び」と書いており、`pageFontFamilies` の `ja` の並びと合う。

### 実行されるコードが第2回から変わっていないこと

`git diff` を第2回の記述と照らした。

- `h1〜h6` の `text-spacing-trim: var(--heading-text-spacing-trim)`、`:root` の `space-all`、`[data-heading-font="fallback"]` の `normal`。
- 12個の `@font-face`（BIZ UDGothic 3・ヒラギノ 2・游ゴシック 2・Noto 2・WenQuanYi 3）と `--font-zen-antique-fallback`。`--font-heading` の並びの順。
- middleware.ts は注釈だけが変わり、410 の h1 に `text-spacing-trim` は無い。test は `zen-antique-fallback` を除く正規表現になっている。
- share.ts の `ja` は3つの変数から作る。`share.test.ts` には「Zen Antique Fallback BIZ UDGothic」と「点」の組が入っている。

どれも第2回の記述と同じである。ファイルの更新の時刻も、ソースの5ファイルは review-t5-28-2.md より前だった。第2回のあとに変わったのは DESIGN.md・web-fonts.md（文書の直し）と SKILL.md（T5-29 の行）だけである。第2回の HEAD（a8938343）から今の HEAD までのコミットも、この4つのソースに触れていない。

## 指摘

なし。

## 気づいたこと（指摘ではない）

- globals.css の `--font-ja-heading-fallback` の注釈と web-fonts.md の冒頭は、代わりの書体を「先頭の @font-face」と呼ぶ。しかし、ファイルのいちばん先頭の `@font-face` は IBM Plex Sans Fallback で、Zen Antique の代わりの書体はその直後にある。ファイルの先頭の部分という意味で読めるので、誤りとはしない。次に触るときに「ファイルの先頭の Zen Antique Fallback の @font-face」とすれば迷わない。
- DESIGN.md §10（500行目）は、端末で Zen Antique を読み込めないときの名前の和文を「§3 の仮名を全角で組む並び（BIZ UDGothic が先頭）」で組むと書く。今の irodori の画像と画面では、同じ書体を `size-adjust` で縮めた代わりの face がまず当たる。ただ、§3（82行目）が読み込みのあいだの組み方を決めていて、§10 はそれを指している。書体そのものも同じで、「一つの名前の中で和文の書体が混ざらない」という §10 の約束も保たれる。なので、矛盾とはしない。

## アンチパターンの照らし合わせ（docs/anti-patterns/implementation.md）

- **AP-I01（来訪者にとって最高の体験か）**: 遅い回線で記事を開いた来訪者の、題の下の本文が跳ねる体験を消す。読み込んだあとの見た目は変えない（第2回で画素まで同じことを確かめた。第2回のあとに実行されるコードは変わっていない）。**該当なし**
- **AP-I02（場当たりでなく根本を直しているか）**: 送り幅の差という原因を、サイト全体の書体の並びで直している。`space-all` の掛け分けも、属性が変数を替える1か所で済ませている。**該当なし**
- **AP-I03（Core Vitals・バンドル）**: CLS が下がる。足したのは `local()` の `@font-face` と CSS の変数だけで、JS のバンドルも書体のファイルの読み込みも増えない。**該当なし**
- **AP-I04（指標を直接の目的にしていないか）**: 読む体験を直す変更で、指標を操作していない。**該当なし**
- **AP-I05（目的に無関係な追加）**: 中身を足していない。**該当なし**
- **AP-I06（反対の極端）**: 第2回の指摘は文書の言い方だけで、直しも2文の書き換えに留まる。決まりを削りすぎたり足しすぎたりしていない。**該当なし**
- **AP-I07（本番ビルドでの Playwright 検証）**: 第1回・第2回で、本番のビルドを Chromium で、ネットワークで Zen Antique を止めた組みでも測った。今回は実行されるコードが変わっていないので、測り直していない。**該当なし**
- **AP-I08（DESIGN.md に無い視覚表現）**: 新しい見た目は足していない。§3・§4 の決まりも実装と合っている。**該当なし**
- **AP-I09（コミットの順）**: `globals.css`・`middleware.ts`・`middleware-gone-slugs.test.ts` は、test が globals.css と middleware の一致を見るので同じコミットに入れる。`share.ts`・`share.test.ts` も `--font-zen-antique-fallback` を読むので同じコミットに入れる。DESIGN.md と SKILL.md は、下の手順で T5-28 の塊だけを入れる。**注意（下の「コミットの分け方」）**
- **AP-I10（`@keyframes` の参照）**: 触れていない。**該当なし**
- **AP-I11（タイマーの片付け）**: 触れていない。**該当なし**
- **AP-I12**: 欠番（フックが機械で検出する）。
- **AP-I13（撤去のときの一括 grep）**: 撤去は無い。足した変数を読む既存のコードは irodori の `share.ts` だけで、直っている。古い言い方（「ほぼ全角なので」）が文書に残っていないことも grep で確かめた。**該当なし**
- **AP-I14（共有の部品を変えたとき、すべてのページを撮り比べたか）**: 第2回で、全 616 ページの見出しを読み込んだ状態で前後に比べた（3環境で `loadedChanged: 0`）。画素の比べも行った。今回は実行されるコードが変わっていない。**該当なし**

workflow.md では次に照らした。

- AP-WF01（最後の修正のあとのレビュー）: 第2回のあとの文書の直しを、このレビューで見た。
- AP-WF07（同じファイルを並行して触るタスク）: DESIGN.md と SKILL.md に T5-29 の行があるので、下の手順で分けて入れる。
- AP-WF09・AP-WF14: 数や状態は、自分で走らせた検査と diff の照らし合わせで確かめた。

## コミットの分け方

T5-29 の塊（DESIGN.md の109行目、SKILL.md の46行目と129行目）が同じファイルに入っている。T5-28 の塊は、DESIGN.md の82行目・124行目と、SKILL.md の123行目だけである。対話の `git add -p` は使えないので、塊を取り出したパッチを索引にだけ当てる。

```sh
cd /home/user/yolo-web
# 今の @@ の番号を確かめる（DESIGN.md は -82・-109・-124、SKILL.md は -46・-123・-129 のはず）
git diff -U0 DESIGN.md .claude/skills/frontend-design/SKILL.md | grep '^@@'
git diff -U0 DESIGN.md | awk '/^@@ -109 /{skip=1;next} /^@@/{skip=0} !skip' > tmp/design-t528.patch
git diff -U0 .claude/skills/frontend-design/SKILL.md | awk '/^@@ -(46|129) /{skip=1;next} /^@@/{skip=0} !skip' > tmp/skill-t528.patch
grep '^@@' tmp/design-t528.patch tmp/skill-t528.patch   # -82・-124・-123 の3つだけであること
git apply --cached --unidiff-zero tmp/design-t528.patch tmp/skill-t528.patch
git add src/app/globals.css src/middleware.ts src/__tests__/middleware-gone-slugs.test.ts \
  src/play/games/irodori/_lib/share.ts src/play/games/irodori/_lib/__tests__/share.test.ts \
  docs/knowledge/web-fonts.md
git diff --cached --stat    # 8ファイル。DESIGN.md は 2 行、SKILL.md は 1 行の差し替えだけ
git diff --cached -U0 DESIGN.md .claude/skills/frontend-design/SKILL.md | grep '^@@'   # -82・-124・-123 だけ
```

パッチを作って当てる部分は、今の作業場から一時の索引（`GIT_INDEX_FILE`）で試した。索引に載ったのは DESIGN.md の82・124行目と SKILL.md の123行目だけだった（2ファイル、3行の差し替え）。T5-29 が先にコミットして行の番号が動いたときは、`@@` の番号を読み直してから同じ形で取り出す。

## PM への依頼

- T5-28 は承認とする。上の手順で、T5-28 の塊だけを分けてコミットすること。
- 作業場 `/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/` に、前の第3回のレビュアーの書き出しと見られる `t528r3-export/` と、builder の `t528/` が残っている。T5-28 のコミットのあとで消すこと。私の書き出しは消した。
