---
id: 319
description: 統合のブランチ design-rollout の3つ目のサイクル。診断の回答の画面（T5a）の本体として、Chrome for Android の preventScroll の振り分け・回答の本体（T5a-5）・流れ（T5a-6）を行う
started_at: 2026-10-20T02:53:12+0000
completed_at: null
---

# サイクル-319

B-754（サイトデザインの刷新）を統合のブランチ `design-rollout` で続ける3つ目のサイクル。[cycle-316/split-plan.md](../cycle-316/split-plan.md) 7 の表の2行目（診断の回答 T5a）のうち、回答の画面の本体（T5a-5）と流れ（T5a-6）を組む。設計は [cycle-316/t5a-design.md](../cycle-316/t5a-design.md)、振り分けが各タスクに渡すものは [cycle-318/device-triage.md](../cycle-318/device-triage.md) 7章、従う決定は [cycle-316/carryover.md](../cycle-316/carryover.md) の索引の「T5a」の行が挙げるもの。

T5a の残り（T5a-4 区切りと根の `touch-action`・T5a-7 測りと完了のレビュー）は次のサイクルが続ける。

## 実施する作業

- [ ] Chrome for Android が `focus()` の `preventScroll` を持たないこと（下の「計画にあたって参考にした情報」）を、実機に頼る項目として (i)〜(iii) に振り分け、行き先とともに [device-triage-focus.md](./device-triage-focus.md) に書いてレビューに通す。設計を変えるなら t5a-design.md の該当の行を直してレビューに通す
- [ ] T5a-5: 回答の本体（進みの reducer とタイマー・押した形と添えた字・答えたあとの字の箱・知識クイズの解説・フォーカスを `QuizContainer` の `useLayoutEffect` に集める形・組み・CSS の片付け）を、振り分けが T5a-5 に渡すもの（device-triage.md D3・D6 と、上の振り分けの結果）を含めて書き、試験とスクリーンショットとともにレビューに通す
- [ ] T5a-6: 流れ（開始と問ごとの送り・知識クイズの答えたあとの送り・フォントの読み込みのあとの送り直し・区画を低くしない・押した点の捕捉と着地の選び方・2打目で語を選ばない守り・結果と「もう一度挑戦する」の着地とフォーカス）を、振り分けが T5a-6 に渡すもの（device-triage.md D1・D9 と、上の振り分けの結果）を含めて書き、試験とスクリーンショットとともにレビューに通す
- [ ] 次のサイクルへの申し送りを書く: T5a-4・T5a-7、上の振り分けが T5a-7・T9・T10 に渡すもの、T5a-5・T5a-6 のレビューから次のタスクへ送るもの

## 作業計画

### 目的

診断を解く人が、狭い画面でも選択肢をすべて見て選べ、押したものが確かに入ったと分かり、次の問へ迷わず進めること（B-614・B-624・B-623）。`docs/site-concept.md` の来訪者への約束は「面白いものがここにあります」と渡すものを決め、面白いかどうかを来訪者の行動で確かめると定める。診断の面白さは解き終えて結果を読むところで起きるので、問の途中の操作の摩擦（選択肢が画面に入らない・押したか分からない・二度押しで問が飛ぶ・フォーカスが `body` に落ちる）は、面白さに届く前に来訪者を帰し、行動での確かめも曇らせる。

診断のプレイ面の閲覧の約86%がスマートフォンである（GA。下の参考の情報）。10人のうち8〜9人が、片手の親指で1問ずつ押して進む。このサイクルは、その人が押した瞬間に押した行が下線で示され、150ms のあと次の問の頭と選択肢が丸ごと画面に入って出てくる、という本体を組む。前のサイクルで土台（測り・規則・送りの関数）は済んでいる。

キックオフで、設計のフォーカスの移し方が頼る `preventScroll` を Chrome for Android が持たないことが分かった（MDN の互換性のデータ）。診断の閲覧の 32.6% が Android である。画面より高い置き場（結果のボックス・200% のまとまり）にフォーカスを移すと、送って決めた着地が、フォーカスの送りで中央へ動かされうる。着地はまさに二度押しの2打目を誤った所に落とさないための作りなので、T5a-6 を組む前に振り分ける。

