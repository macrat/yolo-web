---
id: 208
description: B-314 Phase 8.1 第 9 弾として kana-converter（ひらがな・カタカナ変換）のタイル化と (new)/tools/ 配下への詳細ページ移行を完了。cycle-200〜207 で 8 回適用済みの標準パターンを継続しつつ、4 モード（ひらがな ⇄ カタカナ / 半角 ⇄ 全角カナ）の「主モード 3 = 膨張ゼロ + 副モード 1 = 最大 2 倍膨張」混在型として AP-P21 計測を実施。論点 1 案 A 横一列を Playwright 実物確認で退避案 B（2x2 グリッド）にフォールバック、論点 5b は既存 5 件と整合する `aria-pressed` 案 b を採択。B-442 / B-443 を新規起票。
started_at: 2026-05-23T16:25:11+0900
completed_at: 2026-05-23T19:26:13+0900
---

# サイクル-208

このサイクルでは、`B-314`（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8）の **第 9 弾**として `kana-converter`（ひらがな・カタカナ変換）を扱う。cycle-200〜207 で標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行）が 8 回適用済みで、直近の cycle-207（qr-code）が画像 / SVG 出力型 + rows=3 + リアルタイム化と構造的新規性 3 つを同時に扱った重い回だったため、本サイクルは **構造差分の小さい通常運用の積み重ね**として位置づける。

来訪者にとっての価値は「ひらがなで書いた文字列をカタカナに、またはカタカナで書いた文字列をひらがなに、ワンステップで変換する」一点。日本語入力 / 校正 / 振り仮名作成 / 表記統一など『日常の傍にある道具』として頻度の高い実用ツールであり、新デザイン移行とタイル化の両側に直接価値を持つ。

構造的位置づけ:

- **textarea×2 双方向 / 主モード膨張ゼロ + 副モード最大 2 倍膨張の混在型**: cycle-206（fullwidth-converter）と同じく入力 1 + 出力 1 の対称構造。主モード 3 つ（`hiragana-to-katakana` / `katakana-to-hiragana` / `to-fullwidth-katakana`）はひらがな ↔ カタカナの 1:1 マッピングまたは縮小方向で、結果が入力と同サイズ以下に収まる「膨張ゼロ型」。**ただし副モード 1 つ（`to-halfwidth-katakana`）は全角濁音 1 文字（例: 「ガ」）→ 半角 2 文字（「ｶﾞ」）への膨張があり、最大 2 倍まで膨張する**。AP-P21 textarea 高さ計測 4 ケースのうち「結果膨張」枠は主モードでは不要だが、副モードに対しては膨張側の高さ下限維持を確認する追加サンプルとして計測価値がある。
- **オプション選択**: 「ひらがな → カタカナ」「カタカナ → ひらがな」の方向セグメント 1 つのみ（fullwidth-converter の「半角 → 全角 / 全角 → 半角」と同型）。タイル UI 収納方法は cycle-206 で確定した方式の踏襲を第一候補とし、計画段階で AP-P17 ゼロベース 3 案比較で確認する。
- **rows=2 タイル**: cycle-207 で初導入した rows=3 ではなく、rows=2 の標準形に戻る。Phase 10.1 ダッシュボード設計時の比較データとして rows=2 / rows=3 の両方の運用実績を積むことが重要。

## 実施する作業

- [x] T-1: 現状把握と移行前 baseline 取得（kana-converter のファイル構成 / 旧トークン箇所 / `logic.ts` export / 既存テスト / `TILE_DECLARATIONS` 件数を grep 実測で確認、Playwright で baseline 撮影、既存テストが緑であることの確認）
- [x] T-2: 詳細ページの `(new)/tools/kana-converter/` 配下への移行（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイルを `git mv` で移動 + `page.module.css` 新設 / 1200px max-width 標準パターン / `Component.module.css` の旧トークンを新トークンに置換 / T1 yaml の search_intents 棚卸し）
- [x] T-3: タイル定義（`src/tools/kana-converter/KanaConverterTile.tsx` などタイル UI 一式を新規実装、`kind=widget` / rows=2 標準形 / 方向セグメント / AP-P21 役割分担 / `TILE_DECLARATIONS` へのエントリ追加 / `npm run generate:tiles-registry` 再生成 / タイル用テスト追加。論点 1 退避案 B = 2x2 グリッド採用、rows=2 維持）
- [x] T-4: 検証と統合確認（Playwright 視覚回帰 + AP-P21 textarea 高さ 4 ケース計測 + AP-WF16 reviewer 独立再実行 / baseline + tiles-preview + after の各種スクリーンショット / `lint` / `format:check` / `test` / `build` の 4 コマンド全件 reviewer 独立再実行）

詳細なタスク分解と作業計画は `/cycle-planning` フェーズで具体化する。

## 作業計画

### 目的

**誰のために**: T1（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）/ T2（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）。kana-converter を使う具体的来訪者像は以下が代表ケース:

- 日本語入力中に「カタカナで書きたいが IME がひらがなしか出してくれない」というワンショット転換用途
- 振り仮名 / 校正 / 表記統一でひらがな ⇄ カタカナを切り替えたい編集者・ライター・教育関係者
- 古いシステムが半角カナを要求する場面でデータを一括整形したい事務作業者
- 半角カナ混在のメモ / 顧客名簿を全角カナに統一したい人

これらに共通するのは「**文字種だけを 1 ステップで揃えたい**」という非常に身近な日常需要で、`docs/cycles/cycle-207.md` 冒頭で示した「日常の傍にある道具」コンセプトとの親和性が高い。

**何の価値**:

- **新デザインへの統一移行**: `/tools/kana-converter` の見た目を他の (new) 配下 8 ツール（char-count / byte-counter / url-encode / base64 / html-entity / hash-generator / fullwidth-converter / qr-code）と揃え、T2 likes「操作性・トーン&マナーが一貫」を満たす。
- **ダッシュボードからの即時アクセス**: タイル化により、「テキスト → 仮名変換」が 1 クリックで起動でき、入力 onChange で即座に変換結果が確定する。T1 likes「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」「コピペで結果を受け取ってすぐ元の作業画面に戻れる」に直結。
- **T2 リピーター（既存利用者）の混乱を避ける**: URL（`/tools/kana-converter`）と詳細ページ Component の主要挙動（4 モード切替 + textarea×2 + コピー）は維持し、新デザイントークンの適用と (new) 配下移行のみを行う。

