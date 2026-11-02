---
id: 320
description: 統合のブランチ design-rollout の4つ目のサイクル。診断の回答の画面（T5a）の区切りと根の touch-action（T5a-4）を組み、T5a-7 の測りのうち二度打ちのほかを行う
started_at: 2026-11-02T03:06:31+0000
completed_at: null
---

# サイクル-320

B-754（サイトデザインの刷新）を統合のブランチ `design-rollout` で続ける4つ目のサイクル。[cycle-316/split-plan.md](../cycle-316/split-plan.md) 7 の表の2行目（診断の回答 T5a）のうち、区切りとページの根の `touch-action`（T5a-4）を組み、測りと完了のレビュー（T5a-7）のうち、道具の組み直しと、二度打ち（6章 条件7・device-triage.md D5）のほかの測りを行う。設計は [cycle-316/t5a-design.md](../cycle-316/t5a-design.md)、振り分けが各タスクに渡すものは [cycle-318/device-triage.md](../cycle-318/device-triage.md) 7章、前のサイクルの申し送りは [cycle-319/index.md](../cycle-319/index.md) のキャリーオーバー。

T5a-7 の残り（二度打ちの測り・`docs/knowledge/input-events-and-guards.md` の書き直し・T5a の完了のレビュー）は次のサイクルが続ける。

## 実施する作業

- [ ] T5a-4: 区切り（`questionPhrases.ts` をサーバーで作って渡し、`QuestionCard` が見出しと答えたあとの行を `PhrasedText` で、選択肢を `Button` の `phrases` で組む）と、`QuizPlayPageLayout` の箱とページの根の `touch-action: manipulation` を書き、試験と撮った像とともにレビューに通す
- [ ] T5a-7a-1: 測りの道具を組み直し、基準の版と変更後の版を用意して、基準の版で数本を走らせて t5a-measure.md 0章の手順の文のとおりに動くかを確かめ、動かない所の文を直してレビューに通す
- [ ] T5a-7a-2: 6章 条件1（入る）・条件2（知識クイズの答えたあと）を基準の版と変更後の版で測って t5a-measure.md に写し、レビューに通す
- [ ] T5a-7a-3: 6章 条件3（押した形）・条件4（再入力）・条件5（フォーカス）・条件6（「もう一度挑戦する」）を測って写し、レビューに通す
- [ ] T5a-7a-4: 6章 条件8（区切りの折れ）・9・10・12（転送量）と device-triage.md 7章の T5a-7 の行のうち D1〜D4・D6・D7 を測り、条件11（撮る）の像を撮って写し、レビューに通す
- [ ] backlog の B-788 を Queued に移す（T5a-4 が診断のページに根の `touch-action` を入れたことで着手できる）
- [ ] 次のサイクルへの申し送りを書く: 条件7・D5 の二度打ちの測り、knowledge の書き直し、T5a の完了のレビュー、このサイクルの測りから PM に渡った件

## 作業計画

### 目的

診断を解く人が、狭い画面でも選択肢の字を語の途中で折られずに読め、速く2度押しても画面が拡大されずに次の問へ進めること（B-614・B-624・B-623）。`docs/site-concept.md` の来訪者への約束は「面白いものがここにあります」と渡すものを決め、面白いかどうかを来訪者の行動で確かめると定める。診断の面白さは解き終えて結果を読むところで起きるので、問の途中の摩擦は、面白さに届く前に来訪者を帰す。

診断のプレイ面の閲覧の 82.3% がスマートフォンで、85.8% が character-personality である（GA。下の参考の情報）。前のサイクルまでで、押した形・送り・フォーカスの本体は組めた。いま 375・320 の画面では、選択肢の文全体が1つの文節として組まれ、「描／く」のように1字だけの行や、行頭の閉じ括弧が出る（cycle-319 のキャリーオーバー）。読みかけた選択肢の字が語の途中で折れると、10人のうち8人が、選ぶ前に読み直す。区切りを渡してそれを消し、根の `touch-action` で2度押しの拡大を止める（T5a-4）。そのうえで、設計が完了の条件に挙げた測りを、組んだものに当てて数で確かめる（T5a-7a）。測りで外れた件は、PM が t5a-design.md 8章のとおり件ごとに決める。

### 作業内容

