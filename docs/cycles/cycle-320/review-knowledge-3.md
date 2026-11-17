# レビュー第3回: knowledge の直し（Chromium の版の確かめ方・タッチの調整の知見）

- 対象: 担当の木 `/home/user/yolo-web/.claude/worktrees/agent-afd633aea0e4368d9`、枝 `worktree-agent-afd633aea0e4368d9`、先端 fb506f1e。今回の差は `git diff 3f6128cf fb506f1e`、全体は `git diff b469c5a6 fb506f1e`
- 変えたファイル: `docs/knowledge/input-events-and-guards.md`（§8）。全体では同じファイルの冒頭と §1〜§7 の根拠、`docs/knowledge/playwright-mcp.md`、`docs/knowledge/browser-layout-and-scrolling.md`
- あわせて見たもの: 主の木の `docs/cycles/cycle-320/plan-t5a7.md` 3 の「タッチの調整の距離」
- 結果: **承認**（指摘は軽の2件だけ。PM が直す）

## 確かめたこと

- 前回の指摘1（道具の押しの面は 25 dip、届くのは 12.5px まで）: §8 の面の項が、ブラウザの gesture の組み立て（一辺 2×max(radiusX, radiusY) の正方形、Android は 20〜32 dip、Aura は 25 dip より小さければ 25 に広げて上は収めない）と Blink の 20〜32 dip の2段で書かれた。見出し・二度押しの箇条1（12.5px、12.5 以下は同じ、16 以上は 32 dip で 16px）・箇条2（両向きに外れる、10〜12.5px と 12.5〜16px）・箇条3 の (a)（道具の面 12.5px で落ちた先を 10px と 16px と突き合わせる）・箇条4（ずれに重なるのは 12.5px の寄せ）がそれに合わせて直った。前回のタグ `153.0.8010.12` のソースの読み（`input_handler.cc`・`motion_event_web.cc`・`gesture_provider.cc`・`ui/events/BUILD.gn`・`gesture_configuration_aura.cc`・`gesture_configuration.h`・`gesture_configuration_android.cc`・`blink_event_util.cc`・`touch_adjustment.cc`・`event_handler.cc`）と、前回の実測（渡さない・1・10・12・`touchscreen.tap` は dy 12 で寄り 13 で寄らない、16・24 は 15.5 で寄り 17 で寄らない、斜め 12 で寄り 13 で寄らない、寄せ先は交わりの中心）と、文も数も合う。直った。
- 前回の指摘2（tap の面は正方形）: 「tap の面は、押した点を中心にした正方形」「`radiusX` と `radiusY` を違えて渡しても、正方形のまま」と書かれ、「横と縦が同じなら正方形」は消えた。「半辺（一辺の半分）」も定義された。直った。
- review-t5a-7a-1.md の実測（1・5・10 で 6px、16・24 で 9px）は、25 dip と 32 dip の2段と合い、「寄る距離が面で2段に分かれる」の根拠として正しく置かれている。
- 根拠の区別: ソースで確かめたこと、このコンテナでの実測、Android の実機での寄り方が推論で測っていないこと、が分けて書かれている。Windows と Mac は書かれておらず、確かめていないことを書いていない。
- plan-t5a7.md 3 との突き合わせ: 「一辺 25 dip の正方形に広げる」「半辺 12.5px の面での調整」「Android は一辺 20〜32 dip・半辺 10〜16px」「max(dx, dy) で決まり直線の距離では決まらない」「両向きに数え直す（16px より小さい件は寄りうる、10px 以上の件は寄らないことがある）」は knowledge と食い違わない。来訪者の側に立って max(dx, dy) < 16px を落ちうる件として判定する形は、knowledge の Android の最大の面と合い、閲覧の大半がスマートフォンであることから来訪者の価値に沿う。
- 次に測る人が迷わないか: 面がどう決まるか、道具の結果が Android とどちらに外れるか、測りの量を増やさずに (a) で見積もる手順と (b) を使う場面が、そのまま測りの手順として読める。
- ツギハギ: §8 は面の決まり方を初めから2段で書いた1つの説明になっていて、Linux の段が例外の注記として足された形ではない。冒頭・§1〜§7 の根拠・ほかの2ファイルは前回から変わっておらず、前回の確かめのとおり。

## 指摘

### 指摘1（軽）: 「Linux のデスクトップ（Aura）」は、Aura が Linux だけのものと読める

`ui/events/BUILD.gn` では `gesture_configuration_aura.cc` は `use_aura` の構成（Linux・Windows・ChromeOS）で使われる。§8 の書き方は事実としては誤りではない（Linux が Aura であることは正しく、Windows については何も言っていない）が、「（Aura）」が Linux の言い換えに読める。直し方の例:「Linux のデスクトップは Aura の設定を使い、25 dip より小さければ 25 dip に広げ、上は収めない」。

### 指摘2（軽）: `radiusX`・`radiusY` が 12.5 と 16 のあいだのときの面が書かれていない

箇条1は「12.5 以下を渡しても同じで、16 以上を渡すと一辺 32 dip」と両端だけを書く。あいだ（例えば 14）は一辺 2×radius（28 dip、半辺 14px）になる。測りの手順は 16 を渡す形なので迷いは生まないが、「一辺は 2×radius を 25〜32 dip に収めたもの」と1文で書けば両端の文も要らなくなる。

## PM への依頼

1. 上の軽の2件を、PM が直す（builder に頼むなら、直したあともレビューに通す）。
2. 判定は承認なので、軽を直したうえで取り込んでよい。
