# cycle-316 の分割（B-754 を複数のサイクルに分ける）

## 何が起きたか

cycle-316 は B-754（`DESIGN.md` をサイト全体に当てる）を1つのサイクルに抱えた。2026-10-01 に、オーナーが次のように書いた。

> このサイクルだけで週間制限をすでに2回経験しています。「1サイクルを小さく保て」というルールの真逆です。今からでもサイクルを分割できないか検討してください。途中でデプロイできずとも構いません。その場合はmainとは別のブランチを作って複数サイクルを続けて、完成してからmainにマージしてください。

このサイクルのあいだに週の利用上限に2回達したことは、この言葉が出典である。

進め方は [options.md](./options.md) で6案を比べて決めた。その中には案 D「統合ブランチで複数サイクル」（A と同じ作業を複数のサイクルに分けてブランチに積み、main には全面が揃うまで出さない）があった。D は「作業のあいだも main へ別の修正を出荷できる」ことを得るものとして評価され、「main の旧デザインに入れた修正を、ブランチ側の新しいデザインでもやり直すことになり、163 の CSS module で衝突する」ことを理由に退けられた。採った A の代償には、作業の量（土台5・部品12前後・面70前後・外に出る画像4・テストと検査、それぞれにレビュー）と、そのあいだ他の修正を出荷できないことを数えた。

取り違えたのは次の2つである。

- **「何サイクルに分けるか」と「いつ出荷し、そのあいだ main をどう扱うか」を、1つの案の軸に束ねて比べた。** D は「main に並行して修正を出す」ことと抱き合わせで評価され、その害（衝突）でサイクルを分けることまで退けられた。main に別の修正を並行して出さずに D を取れば、出荷は A と同じ1回のまま、サイクルを小さくできた。
- **A の代償に、長い1サイクルそのものの費用を数えなかった。** 作業の量は見積もったが、それを1サイクルに抱えると、中断（週の利用上限への到達など）がサイクルの途中に来て、レビューを通っていない途中の作業を抱えたまま止まり、文脈を取り直すことと、積み上がった文書を読み直す量が増えることを、比べる材料にしなかった。週の利用上限は使った量で決まり、分けても使う量は減らないので、上限に当たること自体を分けて避けられるのではない。分けて避けられるのは、上限がサイクルの途中に来ることと、文書の肥大である。使う量を押し上げたものには、サイクルの長さのほかに、1つの成果物のレビューの往復の長さ（計画17巡・T5a の設計16巡・T5-5b 13巡）もある。

なお、`docs/rebuild-plan.md` の R-2 には「「1サイクルで完了できるか」を見積もる（部分出荷禁止のためブランチの長期保持は腐敗リスク——収まらない見積りなら分割方針をオーナーに相談してから着手する）」とある。これはフェーズ R の節の規定で、同書の冒頭が「§2（フェーズ R）の規律はすべて効力を使い切っており、以後のサイクルの判断の根拠に引いてはならない」と定めているので、このサイクルを縛る規定ではない。同じ懸念（長く抱えたブランチが腐る）がフェーズ R の時点で認識されていたことを示すだけである。

PM はオーナーの言葉を受けて分割できるかを検討し、分割すると決めた。上の2つの取り違えを正せば、出荷を1回に保ったままサイクルを小さくできるからである。分割するときの進め方（main と別のブランチで複数のサイクルを続け、完成してから main にマージする）は、オーナーの言葉が検討のきっかけで、根拠は下の 3 にある（B-754 が統合のブランチで進むあいだ main に別の修正を並行して出さないので、options.md が D を退けた衝突は起きない）。

## 決めたこと

### 1. 統合のブランチ `design-rollout`

- **起点**: cycle-316 の完了のコミット（作業ブランチ `claude/cycle-kickoff-rv3l21` の上に積む）から `design-rollout` を作る。
- **cycle-316 の完了の push 先**: main ではなく `design-rollout`。cycle-316 は T1〜T5 の実装を含むので、main に入れると新旧の混ざった面が本番に出る。
- **B-754 の残りのサイクル**: すべて `design-rollout` の上で進める。各サイクルは、キックオフで B-754 を Queued から Active に移して始め、完了のコミットで Queued の同じ行に戻して、このブランチに push する（main の行と `design-rollout` の行が同じに保たれ、次のキックオフも Queued から選べる）。本番のデプロイは `vercel.json` が main だけに限っているので、このブランチへの push は出荷されない。
- **CI**: `.github/workflows/deploy.yml` の `on.push.branches` に `design-rollout` を足し、このブランチへの push でも CI（Lint, Typecheck, Test, Build）が走るようにする。`scripts/wait-for-ci.sh` はコミットの SHA で run を探すので、そのまま使える。`deploy.yml` の書き換えは、下の 2 の手順のコミットにだけ入れる。そのため、cycle-316 の完了のコミットだけを push した時点では CI は走らない。`design-rollout` で CI が初めて走るのは、main をマージしたコミットを push したときである（6 の手順5）。
- **出荷**: B-754 の最後のサイクルが T9〜T12 を終えたときに、`design-rollout` を main にマージして1回だけ出荷する。来訪者に新旧の混ざった状態を見せないという A の目的は、これで保たれる。出荷の CI を確かめたあとで、`git push origin --delete design-rollout` で統合のブランチを消す（残すと、後のセッションがブランチの一覧から、使い終えたものか進行中のものかを見分けられない）。

