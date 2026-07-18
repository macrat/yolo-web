---
id: 289
description: ゲームの自動オープンモーダル(初回遊び方・終了時結果)をEscで閉じた後のfocus復帰是正(B-595)
started_at: 2026-07-19T00:22:48+0900
completed_at: null
---

# サイクル-289

このサイクルでは、ゲームの**自動オープンモーダル**（初回訪問時の「遊び方」・ゲーム終了時の「結果」）をキーボードで閉じた（Esc）ときに、focus がページの `<body>` に落ちてしまう不具合（B-595 / cycle-287 監査 C3）を是正します。キーボード利用者がゲームに触れる最初の瞬間（遊び方）と遊び終えた瞬間（結果）で「今どこにいるか」を見失う状態を解消し、閉じた直後に意味のある安定したアンカーへ focus を戻します。

## 実施する作業

- [ ] 現状の把握（一次確認）
  - [ ] 4ゲーム（kanji-kanaru / irodori / nakamawake / yoji-kimeru）の各 `GameContainer` で、HowToPlay（初回訪問）と Result（終了時）の `open` 制御が「トリガ要素なしの自動オープン」であることをコードで確認する
  - [ ] 手動起動（onHelpClick / onStatsClick）経路は現状で正常（トリガ復帰あり）であることを再確認し、退行させないと決める
  - [ ] Playwright で kanji-kanaru の初回遊び方モーダルを Esc 閉じ→`document.activeElement` が body に落ちることを実測（是正前の証拠）
- [ ] 設計判断の確定（別ファイル `design-decision.md` に記録）
  - [ ] 「自動オープン経路で閉じたとき、focus をどこへ戻すか」を決める（候補: ゲーム主要領域 / 主見出し / 直近の主要操作要素）
  - [ ] 手動起動との判別方法を決める（例: showModal 時の activeElement が body かどうか、または明示 prop）
- [ ] 実装（共有経路の一点是正を優先）
  - [ ] `useDialog`（または `GameDialog`）に「復帰先」を渡せる仕組みを追加し、自動オープン経路のみ復帰先へ focus を戻す
  - [ ] 4ゲームの HowToPlay / Result 呼び出し側で復帰先を結線する（Stats 等の手動起動は据置）
- [ ] 検証
  - [ ] `useDialog` の回帰テストを追加（復帰先が指定されたとき close 後に focus が復帰先へ移る／手動起動相当では既存挙動を壊さない）
  - [ ] Playwright で4ゲームの初回遊び方・終了時結果を Esc 閉じ→focus が body でなく復帰先にあることを実測（是正後の証拠）
  - [ ] 視覚不変の確認（focus 管理のみで見た目・レイアウトを変えない）
