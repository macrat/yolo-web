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
  - [x] 4ゲーム（kanji-kanaru / irodori / nakamawake / yoji-kimeru）の各 `GameContainer` で、HowToPlay（初回訪問）と Result（終了時）の `open` 制御が「トリガ要素なしの自動オープン」であることをコードで確認する
  - [x] 手動起動（onHelpClick / onStatsClick）経路は現状で正常（トリガ復帰あり）であることを再確認し、退行させないと決める
  - [x] 是正前の body 落ちの証拠: cycle-287 の DOM 実測に加え、単体テスト「returnFocusRef 無し→focus が body に留まる」で同機構上の未是正挙動を再現（Playwright の是正前実測は本サイクルで是正済のため単体テストで代替）
- [x] 設計判断の確定（別ファイル `design-decision.md` に記録）
  - [x] 「自動オープン経路で閉じたとき、focus をどこへ戻すか」を決める（→ ゲーム名 `<h1>`（tabIndex=-1）。理由は design-decision.md 決定1）
  - [x] 手動起動との判別方法を決める（→ showModal 直前の `document.activeElement` が body/null なら自動オープン。design-decision.md 決定2）
- [x] 実装（共有経路の一点是正を優先）
  - [x] `useDialog`（＋`GameDialog`）に `returnFocusRef` を追加し、自動オープン時のみ showModal 直前に復帰先へ focus（native 復帰先を復帰先アンカーにする）
  - [x] 4ゲームの HowToPlay / Result へ `returnFocusRef={titleRef}` を結線・GameHeader の h1 に ref+tabIndex=-1（Stats は据置）
- [ ] 検証
  - [x] `useDialog` の回帰テストを追加（自動オープンで復帰先へ focus／preventScroll 付与／手動起動では素通し／ref 無しは body 据置の4件・全8件通過）
  - [x] Playwright 実測: 4ゲームの初回遊び方を Esc 閉じ→activeElement が各ゲームの h1(tabIndex=-1) に復帰・body 落ち回避を確認。**終了時結果も実フローで実測**（kanji-kanaru を6回誤答で負けに誘導→Result 自動オープン→scrollY=2000 から Esc 閉じ→focus=h1・scrollY 保持）。手動起動(help)は起動元ボタンへ復帰=退行なし。詳細は「Playwright 実測結果」節
  - [x] 視覚不変の確認: ダイアログ正常表示・レイアウト崩れなし・スクロール位置保持・h1/閉じるボタンの focus インジケータ可視・コンソールエラー0（Playwright スクショ）
- [x] レビュー（reviewer サブエージェント）を受け、指摘に対応する（2巡・経過は [review-log.md](./review-log.md)。1巡目 Major=preventScroll で根治+実測・2巡目=白紙で承認水準/Minor・Nit は記述訂正）
- [x] `npm run lint && npm run format:check && npm run test && npm run build` の全通過（lint 0・format 準拠・全5490テスト通過・build exit 0）

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

## Playwright 実測結果

ローカル本番ビルドで前景サブエージェントが実測（4ゲーム）:

| ゲーム       | 自動オープン(遊び方)検出 | Esc 後 activeElement              | body 落ち回避 | 判定 |
| ------------ | ------------------------ | --------------------------------- | ------------- | ---- |
| kanji-kanaru | dialog[open]             | H1 tabIndex=-1「漢字カナール」    | 回避          | PASS |
| irodori      | dialog[open]             | H1 tabIndex=-1「イロドリ #150」   | 回避          | PASS |
| nakamawake   | dialog[open]             | H1 tabIndex=-1「ナカマワケ #156」 | 回避          | PASS |
| yoji-kimeru  | dialog[open]             | H1 tabIndex=-1「四字キメル」      | 回避          | PASS |

- 手動起動(退行チェック・kanji-kanaru): 遊び方ボタン click→Esc→activeElement は `button[aria-label="遊び方"]`（h1 でも body でもない）＝ native 正常復帰を維持・退行なし。
- 視覚: ダイアログ正常表示・レイアウト崩れなし。h1/「閉じる」ボタンの focus インジケータ（赤アウトライン）可視。全ページ console error 0。

**終了時 Result 自動オープンの実フロー実測（reviewer 指摘 Major の対応・kanji-kanaru を6回誤答で負けに誘導）**:

- Result 自動オープン時の背景 scrollY は 474（最上部 150 へ飛んでいない＝open 時 `preventScroll` が機能）。
- モーダル表示中に背景を scrollY=2000 へ設定 → **Esc で閉じた後: activeElement は h1「漢字カナール」(tabIndex=-1)・scrollY は 2000 のまま**（最上部へ飛ばない）。
- 併せて機構レベルの実測（実 h1 使用）: native の close 復帰はスクロールしない（h1 を previously-focused にして 2523px 位置から close→focus は h1・scrollY 2523 維持）。素の `focus()` は 2523→150 へジャンプするが `focus({preventScroll:true})` は 2523 維持。
- 結論: 自動オープン（遊び方・Result 両方）で focus は h1 へ復帰し、スクロール位置も保持される。「視覚不変（スクロール位置含む）」が実フローで成立。

## キャリーオーバー

- なし（着手時点）。作業中に判明した scope 外の問題は本節と `docs/backlog.md` の両方に記載する。

## 補足事項

- 本件は B-573（全面 a11y 適用）の分割断片の一つ。残る a11y 断片（B-594/596/597/599 等）は別サイクルで継続。
- 見た目・レイアウトは不変（focus 管理のみ）。**スクロール位置も不変**——`focus({ preventScroll: true })` を用い、スクロール状態で開く Result を閉じても最上部へ飛ばない（reviewer 指摘 Major の対応・design-decision.md 決定2・下記 Playwright 実測で確認）。UI 変更を伴わないため take-screenshot は focus インジケータ可視性の確認に留める。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
