---
id: 133
description: "play系コンテンツ内の回遊導線再設計（クイズ結果後の推薦配置改善・静的結果ページCTA改善・ゲームResultModalへのCrossCategoryBanner追加）"
started_at: "2026-03-30T14:34:32+0900"
completed_at: null
---

# サイクル-133

B-231の分析とB-233の導線追加を踏まえ、play系コンテンツ内部の回遊導線を再設計する。設計書 `docs/2026-03-29-play-navigation-redesign.md` の施策2・3に基づき、(1) クイズ結果表示後のRelatedQuizzes/RecommendedContentをFAQ前に移動してCSSフェーズ連動で表示制御、(2) 静的結果ページのCTAにコスト感訴求を追加、(3) ゲームResultModal内にCrossCategoryBannerを追加して他カテゴリへの導線を新設する。

## 実施する作業

- [ ] 1. 既存コードの調査（クイズ結果表示フロー、静的結果ページ、ゲームResultModal、設計書の詳細確認）
- [ ] 2. クイズ結果表示後のRelatedQuizzes/RecommendedContent配置改善
- [ ] 3. 静的結果ページのCTA改善（コスト感訴求追加）
- [ ] 4. ゲームResultModal内のCrossCategoryBanner追加
- [ ] 5. ビジュアル確認（Playwright）
- [ ] 6. レビュー・修正

## 作業計画

`/cycle-planning` フェーズで記入する。plannerが立案した作業の詳細な実施計画をここに記載する。

### 目的

### 作業内容

### 検討した他の選択肢と判断理由

### 計画にあたって参考にした情報

## レビュー結果

## キャリーオーバー

## 補足事項

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
