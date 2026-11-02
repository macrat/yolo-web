# レビュー第2回: knowledge の直し（Chromium の版の確かめ方・タッチの調整の知見）

- 対象: 担当の木 `/home/user/yolo-web/.claude/worktrees/agent-afd633aea0e4368d9`、枝 `worktree-agent-afd633aea0e4368d9`、先端 3f6128cf。今回の差は `git diff a4b2ff32 3f6128cf`、全体は `git diff b469c5a6 3f6128cf`
- 変えたファイル: `docs/knowledge/input-events-and-guards.md`（冒頭の第1段落・§1〜§7 の根拠のサイクル・§8）、`docs/knowledge/playwright-mcp.md`、`docs/knowledge/browser-layout-and-scrolling.md`
- 結果: **改善指示**

## 確かめたこと

一次資料はタグ `153.0.8010.12` のソースを `curl '<url>?format=TEXT' | base64 -d` で取って読んだ。

- `touch_adjustment.cc`: `HybridDistanceFunction` は `radius_squared = 0.25 * (幅² + 高さ²)` で `ClosestPoint` までの距離の2乗を割り、`1 - 重なる面積 / 重なりうる最大の面積` を足す。`SnapTo` は矩形の中なら点のまま、`bounds.Intersects(touch_area)` なら交わりの中心。§8 の「選び方」と合う（前回の指摘2は直った）。
- 触れた面が Blink に届くまでの道を、ブラウザの側まで追った。
  - `content/browser/devtools/protocol/input_handler.cc`: `Input.dispatchTouchEvent` の `radiusX`・`radiusY` の既定は 1.0（`GetRadiusX(1.0f)`）。押しは `TouchEmulator` を `kInjectingTouchEvents`・`GestureProviderConfigType::CURRENT_PLATFORM` で通して gesture に直される。
  - `content/browser/renderer_host/input/motion_event_web.cc`: `GetTouchMajor` は `2 * max(radius_x, radius_y)`。
  - `ui/events/gesture_detection/gesture_provider.cc`: tap の `GetBoundingBox` は、押した点を中心に一辺 `max_diameter_before_show_press_`（touch major の最大）の**正方形**を作る。その後 `CreateGesture` が、指（`FINGER`・`UNKNOWN`）の押しの面を `ClampBoundingBox(min_gesture_bounds_length, max_gesture_bounds_length)` で縦横それぞれ収める。
  - `ui/events/BUILD.gn`: Android は `gesture_configuration_android.cc`、Linux・Windows のデスクトップ（`use_aura`）は `gesture_configuration_aura.cc`、Mac は `gesture_configuration_default.cc`。
  - `gesture_configuration_aura.cc` は `set_min_gesture_bounds_length(default_radius())`、`gesture_configuration.h` は `default_radius_ = 25`（max は 0 で収めない）。Android は min 20・max 32。
  - `ui/events/blink/blink_event_util.cc`: `data.tap.width/height` は bounding box の幅と高さ。これが Blink の `GetHitTestRectForAdjustment` で 20〜32 に収められる。
- この流れを、このコンテナの Chrome for Testing 153.0.8010.12（`/opt/pw-browsers/chromium`、headless、800×600、`hasTouch: true`）で確かめた。左上 (300,100)・100×40 のボタンの下の縁から縦に dy 離した点を CDP の `Input.dispatchTouchEvent` で押し、`click` の的と座標を取った（スクリプトは `/tmp/claude-0/-home-user-yolo-web/4d6b74ab-79c6-5e4b-b087-d3a9a26aaa05/scratchpad/t/t.cjs`）。
  - `radiusX/Y` を渡さない・1・10・12: dy 9・10.5・11.5・12 でボタンに寄り（y=138〜139）、13・15 では寄らない。**境は 12.5px**（面は 25 dip）。
  - `radiusX/Y` 16・24: dy 15.5 まで寄り、17 では寄らない。境は 16px（面は 32 dip）。
  - 斜め（渡さない）: dx=dy=11・12 で寄り、13 で寄らない。max(dx, dy) で決まることは合う。
  - Playwright の `touchscreen.tap`: dy 11・12 で寄り、13 で寄らない。
  - 寄せた座標は交わりの中心と合う（例: 半辺 12.5 で dy=12 の点 y=152 は、面 [139.5, 164.5] とボタン [100, 140] の交わりの中心 139.75 → 139）。
