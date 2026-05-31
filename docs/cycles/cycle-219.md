---
id: 219
description: ツール詳細ページの新デザイン移行 + タイル化（移行計画 Phase 8.1 第 20 弾 / email-validator）
started_at: 2026-05-31T21:04:03+0900
completed_at: null
---

# サイクル-219

このサイクルでは、デザイン移行計画 Phase 8.1（ツール群の新デザイン移行 + タイル化）の第 20 弾として、`email-validator`（メールアドレス形式検証）ツールを対象に、(1) ロジック詳細ページの新トークン置換、(2) 詳細ページ（`/tools/email-validator`）の `(new)/` 配下への移行とデザイン適用、(3) 道具箱で単独完結するタイルウィジェットの実装を行う。

## 選定根拠（移行順序原則「GA4 PV 高い順 + 構造単純な順」）

未移行 15 ツール（全 27 legacy − 移行済み 20 / `__tests__` 除く）から `email-validator` を選定した。数値は **PM 実測値**（生成元併記）。T-1 で builder が独立再実測して照合する（AP-P16）。

- **未移行 15 件 / 移行済み 20 件 / legacy 総数 27 件**（実測値 / 生成元 = `comm -23 <(ls -d "src/app/(legacy)/tools/"*/ | xargs -n1 basename | sort) <(ls -d "src/app/(new)/tools/"*/ | xargs -n1 basename | sort)`）。未移行 15 件 = age-calculator / bmi-calculator / business-email / color-converter / csv-converter / date-calculator / dummy-text / **email-validator** / json-formatter / markdown-preview / number-base-converter / sql-formatter / unit-converter / unix-timestamp / yaml-formatter。
- **GA4 直近 30 日 PV（2026-05-01〜05-31 / 生成元 = GA4 property 524708437 / screenPageViews / pagePath BEGINS_WITH `/tools/`）**: 未移行 15 件は **すべて 0 PV**（観測された PV は移行済みツールのみ = keigo-reference 22 / traditional-color-palette 10 / line-break-remover 3 等）。→ 主基準「直近 30 日 PV 高い順」では未移行 15 件が並ぶため、副基準「全期間 PV + 構造単純な順」で選定する（cycle-218 と同じ判断枠組み。前サイクルは cron-parser が直近 30 日 1 PV で 1 位だったが、それも移行済みになり、残りは全件休眠）。
- **GA4 全期間 PV（2026-02-14〜05-31 / 同 property）**: 未移行 15 件のうち **sql-formatter 12 / email-validator 7 / json-formatter 4 / color-converter 3 / business-email 2 / dummy-text 2 / date-calculator 1 / number-base-converter 1 / 残り 7 件 0**。
- **構造の単純さ（実測値 / 生成元 = `wc -l` + `grep import`）**: sql-formatter は全期間最多（12）だが `logic.ts` 634 行（SQL 整形ロジック）で構造が最も重く、副基準「構造単純な順」で劣る（cycle-218 と同じ判断 = 重い構造はアーキタイプ学習効率の観点で後半に回す）。email-validator は全期間 2 位（7）かつ Component.tsx 93 行 / logic.ts 169 行 / Component.module.css 137 行の **最小規模・外部依存なし・Worker なし**で、副基準内で PV 上位かつ構造単純を両立する。json-formatter（4 / logic.ts 45 行）も軽量だが PV で email-validator に劣る。→ **email-validator が第 20 弾に最適**。
- **アーキタイプ（系統論ドラフト / T-1 で確定）**: cron-parser（cycle-218 = 入力→解析→構造化表示型 = 第 6 アーキタイプ）の派生として、メール文字列 1 本を入力 → **妥当性の真偽判定（valid/invalid）+ 不備理由 + ローカル部/ドメイン部の内訳表示**という「**入力→検証→結果表示型**」。解析系（内訳展開が主）と異なり真偽判定が主軸である点が分かれ目。新アーキタイプか cron-parser 系の一種かは T-1 で言語化する。
- **トークン/hex 実測（要 T-1 照合 / 生成元 = `grep`）**: 旧 `var(--color-*)` 系 **10 箇所**（`--color-bg`×1 / `--color-bg-secondary`×1 / `--color-border`×2 / `--color-primary`×2 / `--color-text`×2 / `--color-text-muted`×2）。**＋ hex 13 箇所**（検証結果ステータス色 = 成功 `#dcfce7`/`#166534` / エラー `#fef2f2`/`#991b1b`/`#fca5a5` / 警告 `#fde68a`/`#fefce8`/`#92400e` / 情報 `#93c5fd`/`#eff6ff`/`#1e40af`）。hex はステータス色のため cycle-211〜213 で確立した hex → セマンティックトークン（`--success`/`--danger`/`--warning`/`--accent` 系）マッピングが効く。`var(--font-mono)`×2（L24/L85）は保持（置換対象外）。
- **既存資産（実測値）**: テストは `__tests__/logic.test.ts` のみ（16 件 / `Component.test.tsx` 不存在 = 前例どおり後続 P4 起票）。logic 公開 API = `validateEmail(email): EmailValidationResult` / `parseEmailParts`。legacy 詳細ページ 3 ファイル（page.tsx / opengraph-image.tsx / twitter-image.tsx）。`tilesCount` 現在 19 → +1 = 20。