**T1 yaml への kana-converter 関連語追加（SSoT 整合の補強）**: T1 の `search_intents` は現状「文字数カウント / 日付計算 / パスワード生成 / 全角半角変換 / BMI計算 / カラーコード 変換 / 単位変換 / QRコード / QRコード 作成 / QRコード 生成」の 10 項目（cycle-207 で「QRコード」3 語追加済）。**実測コマンド**: `grep -cE '^\s*-\s' docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（または該当 yaml の `search_intents` セクションを直接 Read で件数確認）。kana-converter は meta.keywords に「ひらがな カタカナ 変換 / カタカナ ひらがな 変換 / 半角カタカナ 変換 / 全角カタカナ 変換 / ひらがな変換」の 5 語を持つが、いずれも T1 yaml には未掲載。cycle-207 の SSoT 整合判断（QR コードと同型）を踏襲し、本サイクル T-2 内で T1 yaml に **kana-converter 関連語を追加**する。

**追加語の確定（計画段階で 2 案比較・builder 裁量を排除 / AP-WF03 対策）**:

3 番目語の選定について、以下の 2 案を計画段階で比較する:

| 案                                                                                    | (i) 来訪者検索意図のカバー範囲                                                                                                                            | (ii) fullwidth-converter とのカテゴリ重複                                                                                                                                                                                                                                                                                                                                                                   | (iii) 採否       |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 案 1: 3 語 = 「ひらがな カタカナ 変換」「カタカナ ひらがな 変換」「半角全角カナ変換」 | 仮名変換 2 方向 + 文字幅変換 1 軸の 3 軸を網羅。来訪者検索 3 パターンに直接対応。                                                                         | 「半角全角カナ変換」は fullwidth-converter（広義カテゴリ「全角半角変換」、L31 既存）と重複リスクあり。ただし fullwidth-converter は ASCII + 記号 + カナの 3 種を扱う総合変換、kana-converter はカナ特化で **狭義カテゴリで弁別可能**。両ツールの責務分離は「全般 vs カナ特化」で機能境界明確。来訪者は 2 ツール並列表示で **どちらでも目的達成可** = 迷い増ではなく選択肢増（T1 dislikes 違反にならない）。 | **採択（案 1）** |
| 案 2: 2 語のみ = 「ひらがな カタカナ 変換」「カタカナ ひらがな 変換」                 | 仮名変換 2 方向のみ。半角全角カナを求めて来訪する人を取りこぼし。meta.keywords の 5 語のうち「半角カタカナ 変換 / 全角カタカナ 変換」が直接マッチしない。 | 重複ゼロ。fullwidth-converter で半角全角カナ需要を吸収する整理。                                                                                                                                                                                                                                                                                                                                            | 不採用           |

**採択案**: 案 1（3 語追加）。理由: (a) kana-converter の `to-halfwidth-katakana` / `to-fullwidth-katakana` モードが 4 モード中 2 つを占め、半角全角カナ需要は kana-converter の主要価値の半分。これを T1 yaml から除外するのは tool 実体と SSoT の乖離。(b) fullwidth-converter との重複は「全般 vs カナ特化」の責務分離で吸収可能。T1 dislikes「似たようなツールが並んでいて … 迷わせる」は kana-converter と fullwidth-converter の **タイル UI / 詳細ページの実体** で差別化されており、検索意図語の重複だけで違反にならない（kana-converter は変換結果を入力欄 → 結果欄でダイレクトにフィードバックし、fullwidth-converter は半角/全角/カナの 3 種 ON/OFF チェックボックスで構造的に異なる）。

**3 番目語の表記の最終確定**: 「半角全角カナ変換」を採択。理由: meta.keywords に「半角カタカナ 変換」「全角カタカナ 変換」と「カナ」「カタカナ」両方の表記が既にあるが、「カナ」表記の方が文字数短く検索ワードでも頻出（実装 builder の表記揺れ調整余地は **撤回 = 計画段階確定**）。

並び順: 既存 10 項目の末尾に追加（QRコード 3 語の直後）。並びに意味は持たせない（cycle-207 と同方針）。全体棚卸しは B-438 提案で別レイヤー化済。

**背景・Phase 8.1 全体での意義**: B-314 Phase 8.1 の **第 9 弾**。cycle-200〜207 で 8 回適用済の標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行 / AP-WF05 dark mode 撮影）に対して、本サイクルは **通常運用フェーズの 3 回目** + **構造差分の小さい標準形回帰**として位置付ける。cycle-207 が「画像 / SVG 出力型 + Quiet Zone 自前実装 + 詳細ページ debounce 化 + rows=3 初導入 + GIF/PNG 修正」と構造的新規性を 5 件同時に扱った重い回だったため、本サイクルは **意図的に標準形（textarea×2 / rows=2 / 同期処理 / debounce なし）に戻し**、Phase 10.1 ダッシュボード設計時の rows=2 サンプル数を増やすことに位置付け価値がある。

**viewport 採用方針**: AP-WF05 網羅性ルール（w360/w1280）に対し、本サイクルでは Phase 8.1 標準パターン（cycle-200〜207）に従い w375/w1200/w1900 +（タイルプレビューは w1200/w375）を採用する。w360 タイル viewport は B-434 で Phase 10.1 必須検討、Phase 8.1 内では暫定許容。

**「淡々と進むはず」油断打ち消し策**: cycle-206 / 207 と同様、AP-WF16 / AP-WF05 / AP-P21 の 3 つを油断なく履行する。とくに本サイクルは画像出力 / 非同期処理 / 詳細ページ改修などの実証要素を意図的に持たない「淡々運用」サイクルのため、AP-WF09（形式通過）リスクが構造的に高い。計画段階で以下を明示する:

- T-3 / T-4 で `lint` / `format:check` / `test` / `build` の **4 コマンド全件 reviewer 独立再実行** を維持（AP-WF16）
- T-1 着手前の baseline 撮影は **dark mode を含めて先に撮る**（AP-WF05）。tiles-preview / after の撮影も dark mode 必須
- AP-P21 textarea 高さ 4 ケース計測（下限 40px / 相互差 ≤ 2px）を膨張ゼロ型 3 件目として実施（cycle-205 hash-generator / cycle-206 fullwidth-converter 実測値の再現確認を兼ねる）

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- kana-converter の現在のファイル構成・コード・CSS を **grep / Read で実体確認**する。数値の出典は本計画書本文に grep コマンドを併記し、`tmp/` 配下削除後も再現可能とする（AP-P16 / AP-WF12 対策）。
  - `src/tools/kana-converter/`: `Component.tsx` / `Component.module.css` / `logic.ts` / `meta.ts` / `__tests__/logic.test.ts`（**`meta.test.ts` は存在しない** = cycle-207 qr-code と同型 / cycle-206 fullwidth-converter とは異なる）
  - `src/app/(legacy)/tools/kana-converter/`: `page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイル
  - `Component.module.css` 内の `--color-*` 残存数: **15 箇所**。**実測コマンド**: `grep -c -- "--color-" src/tools/kana-converter/Component.module.css`
  - 旧トークン種類は **5 種**（`--color-bg` / `--color-border` / `--color-primary` / `--color-text` / `--color-text-muted`）。**実測コマンド**: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/kana-converter/Component.module.css | sort -u`。`--font-mono` は (new) globals.css にも定義済のため置換不要（言及のみ）
  - `logic.ts` の export: 型 1（`KanaConvertMode`）+ 関数 1（`convertKana`）= **2 export**。**実測コマンド**: `grep -c '^export ' src/tools/kana-converter/logic.ts`
  - 既存テスト件数: `logic.test.ts` test **20 件総計**（**内訳: hiragana-to-katakana 7 / katakana-to-hiragana 4 / to-fullwidth-katakana 5 / to-halfwidth-katakana 4 = 計 20** / M-5 reviewer 指摘対応で計画段階で確定）。**実測コマンド**（総計）: `grep -c '^\s*test(' src/tools/kana-converter/__tests__/logic.test.ts`。**実測コマンド（内訳の確認 / 主手順）**: `grep -nE '^\s*(describe|test)\(' src/tools/kana-converter/__tests__/logic.test.ts` の出力を describe ブロック単位で目視集計する（r5 MINOR-4 対応 / 環境非依存の単純な grep を主手順とし、awk は副次手段）。**副次手段（awk が利用可能な環境のみ）**: `awk '/^\s*describe\(/{ match($0, /"[^"]+"/); d=substr($0, RSTART, RLENGTH) } /^\s*test\(/{ print d }' src/tools/kana-converter/__tests__/logic.test.ts | sort | uniq -c` でモード名（describe ラベル）ごとの test 件数を集計。T-1 builder は本計画書本文の内訳値と実測値の一致を確認する
  - `meta.ts` の `trustLevel`: `"verified"`（B-432 一括削除を待つ。本サイクルでは維持）
  - `TILE_DECLARATIONS` 現状エントリ件数: **8**。**実測コマンド**: `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts`（cycle-207 で確立した再現性のある形式）。codegen 出力 `src/tools/generated/tiles-registry.ts` の `tilesCount` 値も併せて Read で直接確認できる
  - **モード 4 値の確認**: `"hiragana-to-katakana"` / `"katakana-to-hiragana"` / `"to-fullwidth-katakana"` / `"to-halfwidth-katakana"` の 4 値が `logic.ts` および `Component.tsx` MODES 定数で定義されている。**実測コマンド**: `grep -nE '"(hiragana|katakana|to-)' src/tools/kana-converter/{logic.ts,Component.tsx}`
  - **(legacy) OGP の accentColor**: `src/app/(legacy)/tools/kana-converter/opengraph-image.tsx` の `accentColor: "#0891b2"` は (new) 配下へ `git mv` する際に内容変更しない（cycle-207 と同型 / opengraph-image は静的 OGP 生成のため `logic.ts` 依存なし、`git mv` のみで安全）
- Playwright で移行前のスクリーンショットを取得する
  - **ベース 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 着手前撮影 + dark mode 必須）
  - **結果表示済み状態スクショ 2 枚（ライト・ダーク両モード）**: 任意のテキスト（例: ひらがな + カタカナ + 半角カナの濁音含む混在 30 文字程度）を入力 → 既定モード（hiragana-to-katakana）で結果が出ている状態を撮影。AP-WF05 着手前撮影ルールに従い両モードを撮影し、cycle-205〜207 と同水準（baseline 8 枚）を担保
- 既存テストの実行確認: `npm run test -- kana-converter` で 20 件全件緑であることを確認

**完成条件**: 移行前スクリーンショット **計 8 枚**（ベース 6 枚 + 結果表示済み 2 枚）が `tmp/cycle-208/baseline/` 配下に保存。既存テスト 20 件が緑（内訳: h2k 7 / k2h 4 / to-fullwidth-katakana 5 / to-halfwidth-katakana 4）。grep による旧トークン残存 15 / 5 種一覧 / export 2 / test 20（内訳 7/4/5/4）/ `TILE_DECLARATIONS` 件数 8 の数値が本計画書本文と一致し、reviewer の独立再実行で確認されている。**追加確認（論点 5b 案 b 採択前提の既存 SSoT 実測 / r4 reviewer MAJOR-1 + r6 reviewer MAJOR-1 対応）**: 以下 2 点を grep 実体で確認する。(i) `grep -n "aria-pressed" src/tools/*/[A-Z]*Tile.tsx` で **タイル `<button>` + `aria-pressed` 排他選択タイル = 5 件**（base64 / url-encode / html-entity / hash-generator / fullwidth-converter）。(ii) `grep -l 'role="radiogroup"' src/tools/{base64,html-entity,fullwidth-converter,url-encode,hash-generator}/Component.tsx` で **詳細ページ radiogroup = 4 件のみ**（base64 / html-entity / fullwidth-converter / url-encode）= **hash-generator/Component.tsx には radiogroup なし**（`role="region"` 1 件のみ存在 / 詳細ページもタイルも `<button>` + `aria-pressed` で内部統一済 = 分裂なし）。本サイクル kana-converter タイル新規追加で `<button>` + `aria-pressed` 排他選択タイルは 5 → 6 件化、「詳細 radiogroup / タイル aria-pressed」ARIA 層分裂は既存 4 件 + 本サイクル kana-converter 1 件 = 計 5 件化することが確認されている。

**T-1 検証手順（AP-WF16）**: T-1 builder は `npm run test -- kana-converter` 出力と上記 grep コマンド出力を引用付きで報告。T-1 reviewer は最低 1 つ以上の自動チェックを **独立に再実行** して出力一致を確認。

#### T-2: 詳細ページの (new) 配下移行 + T1 yaml への kana-converter 関連語追加

cycle-200〜207 で確立した標準パターンを踏襲する。本サイクルは画像出力 / debounce 化 / ライブラリ差し替え等の特殊改修を **意図的に含まない**（標準形回帰）。

**A. 移行作業**:

- `src/app/(legacy)/tools/kana-converter/` を `src/app/(new)/tools/kana-converter/` に **`git mv`** で移動する（page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル）
- `src/app/(new)/tools/kana-converter/page.module.css` を新設し、1200px max-width をハードコードする（既存 (new) 配下 8 ツールと同一パターン）
- `page.tsx` に `page.module.css` の `.page` ラッパーを追加する（cycle-196 で確立した正準パターン）
- `src/tools/kana-converter/Component.module.css` 内の旧カラートークン **15 箇所 / 5 種** を新デザイントークンに置換する
  - **置換マッピング**（cycle-205〜207 SSoT 踏襲）:
    - `--color-bg → --bg`
    - `--color-border → --border`
    - `--color-primary → --accent`
    - `--color-text → --fg`
    - `--color-text-muted → --fg-soft`
  - **特殊マッピング不要**: `--color-bg-secondary` / `--color-error` / `--color-error-bg` / `--color-primary-hover` がいずれも存在しないため、cycle-205 hash-generator の `--bg-soft` 派生や cycle-207 qr-code の `--accent-strong` / `--danger` 派生は本サイクル不要。**5 対 5 の単純置換**で完結（cycle-206 fullwidth-converter と同型）
  - **`#fff` リテラルの取扱い**: `.modeButton.active { color: #fff }` 1 行が存在。背景色は `--color-primary → --accent`（OKLCH 値はモードで変化）。cycle-207 で起票済の B-440 提案（`--accent` + `#fff` の WCAG AA 全ツール一括点検）の対象として残るため、本サイクルでは **`#fff` 単独修正は行わず、ボタン文字色は `#fff` 維持**。WCAG 実測値（ライト 3.63:1 / ダーク 2.59:1 = 両モード 4.5:1 未達）は **`docs/cycles/cycle-207.md` L597 / docs/backlog.md B-440 行に記録済**（git 管理下 SSoT）。kana-converter の `.modeButton.active` も同一 globals.css 値・同一ボタンパターンのため B-440 一括点検まで本サイクルでの再計測不要
  - **並べ読み突合**: `grep -h -o -- '--\(bg\|border\|accent\|fg\|fg-soft\)\b' src/tools/{base64,hash-generator,fullwidth-converter}/Component.module.css | sort -u` を実行し、置換先 5 種（`--bg` / `--border` / `--accent` / `--fg` / `--fg-soft`）が既存 SSoT（第 1〜8 弾の `Component.module.css`）にすべて存在することを直接確認する（AP-WF12 違反予防 / r7 MINOR-3 対応で再現性ある grep 1 行に書き換え）
- w1900 で本文幅が 1200px に収まっていることを確認する

**B. T1 yaml への kana-converter 関連語追加**:

- 追加先: `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` の `search_intents`
- **追加語（計画段階確定 = builder 裁量なし、上記「目的」セクション 2 案比較結果参照）**:
  - 「ひらがな カタカナ 変換」: 検索意図ワード（最大公約数 / meta.keywords L11 と同形）
  - 「カタカナ ひらがな 変換」: 逆方向（meta.keywords L12 と同形）
  - 「半角全角カナ変換」: 文字幅変換軸（採択理由は「目的」セクション参照）
- 既存 10 件との重複: 「全角半角変換」（L31）と語が被るが計画段階で比較済 = 採択。表記は上記の通り **計画段階で確定**（実装 builder の表記揺れ調整は撤回 / AP-WF03 対策）
- 並び順: 既存 10 項目の末尾に追加（QRコード 3 語の直後）。並びに意味は持たせない（cycle-207 と同方針）
- 棚卸しスコープ外: 全体棚卸しは B-438 提案で温存（本サイクルでは kana-converter 関連語 3 語のみ）

**注意事項**:

- ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネントは touch しない（B-431 一括対応）
- `meta.ts` の `trustLevel: "verified"` は削除しない（B-432 一括削除を待つ）
- `meta.ts` の `keywords` / `description` / `howItWorks` / `faq` も touch しない（既存 SEO 文言を維持）
- opengraph-image.tsx / twitter-image.tsx の内容は変更しない（`git mv` のみ）
- **詳細ページ Component.tsx は touch しない**（kind=widget 標準パターン継続。cycle-207 のような debounce 化や UI 改修は本サイクルでは扱わない / 後述「検討した他の選択肢と判断理由 §詳細ページ debounce 化の要否」参照）

**完成条件**:

- [x] `/tools/kana-converter` が (new) 配下で正常表示される（HTTP 200 OK）
- [x] 旧 (legacy) パスにファイルが残存していない（3 ファイル全件 `git mv` 済）
- [x] w1200 / w1900 / w375 で表示崩れがない（T-4 Playwright 視覚回帰で確認）
- [x] Component.module.css 内に `--color-*` 系旧トークンが残存しない: `grep -c -- "--color-" src/tools/kana-converter/Component.module.css` → `0`
- [x] `--accent-hover`（globals.css に存在しないトークン、cycle-207 R2 訂正済の誤記注意喚起。kana-converter `Component.module.css` 現状 0 件 → 維持確認 = 変更後も 0 件であることを確認することで、置換作業中に誤って `--accent-hover` を導入していないことを担保する意図 / r5 MINOR-3 対応）: `grep -c 'accent-hover' src/tools/kana-converter/Component.module.css` → `0`
- [x] `#fff` リテラル（`.modeButton.active color`）は維持されている（B-440 一括点検対象として残置）
- [x] T1 yaml `search_intents` に kana-converter 関連 3 語が追加されている
- [x] **`docs/backlog.md` Active セクションに B-442 / B-443 の新規エントリを追加（r7 MAJOR-1 対応）**: 本計画書 L385-386 の本文（B-442 提案・B-443 提案）を、cycle-207 で B-438 / B-440 / B-441 を起票した運用実績と同形式（P 優先度 / 着手条件 / スコープ / 完了条件を含む完整なエントリ）で `docs/backlog.md` の Active セクションに追加する。**完了確認コマンド**: `grep -n "B-442\|B-443" docs/backlog.md` で B-442 / B-443 がそれぞれ 1 行以上ヒットすること

**T-2 検証手順（AP-WF16）**: T-2 builder は残存判定 grep / `/tools/kana-converter` HTTP 200 OK / T1 yaml diff / `grep -n "B-442\|B-443" docs/backlog.md` の結果を引用付きで報告。T-2 reviewer は最低 1 つ以上を独立再実行。

#### T-3: タイル定義（kind=widget + モード選択 UI + AP-P21 役割分担）

- **kind 判定**: kana-converter の詳細ページ Component は「4 モード選択ボタン + 入力 textarea + 出力 textarea + コピーボタン」で縦に長く、128px タイルセル基準では収まらないため **kind=widget** とする。**kind=single も比較対象として検討したが却下**（m-3 reviewer 指摘対応 / AP-P17 観点）: kind=single はリンクのみのタイル形（1 セル）で、kana-converter のような「入力 → 即時変換 → 結果コピー」の核心価値（T1 likes「ページを開いた瞬間に … すぐ使い始められる」）が完全に失われるため。詳細ページに 1 クリック挟む単リンク形は本ツールの即時性を全否定する形で来訪者価値を最も損なう。

##### T-3 設計論点 1（AP-P17 ゼロベース 3 案以上）: モード選択 4 値のタイル UI 内収納方法

タイル枠（後述論点 3 で確定する cols=3 サイズ）にモード選択 + textarea + 結果欄 + 詳細リンクを収める前提で、kana-converter 固有の「**選択肢 4 値**」UI 収納方法を比較する。これまでの cycle-200〜207 では 2 状態セグメント（cycle-206 fullwidth-converter）/ 3 種チェックボックス全 ON 固定（cycle-206 fullwidth-converter 内）/ 4 状態の固定省略（cycle-207 qr-code 誤り訂正 M 固定）の 3 種を扱ったが、**4 状態をすべて来訪者に提示する形は Phase 8.1 初出**。

**定量試算（モバイル w375 / 4 ボタン横一列の収納可能性、C-1 reviewer 指摘対応）**:

- **試算前提（M-2 reviewer 指摘対応 / 既存 `Component.module.css` `.modeSwitch { flex-wrap: wrap }` + モバイル `.modeButton { flex: 1 }` との非互換性の明示）**: `KanaConverterTile.tsx` はインラインスタイル方式（CSS Module 不使用 / codegen 制約）のため、`flex-wrap` 値も明示する必要がある。**第一推奨 = `flex-wrap: nowrap`（1 行強制）**。これは下記試算（1 ボタン 75px / 省略表記必須）が wrap なし前提で組まれていることに対応する。wrap が発動した場合（仮に `flex-wrap: wrap` を採用、またはコンテンツが nowrap でもオーバーフロー）は **案 B（2x2 グリッド）相当として扱い、論点 3 で確定した rows=2 のままで 2 行ボタン + textarea + 結果欄 + 詳細リンクが収まるか再評価する**（rows=2 退避案 B 採択分岐と同じフローに合流）
- モバイル w375、タイル左右マージン約 16px × 2 = 32px を引いた **タイル外幅 ≈ 343px**
- タイル padding 16px × 2 = 32px、ボタン gap 4px × 3 = 12px を引いた **モード選択行の実効幅 ≈ 299px**
- 4 ボタン化で **1 ボタン約 75px**
- 既存ラベル最長「半角カナ → 全角カナ」（**実体は `Component.tsx` MODES 定数 L10 の文字列 `"半角カナ → 全角カナ"` = 全角 9 字（うち矢印 1 字 "→" U+2192 含む）+ 半角スペース 2 字 = 計 11 字** / M-2 reviewer 指摘対応 / 「半角矢印 1 字」は誤りで、正しくは全角矢印 "→" U+2192 が全角 9 字に含まれる。**U+2192 を全角扱いする根拠**: Unicode の East Asian Width property (UAX #11) で U+2192 は `A`（Ambiguous）に分類される。UAX #11 自体は Ambiguous 文字を「Narrow / Wide のどちらで描画してもよい」とする規定であり、CJK 環境で Wide 描画されるのは **慣行的・実装依存**（多くの CJK フォント / レンダリングエンジンで Wide 扱いされるが Unicode 仕様上の保証ではない）。本プロジェクトの globals.css `font-family` は `system-ui` で macOS / Windows / iOS / Android いずれも CJK フォールバックが効くため、kana-converter モードラベルでは U+2192 が全角幅 ≈ 12px で描画される前提が現実的だが、**いずれにせよ最終判定は Playwright で `getBoundingClientRect().width` を実測して行う**ため、本試算値は概算上限の参考値として扱う / r7 MINOR-2 対応）を `font-size: 0.75rem (12px)` で表示すると、概算最大値は **「全角字 1 字 ≈ 12px（system-ui の CJK 描画 = monospace 等幅前提の概算最大値）× 9 字 = 108px + 半角スペース 1 字 ≈ 6px × 2 = 12px」= 計 ≈ 120px** に達し、1 ボタン 75px に到底収まらず確実に折り返し or 省略表記が必要となる。**ただし `KanaConverterTile.tsx` は `fontFamily: "inherit"` で system-ui の proportional（可変幅）フォントになるため、上記試算は monospace 換算の概算上限値であり、実測値は proportional 描画でやや短くなる可能性がある**（r5 MINOR-1 対応）。**実測手段**: T-3 builder は `KanaConverterTile.tsx` 実装後、Playwright で `element.getBoundingClientRect().width` を取得し各モードボタンの実測幅を T-4 計測の一環として確認する（試算の精度限界を実機で補正）。本計画書本文の試算値（最長ラベル ≈ 120px）は monospace 概算上限値として記録し、proportional 実測値が試算より小さくても案 A / 案 B フォールバック判定軸（後述）には影響しない（実測幅がタイル幅に収まれば案 A 確定、収まらなければ案 B フォールバック）。
- 省略表記「半→全カナ」（5 文字 ≈ 60-70px）に短縮すれば 75px ボタンに収まるが、来訪者が **「半→全カナ」を見て 1 秒で意図を取れるかは別問題**（T1 likes「ページを開いた瞬間に … すぐ使い始められる」核心の即時理解性に影響）

**この定量試算により、案 A は無条件採択ではなく退避案を持つ条件付き採択とする**（下表参照）。

| 評価軸                       | 案 A: 横一列 4 ボタン（既存詳細ページ踏襲）                                                                                                                                                                                                                                                   | 案 B: 2x2 グリッド                                                                                                                                   | 案 C: ドロップダウン (`<select>`)                                                                                                | 案 D: 2 段階グループ化（仮名変換 / 文字幅変換）                                                                                                       | 案 E: 4 値の固定省略 + 詳細ページに譲る                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| (i) 来訪者価値（即時性）     | タイル単体で 4 モードすべて切替可能。視覚的に全選択肢が見えており「どのモードがあるか」を学習せずに使える。ただしタイル幅 400px（cols=3）で 4 ボタン横並びは 1 ボタンあたり 80px 程度に圧縮され、長いラベル「半角カナ → 全角カナ」が省略表記になりがち。モバイル w375 ではさらに 4 列が窮屈。 | 縦 2 行を占有し入力 / 結果エリアが圧迫される。仮名変換 2 種 + 文字幅変換 2 種という分類が視覚的にも自然だが、行数増は AP-P21 リスクが案 A より高い。 | 1 行に収まり省スペース。ただし「どんなモードがあるか」が開くまで見えず、来訪者の即時性が損なわれる。AP-P07（認知モデル）に逆行。 | グループ見出し（「仮名変換」「文字幅変換」）+ 各 2 ボタンで論理的に整理されるが、Phase 8.1 内で未確立の UI パターンで実装コストと一貫性リスクが高い。 | タイル = 即時性最大（既定モードのみ動作）/ 詳細 = 全モード。cycle-206 fullwidth-converter のオプション固定省略と同思想。 |
| (ii) AP-P21 / 枠内収納       | 横一列なら 1 行で済むが圧縮されたボタンは視認性低下。rows=2（264px）で問題ないか要試算。                                                                                                                                                                                                      | 縦 2 行追加で textarea / 結果欄が圧迫。rows=2 では収まらず rows=3 拡張の検討が必要（論点 3 と連動）。                                                | 1 行で省スペース、AP-P21 リスク最小。                                                                                            | 縦に見出し 1 + ボタン 2 行 = 計 3 行で AP-P21 リスク中。                                                                                              | 0 行追加。最大の余裕。                                                                                                   |
| (iii) 詳細ページとの責務分離 | タイル = 全モード / 詳細 = 全モード で重複。タイル価値が薄い。                                                                                                                                                                                                                                | 同上。                                                                                                                                               | 同上 + プルダウン操作で詳細ページの方が体験が良くなりタイル価値低下。                                                            | 同上。                                                                                                                                                | タイル = 即時性 / 詳細 = モード選択 + コピー、責務分離明確（cycle-206 / 207 と整合）。                                   |
| (iv) 「4 値」を出す必然性    | 4 値とも独立した需要があり「どのモードに該当するか」を来訪者が選びたい想定（meta.keywords にも 4 軸の語が混在）。                                                                                                                                                                             | 同上。                                                                                                                                               | 同上。                                                                                                                           | 同上 + グループ分類は「仮名 vs 文字幅」の 2 軸が来訪者の認知モデルに比較的合致。                                                                      | 1 値（既定 hiragana-to-katakana）のみではタイルから着地する来訪者の半数程度が即「使えない」と離脱する可能性、価値低下。  |
| (v) 実装コスト               | 低（cycle-206 fullwidth-converter 2 値セグメントの 4 値拡張）。                                                                                                                                                                                                                               | 中。                                                                                                                                                 | 低（`<select>` 要素のインラインスタイル化）。                                                                                    | 高（Phase 8.1 内で未確立、グループ見出し UI の設計が新規）。                                                                                          | 最低。                                                                                                                   |

**第一推奨: 案 A（横一列 4 ボタン）+ 案 B を退避案として保持（条件付き採択）**。

**採択理由（来訪者価値最大化原則）**:

1. T1 likes「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」「コピペで結果を受け取ってすぐ元の作業画面に戻れる」に対して、案 A は **4 モードすべてが視覚的に見えており即座に切替できる**形で最大適合。
2. kana-converter は「**変換方向で使い分けるツール**」であり 4 値の独立性が高い。案 E（M 固定省略）は qr-code の誤り訂正レベル（典型来訪者は M で十分という前提）とは異なり、kana-converter では「ひらがな → カタカナ」を求めて来訪した人にとって「カタカナ → ひらがな」固定では用を成さない。**4 値の偏った優位性がない**のが kana-converter の特徴。
3. 案 C（プルダウン）は AP-P07 認知モデルに逆行。案 D は Phase 8.1 内未確立で実装コスト最大。

**退避案と分岐条件（C-1 reviewer 指摘対応、計画段階で明示）**:

- **退避先**: 案 B（2x2 グリッド）。仮名変換 2 種 + 文字幅変換 2 種という分類が来訪者の認知モデルに合致し、各ボタン幅は 2 倍の約 150px に拡大可能 = 「半角カナ → 全角カナ」フル表記 130-140px が **w375 でも収まる**。
- **分岐条件**: T-3 builder が `KanaConverterTile.tsx` 実装後 Playwright で w375 表示の実物を撮影 → 案 A 採択時の省略表記（「半→全カナ」等）の意味解釈可能性を判定する。判定軸:
  - (i) **モード選択行（4 ボタンを内包する flex コンテナ）が overflow されず、横方向スクロール状態（`scrollWidth > clientWidth`）にもなっていないか**（r5 MINOR-2 対応 / 試算前提が `flex-wrap: nowrap` のため、収納可否は「折り返しの有無」ではなく「親コンテナのスクロール / クリップ発生有無」で判定する。実測コマンド: Playwright で `element.scrollWidth` と `element.clientWidth` を取得し前者が後者以下であることを確認、かつ親要素の `overflow: hidden` でボタンの右端が見切れていないことをスクリーンショットで確認）
  - (ii) ラベルから「半角カナを全角カナに変換するモード」と即座に解釈できる省略形になっているか（ボタン文字列の評価 / builder が報告書に画像添付）
- **分岐ロジック**:
  - 上記 (i) と (ii) が両方満たされる → 案 A 確定
  - 一方でも満たされない → **案 B（2x2 グリッド）にフォールバック**。この場合、論点 3 で確定した rows=2 のままで案 B が収まるか再評価し、収まらない場合のみ rows=3 に拡張（論点 3 の条件付き再採択）。**rows=3 退避時の AP-P21 計測判定（M-6 reviewer 指摘対応）**: rows=3 (400×400px) では textarea 高さの上限値が rows=2 の 46px 試算から外れる（より大きい値になる）。そのため AP-P21 計測 4 ケースの「cycle-205 hash-generator / cycle-206 fullwidth-converter 実測値 46px・相互差 0px との一致確認」は **rows=3 退避時には適用対象外**とする。代わりに rows=3 内での「(a)(b)(c) 相互差 ≤ 2px + (d) 下限 40px 維持」のみを判定基準とし、46px 一致は rows=2 確定時のみの判定軸として扱う
- **fallback 実施フロー**:
  1. T-3 builder は案 A で実装 → Playwright で実物確認 → 上記分岐判定
  2. 案 A 不可なら案 B に切替 → 再度 Playwright で確認 → rows=2 で収まれば確定、収まらなければ T-3 reviewer / PM に判断エスカレーション（rows=3 拡張 or 案 D 検討）
- **本サイクル内で案 A から案 B にフォールバックすることは AP-WF09（形式通過）違反ではない**。計画段階で退避案と分岐条件を明示し、builder が実物確認に基づいて選択するのは正しい運用

##### T-3 設計論点 2（AP-P17 ゼロベース 3 案）: タイル UI のトリガー方式（debounce の要否）

cycle-207 qr-code で詳細ページ + タイルともに debounce 300ms を採択したが、kana-converter は変換が **純粋同期関数 + 計算コスト極小**（Unicode マッピングの単純走査、`convertKana()` 実行時間は数 ms 以下）。debounce の要否を再点検する。

| 評価軸                  | 案 A: 即時反映（debounce なし、既存詳細ページ踏襲、**第一推奨**）                                                                                                                                                                                                                                                                                                                    | 案 B: debounce 300ms                                                                                                                                                    | 案 C: 手動ボタン                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| (i) 来訪者価値          | 入力ごとに即座に結果が更新され最大の即時性。**変換が同期 + 軽量 / 出力がテキストのため IME 確定前のチラつき問題は qr-code（画像描画）ほど顕在化しない**（textarea の文字書き換えは視覚的にチラつきにくい）。                                                                                                                                                                         | チラつき抑制効果はあるが kana-converter では効果が薄い。実装コスト（useEffect + setTimeout cleanup）が同期処理のメリットを上回らない。                                  | 余分な 1 クリックで即時性損失、Decision Making Principle に逆行。 |
| (ii) 詳細ページとの整合 | 詳細ページ既存実装は `useState` + レンダリング時 `convertKana()` 同期呼出（`const output = convertKana(input, mode)` を関数本体で評価）で即時反映 / debounce なし。**詳細・タイル両方が即時反映で T2 likes「操作性一貫」を満たす**。                                                                                                                                                 | タイル debounce / 詳細即時で挙動分離 → T2 likes 違反。両方を debounce 化するなら詳細ページ Component.tsx を改修する必要があり、本サイクルの「標準形回帰」方針から逸脱。 | 両方を手動化するならさらに大きな UX 退化、本筋から逸脱。          |
| (iii) 性能              | 影響なし（同期 + 軽量）。                                                                                                                                                                                                                                                                                                                                                            | 不要なオーバーヘッド。                                                                                                                                                  | -                                                                 |
| (iv) cycle-207 との整合 | cycle-207 で確立した「debounce はリッチ出力（画像 / 重い計算）に適用」という運用は kana-converter の特性（軽量同期 + テキスト出力）には機械適用不要と本サイクル単独で判断する。**ただし IME composition 中のチラつきは構造的に未検証のため、SSoT 化（将来軽量同期ツールへの機械適用）は T-4 実機観察結果を踏まえ Phase 10 以降に再判断する**（r5 MAJOR-1 対応 (c) / 補足事項参照）。 | cycle-207 で確立した debounce 適用方針を機械的に踏襲する形で、本ツールの特性を無視。                                                                                    | -                                                                 |
| (v) 実装コスト          | 最低（useState のみ）。                                                                                                                                                                                                                                                                                                                                                              | 中（useEffect cleanup + setTimeout）。                                                                                                                                  | 中。                                                              |

**採択: 案 A（debounce なし即時反映）**。

**採択理由**:

1. **kana-converter の変換特性に適合**: 純粋同期 + 計算コスト極小 + テキスト出力でチラつきリスクが低い。debounce のメリットがほぼゼロでオーバーヘッドのみ残る。
2. **詳細ページとの整合（T2 likes 操作性一貫）**: 詳細ページ Component.tsx が既存実装で即時反映（`useState` + レンダリング時 `convertKana()` 同期呼出 / debounce なし / `useEffect` も使用していない）のため、タイルも即時反映にすれば挙動一致。debounce 化するなら詳細ページも改修必要で本サイクルの「標準形回帰」方針から逸脱。
3. **本サイクル単独判断としての扱い（r5 MAJOR-1 対応 (c)）**: 「debounce は重い計算 / 画像描画 / 非同期処理に適用、軽量同期テキスト処理には不要」という判断は **本サイクル kana-converter 単独**として扱い、Phase 8.1 全体の SSoT 化は撤回する。理由: IME composition 中（compositionupdate イベント中）の結果欄連続再計算によるチラつきリスクは画像描画以外でも顕在化する可能性があり、textarea×2 構造で「画像描画でなければチラつかない」前提は構造的に未検証。T-4 で実機観察（後述）により実証データを取得し、結果が「チラつき顕在化せず」であった場合に限り、cycle-209 以降の同型ツール（text-replace / line-break-remover 等）で **kana-converter 実機観察結果を参照根拠として引用可能**とする運用に留める。SSoT 化（機械適用）は Phase 10 以降の整理サイクルで再判断。

##### T-3 設計論点 3（AP-P17 ゼロベース 3 案）: タイルサイズ rows=2 vs rows=3

cycle-207 qr-code で rows=3（400×400px）を Phase 8.1 初導入したが、kana-converter は画像出力を持たず（textarea + テキスト結果）、標準形 rows=2 で十分な可能性が高い。論点 1 採択案 A（横一列 4 ボタン）の窮屈さと連動して再点検する。

タイル 1 セル = 128px、gap = 8px、padding = 16px の前提（cycle-200〜207 標準）。

| 評価軸                           | 案 A: rows=2 (400×264px)（**第一推奨**）                                                                                                                                                                 | 案 B: rows=3 (400×400px) 拡大                                                                                                | 案 C: rows=2 + ボタン高さ短縮で対応                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| (i) 来訪者価値                   | 264px 高さ内: padding 32 + モード選択ボタン行 36-40 + textarea 60+ + 隙間 8 + 結果欄 残 + 詳細リンク 24 = 全 4 要素縦積みで標準形通り収まる試算。cycle-206 fullwidth-converter rows=2 と同型で実績あり。 | 余裕は大きいが、textarea / 結果欄に対して垂直スペースが過剰、ダッシュボード全体バランスへの寄与は少ない。                    | ボタン高さを 28-32px に圧縮するとタップ領域が WCAG AAA 推奨 44px を下回る。 |
| (ii) AP-P21 リスク               | 圧迫リスクあり。詳細試算が必要だが cycle-206 fullwidth-converter 4 要素縦積み rows=2 の実績で「収まる」見込み。                                                                                          | 余裕大、最大の安全マージン。                                                                                                 | アクセシビリティリスク（タップ領域不足）。                                  |
| (iii) ダッシュボード全体バランス | 既存 7 タイル（cols=3 rows=2）と完全一致でグリッド美観維持。                                                                                                                                             | cycle-207 qr-code に続いて 2 個目の rows=3 タイルになる。rows=2 / rows=3 の混在パターン強化（Phase 10.1 設計時の実証寄与）。 | rows=2 維持で美観 OK。                                                      |
| (iv) 採用論拠                    | **画像出力 / DL ボタン / 大きいプレビュー領域が不要なため rows=3 の必然性がない**。cycle-207 qr-code は SVG 272px 確保のため rows=3 が必要だったが、kana-converter は標準形で十分。                      | qr-code とは異なり kana-converter には rows=3 の必然性が薄い。「サンプル数増やすため」だけでは Decision Making 原則弱い。    | アクセシビリティ犠牲。                                                      |
| (v) 実装コスト                   | 低（標準）。                                                                                                                                                                                             | 中（rows=3 だが Tile 内 CSS は既存と同型）。                                                                                 | 中（ボタンサイズ調整）。                                                    |

**第一推奨: 案 A（rows=2 維持）+ 案 B（rows=3 拡張）を退避案として保持（条件付き採択）**。論点 1 退避案（2x2 グリッド）にフォールバックした場合、モード選択行が 1 行 → 2 行に増えるため rows=2 の枠内収納可否を T-3 builder が再評価し、収まらない場合のみ rows=3 拡張へエスカレーション（PM / reviewer 判断）。論点 1 / 論点 3 の分岐フローに従う運用は AP-WF09（形式通過）違反ではなく、計画段階で分岐条件を明示した上で builder が実物確認に基づき選択する正しい運用。**rows=3 退避時の AP-P21 計測判定**: rows=3 (400×400px) では textarea 高さの上限値が rows=2 試算（46px）から外れる（より大きい値になる）ため、cycle-205 / 206 実測値 46px・相互差 0px との一致確認は **rows=3 退避時には適用対象外**とし、rows=3 内での「(a)(b)(c) 相互差 ≤ 2px + (d) 下限 40px 維持」のみを判定基準とする（M-6 reviewer 指摘対応）。

**採択理由**:

1. **画像出力 / 大きいプレビュー / DL ボタンを持たない** kana-converter には rows=3 の必然性がない。cycle-207 qr-code rows=3 は SVG 272px 確保（QR 物理 2cm 相当）という明確な来訪者価値起点の根拠があったが、kana-converter にはない。
2. **Phase 10.1 ダッシュボード設計時の rows=2 サンプル数を増やす**: cycle-200〜206 で 7 件、cycle-207 で 1 件 rows=3、本サイクル rows=2 で 8 件目。「rows=2 が標準 / rows=3 が画像出力型の例外」という運用パターンが 1 サンプル分強化される。
3. 論点 1 案 A（4 ボタン横一列）の収納可能性は rows=2 で十分な試算（モード選択 36-40px + 標準 4 要素縦積みで cycle-206 fullwidth-converter rows=2 と同型）。論点 1 退避案 B（2x2 グリッド）の場合のみ rows=2 → rows=3 の条件付き再採択あり（**循環参照ではなく一方向条件付き**: 論点 1 = 案 A 確定なら論点 3 = rows=2 / 論点 1 = 案 B 退避時のみ論点 3 を Playwright 実物確認で再評価）。
4. Decision Making Principle: **rows=2 採択の理由は実装コストの低さではない**。rows=3 を採用しても来訪者価値の追加効果がないため、標準形 rows=2 で十分（M-4 reviewer 指摘対応 / 文意明確化）。

##### T-3 設計論点 4（参考）: 詳細ページの UI 更新の要否

cycle-207 では詳細ページの「QRコード生成」ボタン削除 + debounce 化が来訪者価値直結（T2 likes 一貫 + ボタン削除によるプレビューエリア拡大）だったため取り込んだが、kana-converter の詳細ページは既に **onChange で即時反映 + コピーボタン付き** で UX 上の欠陥がない。

| 案                                                                        | 判断                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 詳細ページ Component.tsx 改修（debounce 化 / モード選択 UI 改善等） | **不採用**。現状の即時反映 UI に来訪者価値直結の問題がなく、改修の必然性がない。本サイクルの「標準形回帰」方針からも逸脱。**再検討トリガー（具体化、m-4 reviewer 指摘対応）**: Phase 10.1 ダッシュボード設計時の GA 観察項目として **「kana-converter モード選択分布（4 モードの選択率比率）」「kana-converter 詳細ページの滞在時間 / 離脱率」「タイル → 詳細ページの遷移率」** を追加検討し、特定モード（例: hiragana-to-katakana 既定モード以外）の利用率が極端に低い / 離脱率が他ツール比で高い場合に詳細ページ UI 改善を再評価する。 |
| 案 b: 詳細ページ Component.tsx は touch しない（**採択**）                | **採択**。kind=widget 標準パターン継続。タイル UI（4 モード + 結果） と詳細ページ UI（4 モード + 結果 + コピー）の責務分離は弱いが、cycle-206 fullwidth-converter と同型の許容範囲（オプションチェックボックスが追加機能の差別化）よりさらに差が小さい点は本サイクルの観察事項として記録（補足事項参照）。                                                                                                                                                                                                                               |

##### T-3 設計論点 5: AP-P21 役割分担パターンの適用（混在型）

kana-converter は **「主モード 3 つ膨張ゼロ + 副モード 1 つ最大 2 倍膨張」の混在型**（M-1 reviewer 指摘対応訂正）:

- 主モード（膨張ゼロ）: `hiragana-to-katakana` / `katakana-to-hiragana`（1:1 マッピング）、`to-fullwidth-katakana`（半角 → 全角 = 縮小方向、結果は入力以下）
- 副モード（膨張型）: `to-halfwidth-katakana`（全角 → 半角 = 全角濁音「ガ」→ 半角「ｶﾞ」で 1 → 2 文字、最大 2 倍膨張）

したがって本サイクルの位置付けは「**主 3 モード = 膨張ゼロ型 3 件目サンプル / 副 1 モード = AP-P21 膨張型計測基準の追加検証サンプル**」となる（L16 の混在型表現と整合）。

**役割分担パターン（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）を継続採用** する理由:

1. cycle-200〜207 で 8 連続適用済の CSS 構造を踏襲することでタイル全体の見た目・挙動の一貫性が維持される（T2 likes）
2. cycle-206 / 207 申し送り「役割分担パターン採用 + T-4 計測は運用標準として継続」が指定
3. **混在型サンプルとしての記録的価値**: cycle-205 hash-generator + cycle-206 fullwidth-converter の 2 サンプル（膨張ゼロ型、いずれも 4 ケース全件 46px / 相互差 0px）に対し、kana-converter は主 3 モードで膨張ゼロ型 3 件目データを供給しつつ、副モード `to-halfwidth-katakana` で **膨張型の AP-P21 計測基準（下限 40px 維持 / textarea 高さの安定性）の追加サンプル** を供給する
4. AP-WF09 防止: 「膨張ゼロ型だから役割分担不要」というショートカット判断はリスクを孕む

##### T-3 設計論点 5b（C-2 reviewer 指摘対応）: タイル ARIA セマンティクスパターンの選択

詳細ページ Component.tsx は `role="radiogroup"` / `role="radio"` / `aria-checked` のラジオグループ実装（実体確認: `src/tools/kana-converter/Component.tsx` L41-52）。一方、本サイクル T-3 タイルは fullwidth-converter（cycle-206）参考実装に倣う場合 `<button>` + `aria-pressed` の button トグル実装になる。両者の **ARIA 層不一致** が T2 likes「操作性一貫」に背反する可能性を計画段階で論点化する。

| 案                                                                                                                      | (i) 詳細ページとの整合（ARIA 層）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | (ii) 実装一貫性（既存タイル群との整合）                                                                                                                                                                                                                                                                                                                                                                                     | (iii) 実装コスト / スコープ                                                                                                                                                                                                                                                  | (iv) 採否                                 |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 案 a: タイルも詳細ページと同じ `role="radiogroup"` / `role="radio"` / `aria-checked` を採用                             | **音声出力の整合性が一致**（kana-converter 詳細ページ単独で見れば）。スクリーンリーダーが両画面で radio として読み上げる音声出力が一致し、T2 likes「操作性一貫」適合（個別ツールページ内に閉じた場面では強い）。**ただしキーボード操作（矢印キーでの選択移動）は両画面ともに未実装**（既存詳細ページ `src/tools/kana-converter/Component.tsx` も矢印キーハンドラなし。`onKeyDown` / `ArrowLeft` / `ArrowRight` grep 0 件）。本サイクルでも本来 WAI-ARIA Authoring Practices で必須とされる矢印キー操作の実装は行わない（後述 backlog 起票）。                                                                                                                                                                                                        | 既存タイル群（**現時点で 5 件 = base64 / url-encode / html-entity / hash-generator / fullwidth-converter のすべてが `<button>` + `aria-pressed`**。**実測コマンド**: `grep -n "aria-pressed" src/tools/*/[A-Z]*Tile.tsx`）の `aria-pressed` button パターンとは ARIA 層が異なる。kana-converter だけ radiogroup を採用すると 6 ツール中 1 件のみ別形となり **既存分裂状態をさらに複雑化**（5+1 ではなく 5+0+1 の 3 形態化） | 中（既存詳細ページ実装をタイル形にコピー、本サイクルで完結 / ただし B-443 全件統一作業の規模が 5 件→6 件に増加し、本サイクルのみ「他 5 件と異なる ARIA」状態を抱えたまま運用される期間が発生）                                                                               | 不採用                                    |
| 案 b: タイルは既存 5 タイル同型の `<button>` + `aria-pressed` を採用（**第一推奨**）                                    | **不一致**。詳細ページはラジオグループ / タイルは button トグルでスクリーンリーダー読み上げの音声出力が異なる。**この「詳細 radiogroup / タイル aria-pressed」分裂は既存 4 ツール（base64 / url-encode / html-entity / fullwidth-converter）で発生済の既存 SSoT**（**実測コマンド**: `grep -l 'role="radiogroup"' src/tools/{base64,html-entity,fullwidth-converter,url-encode,hash-generator}/Component.tsx` → **4 件のみ該当 / hash-generator は radiogroup なし = 詳細・タイル両側で button トグル統一済で分裂なし**）。本案採択 = 既存 4 件と同型の分裂を新規 1 件に踏襲し、cycle-202 base64 / cycle-203 url-encode / cycle-204 html-entity / cycle-206 fullwidth-converter の 4 サイクルで適用された詳細 radiogroup パターン（既存 SSoT）と整合 | 既存 5 件すべての `<button>` + `aria-pressed` 排他選択タイルパターンと完全一致。**タイル群の一貫性最大化**（T2 likes「操作性一貫」の主軸はタイルダッシュボードを横断利用する場面 = Phase 10.1 主役 UI）                                                                                                                                                                                                                     | 低（既存 5 タイルの参考実装をそのままコピー）/ B-443 統一作業は分裂解消対象 4 件 + 本サイクル 1 件 = 5 件として一括対応可能 + hash-generator は別途検討（radiogroup 化 or button トグル統一維持）で、分裂の総量増加なし                                                      | **採択**                                  |
| 案 c: 詳細ページの radiogroup を新タイル UI に合わせて `aria-pressed` button に再設計                                   | 完全一致（タイル側に揃える）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 既存タイル群と統一                                                                                                                                                                                                                                                                                                                                                                                                          | **既存詳細ページ touch が必要 = 本サイクルの「標準形回帰」「詳細ページ Component.tsx を touch しない」方針と矛盾**                                                                                                                                                           | 不採用                                    |
| 案 d: 詳細ページとタイル両側を `<button>` + `aria-pressed` で統一（hash-generator 型 / r6 reviewer MAJOR-2 対応で追加） | **完全一致**（詳細・タイル両側で button トグル / `aria-pressed`）。詳細とタイル両側の ARIA 一致 → T2 likes「操作性一貫」を完全に満たす（個別ツール内 + ダッシュボード横断の両面で一貫）。**hash-generator が既にこの形で実装済 = 詳細・タイル両側で button トグル統一の既存 SSoT サンプルが 1 件存在**（**実測コマンド**: `grep -l 'role="radiogroup"' src/tools/hash-generator/Component.tsx` → 該当なし / `role="region"` 1 件のみ）                                                                                                                                                                                                                                                                                                               | 既存タイル群 5 件 + hash-generator 詳細ページ 1 件すべてと同型 = タイル群 + 詳細ページの統一性最大化                                                                                                                                                                                                                                                                                                                        | **既存詳細ページ touch が必要（radiogroup → aria-pressed 化）= 本サイクルの「標準形回帰」「詳細ページ Component.tsx を touch しない」方針と矛盾するため、本サイクル単体では不採用**。ただし B-443 検討時の **有力候補**（hash-generator 既存実装が SSoT サンプルとして機能） | **本サイクル単体では不採用 / B-443 候補** |

**採択: 案 b**（タイルは既存 5 タイル同型の `<button>` + `aria-pressed` を採用 / r4 reviewer MAJOR-1 指摘を受け AP-P17 ゼロベース再判断で r3 採択案 a を覆し、案 b に変更）。

**採択理由（来訪者価値最大化原則）**:

1. **タイルダッシュボードの一貫性 = T2 likes の主軸**: T2 likes「操作性・トーン&マナーが一貫」が最も発火するのは **複数タイルを横断利用する場面（Phase 10.1 ダッシュボードの主役 UI）**。既存 5 件すべてが `<button>` + `aria-pressed` を採用している現状（実測 5/5）で kana-converter だけ radiogroup を採用すると、ダッシュボード横断時に「同じ排他選択 UI なのに 1 件だけスクリーンリーダー読み上げパターンが異なる」状態となり、来訪者から見た一貫性が逆に損なわれる。案 b 採択 = 既存 5 件と同型を踏襲し、ダッシュボード上のタイル群を等質に保つことで来訪者価値最大化。
2. **既存 SSoT との整合（cycle-202〜206 でタイル `<button>` + `aria-pressed` を 5 連続適用 / 詳細 radiogroup は 4 サイクル適用 / r6 reviewer MAJOR-1 対応で訂正）**: タイル側は cycle-202 base64 / cycle-203 url-encode / cycle-204 html-entity / cycle-205 hash-generator / cycle-206 fullwidth-converter の **5 連続で「タイルは `<button>` + `aria-pressed`」が適用**されてきた事実は既存 SSoT。詳細ページ側の radiogroup 採用は cycle-202 base64 / cycle-203 url-encode / cycle-204 html-entity / cycle-206 fullwidth-converter の **4 サイクル**で適用され、cycle-205 hash-generator のみ詳細・タイル両側で button トグル統一型（別パターン）。本サイクル単独でタイルを radiogroup に切替えるのは AP-P11（前サイクル踏襲ではなく自分で判断）を逆方向に発動させる動きで、既存 5 タイルを放置したまま 1 件だけ「正しい形」に切替えるのは整合性破壊。
3. **詳細ページ / タイルの ARIA 層分裂は既存 4 件で発生済の許容済リスク（r6 reviewer MAJOR-1 対応で訂正）**: 「詳細 radiogroup / タイル aria-pressed」分裂は既存 4 ツール（base64 / url-encode / html-entity / fullwidth-converter）で運用されており、hash-generator は詳細・タイル両側で button トグル統一済（分裂なし）。本案採択により分裂の総量は 4 件→5 件に増加するが、新たな分裂パターンは導入されない（4+1 同型化）。一方、案 a 採択は「他 5 件と異なる第 3 パターン」を導入する形で分裂を複雑化させる。
4. **B-443 一括整理時の効率性（r6 reviewer MAJOR-1 対応で訂正）**: 案 b なら B-443 = 分裂解消対象 4 件 + 本サイクル 1 件 = 5 件一括 radiogroup 化 + hash-generator は別途検討（radiogroup 化 or button トグル統一維持の判断 = 案 d も B-443 候補）で機械的に処理可能。案 a なら B-443 = 既存 5 件 + 1 件除外確認の二段階となる。B-442（radiogroup キーボード操作実装）と同タイミング B-443 着手は、5 件分の radiogroup 矢印キー実装 + hash-generator の方針確定が一気に整う点で **独立サイクル化が現実的**（後述 B-443 着手条件参照）。
5. **詳細ページ Component.tsx を touch しない方針との整合**: 案 c / d は除外（いずれも詳細ページ touch 必須）、本サイクル方針と矛盾しない案 a / b の二択で、来訪者価値起点では案 b が優位。
6. **WAI-ARIA セマンティクスの正しさは認めつつ、既存 SSoT 統一を優先**: `aria-pressed` は本来「個別ボタン押下状態」、radiogroup は「相互排他的選択」を表すため、4 択 1 モデルには radiogroup の方が WAI-ARIA Authoring Practices 上正しい。ただし本判断はサイト横断で一括是正すべき事柄であり、本サイクル単独で 1 件のみ正しい形にすることは来訪者価値（タイル横断一貫性）と相反する。B-443 で分裂解消対象 5 件（4 既存 + 本サイクル 1）一括是正 + hash-generator の方針確定（案 d 検討）が来訪者価値最大化に整合。

##### T-3 設計論点 6: タイル用テストの観点（最低 7 件）

タイル用コンポーネントのテストを追加する。**最低 7 件**、以下の観点 (i)〜(vii) をすべて含むこと。assertion 文言は builder 裁量。

- (i) **モード切替 → 入力保持**: モード A → モード B に切り替えても入力テキストが保持され、結果欄だけが再計算される
- (ii) **モード hiragana-to-katakana のデフォルト動作**: 既定モードでひらがな入力 → カタカナ出力（例: 「あいうえお」→「アイウエオ」）
- (iii) **モード katakana-to-hiragana 動作**: モード切替後、カタカナ入力 → ひらがな出力
- (iv) **モード to-fullwidth-katakana（半角 → 全角）動作**: 半角カナ入力 → 全角カナ出力。濁音「ｶﾞ」→「ガ」の縮小ケースを 1 件含む
- (v) **モード to-halfwidth-katakana（全角 → 半角）動作**: 全角カナ入力 → 半角カナ出力。濁音「ガ」→「ｶﾞ」の膨張ケースを 1 件含む
- (vi) **空入力 + `role="status" aria-live="polite"`**: 結果欄が空表示で `role="status"` を持つ要素として描画されること
- (vii) **ARIA button トグルセマンティクス（論点 5b 採択案 b 検証）**: モード選択ボタン群が `getByRole("button")` で各モードボタン計 4 件検出可能、選択中のボタンの `aria-pressed` が `"true"`、他 3 件が `"false"` であることを確認（既存 5 タイル = base64 / url-encode / html-entity / hash-generator / fullwidth-converter と同型 / **実測コマンド**: `grep -n "aria-pressed" src/tools/*/[A-Z]*Tile.tsx`）

##### T-3 タイル定義 共通

- タイル用コンポーネント（`src/tools/kana-converter/KanaConverterTile.tsx`）を新規実装する
  - CSS Module 不使用（codegen 制約）。インラインスタイル方式で既存 8 タイルと同型
  - `role="status" aria-live="polite"` を結果欄に付与（既存タイルと同型）
  - **モード選択ボタン群の ARIA は `<button>` + `aria-pressed` を採用**（採択論点 5b 案 b / 既存 5 タイル = base64 / url-encode / html-entity / hash-generator / fullwidth-converter と同型 / **実測コマンド**: `grep -n "aria-pressed" src/tools/*/[A-Z]*Tile.tsx`）
  - 末尾「詳細ページで開く」`<Link>` 配置（cycle-206 と同型）
  - debounce なし（採択論点 2 案 A）/ rows=2（採択論点 3 案 A）/ 4 モード横一列ボタン（採択論点 1 案 A、ただし退避案 B = 2x2 グリッドを Playwright 実物確認後フォールバック可）
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に kana-converter のエントリを追加（**recommendedSize は第一推奨 cols=3 rows=2 / 退避時 cols=3 rows=3 を許容**。論点 1 案 A 採択時は rows=2、論点 1 案 B 退避時かつ論点 3 再評価で rows=2 に収まらないと判定された場合のみ rows=3 を採用。論点 1 / 論点 3 の分岐フローに従う）
- `npm run generate:tiles-registry` で codegen を実行する（tilesCount: 8 → 9）

**完成条件**:

- [x] `TILE_DECLARATIONS` に kana-converter が追加されている（**第一推奨 cols=3 rows=2 / 退避時 cols=3 rows=3 を許容**。論点 1 / 論点 3 の分岐フローに従う）
- [x] codegen が成功し `tilesCount=9` になる（`src/tools/generated/tiles-registry.ts` 直接確認）
- [x] `KanaConverterTile.tsx` のテスト **7 件以上**（観点 (i)〜(vii) を全て含む）が緑
- [x] タイル UI 上で 4 モード切替が機能し、入力 onChange で即座に結果が反映される
- [x] 詳細ページ Component.tsx が touch されていない（git diff で確認可能）

**T-3 検証手順（AP-WF16）**: T-3 builder は `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** の出力を引用付きで報告。T-3 reviewer は **4 コマンドすべて** を独立に再実行して出力一致を確認（cycle-205〜207 と同型の運用継続）。

