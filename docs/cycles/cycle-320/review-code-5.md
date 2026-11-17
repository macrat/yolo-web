# cycle-320 のコードのレビュー（第5回・HEAD 641bb933）

対象: 作業ブランチ `design-rollout` の 412db94e から HEAD（641bb933）までの `src/` の変更すべて。`git diff 412db94e HEAD -- src/` を切らずに読んだ。読んだのは、src/play/quiz/pressGuard.ts（新規）・src/play/quiz/_components/QuizContainer.tsx・src/lib/reveal.ts・src/lib/analytics.ts と、QuizContainer.pressGuard.test.tsx（全 1,438 行）・reveal.test.ts・QuizContainer.reveal.test.tsx・analytics.test.ts である。照らした仕様は decision-landing.md の「決めたこと」と t5a-design.md 4-9。文書は、decision-landing.md の「決めたこと」、t5a-design.md 4-9 と 5章の写し、knowledge `input-events-and-guards.md` の冒頭・§8・§9、frontend-design の SKILL.md の送りと守りの項を、コードと突き合わせた。QuestionCard.tsx と QuestionCard.module.css（行の罫線と `::after` の押せる範囲）も読んだ。

**結論: 改善指示**（来訪者に届くもの（`src/` のコードと試験）への指摘が2件ある。1件は、ペンで読んでから選んだ答えを守りが止める不具合で、重い）

## 自分で確かめたこと

- `npx vitest run src/play/quiz src/lib/__tests__/reveal.test.ts src/lib/__tests__/analytics.test.ts` は 90 ファイル・2,239 件がすべて通った。`npm run typecheck` も通った。
- 実ブラウザ（Chrome for Testing 153、`/opt/pw-browsers/chromium-1243`、headless）で確かめたこと。サーバーは主の木（HEAD 641bb933）で `next dev -p 3151` を起こし、終わってから止めた。スクリプトは `/home/user/yolo-web/tmp/review320c5/` にある。
  - `real.mjs`: character-personality（375×800、`hasTouch`・`isMobile`）。CDP のタッチで「はじめる」を 0ms で二度押しすると、3回とも1問目に答えが入らず、`quiz_press_guarded` が1回送られた。答えのタップの 60ms あとに触れ、200ms 触れたまま（見せる 150ms のあとに）離す押しも、3回とも次の問に答えが入らなかった。そのあと 800ms 空けた押しは、どれも答えを入れた。
  - `pen.mjs`: CDP の `Input.dispatchMouseEvent`（`pointerType: "pen"`）のペンは、押しを分けても `pointerId` が同じ 2 のままだった。押し下げた的を押しのあいだに DOM から外すと、`pointerup`・`mouseup` は届いたが `click` は届かなかった（マウスと同じ）。
  - `scrollbar.mjs`・`drag.mjs`: マウスでスクロールバーを押すと `pointerup` は届き `click` は届かない。リンクを引くと `pointercancel` が届く。どちらも並びから外れ、残らない。
  - `twofinger.mjs`: 1本目に触れたまま2本目に触れて離すと、`pointerdown`・`pointerup` だけが届き、`mousedown`・`click` は届かない（knowledge §9 と同じ）。
- 変異の試し（`tmp/review320c5/mut/` に `src/` を写し、`pressGuard.ts` の1か所ずつを変えて QuizContainer.pressGuard.test.tsx の 212 件を回した。手順は `tmp/review320c5/mutate.sh`）。次の変更では、どの試験も落ちなかった（指摘2）。
  - マウスの押しを、次の押し下げで並びから外さない（`hasStoppedWaiting` のマウスの枝を消す）
  - `click` の番号を、`pointerType` を見ずに使う
  - `click` を受けた押しより前の押しを外さない（`slice` を、結んだ押しだけを外す形に変える）
  - `COMPAT_POINT_REACH_PX` を 0.5 にする
  - 離しの点を使わない（押し下げの点だけで隔たりを測る）
  - `pointerdown` の `isPrimary` の除き、`pointerdown` の `button` の除き、`mousedown` の `button` の除き（それぞれを外す）
  - 変えると落ちたのは、32px の絞りを外す・受ける押しを先に選ばない・`pointercancel` を受けない・`lastClickedPress` を当てない・タッチの 1 秒を外さない、の5つである。