順は「T5a-4 → T5a-7a-1 → T5a-7a-2 → T5a-7a-3 → T5a-7a-4 → 申し送り」である。T5a-7a はどれも T5a-4 を取り込んだ版を測る。T5a-7a の4つは同じ `docs/cycles/cycle-316/t5a-measure.md` に書くので、並行させず1つずつ進める。

1. **T5a-4**: builder（担当の木。ポート 3101）を起こす。中身・触るファイルは t5a-design.md 7章の T5a-4 の行と 4-4・4-10、振り分けが渡すものは device-triage.md 7章の T5a-4 の行（`QuizPlayPageLayout.tsx` が並べるものを局所のクラスの箱で包み、`src/app/play/[slug]/page.module.css` に `:root:has(.<箱のクラス>) { touch-action: manipulation; }`）。完了の条件:
   - 6章 条件8 の単体試験: 全15本の全問の見出しと全選択肢で、`questionPhrases` の区切りが `splitIntoPhrases(文)` と等しく、つないだものが元の文と等しい。`QuestionCard` が受け取った区切りのあいだにだけ `<wbr>` を置く。
   - `npm run check:phrased-names` で、触ったファイルの字で渡すものが 0。
   - `Section` のあいだの罫線が、箱の中でも前と同じに引かれる（開始・回答・解き終えた画面を前と後で撮り比べる）。
   - 375・320 の既定と 200% で、cycle-319 のキャリーオーバーの1字の行（「描／く」）と行頭の閉じ括弧（「」を思い返し」）が消えたことを撮って確かめる。
   - 開始の画面の説明のコメント（「事実（種別・問題数・所要時間・タイプ数）」）を `DESIGN.md` §8 の語と合わせて読めるか確かめる（cycle-318 のキャリーオーバー「開始の画面の語」。T5a-6 で確かめていなければここで）。
   - 全試験・型・lint・`format:check`・build が通る。PM は試験を含む差分の全文と撮った像を読み、左端の揃いを測ってから取り込む。
2. **T5a-7a-1**: 測りの担当（general-purpose。主の木で `tmp/` と `docs/cycles/` の記録だけを書く。ポート 3111・3112）を起こす。cycle-318 のキャリーオーバー「T5a-7 の測りの道具」のとおり、`origin/cycle-316-records` の `tmp-records/scratchpad/rev-t5a2/` を元に道具を組み直す。基準の版（fff3d31f に da102212 の `character-personality.ts` を重ねたもの）と変更後の版（T5a-4 を取り込んだ HEAD）を `tmp/` に書き出して本番ビルドする。t5a-measure.md 0章の「T5a-7 の前の確かめ」（基準の版から T5a の最初のコードのコミットまでに診断のページへ入った別のタスクの変更）を行う。基準の版で数本を走らせ、0章の手順の文どおりに動くかを確かめ、動かない所の文を直す。二度打ちの走査の文（5-2）の確かめは次のサイクルの条件7 と一緒に行うので、ここでは条件1〜6・8 の手順に限る。reviewer に通す。
3. **T5a-7a-2**: 同じ道具で条件1・2 を、基準の版と変更後の版で測り、t5a-measure.md に変更後の値を書き足す。条件1 の余りが 45 を割る問、8px を割る問（cycle-319 のキャリーオーバーの判定のしかた）は記録して PM に報告する。reviewer に通す。
4. **T5a-7a-3**: 条件3〜6 を測って写す。reviewer に通す。
5. **T5a-7a-4**: 条件8 の折れの数え（`frontend-design` スキルの「見出しとコントロールの名前の折り方を測る」）・条件9・10 の `grep`・条件12 の HTML と RSC の大きさ、device-triage.md 7章の T5a-7 の行のうち D1（根と点ごとの祖先の `touch-action` の計算値。ヘッダ・余白・フッタの点と、ほかのページの対を含む）・D2（次の問の行の `:hover`）・D3（押す前と押したあとの計算値と行の一致）・D4（`100svh` と `innerHeight`）・D6・D7（アクセシビリティの木）を測り、条件11 の像を `take-screenshot` で撮る。reviewer に通す。
6. **申し送り**: PM がキャリーオーバーに書き、全体のレビューを受ける。完了の処理で `design-rollout` に push する。

