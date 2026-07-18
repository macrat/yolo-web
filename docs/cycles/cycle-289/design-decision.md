# cycle-289 設計判断: 自動オープンモーダルの focus 復帰

B-595（cycle-287 監査 C3）の是正にあたり、「自動オープンで閉じたとき focus をどこへ・どう戻すか」を確定する。本書は判断の芯だけを残す（経緯・コードは index.md と実装を参照）。

## 問題の構造（一次確認済み）

- native `<dialog>` を `showModal()` で開くと、close 時 focus は「previously focused element」＝ showModal 呼び出し時に focus されていた要素へ復帰する（WHATWG HTML Standard）。
- 手動起動（help/stats ボタン click）はそのボタンが previously focused element になるため正常復帰する（cycle-287 で確認済み・退行させない）。
- 自動オープンは HowToPlay（初回訪問・マウント時 open=true）と Result（終了後 600ms で open=true）の2経路。いずれも showModal 時に意味ある要素が focus されておらず、事実上 `<body>` が previously focused element → Esc 等で閉じると focus が body に落ちる。

**重要**: HowToPlay モーダルは初回自動オープンと help ボタン手動起動の**両方で同じインスタンス**を使う。よって静的に「自動オープン専用」と印を付けられない。**実行時に「開いた瞬間、意味ある要素に focus があったか」で判別する**のが正しい。

## 決定1: 復帰先アンカー ＝ ゲーム名の `<h1>`（tabIndex=-1）

- 各ゲームの `GameHeader` にある `<h1>`（ゲームタイトル）を復帰先にする。`tabIndex={-1}` を付与してプログラム的に focus 可能にする（tab 順には入れない＝「見出しへ focus を移す」a11y 正統パターン）。
- 理由:
  - HowToPlay を閉じた瞬間（＝これから [ゲーム名] を遊ぶ）にも、Result を閉じた瞬間（＝ [ゲーム名] を遊び終えた）にも、**両方で意味ある方向づけ**になる。SR は「見出しレベル1・[ゲーム名]」と読み上げ、現在地を回復できる。
  - 4ゲームで一様。GameHeader は各ゲームにあり、h1 も必ず存在する。
- **却下したアンカー**:
  - help ボタン: HowToPlay には自然だが、Result を閉じた後に「遊び方」ボタンへ着地するのは文脈的に不自然（SR が「遊び方 ボタン」と読む）。
  - ゲーム入力欄（guess input）: ゲームごとに実体が異なり ref 配線が発散。終了時 Result では入力が無効化され得る。

## 決定2: 機構 ＝ showModal 直前に復帰先へ focus（自動オープン時のみ）

- `useDialog` に任意 `returnFocusRef?: RefObject<HTMLElement | null>` を追加。open 遷移で `showModal()` する**直前**に、`document.activeElement` が `null` または `<body>`（＝意味ある opener 不在＝自動オープン）のときだけ `returnFocusRef.current?.focus({ preventScroll: true })` を実行する。
- これにより native の previously focused element が復帰先アンカーになり、**Esc・閉じるボタン・背景クリックの全 close 経路**で native 復帰がアンカーへ戻る。close 後処理を足さない＝「close イベントと native focus 復帰の順序」への依存を持たない（順序が仕様/実装で変わっても壊れない）。
- showModal 直前の focus は同一同期フレーム内で showModal に上書きされ描画されない＝視覚的なちらつきなし。showModal のダイアログ内初期 focus も阻害しない。
- **`preventScroll: true` が必須（reviewer 指摘 Major の対応）**: アンカー（ゲーム名 h1）はページ最上部にあるが、自動オープンモーダルは来訪者がスクロールした状態で開くことがある（終了時 Result）。素の `focus()` はここでページを最上部へスクロールさせ、閉じた後に来訪者を最上部へ飛ばす（晴眼マウス利用者にも波及）。`preventScroll` でスクロール位置を保つ。**native の close 復帰はスクロールしない**（実ブラウザで実測: h1 を previously-focused にして 2523px スクロール位置から close → focus は h1・scrollY は 2523 のまま）ため、この一点で focus 保持とスクロール位置保持を両立できる。
- 手動起動時は activeElement がトリガボタン（≠body）なので**素通し**＝ native の正常復帰を尊重（既存挙動据置・退行防止）。

## 適用範囲

- `returnFocusRef` を渡すのは自動オープンし得る **HowToPlay と Result のみ**。Stats は手動起動のみ（native 正常復帰）のため渡さない。
- 4ゲーム（kanji-kanaru / irodori / nakamawake / yoji-kimeru）。GameContainer で h1 ref を作り、GameHeader（h1 に付与）・HowToPlayModal・ResultModal（→ GameDialog → useDialog）へ配線する。

## 検証

- `useDialog` 単体テスト: showModal を mock し、(a) activeElement=body で開く→復帰先 el が focus される、(b) activeElement=トリガ要素で開く→復帰先 el を focus しない（native 任せ）、を検証。
- Playwright 実測: 4ゲームの初回遊び方・終了時結果を Esc で閉じ→`document.activeElement` が body でなく h1 であることを確認（是正前=body の証拠と対比）。
