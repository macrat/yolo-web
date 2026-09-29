# コピーとクリップボードの挙動

来訪者がページの字を選んでコピーしたとき、ブラウザがクリップボードに何を写すかと、その中身を変えるときの組み方について、このサイトで確かめた非自明な挙動と対処。各項の末尾の「根拠」に、実測・確認・推論の別と、根拠になったサイクルを書く。

---

## 1. 語結合子（U+2060）は、選んでコピーした文にそのまま残る

折らないために字のあいだに置いた語結合子は、見えないが、Chromium で選んでコピーすると text/plain にも text/html にもそのまま入る。記事の h1 からコピーした「not-found.tsx」を端末やエディタに貼ると、見えない字のせいでファイル名やパッケージ名が一致しない。ページ内の検索（`window.find`）は元の文で当たるので、検索だけで確かめても気付けない。

このサイトで語結合子を置くのは2か所ある。`joinDashes`（`src/lib/phrase-dashes.ts`。`PhrasedText` が組む見出しと名前の、ハイフンの後ろとダッシュのまわり）と、json-formatter の `keepTogether`（`src/tools/json-formatter/JsonFormatterTile.tsx`。誤りの文の「1行目」「9文字目付近」の字のあいだ）である。ルートのレイアウトが置く `WordJoinerCopyFilter`（`src/components/WordJoinerCopyFilter`）が、どちらもコピーした文から除く。受け手が除くのは U+2060 だけなので、折らないために見えない字を置くときは U+2060 を、`@/lib/phrase-dashes` の `WORD_JOINER` で書く（ゼロ幅の空白などほかの見えない字は、除かれずに写る）。置く2か所と受け手は、どれもこの定数を読む。入力欄の中の選択は、来訪者が入れた字なので除かない。選んだ字を引いて落とす（ドラッグ）ときは、運ぶ文に語結合子が残る。Chromium は `dragstart` を起こす前に運ぶ中身を作るので、出来事の中で写さない字にする組み方（2）が効かず、`dragstart` で中身を自分で組むと 2 の崩れが戻る。見出しを引いて端末やエディタへ落とす来訪者は少ないので、このサイトはこれを受け入れている。コードから写す `copyText`（`src/lib/clipboard.ts`）は渡された文をそのまま写し、いまの呼び手（`CopyButton`・`ShareButtons`・`FudaActions`・`InviteFriendButton`）は、どれも語結合子を置く前のデータの文か URL を渡す。

根拠: 実測（cycle-316。本番ビルドを Chromium の本体 `chromium-1194` で開き、記事 `nextjs-global-not-found-for-multiple-root-layouts` の h1 を選んで Ctrl+C。受け手を止めると text/plain・text/html のどちらにも語結合子が 4 個残り、受け手があるとどちらも 0 個。json-formatter の誤りの文も、受け手があると 0 個。h1 を選んでドラッグすると、`dragstart` の受け手の中の `getData("text/plain")` にすでに語結合子が 4 個入っていた（review-t5-3b-done-3.md））。`copyText` の呼び手は確認（cycle-316）。Firefox と Safari は測っていない。

## 2. 写す文を変えるときは、写す文を自分で組まず、行の組みも変えずに、ブラウザに組ませる

コピーの出来事で `preventDefault` し、`Selection.toString()` と `Range.cloneContents()` から text/plain と text/html を組み直すと、ブラウザがコピーのときに行う直しが抜ける。

- リンクの `href` が相対の URL のまま写る。ブラウザのコピーは絶対の URL にする。相対の URL は、メールや文書に貼ると貼った先の場所で解かれて行き先を失う。
- `<script>`（JSON-LD など）と、CSS で隠れた要素（広い画面で隠す2つ目の目次の見出しなど）が写る。ブラウザのコピーは描かれていないものを入れない。
- `user-select: none` の字（パンくずの区切りの「/」）が写る。Chromium の `Selection.toString()` は `user-select` を見ない。
- 折れない空白（U+00A0）は、`Selection.toString()` ではそのまま残る。ブラウザのコピーは text/plain で普通の空白にする。

ブラウザに写させるために、出来事の中で文書の字を除いてから戻すと、除いたあいだに行の組みが変わる（1280px の記事の h1 は、語結合子を除くとハイフンで折れて高さが 489.6px から 408px になる）。描く前に戻せば画面には出ないが、そのあいだにヒットテストが走ると（マウスがページの上にあるときのホバーの直しなど）、layout-shift の記録になる。Ctrl+C のようにキーで写せば `hadRecentInput: true` で CLS に入らないが、右クリックや「編集」のメニューから写すと、ページに入力が届かないので `hadRecentInput: false` になり、CLS に入る（1280px の h1 で1回に 0.241）。

