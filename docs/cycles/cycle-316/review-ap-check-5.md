# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（5巡目）

レビュー日: 2026-10-02
対象: [review-ap-check-4.md](./review-ap-check-4.md) の指摘への対応（split-plan.md 2・6 の手順のコミットの中身とそろえ方、AP-WF38 の本文、split-plan.md 6 の前書きと手順1・2 の確かめ、AP-WF42・AP-WF43 候補の対症療法案、workflow.md・planning.md・implementation.md の事例の文、`cycle-completion` の手順7）と、`docs/cycles/cycle-316/` の全体（未追跡を含む）、`docs/anti-patterns/` の workflow.md・planning.md・implementation.md・candidates.md の全体。split-plan.md 6 の手順0〜5 は、文書・コマンド・`.claude/hooks/` の実物と突き合わせた。hook・take-screenshot・knowledge のコードと文の中身は別のレビュー（review-ap-fixes の巡）の範囲で、ここでは再発防止がそこで担保されたか、と手順のコミットで main に入れてよいか、の観点で見た。

この点検の対象の多くは内部記録なので、AP-WF38 のとおり、指摘は後の作業を誤らせる実体の誤り・虚偽の記録・規則に反する所に限った。

## 判定

**要修正**

前回の指摘はどれも直った。手順のコミットはアンチパターン集の4ファイルと hook 一式をそろえる形になり、main から昇格した5項目が消える道は閉じた。AP-WF38 は頼む側の行為を問う形になり、AP-WF01・完了のチェックリストと食い違わない。手順0〜5 は、下の1点を除き、PM が上から打てる。

残る重い点は1つで、手順のコミットが `docs/knowledge/` を丸ごと完了のコミットにそろえることにより、main に、main のコードに無いものを「このサイトの今の作り」として書いた知見と、main の `docs/README.md` の運用ルールと食い違うファイルの形が入ることである（中1）。ほかに、前回の軽3 の直しの記録が、直していない箇所を「直した」と書いている（軽1）。

## 確かめたこと（実測）

- **remote の状態**: `git ls-remote` で、main は 9c848bd0（ローカルの origin/main と同じ）、`design-rollout-wip` は 20a29292（ローカルと同じ）、`cycle-316-records` は b42b12cf。`design-rollout` はまだ無い。ローカルの HEAD は da54202e で、origin の `claude/cycle-kickoff-rv3l21`（052c0cf9）より1つ先にある（手順2 は `design-rollout` へ push するので差し支えない）。
- **手順0**: `git diff da54202e 83a8cbd9 -- .claude/skills/frontend-design/SKILL.md` は `DataTable` の項の1つの hunk で、その新しい文は作業ツリーに1度だけある。`git diff da54202e` の同じファイルの hunk は3つ（前書き・4・`DataTable`）で、1文を戻せば split-plan.md のとおり2つになる。
- **手順1**: `git diff --name-only --no-renames da54202e design-rollout-wip -- src` の65行と、作業ツリーの `src` の変更と未追跡（`--untracked-files=all`）の65行は一致した。`design-rollout-wip` が da54202e から変えるのは `src/` と `frontend-design` スキルだけで、作業ツリーの完了のもの（`docs/`・`.claude/`）と重ならないので、`git switch` は完了のものに触れない。
- **手順2**: 作業ツリーの `src/` 以外の変更と未追跡のファイルに `npx prettier --check --ignore-unknown` を掛け、すべて整形済みだった。`.claude/hooks/lib/__pycache__/` は `.gitignore` の `__pycache__/` で除かれ、`git add .` に入らない。`src/`・`docs/`・`.claude/` の外に変更は無い。
- **手順3 の hook の確かめ**: 作業ツリーの hook（手順3 が main に入れるのと同じ版）に split-plan.md の4行を打った。`pre-commit-check.sh` は何も出さず exit 0、`pkill -f next-server` は `[BLOCKED]` と `Detected: pkill` で exit 2、`kill 12345` は exit 0。`stop-cycle-guard.sh` は、`git archive origin/main docs/cycles` を書き出したスクラッチパッドの写しで打ち、最新が cycle-315（`completed_at: 2026-09-23T12:00:58+0000`）なので exit 0 だった。この確かめのコマンドそのもの（一重引用符の中に `pkill` と `git commit` を含む）は、いま動いている kill の hook にも pre-commit の hook にも止められなかった。`block-destructive-git.sh` は `git switch`・`git switch -c … origin/main`・`git rm`・`git merge`・`git branch -d`・`rm -rf .next` を止めない（パターンの1〜11 に当たらない）。
- **手順3 の道具の版**: main と cycle-316 の `package-lock.json` の prettier（3.9.5）・eslint（9.39.5）・typescript（6.0.3）・next（16.3.0）は同じで、main の `node_modules` で pre-commit が完了のコミットと同じ判定をする。コンテナは Node 22.22.2・npm 10.9.7 で、`npx -y npm@11 ci` が要るという前提と合う。
- **手順3 のそろえるファイル**: `git diff --no-renames --name-status origin/main` の7つのパスは、M が 19・A が 5（knowledge）・D が 3（knowledge）で、ほかに未追跡の A が4つ（kill の hook と `lib/` の3つ）ある。どれも Edit・Write・`git rm` で当てられる量である。
- **手順5**: main の側の `deploy.yml` は CI のジョブ（Lint・Typecheck・Test・Build）だけで配備のジョブを持たず、`vercel.json` は main だけを配備する。`design-rollout` の側は 9c848bd0 から `deploy.yml` を変えていない。main の backlog の B-754 は Queued にある。
- **take-screenshot を main に入れること**: main は next-themes の `defaultTheme="system"`（`enableColorScheme` は既定で有効）で、ブラウザの設定を dark にすると `<html>` の `color-scheme` が dark になるので、新しい `take.ts` の dark の確かめ（`prefers-color-scheme` と computed の `colorScheme`）は main の面でも通る。main のサイクルが4通りの撮影（AP-WF05）をできなくなることは無い。
- **review-ap-fixes の巡**: review-ap-fixes-3.md（04:58）は要修正で、そのあと 05:01〜05:06 に kill の hook・`lib/`・`pre-commit-check.sh` が書き換わっている。index.md と review-log.md は3巡目を「レビュー中」と書いており、いまの状態（3巡目は要修正、直しの途中）より古い。どちらの承認も完了のコミットの前の条件として書かれているので、ゲートは働いている。表は PM が次の巡の結果を受けて更新する。

