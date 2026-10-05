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

- [x] 8章の任意の GA の照会（直近28日の診断のプレイ面の画面の大きさと OS・ブラウザ）を行う。結果の要約は振り分けの文書に写す
- [x] 実機に頼る項目を、項目ごとに (i) 端末に頼らない作り・(ii) Chromium の近似・(iii) 受け入れて出荷のあと GA で見張る、のどれで扱うかに振り分け（[device-triage.md](./device-triage.md)）、行き先（受け持つタスク）とともにレビューに通す。項目は t5a-design.md 8章の8項目と、B-623 の iOS の確かめ（知識クイズの「次へ」の二度押しで FAQ が開かないこと）。8章の5つ目の項目（二度押しのずれと次の問に落ちる回数）は B-620 の判断の材料にもなることを書く
- [x] T5a-2b: `design-rollout-wip` の `20a29292`（character-personality の Q1 の文言）を担当の木で戻してコミットする（取り込みは T5a-2 の承認のあと）
- [ ] T5a-2b の前後のスクリーンショットを、Q1 を開いた状態で 375×550・320×550・1280×800 のライトとダークで撮り、来訪者の目で確かめる（画像は第11回のレビューで見てもらう）
- [ ] T5a-2: 振り分けの承認のあと、[t5a-measure.md](../cycle-316/t5a-measure.md) をレビュー第10回（[review-t5a-2-10.md](../cycle-316/review-t5a-2-10.md)）の指摘1（5-3 の押した行と進め方）と参考の4点、振り分けが求める追記から直し、0章の「コミットの名を書き入れる」指示を T5a-2b のコミットの名に置き換える。第11回のレビューで T5a-2b のコミットと組で見てもらい、承認まで続ける
- [ ] 振り分けの承認のあと、[device-triage-fixes.md](./device-triage-fixes.md) の直し（t5a-design.md・carryover-tasks.md の「T9 の実機で確かめる」などを振り分けの結果に合わせる）を入れ、backlog の案を起こし、レビューに通す
- [ ] T5a-1: t5a-design.md 5章の文のうち `DESIGN.md` と `frontend-design` スキルのものを書き、振り分けが (i) としてこのタスクに渡すものを含めて、レビューに通す
- [ ] T5a-3: `src/lib/reveal.ts` に、まとまりを見せる送りと着地の選び方（4-5・4-9）を足す。あわせて、見えている画面の範囲（`visibleRange()`）を振り分けの D4 のとおり直し、同じ計算を面の中に持つ nakamawake・kanji-kanaru の `GameContainer.tsx` を `reveal.ts` にそろえる（道具とゲームの送りも変わる）。単体試験とともにレビューに通す
- [ ] 次のサイクルへの申し送りを書く: 残りの T5a のタスク（T5a-5・T5a-6・T5a-4・T5a-7）、T5a-7 での測りの道具の組み直しと、そのための履歴の深め方と `cycle-316-records` の取り方、振り分けの結果のうち T5a-5・T5a-6・T5a-7・T9・T10 に渡すもの

## 作業計画

### 目的

診断を解く人が、狭い画面でも選択肢をすべて見て選べ、押したものが確かに入ったと分かり、次の問へ迷わず進めること（B-614・B-624・B-623）。`docs/site-concept.md` の来訪者への約束は「面白いものがここにあります」と渡すものを決め、面白いかどうかを来訪者の行動で確かめると定める。診断の面白さは解き終えて結果を読むところで起きるので、問の途中で選択肢が見えない・押したか分からないという操作の摩擦は、面白さに届く前に来訪者を帰し、行動での確かめも曇らせる。いまは 375×550 で4択のうち見えるのが1つだけの問があり、知識クイズでは「次へ」が画面の外にある。

