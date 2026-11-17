# レビュー第4回: knowledge の直し（タッチの調整の知見の軽の2件）

- 対象: 担当の木 `/home/user/yolo-web/.claude/worktrees/agent-afd633aea0e4368d9`、枝 `worktree-agent-afd633aea0e4368d9`、先端 b01ab8a0（コミット1つ）。差は `git diff fb506f1e b01ab8a0`
- 変えたファイル: `docs/knowledge/input-events-and-guards.md` の §8 の2行だけ（2 行足し 2 行消し）
- 結果: **承認**（指摘なし）

## 確かめたこと

- 前回の指摘1（Aura の書き方）: 面の1段目が「Linux のデスクトップは Aura の設定を使い、25 dip より小さければ 25 dip に広げ、上は収めない」になった。Aura が Linux の言い換えには読めなくなり、Linux が Aura の構成を使うという、`ui/events/BUILD.gn`（`use_aura` で `gesture_configuration_aura.cc`）と合う書き方になった。根拠の箇条の「Aura で `gesture_configuration_aura.cc`」とも食い違わない。Windows・ChromeOS について確かめていないことは書いていない。直った。
- 前回の指摘2（radius が 12.5〜16 のときの面）: 二度押しの箇条1が「一辺は `touchPoints` の 2×max(radiusX, radiusY) を 25〜32 dip に収めたもの、届くのは max(dx, dy) がその半分より小さい所まで」の1文になり、両端だけを書いた文が消えた。直った。
- 一次資料との突き合わせ: 25〜32 dip は、1段目の Aura（下限 `default_radius_ = 25`、`max_gesture_bounds_length_ = 0` で上は収めない）と2段目の Blink（`kMinAdjustmentSizeDip(20)`・`kMaxAdjustmentSizeDip(32)`）を重ねた結果で、タグ `153.0.8010.12` の読み（前回まで確かめた `gesture_configuration.h`・`gesture_configuration_aura.cc`・`touch_adjustment.cc`）と合う。`motion_event_web.cc` の `GetTouchMajor` が `2 * max(radius_x, radius_y)` であることとも合う。
- 実測との突き合わせ: 渡さない（既定 1）・1・10・12 は 2・2・20・24 dip が 25 dip に広がって dy 12 で寄り 13 で寄らない。16・24 は 32・48 dip が 32 dip に収まって dy 15.5 で寄り 17 で寄らない（review-knowledge-2.md）。review-t5a-7a-1.md の 1・5・10 で 6px、16・24 で 9px の2段とも合う。12.5〜16 のあいだの値は測っていないが、文はソースからの式として書かれ、§8 の根拠は「確認と実測」で両方を挙げているので、測ったと偽ってはいない。
- まわりとの整合: 1文目の式の書き方は、「面」の項の1段目・2段目（2×max の正方形 → Aura の下限 → Blink の 20〜32）と同じ順で、箇条2〜4 の「道具の面（半辺 12.5px）」は2文目の既定の押しを指していて食い違わない。「その半分」の単位は、2文目と「届く範囲」の項の「つまみで拡大していなければ CSS px」から読める。
- ツギハギ: 直した2行は、初めからそう書いたように読め、直しの跡や注記は残っていない。ほかのファイルとほかの節は変わっていない。

## 指摘

なし。

## PM への依頼

1. 判定は承認なので、枝 `worktree-agent-afd633aea0e4368d9`（先端 b01ab8a0）を取り込んでよい。