## 指摘（重い順）

### 中1 手順のコミットが `docs/knowledge/` を丸ごと main に入れると、main のコードと main の `docs/README.md` に反する知見が main に載る（AP-WF41・AP-WF12）

- split-plan.md 2 と decisions.md の4巡目の中1 の行は、手順のコミットを「どのセッションにも効く手順と道具」を完了のコミットと同じ形で入れるものとし、そのパスに `docs/knowledge/`（全体）を含めた。手順3 は7つのパスを完了のコミットと同じ中身にさせ、`git diff` が空であることを確かめさせる。
- ところが `docs/knowledge/` には、cycle-316 が変えた**コードの今の状態**を事実として書いたファイルがある。main にそのまま入れると、main のコードと食い違う。
  - `codegen-patterns.md` は「現行のフックで回る生成は `scripts/generate-release-id.ts` だけで、これはソースを glob で発見しないため、下の落とし穴は glob で発見する生成を足したときに当てはまる」と書き、toolbox の registry の節を消している。main の `package.json` は `prebuild`・`pretest`・`pretypecheck` で `generate:toolbox-registry`（`scripts/generate-toolbox-registry.ts`）をいまも回している。main で道具を撤去する急ぎのサイクルがこの知見を読むと、撤去した道具の生成物が蘇る落とし穴を「当てはまらない」と判断しうる。
  - 新しい `clipboard-and-copy.md` は「このサイトで語結合子を置くのは2か所ある」として、`src/lib/phrase-dashes.ts`・`src/components/WordJoinerCopyFilter`・`src/lib/clipboard.ts` を前提に書く。3つとも origin/main に無い（`git cat-file -e` で確かめた）。
  - 消す3つのうち `2026-03-16-ai-agent-communication.md` は、main の `docs/README.md` 70 行が一覧に載せているファイルで、手順3 の後の main ではリンクが切れる。
