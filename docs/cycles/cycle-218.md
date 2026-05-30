---
id: 218
description: ツール詳細ページの新デザイン移行 + タイル化（移行計画 Phase 8.1 第 19 弾 / cron-parser）
started_at: 2026-05-30T16:01:03+0900
completed_at: null
---

# サイクル-218

このサイクルでは、デザイン移行計画 Phase 8.1（ツール群の新デザイン移行 + タイル化）の第 19 弾として、`cron-parser`（cron 式パーサー）ツールを対象に、(1) ロジック詳細ページの新トークン置換、(2) 詳細ページ（`/tools/cron-parser`）の `(new)/` 配下への移行とデザイン適用、(3) 道具箱で単独完結するタイルウィジェットの実装を行う。

## 選定根拠（移行順序原則「GA4 PV 高い順 + 構造単純な順」）

未移行 16 ツール（全 34 − 移行済み 18）から `cron-parser` を選定した。根拠は以下（数値は **PM 実測値** / 生成元併記。T-1 で builder が独立再実測して照合する = AP-P16）。

- **移行済み 18 件 / 未移行 16 件**（実測値 / 生成元 = `comm -23 <(ls src/tools/*/ ...) <(ls "src/app/(new)/tools/"*/)`）。未移行 16 件 = age-calculator / bmi-calculator / business-email / color-converter / **cron-parser** / csv-converter / date-calculator / dummy-text / email-validator / json-formatter / markdown-preview / number-base-converter / sql-formatter / unit-converter / unix-timestamp / yaml-formatter。
- **GA4 直近 30 日 PV（2026-04-30〜05-30 / 生成元 = GA4 property 524708437 / screenPageViews / pagePath BEGINS_WITH `/tools/`）**: 未移行 16 件のうちトラフィックが観測されたのは **cron-parser = 1 PV のみ**で、残り 15 件はすべて 0 PV。→ 確立した移行順序の主基準「直近 30 日 PV 高い順」（cycle-216 / 217 と同じ窓）で **cron-parser が未移行中 1 位**。
- **GA4 全期間 PV（2026-02-14〜05-30 / 同 property）での裏取り**: 未移行 16 件は sql-formatter 12 / email-validator 7 / **cron-parser 5** / json-formatter 4 / color-converter 3 / 他 11 件 0〜2。cron-parser は全期間でも 3 位とトラフィック群に残る（直近 30 日 1 位の数字がノイズではないことの裏付け）。sql-formatter は全期間最多だが直近 30 日 0（休眠）かつ SQL 整形ロジックで構造が重く、副基準「構造単純な順」で劣る。
- **構造の単純さ（実測値 / 生成元 = `src/tools/cron-parser/`）**: Worker・重依存なし（logic.ts は自己完結の純 TS / Component.tsx は `./Component.module.css` と react のみ import）。単一の cron 式入力 → 人間可読スケジュール + 次回実行時刻リスト + フィールド内訳という「**入力 → 解析 → 構造化表示型**」。ファイル規模 = Component.tsx 372 行 / logic.ts 458 行 / Component.module.css 241 行。テストは `__tests__/logic.test.ts` のみ（Component.test.tsx 不存在 = 前例どおり / 後続 P4 で起票予定）。
- **旧トークン実測（要 T-1 照合 / 生成元 = `grep -oE "var\(--color-[a-z-]+" src/tools/cron-parser/Component.module.css | sort | uniq -c`）**: 9 種 41 箇所 = `--color-primary`×12 / `--color-text`×8 / `--color-border`×7 / `--color-bg`×4 / `--color-bg-secondary`×4 / `--color-text-muted`×2 / `--color-error`×2 / `--color-error-bg`×1 / `--color-primary-hover`×1。**＋ `#fff`×2 箇所**（L34 / L83 / 要 T-1 で適用先確認）。フォールバック形式・hex 単体は単純 sed で漏れる点を T-2 への注意事項とする。

