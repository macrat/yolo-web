# cycle-320 knowledge §8 と範囲の決め直しのレビュー（knowledge 第5回）

対象:

- A: 担当の木 `/home/user/yolo-web/.claude/worktrees/agent-a13a1442fb7732446`、枝 `worktree-agent-a13a1442fb7732446`（6741841b、起点 d3336a28）の `docs/knowledge/input-events-and-guards.md` §8。`git diff d3336a28 6741841b` を読み、§8 の全文を読み直した。
- B: 主の木（HEAD 209dbe06）の `plan-t5a7.md` 3 の「タッチの調整の距離」（`git diff d3336a28 209dbe06`）と、範囲の決め直しの記録（index.md の「実施する作業」・作業内容 2 の「範囲の決め直し」・補足事項・キャリーオーバー・レビュー結果の表、plan-t5a7.md 2a〜7）。根拠として review-plan-13.md・review-t5a-7a-1-2.md・cycle-316/t5a-measure.md 10章・`src/lib/reveal.ts` を読んだ。

## 確かめたこと

### ソース（Chromium タグ 153.0.8010.12。googlesource から取り直して読んだ）

- `passthrough_touch_event_queue.cc`: `skip_touch_filter` は `kSkipTouchEventFilter` の有無で決まり（`.h` の既定）、`runtime_enabled_features.json5` で `SkipTouchEventFilter` は `stable`。`ShouldFilterForEvent` は有効なら touchstart を落とさない。合う。
- `input_handler_proxy.cc` `HitTestTouchEvent`: 点の矩形に受け手の領域が無ければ、`kTouchStartOrMove` の性質が `kPassive`・`kBlockingAndPassive` で `DID_NOT_HANDLE_NON_BLOCKING`、`kNone`・`kBlocking` で `DROP_EVENT`。`skip_touch_filter_discrete_` は `skip_filtering_process` が `browser_and_renderer` のときだけ立ち、既定の param は空。合う。
- `event_handler_registry.cc`: `kTouchStartOrMove` の passive は `HasEventHandlers(kTouchStartOrMoveEventPassive) || HasEventHandlers(kPointerEvent)`。合う。
- `pointer_event_manager.cc` `ShouldAdjustPointerEvent`・`AdjustPointerEvent`（`width`・`height` を `GetHitTestRectForAdjustment` へ、`BestNodeForHitTestResult`、`CacheTouchAdjustmentResult`）、`web_pointer_event.cc` の `radius_x * 2.f`・`radius_y * 2.f`、`touch_adjustment.cc` の `ShrunkTo`・`ExpandedTo`（横と縦を別々に収める）、`event_handler.cc` の `GestureCorrespondsToAdjustedTouch`（id の一致と `InclusiveContains`）と、偽のときの tap の面での矩形の当たり。合う。
- `touch_emulator_impl.cc` `HandleEmulatedTouchEvent`: 押しを `gesture_provider->OnTouchEvent` に通す。合う。
- Next.js 同梱の `react-dom-client.production.js`: `touchstart`・`touchmove`・`wheel` は passive で登録。`measure.mjs` 455 行は `window` に `touchstart` の受け手を置く。合う。
- `src/lib/reveal.ts` の `pressableRectOf` は `data-hit-area="after"` のとき `offsetParent`（`li`）の `getBoundingClientRect()` を返す。キャリーオーバーの「同じ数え方」は正しい（罫線 1px を含む）。

### 実測の抜き取り（Chrome for Testing 153.0.8010.12、`/opt/pw-browsers/chromium-1243`、headless、800×600、`hasTouch: true`、`setContent` の 100×40 のボタン、CDP `Input.dispatchTouchEvent`。スクリプトは scratchpad）