- さらに、cycle-316 は `docs/README.md` の knowledge の運用ルールを「時点情報方式（日付を付け、既存のファイルは更新しない）」から「テーマごとに1ファイル・その場で書き直す・根拠の種別を書く・経緯を置かない」に変えた（67d6807a など、すでにコミット済み）。手順のコミットは `docs/README.md` を入れないので、main では、`docs/knowledge/` のファイルの形（日付の無い名前・書き直された既存のファイル）と、同じ main の `docs/README.md` の運用ルールが食い違う。main で知見を足す急ぎのサイクルは、どちらに従うかを決められない（CLAUDE.md のツギハギ禁止が避けようとしている、文書どうしの自己矛盾にあたる）。
- この状態は、`design-rollout` を main にマージする出荷まで（split-plan.md 7 の見込みで約20サイクル）続き、その間 main で動くのは本番の急ぎの不具合を直すサイクルで、CLAUDE.md「Use knowledge base」のとおり想定外の挙動に当たったら `docs/knowledge/` を読む。前回の指摘（中1）への直しで新しく入った形なので、AP-WF41（書き換えた所に新しい欠陥を入れる）にも当たる。
- 直すこと（PM が決め、planner が split-plan.md 2・6、decisions.md、`cycle-completion` の手順7 の一般の形を直す）: `docs/knowledge/` を丸ごとそろえるのをやめ、main に入れる知見を、main の木でも正しく、main の手順と道具が要るものに限る。少なくとも、kill の hook と take-screenshot のスキルが指す `playwright-mcp.md`（「バックグラウンドのプロセスを起こして止める」）、incident-1 の再発防止の `ai-agent-communication.md`、main の lock の `npm ci` を扱う `dependency-security.md`、ブランチを移ったあとの `.next` を扱う `nextjs.md` は要る。入れるファイルがあるなら、その形と食い違わないよう `docs/README.md` の knowledge の節（運用ルールと一覧）も同じ手順のコミットでそろえる。`design-rollout` のコードを前提にした知見（`codegen-patterns.md`・`clipboard-and-copy.md` など）は入れない。どれを入れ、どれを入れないかは、ファイルごとに main の木で事実を確かめて決め、その結果を decisions.md に書く。手順3 の `git diff` の確かめ・`git add` のパス・最後の `grep -vE` の許すパスも、それに合わせる。`cycle-completion` の手順7 の「来訪者に見える変更を含まない手順と道具を完了のコミットと同じ中身にする」という一般の形も、「main の木で正しいものに限る」ことが読める形にする。

### 軽1 前回の軽3 の直しの記録が、直していない箇所を「直した」と書いている（AP-WF09・虚偽の記録）。本体にサイクルの事例と経緯が残っている

- decisions.md の4巡目の軽3 の行は、「同じ形は本体のほかに2か所（planning.md の AP-P34 の 305・309・311 の事例、implementation.md の AP-I13 の 292 の事例）で、10か所以下なのでこのサイクルで直した」と書く。実際には、planning.md の AP-P04 に「（cycle-299: 「プレビューの描画が縦長」という指摘を「favicon ファイルのアスペクト比」にすり替えて退けた。詳細 cycle-299/incident-2.md）」が、AP-P31 に「（本項の旧末尾規定「全トラフィックを1本の全面 A/B に集約せよ」は cycle-278 でこの理由により改訂。経緯は cycle-278.md / `docs/rebuild-plan.md` §1）」が残っている。前者は `.claude/rules/anti-patterns-directory.md` の Don't（特定の状況の事例を本体に書く）に、後者は CLAUDE.md のツギハギ禁止（ファイルの中に変更の経緯を残す）に当たる。
- 「同じ形はほかに2か所」という網羅の主張が、走査した範囲を数えずに書かれている。後のサイクルはこの記録を読んで「本体の事例は片付いた」と扱い、残りを拾わない。
- 直すこと（planner）: AP-P04 の括弧の事例と AP-P31 の改訂の経緯を本体から外し（事例と経緯は cycle-299・cycle-278 の文書にある）、decisions.md の軽3 の行を、実際に直した箇所の一覧に合わせる。workflow.md・planning.md・implementation.md を、発生の欄の外にあるサイクルの番号（`grep -n "cycle-[0-9]"` で発生の欄と欠番の節を除いたもの）で走査し、その数を書く。

## workflow.md の各項目の当てはめ

