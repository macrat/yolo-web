# Web フォントの読み込みの前後で組みを変えない

Web フォントを `font-display: swap` で読み込むと、届くまでは並びの後ろの書体で組み、届いた所で組み直す。字の送り幅が少しでも違うと、見出しの行の数が変わり、下の中身がまとめて動く（CLS）。ここでは、見出しの和文の Zen Antique と、その読み込みのあいだに組む端末の書体の差を、`size-adjust` を掛けた `local()` の代わりの書体で消す方法と、その確かめ方をまとめる。実装は `src/app/globals.css` の先頭の `@font-face` と `--font-zen-antique-fallback`。

---

## 1. 0.4% の送り幅の差でも、行の数は変わる

Zen Antique の送り幅は、漢字（と「々」「〆」、CJK 互換漢字）が 996/1000em、仮名・和文の約物・全角の形・罫線・「—」「…」が 1000/1000em（書体の `hmtx` を fontTools で読んだ実測・cycle-316）。端末の和文の書体（BIZ UDGothic・Noto Sans JP など）は漢字も 1000/1000em なので、漢字が続く行では、読み込みの前のほうが 0.4% 広い。

差は小さいが、行の幅が全角の字数の境目のすぐ手前にあると効く。320px の画面の h1 は幅 266px・字の大きさ 33.28px で、漢字8字は Zen Antique で 265.2px（入る）、端末の書体で 266.24px（入らない）。266px は 8em の 0.1% 手前にある。このため、読み込みの前は1行7字、Zen Antique が届くと1行8字になり、漢字の続く題で行の数が1行減った（公開中の 85 記事の h1 のうち 26 本。CLS 0.06〜0.13。実測・cycle-316）。

境目がどこにあるかは、画面の幅・字の大きさ（文字サイズの設定・拡大）・見出しの段で変わるので、「今の幅では起きない」ことは直った理由にならない。送り幅そのものを揃える。

## 2. 字の種類ごとに `size-adjust` を掛けた `local()` の代わりの書体を置く

`size-adjust` は `@font-face` ごとに書体全体の大きさを掛ける。一つの書体の中で送り幅の比が字の種類ごとに違う（Zen Antique は漢字 996・仮名 1000）ので、一律の倍率では揃わない。そこで、同じ `font-family` の名前で `unicode-range` を分けた `@font-face` を複数置き、範囲ごとに倍率を変える。

```css
@font-face {
  font-family: "Zen Antique Fallback BIZ UDGothic";
  src: local("BIZ UDGothic"), local("BIZUDGothic-Regular");
  size-adjust: 99.6%; /* 漢字: 996 / 1000 */
  unicode-range: U+3005-3006, U+4E00-9FFF, U+F900-FAFF;
}
@font-face {
  font-family: "Zen Antique Fallback BIZ UDGothic";
  src: local("BIZ UDGothic"), local("BIZUDGothic-Regular");
  unicode-range:
    U+2025-2026, U+2500-257F, U+3000-3004, U+3007-30FF, U+FF00-FFEF;
}
@font-face {
  font-family: "Zen Antique Fallback BIZ UDGothic";
  src: local("BIZ UDGothic"), local("BIZUDGothic-Regular");
  size-adjust: 56%; /* 折れない空白: 280 / 500 */
  unicode-range: U+00A0;
}
```

組み立ての決まり:

- **倍率は、書体ごと・字の種類ごとに、Zen Antique の送り幅 ÷ その書体の送り幅で求める。** 端末の書体によって比が違う（下の表）ので、書体ごとに別の `font-family` にし、見出しの和文の並びと同じ順に並べる（`--font-zen-antique-fallback`）。一つの `@font-face` の `src` に複数の `local()` を並べると、どれが当たっても同じ倍率になるので、比の同じ書体（Noto Sans JP と Noto Sans CJK JP）だけをまとめる。
- **倍率 100% の範囲も置く。** 置かないと、その字だけ並びの後ろの別の書体の代わりの書体に落ち、一つの見出しの中で書体が混ざる（例: Noto Sans CJK JP と WenQuanYi Zen Hei の両方がある Linux で、漢字は Noto、仮名は WenQuanYi になる）。
- **送り幅が字ごとにまちまちな字は、どの範囲にも入れない。** 欧文の約物（「“」「–」など）やアクセント付きラテンは、書体ごとに字形の幅が違い、倍率を掛けると字面の大きさが目に見えて変わる。範囲に入れない字は、並びの後ろの書体（`--font-ja-heading-fallback`）で組む。字形の無い空白（U+00A0）は、倍率を掛けても見た目が変わらないので範囲に入れてよい。
- **カーニングを持つ書体では、字1つの送り幅ではなく、和文の中での幅を比べる。** Noto Sans JP の「—」は 894/1000em だが、カーニングが前後の和文とのあいだを広げ、「ネ—」「—基」は Zen Antique と同じ 2em、「ネ——手」は 4em になる（2つ並んだ「—」のあいだは詰め、前後の和文とのあいだは広げる）。「—」だけに 111.86% を掛けると、カーニングも倍率ごと掛かって、和文の中で 1.12em に広がった（実測・cycle-316。倍率の違う face をまたいでも、同じ書体どうしならカーニングが掛かる）。こうした字は範囲に入れない。
- **範囲を重ねない。** 重ねると後に書いた規則が勝つ（CSS Fonts 4）が、読む人がどの倍率で組むかを追いにくい。
- **`local()` には full name と PostScript name の両方を書き、名前は書体の `name` 表で確かめる。** 仕様上 `local()` が照らすのはこの2つで、family name ではない。Noto Sans CJK JP の full name は「Noto Sans CJK JP」で、「Regular」が付かない（Noto Sans JP の full name は「Noto Sans JP Regular」）。