- 手でたどって、決めごとのとおりと確かめた経路:
  - 起点の取り方。「はじめる」「次へ」は click の処理の中で切り替わり、`transitionAtClick` で切り替えた click を見分ける。診断の答えは `answerClickRef` の click を起点にし、キーボードは守りを閉じる。
  - 守りの種類と、知識クイズの答えたあと・「もう一度挑戦する」のあとで閉じること。
  - タッチの速い二度押しで、2打目の `pointerdown` が1打目の `click` より先に届く順。Chromium の番号の形、番号を持たない形、WebKit の `"mouse"` の形のどれでも、1打目に結ばれる。
  - 見せる間に押し下げ、切り替わったあとに離すタッチの押し。
  - キーボード（`detail === 0`）、100px の外、700ms 以上、連続でない押し、右クリック、引いて送り。どれも止めない。
  - 守りは `QuizContainer` が付けたときだけ `window` に付き、外すときに外れる。ほかのページへは漏れない。QuizContainer の画面には `<label>` が無く、label が出し直す click を別の押しに結ぶおそれも無い。
- A″（`chooseTouchClearLanding`）は decision-landing.md 2 と一致する。16 以上の回は罫線の内側の矩形（`li` の border を引いた padding box。`::after` の `inset: 0` と同じ箱）と max(dx, dy) で選び、無い回は `chooseLanding` をそのまま使う。試験の値も手で確かめた。
- GA の `quiz_press_guarded`（1つの守りで最初の1回、止めたときだけ）と `quiz_press_guarded_retry`（止めた事象の的の押せるもの、押し下げからの経過、3 秒ちょうどを含む）の条件と値は、決めごとのとおりである。
- スクリーンショットは撮っていない。この範囲で見た目に出るのは、着地の送りの量と、押しが働かないことだけである。前者は試験の値で、後者は上の実ブラウザの試しで見た。

## 指摘

### 指摘1（来訪者に届くもの・重い）: ペンでは、`click` を受けずに残った押しに、同じ番号の次の押しの `click` を結ぶ。読んでから選んだ答えを止め、偽の `quiz_press_guarded` と `_retry` を送る

`compatPairOf` は、`click` と同じ `pointerType`・`pointerId` の押しが並びにあれば、点も順も見ずに、そのうちのいちばん古い押しに結ぶ。Chromium のペンは押しを分けても番号が変わらない（`pen.mjs`。2打とも `pointerId` 2）。一方、`hasStoppedWaiting` は、`click` を受けなかったペンの押しを、離してから 1 秒たつまで並びに残す。

決めごとがまさに扱う経路で、これが起きる。

1. 診断で答えたあと、見せる 150ms のあいだに hover を持つペンで答えた行に触れ、切り替わったあとに離す。
2. Chromium では、押し下げた的が切り替わりで DOM から外れるので、この押しには `click` が来ない（`pen.mjs`。マウスと同じ）。守りを開いた時に、この押しは受けない押し（`blockedBy`）と決まり、そのまま並びに残る。
3. 来訪者が次の問を読み、離してから 1 秒のうちに、連続でない押しで選択肢を押す。この押しの `click` は、番号の合う残った押しに結ばれ、`preventDefault` と `stopPropagation` で止められる。

再現は `tmp/review320c5/mut/src/play/quiz/__tests__/probe2.test.ts` にある。番号 2 のペンで答え（1000〜1050）、見せる間に触れ（1120）、切り替わりのあとに離し（1250）、`click` は来ない。離しから 350ms の押し（1600〜1650、連続でない）を送ると、`mousedown` は通るが `click` は止まり、`quiz_press_guarded`（`answer`）が送られた。

来訪者への影響は次のとおり。

- 読んでから選んだ答えが入らない。止めるのは点に関係なく、同じペンの押しすべてである。結果の画面（窓の守り）でも、100px の外のリンクや「もう一度挑戦する」の押しが止まる。
- 止めた押しを押し直すと、並びに残った止めた押しに結ばれる。その次の押しも1つずれて結ばれ、1 秒空くまで戻らない。
- 止めた押しは `quiz_press_guarded` に数えられ、押し直しは `_retry` に数えられる。T10 が害の印として読む数に、守りの誤りが入る。
- 決めごとの「迷ったら来訪者の押しを止めない側に倒す」と逆向きの誤りである。

当たるのは、番号で結ぶ Chromium（Android の Chrome と Windows・ChromeOS の Chrome・Edge）のペンの来訪者である。番号を持たない click と WebKit の形は点と順で結ぶので、受ける押しを先に選び、当たらない。