- playwright-mcp.md・browser-layout-and-scrolling.md の版の書き方（「同じとは限らない」）と根拠の2つのサイクルの観測は、前回の確かめと合う（前回の指摘8は直った）。
- 冒頭の第1段落は節の番号に頼らない形になり、§1〜§7 の根拠に「cycle-301」が入った。index.md のキャリーオーバー（88行）も T5a-7 への注記として足りる（前回の指摘3は直った）。
- §8 の根拠に、ブラウザの版・`chromium-1243`・headless・本番ビルド・`next start`・1280×800・`hasTouch: true`・`--disable-smooth-scrolling`・押し方が入った。ソースもタグで書いた（前回の指摘5は直った）。
- 前回の指摘4（(a)(b) と選ぶ物差し）・指摘6（ずらした押し）・指摘7（Android に限る）は文としては直った。ただし指摘4・6 の文は、下の指摘1 の誤った前提（道具の押しは最小の面）の上に立っている。

## 指摘

### 指摘1（高）: このコンテナの道具の押しは「下限の 20 dip」ではなく 25 dip の面で探し、届くのは max(dx, dy) が 12.5px より小さい所までである

§8 は「CDP の … `radiusX`・`radiusY` は、渡さなければ 1 になる。Playwright の `touchscreen.tap` も … どちらも下限の 20 dip の正方形で探すので、届くのは max(dx, dy) が 10px より小さい所までである」と書く。Blink の中ではそのとおりだが、Blink に届く前に、ブラウザの gesture の組み立てが面を広げる。Linux のデスクトップ（Aura）では `min_gesture_bounds_length` が `default_radius_` の 25 で、半径 1 の押しの面（一辺 2）は 25 dip の正方形に広げられてから Blink に渡る。上の実測でも、渡さない押し・Playwright の `tap` とも dy 12 までは寄り、13 では寄らなかった。境は 12.5px で、10px ではない。

これで次の文が事実と合わなくなる。

- 見出しの「Android の端末より狭い範囲でしか寄らない」: 道具の 12.5px は Android の最小の面（半辺 10px）より広く、最大（16px）より狭い。どちらより狭いとも言えない。
- 二度押しの箇条1の「10px より小さい所まで」。
- 箇条4の「点をずらした押し … は、ずれに、最小の面での寄せを重ねた結果である」: 重なるのは半辺 12.5px の寄せである。
- 箇条3の (a) は、Android の範囲（10〜16px）と突き合わせる形としては正しいが、道具の押しの落ち先が半辺 12.5px で決まったことを書かないと、読む人は「道具で寄った件は Android でも必ず寄る」と取る。実際は、max(dx, dy) が 10〜12.5px の件は、道具では寄ったのに Android の小さい触れ方では寄らない。12.5〜16px の件は、道具では寄らず Android の大きい触れ方では寄りうる。両向きに外れる。
- plan-t5a7.md 3 の「タッチの調整の距離」の「道具の押しは面の大きさを渡さないので、試しの走りの数はいちばん小さい面での調整にあたり」も同じ誤りで、判断（5）の数え直しに入る（このレビューの範囲の外だが、PM が直す）。

次にタッチの二度押しを測る人が、道具の結果を「Android の最小の面の結果」と読んで数え誤るので重い。