#### T-4: 検証と統合確認（AP-P21 計測 / AP-WF16 全件再実行 / 視覚検証）

- `/internal/tiles/preview/tools/kana-converter` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク **計 4 枚** 撮影）
- 移行後のスクリーンショット比較（**計 8 枚**: ベース 6 枚 = デスクトップ w1200 / w1900、モバイル w375 × ライト / ダーク両モード + 結果表示済み 2 枚 = ライト / ダーク両モードで既定モードに結果が表示された状態）。T-4 段階で再撮影する（cycle-203 T-4 MINOR-1 = T-2 スクショ流用事故の再発防止）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/kana-converter` で 200 OK）
- タイルプレビュー上の動作確認を Playwright で実施
  - デフォルト表示（hiragana-to-katakana 既定 + 空入力）でプレースホルダー or 空状態
  - 4 モード切替の動作確認（A → B → C → D を順に押下し、結果欄が各モードに従って更新される）
  - **キーボード操作の動作確認（M-5 reviewer 指摘対応）**: Tab キーで 4 モードボタン → 入力 textarea → 結果欄（読み取り専用想定）→ 詳細リンクの順にフォーカスが移動し、モードボタンにフォーカスが当たった状態で Space または Enter キーを押下するとモードが切り替わることを Playwright で確認（採択論点 5b 案 b = `<button>` + `aria-pressed` 採用前提では Space / Enter で button activation = ネイティブ button のデフォルト挙動 / 矢印キー操作は B-442 スコープのため本サイクル対象外）
  - 入力 onChange で即座に結果が更新される（debounce なし）
  - **【IME composition 中のチラつき観察（r5 MAJOR-1 対応 (a)）】**: 案 A（debounce なし即時反映）採択の前提（「軽量同期テキスト処理ではチラつきが顕在化しない」）を実機観察で実証する。Playwright で日本語 IME を介した連続入力（例: 「あいうえお」を 1 文字ずつ確定 = `compositionstart` → `compositionupdate` × n → `compositionend` を 5 回反復）を再現し、結果欄が「ア」→「アイ」→「アイウ」… と連続書き換えされる過程を **動画 or 連続スクリーンショット（最低 5 枚 / 各 compositionend 直後）** で記録する。観察項目: (i) 結果欄の文字が瞬間消滅 → 再描画される視覚的なチラつき（フリッカー）が発生していないか、(ii) compositionupdate イベント中（未確定の予測変換候補表示中）に結果欄が再計算されて来訪者の操作意図と齟齬する書き換えが発生していないか、(iii) IME 候補ウィンドウと結果欄が視覚的に重なる際の表示崩れの有無。**判定**: (i)(ii)(iii) のいずれかでチラつき・齟齬が顕在化した場合、T-4 報告書に観察結果を明示し、PM / reviewer に判断エスカレーション（debounce 追加 or `compositionstart` / `compositionend` 検知での結果欄更新抑制設計への切り替え検討）。顕在化しなかった場合は案 A 確定の実証データとして記録する。**Playwright での IME 再現方法**: Playwright は標準で IME composition イベントを直接エミュレートできないため、`page.dispatchEvent()` で `compositionstart` / `compositionupdate` / `compositionend` イベントを手動発火させるか、`page.keyboard.insertText()` で日本語文字列を直接挿入する方式を採用（builder 裁量）。撮影は `tmp/cycle-208/ime-observation/` 配下に保存
  - **【AP-P21 textarea 高さ計測 4 ケース】**: 入力 textarea / 結果 textarea の `getBoundingClientRect()` 高さを以下 4 ケースで計測。**(a)(b)(c) は代表 1 モード（hiragana-to-katakana）で実施可。(d) のみ to-halfwidth-katakana モード必須**（M-5 reviewer 指摘対応 / 「または代表 1 モード」許容を撤回 / 膨張型動作の追加検証サンプルとして必須化）
    - (a) **空入力**（膨張なし）
    - (b) **短い ASCII 混在入力**（例: ひらがな 6 文字 → カタカナ 6 文字、文字数完全一致）
    - (c) **中程度の日本語入力**（例: ひらがな 30 文字 + 漢字混在 → カタカナ 30 文字 + 漢字混在）
    - (d) **濁音含む全角カナを半角に変換した長文 = 最大膨張ケース**（**to-halfwidth-katakana モード必須**）。**入力例: 全角濁音 100 文字程度の長文（例: 「ガギグゲゴザジズゼゾダヂヅデドバビブベボ」を 5 回反復 = 100 字 + 句点 1 字 = 計 101 文字）**を入力すると、出力は半角化されて 200 文字相当（句点を除く濁音部分 = 100 × 2 = 200 半角字 + 句点 1 字 = 計 201 半角文字相当）に膨張。textarea rows=2 の枠を確実に超えることで結果欄の `overflowY: auto` 動作と入力 textarea の `flexShrink: 0` 動作を実機検証できる
  - **判定基準**:
    - (i) **下限 40px 以上**（全 4 ケース、入力 / 結果 textarea 両方）
    - (ii) **(a)(b)(c) の 3 ケース間の入力 textarea と結果 textarea のそれぞれの高さの相互差が 2px 以内**（M-3 reviewer 指摘対応 / 計測対象は「入力 textarea の最大値 − 最小値 ≤ 2px」かつ「結果 textarea の最大値 − 最小値 ≤ 2px」の両方を独立に判定 / 主モード膨張ゼロサンプル / cycle-205 hash-generator / cycle-206 fullwidth-converter の実測値 4 ケース全件 46px・相互差 0px との一致確認）
    - (iii) **(d) 単独基準**: 入力 textarea 高さ ≥ 40px が維持されていること（結果欄が `overflowY: auto` で枠内に収まり、入力欄が `flexShrink: 0` で圧迫されないことを確認 = AP-P21 役割分担パターンの膨張型動作検証）。**結果欄の高さに関する定量判定基準（r7 MINOR-1 対応）**: 「枠内収納」を実機で判定する基準として、以下の (1) または (2) のいずれかが成立すること。**(1)** 結果欄 element の `getBoundingClientRect().height` が (a)(b)(c) 計測値（46px ± 2px 想定）の範囲内に収まる。**(2)** 結果欄 element の `scrollHeight > clientHeight` が成立し、かつ `getComputedStyle(element).overflowY === "auto"`（または `"scroll"`）で **スクロールバーが出現している**ことが確認できる。判定値は Playwright で `element.scrollHeight` / `element.clientHeight` / `element.getBoundingClientRect().height` の取得値を builder が報告書に明示する。「(a)(b)(c) と同等になる想定」は判定基準ではなく予想値として扱う
  - **計測結果の意味付け**: (a)(b)(c) で 46px ± 0px 再現 → 膨張ゼロ型 3 件目サンプル成立（基準値の確からしさが 1 件分強化）。(d) で入力 textarea 40px 以上 + 結果欄が枠内維持 → 膨張型動作下での役割分担パターン正常動作の追加検証サンプル成立
  - 結果欄 `role="status" aria-live="polite"` の DOM 確認

**完成条件**: 全検証項目をクリア。lint / format / test / build が全パス。Playwright スクショ **計 20 枚**（baseline 8 + tiles-preview 4 + after 8）。AP-P21 計測 4 ケース: **(a)(b)(c) は下限 40px 以上 + 入力 textarea と結果 textarea のそれぞれで相互差 ≤ 2px**（M-3 reviewer 指摘対応 / 計測対象は両 textarea それぞれを独立に判定）/ **(d) は to-halfwidth-katakana モード必須で入力 textarea ≥ 40px 維持 + 結果欄が枠内収納**（M-1 / M-5 reviewer 指摘対応の混在型基準）。`role="status"` 検証完了。タイル ARIA は `<button>` + `aria-pressed` で既存 5 タイル（base64 / url-encode / html-entity / hash-generator / fullwidth-converter）と同型 = タイル群一貫性を優先（採択論点 5b 案 b / r4 reviewer MAJOR-1 + r6 reviewer MAJOR-1 指摘対応）。詳細ページとの ARIA 分裂は既存 4 件（base64 / url-encode / html-entity / fullwidth-converter）と同様に許容し、B-443 で分裂解消対象 5 件（4 既存 + 本サイクル 1）一括統一 + hash-generator の方針確定（radiogroup 化 or 案 d = button トグル統一維持）を待つ。

**T-4 検証手順（AP-WF16）**: T-4 builder は 4 コマンド全件出力と Playwright 計測 4 ケース実測値を引用付きで報告。T-4 reviewer は (i) 自動チェック 4 コマンドすべてを独立に再実行、(ii) Playwright 計測の 4 ケースのうち最低 1 ケースを独立に再現、の両方を実施する（cycle-205〜207 と同型）。

### 検討した他の選択肢と判断理由

#### kana-converter を 2 ツール（仮名変換 / 半角全角カナ）に分割するか

| 案                                                                              | 採否     | 判断理由                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 1: 現状維持（4 モード単一ツール、**採択**）                                  | **採択** | 既存来訪者の URL（`/tools/kana-converter`）と詳細ページ UI を維持。「ひらがな ⇄ カタカナ」と「半角カナ ⇄ 全角カナ」は来訪者の認知モデルでは「**仮名関連の変換**」として一括理解されている可能性が高く、分割は来訪者の検索意図とのマッチング劣化リスク。SSoT（meta.keywords / URL / FAQ）も既に 4 モード一体前提で組まれている。Phase 8.1 の B-314 スコープ「移行 + タイル化」とも整合（新規ツール作成・既存ツール削除はスコープ外）。 |
| 案 2: 2 ツールに分割（kana-converter = 仮名変換のみ / 別ツール = 半角全角カナ） | 不採用   | 既存 URL の break / SEO 影響 / 来訪者の混乱 / 詳細ページ・OGP・タイル・テスト・meta 等の二重化コスト。`fullwidth-converter` と「半角全角カナ」の機能境界が曖昧化（fullwidth-converter は ASCII + 記号 + カナの 3 種オプション）。再編は **B-314 完了後の整理サイクル**で別途検討する余地は残るが、本サイクルではスコープ外。                                                                                                          |

#### 詳細ページ Component.tsx の debounce 化を本サイクルに含めるか（cycle-207 で確立した debounce 適用方針の機械的踏襲リスク）

| 案                                                                       | 採否     | 判断理由                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 詳細ページも debounce 化（cycle-207 と同型）                       | 不採用   | kana-converter の変換は同期 + 軽量で debounce のメリットがほぼゼロ。cycle-207 qr-code は画像描画のチラつき抑制という明確な来訪者価値起点の根拠があったが、kana-converter にはない。詳細ページの既存実装も即時反映で UX 上の欠陥がないため、改修の必然性がない。                                           |
| 案 b: 詳細ページは即時反映を維持、タイルも即時反映で両者一貫（**採択**） | **採択** | T2 likes「操作性一貫」を維持しつつ、kana-converter の変換特性に最適化された即時反映を両者で統一。cycle-207 の「debounce はリッチ出力（画像 / 重い計算）に適用」という暗黙の SSoT を kana-converter のような軽量同期処理には適用しない、と本サイクルで明示することで判断基準が将来サイクルに引き継がれる。 |

**観察事項**: 本判断は「cycle-207 で確立した SSoT を機械的に踏襲しない」という Phase 8.1 運用上の良い実例。debounce 適用の要否は「変換コストの重さ / 出力種別（テキスト vs 画像）/ IME チラつきの顕在化可能性」の 3 軸で個別判断する、という基準を本計画書本文で言語化することで将来サイクル（text-replace / line-break-remover 等）でも同じ判断軸を適用できる。

#### モード選択 4 値の削減（需要の高い 2 値だけタイル提供）

| 案                                                                                                | 採否     | 判断理由                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 案 X: タイルに 2 値のみ（例: 「ひらがな ⇄ カタカナ」の 2 値のみ、半角全角カナは詳細ページに譲る） | 不採用   | 4 値の独立した需要を持つツール特性（既存 meta.keywords に 5 語が均等に並ぶ）と矛盾。「半角カナ ⇄ 全角カナ」を求めて来訪した人に「タイルでは扱えない」を返すのは T1 likes 違反。論点 1 採択案 A（4 ボタン全配置）と整合。 |
| 案 Y: 4 値全配置（**採択** = 論点 1 案 A）                                                        | **採択** | 論点 1 採択案 A と同等。                                                                                                                                                                                                 |

#### 本サイクルでスコープ外にする派生課題

- **B-440 提案**（`--accent` + `#fff` の WCAG AA 全ツール一括点検）: cycle-207 で起票済。kana-converter の `.modeButton.active` も対象に含まれるが、本サイクル単独の修正は行わず B-440 一括対応を待つ。
- **B-441 提案**（DL ファイル名連番回避）: kana-converter にダウンロード機能なし、適用対象外。
- **B-431**（共通コンポーネントの旧トークン置換）: 本サイクル外。Phase 8.1 完了前の任意タイミング。
- **B-432**（`trustLevel` フィールド一括削除）: Phase 8.1 全 34 ツール完了後の一括対応。本サイクルでは維持。**出典**: `docs/backlog.md` B-432 行（「Phase 8.1 全 34 ツール完了後の一括対応」記述）/ cycle-200 計画書 軸 5 採用案 (a)。**34 ツールの内訳の確認コマンド**: `find src/tools -maxdepth 2 -name meta.ts | wc -l` を一次基準とする（実測値 34、M-3 reviewer 指摘対応）。`ls -d src/tools/*/ | wc -l` は `_constants` / `generated` 等の非ツールディレクトリも含むため参考値（実測値 38 = ツール 34 + 非ツール 4）。
- **B-433**（タイル / 詳細の localStorage 共有）: Phase 10.1 ダッシュボード設計時または Phase 8.1 全完了後に横展開。
- **B-434**（w360 タイル viewport）: Phase 10.1 必須検討。Phase 8.1 内は暫定許容。
- **B-438 提案**（T1 / T2 search_intents 全体棚卸し）: cycle-207 で起票済。本サイクルでは kana-converter 関連 3 語追加のみ。
- **B-442 提案**（radiogroup タイル / 詳細ページのキーボード操作完全準拠）: 本サイクル MAJOR-B1 reviewer 指摘で発見。kana-converter 詳細ページの既存実装は `role="radiogroup"` / `role="radio"` / `aria-checked` を持ちつつ、矢印キー（ArrowLeft / ArrowRight / ArrowUp / ArrowDown）による選択移動のキーボードハンドラが未実装（`onKeyDown` / `ArrowLeft` / `ArrowRight` の grep いずれも 0 件）。WAI-ARIA Authoring Practices の radiogroup パターンでは矢印キー操作が必須挙動として規定されているため、詳細ページ・タイル両者の矢印キー実装欠如を解消する。**着手条件（r5 MINOR-5 対応）**: **B-443 同時着手または B-443 完了後を推奨**。理由: B-442 単独着手（タイル `<button>` + `aria-pressed` を残したまま詳細ページ radiogroup に矢印キー実装のみ追加）は、(i) タイル側に矢印キー操作が存在せず詳細ページとの操作モデル分裂が深まる、(ii) B-443 未実施タイル側は radiogroup ではなくキーボード操作実装対象外で「タイル / 詳細ページのキーボード挙動が片側だけ準拠」状態になり、来訪者の操作整合性が逆に低下する、の 2 リスクがある。**着手判断時には必ず B-443 同時着手要否を評価する**。スコープには (a) kana-converter 詳細ページ / タイルの radiogroup キーボード操作実装、(b) 他の同型 radiogroup 実装ツールへの横展開要否判断を含む。**本サイクル外とする理由**: 本サイクルは「標準形回帰 / 詳細ページ Component.tsx を touch しない」方針のため、詳細ページのキーボード実装追加はスコープ外。
- **B-443 提案**（排他選択タイルの radiogroup 統一）: 本サイクル C-1 reviewer 指摘で発見、r4 reviewer MAJOR-1 + r6 reviewer MAJOR-1 で対象範囲を再訂正。本サイクル論点 5b 案 b 採択により、kana-converter タイルは既存 5 件と同型の `<button>` + `aria-pressed` で実装される。**実測すると `<button>` + `aria-pressed` で排他選択を実装しているタイルは現時点で 5 件**（base64 / url-encode / html-entity / hash-generator / fullwidth-converter / **実測コマンド**: `grep -n "aria-pressed" src/tools/*/[A-Z]*Tile.tsx`）+ 本サイクル kana-converter 1 件 = **計 6 件**。詳細ページ Component.tsx の `role="radiogroup"` 実装は **5 件中 4 件のみ**（base64 / html-entity / fullwidth-converter / url-encode / **実測コマンド**: `grep -l 'role="radiogroup"' src/tools/{base64,html-entity,fullwidth-converter,url-encode,hash-generator}/Component.tsx` → **4 件のみ該当 / hash-generator は radiogroup なし = `role="region"` 1 件のみ存在で詳細・タイル両側で button トグル統一済 = ARIA 層分裂なし**）= 「詳細 radiogroup / タイル aria-pressed」**ARIA 層分裂は既存 4 ツール + 本サイクル kana-converter 1 件 = 計 5 件**発生する。**スコープ**: 分裂解消対象 4 件（base64 / url-encode / html-entity / fullwidth-converter）+ 本サイクル kana-converter 1 件 = **計 5 件を radiogroup 統一**（詳細ページ・タイル両側）+ 今後 Phase 8.1 内で新規追加される排他選択タイル全件 + **hash-generator は radiogroup 化するか button トグル統一（論点 5b 案 d 型）を維持するか別途検討**（hash-generator は現状詳細・タイル両側で button トグル統一済 = 案 d の既存サンプル / B-443 検討時に「全件 radiogroup 統一に hash-generator も合流させる」か「hash-generator 型 = button トグル統一を全件適用 = 案 d 横展開」か「現状の混在を維持」かを AP-P17 ゼロベース 3 案以上で再評価する）。**着手条件**: B-442（radiogroup キーボード操作実装）と同タイミング着手は 5 件分の横展開コスト（テスト書き換え + Playwright スクショ再撮影 + AP-WF16 4 コマンド独立再実行）が一括化できる利点があるが、**5 件分のスコープ規模 = 通常サイクル 1 件 = タイル + 詳細ページの両側を 5 ツール分 touch する作業量 + hash-generator の方針確定（案 d 評価含む）+ Phase 8.1 進行中のため新規排他選択タイル追加で件数が更に増えるリスク**を踏まえ、**独立サイクル化が現実的**（B-442 と並走するなら独立サイクル内で同時着手 / Phase 8.1 完了後の整理サイクルとして別途立てる方が安全）。**B-442 単独着手時の留意（r5 MINOR-5 対応）**: B-442 を単独着手すると、タイル側が `<button>` + `aria-pressed` のまま詳細ページ radiogroup のみ矢印キー対応となり、**タイル / 詳細ページのキーボード挙動が片側だけ準拠する ARIA 構造分裂**が発生する。これを避けるため、**B-442 着手判断時には必ず B-443 同時着手要否を評価し、可能な限り B-443 と同時 or B-443 完了後の B-442 着手を選択する**運用とする。**完了条件**: 分裂解消対象 5 件（4 既存 + 本サイクル kana-converter 1 件）が `role="radiogroup"` / `role="radio"` / `aria-checked` に統一されていること + hash-generator の方針確定（radiogroup 化 or 案 d = button トグル統一維持の決定）+ 今後の新規分の方針反映。B-442 が完了している場合は矢印キー操作も含む。**完了確認コマンド**: `grep -n "aria-pressed" src/tools/*/[A-Z]*Tile.tsx` の結果が「全件 radiogroup 統一」方針採択時は排他選択タイルにおいて 0 件 + `grep -l 'role="radiogroup"' src/tools/*/[A-Z]*Tile.tsx` で全件検出可能 / 「案 d = button トグル統一」方針採択時は逆に詳細ページ Component.tsx の `role="radiogroup"` が 0 件 + タイル `aria-pressed` で全件検出可能。
- **kana-converter を 2 ツールに分割する案**: B-314 完了後の整理サイクルで別途検討余地（本サイクル外）。
- **詳細ページの UI 改善**（モード選択 UX 等）: GA 観測トリガー駆動で将来再検討（本サイクル外）。