担当を起こす前に、担当が読む変更を主の木でコミットし、`git status --short` と `git rev-parse HEAD` を別々の呼び出しで確かめてから、その HEAD を依頼に写す（`.claude/rules/delegation.md`）。Edit・Write・マージの呼び出しと、それを前提にするコミット・push・木の削除は、結果を見てから別のバッチで打つ（AP-WF29）。担当と reviewer の完了は報告を受けて読んでから次へ進む（AP-WF04）。

### 検討した他の選択肢と判断理由

- **T5a-4 と T5a-7 のすべてをこのサイクルで行う**: T5a-7 は、6章の14の条件と device-triage.md の6項目の測りに、全15本・6画面・5つの間隔の二度打ちの走査と、外れた件ごとの PM の判断と、knowledge の書き直しと、T5a の完了のレビューが重なる。測りの道具は消えていて組み直しから始まり、二度打ちの走査の文（t5a-measure.md 5-2）はどの版でも走らせていない。cycle-318 は土台だけでレビューが30回を超え、cycle-319 も2タスクで20回を超えた。二度打ちの走査は、条件1〜6 と道具と版を共有するが、件ごとの判断（8章）と knowledge の文（避けられない件の書き方）がその数に掛かるので、まとまりとして切り離せる。境を二度打ちの前に置く。出荷は1回なので、分けても来訪者に届く時は変わらない。T5a は split-plan.md 7 の見込み（1〜2サイクル）を超えて4つ目のサイクルに入り、表の3行目より後は順にずれる。
- **T5a-7 の測りを1人の担当にまとめる**: 測りが長くなり、担当の文脈が溢れて途中で止まる危険と、レビューが1回で全条件を見られない害がある。道具の組み直しと、条件のまとまりごとに分ける（CLAUDE.md の「Keep task smaller」）。
- **T5a-7a を並行させる**: 書く先が同じ t5a-measure.md なので並行させない。
- **B-790・B-792（hook）をこのサイクルに入れる**: どちらも統合のブランチの上で扱う項目で、AP-WF29・シェルでの書き込みの再発を止めるが、T5a と密接ではなく、サイクルの作業を最小限にする決まりに従って入れない。このサイクルは手で守る。

### 計画にあたって参考にした情報

- [cycle-316/split-plan.md](../cycle-316/split-plan.md) 7、[cycle-316/t5a-design.md](../cycle-316/t5a-design.md) 4-4・4-10・6章・7章・8章、[cycle-316/t5a-measure.md](../cycle-316/t5a-measure.md) 0章、[cycle-318/device-triage.md](../cycle-318/device-triage.md) 7章、[cycle-318/index.md](../cycle-318/index.md) と [cycle-319/index.md](../cycle-319/index.md) のキャリーオーバーと補足事項
- GA4（BigQuery のエクスポート。2026-10-05〜2026-11-01。page_view）: 診断のプレイ面（15本）の閲覧は 2,719。端末の区分では mobile 2,238（82.3%）・desktop 375・tablet 106（3.9%）。OS が iOS か Android のものは 2,344（86.2%）。character-personality が 2,333（85.8%）。
- 外部仕様への依存（2026-11-02 に一次資料で確かめた）:
  - MDN `touch-action`（https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action ）: `manipulation` は「Enable panning and pinch zoom gestures, but disable additional non-standard gestures such as double-tap to zoom.」。Baseline Widely available（2019年9月から）。継承しない（Inherited: no）。根に書いた値が子孫の点に効くのは、ブラウザが点の要素から祖先までの値を合わせて扱うためで、T5a-7a-4 の D1 で点ごとの祖先の計算値を測って確かめる。
  - MDN `:has()`（https://developer.mozilla.org/en-US/docs/Web/CSS/:has ）: Baseline Widely available（2023年12月から）。

## レビュー結果

## キャリーオーバー

## 補足事項

- ADR009 の次回確認日（2026-10-23）が来ていた。最初の出荷（B-754）がまだなので、手順1のとおり次回確認日を 2026-12-02 に延ばし、経過記録に書いた。
- 統合のブランチの履歴が浅いクローンで `origin/main` と共通の祖先を持たず、キックオフの `git merge origin/main` が「unrelated histories」で止まった。`git fetch --unshallow origin main design-rollout` で履歴を深くしてから取り込み直すと、main は既に取り込み済みだった。

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
