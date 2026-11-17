# cycle-320 のコードのレビュー（第3回・HEAD fbf0d8af）

対象: 作業ブランチ `design-rollout` の 412db94e から HEAD（fbf0d8af）までの `src/` の変更すべて。`git diff 412db94e HEAD -- src/` を切らずに読んだ（src/play/quiz/pressGuard.ts 新規・src/play/quiz/_components/QuizContainer.tsx・src/lib/reveal.ts・src/lib/analytics.ts と、QuizContainer.pressGuard.test.tsx 新規・reveal.test.ts・QuizContainer.reveal.test.tsx・analytics.test.ts）。読むために、QuizContainer.tsx の全文、quizProgress.ts、QuestionCard.module.css（`::after` の箱が行の罫線の内側に来ること）も読んだ。仕様は decision-landing.md の「決めたこと」と t5a-design.md 4-9、比べの材料は landing-options.md 2-1（A・A′・A″ の定義）。文書は、decision-landing.md の「決めたこと」、t5a-design.md 4-9、knowledge `input-events-and-guards.md` の冒頭と §8、frontend-design の SKILL.md の送りと守りの項を、コードと突き合わせた。

**結論: 改善指示**（来訪者に届くもの（`src/` のコードと試験）への小さい指摘が2件ある。読んでいない問への二度押しの穴と、正当な押しを答えごと止める誤りは見つからなかった）

## 自分で確かめたこと

- `npx vitest run src/play/quiz src/lib/__tests__/reveal.test.ts src/lib/__tests__/analytics.test.ts` は 90 ファイル・2,077 件がすべて通った。`npm run typecheck` も通った。
- `createPressGuard` を直に動かす試し（`/home/user/yolo-web/tmp/review320c3/`。コミットに入らない）を2つ書いた。
  - `seq.test.ts`: 指摘1 を再現する（下）。
  - `pen.test.ts`: hover を持つペンの事象の順（pointerdown → mousedown → pointerup → mouseup → click）で、見せる間に押し下げて切り替わりのあとに離す押しと、切り替わりのあとの離しから 200ms の押しの、`mousedown`・`click` がどれも止まることを確かめた。コードは正しい（指摘2 は試験の組み方だけ）。
- 手でたどった経路: 「はじめる」と知識クイズの「次へ」（click の処理の中で切り替わり、守りの起点はその click の押し）、診断の答え（答えた layout effect で守りを閉じ、答えた click を `answerClickRef` に残し、150ms のタイマーの切り替わりで `open("answer" か "result", 答えの押し)`）、「もう一度挑戦する」（閉じる。2打目の「はじめる」はその押しが起点になる）、キーボードの起動（`detail === 0` の click は `press: null` なので守りを閉じる）。`reduceQuizProgress` は受け付けた更新ごとに `transition` を1つ増やすので、`lastClick.transitionAtClick === previousTransition` で切り替えた click を見分ける形は成り立つ。
- A″（`chooseTouchClearLanding`）を landing-options.md 2-1 の定義と突き合わせた。基準が送らない枝は、A の「min(d1, 16)・min(d2, 16) の大きい送り、同じなら基準に近い送り」が、16 以上の送りがある回では「両方 16 以上でいちばん基準に近い送り」と同じになり、コードの `nearestClear` と一致する。送る枝は「0 でない」を「16 以上」に替えた順で、隔たりは max(dx, dy)、矩形は罫線を除いた押せる範囲。16 以上の送りが無い回は `chooseLanding` を行の矩形のまま呼ぶ。`::after` は `position: absolute; inset: 0` で行の padding box（罫線の内側）を覆うので、`pressableRectsOf` が行の罫線の幅を引いた矩形はその箱と合う。試験の値（−4・−26・4・16・70・20・−21・85 など）も手で確かめた。
- スクリーンショットは撮っていない。依頼に担当の木とポートが無く、この範囲で見た目が変わるのは着地の送りの量と、押しが働かないことだけである。それは条件7・D5 の測りで、本番のビルドを走らせて確かめる（decision-landing.md の「測りの合否」）。

## 指摘

### 指摘1（来訪者に届くもの・小さい）: 窓が止めた `detail` 1 のマウスの押しが、「2打目で語を選ばない」の連続の始まりを更新せず、そのあとに受けた `detail` 2 の押しの既定の動き（フォーカスの移りと語の選択）を止める

`handleMouseDown` は、受けない押しの `mousedown` を止めたところで `return` し、その下の `if (event.detail === 1) { sequenceStart = transitionShown; ... }` に届かない。そのため、窓が止めた `detail` 1 の押しは連続の始まりにならず、`sequenceStart` は前の切り替えた押しのときの番号のまま残る。