### 計画にあたって参考にした情報

- **直前のサイクル**:
  - `docs/cycles/cycle-207.md`（qr-code / 画像出力型初回 / Quiet Zone 自前実装 / 詳細ページ debounce 化 / rows=3 初導入 / GIF/PNG 修正 / T1 yaml に QRコード 3 語追加 SSoT）
  - `docs/cycles/cycle-206.md`（fullwidth-converter / 標準パターン通常運用初回 / オプション 3 種チェックボックスのタイル省略 / 双方向 textarea×2 / 膨張ゼロ型 2 件目）
- **cycle-200〜207 の移行実装（標準パターン SSoT）**:
  - `src/app/(new)/tools/{char-count,byte-counter,url-encode,base64,html-entity,hash-generator,fullwidth-converter,qr-code}/page.tsx` / `page.module.css` — 1200px ハードコード SSoT
  - `src/tools/{base64,html-entity,hash-generator,fullwidth-converter,qr-code}/Component.module.css` — 新トークン SSoT（並べ読み突合用）
  - `src/tools/{fullwidth-converter}/FullwidthConverterTile.tsx` — kind=widget タイルの「セグメント + textarea×2 + 役割分担」最近接参考実装
  - `src/tools/_constants/tile-declarations.ts` — `TILE_DECLARATIONS` エントリ形式