### 2. main からの案内（手順のコミット）

次のサイクルのセッションは main から始まる。main には cycle-316 のディレクトリが無く、B-754 は cycle-316 の前の文言のままなので、そのままでは統合のブランチを見つけられない。そこで main に「手順のコミット」を1つだけ入れる。中身は、main から始まる次のセッションに要るものだけで、来訪者に見える変更を含まない。1つは、次のセッションが main から `design-rollout` へたどり着き、そこで CI が走るのに要るものである。もう1つは、このサイクルが足した `paths` の無い規則 `.claude/rules/file-editing.md` である。`paths` の無い規則は、CLAUDE.md と同じくセッションを起動したときにその木から読み込まれ、`design-rollout` に移るのは起動したあと（`cycle-kickoff` の手順1の途中）なので、main に無いと B-754 の残りのサイクルのセッションにも、そのサブエージェントにも読み込まれない。

このサイクルが直したほかの手順と道具（take-screenshot のスキル・アンチパターン集・知見）は main に入れない。一部だけを入れると、候補から消した項目が本体にも無い、知見が main のコードと違う事実を書く、スキルの案内が main に無い節を指す、といった食い違いが出るからである。main は古い道具・アンチパターン・知見の一貫した形のまま保たれ、新しいものは B-754 の最後のマージでまとめて入る。そのあいだ main の上で動く本番の急ぎの不具合を直すサイクル（3）は、main の古い道具の上で、このサイクルで見つけた環境の落とし穴に当たる（main の `take.ts` はこのコンテナに無い版の Chromium で起動しようとして撮影できず、起動の失敗の文は `playwright install` を勧め、main の知見はプロセスを自分のグループだけ止める形を書いておらず、main の lock は npm 10 の `npm ci` で止まる）。main のアンチパターン集も古いままで、このサイクルで本体に昇格した AP-WF29・30・38・39・41（main では候補）・AP-WF50（main には候補も無い）と、AP-P01 の本文の広げ（incident-2 の再発防止）と AP-WF24 の本文の権限の判定の文が無いので、main の木のままでは、急ぎのサイクルのレビューと完了の処理の手順5のチェックがそれを当てはめない。回避は `design-rollout` の `.claude/` と `docs/knowledge/`（`take.ts`・`playwright-mcp.md`・`dependency-security.md`・`ai-agent-communication.md` など）に、新しいアンチパターンは `design-rollout` の `docs/anti-patterns/` にあるので、手順のコミットに入れる `cycle-kickoff` の手順1が、急ぎのサイクルにそれを作業の前に `git show origin/design-rollout:<パス>` で読ませ、レビューと手順5のチェックでも reviewer に `git show origin/design-rollout:docs/anti-patterns/<ファイル>` の版を読ませる（[decisions.md](./decisions.md) の AP の点検の6巡目・7巡目の行）。

- **完了のコミットと同じ中身にするパス**（どれも、`design-rollout` にしか無い hook・ファイル・文書の節を前提にしないことを、origin/main の木と突き合わせて確かめた）:
  - `.claude/skills/cycle-kickoff/SKILL.md`: 手順1で、統合のブランチで進行中の項目があればその項目を続け、要るブランチだけを fetch し、そのブランチに移って `git merge --ff-only` で `origin/<統合のブランチ>` まで進め（同じコンテナに古いローカルのブランチが残っていても、その上で始めない）、`origin/main` をマージし、`.next` を消して `npm ci` で依存を入れ直してから、移った木の `docs/cycles/` で最新のサイクルを確かめる（SessionStart の hook の報告はセッションを始めた main の木の値なので使わない）。本番の急ぎの不具合だけは main で直し、そのサイクルは作業の前に統合のブランチの `.claude/`・`docs/anti-patterns/`・`docs/knowledge/` の新しい道具とアンチパターンと知見を読み、レビューと完了の処理の手順5のチェックでは reviewer に統合のブランチの版のアンチパターン集を読ませ、見つけたアンチパターンの発生は main の `docs/anti-patterns/` に書かずにそのサイクルの文書に記録し、統合のブランチの次のサイクルが、キックオフのマージでその記録が入ったら、新しいサイクルの index.md の「実施する作業」に反映の行を置き、完了の処理の手順5で統合のブランチのアンチパターン集に反映する（3）。手順5で、サイクルの番号を main と統合のブランチの両方の `docs/cycles/` の最新に1を足して決める。
  - `.claude/skills/cycle-completion/SKILL.md`: 手順7を、main で進むサイクルと統合のブランチで進むサイクルの両方を1つの流れで扱う形にし、統合のブランチの最初・そのあいだ・最後のサイクルが backlog の項目と統合のブランチをどう扱うかを書き、ブランチを移ってプッシュするときに `.next` を消し、その木の `package-lock.json` を書き換えずに `npm ci` で依存を合わせ、lock の欠けで止まったら `npm install` を打たずに `npx -y npm@11 ci` で入れることを書く。手順のコミットには、統合のブランチへたどり着いて CI が走るのに要るものと、セッションの初めに読み込まれるもののうちそのサイクルが変えたものを入れ、入れると決めたパスだけを名指して載せ、push の前に `git status --short` と `git diff --name-only origin/main` に出るパスがそれだけであることを確かめる、と書く。
  - `.claude/rules/file-editing.md`: コミットに入るファイルの中身は Edit・Write で書き、シェルで書かない規則。指す先（`.claude/settings.json` の PostToolUse の hook、`pre-commit-check.sh`・`pre-push-check.sh`、`package.json` の `lint:fix`・`format`・`generate:*`、`docs/anti-patterns/workflow.md` の AP-WF08）は、どれも main の木にある。