### 作業内容

順は「振り分け → T5a-5 → T5a-6 → 申し送り」である。T5a-5 と T5a-6 はどちらも `QuizContainer.tsx` を触るので並行させない（t5a-design.md 7章「同じファイルは1つずつ触る」）。

1. **preventScroll の振り分け**: planner（general-purpose。主の木で `docs/cycles/cycle-319/` だけを書く）が、一次資料（MDN の互換性のデータとその `impl_url` の bug、HTML の `focus()` の手順、Chromium の `Element::focus` の送りの揃え方（中央に送るのが「要るときだけ」か））と、t5a-design.md 4-5〜4-9 のフォーカスの置き場と着地を読む。置き場ごとに、送ったあとの位置で置き場が画面に丸ごと入るか（入れば、要るときだけ送るブラウザでは動かない）を書き、(i) 端末に頼らない作り（例: 画面に丸ごと入る要素にフォーカスを置く）・(ii) Chromium の近似（例: `preventScroll` を外した `focus()` で同じ置き場を測る）・(iii) 受け入れて GA で見張る、のどれかに振り分ける。行き先（T5a-5・T5a-6・T5a-7・T9・T10）を書く。reviewer に通す。設計を変えるなら、builder（主の木。`docs/cycles/` の記録だけを書く）が t5a-design.md の該当の行を直し、reviewer に通す。承認されたら PM がコミットする。
2. **T5a-5**: 1 をコミットしてから、builder（担当の木）を起こす。中身・触るファイル・試験は t5a-design.md 7章の T5a-5 の行と 4-2〜4-4・4-6・4-7・4-11、振り分けが渡すものは device-triage.md 7章の T5a-5 の行と 1 の結果。T5a-5 は面の字を区切らずに `Button` に渡す（区切りは T5a-4）。完了の条件は、4-3 の試験1〜6とフォーカスの試験（4-7 の「試験」）が通ること、既存の試験・型・lint・`format:check`・build が通ること、押した形（診断で押した行だけが下線を持つ形・知識クイズで名前の下に正誤の字を添えた形）と答えたあとの知識クイズを、前（主の木の HEAD）と後（担当の木）で 375×550・320×550・1280×800 のライトとダークで撮って、来訪者の目で確かめること。送りは T5a-6 が組むので、T5a-5 の時点の画面は送りの無い途中の形でよい（出荷は `design-rollout` の最後の1回なので来訪者には出ない）。reviewer に通し、承認されたら PM が取り込む。
3. **T5a-6**: T5a-5 を取り込んでから、builder（担当の木）を起こす。中身・触るファイル・試験は t5a-design.md 7章の T5a-6 の行と 4-5・4-6・4-8・4-9、振り分けが渡すものは device-triage.md 7章の T5a-6 の行と 1 の結果。完了の条件は、`QuizContainer.reveal`・`intro`・`secondPress` の試験が通ること、全試験・型・lint・`format:check`・build が通ること、開始・1問目・高い問のあとの短い問・知識クイズの答えたあと（既定と 200%）・結果・やり直しのあとを、前（T5a-5 を取り込む前の HEAD）と後で 375×550・1280×800 のライトとダークで撮って確かめること、全15本を 375×550 で「はじめる」から結果まで解き、問ごとにまとまりが画面に入ることを目で確かめること（数を揃えた測りは T5a-7）。reviewer に通し、承認されたら PM が取り込む。
4. **申し送り**: PM がキャリーオーバーに書き、全体のレビューを受ける。完了の処理で `design-rollout` に push する。

担当を起こす前に、担当が読む変更を主の木でコミットし、`git status --short` と `git rev-parse HEAD` を別々の呼び出しで確かめてから、その HEAD を依頼に写す（cycle-318 の補足事項・`.claude/rules/delegation.md`）。サーバーを起こす担当には別々のポートを渡す。PM は成果物（差分の全文・画像）を自分で読んでから取り込む（AP-WF11）。