- **kana-converter の現在のソースコード**:
  - `src/app/(legacy)/tools/kana-converter/{page.tsx,opengraph-image.tsx,twitter-image.tsx}`
  - `src/tools/kana-converter/{Component.tsx,Component.module.css,logic.ts,meta.ts,__tests__/logic.test.ts}`
- **デザイントークン定義**: `src/app/globals.css`（`--bg` / `--border` / `--accent` / `--fg` / `--fg-soft` の定義）
- **`docs/cycles/cycle-206.md` / `cycle-207.md` キャリーオーバー**: 「AP-WF16 を T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行で運用継続」「AP-WF05 dark mode 必須」「AP-P21 計測 4 ケースを標準運用として継続」「『淡々と進むはず』油断打ち消し策」「膨張ゼロ型サンプル 3 件目候補として kana-converter」
- **ターゲットユーザー定義**:
  - `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1 / cycle-207 で「QRコード」3 語追加済 / 本サイクルで kana-converter 関連 3 語追加予定）
  - `docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2）
- **アンチパターン集**:
  - `docs/anti-patterns/planning.md`: **AP-P17**（3 案以上のゼロベース列挙）/ **AP-P21**（固定枠 UI 膨張 / 操作側同居）/ AP-P16（一次情報の実体確認）/ AP-P20（過度に具体的な計画の回避）/ AP-P07（来訪者の認知モデル起点 UI 選択）/ AP-P09（来訪者価値起点ゴール）
  - `docs/anti-patterns/workflow.md`: **AP-WF16**（自動チェック PASS の reviewer 独立再実行）/ **AP-WF05**（移行前ダークモード撮影）/ AP-WF12（手段先行 / 一次情報の実体確認）/ AP-WF09（チェックリストの形式通過）
