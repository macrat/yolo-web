# cycle-320 のコードのレビュー（第4回・HEAD c15d5ebe）

対象: 作業ブランチ `design-rollout` の 412db94e から HEAD（c15d5ebe）までの `src/` の変更すべて。`git diff 412db94e HEAD -- src/` を切らずに読んだ（src/play/quiz/pressGuard.ts 新規・src/play/quiz/_components/QuizContainer.tsx・src/lib/reveal.ts・src/lib/analytics.ts と、QuizContainer.pressGuard.test.tsx 新規（全 1,221 行）・reveal.test.ts・QuizContainer.reveal.test.tsx・analytics.test.ts）。照らした仕様は decision-landing.md の「決めたこと」と t5a-design.md 4-9。文書は、decision-landing.md の「決めたこと」、t5a-design.md 4-9 と 5章の写し、knowledge `input-events-and-guards.md` の冒頭・§8・§9、frontend-design の SKILL.md の送りと守りの項を、コードと突き合わせた。QuestionCard.tsx・QuestionCard.module.css（答えたあとの行の作りと `cursor`）も読んだ。

**結論: 改善指示**（来訪者に届くもの（`src/` のコードと試験）への指摘が3件ある。1件は、来訪者の約6割を占める iOS の Safari で守りが働かないおそれで、重い）

## 自分で確かめたこと

- `npx vitest run src/play/quiz src/lib/__tests__/reveal.test.ts src/lib/__tests__/analytics.test.ts` は 90 ファイル・2,099 件がすべて通った。`npm run typecheck` も通った。
- `createPressGuard` を直に動かす試し（`/home/user/yolo-web/tmp/review320c4/webkit.test.ts`。コミットに入らない）で、指摘1 と指摘2 の経路を再現した（下）。
- 手でたどって、決めごとのとおりと確かめた経路:
  - 起点。「はじめる」「次へ」は click の処理の中で切り替わり、`lastClick.transitionAtClick === previousTransition` で切り替えた click を見分ける。診断の答えは `answerClickRef` に残した click を、150ms のタイマーの切り替わりで起点にする。キーボード（`detail === 0`）は `press: null` で守りを閉じる。「もう一度挑戦する」は閉じ、2打目の「はじめる」はその押しが起点になる。
  - 守りの種類（`start`・`next`・`result`・`answer`）の当て方は表どおり。
  - 1打目の click より先に届く2打目の `pointerdown` は、`open()` で並び（`waiting`）の中から判定する。答えを見せる間に押し下げて切り替わりのあとに離す押しも同じ。hover を持つペン（`mousedown` が見せる間に届く）も、`click` は守りが開いたあとに届くので止まる。
  - マウスの連続は、`mousedown` の `detail` と `mouseCandidateOf` で決める。
  - 右ボタン・2本目の指は記録しない。引いて送りは `pointercancel` で外す。100px の外・700ms 以上・連続でない押しは通す。
  - 守りは `QuizContainer` が付けたときだけ `window` に付き、外すときに外れる。ほかのページへは漏れない。
- A″（`chooseTouchClearLanding`）は decision-landing.md 2 と一致する。16 以上の回は罫線の内側の矩形と max(dx, dy)、無い回は `chooseLanding` をそのまま使う。試験の値（−4・−26・4・16・70・20・−21・85・36・−36）も手で確かめた。
- GA の `quiz_press_guarded`（1つの守りで初回だけ、止めたときだけ）と `quiz_press_guarded_retry`（止めた事象の的の押せるもの、押し下げからの経過、3 秒ちょうどを含む）は、決めごとのとおり組まれている。
- スクリーンショットは撮っていない。この範囲で見た目に出るのは、着地の送りの量と、押しが働かないことだけである。どちらも、本番のビルドを走らせる条件7・D5 の測りで確かめる。

## 指摘

### 指摘1（来訪者に届くもの・重い）: `click` の `pointerId` がどの押しとも合わないと、その click を押しに結ばない。iOS の Safari では守りが開かないおそれがある

`clickPairIndex` は、`click` が `pointerId`（0 以上）を持てば、同じ番号の押しだけを探す。見つからなければ -1 を返し、`handleClick` は `paired = null` で進む。すると次のことが起きる。

- 受けないと決めた押しの click が、止まらずに通る。
- `lastClick.press` が null になる。`QuizContainer` の `guardAfter` は `cause?.press` が無いと `close()` するので、その押しで切り替えたあとの守りがまったく開かない。

