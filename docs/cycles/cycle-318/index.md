---
id: 318
description: 統合のブランチ design-rollout の2つ目のサイクル。診断の回答の画面（T5a）の前半として、実機に頼る項目の振り分け・実装の前の測り（T5a-2）の仕上げ・character-personality の Q1 の文言（T5a-2b）・DESIGN.md とスキルの文（T5a-1）・送りの関数（T5a-3）を行う
started_at: 2026-10-05T09:28:46+0000
completed_at: null
---

# サイクル-318

B-754（サイトデザインの刷新）を統合のブランチ `design-rollout` で続ける2つ目のサイクル。[cycle-316/split-plan.md](../cycle-316/split-plan.md) 7 の表の2行目（診断の回答 T5a。見込み1〜2サイクル）のうち、回答の画面の本体を組む前に要るものをすべて済ませる。設計は [cycle-316/t5a-design.md](../cycle-316/t5a-design.md)、従う決定は [cycle-316/carryover.md](../cycle-316/carryover.md) の索引の「T5a」の行が挙げるもの。

T5a の残り（T5a-5 回答の本体・T5a-6 流れ・T5a-4 区切り・T5a-7 測りと完了のレビュー）は次のサイクルが続ける。

## 実施する作業

- [ ] 実機に頼る項目（t5a-design.md 8章の8項目）を、項目ごとに (i) 端末に頼らない作り・(ii) Chromium の近似・(iii) 受け入れて出荷のあと GA で見張る、のどれで扱うかに振り分け（[device-triage.md](./device-triage.md)）、レビューに通す。重み付けに、8章の任意の GA の照会（character-personality の画面の大きさの割合）を使う
- [ ] T5a-2: [t5a-measure.md](../cycle-316/t5a-measure.md) をレビュー第10回（[review-t5a-2-10.md](../cycle-316/review-t5a-2-10.md)）の指摘1（5-3 の押した行と進め方）と参考の4点から直し、承認までレビューを続ける
- [ ] T5a-2b: `design-rollout-wip` の `20a29292`（character-personality の Q1 の文言）を戻し、T5a-2 の承認とあわせてコミットする。t5a-measure.md 0章の「コミットの名を書き入れる」指示を、コミットの名に置き換える
- [ ] T5a-1: t5a-design.md 5章の文のうち `DESIGN.md` と `frontend-design` スキルのものを書き、レビューに通す
- [ ] T5a-3: `src/lib/reveal.ts` に、まとまりを見せる送りと着地の選び方（4-5・4-9）を足し、単体試験とともにレビューに通す
- [ ] UI の変更（T5a-2b の Q1 の文言）の前後のスクリーンショットを撮り、来訪者の目で確かめる（375×550・320×550）

## 作業計画

### 目的

診断を解く人が、狭い画面でも選択肢をすべて見て選べ、押したものが確かに入ったと分かり、次の問へ迷わず進めること（B-614・B-624・B-623）。`docs/site-concept.md` の来訪者への約束は「面白いものがここにあります」と渡すものを決め、面白いかどうかを来訪者の行動で確かめると定める。診断の面白さは解き終えて結果を読むところで起きるので、問の途中で選択肢が見えない・押したか分からないという操作の摩擦は、面白さに届く前に来訪者を帰し、行動での確かめも曇らせる。いまは 375×550 で4択のうち見えるのが1つだけの問があり、知識クイズでは「次へ」が画面の外にある。

このサイクルは、その本体を組む前の土台を固める。本体（T5a-5・T5a-6）は「選択肢が1画面に入る」と「上下どちらにも外れうるまとまりを送って見せる」を前提にする。その前提を実測で支え（T5a-2）、規則として書き（T5a-1）、送りを純粋な関数として試験で固める（T5a-3）。実機で確かめられない項目を先に振り分けるのは、(i) の「端末に頼らない作り」は作りを決める前に選ぶのが最も安いからである（t5a-design.md 8章）。

### 作業内容

