---
id: 202
description: B-314 Phase 8.1 第 3 弾——cycle-200/201 で確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を踏襲して、次のツール詳細ページの新デザイン移行 + タイル化を実施する。
started_at: 2026-05-22T07:21:04+0900
completed_at: null
---

# サイクル-202

B-314 Phase 8.1 の第 3 弾。cycle-200（char-count）と cycle-201（byte-counter）で確立した標準パターンに沿って、次のツール詳細ページの新デザイン移行 + タイル化を実施する。

着手対象のツール選定は cycle-planning で行う。前サイクル(201) のキャリーオーバー方針として「次サイクルは hash-generator / base64 等の小規模ツールから着手予定」が示されているが、GA4 PV / 構造単純度 / Phase 9 依存などを踏まえて最終判断する。

残ツール数の現状: `src/app/(legacy)/tools/` 配下に約 32 ディレクトリ（age-calculator / base64 / bmi-calculator / business-email / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / url-encode / yaml-formatter）。

## 実施する作業

- [ ] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [ ] 着手対象ツールの選定（GA4 PV・構造単純度・Phase 9 依存を踏まえて判断）
  - [ ] kind 判定 (single / widget / multi) とタイル推奨サイズの確定
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

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