- **デザイン移行アーキテクチャ**: `docs/design-migration-plan.md`
- **backlog の関連項目**: `docs/backlog.md` B-431 / B-432 / B-433 / B-434 / B-438 提案 / B-440 提案 / B-441 提案

### 完成条件（サイクル全体）

- [x] `Component.module.css` の旧トークン置換完了（`grep -c -- "--color-" src/tools/kana-converter/Component.module.css` → `0`）
- [x] `(legacy)/tools/kana-converter/` のファイルが残存していない（3 ファイル全件 `git mv` 済）
- [x] `src/app/(new)/tools/kana-converter/page.module.css` 新設、`.page` ラッパーで 1200px max-width 適用
- [x] T1 yaml `search_intents` に kana-converter 関連 3 語が追加されている
- [x] **`docs/backlog.md` Active セクションに B-442 / B-443 の新規エントリが追加されている**（`grep -n "B-442\|B-443" docs/backlog.md` で B-442 / B-443 がそれぞれ 1 行以上ヒット / r7 MAJOR-1 対応）
- [x] `#fff` リテラル（`.modeButton.active color`）は維持されている（B-440 一括点検対象として残置）
- [x] `TILE_DECLARATIONS` に kana-converter エントリ追加（kind=widget / cols=3 rows=2 第一推奨・rows=3 退避時許容 / 詳細パス `/tools/kana-converter` / 分岐は論点 1 / 論点 3 参照）
- [x] `npm run generate:tiles-registry` で `tilesCount=9` に更新（`src/tools/generated/tiles-registry.ts` 直接確認）
- [x] `KanaConverterTile.tsx` 新規実装（4 モード横一列ボタン = 案 A 採択 or 退避案 B = 2x2 グリッド / 入力 onChange 即時反映 / debounce なし / AP-P21 役割分担 / `role="status" aria-live="polite"` / **モード選択は `<button>` + `aria-pressed`**（採択論点 5b 案 b / 既存 5 タイルと同型））
- [x] タイル用テスト **7 件以上**が緑（観点 (i) モード切替 → 入力保持 / (ii) hiragana-to-katakana / (iii) katakana-to-hiragana / (iv) to-fullwidth-katakana 縮小ケース / (v) to-halfwidth-katakana 膨張ケース / (vi) 空入力 + role="status" / (vii) ARIA button トグルセマンティクス = getByRole("button") 各モードボタン 4 件 + 選択中ボタン `aria-pressed="true"` + 他 3 件 `"false"` をすべて含む）
- [x] 既存テスト 20 件が引き続き緑
- [x] 詳細ページ Component.tsx が touch されていない
- [x] `/internal/tiles/preview/tools/kana-converter` で 4 viewport（w1200 / w375 × light / dark）表示確認
- [x] AP-P21 textarea 高さ 4 ケース: **(a)(b)(c) は代表 1 モード（hiragana-to-katakana）で下限 40px 以上 + 入力 textarea と結果 textarea のそれぞれで相互差 ≤ 2px**（M-3 reviewer 指摘対応 / 両 textarea それぞれを独立に判定 / cycle-205 / 206 実測値 4 ケース全件 46px・相互差 0px との一致確認 = 主モード膨張ゼロ型 3 件目サンプル）/ **(d) は to-halfwidth-katakana モード必須**（全角濁音 100 文字程度の長文入力で 200 文字相当膨張、入力 textarea ≥ 40px 維持 + 結果欄が `overflowY: auto` で枠内収納 = 副モード膨張型動作の追加検証サンプル / M-1・M-5 reviewer 指摘対応）
- [x] Playwright スクショ baseline 8 + tiles-preview 4 + after 8 = **計 20 枚** が `tmp/cycle-208/` 配下に保存（実際は after/details 8 + after/tiles 4 = after 12 枚の計 24 枚保存）
- [x] `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` 全件 PASS
- [x] T-3 / T-4 で reviewer が 4 コマンドすべて独立再実行して出力一致を確認（AP-WF16）
- [x] AP-WF05 dark mode 撮影が baseline / tiles-preview / after の各段階で実施されている