### 検討した他の選択肢と判断理由

- **T5a の残り4タスクを1サイクルで済ませる**: T5a-4 が待つ T5-3c の `QuizPlayPageLayout.tsx` の変更は 4deae9a7 で入っており、順の上では始められる。しかし T5a-5・T5a-6・T5a-4 は同じ `QuizContainer.tsx` に順に重なり、T5a-7 は全15本・157問を6つの画面で測り、二度押しの走査も組み直す大きな測りである。cycle-318 は土台だけでレビューが計30回を超えた。詰めれば文書とレビューが膨らみ途中で止まる危険がある（split-plan.md 7「各サイクルのキックオフで、その回に収まるかを改めて見積もり、収まらなければさらに分ける」）。本体（T5a-5・T5a-6）と、区切りと測り（T5a-4・T5a-7）の境で分ける。出荷は1回なので、分けても来訪者に届く時は変わらない。
- **T5a-5 だけにする**: T5a-5 だけでは送りが無く、画面の上で答えの流れを確かめられない。T5a-6 は T5a-5 の上に流れを足すだけで、2つを組で見て初めて B-614・B-624 の本体が確かめられる。組で行う。
- **preventScroll を振り分けずに T5a-6 の builder に任せる**: builder は Chromium（デスクトップ）でしか確かめられず、`preventScroll` が効く環境では差が見えない。作りを決める前に振り分けるのが最も安い（t5a-design.md 8章と同じ理由）。先に振り分ける。

### 計画にあたって参考にした情報

- [cycle-316/split-plan.md](../cycle-316/split-plan.md) 7、[cycle-316/t5a-design.md](../cycle-316/t5a-design.md) 4章・6章・7章、[cycle-318/device-triage.md](../cycle-318/device-triage.md) 7章、[cycle-318/index.md](../cycle-318/index.md) のキャリーオーバーと補足事項
- GA4（BigQuery のエクスポート。2026-09-22〜2026-10-19。page_view）: 診断のプレイ面（15本）の閲覧は 2,537。OS 別では iOS 1,358（53.5%）・Android 828（32.6%）・Macintosh 174・ChromeOS 92・Windows 72・Linux 13。character-personality が 2,180（85.9%）。cycle-318 の照会（09-07〜10-04。iOS 58.9%・Android 30.4%）と同じく、スマートフォンが約86%を占める。
- 外部仕様への依存（2026-10-20 に一次資料で確かめた）:
  - react.dev `useLayoutEffect`（https://react.dev/reference/react/useLayoutEffect ）: 「React guarantees that the code inside `useLayoutEffect` and any state updates scheduled inside it will be processed before the browser repaints the screen.」設計 4-7 の「塗る前に送りとフォーカスを行う」はこれに依る。
  - react.dev `useEffect`（https://react.dev/reference/react/useEffect ）: クリックで起きたのでない更新の effect は「generally」塗ったあと、クリックで起きた更新の effect は「may」塗る前。設計 4-7 の読みと合う。
  - MDN `HTMLElement.focus()`（https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus ）と MDN の互換性のデータ（`@mdn/browser-compat-data` 8.1.6 の `api.HTMLElement.focus.options_preventScroll_parameter`）: Chrome 64・Safari 15・iOS の Safari 15.5・Firefox 68 から。**Chrome for Android は `version_added: false`**（`impl_url` は https://crbug.com/41453122 。bug の頁は入らないと読めず、中身は確かめていない）。
  - HTML Living Standard の `focus()` の手順（https://html.spec.whatwg.org/multipage/interaction.html ）: 「If options["preventScroll"] is false, then scroll a target into view given this, "auto", "center", and "center".」仕様の文は「要るときだけ」を書かない。ブラウザが画面に入っている置き場を送らないかは、振り分けで実装の一次資料から確かめる。

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