- **一部だけを変えるパス**:
  - `.github/workflows/deploy.yml`: `on.push.branches` に `design-rollout` を足す。完了のコミットには入れない（1 の CI）。
  - `docs/backlog.md` の B-754 の行: `design-rollout` で続けていること、そのブランチに移って続けること、完成までほかの項目のサイクルを立てないこと。main の backlog は、この行のほかは変えない（cycle-316 の Done・Deferred への移しは出荷していない項目を含むので、main に持ち込まない）。
- **入れないもの**: 上のほかのパス。

このコミットを main に入れたあと、main を `design-rollout` にマージし、`design-rollout` が main の `deploy.yml` と backlog の行を持つようにする。作り方と、マージで出る衝突の解き方は 6 の手順に書く。

### 3. 統合のブランチのあいだの main の扱い

options.md が D を退けた理由（main に入れた修正をブランチ側でやり直すことになり、衝突する）には、次のように答える。

- B-754 が `design-rollout` で進むあいだ、ほかの項目のサイクルは立てない。サイクルは `design-rollout` の上で B-754 を順に進めるので、main に別の修正を並行して出すことはない。
- 本番で急ぎの不具合が出たときは、main の上でそれを直すサイクルを立てる。その番号は、`design-rollout` の `docs/cycles/` も見て、両方の最新に1を足したものにする（main の最新だけに1を足すと、`design-rollout` のサイクルと同じ番号になり、マージで1つのディレクトリに混ざる）。そのサイクルは、作業の前に `design-rollout` の `.claude/`・`docs/anti-patterns/`・`docs/knowledge/` の新しい道具とアンチパターンと知見を `git show` で読み、main の古い道具で当たる環境の落とし穴を避ける。そのサイクルのレビューと完了の処理の手順5のチェックでは、reviewer に `git show origin/design-rollout:docs/anti-patterns/<ファイル>` で `design-rollout` の版のアンチパターン集を読ませ、main の古い一覧に無い項目も当てはめる（2）。見つけたアンチパターンの発生（新しい候補を含む）は、main の `docs/anti-patterns/` に書かず、当たる `design-rollout` の項目とともにそのサイクルの文書に記録する。main の `candidates.md` には、`design-rollout` が本体へ昇格させて消した候補の節が残っているので、そこに発生を足すと、次のキックオフの `git merge origin/main` で `design-rollout` の変更と衝突する。`design-rollout` は、次のキックオフで main をマージしてその修正とサイクルの文書を取り込む。そのサイクルは、キックオフで作る index.md の「実施する作業」に、記録された発生を `design-rollout` のアンチパターン集に反映する行を置き、完了の処理の手順5で反映する。反映の役目を作業の行に置くので、キックオフから完了の処理までのあいだに中断や文脈の取り直しが挟まっても抜けない。
- main に入ったもの（上の手順のコミット・急ぎの修正）は、`design-rollout` で進む各サイクルのキックオフで、`origin/main` を `design-rollout` にマージして取り込む。キックオフのたびに取り込むので、最後のサイクルが main へマージするときの衝突は小さく保たれる。
- 取り込みは rebase でなくマージのコミットにする。`design-rollout` は push 済みで、続くサイクルの複数のセッションが共有するブランチである。rebase すると force push が要り、`.claude/hooks/block-destructive-git.sh` がそれを止める。

### 4. 作業ツリーに途中まである作業と、`tmp/` に置いた記録

作業ツリーには、レビューを通っていない途中の作業がある（T5-33・T5-8b と T5-20d・T5-6・T5-13 の途中と、T5a-2b の `src/play/quiz/data/character-personality.ts`）。`src/` の変更のほか、`.claude/skills/frontend-design/SKILL.md` の `DataTable` の文もこれに含まれる。

- これらは cycle-316 の完了のコミットに入れない。タスクごとのコミットを並べたブランチ `design-rollout-wip` に残し、origin に push した（題にタスクの ID を書いた下の表の5つのコミット。起点は da54202e）。作業ツリーにはまだ同じ中身が残っているので、完了の処理の初め（6 の手順1）に作業ツリーから外す。
- コミットは次の順に積んだ。後ろのコミットは前のコミットの上で作ったので、前のコミットに依ることがある。そこで、どのコミットも、それより前のコミットを戻すサイクルのあと（7 の表の順）で戻す。5 の T5a-2b は `character-personality.ts` の Q1 の3行だけを変え、前のコミットに依らないので、2つ目のサイクルで 3・4 より先に戻せる。

| 順  | タスク          | 中身                                                                                                                            | 戻すサイクル（7 の表の順） | コミット   |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------- |
| 1   | T5-33           | irodori の読み込みのずれ                                                                                                        | 1                          | `3001f167` |
| 2   | T5-8b と T5-20d | `DataTable` の列の幅とゲームの結果の表。`src/components/DataTable` と frontend-design スキルの `DataTable` の文（下の注）を含む | 1                          | `83a8cbd9` |
| 3   | T5-6            | 診断の結果のページ                                                                                                              | 3                          | `d124e336` |
| 4   | T5-13           | ユーモア辞典の詳細                                                                                                              | 5                          | `364a88b0` |
| 5   | T5a-2b          | character-personality の Q1 の文言                                                                                              | 2                          | `20a29292` |