1. **実機に頼る項目の振り分け**: planner（general-purpose）が t5a-design.md 2章・4章・8章と、MDN・WebKit の一次資料を読み、8項目を (i)〜(iii) に振り分けて device-triage.md に書く。(iii) の項目は、見張る GA の数と戻す判断の線の案を添える（ADR009 に書くのは T10）。GA の照会は MCP を使うので foreground の担当で行う。reviewer に通す。
2. **T5a-2**: builder（主の木。`docs/cycles/` の記録だけを書く）が t5a-measure.md を直す。5-3 の押した行と進め方は、cycle-316-records の記録（`tmp-records/scratchpad/rev-t5a2/` ほか）から分かれば書き、分からなければ5-3 の5つの画面を参考の値とし、T5a-7 が基準の版でも同じ手順で測り直す、と書く。reviewer の第11回に通す。測りの道具の組み直しは、それを使う T5a-7（次のサイクル）で行う。
3. **T5a-2b**: builder（担当の木）が `git cherry-pick --no-commit 20a29292` で戻し、`git restore --staged -- .` で下ろし、差分が Q1 の3行だけであることを確かめてコミットする。T5a-2 が承認されてから PM が取り込む。
4. **T5a-1**: builder（担当の木）が書き、reviewer に通す。T5a-2 の承認を待つ（t5a-design.md 7章）。
5. **T5a-3**: builder（担当の木）が書き、reviewer に通す。T5a-1 の承認を待つ。
6. すべてのあとに全体のレビューを受け、完了の処理で `design-rollout` に push する。

並行させるのは触るファイルが重ならないものだけにする（`.claude/rules/delegation.md`）。1（`docs/cycles/cycle-318/`）と 2（`docs/cycles/cycle-316/t5a-measure.md`）と 3（`src/play/quiz/data/character-personality.ts`）は重ならないので並行させる。

### 検討した他の選択肢と判断理由

- **T5a の7タスクを1サイクルで済ませる**: 本体は流れ・フォーカス・送り・区切りが同じファイル（`QuizContainer.tsx`）に順に重なり、T5a-2 だけでレビューが10回続いた。1サイクルに詰めると、cycle-316 と同じく文書とレビューが膨らみ、途中で止まる危険がある（split-plan.md 7「1サイクルは1つの面か、密に関係する少数の小タスクに限る」）。土台（振り分け・測り・規則・関数）と本体（画面）の境で分ける。
- **T5a-3 を次のサイクルの本体に回す**: T5a-3 は `reveal.ts` と試験だけを触り、画面に繋がない純粋な関数なので、本体と切り離してレビューできる。次のサイクルを本体だけに絞れる。こちらを採る。
- **測りの道具の組み直しを T5a-2 で行う**: 第10回のレビューは、5-1・5-2・5-4 と条件1・2・6 を文から組み直せると確かめている。道具が要るのは前と後を測る T5a-7 なので、そのサイクルで組む。いま組むと、使われないまま次のセッションで消える。

### 計画にあたって参考にした情報

- [cycle-316/split-plan.md](../cycle-316/split-plan.md) 4・7、[cycle-316/carryover.md](../cycle-316/carryover.md)、[cycle-316/decisions-t5-2.md](../cycle-316/decisions-t5-2.md) の「T5a-2 の測り」、[cycle-316/t5a-design.md](../cycle-316/t5a-design.md) 7章・8章、[cycle-316/review-t5a-2-10.md](../cycle-316/review-t5a-2-10.md)、[cycle-317/index.md](../cycle-317/index.md)
- 外部仕様への依存: 実機の項目の振り分けは、iOS の Safari が `touch-action: manipulation` でダブルタップの拡大をしないことに依る（(i) の例）。2026-10-05 に一次資料で確かめた。
  - MDN `touch-action`（https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action ）: `manipulation` はパンとピンチの拡大を残し、ダブルタップの拡大などを止める。2019年9月からどのブラウザでも使える（Baseline Widely available）。
  - WebKit blog「More Responsive Tapping on iOS」（2015-12-15。https://webkit.org/blog/5610/more-responsive-tapping-on-ios/ ）: `touch-action: manipulation` の要素で始まる触れは、パンとピンチの拡大だけに使われ、ダブルタップの判定をしない。

## レビュー結果

## キャリーオーバー

## 補足事項

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（exit 0）。**`typecheck` を必ず含める**——CI（`.github/workflows/deploy.yml`）は typecheck を**最初のステップ**で走らせ、`pre-push-check.sh` も再実行する。cycle-301 以前のテンプレートはこの4ゲート列挙から typecheck が抜けており、typecheck が赤のまま「全ゲート緑」と記録できる状態だった（cycle-301 で実際に発生）。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