これで、Zen Antique に無い字（`data-heading-font="fallback"` の見出しに使われる字）と下の3章の字を除き、読み込みの前後の送り幅が揃う。行の高さは `line-height: 1.25` の数で決まり、代わりの書体の縦のメトリクスは行の高さに効かない（Chromium で、行の数が同じ見出しの高さは読み込みの前後で 0.5px 以内。実測・cycle-316）。

### 書体ごとの比（実測・cycle-316）

Google Fonts の CSS API に User-Agent を送らずに頼むと分割されていない TrueType が返るので、それを fontTools で読んで、Zen Antique にある字ごとに送り幅の比を出した。Noto Sans CJK JP の OTF は jsDelivr（`cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf`）から取れ、比とカーニングは Noto Sans JP と同じだった。

| 書体                                    | 漢字・々〆 | 仮名                                  | 和文の約物・全角の形・罫線・「…」 | 「—」                                       | 折れない空白 U+00A0                   | カーニング                  |
| --------------------------------------- | ---------: | ------------------------------------- | --------------------------------: | ------------------------------------------- | ------------------------------------- | --------------------------- |
| BIZ UDGothic                            |      0.996 | 1.0                                   |                               1.0 | 2.0（半角。字面が変わるので範囲に入れない） | 0.56                                  | 無い（GPOS が無い）         |
| Noto Sans JP（Noto Sans CJK JP も同じ） |      0.996 | 1.0                                   |                               1.0 | カーニングで和文の中は 1.0                  | 1.25（「—」と組んで揃うので掛けない） | 仮名の一部の組と「—」の前後 |
| WenQuanYi Zen Hei                       |      0.996 | 0.9771（1023/1000em。「・ー」は 1.0） |                               1.0 | 1.0                                         | 字が無い                              | 無い                        |

読み込みの前の見出しを組む書体は、Windows 10 1809 以降では並びの先頭の BIZ UDGothic（OS の標準の書体）、macOS・iOS ではヒラギノ角ゴ ProN、Android では Noto Sans CJK JP である。游ゴシック Medium は、BIZ UDGothic の無い Windows で当たる。

ヒラギノ角ゴ ProN と游ゴシック Medium は、書体のファイルが手に入らず測っていない。JIS の全角の書体として漢字・仮名・和文の約物を 1000/1000em とみなし、漢字だけに 0.996 を掛け、「—」と U+00A0 は範囲に入れていない。この2つの値とカーニングの有無は推論である。BIZ UDGothic は Google Fonts の版で測ったので、Windows に入っている版で `local()` が当たり、同じ幅であることは確かめていない。Android の Chrome が `local("Noto Sans CJK JP")` を端末の書体に照らせることも、この環境の再現でしか確かめていない。どれも実機（macOS・iOS の Safari、Windows の Chrome・Edge、Android の Chrome）で、Zen Antique を止めた組みと読み込んだ組みの見出しの行の数を比べて確かめる。

## 3. `size-adjust` では揃わないもの