- `click` の受け手だけのページ: 渡さない押しは dy 12 で寄り 12.5 で寄らない。`radiusX/Y` 12 は dy 12 で寄る。16 は dy 15.5 で寄り 16 で寄らない。`radiusX` 16・`radiusY` 1 は dy 10.5 でも寄る（正方形）。§8 の根拠の行と合う。
- `document` の `pointerdown`・`window` の passive の `touchstart`・離れた 50×50 の箱の `pointerdown`: どれも渡さない押しは dy 9.5 で寄り 10.5 で寄らない。`radiusX/Y` 12 は dy 11.5 で寄り 12 で寄らない。16 は 15.5 で寄り 16 で寄らない。`radiusX` 16・`radiusY` 1 は dy 9.5 で寄り 10.5 で寄らない。寄せた y は 139（交わりの中心）。§8 と合う。
- 受け手のあるページで横を測った（§8 はソースだけで書いている所）: `radiusX` 16・`radiusY` 1 はボタンの右端から dx 15.5 で寄り 16 で寄らない。`radiusX` 1・`radiusY` 16 は dx 9.5 で寄り 10.5 で寄らない。受け手が無いページでは後者も dx 10.5 で寄る。面が横 2×radiusX・縦 2×radiusY の矩形であることと合う。
- passive でない `touchstart`: 離れた箱に置くと受け手が無いページと同じ（dy 10.5・11 で寄る）、ボタンを包む要素に置くと受け手があるページと同じ（dy 10.5 で寄らない）。§8 が「推論で、測っていない」とした形は実測で合う（指摘 A2）。
- `document` の `touchend`（passive でない）、`document` の passive の `touchmove`: どちらも受け手があるページと同じ（dy 10.5 で寄らない、`radiusX` 1・`radiusY` 16 の dx 10.5 で寄らない）。離れた箱の passive でない `touchmove` と `document` の `mousedown` は受け手が無いページと同じ（指摘 A1）。

### ツギハギ

§8 は、受け手の有無の2つの経路を初めから並べた形に読め、旧版の「このコンテナと Android の差」の書き方の名残は無い。ワークツリーの `docs/knowledge/`・`src/`・`scripts/` に半辺 12.5px を前提にした文は他に無い。

## A: knowledge §8 の指摘

### 指摘 A1（中）: 「受け手があるとみなされる」場合の列挙が欠けている

§8 は「受け手があるとみなされるのは、ページのどこかに `pointerdown` などの pointer の受け手か passive の `touchstart` の受け手があるときと、passive でない `touchstart` の受け手の要素の上を押したときである」と言い切っている。ところが次の2つも受け手があるページになる。

- ページのどこかに `touchend`・`touchcancel` の受け手があるとき。`input_handler_proxy.cc` の `HandleTouchStart` は、`HitTestTouchEvent` が `DROP_EVENT` を返しても、`GetEventListenerProperties(cc::EventListenerClass::kTouchEndOrCancel) != kNone` なら `DID_NOT_HANDLE_NON_BLOCKING` にする（「NonBlocking due to TouchEnd handler」）。実測でも `document` の `touchend` で dy 10.5 は寄らなかった。
- passive の `touchmove` の受け手（`kTouchStartOrMove` の分類に入る。実測で同じ）。passive でない `touchmove` も、その要素の上を押したときは `touchstart` と同じ形になる（ソースから。離れた箱では受け手が無いページと同じだった）。

ページの書き手が `touchend` だけを置くのはよくあるので、このままでは、そのページを受け手の無いページ（半辺 12.5px）と読み誤る。直し方: 列挙を「`touchstart`・`touchmove`（passive）か pointer の受け手か `touchend`・`touchcancel` の受け手がページのどこかにあるとき、passive でない `touchstart`・`touchmove` の受け手の要素の上を押したとき」の形にし、数えないものに `click` と並べて `mousedown` を入れ、根拠の行に `HandleTouchStart` の `kTouchEndOrCancel` の分岐を足す。

### 指摘 A2（軽）: 推論と書いた2点のうち1点は実測で確かめられる

「passive でない `touchstart` の受け手がその要素の上の押しだけを受け手ありにすることも、ソースからの推論で、測っていない」は、上の抜き取りで合った（離れた箱では受け手が無いページ、包む要素では受け手のあるページ）。担当が同じ形で測り、根拠を実測に書き替える。面の横が `radiusX` で決まることも、いまは縦（`radiusX` 16・`radiusY` 1 の dy）でしか測っていないので、横（`radiusX` 1・`radiusY` 16 の dx 9.5/10.5、`radiusX` 16・`radiusY` 1 の dx 15.5/16）も実測の行に入れると、矩形の面の言い切りの根拠がそろう。Android の実機の推論は、測れないので推論のままでよく、書き分けは正しい。

