---
id: 209
description: B-314 Phase 8.1 第 10 弾として line-break-remover（改行削除）のタイル化と (new)/tools/ 配下への詳細ページ移行を行う。cycle-200〜208 で 9 回適用済みの標準パターンを継続しつつ、3 モード（remove / replace-space / smart-pdf）+ smart-pdf 内サブオプション（joinStyle: remove/space）の 2 階層オプション構造を初導入する通常運用継続フェーズ 3 回目として位置付ける。
started_at: 2026-05-25T13:09:10+0900
completed_at: null
---

# サイクル-209

このサイクルでは、`B-314`（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8）の **第 10 弾**として `line-break-remover`（改行削除）を扱う。cycle-200〜208 で 9 回適用済みの標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行）を継続し、cycle-207（qr-code）の重い回 → cycle-208（kana-converter）の通常運用継続成功のリズムを引き継ぐ **通常運用継続フェーズ 3 回目**として位置付ける。

来訪者にとっての価値は「PDF・メール・チャットからコピペしたテキストの不要な改行をワンステップで除去する」一点。論文 PDF からのコピペ、メール返信時の引用整形、Word/Excel からの貼り付け整形など『日常の傍にある道具』として頻度の高い実用ツールであり、新デザイン移行とタイル化の両側に直接価値を持つ。

構造的位置づけ:

- **textarea×2 双方向 / 3 モード混在型**: cycle-206（fullwidth-converter）/ cycle-208（kana-converter）と同じく入力 1 + 出力 1 の対称構造。3 モード（`remove` = 純粋削除 / `replace-space` = 改行→スペース置換 / `smart-pdf` = PDF 整形ヒューリスティック）を持ち、結果の膨張特性が混在: `remove` は膨張ゼロ（改行 1 文字削除のみ）、`replace-space` も実質膨張ゼロ（改行 1 → スペース 1 の 1:1 置換）、`smart-pdf` は基本縮小型（改行削除 + 結合）。AP-P21 textarea 高さ計測 4 ケースは膨張ゼロ型として cycle-206 / cycle-208 と同じ枠組で実施可能。
- **2 階層オプション構造（本サイクル新規性）**: `smart-pdf` モードが選択された場合のみ表示される `joinStyle`（`remove` / `space`）サブオプションを持つ。これまでの cycle-200〜208 は単一階層のオプション（方向セグメント 1 つ等）のみで、2 階層オプションをタイル UI に収めるのは本サイクルが初。Phase 10.1 ダッシュボード設計時の「条件付き表示オプション」の実証データとして価値が高い。
- **rows=2 タイル**: cycle-207 の rows=3 ではなく、cycle-208 と同じく rows=2 の標準形を踏襲予定（最終確定は計画段階の AP-P17 ゼロベース 3 案比較で決定）。
- **cycle-208 IME composition 観察結果の参照可能性**: cycle-208 補足事項で「kana-converter 実機観察結果を踏まえた『軽量同期テキスト処理 + textarea×2 構造には debounce 不要』」を引用可能と明記されている。本サイクル計画段階の debounce 要否判断で根拠として活用予定。

## 実施する作業

- [ ] T-1: 現状把握と移行前 baseline 取得（line-break-remover のファイル構成 / 旧トークン箇所 / `logic.ts` export / 既存テスト / `TILE_DECLARATIONS` 件数を grep 実測で確認、Playwright で baseline 撮影、既存テストが緑であることの確認）
- [ ] T-2: 詳細ページの `(new)/tools/line-break-remover/` 配下への移行（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイルを `git mv` で移動 + `page.module.css` 新設 / 1200px max-width 標準パターン / `Component.module.css` の旧トークンを新トークンに置換 / T1 yaml の search_intents 棚卸し）
- [ ] T-3: タイル定義（`src/tools/line-break-remover/LineBreakRemoverTile.tsx` などタイル UI 一式を新規実装、`kind=widget` / rows=2 標準形（計画 AP-P17 で最終確定） / 3 モードセグメント + smart-pdf サブオプションの 2 階層表示 / AP-P21 役割分担 / `TILE_DECLARATIONS` へのエントリ追加 / `npm run generate:tiles-registry` 再生成 / タイル用テスト追加）
- [ ] T-4: 検証と統合確認（Playwright 視覚回帰 + AP-P21 textarea 高さ 4 ケース計測 + AP-WF16 reviewer 独立再実行 / baseline + tiles-preview + after の各種スクリーンショット / `lint` / `format:check` / `test` / `build` の 4 コマンド全件 reviewer 独立再実行）

詳細なタスク分解と作業計画は `/cycle-planning` フェーズで具体化する。

## 作業計画

plannerが立案した作業の詳細な実施計画をここに記載する。何を何のためにどのようにやるのかを具体的に書き、作業を進めながら方針が変わった場合は随時アップデートすること。

### 目的

### 作業内容

### 検討した他の選択肢と判断理由

### 計画にあたって参考にした情報

## レビュー結果

作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。

## キャリーオーバー

- このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。

## 補足事項

なし

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