- 注: 2 の frontend-design スキルの `DataTable` の文は、完了の処理の手順0（6）で作業ツリーから da54202e の文に戻し、完了の処理の直しだけを先にコミットする。そのため `design-rollout` のこのファイルは「da54202e＋完了の直し」になる。完了の直しが変えるのは「見出しとコントロールの名前の折り方を測る」の前書き（da54202e の41行目）と4（61行目と、そのあとに足す3行）と、「値を変えるときの手順」の終わりに足す1行（共有の部品を変えたら使うすべてのページで撮り比べる）で、83a8cbd9 が変えるのは `DataTable` の項（142行目。da54202e の 138 行目から4行ずれる）の1行だけである。hunk の前後3行の文脈も完了の直しに触れないので、1つ目のサイクルが 83a8cbd9 を cherry-pick すると、このファイルは衝突せずに当たる（作業ツリーの写しで1文を戻したうえで `git apply --check` を掛け、「Hunk #1 succeeded at 142 (offset 4 lines)」を確かめた）。
- 各サイクルは、受け持つコミットを `git fetch origin design-rollout-wip` のあと `git cherry-pick --no-commit <コミット>` で作業ツリーに戻して続ける。戻した差分はインデックスに載るので、`git restore --staged -- .` で下ろしてから作業する（ほかの差分が自分のコミットに紛れ込まないように。AP-WF50）。そのあいだのサイクルが同じファイルを変えていて衝突したときは、Edit で解き、`git add <パス>` で解けた印を付ける。すべてのコミットを戻したら、`git push origin --delete design-rollout-wip` で消す。
- 文書の [t5a-measure.md](./t5a-measure.md)（T5a-2 の測り。レビュー第10回 [review-t5a-2-10.md](./review-t5a-2-10.md) で要修正のまま）と [review-t5-13.md](./review-t5-13.md)（T5-13 のレビュー）は、サイクルの記録なので cycle-316 の完了のコミットに入れる。[decisions.md](./decisions.md) と [carryover.md](./carryover.md) がこれらを指しており、`design-rollout` の上でリンクが切れないようにするためである。t5a-measure.md は T5a のサイクルが直してレビューを続ける。
- cycle-316 の文書が参照する `tmp/` とスクラッチパッドのファイルと、測りの道具は、次のサイクルのセッションには無い（どちらも git が追わない）。そこで、どの履歴にもつながらない孤立したブランチ `cycle-316-records` に残し、origin に push した（b42b12cf）。
  - **置き方**: リポジトリの `tmp/<パス>` は `tmp-records/<パス>` に、スクラッチパッド（文書の参照では `/tmp/claude-0/.../scratchpad/<パス>`）の `<パス>` は `tmp-records/scratchpad/<パス>` にある。測りの道具は、T5-6 の `tmp-records/scratchpad/t5-6/m/`、T5-33 の `tmp-records/scratchpad/t5-33/m/`、T5a-2 のレビュアーの再測りの `tmp-records/scratchpad/rev-t5a2/` の3つである（T5a-2 の builder の道具は、測りのあとで消されていて無い）。画像を除いたディレクトリと、写す時点で無かったファイルがある。ファイルごとの対応、除いたもの、無かったもの、道具の使い方は、ブランチの `tmp-records/README.md` と `MANIFEST.tsv` にある。
  - **取り方**: 木は約 494MB あるので、このブランチは、それを使うサイクルだけが `git fetch origin cycle-316-records` で取る。ほかの fetch は、要るブランチを名指して取る（`git fetch origin main design-rollout` など）。
  - **読み方**: 1つのファイルは `git show origin/cycle-316-records:tmp-records/<パス>` で読む。
  - **道具の使い方**: ディレクトリごと `git archive origin/cycle-316-records tmp-records/<ディレクトリ> | tar -x -C <書き出し先>` で書き出す（`<書き出し先>/tmp-records/<ディレクトリ>` に出る）。T5-6 の `lib.cjs` は `../node_modules/playwright` を読み、T5-33 の道具は `playwright`・`sharp` を上のディレクトリの `node_modules` にたどって読むので、この2つは、リポジトリを写した作業場（`npm ci` 済み）の直下に `m/` として移して動かす。T5a-2 のレビュアーの道具は `/home/user/yolo-web/node_modules/playwright` を絶対パスで読む。
  - `cycle-316-records` は main にも `design-rollout` にもマージせず、消さずに残す。T11 は、cycle-316 の文書の `tmp/` とスクラッチパッドへの参照を、このブランチの対応するパス（`origin/cycle-316-records:tmp-records/<パス>`）への参照に置き換え、来訪者に届くものの判断に要る事実だけを本文に書く。records の README の「写す時点で無かったもの」と、画像を除いたディレクトリの画像を参照している文は、参照先が残っていないという事実に合わせて書き直す。

### 5. cycle-316 を閉じる

このサイクルで終えたもの（T0〜T4、T5 と T6 のうちコミットした小タスク、承認した設計）をこのサイクルの成果とし、残りは下のサイクルに分けて送る。index.md の「実施する作業」は終えたものに、キャリーオーバー（[carryover.md](./carryover.md)）は送るものに書き分ける。index.md の「完了の条件」は B-754 全体の条件で、B-754 の最後のサイクルが引き継ぐ。