そこで `WordJoinerCopyFilter` は、字を除かず、写さない字にする。コピーの出来事の中で、選んだ範囲にかかる字の節の語結合子を1字ずつ `user-select: none` の span に入れ（`splitText` で分ける）、`preventDefault` せずにブラウザに写させ、次の `requestAnimationFrame` と `setTimeout` のうち先に来たほうで、span と分けた節を除いて元の字の節に字を戻す（どちらが先かは描く時機で変わり、描かないタブでは `setTimeout` だけが来る）。語結合子は文書に残るので行は変わらず、キーでもメニューからでも layout-shift は起きない。クリップボードの中身は、受け手を止めたときの中身から語結合子を除いたものと、text/plain・text/html とも同じになる。

この組み方が効くのは、ブラウザが `user-select: none` の字を写さないときである。Chromium では写さないことを測った。WebKit は長くこの字もクリップボードに入れていて、直ったのは 2022年12月（[WebKit bug 80159](https://bugs.webkit.org/show_bug.cgi?id=80159)、257749@main）なので、それより古い Safari では語結合子が写る。Safari と Firefox では測っていない。

- 戻すのをマイクロタスクにすると間に合わない。ブラウザが起こした出来事では、受け手を呼ぶたびにマイクロタスクが走り、そのあとでブラウザが写すので、戻した字が写る。`setTimeout` か `requestAnimationFrame` で戻す。
- span を足しても行が変わらないのは、字が行の中の字として組まれるときである。親が flex や grid の容器だと、字の節を分けると並ぶ項目が増える。いま語結合子を置く所（`PhrasedText` の要素と、json-formatter の誤りの文の段落）の親は、どれも `display: block` だった。
- 行は変わらないが、span の境で字の組み（シェーピング）が分かれるので、戻すまでのあいだ、語結合子の隣の字の x と幅は 1/64px（0.0156px）ほど動き、字の幅で大きさが決まる箱は、最大でその分だけ広がることがある。layout-shift の数には入らない（Chromium は 3px に満たない動きを数えない）。容器の端いっぱいに縮めて組んだ箱（inline-block や flex の項目）の中に語結合子を置くと、この差で折り返しが変わりうる。
- Chromium の選択は、子の並びの位置で持つ端（`selectNodeContents` で選んだ `(h1, 9)` など）を、子が増えたあと、`focusOffset` や `getRangeAt(0).endOffset` では増えた数で返すのに、写す範囲と `Selection.toString()` では増える前の位置のまま扱う（h1 を `selectNodeContents` で選ぶと、どちらも「…not-found.tsx が」で切れた）。端の数を読んでもずれは見えないが、`toString()` を読めば見える。端が分けた字の節かその親にあるときは、分けたあとの同じ位置を計算して `setBaseAndExtent` で置き直し、戻したあとに元の端に戻す。それ以外の端（Ctrl+A など）は置き直さない。Ctrl+A の「全体の選択」は、同じ端で置き直してもふつうの範囲に変わり、次のコピーで末尾の改行が落ちる。
- 分けて戻すあいだの DOM は、画面には出ないが、`MutationObserver` には届く。`document.body` を `childList`・`characterData`・`attributes`・`subtree` で見ると、語結合子 4 個の見出しを1回写すたびに、記録が 38 件（`childList` 28、`characterData` 10）で、`MutationObserver` のコールバックは 2 回呼ばれた。
- 読み上げのライブリージョン（`role="alert"` などの中）の字の節を分けて戻すと、変更として読み上げに知らされうる。json-formatter の誤りの文は `ErrorMessage` の `role="alert"` の中にあるので、これを写すと VoiceOver が誤りの文を読み直すかもしれない。Chromium でしか測っておらず、実機の VoiceOver では確かめていない。
- 戻す前に React が同じ字の節を描き替えたときは、分けた節は除くが、字は戻さない（描き替えた字を古い字で上書きしない）。元の字の節そのものは入れ替えないので、戻したあとの React の描き替えも正しく当たる。

根拠は実測（cycle-316）。本番ビルドを Chromium の本体 `chromium-1194`（Chrome 141.0.7390.37）で、画面の高さ 900px の 1280px と 375px で開き、記事 `nextjs-global-not-found-for-multiple-root-layouts` を写した。組み直す受け手では、「見出しから最初のリンクのある段落まで」「Ctrl+A」で、相対の `href`・`<script>` 8 個・隠れた目次の見出し・パンくずの「/」が入った（review-t5-3b-done-2.md）。メニューからのコピーは、h1 を3度押して選び、h1 の上で右クリックして 700ms か 1500ms 待ってから `document.execCommand("copy")` で写して模した（Playwright ではブラウザのメニューの項目を押せない。3000px 送った所の Ctrl+A は、余白を押して Ctrl+A し、右クリックから 1500ms 待った）。受け手の組み方ごとに3回ずつ測った。

- 字を除いて戻す組み方: メニューからのコピーで、1280px の h1 は毎回 0.127 と 0.114（`hadRecentInput: false`）、375px の h1 は 0.019 と 0.014（`false`）、3000px 送った所の Ctrl+A は 0.044 と 0.044（`false`）と `scroll` 2 回（2918 → 3000）。キーで写すと同じ値が `hadRecentInput: true` で出た。
- 除くあいだ、変わる字を含むブロックの幅と高さを `style` で固定する組み方（`overflow: hidden` も、`contain: size` を足しても同じ）: layout-shift は 0 件になったが、text/html の h1 に固定した `width`・`height`・`overflow` が入り、受け手を止めたときの中身と違った。
- 画面の外に置いた写しを選んで写させる組み方: layout-shift は 0 件になったが、text/html は元の場所の書式を失って別物になり（段落までの選択で 20,867 字、止めると 36,011 字）、text/plain も末尾の改行が落ちた（Ctrl+A で 11,970 字）。
- 語結合子を `user-select: none` の span に入れる組み方: メニューでもキーでも、どの場面でも layout-shift と `scroll` は 0 件。クリップボードは、見出しを3度押した選択・`selectNodeContents` の選択・段落までの選択・Ctrl+A（3回続けて 1280px は 11,971 字、375px は 11,707 字）のどれも、受け手を止めたときの text/plain・text/html から語結合子を除いたものと同じで、選択の両端と文書も元に戻った。コピーの出来事の中で `elementFromPoint` を呼んでも、マウスを動かしてから写しても、指の模倣でも 0 件。画面の枠（CDP の screencast）は、写すたびに1枚出て、前の枠と画素が同じだった（3000px 送った所のメニューからのコピーで、9回のうち最初の1回だけ 384,538 画素が違った。続けて測った6回はどれも同じだったので、写す前に取った枠が古かったと見られる。推論）。json-formatter の誤りの文を写すと、クリップボードは「JSONの形式が正しくありません。（1行目、9文字目付近）」で、そのあと React が描き替えた誤りの文も正しかった。語結合子を持つ要素の中の字ごとの矩形を、写す前とコピーの出来事の中（受け手の後）で比べると、y と高さはどれも同じで、x と幅は最大 0.0156px 動いた（記事の h1 の 1280px・375px、password-generator のチェックボックスの名前、`/dictionary/humor/wifi` の h1）。箱の幅は、password-generator の「小文字 (a-z)」の span が 89.813px から 89.828px に広がり、同じページの「大文字 (A-Z)」の span（92.938px）と、記事の h1 などブロックの箱は変わらなかった。語結合子を持つ本番のページは、診断の結果のページを含めて 41 ページあり、語結合子を持つ字の節の親はどれも `display: block` だった（review-t5-3b-done-8.md）。`MutationObserver` の記録は、見出しを3度押して Ctrl+C で写して数えた。戻す時機は、受け手の後に置いた `requestAnimationFrame` と `setTimeout` で見た。6回のどれも `requestAnimationFrame` が先（2.6〜13.7ms）で、そのときもう span は無かった。第8回のレビューの測りでは `setTimeout` が先（2.3ms、`requestAnimationFrame` は 13.6ms）だった（review-t5-3b-done-8.md）。
- 分けたあとに端を置き直さないと、`selectNodeContents(h1)` の選択と json-formatter の誤りの文の選択で、写す字が最初の語結合子のある節で切れた。h1 では、コピーの出来事の中で子が 9 から 17 に増え、`focusOffset` と `getRangeAt(0).endOffset` は 17 だったが、`Selection.toString()` は 38 字（「…not-found.tsx が」まで。語結合子 1 個を含む）、クリップボードは 37 字で、同じ所で切れていた。
- マイクロタスクで戻すと、クリップボードに語結合子が 4 個残った（字を除いて戻す組み方で測った）。