- **連続約物の詰め（`text-spacing-trim`）。** Chromium の既定（`normal`）は、書体が `halt` か `chws` を持つとき、「、「」「。」」のような約物の並びを詰める。Zen Antique はどちらも持たないので詰まらないが、読み込みの前に組むヒラギノや Noto Sans CJK JP は持つので、読み込みの前だけ詰まって狭くなる（Noto Sans JP で「あ、「い」。」が 6em → 5em。実測・cycle-316）。Zen Antique で組む見出しに `text-spacing-trim: space-all` を掛けて、どちらの書体でも詰めない。本文の書体で組む見出し（`data-heading-font="fallback"` の見出しと、Web フォントを読み込まない 410 のページの h1）は、読み込みの前後で和文の書体が替わらないので掛けない。掛けると読み込み後の組みが変わり、`space-all` は行末の閉じ括弧も詰めないので、「纁（sohi）」が狭い幅で「纁／（sohi／）」と折れ、「）」が1字で行の頭に立った（実測・cycle-316）。属性は見出しそのものにも、見出しを包む要素にも付くので、属性の側で `--heading-text-spacing-trim` を `normal` に替え、見出しの規則がその変数を読む。
- **仮名のカーニング（Android・Noto Sans CJK JP で残る差）。** Noto Sans JP・Noto Sans CJK JP は、全角の仮名の一部の組を詰める（「クタ」で 40/1000em、「イズ」で 30/1000em）。Zen Antique は和文にカーニングを持たないので、読み込みの前だけ、カタカナの多い見出しが少し狭い。組ごとに値が違うので、倍率では打ち消せない。代わりの書体だけカーニングを止める方法も無い。`@font-face` の `font-feature-settings` 記述子を、Chromium 141 は無視する（実測・cycle-316）。
  - 残る差の大きさ: Android の形の環境（Noto Sans CJK JP を `sans-serif` にした環境）で、616 ページ × 5 幅（320〜412px）× 3 通り（既定・文字サイズ 200%・拡大 200%）の見出しのうち、読み込みの前後で行の数が変わるものは、この組み方の前の 1060 通りから 59 通りに減った。320px・既定の記事の h1 は 19 本から 6 本になった。残る 59 通りの多くは文字サイズ 200% である。
  - 前後の差が大きくなったのは 25 通りで、うち 23 通りは、この組み方の前には行の数が変わらなかった。前は、漢字の広すぎる分と、詰まった仮名の狭すぎる分が打ち消し合って、たまたま揃っていた。漢字の幅を揃えたので、仮名の詰めの差だけが残った。直った 1024 通りと比べて少なく、その多くは文字サイズ 200% なので、受け入れる。
  - 見出しに `font-kerning: none` を掛ければ、この差はほぼ消える（59 通り → 1 通り）。ただし、読み込み後に IBM Plex Sans で組む欧文のカーニングまで止まり、欧文を含む見出しの 29 通りで、読み込み後の行の数が変わった（「深緋（kokiake）」が 2 行 → 3 行など。実測・cycle-316）。読み込み後の見た目は変えない（`DESIGN.md` §3）ので、採らない。
- **字形の幅が書体ごとに違う字**（「×」「“」など）。上の決まりどおり範囲に入れないので、読み込みの前後で幅が変わる。WenQuanYi Zen Hei の「×」は 0.6em（Zen Antique は 1em）で、この環境では文字サイズ 200%・390px の h2 が1本だけ行の数を変える。

## 4. 確かめ方

- **読み込みの前の組みは、`--font-zen-antique` を無い書体の名前に差し替えて作れる。** `<html>` の style に `--font-zen-antique: "No Such Font"` を置くと、並びから Zen Antique が外れ、読み込みの前と同じ書体で組み直す。1回の読み込みで、Zen Antique を読み込んだ組みと外した組みを続けて測れる（ネットワークで Zen Antique の分割ファイルを止めた組みと同じ高さになることを確かめた）。
- **幅と文字サイズを同じページで変えて測る。** `page.setViewportSize` で幅を変え、`html { font-size: 200% }`（文字サイズ）と `html { zoom: 2 }`（拡大）の style を足し外しすれば、読み込み直さずに組みを測れる。616 ページ × 5 幅 × 3 通りの見出しを1回の走らせで測れた。
- **行の数は、見出しの高さから上下の余白と線を引き、`line-height` の px で割って丸める。**
- **端末の書体は、Chromium を起こすときの `FONTCONFIG_FILE` で替えられる。** `/etc/fonts/fonts.conf` を include し、書体のファイルを置いた `<dir>` と自分の `<cachedir>` を足した fonts.conf を作り、その環境変数を付けて起こしたブラウザだけに書体を足す（ホームの `~/.fonts` に置くと、同じ機械で同時に動くほかのブラウザにも効く）。BIZ UDGothic・Noto Sans JP は Google Fonts から、Noto Sans CJK JP は jsDelivr から取れるので、Windows・Android の読み込みの前の組みをこの環境で再現できる。Android の形にするときは、`<alias binding="strong"><family>sans-serif</family><prefer><family>Noto Sans CJK JP</family></prefer></alias>` も足し、並びの最後の `sans-serif` を Noto Sans CJK JP にする。
- **どの書体で組まれたかは、CDP の `CSS.getPlatformFontsForNode` で確かめる。** `local()` が当たったかどうかが分かる。
