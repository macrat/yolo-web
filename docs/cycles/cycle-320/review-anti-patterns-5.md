# cycle-320 アンチパターン集の更新のレビュー（第5回）

対象: 担当の木 `.claude/worktrees/agent-a3c19abe3a501fcdd`、枝 `worktree-agent-a3c19abe3a501fcdd`（HEAD 3ff93ab8）。`git diff 214b332f worktree-agent-a3c19abe3a501fcdd`（4コミット、`docs/anti-patterns/candidates.md`・`docs/anti-patterns/workflow.md` の2ファイル）を白紙で見た。

読んだもの: 差の全文、担当の木の candidates.md の全文、`.claude/rules/anti-patterns-directory.md`、主の木の `docs/cycles/cycle-320/review-ap-check-2.md` の全文と `index.md` の「手順を外れたこと」、`review-ap-check.md` の F3・F4・AP-WF23 の項・「新しい候補」。

## 結論

**改善指示**。発生の追加は根拠と合い、詳細の参照先はすべて実在し、N の数え方も決まりに合う。外した事例のぶんの意味も概要に残っている。ただ、軽い食い違いとツギハギが4つ残っている（下の 1〜4）。

## 確かめたこと（問題なし）

- **workflow.md の発生の追加**: AP-WF01（G3・G8）・AP-WF04（G5）・AP-WF50（G6）に 320 が入った。review-ap-check-2.md の「PM がすること」4 が名指す3つと一致する。index.md の「手順を外れたこと」に出るほかのタグ（AP-WF06・07・08・09・10・11・12・23・29・41、AP-P01・P16）は、担当の木の workflow.md・planning.md にどれも 320 がある。漏れは無い。
- **candidates.md の発生の追加**: AP-WF20 候補（G1、index.md 109 行が「AP-WF20 の候補」と書く）、AP-WF53 候補（index.md 112 行）、AP-WF56 候補（G2、index.md 109 行）。どれも根拠の行と合う。
- **N はサイクルの数**: AP-WF31 候補は N=2 から N=1（cycle-287 で2度）に直った。AP-WF53 候補は 318・320 で N=2、AP-WF56 候補は N=1（cycle-320 で2度）、AP-WF20 候補は N=2、AP-WF28 候補は8サイクルで N=8、AP-WF32 候補が引く AP-WF08 は N=12 で、workflow.md の AP-WF08 の一覧と一致する。
- **昇格の条件**: N≥3 の候補は AP-WF28（昇格しない理由つき）・AP-WF54（hook へ移す）だけで、どちらも理由を書いている。
- **詳細の参照先の実在**: candidates.md が引く33本のファイルは、担当の木にすべてある。中身も開いて確かめた。cycle-218.md の T-4 の MAJOR-2（267 行、生成元のスクリプトが値を出していなかった件）、cycle-219.md の T-4 の MAJOR-1（245 行）、cycle-243.md の違反5（149 行）、cycle-246.md の「失敗 1」（160 行）、cycle-256.md（31 行の撤回）、cycle-312/incident-16.md（AP-WF28 候補）、cycle-294/incident-1.md（AP-WF08 を名指して守れなかった件）、cycle-297/incident-2.md・cycle-307/incident-1.md（AP-P35 候補）、cycle-313/incident-13.md（AP-WF36 候補、N=2 に直した経緯も中にある）、cycle-312/incident-14.md（すり替え）、cycle-287 の補足事項・findings.md の C2、cycle-290/index.md の「ブログ撤回の記録」、cycle-290/review-log.md（`markedInstance`）、cycle-316/decisions-process-4.md の15巡目、cycle-320/review-ap-check.md の F3（AP-WF28 候補の実例と書く）・F4。
- **外した事例と概要の意味**: AP-WF28・31・32・35・36・40・P35・P38・W20 の事例を外したあとも、概要は形を一般の言葉で言えている。AP-WF36 には「指摘した側が軽い指摘として出すと」、AP-WF40 には「X の欠陥は隠れたまま残る」、AP-WF32 には「名指して認識していながら」が足され、外した事例が担っていた意味を残している。AP-W20 の「取り違えやすい根拠」は事例を外して一般の形にした。AP-WF21 候補の取り下げは、手順の部分（「正しい運用」）を外して AP-WF18 候補と同じ短い形になった。手順を書かない Don't と、cycle-301/incident-1.md の「取り下げの弁明を長文で置かない」に合う。
- 他の文書（docs/ 直下・`.claude/`）で、変えた N を引いている所は無い。`prettier --check` は通る。

## 指摘

1. **AP-WF20 候補の「補足（技術的強制）」に経緯の言い方が残っている（ツギハギ）**。「`.claude/hooks/block-review-reuse.sh` が機械的にブロックする**ようになった**。**以後の**発生は…」は、いつ hook が入ったかの経緯の言い方である。candidates.md はツギハギ禁止の対象外（cycles・ADR・ブログ）に入らない。「SendMessage 経由の再レビュー依頼は `block-review-reuse.sh` が止める。止まらない言い方で頼んだ発生は『フックをすり抜けた形態』として記録する」のように、今の状態として書く。
2. **AP-WF19 候補の概要が、形でなく過去の事例として書かれている**。概要が「…その生成元スクリプトが当該値を実際には出力していなかった**事例**。」で終わる。ほかの候補はみな「〜する形」「〜という失敗」と型として書く。発生の括弧は外したが、文の枠が事例のまま残っている。「…出力していないのに、そう記録する形」のように型の文にする。
3. **発生件数の行の終わり方がそろっていない**。区切りが「/ N≥3 で…」（AP-WF19・20・31・I14・51・53・55・56）と「。N≥3 で…」（AP-W20・P35・WF34・35）に分かれ、「AP-WFxx として新設検討」と「新設検討」も混じる。さらに N<3 の AP-WF36（N=2）・AP-WF40（N=2）・AP-P38（N=1）には「N≥3 で新設検討」が無い。AP-WF36・40 は N=2 で次が昇格の検討になる候補なので、抜けると判断のきっかけを落とす。全候補で1つの形（例: 「N=k（…。詳細 …）。<近縁の AP>。N≥3 で新設検討。」）にそろえる。
4. **取り下げの2件で、詳細の参照の有無がそろっていない**。AP-WF21 候補は「詳細は cycle-246.md の『失敗 1』」と書くが、AP-WF18 候補には参照が無い。取り下げの経緯は cycle-301/incident-1.md（22・30 行）にある。AP-WF18 候補にも「詳細は cycle-301/incident-1.md」を足して、取り下げの記録の形をそろえる。

## アンチパターンの照合

- `docs/anti-patterns/workflow.md`: 担当の4コミットは candidates.md と workflow.md だけに触れ、依頼の範囲を出ていない（AP-WF13・AP-WF50 に当たらない）。依頼の根拠（review-ap-check-2.md の4）を写すだけでなく、index.md のタグを全部照合して足しており、AP-WF53 の型（点検の項目を確かめずに写す）にも当たらない。
- `.claude/rules/anti-patterns-directory.md`: 本文の事例の取り外し・番号だけの追記・N<3 を candidates に置くこと、は守られている。外れは上の 2（事例の枠）だけ。

## PM がすること

builder に、担当の木で 1〜4 を直させる。そのあと、新しい reviewer に、前回の指摘だけでなく差の全体を白紙で見直させる。
