# cycle-318 の全体のレビュー

- 対象: 主の木 `/home/user/yolo-web`、ブランチ `design-rollout`、HEAD 14fda29a。このサイクルの差分 `git diff cdd544e7..HEAD`（41 ファイル）
- 照らしたもの: CLAUDE.md・docs/constitution.md・`.claude/rules/`（delegation・file-editing・doc-directory・coding-rules・testing）、anti-patterns の implementation.md・workflow.md・planning.md、cycle-316 の split-plan.md・t5a-design.md・t5a-measure.md・carryover-tasks.md、このサイクルのレビューの記録すべての判定と申し送り

## 判定: 改善指示

指摘は2件で、どちらも記録の文の直しで済む。来訪者に届くもの（Q1 の文言・`reveal.ts`）と、成果物どうしの式・範囲・名前・行き先には、直すべき食い違いは見つからなかった。

## 指摘

### 1. 補足事項の T5a-2 のレビューの経過が、記録と合わない（index.md 96行）

「第15・16回では、レビューが示した直し方の例を確かめずに入れて、事実と違う文が2度入った。第17回からレビュアーが Chromium で試して確かめた形だけを入れ、収まった。」とあるが、記録では次のとおりである。

- 第15回の例（`page` の出来事で拾う）を入れた文の誤りを、第16回が見つけた。
- 第16回の例（`request` の `frame().page()`）を入れた文の誤りを、第17回が見つけた。
- 第17回の例は確かめた形だったが、builder がそれに確かめていない帰結（「閉じずに置くと…行き先が二重に記録される」）を足し、第18回がそれを事実でないと見つけた（review-t5a-2-18.md 指摘1。同じ回の指摘2はボタンの文言の違い）。

つまり、確かめない文が入ったのは3度で、第17回の直しのあとにも1度起きている。「第17回から…収まった」は事実と違う。この段は完了の処理のアンチパターンの点検の元になるので、型が「レビューの例を確かめずに入れる」だけでなく「確かめた例に、確かめない帰結を足す」も含むことが落ちると、点検が狭くなる。

直し方: 3度の回と中身（例の取り込み2度・確かめた例への帰結の足し1度）を記録どおりに書き、収まったのは第18回の直しのあと（第19回で承認）とする。点検で扱う型も、その2つを挙げる形にする。

### 2. t5a-design.md の3行目が、設計の文書の直しを承認したレビューを指していない

3行目の「それをこの文書に入れた形のレビューの記録」は第1回（review-design-fixes.md）・第2回（review-design-fixes-2.md）だけで、承認した第3回（review-design-fixes-3.md）が無い。並んでいるのがどちらも改善指示なので、この文書を読む次のサイクルは、いまの版が承認されたものかを辿れない。第3回の記録の参考2点目（「この記録（第3回）も、3行目のレビューの記録の並びに足しておくと、たどりやすい」）が拾われずに残っている。

直し方: 3行目の並びに「・[第3回](../cycle-318/review-design-fixes-3.md)」を足す。

## 見てほしいと言われたことの確かめ

**実施する作業とレビュー**: 9つのチェックはどれも事実と合う。各タスクの最後のレビューは承認である（計画 review-plan-3・振り分け review-triage-5・設計の文書の直し review-design-fixes-3・T5a-2 と T5a-2b review-t5a-2-19（T5a-2b の文言と前後12枚の画像は第11回で指摘なし）・T5a-1 review-t5a-1-2・T5a-3 review-t5a-3-3）。各承認のあとに対象のファイルが変わっていないことを `git log cdd544e7..HEAD -- <パス>` で確かめた（t5a-measure.md は 1d43c241 だけ、t5a-design.md・carryover-tasks.md は 16fe8475 だけ、DESIGN.md・スキルは a77f4b6a・a7d6888d、`reveal.ts` は 8595a44e・843077ad、試験は 47fa25d3 まで）。最後の記録の申し送りは、index.md の表の行（review-triage-5）、T5a-3 の依頼への範囲の説明（review-t5a-1-2。`reveal.ts`・nakamawake のコメントが新しい範囲で書かれている）、開始の画面の語（キャリーオーバー90行）と、どれも拾われている。拾われていないのは指摘2の1つだけ。表の回数と、振り分けの指摘の数（11・8・8・4）も記録と合う。担当の木と枝は残っていない（`git worktree list`・`git branch`）。

**成果物どうしの一致**: 画面の範囲の式は、device-triage.md D4・7章、device-triage-reveal.md、t5a-design.md 4-5、DESIGN.md §8、スキルの送りの項、`visibleRange()` で同じ（上端 `offsetTop`、下端 `offsetTop + min(visualViewport の高さ, 100svh の高さ)`、無いときは `min(innerHeight, …)`、0 以下なら小さいほうを取らない）。単体試験は reveal の3章の6つ（`visibleRange` の describe の7件）と、t5a-design.md 7章の T5a-3 の行が挙げるもの（4-5 の4つ・手順5の順・打ち切り・キーボード）を持つ。DESIGN.md §8 の着地の範囲（まとまり・開始の画面・結果のボックスの 8px〜1/3 と名前の下端）と 100px は `planGroup`・`planFromPageTop`・`planHeadedBox`・`DOUBLE_TAP_REACH` と合う。根の `touch-action` は D1・7章の T5a-4・スキル・t5a-design.md 7章で同じ置き方（`:root:has(.<箱のクラス>)`、`src/app/play/[slug]/page.module.css`）。t5a-measure.md 37行は device-triage.md 7章の T5a-2 の行の文と同じ。