- [ ] レビュー（reviewer サブエージェント）を受け、指摘に対応する
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` の全通過

## 作業計画

### 目的

ゲームの自動オープンモーダルを Esc で閉じたキーボード利用者が、閉じた直後に focus を見失う（body へ落ちる）状態を解消する。ゲームは日々反復して遊ばれる面であり、遊び方（入口）と結果（出口）は全利用者が必ず通る。ここでの focus 喪失は「Tab を最初から押し直す」負担を強い、キーボード/スクリーンリーダー利用者のゲーム体験を直接損なう。cycle-287 で診断の設問送り focus（F2）を是正した focus 管理の姉妹であり、同じ品質水準を全ゲームに広げる。

### 作業内容

**不具合の構造（一次確認済み）**

- native `<dialog>` を `showModal()` で開くと、close 時に focus は「previously focused element」＝ showModal 呼び出し時に focus されていた要素へ復帰する（WHATWG 仕様）。
- 手動起動（`onHelpClick`/`onStatsClick`）はトリガのボタンが previously focused element になるため正常復帰する（cycle-287 で確認済み）。
- 自動オープンは2経路で、いずれもトリガ要素が無い:
  - HowToPlay: `useState(() => {…FIRST_VISIT_KEY…})` により初回訪問時に初期値 true（マウント時に開く）。
  - Result: ゲーム終了後 `setTimeout(() => setShowResult(true), 600)`（時間差で開く）。
  - どちらも showModal 時の focus が事実上 `<body>` のため、Esc 閉じで focus が body に落ちる（cycle-287 の DOM 実測）。

**是正方針**

共有経路（`useDialog`）で塞ぐことを優先する。個別ゲームに散らさず一点で直すことで、4ゲーム×2経路に一貫した復帰挙動を与え、将来のゲーム追加でも自動的に守られる。

- `useDialog`（または `GameDialog`）に「閉じたときの focus 復帰先」を渡せる仕組みを追加する。
- 自動オープン経路（HowToPlay 初回・Result）でのみ復帰先を指定し、閉じた後に focus をそこへ移す。復帰先はゲームの主要領域/主見出し等、閉じた文脈で「次に操作する場所」として自然な安定アンカーとする（具体は design-decision.md で確定）。
- 手動起動（help/stats ボタン）は native の正常復帰を尊重し、復帰先を渡さない＝既存挙動を据え置く（退行防止）。

正確な API 形（prop 名・復帰先の指定手段・判別ロジック）は、実装前に `design-decision.md` に選択肢と判断理由を書いてから確定する。実装は「値の来訪者体験」を最優先し、設計の綺麗さより「閉じた後に迷わないこと」を先に満たす。

### 検討した他の選択肢と判断理由

- **各 GameContainer 側で個別に focus を戻す**: 共有せず4ゲームに同じ処理を重複させると、実装漏れ・不整合・将来のゲーム追加時の再発を招く（cycle-287 で focus 管理を共有化した方針と逆行）。→ 共有 `useDialog` で一点是正する。
- **自動オープン自体をやめる**（遊び方を初回に出さない等）: 初回の遊び方提示・終了時の結果提示はゲーム体験上の価値がある。UX を削って a11y を得るのは本末転倒。→ 自動オープンは維持し、focus 復帰だけ直す。
- **全モーダルに一律で復帰先を強制**: 手動起動は native 復帰が正しく機能しているため、触ると逆に退行リスク。→ 自動オープン経路に限定する。

### 計画にあたって参考にした情報

- cycle-287 監査所見: `docs/cycles/cycle-287/findings.md`（C3＝本件・F2＝診断 focus 管理の先例・「GameDialog ユーザー起動は復帰正常」の確認）
- 実コード一次確認（2026-07-19）: `src/play/games/shared/_components/useDialog.ts`（focus 管理なし）・`src/play/games/shared/_components/new/GameDialog.tsx`・`src/play/games/kanji-kanaru/_components/GameContainer.tsx`（HowToPlay 初回 true 初期化 L160-170・Result の 600ms 遅延 open L257-270）・GameDialog 利用 13 箇所（4ゲーム×HowToPlay/Result/Stats）
- 外部仕様（ブラウザ API）一次資料確認（2026-07-19）:
  - WHATWG HTML Standard「the dialog element」focus restoration: https://html.spec.whatwg.org/multipage/interactive-elements.html — close 時 focus は previously focused element（showModal 時の focused 要素）へ復帰。自動オープンではこれが事実上 body。
  - MDN `<dialog>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog — showModal 時の初期 focus 規定はあるが close 時復帰の詳細記載なし（仕様側で確認）。

## キャリーオーバー

- なし（着手時点）。作業中に判明した scope 外の問題は本節と `docs/backlog.md` の両方に記載する。

## 補足事項

- 本件は B-573（全面 a11y 適用）の分割断片の一つ。残る a11y 断片（B-594/596/597/599 等）は別サイクルで継続。
- 視覚不変が前提（focus 管理のみ）。UI 変更を伴わないため take-screenshot による前後比較は focus インジケータの可視性確認に留める。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