このサイクルは、その本体を組む前の土台を固める。本体（T5a-5・T5a-6）は「選択肢が1画面に入る」と「上下どちらにも外れうるまとまりを送って見せる」を前提にする。その前提を実測で支え（T5a-2）、規則として書き（T5a-1）、送りを関数として試験で固める（T5a-3）。T5a-3 は、iOS などでツールバーが出入りしても送ったものが隠れないよう、見えている画面の範囲の定義を直す。この定義は道具とゲームの送りも使うので、それらの来訪者にも同じ益が届く。実機で確かめられない項目を先に振り分けるのは、(i) の「端末に頼らない作り」は作りを決める前に選ぶのが最も安いからである（t5a-design.md 8章）。

### 作業内容

順は「振り分け → T5a-2 と設計の文書への直し（作業内容4） → T5a-1 → T5a-3」である。振り分けは T5a-2 に入る前にレビューに通す（carryover.md の T5a の行・t5a-design.md 8章）。(i) や (ii) を選べば、t5a-measure.md の追記や組みの見直しが要りうるからである。T5a-2b だけは振り分けに左右されない（Q1 の文言は decisions-t5-2.md の「T5a-2 の測り」で決まっている）ので、振り分けと並べて作る。

1. **実機に頼る項目の振り分け**: planner（general-purpose。主の木で `docs/cycles/cycle-318/` だけを書く）が t5a-design.md 2章・4章・8章、MDN・WebKit の一次資料、GA の照会の結果を読み、9項目を (i)〜(iii) に振り分けて device-triage.md に書く。項目ごとに行き先を書く: (i) は作りを受け持つタスク（T5a-1 の規則の文・T5a-3・次のサイクルの T5a-5・T5a-6）、(ii) は T5a-7 に足す測り、(iii) は T9 に渡す確かめと、見張る GA の数と戻す線の案（ADR009 に書くのは T10）。8章の5つ目の項目（二度押しのずれと次の問に落ちる回数）は B-620 の判断の材料（backlog の B-620 の「振り分けた方法での二度押しの確かめ」）に当たることを書く。(ii) を選んで変更前の値が要る項目は、既定で「変更前の値は T5a-7 が基準の版で測る」とする（第11回のレビューを測りの追加で膨らませないため）。GA の照会の要約（期間・数・留保）もこの文書に写す（照会の作業ファイルは `tmp/` で追われないため）。reviewer に通す。
2. **T5a-2b**: builder（担当の木）が `git fetch origin design-rollout-wip` のあと `git cherry-pick --no-commit 20a29292` で戻し、`git restore --staged -- .` で下ろし、差分が Q1 の3行だけであることを確かめてコミットする。PM はまだ取り込まない。コミットのあと、スクリーンショットの担当が、変更前を主の木の HEAD のサーバーで、変更後を T5a-2b の担当の木のサーバー（依頼にそれぞれのポートを書く）で、Q1 を開いた状態で 375×550・320×550・1280×800 のライトとダークで撮る。
3. **T5a-2**: 振り分けの承認と、それが t5a-measure.md に求める追記が決まってから起こす。builder（主の木。`docs/cycles/` の記録だけを書く）が t5a-measure.md を直す。5-3 の押した行と進め方は、`cycle-316-records` の記録（`tmp-records/scratchpad/rev-t5a2/` ほか。`git fetch origin cycle-316-records` で取る）から分かれば書き、分からなければ 5-3 の5つの画面を参考の値とし、T5a-7 が基準の版でも同じ手順で測り直す、と書く。0章の指示は、2 のコミットの名に置き換える（`git merge` で取り込むので、担当のコミットは書き換わらず名は変わらない）。reviewer の第11回は、t5a-measure.md と、T5a-2b の担当の枝のコミットと、2 で撮った前後の画像を組で見る（依頼に画像の場所を書く）。このクローンは浅く、0章が起点にする fff3d31f・db847969 が無いので、依頼に `git fetch --unshallow origin design-rollout`（または `--deepen`）を書く。承認されたら、PM が T5a-2b の枝を取り込んで木と枝を消し、t5a-measure.md をコミットする。測りの道具の組み直しは、それを使う T5a-7（次のサイクル）で行う。
4. **振り分けの結果を設計の文書に入れる**: T5a-2 と並べて、builder（主の木。`docs/cycles/` の記録だけを書く）が [device-triage-fixes.md](./device-triage-fixes.md) の直しを t5a-design.md・carryover-tasks.md に入れる（t5a-measure.md への追記は T5a-2 が受け持つ）。backlog の行は PM が起こす。reviewer に通し、承認されたら PM がコミットする。T5a-1・T5a-3 の担当はこの直しのあとの設計を読む。
5. **T5a-1**: T5a-2 と 4 を主の木でコミットしてから、builder（担当の木）を起こす。振り分けが (i) として規則の文に渡すものを含めて書き、reviewer に通す。承認されたら PM が取り込む。
6. **T5a-3**: T5a-1 を取り込んでから、builder（担当の木）を起こす。振り分けが (i) として送りの関数に渡すもの（[device-triage-reveal.md](./device-triage-reveal.md) の案 (a)）を含めて書く。`visibleRange()` を使う道具3本（base64・age-calculator・json-formatter）・ゲーム4本と、`kind` を持つ `ResultBox`（age-calculator・json-formatter と storybook の見本）の送り、面の中に同じ計算を持つ nakamawake・kanji-kanaru のふるまいが変わるので、それらの既存の試験が通ることと、変わる所を単体試験で固めることを完了の条件にする。Chromium では `100svh` が `innerHeight` に等しく、画面の撮り比べでは差が出ないので、確かめは単体試験で行う。reviewer に通し、承認されたら PM が取り込む。
7. すべてのあとに全体のレビューを受け、完了の処理で `design-rollout` に push する。

