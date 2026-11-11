# cycle-319 T5a-5 のレビュー（第4回）

- 対象: 担当の木 `.claude/worktrees/agent-aaaa296738960e515`（枝 `worktree-agent-aaaa296738960e515`、HEAD 728df206）。起点は design-rollout の 73f03e8e
- 見たもの: 第3回のあとの差分（`720eb241..728df206`。`QuestionCard.module.css` の `.questionText` の説明の後半だけ）、全体の差分（`73f03e8e...worktree-agent-aaaa296738960e515`、13ファイル）の本体（`QuestionCard.tsx`・`QuizContainer.tsx`・`quizProgress.ts`・`Button`・`globals.css`・`QuestionCard.module.css`・SKILL.md）、index.md の作業内容の 1、t5a-design.md 4-4 の余白の項
- 自分で走らせたもの（担当の木）: typecheck・lint・format:check・test（403 ファイル・6647 件が通り、2 ファイル・8 件は skip）・build はどれも exit 0。build のあと担当の木の `.next` を消した。条件9・10 の `grep`（`QuestionCard.module.css`・`QuizContainer.module.css` の `fadeIn`・`@keyframes`・`animation` が0、`QuestionCard.module.css` の `--radius`・`outline: none`・`.resultPhase` が0）。担当の木の `git status --short` は空
- 実ブラウザの測り直しはしなかった。第3回のあとの差分はコメントの中だけで、宣言・マークアップ・試験は1文字も変わっていない（`git diff 720eb241 728df206` で確かめた）。CSS のコメントは来訪者に届く形を変えないので、第3回の64件の測りと像（review-t5a-5-3.md）がそのまま今の形に当たる

## 判定: 承認

## 第3回の指摘の直り

### 指摘1（`.questionText` の説明が下の余白の組み方を言い違えている）: 直っている

説明の後半は第3回の案の文のとおりになった。

- 「上は同じ幅の負の余白で打ち消し」は `margin-block` の1つめ `calc(-1 * var(--space-8))` と、「下は見出しの下の 16px のうち 8px を箱の内側に入れる」は `padding-block: var(--space-8)` と `margin-block` の2つめ `var(--space-8)`（内側 8 と外 8 で 16）と合う。16px は t5a-design.md 4-4「見出しの下は 16px」の値で、下の 8px を詰まった余白と取り違える読み方は無くなった。
- 「行の位置とまとまりの高さは変わらず」は、上が打ち消され、下の合計が元の 16 のままであることと合い、第3回の測り（帯の下端から一覧の上の罫線までが直す前と同じ）とも食い違わない。
- 前の文（行間が詰まっていてリングが字に重なる理由）と後ろの文（字とリングのあいだに地が残る）に続けて、いまの組みの説明として読め、経緯の残り（「直した」「以前は」など）は無い。宣言は変わっていない。

## 全体の見直し

- 完了の条件（index.md の作業内容の 1）: 4-3 の試験1〜6、切り替わりの番号の単体試験（受け付けた更新でだけ1つ増え、捨てた更新では変わらない）、4-7 の問のあいだのフォーカスの試験は全試験の中で通っている。結果と開始への切り替わりは元の段階の `useEffect` のまま残り、T5a-6 の受け持ちに入り込んでいない。既存の試験の直しは前提（偽の時計・読む規則）だけで、44px の確かめは `.faceBox` を読む形で残っている。
- 条件9・10: 上の `grep` のとおり0。第3回から `QuestionCard.module.css` の宣言と `QuizContainer.module.css` は変わっていない。
- 4-2・4-4・4-6・4-11・device-triage.md 7章の T5a-5 の行（D3 の13の宣言は `.answeredFace` にあり共有の `.faceBox` に無い・D6 の `aria-describedby` は押した行だけ）: 第3回までに確かめた形のままで、差分を読み直しても外れは無い。
- 読み直して気づいた点（指摘にしない）: `quizProgress.ts` の `answers` は `readonly` の属性だが型は `QuizAnswer[]` で、並びそのものの書き換えは型で止まらない。更新は新しい並びを作っており、説明にもそう書かれ、ほかから書き換える箇所も無いので、来訪者に届く形にも作業の正しさにも影響しない。
- 共有の部品: 第3回のあとの変更は `QuestionCard.module.css` のコメントだけで、`Button` を使うほかのページに届かない。`Button` の変更（`.faceBox`・`.underline` の切り出し）の前後の画素の比べは第1回・第2回で確かめ済み。
- 作業の進め方（workflow.md）: 指摘ごとに直しとレビューを重ね、担当の木でコミットし、主の木への書き込みは無い。lint・format:check は担当の報告どおり exit 0 で、自分の走らせた結果とも合う。

## PM への指示

指摘は無い。承認なので、`.claude/rules/delegation.md` の手順で `git log <作業ブランチ>..worktree-agent-aaaa296738960e515` を確かめてから取り込み、T5a-6 に進んでよい。