### 指摘 A3（軽）: 「Android のどの触れ方でも寄る」は言い過ぎ

「道具で寄った押せるものは max(dx, dy) が 10px より小さく、Android のどの触れ方でも寄る」。半辺 10px の面で届くものは、より大きい面でも届く（候補に入る）が、面が大きくなると候補が増え、重なりの割合も変わるので、`HybridDistanceFunction` で別の押せるものが選ばれうる。「寄る」先が同じとは限らない。二度押しの判断（押せるものに落ちたか）には効かないが、knowledge は一般の知見として読まれる。直し方: 「Android のどの触れ方でも届く（押せるもののどれかに寄る）」とし、寄る先は面で変わりうると書く。

### 指摘 A4（軽）: tap の gesture の面が、受け手が無いページだけのものに読める

tap の gesture の面（2×max の正方形、Android 20〜32・Aura 25 以上）は、受け手の有無にかかわらずブラウザが作り、受け手があるページでも `GestureCorrespondsToAdjustedTouch` の「覚えた点が tap の面の中にあるか」の判定に使われる。いまの書き方では、その作り方が「受け手が無いページ」の箇条の中にしか無く、受け手があるページの括弧の「下のどちらの面の組み合わせでも中に入る」が何と何の組み合わせかが読み取りにくい。直し方: tap の gesture の面の作り方を2つの経路の前に1度書き、受け手があるページの箇条では「tap の面はどの半径でも `pointerdown` の面を含むので、覚えた点はいつも中に入る」と書く。

### 指摘 A5（軽）: 測りの道具の受け手の言い方と、隔たりを取る時

- 「測りの道具もページに `touchstart` の受け手を置く」は、knowledge の中で定まっていない cycle-320 の道具を指している。一般の注意として「測りの道具が受け手を置くと、受け手の無いページも受け手のあるページに変わり、測る面が変わる（このサイトの診断のページは React が置くので変わらない）」と書くほうが、次に別のページを測る人に効く。
- 「『道具では寄ったが 10px 以上』の件はつくりの上で起きず」は、dx・dy を2打目が触れる時の組みで取ったときにだけ成り立つ（review-t5a-7a-1-2.md 指摘3。着地のあとの最初のフレームでは `fadeIn` の 8px のずれで 10px を超える記録が出た）。「二度押しを Chromium で測るとき」の箇条に、隔たりは2打目の `touchstart` の時点の組みで取ること（動きのある画面では最初のフレームの矩形とずれる）を1つ足す。

## B: 計画の文と範囲の決め直しの記録の指摘

plan-t5a7.md 3 の「タッチの調整の距離」は、受け手のあるページの矩形の面・半辺 10px・`::after` の箱・2打目が触れる時点・一つの向きの数え直しと、knowledge §8 と食い違わない（A1 の列挙の差は B6）。食い違いと古い言い切りは、範囲の決め直しで書き換えなかった周りの文に残っている（AP-WF41）。

### 指摘 B1（中）: 補足事項の「着地の作りの欠け」が半辺 12.5px のまま

index.md 補足事項の「試しの走りで見つけた着地の作りの欠け」は「Chromium のタッチの調整（このコンテナで半辺 12.5px、Android の端末で 10〜16px）」と書く。knowledge §8 と plan-t5a7.md 3 では、診断のページの道具の押しは半辺 10px で、記録と合わない。同じ文の「選択肢の縁まで 0〜0.9px」と「10〜86px 離せる」は、罫線を含めた行の矩形で測った値で、押せる範囲からは約 1px 遠く（review-t5a-7a-1-2.md 指摘2）、16/45 のうち yoji-level の 375×550 は 16px 離せる送りが無い（同 指摘7、review-plan-13.md）。次のサイクルの決め直しはこの段落を出発点に読む。直し方: 「（診断のページの道具の押しは半辺 10px、Android の端末で 10〜16px）」にし、隔たりは行の矩形で測った値であることと、yoji-level の1本は 16px 離せないことを書き添える。

### 指摘 B2（中）: index.md の目的・前置き・作業内容が、決め直した範囲と食い違う

