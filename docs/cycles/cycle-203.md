---
id: 203
description: B-314 Phase 8.1 第 4 弾——cycle-200/201/202 で確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）に加えて、cycle-202 で得た「結果膨張型ツールの textarea/結果欄役割分担」テンプレート（AP-P21）も活用しつつ、次のツール詳細ページの新デザイン移行 + タイル化を実施する。
started_at: 2026-05-22T09:44:11+0900
completed_at: null
---

# サイクル-203

B-314 Phase 8.1 の第 4 弾。cycle-200（char-count）/ cycle-201（byte-counter）/ cycle-202（url-encode）で確立した標準パターンに沿って、次のツール詳細ページの新デザイン移行 + タイル化を実施する。

着手対象のツール選定は cycle-planning で行う。cycle-202 のキャリーオーバーが示した方針メモは以下の通り：

- (a) 1 件継続（標準パターン 4 回目の適用）
- (b) 構造類似ペアでの並行（例: url-encode + base64 / html-entity）
- (c) hash-generator の非同期パターン（標準パターン外）への踏み込み

cycle-202 で AP-P21（固定枠 UI における「膨張側」と「操作側」同居リスクの事前評価）が新規追記されたため、第 4 弾で結果膨張型ツール（base64 / html-entity 等）を選べば AP-P21 の事後検証としても有意義。一方 hash-generator は標準パターン外への踏み込みで AP リスクが上がる。

残ツール数: `src/app/(legacy)/tools/` 配下に約 31 ディレクトリ（age-calculator / base64 / bmi-calculator / business-email / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / yaml-formatter）。

## 実施する作業

- [ ] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [ ] 着手対象ツールの選定（GA4 PV・構造単純度・AP-P21 事後検証価値・Phase 9 依存を踏まえて判断）
  - [ ] kind 判定（single / widget / multi）とタイル推奨サイズの確定
  - [ ] 計画レビュー → 指摘解消
- [ ] cycle-execution で計画に沿った実装を行う
- [ ] cycle-completion でサイクルを完了させる

## 作業計画

<plannerが立案した作業の詳細な実施計画をここに記載する。何を何のためにどのようにやるのかを具体的に書き、作業を進めながら方針が変わった場合は随時アップデートすること。>

### 目的

### 作業内容

### 検討した他の選択肢と判断理由

### 計画にあたって参考にした情報

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

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