再現（`/home/user/yolo-web/tmp/review320c3/seq.test.ts`）: 「はじめる」を (100, 500) で押す → 1問目へ（番号 1）。300ms 後に 30px ずれた所を押す（OS が連続を切るので `detail` 1、窓の中・100px の中なので止まる）。その 450ms 後（起点から 750ms で窓のあと）に同じ所を押すと、OS の連続の時間の中なので `detail` 2 で届く。この押しは守りに受けられて `click` も届くが、`sequenceStart`（0）< 番号（1）なので `mousedown` が `preventDefault` される。試しでは `mousedown` の `defaultPrevented` が true だった。

- この押しの連続の1打目は止められた押しで、何も切り替えていない。t5a-design.md 4-9「2打目で語を選ばない」の「`detail` が 1 の押し下げで始まった連続の押しが、回答の画面の操作を起こしたときだけ」にも、pressGuard.ts の冒頭の「受けた連続の押しのうち、1打目が画面を切り替えたものの2打目からは」にも外れる。前の版（412db94e）は `detail` 1 の `mousedown` で必ず番号を覚えていたので、このずれは今回入った。
- 来訪者に見えるのは、その押しが問の字の上なら語の選択が始まらないこと、ボタンなら `mousedown` でフォーカスが移らないことだけで、`click` は届く。起きる組み合わせも狭い。それでも、来訪者が受けた押しの既定の動きを、決めた条件の外で止めている。

**直し方の向き**: 連続の始まりの更新（`detail === 1` なら `sequenceStart = transitionShown`）を、受けない押しを止める枝より前に置くか、その枝でも同じく覚える。止めた押しの `preventDefault` はそのままにする。試験を1つ足す（窓が止めた `detail` 1 の押しのあと、窓の外で受けた `detail` 2 の押しの `mousedown` が止められないこと）。文書は変えなくてよい（コードを文書に合わせる直し）。

### 指摘2（来訪者に届くもの（試験）・小さい）: ペンの試験が、タッチと同じ「離したあとに mousedown」の順だけで組まれ、hover を持つペンの順を試していない

QuizContainer.pressGuard.test.tsx の書き出しは「事象は、ブラウザが送る順と値で組む」とし、`pressDown` の説明は「タッチとペンは pointerdown だけ」、`release` は「タッチとペンは pointerup → mousedown → mouseup → click」とする。ペンの試験（`describe.each(["touch", "pen"])` の2か所）はどれもこの順で走る。

- W3C Pointer Events の互換のマウスの事象の対応付け（11.2 の hover を持つ機器）では、`mousedown` は `pointerdown` のすぐあとに出る。Windows の Chromium などのペン（hover を持つ）はこちらの順で、離したあとに `mousedown` が来るのはタッチ（タップのあとにまとめて出す）の順である。iPad の Apple Pencil がどちらの順かはこのコンテナで確かめられない。
- コードは押しの単位を `pointerdown` で決めるので、どちらの順でも止まる（`pen.test.ts` で確かめた）。ただ、いまの試験は来訪者のペンの多くが送る順を1つも通っておらず、`pointerdown` の時に決めずに `mousedown` の時に決めるような作りに変わっても、ペンの試験で気づけない回がある。書き出しの約束どおりの試験になっていない。

**直し方**: ペンの試験に、hover を持つペンの順（`pointerdown` のすぐあとに `mousedown`、離しで `pointerup` → `mouseup` → `click`）の組を足す。少なくとも、切り替わりのあとの連続の押し（離しから 300ms 未満で止まる、300ms で受ける）と、見せる間に押し下げて切り替わりのあとに離す押し（`click` を止める）の2つ。いまのタッチの順のペンの組は、iPad のペンの見込みとして残してよい。`pressDown`・`release` の説明も、ペンに2つの順があることに合わせる。

## 見てほしいことへの答え