- 12 行: 「このサイクルの直しのあとの版で次のサイクルが1度だけ測る」。このサイクルは直さない。
- 28 行: 「このサイクルで数を取り、件ごとに決めて直す」。送った。
- 44 行: 「このサイクルは 2 と、その中で決めた記録の形・タッチの距離の決定（plan-t5a7.md 3）と、knowledge の直しまでを行い」。2（T5a-7a-1）はレビュー第2回が改善指示のまま送られ（19・88 行）、3 の「記録の形と上限」は review-plan-13.md 指摘4・5 が未決のまま（87 行）なので、「2 を行い」「記録の形を決めた」は言い過ぎ。
- 32 行の順の文と作業内容 3〜6 は、このサイクルで行う段として読める。

目的と作業内容は計画の時の文として残してよいが、決め直したことが分かる形にしないと、次のサイクルがこの index.md を読んだとき、どこまで済んだかを誤る。直し方: 12・28 行を、範囲の決め直しのあとの形（測りと直しは次のサイクル）に書き直すか、それぞれに「範囲の決め直しで次のサイクルへ送った」と示す。44 行は「2 は試しの走りと見積もりまで行い、道具の直し（review-t5a-7a-1-2.md の指摘1〜9）は送った。3 の記録の形は review-plan-13.md 指摘4・5 が未決」と事実どおりにする。3〜6 の見出しに「（次のサイクルへ送った）」を付ける。

### 指摘 B3（中）: plan-t5a7.md 3 の「版を作るコミット」が 2a・キャリーオーバーと食い違う

3 の「日をまたぐ記録と版」は「変更後の版は T5a-7a-1 が記録したコミット」のまま。2a とキャリーオーバーは「変更後の版は、着地の作りを直したコミットに固定する」と書き、キャリーオーバーは「plan-t5a7.md の 3〜7 をそのまま使う」と書く。3 を読む担当は 5ea1ab89 で版を作りうる（review-plan-13.md 指摘7 の残り）。直し方: 3 の項を「変更後の版は着地の作りを直して取り込んだコミット（PM が記録する）」の形にし、`measure/README.md` の版の表（`after` 5ea1ab89）を書き直すことをキャリーオーバーの道具の項に入れる。

### 指摘 B4（中）: 基準の版の測りを始めてよい時が、文書の間で食い違う

plan-t5a7.md 2a は「基準の版の測りは、決め直しを待たずに始めてよい」。キャリーオーバーの「測りの道具」は「着地の作りを決め直したあと、道具をその作りに合わせて直し、レビューに通してから測る」。3 は「道具を直して blob が変わったときは、古い blob で測った記録を…測り直す」と定め、基準の版の測りには 3 の承認（分け方と上限。上限は指摘4・5 が未決）も要る。2a のまま読むと、次のサイクルは承認の無い道具と未決の上限で基準の版を測り始め、道具を直したあとに測り直すことになる。直し方: 順を1か所に書く。たとえば「道具の直しのうち着地の作りに依らないもの（review-t5a-7a-1-2.md 指摘1〜9）をレビューに通し、3 の上限を決めて承認を受けたあとなら、基準の版は決め直しを待たずに測れる。着地の作りに合わせる直しで blob が変わるなら、基準の版も測り直す」のように、どちらの道かを決めて 2a とキャリーオーバーをそろえる。

### 指摘 B5（中）: レビュー結果の表が、いまの状態を表していない

表は「計画 12 承認」と「T5a-4 10 承認」だけで、計画の第13回（改善指示。範囲の決め直しはその応答）、T5a-7a-1 の第1・2回（改善指示のまま送った）、knowledge の第1〜5回が無い。次のサイクルは表で、承認に届いていないもの（T5a-7a-1、計画 2a・3 の未決）を拾う。直し方: 計画の行を第13回までにし、決め直しで閉じたことを書く。T5a-7a-1 と knowledge の行を足す（T5a-7a-1 は「改善指示のまま次のサイクルへ送った」と書く）。表の下の経過の段落にも、計画の第13回と T5a-7a-1・knowledge の回の要約を足す。