## 実施する作業

標準 4 タスク（T-1 → {T-2, T-3} → T-4）で進める。各タスクは独立 builder を想定し、依存関係（T-1 → T-2 / T-1 → T-3 / (T-2, T-3) → T-4）に従う。各タスク完了時に必ず reviewer のレビューを受け、指摘を解消してから次へ進む。詳細は次の `/cycle-planning` で確定する。

- [ ] **T-1 ベースライン撮影 + 実測 + 引用採否 + 系統論言語化**: legacy 詳細ページの Playwright baseline スクショ（w360/w1280 × light/dark + 固有状態 = 有効メール入力時の検証結果・無効メール時のエラー・パーツ内訳表示 / dark が silent-light 化していないことを実機目視 = AP-WF12）、旧トークン 10 箇所 + hex 13 箇所の独立再実測・照合、テスト件数・`Component.test.tsx` 不存在確認、`tilesCount` 実測、legacy 詳細 3 ファイル位置確認、logic 公開 API（`validateEmail` / `parseEmailParts` / 型 `EmailValidationResult`）の再利用前提照合、先行 SSoT 引用採否の機能カテゴリ並べ読み表（AP-WF14）、「入力→検証→結果表示型」アーキタイプの系統論言語化と AP-P21 計測ケース定義のドラフト。
- [ ] **T-2 詳細ページ `(legacy)`→`(new)` 移行 + デザイン適用**: 詳細ページ 3 ファイルの git mv、import パス修正、`page.module.css` 標準パターン新設（`max-width:1200px;margin:0 auto` ハードコード）、`Component.module.css` の旧トークン 10 箇所 + hex 13 箇所の置換（T-1 マッピング表ベース / セマンティックトークン化 / `--font-mono` は保持）、`trustLevel` 据え置き、視覚確認（移行前後 w360/w1280 × light/dark）。
- [ ] **T-3 タイル新規実装 + テスト + 型契約 + 登録**: `EmailValidatorTile.tsx`（`kind:"widget"` = インラインスタイルのみ）の実装、デフォルト表示の初期値（決定論的固定値で hydration-safe）、操作側（メール入力欄 + 例プリセット等 / 40px 下限）と膨張側（検証結果 + 理由 + パーツ内訳）の役割分担（AP-P21）、`EmailValidatorTile.test.tsx` 新設、meta/registry の型契約記入、`TILE_DECLARATIONS` 登録 + `generate:tiles-registry` 実行 + tilesCount +1 = 20 確認、タイル単独レンダリング検証（`/internal/tiles/preview/...` を w360/w1280 × light/dark）。
- [ ] **T-4 AP-P21 実機計測 + SSoT 書き戻し + 起票 + 完了**: 「入力→検証→結果表示型」計測ケースでの操作側 40px 下限 + 膨張側収納安定の確定、SSoT を §補足事項に書き戻し、新規 B 番号起票（Component テスト基盤 / 必要に応じてアーキタイプ N≥3 見直し等）、4 コマンド（lint / format:check / test / build）全 PASS、スクショ整理、B-314 進捗欄を「20 件目完了」に更新（完了フリップは /cycle-completion の責務）。
- [ ] 各タスクのレビュー（計画・実装 各フェーズ）と指摘事項の対応。

依存: T-1 → T-2 / T-1 → T-3 / (T-2, T-3) → T-4。

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
