# cycle-318 の全体のレビュー 第2回

- 対象: 主の木 `/home/user/yolo-web`、ブランチ `design-rollout`、HEAD 28cbfdee（作業ツリーに未コミットの変更なし）。第1回からの差分 `git diff 14fda29a..HEAD`（3 ファイル）と、このサイクルの差分 `git diff cdd544e7..HEAD`（42 ファイル）
- 照らしたもの: CLAUDE.md・docs/constitution.md・`.claude/rules/`（delegation・file-editing・doc-directory）、anti-patterns の workflow.md・implementation.md・planning.md、[review-final.md](./review-final.md)、[review-t5a-2-15.md](./review-t5a-2-15.md)〜[-19](./review-t5a-2-19.md)、[review-design-fixes-3.md](./review-design-fixes-3.md)、docs/backlog.md

## 判定: 承認

第1回の指摘2件は閉じた。サイクル全体を見直しても、新しい指摘は無い。

## 第1回の指摘の確かめ

1. **index.md の補足事項の T5a-2 のレビューの経過**: 直した段を、各回の記録の判定と指摘に1文ずつ当てた。
   - 「第15回と第16回がそれぞれ示した直し方の例を確かめずに入れ、次の回（第16回・第17回）が誤りを見つけた」: review-t5a-2-16.md の判定は、24行の取り方を「第15回の直し方の例（`page` の出来事で拾う）をそのまま入れたもので、例そのものが誤っていた」とする。review-t5a-2-17.md の判定は、第16回の例（`request` の出来事の `frame().page()`）が、最初の遷移でなくエラーのページの読み直しの要求を見た観察から出ていたとする。合う。
   - 「第17回の例はレビュアーが Chromium で試して確かめた形だったが、builder がそれに確かめていない帰結（閉じずに置くと行き先が二重に記録される）を足し、第18回が見つけた」: review-t5a-2-17.md の指摘1 の直し方は「上の表で試して確かめた形」と書き、review-t5a-2-18.md の判定と指摘1 は、builder が足した「二重に記録される」が24行の決め方のもとでは起きない（8回とも1回）とする。合う。
   - 「第18回の直しで、確かめた形だけが残り、第19回で承認された」: review-t5a-2-19.md は、理由の文が消えて「すぐ閉じる。」で終わる形を承認している。合う。第18回の指摘2（ボタンの文言）はタブの行き先と別の話なので、この段に無くてよい。
   - 点検で扱う型が「確かめない直し方の例の取り込み」と「確かめた例に確かめない帰結を足すこと」の2つになり、第1回が求めた広さになった。表の「9（第11〜19回）」とも合う。**閉じた**。
2. **t5a-design.md の3行目**: 設計の文書の直しのレビューの並びに「・[第3回](../cycle-318/review-design-fixes-3.md)」が足され、承認した回まで辿れる。リンクの先はある。差分はこの1か所だけで、ほかの行は変わっていない。**閉じた**。

## サイクル全体の見直し

- **第1回のあとの差分**: 上の2か所と review-final.md の追加だけで、来訪者に届くファイル（`reveal.ts`・2つの `GameContainer.tsx`・`character-personality.ts`）と DESIGN.md・スキルは第1回から変わっていない。第1回の検査（typecheck・lint・format:check・test・build）の結果はそのまま成り立つ。
- **来訪者に届くもの**: `reveal.ts` の差分を読み直した。`visibleRange()` は `svh` が読めないとき（0 以下）に前の値に戻り、見えない箱は `aria-hidden`・`visibility: hidden`・`pointer-events: none` で読んだあとすぐ外す。nakamawake の `revealFocusedWord` は `isInside`（上端と下端の両方を見る）に置き換わり、前のコードと同じ条件で送る。kanji-kanaru は同じ計算を `visibleRange()` に寄せただけ。Q1 の文言は意味を変えていない。第1回の見立てのとおり、害は見つからなかった。
- **成果物どうしの一致・backlog**: B-754（Active）・B-614・B-624・B-623・B-620・B-788・B-789 の行は、index.md のキャリーオーバーと device-triage.md の D1・D2・D5・D9 を正しく名指す。
- **担当の木と枝**: `git worktree list` は主の木だけ、`git branch` は `design-rollout` だけで、残っていない。
- **大きさ**: index.md は 24,850 バイトで 40,000 以下（doc-directory.md の上限は index・decisions・carryover に掛かる）。
- **No patchwork**: 直した2か所に、直した跡（「追記」などの字）は無い。index.md の段は経緯を書く補足事項の中で、サイクルの文書なので経緯を書いてよい。
- **検査**: 主の木で `npm run format:check` が通る（All matched files use Prettier code style!）。

## アンチパターンの点検

- AP-WF01（最後の直しのあとのレビュー）: 第1回のあとの直し（28cbfdee）を、この回が見た。
- AP-WF06（事実の確かめ）: 直した段の各文を、review-t5a-2-16〜19.md の判定と指摘に当てて確かめた。
- AP-WF09（形式的な点検）: 差分だけでなく、index.md の全文と `reveal.ts` の差分を読み直した。
- AP-WF41（改稿で入る欠陥）: 直した段がほかの文（表の回数・T5a-2 の要約の段）と食い違わないことを確かめた。
- そのほかの項目: 該当なしか、第1回と各タスクのレビューで見られている。

## PM への指示

承認。完了の処理に進んでよい。補足事項が挙げる2つの型（レビューの直し方の例を確かめずに入れること・確かめた例に確かめない帰結を足すこと）と `sed -i ''` の件は、完了の処理のアンチパターンの点検で扱う。