- **AP-WF01（最後の修正のあとのレビュー・全指摘への対応）**: 前回の指摘はすべて直しが入った。review-ap-fixes の3巡目は要修正で、そのあと hook が書き換わっている（05:01〜05:06）。hook の次の巡と、この点検の承認が揃うまで完了のコミットを作らないゲートは index.md・split-plan.md 6 にあり、守られている。AP-WF38 の新しい本文は「限った観点の中で出た指摘にはすべて対応する」と書くので、この項目と食い違わない。
- **AP-WF02（来訪者目線のレビュー・過去の失敗の参照）**: この巡の変更は手順と記録で、来訪者に見える変更は無い。中1 は、main で動く急ぎのサイクルの手を誤らせることを通じて、来訪者に出る修正の質に関わる。
- **AP-WF03（builder への過剰に具体的な指示）**: この巡の直しは planner と PM の文書で、builder への依頼文は記録に無い。新しい発生は見つからなかった。
- **AP-WF04（完了通知・構造の変更の実体確認）**: 「手順のコミットに4ファイルと hook をそろえる」「AP-WF38 を書き直した」「事例の文を外した」の主張を、ファイルと `git diff` で確かめた。最後の主張だけが実体と合わない（軽1）。
- **AP-WF05（4通りの撮影）**: この巡で来訪者に見える変更は無い。take-screenshot を main に入れても、main の面で dark を撮れることを確かめた。
- **AP-WF06（渡す事実の確認）**: split-plan.md 6 は後のセッションへコマンドと期待の出力を渡す文書で、手順0〜3・5 の期待の出力（hunk の数・`src` の65行・hook の4行・cycle-315 の完了）は実測と合った。
- **AP-WF07（1エージェント1タスク・同じファイルの並行アサイン）**: この点検のあいだにも builder が hook を書き換えている（review-ap-fixes-3 の直し）。この点検の対象の文書とは触るファイルが重ならない。
- **AP-WF08（PM の代行）**: 文書の直しは planner、backlog は PM で、新しい発生は見つからなかった。
- **AP-WF09（形式的な通過・網羅の主張）**: 軽1（走査した数を書かずに「ほかに2か所」と網羅を主張した）。
- **AP-WF10（SendMessage での継続）**: 巡ごとに別のファイルで、白紙のレビュアーで回している。材料は無い。
- **AP-WF11（PM の通読・並べ読み）**: 手順のコミットに入れる `docs/knowledge/` と、main の `package.json`・`docs/README.md` を並べれば、中1 に気づけた。
- **AP-WF12（計画の事実の実体確認）**: 手順のコミットのパスを決めるとき、`docs/knowledge/` の各ファイルが main の木で正しいかを確かめていない（中1）。ほかの手順の前提（hook の挙動・`package-lock.json` の版・`deploy.yml`・backlog の位置）は実体と合った。
- **AP-WF13（隣接タスクへの越境）**: 新しい発生は見つからなかった。
- **AP-WF14（数の採否を一次集計で）**: このレビューは、手順1 のパスの数、手順3 の M・A・D の数、remote の ref、道具の版、main に無いパスを、git とファイルで一次集計した。
- **AP-WF15（完了処理後の補修の振り分け）**: push の前で、まだ当たらない。
- **AP-WF23（チェックリストの先行チェック）**: 終了時のチェックリストは1つも付いていない（正しい）。「すべての変更がレビューされ、残存する指摘事項が無くなっている」は、review-ap-fixes の次の巡とこの点検の承認が揃うまで付けられない。
- **AP-WF24（Owner への委任・駆動源の帰属）**: この巡で足した文に、駆動源をオーナーに帰す書き方は見つからなかった。split-plan.md はオーナーの言葉を事実の出典として引き、分けると決めた者を PM に置いている。
- **AP-WF27（内心の断言）**: この巡で足した文に、記録で裏付かない内心の断言は見つからなかった。
- **AP-WF29（自分のツールの結果を確かめてから進む）**: 手順0 は Edit の置き換える前の文の一致を確かめに使い、コミットのあと `git status --short` を見させる。手順3 は当てたあとの `git diff` が空であることと hook の4行の結果を見てからコミットさせ、手順4・5 は CI の成功を確かめてから次へ進ませ、`git branch -d` を区切って打たせる。この項目に沿っている。
- **AP-WF30（評価の結論を対応範囲を縮める根拠に使う）**: 新しい発生は見つからなかった。
- **AP-WF38（内部記録のレビューの観点）**: この点検は観点を限って頼まれており、その観点の中で指摘した。前回まで挙げなかった数え方や言い回しの揺れは、今回も挙げていない。
- **AP-WF39（効率の規律で品質のレビューを打ち切る）**: 止める巡を先に決めた形跡は無い。中1 は main に入るものを左右する実体の指摘なので、この巡で打ち切る理由は無い。
- **AP-WF41（改稿で同型の欠陥を新しく入れる・防壁の消失）**: 前回の中1 の直し（そろえるパスを広げた）で、`docs/knowledge/` まで広げたことが新しい欠陥を入れた（中1）。前回の軽3 の直しは、直したと書いた範囲が実体より広い（軽1）。