## 実施する作業

標準 4 タスク（T-1 → {T-2, T-3} → T-4）で進める。各タスクは独立 builder を想定し、依存関係（T-1 → T-2 / T-1 → T-3 / (T-2, T-3) → T-4）に従って進める。各タスク完了時に必ず reviewer のレビューを受け、指摘を解消してから次へ進む。

- [ ] **T-1 ベースライン撮影 + 実測 + 引用採否 + 系統論言語化**: legacy 詳細ページの Playwright baseline スクショ（w360 / w1280 × light / dark + cron 式入力・解析結果・次回実行時刻表示等の固有状態 / dark が silent-light 化していないことを実機目視 = AP-WF12 / B-463 修正済み手順）、旧トークン/hex の grep 実測内訳の独立再実測・照合（PM 提示の 9 種 41 箇所 + `#fff`×2 を照合）、テスト件数・`Component.test.tsx` 不存在確認、`tilesCount` 実測、legacy 詳細ページ位置（page.tsx / opengraph-image.tsx / twitter-image.tsx の有無）確認、**先行 SSoT 引用採否の機能カテゴリ並べ読み表（AP-WF14）**作成、**「入力→解析→構造化表示型」が既存アーキタイプ（変換・生成系 / 参照・検索型 / 色選択→配色生成型 等）のどれに該当するか・新アーキタイプか**の系統論言語化と AP-P21 計測ケース定義のドラフト。
- [ ] **T-2 詳細ページ `(legacy)`→`(new)` 移行 + デザイン適用**: 詳細ページ関連ファイル（page.tsx / opengraph-image.tsx / twitter-image.tsx）の git mv、import パス修正、`page.module.css` 標準パターン新設（`max-width:1200px;margin:0 auto` ハードコード）、`Component.module.css` の旧トークン置換（T-1 実測マッピング表ベース / フォールバック形式・hex 単体の漏れに注意 / `#fff` の置換先は T-1 で確認）、`trustLevel` は据え置き（B-432 で全 34 ツール完了後に一括削除 = cycle-217 確立方針）、視覚確認（移行前後 w360/w1280 × light/dark）。
- [ ] **T-3 `CronParserTile.tsx` 新規実装 + テスト + 型契約 + 登録**: タイル中核機能（来訪者価値最大化 / `kind:"widget"` = CSS Module 不可・インラインスタイルのみ）の実装、デフォルト表示の初期 cron 式（決定論的固定値での即時表示 = hydration-safe / おまかせ初期表示が必要な場合は cycle-217 c217-δ「SSR 固定初期値 + useEffect 差し替え」形を引用 / ただし cron デフォルトは決定論的固定で済むため B-469 系の乱数 hydration 問題とは無関係）、操作側（cron 式入力 + 例プリセット等 / 40px 下限）と膨張側（解析結果・次回実行時刻リスト）の役割分担（AP-P21）、`CronParserTile.test.tsx` 新設、meta/registry の型契約記入、`TILE_DECLARATIONS` 登録 + `generate:tiles-registry` 実行 + tilesCount +1 確認、タイル単独レンダリング検証（`/internal/tiles/preview/...` を w360/w1280 × light/dark）。
- [ ] **T-4 AP-P21 実機計測 + SSoT 書き戻し + 起票 + 完了**: 「入力→解析→構造化表示型」計測ケースでの操作側 40px 下限 + 膨張側収納安定 + (v) 変化率の適用可否確定、SSoT を §補足事項に書き戻し、Component テスト基盤整備の新規 B 番号起票（前例 B-467 系）、4 コマンド（lint / format:check / test / build）全 PASS（B-466 留意 = `tmp/` 配下 `.ts` が typecheck/build を壊さないこと）、スクショ整理、B-314 進捗欄を「19 件目完了」に更新（完了フリップは /cycle-completion の責務）。
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