### 6. cycle-316 の完了の処理

`cycle-completion` の手順1〜6を終え、index.md の「実施する作業」の完了の処理のレビュー（アンチパターンの点検）が承認になったあと、手順7・8をこのサイクルでは次の順で行う。始める時点で、ブランチは `claude/cycle-kickoff-rv3l21`（HEAD は da54202e）で、作業ツリーには完了のもの（`docs/` の文書、`.claude/skills/` のスキル、`.claude/rules/file-editing.md` の規則）と、4 の途中の作業がある。途中の作業は `design-rollout-wip` に残して push 済みで（4 の表）、作業ツリーにある中身はそのコミットと同じである。ただし `.claude/skills/frontend-design/SKILL.md` だけは、途中の作業の1文（83a8cbd9 の `DataTable` の文）と、完了の処理の直し（「見出しとコントロールの名前の折り方を測る」の前書きと4、「値を変えるときの手順」の共有の部品の撮り比べ）が同じファイルに混ざっているので、手順0で分ける。

コマンドは `.claude/hooks/` の hook に止められないものを使う。`block-destructive-git.sh` は、`git checkout` の引数に `/` を含むもの（`claude/cycle-kickoff-rv3l21`・`origin/main` もこれに当たる）、`git checkout --ours`・`--theirs`、作業ツリーを戻す `git restore`、`git stash drop`・`clear` を止めるので、ブランチは `git switch` で移り、ファイルの変更と衝突の解決は Edit で行う。完了のコミットの2つのスキルと規則を main の木へそろえる（手順3）ときも同じで、`git restore --source=<コミット> -- <パス>` は作業ツリーを戻す `git restore` として hook が止める。`git show … > <パス>` や `git diff … | git apply` での書き写しは hook に止められないが、Edit・Write を通らずにファイルを書くので、`.claude/rules/file-editing.md` の規則と `docs/anti-patterns/candidates.md` の AP-WF21 の記録が禁じた形（整形と残骸の検査の hook を素通しする）に当たり、`.claude/skills` では `trust-guard.sh` の警告も鳴る。そこで、変わった所を Edit で当て、main に無い規則は Write で作る。`git stash` は、退けた分を捨てる `git stash drop` を hook が止めるので使わない。`pre-push-check.sh` は、push を打つ作業ツリーで、いまの `node_modules` と `.next` を使ってフルスイート（format:check・lint・typecheck・test・build）を走らせる。別の worktree で作ったコミットをいまの作業ツリーから push すると、検査が push するものと違う木に掛かるので、worktree は使わず、1つの作業ツリーでブランチを移る。`package.json` は main と cycle-316 で違う（cycle-316 が `next-themes` を外し、`budoux` を足した）ので、ブランチを移った直後に、前のブランチの build が残した `.next` を `rm -rf .next` で消し、`npm ci` で依存をその木に合わせる。tsconfig は `.next/types` を型の検査に含め、`src/__tests__/bundle-budget.test.ts` は `.next` の build の結果を読むので、残すと、型の検査と試験が別の木の中身で落ちる（main の木を cycle-316 の build の残した `.next` のまま検査すると、型の検査は `.next/types` が main に無いページを指して、試験は bundle-budget で落ちた）。途中の作業を手順1で作業ツリーから外し、移るたびに `.next` と依存を合わせるので、手順2・3・5の push は、push するコミットと同じ中身の木と、それに合った `node_modules` で検査される。fetch は、要るブランチを名指して取る（`cycle-316-records` は約 494MB あり、この処理には要らない。4）。

始める前に `df -h /` で `/` の空きを確かめる。手順2の push の hook は build を走らせ（`.next` の build の結果は、`next dev` の残した `.next/dev` を除いて約 1.7GB）、手順3・5は `node_modules`（約 954MB）を入れ直してから同じく build する。空きが 3GB を下回るときは、始める前に要らないものを消して空きを作る。消してよいのは、scratchpad に残した検証用の clone（`split-verify-*` など、レビューと計画の確かめに使ったもの）と、`.next/dev`（手順の検査には要らない）である。手順3・5で `.next` を `npm ci` より先に消すのも、入れ直すあいだの空きを保つためである。

0. **`frontend-design` スキルの途中の作業の1文を外し、完了の直しだけを先にコミットする。** `git diff da54202e 83a8cbd9 -- .claude/skills/frontend-design/SKILL.md` が示す1つの hunk（`DataTable` の項の「セルに置くコントロール（行の頭の開閉のボタン）と中身を見せる見本（色見本）は要素で渡し、要素が持つ字（ボタンの面など）は…」）を、Edit で da54202e の文（「セルに置くコントロール（行の頭の開閉のボタン）は要素で渡し、面の字はその要素が区切りの並びで組む。」）に戻す。Edit の置き換える前の文がそのまま一致することが、作業ツリーにその1文が 83a8cbd9 と同じ形で入っていたことの確かめになる。中身は 83a8cbd9 に残っているので失われない。戻したら `git diff da54202e -- .claude/skills/frontend-design/SKILL.md` に完了の直しの3つの hunk（前書き・4・「値を変えるときの手順」の共有の部品の撮り比べ）だけが出ることを確かめ、このファイルだけをコミットする。
   ```bash
   git diff da54202e -- .claude/skills/frontend-design/SKILL.md
   git commit -m "docs(skill): 折り方の測りで近似に拾えない差を (i)〜(iii) に振り分け、共有の部品を変えたら使うすべてのページで撮り比べる" -- .claude/skills/frontend-design/SKILL.md
   git status --short -- .claude/skills/frontend-design/SKILL.md
   ```
   先にコミットするのは、手順1の `git switch` が、作業ツリーで変わっていて、しかも今のブランチと移り先で中身の違うパスを持ち越せず止まるからである（このファイルは da54202e と `design-rollout-wip` で違う）。コミットすればこのファイルは作業ツリーで変わっていない状態になり、移るときは移り先の中身に、戻るときはこのコミットの中身に入れ替わる。最後の `git status --short` に何も出ないことを確かめる。