文書にも誤りがある。decision-landing.md 1「押しの単位」（と t5a-design.md 4-9 の写し）は「hover を持つペンは … `click` だけが新しい画面に届く」と書くが、Chromium では届かない。試験も、ペンに押しごとに新しい番号を付け（`newPointerId`）、hover を持つペンの見せる間の押しに新しい画面の `click` を送っている。どちらも Chromium の値と違うので、この経路が試験で見つからない。

直し方の案:

- 同じ `pointerType`・`pointerId` の新しい `pointerdown` が来たら、同じ番号ですでに離し、`click` を受けていない押しは、もう互換の事象を受けないものとして並びから外す。番号で結ぶときも、同じ番号の押しが並びに2つ以上あるなら、点と順で選ぶ。
  - ただし、hover を持たないペンが番号を変えずにタッチの順（2打目の `pointerdown` が1打目の `click` より先）で事象を出すなら、前者の案は1打目を外してしまう。その組み合わせがあるかを確かめてから選ぶこと。
  - hover を持つペン（`mousedown` を押し下げのすぐあとに受けたペンの押し）を、マウスと同じく次の押し下げで外す形もある。
- 試験の部品で、ペンの番号を Chromium の値（押しを分けても同じ）にする。hover を持つペンの見せる間の押しは、`click` を出さない形（Chromium）で組む。そのうえで、その押しのあと 1 秒のうちの連続でない押し（同じ点・別の点・100px の外）が答えを入れ、`quiz_press_guarded` を送らないことを足す。
- 文書のうち同じことを書く所も、確かめた値に直す。decision-landing.md 1「押しの単位」の hover を持つペンの文と並びから外す押し、t5a-design.md 4-9 と 5章の写し、SKILL.md の「押しと `mousedown`・`click` の結び方」、knowledge §9（ペンの番号が押しを分けても変わらないこと、押し下げた的が外れたペンの押しは `click` を出さないこと）、pressGuard.ts の `open` のコメント、試験の冒頭のコメントがこれに当たる。

### 指摘2（来訪者に届くもの・試験・中）: 結び方のいくつかの決まりは、消しても試験が落ちない。試験の事象の値と順に、ブラウザが出さないものがある

変異の試し（上）で、次の決まりは消しても 212 件がすべて通った。

1. **マウスの押しを、次の押し下げで並びから外すこと。** この決まりを試すつもりの試験（「click を受けなかったマウスの押し（押し下げた的が DOM から外れた押し）は、同じ点の次の押しの click と結ばない」）は、次の押しを指で送っている。番号でも点と順でも結べてしまうので、決まりを消しても通る。この決まりが無いと、Chromium のマウスでは、`click` の来なかった押しのあとの押しの `click` が、同じ番号 1 の古い押しに結ばれる。すると守りの起点が古い押しになり、そのあとの押しも1つずれて結ばれる（`tmp/review320c5/mut/src/play/quiz/__tests__/probe.test.ts` で、決まりを消すと起点の時刻が 1500 でなく 1000 になった）。次の押しをマウスで送る試験にすること。
2. **点の絞りの幅（32px）。** どの試験も、互換の `mousedown` と `click` を押しと同じ座標で送るので、幅を 0.5px にしても通る。実際の互換の事象の点は、タッチの調整で寄せた点（knowledge §8・§9。半辺 10〜16px まで動き、真下に押せるものがあっても (65.2, 349.5) が (65, 350) になる）である。押せるものの縁の近くを押した押しのように、点が 10〜16px ずれる組を入れること。
3. **`click` を受けた押しより前の押しを外すこと。** 前の押しは、離してから 1 秒で外れるのを待つ形にしても通る。それを試すには、次のような組が要る。押せない字の上の、互換の事象を出さないタップを、起点から 32px より離れ、100px の中に置く。続けて、番号で結ぶ押しで起点を作る。そのあと 1 秒のうちに、そのタップの点の近くへ、窓の中の押しを番号を持たない形で送る。外していなければ、窓の中の押しの `click` が残ったタップに結ばれて通る。
4. **主のポインタでない押しを覚えないこと。** これを試す試験（「2本目の指の押し下げは押しを覚えず…」）は、2本目の指が触れたあとに、1本目の指の `mousedown` と `click` を送っている。Chromium は2本の指の押しに互換の事象を出さない（knowledge §9、`twofinger.mjs`）ので、この順はブラウザが出さない。しかも2本目の指は1本目と 150px 離れているので、覚えても点で外れ、`isPrimary` の除きを消しても通る。主のポインタでない押しが、その点の近くの次の押しの事象を取ることを確かめる形にすること（たとえば、2本の指の押しのあと 1 秒のうちに、2本目の指の点の近くへ、番号を持たない形で押す）。
5. 軽いもの（どれも、いまのつくりでは結び方の誤りに出にくい）:
   - `pointerdown` と `mousedown` の `button` の除きは、右ボタンの試験が片方ずつ消しても通る。
   - 型の合わない番号を使わないことは、WebKit の形の番号をいつも 1 にしているので、どの押しの番号とも重ならず、消しても通る。
   - 離しの点で測ることは、押し下げと離しの点がいつも同じなので、消しても通る。

