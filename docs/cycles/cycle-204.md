---
id: 204
description: B-314 Phase 8.1 第 5 弾——cycle-200/201/202/203 で 4 回適用して再現性を確認した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を、次のツール詳細ページの新デザイン移行 + タイル化に適用する。着手対象ツールは cycle-planning で確定する（cycle-203 キャリーオーバー方針メモ: (a) html-entity = AP-P21 事後検証 2 件目 / (b) hash-generator = 非同期パターン初挑戦 / (c) fullwidth-converter・kana-converter = 結果膨張なし系 / (d) 構造類似ペアでの並行）。
started_at: 2026-05-22T11:53:09+0900
completed_at: null
---

# サイクル-204

B-314 Phase 8.1 の第 5 弾。cycle-200（char-count）/ cycle-201（byte-counter）/ cycle-202（url-encode）/ cycle-203（base64）で確立・再現性確認した標準パターンに沿って、次のツール詳細ページの新デザイン移行 + タイル化を実施する。

着手対象のツール選定は cycle-planning で行う。cycle-203 のキャリーオーバーが示した方針メモは以下の通り：

- (a) **html-entity**（base64 と構造類似で AP-P21 事後検証 2 件目に最適）
- (b) **hash-generator**（非同期パターン `crypto.subtle` への初挑戦）
- (c) **fullwidth-converter / kana-converter**（結果膨張なし系で標準パターンの別系統への適用確認）
- (d) **構造類似ペアでの並行**（base64 + html-entity 同時など、1 サイクル 2 件の試行）

cycle-202 で新規追加された AP-P21（固定枠 UI の「膨張側」と「操作側」同居リスク）の事後検証は cycle-203 (base64) で 1 件目を完了済。html-entity は base64 と Component 構造が酷似（モード切替×2 + textarea×2 + 変換ボタン）かつ結果膨張型のため、2 件目の事後検証として理論的に最適。cycle-planning で GA4 PV・構造単純度・AP-P21 / AP-WF16 事後検証価値・Phase 9 依存を踏まえて最終判定する。

残ツール数: `src/app/(legacy)/tools/` 配下に約 30 ディレクトリ（age-calculator / bmi-calculator / business-email / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / yaml-formatter）。

## 実施する作業

- [ ] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [ ] 着手対象ツールの選定（GA4 PV・構造単純度・AP-P21 / AP-WF16 事後検証価値・Phase 9 依存を踏まえて判断）
  - [ ] kind 判定（single / widget / multi）とタイル推奨サイズの確定
  - [ ] 計画レビュー → 指摘解消
- [ ] cycle-execution で計画に沿った実装を行う
  - [ ] T-1: 現状把握と移行前 baseline 取得
  - [ ] T-2: 詳細ページの (new) 配下移行
  - [ ] T-3: タイル定義（kind 判定 + タイル用コンポーネント実装）
  - [ ] T-4: 検証と統合確認（AP-P21 / AP-WF16 事後検証含む）
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

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