1. **途中の作業を作業ツリーから外す。** 途中の作業のパスをインデックスに載せ、それが同じ中身で入っている `design-rollout-wip` に移ってから戻る。`git switch` は、インデックスの中身が移り先の木と同じパスだけを持ち越せるので、移れたことが、作業ツリーの途中の作業と `design-rollout-wip` が同じであることの確かめにもなる。戻るときは、`claude/cycle-kickoff-rv3l21` の木の中身に戻るので、途中の作業が作業ツリーから外れ、コミットしていない完了のものはそのまま残る（`[slug]` を含むパスも、git は文字どおりにも照らすので載る）。
   ```bash
   git add -A -- $(git diff --name-only da54202e design-rollout-wip | grep -vxF .claude/skills/frontend-design/SKILL.md)
   git switch design-rollout-wip
   git switch claude/cycle-kickoff-rv3l21
   git status --short -- src .claude/skills/frontend-design
   ```
   `git status --short` に何も出ないこと（`src/` と `.claude/skills/frontend-design/SKILL.md` に、変更も未追跡のファイルも残っていないこと）を確かめる。`git switch design-rollout-wip` が止まったときは、作業ツリーの途中の作業が `design-rollout-wip` と違うので、先へ進まずに違いを調べる。
2. **cycle-316 の完了を確かめ直し、完了のコミットを作り、`design-rollout` に push する。** 頭に手順1の `git status --short -- src .claude/skills/frontend-design` をもう一度打ち、何も出ないことを確かめる。次に、コミットの前に、index.md の「実施する作業」の完了の処理のレビューの行にチェックを入れ、`cycle-completion` の手順1をやり直す。「実施する作業」のすべての行にチェックが入っていることを確かめてから、`completed_at` をその時の日時で付け直し、終了時のチェックリストの各項目を、文字どおり真であることを確かめてからチェックする（AP-WF23）。検査のコマンド（`npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build`）は、途中の作業を外したこの木で走らせるので、コミットするものと同じ中身を確かめる。作業ツリーには完了のものしか無いので、`cycle-completion` の手順7のとおり `git add .` でよい。
   ```bash
   git status --short -- src .claude/skills/frontend-design
   git add .
   git commit -m "<cycle-316 の成果>"
   git push origin HEAD:design-rollout
   ```
   このコミットの `deploy.yml` にはまだ `design-rollout` が無いので、この push では CI は走らない。
3. **手順のコミットを origin/main の上に作り、main に push する。** 中身は 2 のとおり、2つのスキル（`.claude/skills/cycle-kickoff/SKILL.md`・`.claude/skills/cycle-completion/SKILL.md`）と規則（`.claude/rules/file-editing.md`）を完了のコミットと同じ中身にし、`deploy.yml` と `docs/backlog.md` を一部だけ変えたものである。

   ```bash
   git fetch origin main
   git switch -c cycle-316-steps origin/main
   rm -rf .next
   npx -y npm@11 ci
   ```

   移った木では、コミットの前の検査も push の前の検査も main の `node_modules` で走るので、先に依存を入れる。main の `package-lock.json` は、セッションのコンテナの npm 10（Node 22）の `npm ci` では「`package.json` と合わない」（`Missing: typescript@5.9.3 from lock file`）として止まり、CI と同じ npm 11（CI は Node 24）では通るので、ここでは `npx -y npm@11 ci` で入れる（cycle-316 の側の `package-lock.json` は npm 10 の `npm ci` で通る）。

   2つのスキルは、`git diff HEAD claude/cycle-kickoff-rv3l21 -- <パス>` を見て Edit で同じ変更を当てる。規則は main に無いファイルなので、`git show claude/cycle-kickoff-rv3l21:.claude/rules/file-editing.md` を読み、Write で同じ中身に作る。`.github/workflows/deploy.yml` は、Edit で `on.push.branches` に `design-rollout` を足す。`docs/backlog.md` は、Edit で B-754 の行だけを `design-rollout` の側の行と同じ文に直す（ほかの行は main のまま）。当て終えたら載せて、完了のコミットと比べる。

   ```bash
   git add -- .claude/skills/cycle-kickoff/SKILL.md .claude/skills/cycle-completion/SKILL.md .claude/rules/file-editing.md .github/workflows/deploy.yml docs/backlog.md
   git diff claude/cycle-kickoff-rv3l21 -- .claude/skills/cycle-kickoff/SKILL.md .claude/skills/cycle-completion/SKILL.md .claude/rules/file-editing.md
   git diff HEAD -- .github/workflows/deploy.yml docs/backlog.md
   ```

   1つ目の差分が何も出さないこと（2つのスキルと規則が完了のコミットと同じであること）と、2つ目の差分が `on.push.branches` の `design-rollout` と B-754 の行だけであることを確かめる。

   ```bash
   git commit -m "<手順のコミット>"
   git status --short
   git diff --name-only origin/main
   ```

   `git status --short` が何も出さないことと、`git diff --name-only origin/main` に出るのが2つのスキルと規則と `deploy.yml`・`backlog.md` の5つだけであることを確かめてから push する。完了のコミット（T1〜T5 の実装を含む）が main に入ると、新旧の混ざった面が本番に出るからである。main への push で本番のデプロイも走るが、このコミットは来訪者に見える変更を含まない。

   ```bash
   git push origin HEAD:main
   ```

