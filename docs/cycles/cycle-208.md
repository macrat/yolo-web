---
id: 208
description: B-314 Phase 8.1 第 9 弾として kana-converter（ひらがな・カタカナ変換）のタイル化と (new)/tools/ 配下への詳細ページ移行を行う。cycle-200〜207 で 8 回適用済みの標準パターンを継続し、fullwidth-converter（cycle-206）と構造類似の「textarea×2 + 膨張ゼロ型」3 件目として通常運用を積み重ねる。
started_at: 2026-05-23T16:25:11+0900
completed_at: null
---

# サイクル-208

このサイクルでは、`B-314`（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8）の **第 9 弾**として `kana-converter`（ひらがな・カタカナ変換）を扱う。cycle-200〜207 で標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行）が 8 回適用済みで、直近の cycle-207（qr-code）が画像 / SVG 出力型 + rows=3 + リアルタイム化と構造的新規性 3 つを同時に扱った重い回だったため、本サイクルは **構造差分の小さい通常運用の積み重ね**として位置づける。

来訪者にとっての価値は「ひらがなで書いた文字列をカタカナに、またはカタカナで書いた文字列をひらがなに、ワンステップで変換する」一点。日本語入力 / 校正 / 振り仮名作成 / 表記統一など『日常の傍にある道具』として頻度の高い実用ツールであり、新デザイン移行とタイル化の両側に直接価値を持つ。

構造的位置づけ:

- **textarea×2 双方向 / 膨張ゼロ型 3 件目**: cycle-206（fullwidth-converter）と同じく入力 1 + 出力 1 の対称構造で、結果が入力と同サイズに収まる「膨張ゼロ型」。AP-P21 textarea 高さ計測 4 ケースのうち「結果膨張」枠は今回も不要。kana-converter は変換規則がひらがな ↔ カタカナの 1:1 マッピングなので、文字数も常に一致する。
- **オプション選択**: 「ひらがな → カタカナ」「カタカナ → ひらがな」の方向セグメント 1 つのみ（fullwidth-converter の「半角 → 全角 / 全角 → 半角」と同型）。タイル UI 収納方法は cycle-206 で確定した方式の踏襲を第一候補とし、計画段階で AP-P17 ゼロベース 3 案比較で確認する。
- **rows=2 タイル**: cycle-207 で初導入した rows=3 ではなく、rows=2 の標準形に戻る。Phase 10.1 ダッシュボード設計時の比較データとして rows=2 / rows=3 の両方の運用実績を積むことが重要。

## 実施する作業

- [ ] T-1: 現状把握と移行前 baseline 取得（kana-converter のファイル構成 / 旧トークン箇所 / `logic.ts` export / 既存テスト / `TILE_DECLARATIONS` 件数を grep 実測で確認、Playwright で baseline 撮影、既存テストが緑であることの確認）
- [ ] T-2: 詳細ページの `(new)/tools/kana-converter/` 配下への移行（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイルを `git mv` で移動 + `page.module.css` 新設 / 1200px max-width 標準パターン / `Component.module.css` の旧トークンを新トークンに置換 / T1 yaml の search_intents 棚卸し）
- [ ] T-3: タイル定義（`src/tools/kana-converter/KanaConverterTile.tsx` などタイル UI 一式を新規実装、`kind=widget` / rows=2 標準形 / 方向セグメント / AP-P21 役割分担 / `TILE_DECLARATIONS` へのエントリ追加 / `npm run generate:tiles-registry` 再生成 / タイル用テスト追加）
- [ ] T-4: 検証と統合確認（Playwright 視覚回帰 + AP-P21 textarea 高さ 4 ケース計測 + AP-WF16 reviewer 独立再実行 / baseline + tiles-preview + after の各種スクリーンショット / `lint` / `format:check` / `test` / `build` の 4 コマンド全件 reviewer 独立再実行）

詳細なタスク分解と作業計画は `/cycle-planning` フェーズで具体化する。

## 作業計画

`/cycle-planning` フェーズで記入する。

## レビュー結果

作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。

## キャリーオーバー

- このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと `/docs/backlog.md` の両方に記載する。

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
