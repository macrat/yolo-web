# cycle-289 レビュー経過ログ

正本は index.md。本書はレビューの経過と処遇のみを残す。

## 1巡目（reviewer・実装初版 65b9ada6 を対象）

- **指摘（Major）**: 復帰アンカーの h1 はページ最上部にあるため、スクロール状態で開く Result モーダルを閉じると、native focus 復帰（当時は素の `focus()`）でページが最上部へジャンプする。晴眼マウス利用者（背景クリック/閉じるボタン）にも波及。「視覚不変」の主張が不正確で、Result close 経路が未実測。
- **良い点**: 共有 useDialog 一点是正の方針・close 経路順序非依存の機構・手動起動の素通し・4ゲーム配線の一貫性・テストの要点把握を評価。

### 対応（コミット 30459fc3）

機構を実ブラウザで実測して原因を切り分け:

- native の close 復帰は**スクロールしない**（実 h1 を previously-focused にして scrollY=2523 から close→focus は h1・scrollY 2523 維持）。
- スクロールは open 時の素の `focus()` のみで発生（実 h1 で 2523→150）。`focus({preventScroll:true})` は 2523 維持。

→ showModal 直前のアンカー focus を **`focus({ preventScroll: true })`** に変更（一点）。focus 保持とスクロール位置保持を両立。
Result 実フローも実測（6回誤答で敗北誘導→Result 自動オープン→scrollY=2000 から Esc 閉じ→focus=h1・scrollY 2000 維持）。
ドキュメント（index.md「Playwright 実測結果」節・design-decision.md 決定2）を実測に合わせ訂正。単体テストに preventScroll 検証を追加（計8件）。

## 2巡目（新規 reviewer・白紙・実装 65b9ada6+30459fc3 を対象）

AP-WF20 に従い、前回指摘・経緯を渡さず新規 reviewer をゼロから起動。

- **結果: Blocker/Major なし・コードは承認水準**。reviewer 自身が localhost:3000 で実挙動を追検証し、(1) 自動オープン遊び方の Esc 閉じ→h1 復帰、(2) 手動起動→起動元ボタン復帰＝退行なし、(3) focus インジケータ可視、(4) Result 経路は game-over で GuessInput が disabled→同期 blur→body になるため h1 リダイレクトが確実に発火、を確認。4ゲーム配線一致・テスト8件通過・tsc 通過も確認。
- **指摘（Minor/Nit・すべてドキュメント整合）**:
  - Minor1: index.md の検証行に「Result は単体テスト＋遊び方実測で担保」という実測追加前の古い記述が残り、同ファイルの Result 実測記録と矛盾 → 実測済みに更新。
  - Nit2: 「詳細は playwright-verification 節」が実在見出し「Playwright 実測結果」と不一致 → 節名を修正。
  - Nit3: build「確認中」表記・チェックボックス未了 → build 実行済み（exit 0）を記録・チェック。

### 対応

上記 Minor/Nit をすべて index.md で訂正済み。**コード変更はなし（ドキュメント整合のみ）**。2巡目でコードは承認水準に達しており、以後の変更が index.md のドキュメント整合に限られるため、3巡目の全面コードレビューは行わない（PM 判断）。