指摘1 の試験の値（ペンの番号と、hover を持つペンの見せる間の `click`）も、ブラウザの値と違う。試験の冒頭の「事象は、ブラウザが送る順と値で組む」に合わせて、ここで直すこと。

## 文書とコードの突き合わせ

decision-landing.md の「決めたこと」、t5a-design.md 4-9 と 5章の写し、knowledge の冒頭・§8・§9、SKILL.md の送りと守りの項は、いまのコードのふるまいと合っている。リスナの組、並びで結ぶこと、番号は型の合うときだけ使うこと、32px（max(dx, dy)）で絞って受ける押しを先に選ぶこと、外す押し、`COMPAT_EVENTS_WAIT_MS`、`chooseTouchClearLanding` と `chooseLanding` の分担がこれに当たる。違うのは指摘1 の、hover を持つペンの見せる間の押しの `click` が新しい画面に届くという事実の文で、Chromium の値と違う。

## 指摘にしないが書いておくこと

- `pointerup` も `pointercancel` も届かなかった押し（`upTime` が null）は、`hasStoppedWaiting` で外れず、`click` を受けるまで並びに残る。Chromium では、スクロールバー・リンクを引く・2本の指・引いて送りのどれでも `pointerup` か `pointercancel` が届くので、残る経路は見つからなかった。iOS の Safari で、押しのあいだに的が DOM から外れた指の `pointerup` が `window` に届かないことがあるかは確かめていない。残ったときは、受ける押しを先に選ぶので来訪者の押しを止める向きには倒れず、守りが効かない向きにだけ倒れる。指摘1 の直しで同じ番号の押しを外す形にするなら、あわせて扱ってよい。
- 実ブラウザの試し（`real.mjs`）では、止めた押しのあと 1.3 秒たってから同じ選択肢を読んで押した押しも `quiz_press_guarded_retry` に数えられた。決めごとどおりで（3 秒以内に同じ押せるもの）、T10 を割合でなく経過 ms の分布で読む決めがこれを見込んでいる。
- 軽いもの: `chooseTouchClearLanding` の基準が送らない枝の `isClear(0) ? 0 : nearestClear` は、`steps` が基準から始まるので `nearestClear` と同じ値になる。ふるまいは変わらない。指摘1・2 を直すついでに、1つの形にしてよい。

## アンチパターンの照らし合わせ

- implementation.md / workflow.md: 指摘1 は、タッチで確かめた事象の形（押しごとに新しい番号）を、確かめずにペンにも当てはめた形である。knowledge §9 には「タッチは押しごとに新しい番号になる」とだけあり、ペンの番号は測っていなかった。試験の部品もこの前提で組まれていたので、試験でも見つからなかった。直すときは、ペン（hover を持つものと持たないもの）の番号と事象の順を Chromium で測ってから決め、測った値で試験を組むこと。
- 指摘2 は、試験が誤りを見つけられるかを確かめずに、決まりの名で試験を足した形である（knowledge §2 の「検査が空振りでないことを示す対」）。直したあと、上の変異の試しで、消すと落ちることを確かめるとよい。
- ツギハギ: `src/` の新しいコードとコメントに、経過の跡は見当たらない。

## 結論

**改善指示**。指摘1・2 は来訪者に届くもの（`src/` のコードと試験）なので、builder に直させること。もう一度レビューを受けるときは、前回の指摘だけでなく全体の見直しを含めること。指摘1 の直しは結び方と外す押しの決めごとを変えるので、decision-landing.md 1・t5a-design.md 4-9 と 5章・SKILL.md・knowledge §9 も、コードと同じ中身に、確かめた値で直すこと。
