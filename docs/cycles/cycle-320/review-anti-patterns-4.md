# cycle-320 アンチパターン集の更新のレビュー（第4回）

対象: 担当の木 `.claude/worktrees/agent-a3c19abe3a501fcdd`、枝 `worktree-agent-a3c19abe3a501fcdd`（353b99fe）。起点 214b332f からの3コミット（1654c742・ccd61a02・353b99fe）。`git diff 214b332f worktree-agent-a3c19abe3a501fcdd` の `docs/anti-patterns/workflow.md`・`docs/anti-patterns/candidates.md` と、candidates.md の全文を読んだ。主の木の 214b332f 以後に `docs/anti-patterns/` の変更は無い。

根拠として読んだもの: 主の木の `docs/cycles/cycle-320/review-ap-check-2.md` の全文、`docs/cycles/cycle-320/index.md` の「手順を外れたこと」（105〜125 行）、`.claude/rules/anti-patterns-directory.md`。

## 結論

**改善指示**。workflow.md に足した発生（AP-WF01・AP-WF04・AP-WF50）と、candidates.md の AP-WF20・AP-WF53・AP-WF56 の候補に足した発生は根拠と合い、足し漏れも無い。N の数え方の直し（AP-WF31 を N=1 に、AP-WF32 の N を本体と同じ 12 に）も正しい。外した事例は、確かめたものはどれも参照先のサイクル文書にあった。ただ、次の3つが残る。

## 確かめたこと

### 足した発生と根拠

- AP-WF01（G3・G8、index.md 107・112 行）、AP-WF04（G5、111 行）、AP-WF50（G6、111 行）は、review-ap-check-2.md の「PM がすること」4 が挙げた3つと合う。
- AP-WF20 候補（G1、109 行）、AP-WF56 候補（第1回の点検と G2 の2度、109 行）、AP-WF53 候補（112 行のアンチパターン集の更新の依頼）も根拠と合う。AP-WF20 の「フックをすり抜けた形態」は、候補の補足の書き方とそろう。
- 足し漏れ: index.md 105〜125 行が名指す AP（WF01・04・06・07・08・09・10・11・12・23・29・41・50、P01・P16、候補の WF20・WF53・WF56）は、本体と候補のすべてで 320 を持つ。AP-WF30 は G2 が「近い」と書いただけで、index.md は名指さないので、足さないのは妥当である。
- AP-WF32 候補の N=12 は、workflow.md の AP-WF08 の発生（317・320 を含む12）と合う。

### 外した事例が参照先にあるか

開いて確かめた: cycle-243.md の違反5（「7ページで6回」）、cycle-256.md（cycle-kickoff へのゲートの追記と撤回）、cycle-287/findings.md の C2 と index.md の補足事項（`showMedal` の枝・`ResultPageShell.tsx:84`）、cycle-290/index.md の「ブログ撤回の記録」（Search Console の論の撤回）、cycle-297/triage.md・incident-2.md（娯楽くじと Rule4）、cycle-297/incident-1.md（git での内心の検証）、cycle-298/incident-1.md（Minor の指摘と語彙）、cycle-299/incident-2.md（favicon.ico の寸法へのすり替え）。どれも外した事例の中身がある。

外したあとの概要は、AP-WF36・AP-WF40・AP-WF32 で事例を一般化した1文に置き換えていて、型の意味は失われていない。AP-W20 の「誤った対処法の記録」を「取り違えやすい根拠」に書き直し、経緯（「当初…正当化しかけた」）を外したのも、ツギハギ禁止に合う。

## 指摘

### 1（中）: AP-WF32 候補から、事例と一緒に詳細の先まで消えた

前の版は「詳細 cycle-290/review-log.md・cycle-316/decisions-process-4.md の点検の15巡目の行」を持っていた。今の版は事例の段落ごと外したので、詳細の先が1つも無い。新しく足した概要の1文「AP-WF08 を名指して認識していながら、同じサイクルの中で PM が実装を自ら書く形でも起きる」は cycle-294 の事例から来ているが、その先（cycle-294/incident-1.md の 10 行に「AP-WF08 を認識していながら運用で守れなかった実例」とある）も書いていない。読み手は、概要の主張の出どころをたどれない。ほかの候補は事例を外す代わりに詳細の先を発生件数に置いており、この候補だけ外れている。

直し方: 発生件数に、少なくとも cycle-290/review-log.md・cycle-294/incident-1.md・cycle-316/decisions-process-4.md（点検の15巡目の行）を詳細の先として置く。

### 2（軽）: 詳細の先の置き場所と網羅がそろっていない

最後のコミットの題は「詳細の先…をそろえる」だが、そろっていない。

- AP-WF28 候補だけ、詳細の先を概要の末の括弧に置き、発生件数はサイクルの一覧を繰り返している。ほかの候補は発生件数に置く。発生件数の側へ移し、一覧を1か所にする。
- 詳細の文書があるのに先を書いていない発生がある。AP-WF28 の 312（cycle-312/ の incident の中に AP-WF28 を名指すものがある）、AP-WF36 の 313（cycle-313/incident-13.md）、AP-WF40 の 312（cycle-312/incident-14.md または index.md に「すり替え」がある）、AP-P35 の 307（cycle-307/incident-1.md）、AP-WF19 の 219（cycle-219.md）、AP-I14 の 301（cycle-301/incident-1.md）。AP-WF19 の 218 は、cycle-218.md に AP-WF19 の名も該当の記述も grep では見つからなかったので、根拠を確かめる。
- AP-WF19・AP-I14 は、概要の末の「（cycle-… で実際に発生）」と発生件数が同じ一覧を二重に持つ。

直し方: 詳細の先は、どの候補も発生件数の括弧に、発生ごとに置く形へそろえる（文書が見つからない発生は、その旨を確かめたうえで判断する）。

### 3（軽）: AP-WF21 の取り下げの記録に、特定の状況の事例と手順が残っている

「取り下げ理由」は prettier の版（3.8.3）・hook のコマンド・較正テストの手順を、「残骸となった事象記録」の前の項は cycle-245 の事故の原因の推定を書く。「正しい運用」は Edit で書く・行長の hook に止められたら削る・実測で再現を取る、という手順である。どちらも `.claude/rules/anti-patterns-directory.md` の Don't（特定の状況の事例・手順を書かない）に当たる。見出しの打ち消し線も、同じ取り下げの AP-WF18 には無く、書き方がそろわない。

直し方: AP-WF18 と同じ形に縮める（何の案を、どの理由で取り下げたかを一般化した2文と、詳細 cycle-245.md・cycle-246.md）。「Edit・Write を回避して bash で書き戻さない」は `.claude/rules/file-editing.md` が正典なので、そちらを指せば足りる。手順のうち残す価値のあるものは、`docs/knowledge/` などの手順書にあるかを確かめ、無ければそちらへ移す。

## PM がすること

1. builder に、担当の木で指摘1〜3を直させる（指摘1 は詳細の先を戻すこと、指摘2 は候補の全体の詳細の先をそろえること、指摘3 は AP-WF21 を縮めること）。
2. 直したあと、新しい reviewer に、前回の指摘だけでなく candidates.md と workflow.md の差の全体を見直させる。