直し方の例: 面の項に、Blink に届く前の段を書き足すのではなく、面の決まり方を初めから2段で書く。「押しの面は、まずブラウザの gesture の組み立てが、押した点を中心に一辺 2×max(radiusX, radiusY) の正方形にし、端末の種類ごとの幅に収める（Android は 20〜32 dip、Linux と Windows のデスクトップは 25 dip より小さければ 25 に広げ、上は収めない、Mac は収めない）。それを Blink が 20〜32 dip に収める」。そのうえで、「このコンテナ（Linux）の CDP と Playwright の押しは、渡さなければ 25 dip の面で、届くのは max(dx, dy) が 12.5px より小さい所まで。`radiusX`・`radiusY` に 16 以上を渡せば 32 dip（半辺 16px）。Android は半辺 10〜16px」とし、見出し・箇条1・3・4 をこれに合わせる。根拠には `input_handler.cc`（`TouchEmulator` の `CURRENT_PLATFORM`）・`motion_event_web.cc` の `GetTouchMajor`・`gesture_provider.cc` の `GetBoundingBox` と `ClampBoundingBox`・`gesture_configuration_aura.cc` と `gesture_configuration.h` の `default_radius_ = 25`・`blink_event_util.cc` の `tap.width/height` と、上の実測（境が 12.5px と 16px）を書く。review-t5a-7a-1.md の実測（1・5・10 で同じ、16・24 で同じ）は 25 と 32 の2段とも合うので、そのまま使える。

### 指摘2（中）: 面を「横と縦をそれぞれ収めた矩形」と書くと、tap の面が正方形であることと「半辺」が何を指すかが読めない

PM の問いへの答え: plan-t5a7.md 3 の「点を中心にした正方形」は、tap については正しい。tap の面は、gesture の組み立てが touch major（`2 * max(radiusX, radiusY)`）を一辺にした正方形として作るので、`radiusX` と `radiusY` を違えて渡しても矩形にはならない（Android の Chrome の指の押しも同じ組み立てを通る）。knowledge の「横と縦の大きさを、それぞれ 20〜32 dip に収めたもの。触れた面の横と縦が同じなら正方形になる」は Blink の関数だけを見れば正しいが、読む人は「横と縦が違う面もある」と取り、すぐ後の「max(dx, dy) が面の半辺より小さければ」の「半辺」が横と縦のどちらかが決まらない。事実として食い違うのではなく、knowledge の書き方が tap の面の形を伝えていない。

直し方の例: 指摘1 の書き直しの中で「tap の面は、押した点を中心にした正方形で、一辺は 2×max(radiusX, radiusY) を上の幅に収めたもの」と書き、「横と縦が同じなら正方形」を除く。そうすれば plan-t5a7.md 3 の文とそろう。

## 観点ごとの所見

1. 一次資料との一致: Blink の中の判定（押せるもの・届く範囲の形・選び方・寄せ先）はタグ 153 のソースと実測の両方に合う。Blink に届く前の面の広げ（指摘1）が抜けていて、道具の押しの届く範囲を誤っている。
2. 次に測る人が迷わず正しく測れるか: dx と dy を記録して突き合わせる (a) の形は正しいが、道具の結果の読み方（12.5px）が誤っているので、数え直しが両向きに外れる（指摘1）。面の形の書き方も足りない（指摘2）。
3. 計画との関係: plan-t5a7.md 3 の「正方形」は正しく、knowledge の側を合わせる（指摘2）。plan-t5a7.md 3 の「いちばん小さい面での調整にあたり」は指摘1 と同じ誤り。
4. T5a-7 の書き直しとの関係: 冒頭は節の番号に頼らない形になり、キャリーオーバーの注記もある。食い違いは無い。
5. ツギハギ: 3ファイルとも、初めからそう書いたように読める。§1〜§7 の根拠に入れた「cycle-301」も、各節の書き方として揃っている。指摘1 を直すときも、Linux の段を例外の注記として足さず、面の決まり方を2段で書く1つの説明にする。

## PM への依頼

1. builder に、上の指摘1・2を担当の木で直させる。plan-t5a7.md 3 の「タッチの調整の距離」の「試しの走りの数はいちばん小さい面での調整にあたり」は、PM が「道具の押しは半辺 12.5px の面での調整にあたり、Android の端末では 10〜16px」の形に直し、判断（5）の数え直しが両向き（10〜12.5px の件は端末で寄らないことがある、12.5〜16px の件は端末で寄りうる）を数えるようにする。測りの道具の記録（dx と dy）はこのままで足りる。
2. 直したら、もう一度レビューを依頼する。そのときは前回の指摘だけでなく、全体を見直させる。