並行させるのは触るファイルが重ならないものだけにする（`.claude/rules/delegation.md`）。1（`docs/cycles/cycle-318/`）と 2（`src/play/quiz/data/character-personality.ts`）は重ならないので並行させる。担当を起こす前に、担当が前提にする変更を主の木でコミットする。

### 検討した他の選択肢と判断理由

- **T5a の7タスクを1サイクルで済ませる**: 本体は流れ・フォーカス・送り・区切りが同じファイル（`QuizContainer.tsx`）に順に重なり、T5a-2 だけでレビューが10回続いた。1サイクルに詰めると、cycle-316 と同じく文書とレビューが膨らみ、途中で止まる危険がある（split-plan.md 7「1サイクルは1つの面か、密に関係する少数の小タスクに限る」）。土台（振り分け・測り・規則・関数）と本体（画面）の境で分ける。
- **T5a-3 を次のサイクルの本体に回す**: T5a-3 は送りの関数と、それを使う面の画面の範囲の定義を触り、回答の画面の組み（`QuestionCard`・`QuizContainer`）には触らないので、本体と切り離してレビューできる。次のサイクルを本体だけに絞れる。こちらを採る。
- **画面の範囲の定義を診断の送りだけに持たせ、道具とゲームを変えない**（device-triage-reveal.md の案 (b)）: T5a-3 は小さく済むが、ツールバーが戻って送ったものの下が隠れる害は、送りの関数を使うすべての面で同じである。ツールバーが出入りするのは iOS と Android の端末で、診断のプレイ面では閲覧の 89.3%（OS 別で iOS 58.9%・Android 30.4%。GA。道具とゲームの面は数えていないが、同じ端末の来訪者が多いと見込む）に当たるので、道具とゲームにも同じ直しを届ける案 (a) を採る。
- **測りの道具の組み直しを T5a-2 で行う**: 第10回のレビューは、5-1・5-2・5-4 と条件1・2・6 を文から組み直せると確かめている。道具が要るのは前と後を測る T5a-7 なので、そのサイクルで組む。いま組むと、使われないまま次のセッションで消える。

### 計画にあたって参考にした情報