1. **読んでいない問に二度押しで答えが入らないか**: 入らない。「はじめる」「次へ」→次の問は click の処理の中で守りが開き、2打目の `pointerdown` で決まる。診断の答え→次の問と最後の答え→結果は、見せる 150ms の間に押し下げて切り替わりのあとに離す押しも `open` が `judge` で見直す。タッチとペンでは、その押し下げは答えた押しの離しから必ず 300ms 未満なので、100px の中なら止まる。マウスは見せる間に届いた `mousedown` の `detail` で決まる。見せる間に答えた行の上で離し切った押しは止めず、連鎖の元にだけする（決定どおり）。速い三度押しの3打目も、2打目の離しから数えて止まる。
2. **正当な押しを止めていないか**: キーボードと読み上げ（`detail === 0`）は通り、それで切り替えたときは守りを閉じる。100px の外・700ms 以上・診断の答えのあとの連続でない押し（タッチは離しから 300ms 以上、マウスは `detail` 1）は受ける。右と中のボタン（`button !== 0`）と2本目の指（`isPrimary` 偽）は押しとして覚えず、止めない。引いて送りになった押しは `pointercancel` で `mousedown` も `click` も来ないので何も止めず、数えない。`pointerdown` を `preventDefault` しないので、守りの中でも画面の送りは止めない。外れは指摘1 の、語の選択とフォーカスの移りだけを止める狭い組み合わせ1つである。
3. **漏れ**: 受け手は `QuizContainer` の `useEffect` で付け、外れると4つとも外す。クイズのページの中ではヘッダ・FAQ の `summary` なども 700ms・100px の中なら止まるが、これは決定の「窓の守り」のとおりである。知識クイズの答えたあと・「もう一度挑戦する」のあとは守りを閉じ、前の守りは残らない。ほかのページの部品には付かない。
4. **着地（A″）**: 決めどおり（上の「自分で確かめたこと」）。
5. **GA**: `quiz_press_guarded` は `mousedown` か `click` を実際に止めたときだけ、守りごとに最初の1回、`transition`（start・next・result・answer）と `content_id`（`quiz-<slug>`）で送る。診断の答えの守りは問ごとに開くので、`answer` は1回解くあいだに問の数まで送られうるが、決定の「1つの守りにつき」のとおりである。`quiz_press_guarded_retry` は、止めた事象の的から `closestPressable` した押せるもの（押せるものの上でなければ元にしない）を、止めた押しの押し下げから 3,000ms 以内（ちょうどを含む）にポインタで押して受けたとき、`Math.round` した `elapsed_ms` と一緒に1回送る。キーボードの起動は押し直しに数えない。
6. **試験**: マウスは pointerdown → mousedown → pointerup → mouseup → click、タッチは pointerdown → pointerup → mousedown → mouseup → click、`pointerdown` の `detail` は 0、主の押しは `isPrimary: true` で組まれている。境目（699・700ms、ちょうど 100px と 100.5px、離しから 299・300ms、3,000ms と 3,001ms）は「未満」「以下」「以内」を確かめている。前回の指摘の直り（見せる間の押しの押し直しの元・引いて送りの試験の主の押し）も入っている（`elapsed_ms: 2000` の試験と、`pointercancel` のあとの窓の中の押しで1回だけ数える試験）。外れはペンの順の指摘2 だけである。右ボタンの試験は、`pointerdown` と `mousedown` の `button` の判定のどちらか片方を外しても通る（片方が残れば止まらない）が、片方ずつでふるまいが変わる経路が無いので、指摘にしない。

## 文書とコードの突き合わせ

decision-landing.md の「決めたこと」1〜3、t5a-design.md 4-9（守り・押しの単位・止め方・数える・着地の選び方の手順3と5・2打目で語を選ばない）、knowledge の冒頭と §8 の実測の項、SKILL.md の送りと守りの項は、コードと合っている（受け手の置き場、`chooseTouchClearLanding` と `chooseLanding` の分け方、守りが開く前に押し下げた押しを開く時に決めること、主でない押しを覚えないこと、押し直しの元を止めた事象の的で取ること）。食い違うのは、指摘1 でコードが t5a-design.md 4-9「2打目で語を選ばない」の条件から外れている所で、直すのはコードの側である。

## アンチパターンの照合

- AP-I01（来訪者にとっての体験か）: 守りの穴と、答えごと止める誤りは見つからなかった。指摘1 は既定の動きの止めすぎで、来訪者の体験の側の指摘である。
- AP-I07（jsdom で見えない不具合）: 見せる間の押しは、押し下げを答えた行に、離しを新しい画面のものに送る形で jsdom でも書けている。ペンの事象の順（指摘2）は jsdom でも書けるので、本番で測るまで待つものではない。
- AP-I08（デザインに無い表現）: 当たらない。守りは形も動きも足していない。
- AP-I11（タイマーの片付け）: 当たらない。この範囲でタイマーは足していない。
- AP-WF05（スクリーンショット）: 上の「自分で確かめたこと」のとおり、見た目の変わりは着地の送りの量だけで、条件7・D5 の測りで本番のビルドを走らせて確かめる。
- AP-WF33（測る面が来訪者の通る面を写しているか）: GA の2つのイベントは、来訪者の押しで止めた事象と押し直しを数えていて、当たらない。
- AP-WF01・AP-WF02: 来訪者に届くもの（`src/` のコードと試験）への指摘があるので、結論は改善指示にした。

## 結論

**改善指示**。builder に指摘1・2 を直させ、前回の指摘だけでなく全体の見直しを含めてもう一度レビューを受けること。どちらも文書の決めごとは変えない（指摘1 はコードを t5a-design.md 4-9 に合わせ、指摘2 は試験を書き出しの約束に合わせる）。