この番号を頼りにしてよい根拠は、Chromium の実測だけである（knowledge §9）。WebKit は Safari 18.2 で click を `PointerEvent` にしたが、タッチの tap の click の `pointerType` が `"mouse"` になる不具合が報告されている（[WebKit Bug 282988](https://bugs.webkit.org/show_bug.cgi?id=282988)）。直し（288873@main）は退行で戻され、2026-01-16 の更新の時点でも REOPENED のままである。仕様は click の `pointerId` と `pointerType` を元の押しと同じにすることを求めるが、`pointerType` をマウスの値で出す実装は、`pointerId` もマウスの値（1）で出している見込みが高い。タッチの押しの番号が 1 でなければ、iOS 18.2 以降のすべてのタップで上のことが起きる。

- 「はじめる」「次へ」→1問目・次の問の窓の守り、結果への窓の守り、診断の答えの連続の押しの守りが、タッチではどれも開かない。
- 診断のプレイ面の閲覧の 58.9% が iOS（cycle-318/device-triage.md）なので、守りの目的（読んでいない問に二度押しで答えを入れない）が、来訪者の過半で果たされない。
- 着地の点（`lastClick.point`）は click の座標から取るので着地は働き、測りの道具は Chromium で走るので、条件7・D5 の測りもこの穴を見つけない。

再現: `webkit.test.ts` の1つ目。`pointerId: 2` のタッチの押しのあとに `pointerId: 1`・`pointerType: "mouse"` の `PointerEvent` の click を送ると、`lastAcceptedClick().press` が null になる。

直し方の案:

- 番号で見つからないときは、番号を持たない click と同じに、いちばん古い押しに結ぶ。番号を使うのを、click の `pointerType` が押しの `pointerType` と合うときに限ってもよい。Chromium の形（番号が合う）はいまと変わらない。
- 試験に、WebKit の形（click が `pointerType: "mouse"`・`pointerId: 1` の `PointerEvent`、タッチの押しは別の番号）の組を足す。
- 文書のうち同じ結び方を書く所（decision-landing.md 1 の「押しの単位」、t5a-design.md 4-9 と 5章の写し、SKILL.md の「押しと `mousedown`・`click` の結び方」、knowledge §9 の「`click` は押しの番号を持つ」）も、合わないときの扱いと、WebKit の現状（Chromium だけの実測であること）を書いて合わせる。

### 指摘2（来訪者に届くもの・中）: 互換の事象を出さないタップのあと 1 秒のうちに来た押しの `mousedown` を、古い押しに結ぶ。止めない押しの `mousedown` を止め、偽の `quiz_press_guarded_retry` を送る

`handleMouseDown` は、`mousedown` を「`mousedown` をまだ受けていないいちばん古い押し」に結ぶ。tap と取られて互換の事象を出すはずの押しが、実際には出さなかったとする。その押しは、離してから `COMPAT_EVENTS_WAIT_MS`（1 秒）たって次の押し下げが来るまで並びに残り、次の押しの `mousedown` を取る。

互換の事象を出さないタップには、次のものがある。

- Chromium で実測されたもの: 2本の指の押し、長押し。
- iOS の Safari で起きうるもの: 押せない要素（click の受け手も `cursor: pointer` も持たない字）へのタップ。iOS の Safari は、そういう要素へのタップにマウスの事象（`mousedown`・`click`）を出さないことが、古くから知られている。`window` と document の受け手はこの判定に数えられない（推論。いまの版では確かめていない）。QuestionCard.module.css で `cursor: pointer` を持つのは押した行の字（`.pressedFace`）だけで、問の見出しや結果の字は持たない。

当てはまるのは、守りが受けない二度押しの2打目のうち、まさに着地がそうなるよう選んだ「押せない字の上」に落ちた押しである。例として、「はじめる」を二度押しし、2打目が1問目の上の押せない字に落ちたとする。この2打目は窓の中なので `blockedBy` を持つ。そのあと、来訪者が 2打目を離してから 1 秒のうちに選択肢を押すと、次のことが起きる（`webkit.test.ts` の2つ目で再現した）。

- その押しは窓の外なので受けるはずだが、`mousedown` は古い押しに結ばれて `preventDefault` され、`quiz_press_guarded` が送られる。
- `pendingRetry` の元が、その選択肢になる。
- 番号の合う click（Chromium の形）なら、同じ押しの click は受けられ、`noteAccepted` が同じ選択肢として `quiz_press_guarded_retry` を送る。経過は2打目の押し下げからの数百 ms になる。T10 が害の印として読む「読んでから選んだ押しより早い山」に、害でない押しが入る。
- 番号を持たない click（iOS の 18.2 より前）か、指摘1 の直しでいちばん古い押しへ戻すときは、click も古い押しに結ばれる。読んでから選んだ答えを止めるか、逆に、止めるはずの押しを通す。

直し方の案: 互換の事象を押しに結ぶとき、順だけでなく位置でも結ぶ。互換の `mousedown`・`click` の座標は、その押しの離しの点（タッチの調整のあとの点）にほぼ重なる。たとえば、`pointerup` の座標を押しに覚え、待っている押しのうち座標がいちばん近いもの（数 px の中）に結び、無ければ順で結ぶ。iOS で押せない字へのタップが互換の事象を出すかは、確かめられるなら確かめる。この木には WebKit が無い。確かめられないなら、確かめていないことを knowledge §9 に書き、どちらの場合でも誤らない作りにする。試験には、「互換の事象を出さないタップのあと 1 秒のうちの、別の点の押し」が受けられ、`quiz_press_guarded` と `_retry` を送らないことを足す。

### 指摘3（来訪者に届くもの・試験・小さい）: 試験の事象の値が、どのブラウザの形とも合わない所があり、Chromium の実際の経路と WebKit の経路を試していない

QuizContainer.pressGuard.test.tsx の冒頭は「事象は、ブラウザが送る順と値で組む」と書いている。しかし共通の部品は、どのブラウザの形とも合わない。

- `pointerOf` は、タッチの押しにいつも `pointerId: 1` を付ける（Chromium は押しごとに新しい番号を付ける）。
- `release` と `press` は、click を番号を持たない `MouseEvent` で送る（Chromium の click は押しの番号を持つ `PointerEvent`）。

そのため、タッチとペンの試験のほとんどは「番号を持たない click → いちばん古い押し」の経路だけを通る。Chromium の実際の経路（番号で結ぶ）を通るのは、`clickCarriesPointerId` を使う1件だけで、指摘1 の WebKit の形はどこにも無い。番号で結ぶ所に誤りがあっても、試験が通ってしまう形である。

直し方の案:

- 押しの部品の既定を、押しごとに別の番号を付け、click を番号を持つ `PointerEvent` で送る形にする（マウスは番号 1 のまま）。
- 主な試験（窓の中の押し・連続の押し・見せる間の押し）を、click の3つの形（Chromium・番号を持たない形・WebKit の `"mouse"` の形）で回す。

## 文書とコードの突き合わせ

decision-landing.md の「決めたこと」、t5a-design.md 4-9 と 5章の写し、knowledge の冒頭・§8・§9、SKILL.md の送りと守りの項は、いまのコードのふるまいと合っている。リスナの組（`pointercancel` を含む5つ）、並びで結ぶこと、外す押し、`COMPAT_EVENTS_WAIT_MS`、`chooseTouchClearLanding` と `chooseLanding` の分担、`closestPressable` で取る押し直しの元がこれに当たる。ただし、指摘1・2 の直しで結び方が変わるので、同じ所を合わせて直す必要がある（指摘1 に挙げた4か所）。ほかに、言い回し・数え方・置き場だけの食い違いは見つからなかった。

## アンチパターンの照らし合わせ

- implementation.md / workflow.md: 指摘1 は、1つのブラウザ（Chromium）で測った事象の形を、確かめずに全部のブラウザに当てはめた形である。主な来訪者の環境（iOS の Safari）での前提を確かめていない。測りの道具も Chromium だけなので、合否の線でも見つからない。直すときは、確かめていない前提を、誤っていても安全な側（守りを開く側、受けるべき押しを受ける側）に倒す作りにすること。
- ツギハギ: `src/` の新しいコードとコメントに、経過の跡は見当たらない。

## 結論

**改善指示**。指摘1〜3 はどれも来訪者に届くもの（`src/` のコードと試験）なので、builder に直させ、前回の指摘だけでなく全体の見直しを含めて、もう一度レビューを受けること。指摘1 と 2 の直しは結び方の決めごとを変えるので、decision-landing.md 1・t5a-design.md 4-9 と 5章・SKILL.md・knowledge §9 も、コードと同じ中身に直すこと。