- [cycle-316/split-plan.md](../cycle-316/split-plan.md) 4・7、[cycle-316/carryover.md](../cycle-316/carryover.md)、[cycle-316/decisions-t5-2.md](../cycle-316/decisions-t5-2.md) の「T5a-2 の測り」、[cycle-316/t5a-design.md](../cycle-316/t5a-design.md) 7章・8章、[cycle-316/review-t5a-2-10.md](../cycle-316/review-t5a-2-10.md)、[cycle-317/index.md](../cycle-317/index.md)
- GA4（Data API。property の runReport。2026-09-07〜2026-10-04）: 診断のプレイ面（15本）の page_view は 2,862、うち 89.7% が character-personality。OS 別では iOS 58.9%（1,687）・Android 30.4%（870）。iOS の Safari が 48.6%、アプリの中の Safari（4.9%）・iOS の Chrome（5.5%）・Mac の Safari を足すと、WebKit で描かれるものは約 64%。幅 360 以下 8.5%、画面の高さ 667 以下 5.1%、幅 320 以下 1.2%。BigQuery のエクスポートには解像度の列が無いので Data API を使った。要約と留保は device-triage.md に写す。
- 外部仕様への依存: 実機の項目の振り分けは、iOS の Safari が `touch-action: manipulation` でダブルタップの拡大をしないことに依る（(i) の例）。2026-10-05 に一次資料で確かめた。
  - MDN `touch-action`（https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action ）: `manipulation` はパンとピンチの拡大を残し、ダブルタップの拡大などを止める。2019年9月からどのブラウザでも使える（Baseline Widely available）。
  - WebKit blog「More Responsive Tapping on iOS」（2015-12-15。https://webkit.org/blog/5610/more-responsive-tapping-on-ios/ ）: `touch-action: manipulation` の要素で始まる触れは、パンとピンチの拡大だけに使われ、ダブルタップの判定をしない。
  - 振り分けが頼るほかの仕様（Pointer Events 3 §8.2 の拡大の決まり・CSS Values 4 の `svh` と WebKit のその実装・`:has()` など）と、一次資料で決まらないことは [device-triage-sources.md](./device-triage-sources.md) にある。T5a-3 は画面の範囲を `100svh` の読みに頼る形に変える。

## レビュー結果

| 対象                     | 回数 | 最終判定 | 記録                                                               |
| ------------------------ | ---- | -------- | ------------------------------------------------------------------ |
| 計画                     | 3    | 承認     | [review-plan.md](./review-plan.md)〜[-3](./review-plan-3.md)       |
| 実機に頼る項目の振り分け | 5    | 承認     | [review-triage.md](./review-triage.md)〜[-5](./review-triage-5.md) |

計画: 第1回の6件（振り分けを T5a-2 の前に置く順・振り分けの行き先と B-623・T5a-2b の受け渡し・前提のコミットの取り方・撮る範囲・担当を起こす時点）と第2回の4件（撮る時点と画像のレビュー・B-620・T5a-3 が (i) を受けること・取り込みで名が変わらない理由）をすべて直した。

振り分け: 9項目を (i)〜(iii) に分けた（[device-triage.md](./device-triage.md)）。第1〜4回の指摘（GA の見張りの事象名と拾える差、`touch-action` の範囲、`visibleRange()` の影響、一次資料の要約の誤り、WebKit の `svh` の bug の読みなど計31件（11・8・8・4））をすべて直した。PM の判断: D1 は診断・クイズのページだけ根に `touch-action: manipulation` を掛ける（2打目が落ちうる所をすべて覆う）。D4 は `reveal.ts` の画面の範囲を直し、道具とゲームにも同じ益を届ける。ゲームの `touch-action`（B-788）と hover の線（B-789）を backlog に起こした。

## キャリーオーバー

## 補足事項

- T5a-2b の builder は、計画のレビュー第3回の承認の前に起こした（第3回と並べた）。依頼の中身は第1回の直しから変わっておらず、起点も第2回の直しのコミット（8a2ba784）なので成果物に害は無いが、計画の承認を待ってから担当を起こす順を外れた。

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