4. **main の CI を確かめる。** `bash scripts/wait-for-ci.sh`（HEAD は手順のコミット）。`wait-for-ci.sh` は `gh` を使い、`gh` の無いコンテナでは exit 3 で「Actions で確かめよ」と返して終わる。そのときは GitHub の MCP の actions の道具で、`macrat/yolo-web` の run を手順のコミットの SHA で引き、すべての run が完了して `conclusion` が success であること（`wait-for-ci.sh` と同じく、skipped の run は失敗としない）を確かめる。確かめるまで手順5へ進まない。
5. **origin/main を `design-rollout` にマージして push し、CI を確かめる。**
   ```bash
   git switch claude/cycle-kickoff-rv3l21
   rm -rf .next
   npm ci
   git merge origin/main
   ```
   `git log --oneline 9c848bd0..origin/main` が手順のコミットの1行だけなら（main が `design-rollout` との分かれ目から手順のコミットだけを足しているなら）、マージで main の側から入る変更はその5つのファイルだけである。ほかのコミットが出たら、main に別の修正が入っているので、その差分を見て衝突の見込みを立て直す。2つのスキルは両方の側で同じ中身なので衝突しない。規則は両方の側が同じ中身で足しているので、これも衝突しない。ほかのスキル・アンチパターン集・知見などは main の側が変えていないので、`design-rollout` の側の中身のまま残る。`deploy.yml` は main の側だけが変えているので、そのまま入る。`backlog.md` は、両方の側が B-754 の行を変え、`design-rollout` の側がまわりの行を移しているので衝突しうる。衝突したら Edit で `design-rollout` の側の形（B-754 は Queued の行、移した行は Done・Deferred）に解き、`git add docs/backlog.md` と `git commit --no-edit` でマージを終える。
   ```bash
   git push origin HEAD:design-rollout
   bash scripts/wait-for-ci.sh
   ```
   `design-rollout` で CI が走るのは、このマージのコミットが初めてである。`wait-for-ci.sh` が exit 3 で終わったときは、手順4と同じく GitHub の MCP で、run をマージのコミットの SHA で引いて確かめる。CI の成功を確かめてから、手順のブランチを消す。上のブロックと続けて流すと、`wait-for-ci.sh` が 0 以外で終わっても `git branch -d` が走るので、ここで区切って打つ。
   ```bash
   git branch -d cycle-316-steps
   ```

### 7. 残りのサイクルの分け方

1サイクルは、1つの面か、密に関係する少数の小タスクに限る。各サイクルのキックオフで、その回に収まるかを改めて見積もり、収まらなければさらに分ける。

