# 振り分けで確かめた一次資料（device-triage.md 2章）

[device-triage.md](./device-triage.md) の振り分けが頼る外部の仕様と、一次資料で決まらないこと。どれも 2026-10-05 に確かめた。

## 確かめたこと

- MDN `touch-action`（https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action ）: `manipulation` はパンとつまむ拡大を残し、ダブルタップの拡大を止め、click を遅らせる必要を無くす。触れが始まったとき、触れた要素とその祖先（最初の送れる要素まで）の値の交わりが効く。触れの途中で値を変えても、その触れには効かない。
- WebKit blog「More Responsive Tapping on iOS」（2015年。https://webkit.org/blog/5610/more-responsive-tapping-on-ios/ ）: iOS は1回の押しと2度の押しを見分けるため 350ms 待つ。`width=device-width` のページで初めの倍率のときは、**2度の押しの身ぶりを止めることで**1回の押しを速くした。初めの倍率でないとき（つまんで拡大したあと）は、この扱いにならない。`touch-action: manipulation` の要素で始まる触れは、パンとつまむ拡大だけに使われ、これは**どの倍率でも**効く。祖先のどれかが `manipulation` なら1回の押しは速い。
- MDN `@media (hover)`（https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover ）: `none` は主な入力が hover できないか、しにくいもの（長押しで hover を模すモバイル）。Baseline（2018年12月から）。
- Apple「Safari Web Content Guide — Handling Events」（https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html ）: 押せる要素を1本指で押すと mouseover → mousemove → mousedown → mouseup → click が送られる。mouseout はほかの押せる要素を押したときだけ起きる。**保守されない古い文書**（2016-12-12 更新）なので、いまの iOS がそう振る舞う根拠にはしない。
- CSS Values 4（W3C 作業草案 2024-03-12。https://www.w3.org/TR/css-values-4/#small-viewport-size ）: 小さいビューポートは、出入りする UI（ツールバー）を出した状態の大きさ。`100svh` は、その UI がすべて出ていても隠れない高さ。
- MDN browser-compat-data（https://github.com/mdn/browser-compat-data ）: `css/types/length.json` で `sv*` の単位は Safari 15.4・iOS の Safari 15.4・Chrome 108 から。`css/selectors/has.json` で `:has()` は Safari 15.4・iOS の Safari 15.4・Chrome 105 から。
- HTML Standard 15.5.3 Button layout（https://html.spec.whatwg.org/multipage/rendering.html#button-layout ）: `button` の `display` が `inline-flex` などなら、その値どおりに組む。幅が `auto` なら fit-content。名前の無い内側の箱は定めていない。
- CSS Fonts 4（W3C 作業草案 2026-09-13。https://www.w3.org/TR/css-fonts-4/#font-prop ）: `font` の一括指定は、`font-style`・`font-variant-*`（ligatures・numeric・position・alternates・east-asian・caps・emoji）・`font-weight`・`font-stretch`・`font-size`・`line-height`・`font-family`・`font-kerning`・`font-size-adjust`・`font-feature-settings`・`font-variation-settings`・`font-language-override`・`font-optical-sizing` を初期値に戻す。
- WebKit `Source/WebCore/css/html.css`（https://github.com/WebKit/WebKit/blob/main/Source/WebCore/css/html.css 、main）: `input, textarea, select, button` の規則が、iOS でないとき（Mac の Safari）に `font: -webkit-small-control` を掛け、どの端末でも `letter-spacing: normal`・`word-spacing: normal`・`line-height: normal`・`text-transform: none`・`text-indent: 0`・`text-shadow: none`・`text-align: start` を掛ける。そのあとの `button` を含む規則が、どの端末でも `text-align: center`・`padding-inline: 6px`・`cursor: default`・`box-sizing: border-box` を掛け、iOS ではさらに `font: 11px system-ui`・`padding-block: 0` を掛ける。
- W3C Core-AAM 1.2（勧告候補草案 2026-09-23。https://www.w3.org/TR/core-aam-1.2/ ）: `aria-describedby` は macOS の AX API で `accessibilityCustomContent` か `AXHelp` に写す。iOS（UIAccessibility）の写し方は定めていない。

## このリポジトリで確かめたこと

- Next.js が同梱する `postcss-modules-local-by-default`（`node_modules/next/dist/compiled/`）を pure の決まりで動かすと、`:root:has(.<局所のクラス>) { … }` は通り（局所のクラスを含むため。クラスは局所の名に替わる）、`:root { … }` だけの形は「not pure」で止まる。ページの CSS モジュールに根の規則を書く形（D1）は、この形で書く。

## 一次資料で決まらないこと

- いまの iOS の Safari が、`width=device-width` で初めの倍率のページで、2度の押しの拡大を止めているか（2015年の記述の後の版で変わっていないか）。
- 2度の押しの1打目が `manipulation` の要素で始まり、2打目がそうでない要素で始まったとき、拡大になるか。
- iOS の Safari が押したあとに `:hover` をどこに残すか（押した要素が別の要素に替わったときを含む）。
- iOS の Safari の2度の押しとみなす距離（Android は `ViewConfiguration.DOUBLE_TAP_SLOP` の 100dp。iOS は公開されていない）と、指の2打目が1打目からどれだけずれるか。
- iOS の VoiceOver が `aria-describedby` の文を読むか、いつ読むか（読み上げの詳しさの設定に左右されるかを含む）。
- iOS の VoiceOver が、ページがプログラムで動かしたフォーカス（`focus()`）にカーソルを移すか。
- ツールバーが出入りしたとき、画面の上端がページに対してどう動くか。