## 昇格した項目の書き方と、ほかの規則との両立

- AP-WF29・30・38・39・41 は、どれも問いとその害の2段で書かれ、事例はサイクルの番号だけで、候補にあった正しい姿・対症療法の手順・旧い候補の番号の名残は持ち込まれていない。workflow.md の発生の欄は項目ごとに1つで、継ぎ足しの括弧は無い。
- オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）: AP-WF29 は次の操作に進む前に結果を読む時、AP-WF30 は対応の範囲を決める時、AP-WF38 はレビューを頼む文を書く時、AP-WF39 はレビューを止める判断をする時、AP-WF41 は改稿を出す時とレビューを頼む時に、それぞれ害が出る前に気づける。どれも規則に反しない。
- AP-WF01・完了のチェックリスト: AP-WF38 の新しい本文は、観点を頼む時に限り、限った観点の中の指摘にはすべて対応させるので、どの指摘も閉じずに残す道を作らない。AP-WF39 はレビューを結果で止めさせないので AP-WF01 を強める側にある。
- `.claude/agents/reviewer.md`: 冒頭の「あらゆる観点から丁寧に」「どんな問題も見逃さずに」と、AP-WF38 の「観点を限って渡す」は、字の上では向きが違う。ただ、reviewer.md 自身が「依頼されたレビュー範囲」という考えを持ち、範囲の外でもアンチパターンに当たる問題は指摘させる。レビュアーは頼まれた観点の中で見逃さずに指摘し、範囲の外ではアンチパターンだけを指摘する、と読めば両立し、範囲の外から出た指摘にも AP-WF01 のとおり対応するので、AP-WF38 を守るために reviewer.md や AP-WF01 に反する道は残らない。この点検も、その読み方で観点を限って行った。規則に反するとは判断しない。
- AP-WF17 候補を本体に置かず B-784 の機械の検査に回した判断と、AP-WF28 候補を候補に置く判断は、`.claude/rules/anti-patterns-directory.md` の移管の Do と cycle-293 の結論に合う。B-784 は `design-rollout` の1つ目のサイクルにあり、検査ができるまで候補に置くと書かれている。
- incident-1 の再発防止（`stop-cycle-guard.sh` の差し戻しの文・`ai-agent-communication.md`）と incident-2 の再発防止（AP-P01 の本文）は、それぞれの先に入っていて、手順のコミットで main にも入る（`ai-agent-communication.md` を main に入れることは、中1 の直しでも保つ必要がある）。共有の pid ファイルの取り違えは、kill の hook の頭の文が「止めない」と書き、`playwright-mcp.md` の「作業者ごとの専用のディレクトリ」の決まりで防ぐ形になっている。

## 前回の指摘の扱い

| 前回                                     | いま                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 中1（手順3 で main から5項目が消える）   | アンチパターン集の4ファイルと hook 一式をそろえる形になり、直った。広げたパスに `docs/knowledge/` を含めたことが中1 を生んだ |
| 中2（AP-WF38 と AP-WF01 などの食い違い） | 頼む側の行為を問う本文になり、直った                                                                                         |
| 軽1（手順1 の `git status` の期待）      | `src` と `frontend-design` に何も出ないことを見る形になり、実測と合う。直った                                                |
| 軽2（候補に手順を書いている）            | AP-WF42・43 候補の対症療法案から手順が外れた。直った                                                                         |
| 軽3（本体の事例の文）                    | workflow.md の2つ・AP-P34・AP-I13 は直った。AP-P04・AP-P31 が残り、記録は「直した」と書く（軽1）                             |

## PM への依頼

指摘は1つ以上あるので、次のとおり進めてください。

1. 中1 の、手順のコミットに入れる知見の範囲（と `docs/README.md` の knowledge の節をそろえるか）は PM が決め、split-plan.md 2・6・decisions.md・`cycle-completion` の手順7 の文は planner に直させてください。軽1 の本体の文と decisions.md の行も planner に直させてください。
2. review-ap-fixes の次の巡が承認になったら、index.md と review-log.md のその行を更新してください（いまは3巡目を「レビュー中」と書いている）。
3. 直したあと、もう一度このレビューを依頼してください。そのときは、前回の指摘だけでなく、サイクルのディレクトリと `docs/anti-patterns/` の全体を見直す範囲にしてください。