### 指摘 B6（軽）: plan-t5a7.md 3 が受け手のあるページを自分で定めている

3 は「`touchstart` か `pointerdown` の受け手があるページでは」と書く。knowledge §8 の定め（A1 を直したあとは `touchend` なども入る）と言い方が違い、どちらかを直すと食い違う。診断のページについては結論が同じなので、3 は「診断のページは受け手のあるページで（knowledge §8）」と、§8 を指す形にする。あわせて、冒頭の「触れた面の中にある近くの押せるもの」は、§8 と次の文の「要素の矩形が面と交われば」に合わせて「面と交わる押せるもの」にする。

### 指摘 B7（軽）: plan-t5a7.md 7 とチェックリストの申し送りが、決め直しのあとに何を書くかを示していない

7 の項目には「T5a-8 で直した件・直した文書・測り直した範囲と、その結果」「このサイクルの判断で受け入れた件」など、このサイクルでは起きないものが入っている。チェックリスト 20 行は「plan-t5a7.md 7 の項目と、送ったもの」を書くとする。キャリーオーバーは「3〜7 をそのまま使う」とも書く。このサイクルで書く項目と、次のサイクルがそのまま使う項目の線が無い。直し方: 7 の頭か index.md の作業内容 7 に、このサイクルで書くもの（道具の使い方・送ったもの・条件8 の数えに足すもの・条件1 の判定のしかたなど）と、次のサイクルが自分の申し送りで使うものを分けて書く。

### 指摘 B8（軽）: キャリーオーバーの道具の項に、古い文の置き場を名指す

「押せる範囲の取り方は、変更後の版の `src/lib/reveal.ts` の `pressableRectOf` も同じ数え方なので」は正しいが、それが行の罫線 1px を押せる範囲に含める欠けだと書かれていないと、材料として読めない。また t5a-measure.md 0章の「タッチの調整」以下と `measure/report.mjs` 14 行は、いまも半辺 12.5px と書いており、次のサイクルの担当が道具の直しの前に読むと誤る。直し方: 「`pressableRectOf` も行の罫線 1px を含めて測る」と書き、半辺 12.5px のまま残っている所（t5a-measure.md 0章、report.mjs の頭の注釈）を名指して、道具の直しで書き直すことを書く。

### 確かめて合っていたもの（B）

- 補足事項・2a の (1)(2) の型、16/45、(2) の16回の内訳、character-personality の (1) が 1280×800 であることは、review-plan-13.md の「確かめたこと」と t5a-measure.md 10章に合う。
- キャリーオーバーの「着地の作りの決め直し」の比べる材料（review-plan-13.md 指摘1〜8）の要約は、指摘の中身と合う。指摘9・10 は 2a（T5a-8a）を外したので扱わなくてよい。
- 範囲の決め直しそのもの（着地の作りから決め直す前に全体を測っても使えない値になる）は、review-plan-13.md 指摘1〜3 から筋が通り、来訪者の側に立った判断である。index.md は 35,996 バイトで 40,000 の線の下。

## アンチパターンの照合

- AP-WF41: B1〜B4 は、範囲の決め直しで書き換えた所の周りに、前の範囲の言い切りと古い面の数が残った型である。
- AP-WF11・AP-WF14: 面の幅・寄る境・`pressableRectOf` は担当の報告を写さず、ソースと実測で確かめ直した。
- AP-P18: review-t5a-7a-1-2.md 指摘1 の背後の問い（道具の押しの面は条件で変わり、記録の読み方に効く）は §8 で答えられている。A1 はその問いの範囲の残りである。
- ツギハギ禁止: §8 は初めからの形に読める。B5・B2 はサイクルの文書なので経緯を書いてよいが、状態の言い切りが事実と違うのは直す。

## 結論

- **A（knowledge §8）: 要修正（改善指示）**。指摘 A1（中）、A2〜A5（軽）。builder に直させる。
- **B（plan-t5a7.md 3 と範囲の決め直しの記録）: 要修正（改善指示）**。指摘 B1〜B5（中）、B6〜B8（軽）。PM の文書なので、planner（または PM が担当を立てて）に直させる。

直したあと、前回の指摘だけでなく全体の見直しを含めて、もう一度レビューを受けること。