**来訪者に届くもの**:

- Q1 の文言は意味を変えず（「自然に」を落とし「考えつつ」→「考えて」「確認できてから」→「確認してから」）、結果の計算に掛からない。
- `visibleRange()` の変化は、送ってツールバーが縮んだときだけ下端をツールバーの分上にみなすもので、デスクトップとツールバーが出ている状態では値が変わらない。文字盤が開けば `visualViewport` のほうが小さく、今までどおり。つまんで拡大したときも、高さを比べてから上端に足すので下端が上で切られない。見えない箱は `aria-hidden`・`visibility: hidden`・`pointer-events: none` で、読んだあとすぐ外す（試験あり）。毎回の組みの計算の費用は 0.037〜0.072ms（review-t5a-3.md）で、呼ぶのは操作とフォーカスのときだけ。nakamawake の `revealFocusedWord` は、前のコードも上下どちらに出ても送っており、ふるまいは同じで、コメントが事実に合った。kanji-kanaru は結果のボックスの上端がツールバーの帯にあれば送る形になる。害は見つからなかった。
- 足した着地の関数（`planGroup`・`chooseLanding`・`revealLanding` など）は、いまはどの面も呼ばない。T5a-5・T5a-6 が使う前提で、出荷は `design-rollout` の1回なので来訪者には届かない。

**キャリーオーバーと backlog**: 次のサイクルは、順（T5a-5 → T5a-6 → T5a-4 → T5a-7）・中身の置き場（t5a-design.md 7章、device-triage.md 7章）・測りの道具の取り方（`cycle-316-records` の `rev-t5a2/`、`--unshallow`）・5-3 を測り直すことが分かり、迷わず始められる。T5a-4 が待つ T5-3c（4deae9a7）は HEAD の祖先で、もう待つものは無い。backlog の B-754（Active。完了の処理で Queued に戻す）・B-614・B-624・B-623（Queued。T5a で直し、閉じる条件つき）・B-620（材料を t5a-design.md 8章の5・D5 と名指す）・B-788（T5a-4 のあと）・B-789（T5a-7 のあと）は、いまの状態と合う。

**補足事項**: 1つ目（計画の承認の前に T5a-2b の担当を起こした）は review-plan-3.md の参考と、起点 8a2ba784 で事実と合う。3つ目（`sed -i ''`）は、GNU sed では `''` が空の式になり中身が変わらないことと、8817ce95 の差分で合う。2つ目は指摘1。

**大きさと No patchwork**: index.md は 24,514 バイト、device-triage.md は 39,960 バイトで、どれも 40,000 以下。`DESIGN.md`・スキル・`reveal.ts`・2つの `GameContainer.tsx` に、経緯の字・タスク ID・サイクル番号は無い。

**検査**: 主の木で `npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build` が exit 0（試験 402 ファイル・6622 件が通り、1 ファイル・1 件は既存のスキップ。build は 4040 ページ）。

**スクリーンショット**: 画面に出る変更は Q1 の文言だけで、前後の12枚は第11回で来訪者の目で見られている。`reveal.ts` の差は Chromium では `100svh` が `innerHeight` に等しく画面に出ない。担当の木はもう無く、撮るサーバーの指定も無いので、撮り直していない。

## 参考（指摘ではない）

- device-triage.md の D5（138行）と D9（203行）は、B-620・B-623 の書き換える前の backlog の文を引いている。いまの行は「材料はt5a-design.md 8章の5・…D5」「iOSの確かめは…D9」で、たどれば着くので、読み違いは起きない。device-triage.md は上限まで 40 バイトしかないので、直すなら文を縮める形になる。
- t5a-design.md 7章の「T5a-1 は、`DESIGN.md` と SKILL.md にある別のタスクの未コミットの変更…を待つ」は、T5a-1 が済んだいまは役目を終えた文である。サイクルの文書なので残してよい。
- review-design-fixes-3.md の参考1（4-12 の「B-620 と合わせて判断する」と 8章の5 の「B-620 とあわせて見直す」の言い方の差）は、次に触るときにそろえればよい。

## アンチパターンの点検

- AP-WF01（最後の直しのあとのレビュー）: 各タスクは承認のあと対象を変えていない。キャリーオーバー（ce763aba）と記録の行は、この全体のレビューが見た。
- AP-WF06（事実の確かめ）: 補足事項の文を各回の記録の判定と指摘で突き合わせ、指摘1を見つけた。
- AP-WF09（形式的な点検）: index.md の「承認」の表をうのみにせず、最後の記録を開き、承認のあとのコミットをファイルごとに見た。
- AP-WF41（改稿で入る欠陥）: このサイクルでは T5a-2 の第16〜18回が当たる。補足事項がそれを狭く書いている（指摘1）。
- AP-I01（来訪者にとっての最高の体験）・AP-I07（本番ビルド）: 来訪者に届く2つの変更に害は無く、本番ビルドが通る。
- そのほかの項目: 該当なしか、各タスクのレビューで見られている。

## PM への指示

1. 指摘1（index.md の補足事項）と指摘2（t5a-design.md の3行目）を builder（主の木。`docs/cycles/` の記録だけを書く）に直させる。
2. もう一度、全体のレビューを依頼する。前回の指摘だけでなく全体の見直しを含める。
