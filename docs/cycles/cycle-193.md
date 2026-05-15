---
id: 193
description: B-314（Phase 7 全体統括）第 1 弾 = 基盤再構築のやり直し。cycle-191/192 の 2 サイクル連続失敗（constitution / DESIGN.md / docs/design-migration-plan.md / cycle-kickoff 手順 / アンチパターン集の core ルールをすべて無視）を受け、全コード成果物 revert 後のクリーンな状態から、新版共通コンポーネント群 / TileVariant + tile-loader / `/internal/tiles` 検証ページ / Tile.large-full.tsx を含むタイル各サイズ規格を、Panel/Button ベース + CSS Grid サイズ規格 (large=2×2 / medium=2×1 / small=1×1) + DnD + モバイルフォールバックすべて core 統合した形で再設計・再実装する。
started_at: 2026-05-16T01:10:45+0900
completed_at: null
---

# サイクル-193

このサイクルでは B-314（P1、Phase 7 全体統括）の **第 1 弾 = 基盤再構築** に取り組む。cycle-191 / cycle-192 が 2 サイクル連続で「コンパイル通過・200 OK・テキスト表示」を「動く」と判定して core ルールを無視した結果、`docs/cycles/cycle-192.md` の事故報告にある通り設計や要件は 1 つも満たせていなかった。両サイクルの全コード成果物は revert 済みであり、本サイクルはそのクリーンな状態から `docs/cycles/cycle-192.md` の「次サイクルへの申し送り」に沿って立て直しを行う。

本サイクル第 1 弾の対象範囲（再構築する基盤）:

- **新版共通コンポーネント 9 個**: AccordionItem / PrivacyBadge / ResultCopyArea / ToolDetailLayout / IdentityHeader / TrustSection / LifecycleSection / ToolInputArea / useToolStorage を、DESIGN.md §1「すべてのコンテンツはパネルに収まった形で提供される」を core intent として Panel/Button ベースで再設計
- **TileVariant 型 + tile-loader 拡張**: large / medium / small + large-full の各バリアントを load する基盤。Tile.large-full.tsx を含めて「ツール詳細ページ = `Tile.large-full.tsx` 設置場所」core intent を実装で実現
- **`/internal/tiles` 検証ページ**: CSS Grid サイズ規格 (large=2×2 / medium=2×1 / small=1×1) を実機で満たすこと / モバイルでの横はみ出しゼロ / DnD 機能の動作 / フォールバック設計 を全件検証可能な形で構築
- **タイル各サイズ規格の参考実装**: keigo-reference の large-full / medium / small の 3 バリアントすべてを実装し、`/internal/tiles` で要件充足を実機計測で確認

Phase 7 全体（残 32 ツール + 20 遊びの 1 コンテンツ 1 サイクル移行）は本サイクル完了後の後続サイクルで継続する。本サイクルは「基盤の完成度を core 統合まで上げ切る」ことに専念し、scope creep を厳しく禁じる。

## 実施する作業

> 本セクションは `/cycle-planning` フェーズで planner が詳細化する。現時点では大枠のみ:

- [ ] 計画段階の必須 Read（cycle-192.md 事故報告 + 申し送り / DESIGN.md / `frontend-design` スキル / docs/design-migration-plan.md Phase 7 / docs/anti-patterns/ 全件 / cycle-180 + design-migration-plan.md L298 TrustLevelBadge 全廃方針 / `docs/targets/` ペルソナ要件）
- [ ] T-A 設計（新版共通コンポーネント 9 個 + TileVariant + Tile.large-full.tsx + `/internal/tiles` 検証要件 + DnD / モバイルフォールバック仕様 を Panel/Button ベース + CSS Grid サイズ規格に統合した設計書をゼロベースで起こす）
- [ ] T-B〜T-X 実装 / 検証（T-A 設計で確定した粒度に従って分割）
- [ ] T-視覚回帰（`/internal/tiles` の実機計測で CSS Grid サイズ規格 / モバイル横はみ出しゼロ / DnD 動作 / フォールバック動作 を全件確認）
- [ ] T-品質保証（lint / format / test / build 全成功 + 設計書要件チェックリスト全項目 ✓）
- [ ] T-申し送り（Phase 7 第 2 弾以降に渡す候補コンテンツの選定材料整理。確定は次サイクル kickoff で）

## 作業計画

<!-- `/cycle-planning` フェーズで planner が詳細を記入する。 -->

### 目的

### 作業内容

### 検討した他の選択肢と判断理由

### 計画にあたって参考にした情報

## レビュー結果

<!-- 作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。 -->

## キャリーオーバー

<!-- このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。後送り項目は独立した B-XXX 起票（Notes 押し込めを避ける）。 -->

## 補足事項

### cycle-192 申し送りで継承する構造的歯止め（計画書に必ず組み込むこと）

1. **計画段階レビュー打ち切り基準を「致命的・重要・軽微すべてゼロ」に固定**（「反復膨張回避」を理由とする打ち切りを禁止）
2. **T-A 設計の Done 条件に「DESIGN.md / frontend-design / docs/design-migration-plan.md 全文 Read 後に書く」を含める**
3. **T-視覚回帰の対象に「本サイクルで作った検証ページ + 本サイクルで触ったコンテンツ + 依存している基盤すべて」を含める**
4. **「動く」判定基準を「設計書要件チェックリスト全項目 ✓」に固定**（コンパイル / 200 OK / テキスト表示では「動く」と判定しない）
5. **過去サイクル PM 判定の継承前に必ず実機検証**

### cycle-191/192 から継承しない運用 / 判断

- 計画段階レビュー r1 / r2 打ち切り運用
- 「来訪者影響顕在化の有無」を後送り判断軸とする運用（AP-WF15 違反、基盤責務の観点が抜ける）
- 「Phase D 絶対境界」のような後付けスコープ縮小
- 「タイル非埋め込み」判断（cycle-191 L1733 / cycle-192 T-A 案 D-2、設計書 core intent と矛盾）

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