| 順   | 中身                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 見込み |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 1    | 表とゲームの結果: T5-8b（`DataTable` の列の幅）・T5-20d（ゲームの結果の表）・T5-33（irodori の読み込みのずれ）。どれも T5-20f の前に要る。あわせて B-784（サイクルの文書の大きさをコミットの前に検査する。後のサイクルの文書の肥大を止めるので最初に置く。検査の対象と線はこのサイクルの設計で決める）と B-786（並行する担当が1つの作業ツリーとコンテナを共有して起きる衝突を、hook でなく担当ごとの木とコミットする者の決め方で無くす。残りのサイクルはどれも担当を並行して動かすので最初に置く）                                                                                                                       | 1      |
| 2    | 診断の回答 T5a（t5a-design.md 7章）: T5a-2 → T5a-2b → T5a-1 → T5a-3 → T5a-5 → T5a-6 → T5a-4 → T5a-7。T5a-2 は t5a-measure.md をレビュー第10回の指摘から直して続ける。T5a-2 の builder の測りの道具は消えていて、残っているのはレビュアーの再測りの道具（`cycle-316-records` の `tmp-records/scratchpad/rev-t5a2/`）だけなので、T5a-2 の測りはそれを元に組み直す（4）                                                                                                                                                                                                                                                     | 1〜2   |
| 3    | 診断の結果のページ: T5-6。320×667 で誘いのボタンが 667 に届かない3本の原因を測り、結果のページの中の組みで条件を満たすか、満たせないなら何を受け入れるかを決める（上端のナビは T1 の決定と `DESIGN.md` §5 のまま変えない）。測りの道具は `cycle-316-records` から使う（4）                                                                                                                                                                                                                                                                                                                                               | 1      |
| 4    | 次に遊ぶものの一覧: T5-20f・T5-30（t5-20f-design.md）と T5-20b の残り                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 1      |
| 5    | 辞典の詳細: T5-10（漢字）・T5-11（四字熟語）・T5-13（ユーモア辞典）。T5-13 のコミットで `design-rollout-wip` のコミットをすべて戻し終えるので、このサイクルが `design-rollout-wip` を消す（4）                                                                                                                                                                                                                                                                                                                                                                                                                           | 1      |
| 6    | ブログ: T5-16（本文の見出し）・T5-31（関連記事）。`DESIGN.md` §5・§7 の文は、T5-10・T5-11・T5-20f・T5-30・T5-31 の組の最後に入れる                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 1      |
| 7〜  | 道具: T5-18（36本。t5-design.md 10-3 の表の1行が1タスク。1サイクルに9本ほど）。markdown-preview は T5-16 のあと                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 4      |
| 続き | ゲームの無効の理由と注記・storybook・道具の計測: T5-20e・T5-24・T5-25b                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 1      |
| 続き | T5 の締め: T5-27（約物）→ T5-25c（古いトークンの定義を消す片付け）→ T5-26（T5 の完了の判定）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 1      |
| 続き | サイトの外に出る画像（t6-design.md 4章）: T6-4（診断の結果）・T6-5（伝統色）・T6-8（漢字と四字熟語の詳細）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 1      |
| 続き | 同: T6-6（結果の画像の保存）・T6-7（一覧とルートの画像）・T6-10（favicon）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 1      |
| 続き | 同: T6-11（古い描き方を消す）・T6-12（T6 の完了の判定）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 1      |
| 続き | 文章: T7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1〜2   |
| 続き | テスト: T8 のうち、デザイン値を固定している57ファイルのテストの作り直しと、`src/play/quiz/data/__tests__` のまとめ直し                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 1      |
| 続き | 機械の検査: T8 のうち、完了の条件の機械の検査を sitemap の全 URL・sitemap に載らないページ・操作で現れる状態に掛けること                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1      |
| 続き | 来訪者の目で確かめる: T9。実機を使える作業者はいないので、最初のタスクで、実機に頼る項目（`grep -rn "実機" docs/cycles/cycle-316/carryover.md docs/cycles/cycle-316/decisions.md docs/cycles/cycle-316/t4-design.md docs/cycles/cycle-316/t5a-design.md docs/backlog.md .claude/skills` で拾う。T5a のサイクルが設計の段で振り分けた項目（t5a-design.md 8章）は、その振り分けに従う）を1つずつ、(i) 端末に頼らない作りにする、(ii) 環境の決まりに反しない近似に置き換える、(iii) 受け入れて出荷のあとブラウザ別の GA の数で見張り、撤退の線を T10 で ADR009 に書く、のどれかに振り分ける。実機で確かめたと書いて進まない | 1〜2   |
| 続き | 全体のレビュー: T11。cycle-316 の文書の `tmp/` とスクラッチパッドへの参照は、`cycle-316-records` の対応するパスへの参照に置き換え、来訪者に届くものの判断に要る事実だけを本文に書く（4）                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1      |
| 最後 | 出荷の直前の基線 T10、出荷と本番での確かめ T12、`design-rollout` の main へのマージ。出荷の CI を確かめたあとで、`design-rollout` を origin から消す（1。`cycle-316-records` は文書の参照先なので残す。4）                                                                                                                                                                                                                                                                                                                                                                                                               | 1      |

T10 は「出荷の直前」に取る基線なので、T11 のあと、出荷と同じサイクルに置く。

各サイクルの順と依存は、[decisions.md](./decisions.md) の決定と申し送りと、t5-design.md 10-1・t5a-design.md・t5-20f-design.md・t5-8b-design.md・t6-design.md 4章が決めたものに従う。上の表はそれに合わせてある: T5-16 → markdown-preview（T5-18 の中）、T5-4・T5-5b・T5-6・T5a → T5-30、T5-30 → T5-10・T5-11、T5a → T5-25c、T5-18 → T5-27 → T5-26、T5-6 → T6-4、T6-4 と T5a → T6-6、T6-3〜T6-7 → T6-11。

### 8. 手順の直し

- `cycle-kickoff` の手順1・手順5と `cycle-completion` の手順7を、上の 2 のとおりに直す。
- 3 の main の扱い（統合のブランチで進む項目があるあいだはその項目を続け、本番で急ぎの不具合だけを main で直し、そのサイクルは統合のブランチの新しい道具とアンチパターンと知見を読んでから進み、レビューと完了の処理の手順5のチェックも統合のブランチのアンチパターン集で行い、見つけた発生はそのサイクルの文書に記録し、キックオフでマージして取り込み、次のサイクルが index.md の「実施する作業」に反映の行を置いて、完了の処理の手順5で統合のブランチのアンチパターン集に反映する）は、`cycle-kickoff` の手順1に一般の規則として書く。手順1が「統合のブランチに移り、以降の手順はその上で行う」とだけ書くと、急ぎの不具合を main で直す道が手順と食い違うからである。これは守れなかったルールに書き足す対処（AP-WF28 候補）ではなく、統合のブランチの運用を定める手順1の中身そのものなので、手順1の1つの段落として書く。急ぎのサイクルの番号は、番号を決める手順5に、両方のブランチを見る形で書く。
- `cycle-kickoff` の手順4（実施する作業の選択）には書き足さない。取り違えの根は、案を比べるときに軸を束ね、長いサイクルの費用を数えなかったことで、統合のブランチという道を知らなかったことではない（options.md は D を比べている）。手順4に「収まらなければ分ける」と書いても、すでにある「サイクルの作業は最小限にしてください」を言い直すだけで、根に当たらない（AP-WF28 候補）。
- この型は、`docs/anti-patterns/candidates.md` に AP-WF51 候補として載せる。