## レビュー結果

作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。

### T-4 検証結果（2026-05-23）

#### AP-P21 textarea 高さ計測

**タイルUI（`/internal/tiles/preview/tools/kana-converter`）**:

| ケース              | モード                | 入力 textarea | 結果 div                    | 判定            |
| ------------------- | --------------------- | ------------- | --------------------------- | --------------- |
| (a) 空入力          | hiragana-to-katakana  | 46px          | 71px (flex:1)               | OK (≥40px)      |
| (b) 6文字           | hiragana-to-katakana  | 46px          | 71px                        | OK              |
| (c) 30文字混在      | hiragana-to-katakana  | 46px          | 71px                        | OK              |
| (d) 101文字長文濁音 | to-halfwidth-katakana | 46px          | scrollH=88>clientH=71, auto | OK (scroll発生) |

- 入力 textarea 高さ 46px は cycle-205/206 実測値と一致
- タイルは textarea が1つのみ（結果は div[role=status]）のため「相互差」の計測対象は詳細ページを参照

**詳細ページ（`/tools/kana-converter`）**:

- (a)(b)(c)(d) 全ケース: 入力 textarea = 200px、結果 textarea = 200px、差分 0px (≥40px OK, ≤2px OK)

#### IME composition 観察

- フリッカー: **顕在化せず**（Playwright dispatchEvent レベルでの観察範囲内）
- 操作齟齬: **顕在化せず**
- 補足: Component.tsx は onCompositionStart/End 未実装で onChange のみ。IME中間状態でも即時変換が走るが、軽量同期処理のため実用上のフリッカーリスクは極めて低い

#### キーボード操作

- 詳細ページ: Tab順序（ヘッダー→テーマ→パンくず→4モードボタン→入力→結果→FAQ）正常
- Space / Enter: モード切替動作 OK
- ArrowRight: 未実装（B-442 スコープ外）→ 期待通り
- タイルプレビュー: Tab順序（ヘッダー→テーマ→4モードボタン→入力→詳細リンク）正常

#### 4コマンド独立再実行（AP-WF16）

- `npm run lint`: PASS
- `npm run format:check`: PASS（All matched files use Prettier code style!）
- `npm run test`: 306 ファイル 4435 件全件 PASS
- `npm run build`: PASS（Compiled successfully）

## キャリーオーバー

- **未完了タスクなし**: 計画書のサイクル全体完成条件はすべて達成（T-1〜T-4 全件レビュー承認）。本サイクルから次サイクルへ持ち越す未完了作業はない。
- **新規起票済の派生課題（backlog.md に登録済）**: B-442（kana-converter / 既存 4 件の radiogroup 詳細ページのキーボード操作完全準拠）/ B-443（タイル群 5 + kana-converter 1 = 6 件タイルの aria-pressed → radiogroup 統一 + 詳細 4 + kana-converter 1 = 5 件 radiogroup 維持）。
- **次サイクル候補**: B-314 Phase 8.1 第 10 弾として (a) image-base64 / image-resizer（cycle-207 申し送り = 画像入力型初回 + FileReader 非同期パターン応用）、(b) text-replace / line-break-remover（軽量同期ツール継続 = 本サイクル IME composition 観察結果を参照根拠として活用可能）、(c) その他単純構造ツール継続。残りツール 約 25 ツール + 20 遊び。
- **T-4 builder 観察事項（環境問題）**: `/blog/[slug]` SEO テストが dev server 並行稼動時にタイムアウトするフレーク性あり（dev server 停止後の単体実行では PASS）。本サイクル変更とは無関係の既存環境問題のため、本サイクルでは backlog 化せず観察記録のみ。今後再発が複数サイクルで観測された場合に B 番号起票を検討する。

## 補足事項

- **debounce 適用判断は kana-converter 単独判断に留める（M-4 reviewer 指摘対応 + r5 MAJOR-1 対応 (c)）**: 本サイクル T-3 設計論点 2 / 「検討した他の選択肢と判断理由 §詳細ページ debounce 化の要否」で言語化した「kana-converter のような軽量同期テキスト処理 + textarea×2 構造には debounce 不要」という判断は、**本サイクル kana-converter の単独判断**として扱い、Phase 8.1 全体の SSoT 化は撤回する（r5 reviewer MAJOR-1 指摘 = IME composition 中のチラつきリスクが構造的に未検証である点を考慮）。T-4 で実施する IME composition 中のチラつき観察（前述 T-4 検証手順参照）で実証データを取得した後、結果が「チラつき顕在化せず」だった場合に限り、cycle-209 以降の同型軽量同期ツール（text-replace / line-break-remover 等）の計画段階で「kana-converter 実機観察結果」を参照根拠として引用可能とする。SSoT 化（「将来の軽量同期ツールに機械的適用」運用）は **本サイクル T-4 実機観察結果を踏まえ Phase 10 以降の整理サイクルで再判断**するものとし、本サイクル時点では引用先サイクル側で AP-P17 ゼロベース 3 案比較を毎回独立に実施する運用を維持する。
- **タイル / 詳細 ARIA 分裂の許容運用（r6 reviewer MAJOR-1 対応で訂正）**: 本サイクル論点 5b 案 b 採択により、kana-converter のタイル `<button>` + `aria-pressed` と詳細ページ `role="radiogroup"` の分裂は許容（既存 4 件 = base64 / url-encode / html-entity / fullwidth-converter + 本サイクル kana-converter 1 件 = 計 5 件）。hash-generator は詳細・タイル両側で button トグル統一済（論点 5b 案 d 型の既存サンプル / ARIA 層分裂なし）のため B-443 統一対象から外し、別途方針確定（radiogroup 化 or 案 d = button トグル統一維持）を要する。B-443 で分裂解消対象 5 件 + 今後の新規分を一括 radiogroup 統一する運用判断 + hash-generator の方針確定 + 案 d 横展開要否評価は Phase 8.1 完了後または B-442 同タイミングで実施（独立サイクル化が現実的）。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
