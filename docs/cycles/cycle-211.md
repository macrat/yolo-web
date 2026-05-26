---
id: 211
description: B-314 Phase 8.1 第 12 弾 = image-base64 の新デザイン移行 + タイル化（画像入力型タイル初回）
started_at: 2026-05-27T06:58:31+0900
completed_at: null
---

# サイクル-211

このサイクルでは、B-314（ツール・遊び詳細ページの新デザイン移行 + タイル化 / 移行計画 Phase 8.1）の第 12 弾として、`image-base64` ツールを `(legacy)/tools/image-base64/` から `(new)/tools/image-base64/` へ移行し、トップページ用タイルを新規実装する。これは Phase 8.1 における**画像入力型タイル初回**（FileReader 非同期パターン応用 / file input × Canvas / blob → base64 文字列出力）であり、cycle-210 で確立した「複合入力型タイル」SSoT に続く第 2 の新パラダイム導入。

## 実施する作業

- [ ] T-1: 現状把握と移行前 baseline 取得 = 未完了
- [ ] T-2: 詳細ページの (new) 配下移行 + 旧トークン置換 + T1 yaml 棚卸し + 既存 backlog 連動更新 = 未完了
- [ ] T-3: タイル定義（kind=widget + 画像入力型タイル初回 + AP-P21 画像入力型適用パターン）= 未完了
- [ ] T-4: 検証と統合確認（AP-P21 計測 / エラー表示挙動 / 入力前後の構造変化観察 / AP-WF16 全件再実行）= 未完了

## 作業計画

### 目的

#### 誰のために

- **エンジニア / フロントエンド開発者（`docs/targets/Webサイト製作を学びたいエンジニア.yaml` の likes「コピペして使えるスニペットやテンプレート」に該当）**: HTML / CSS / Markdown に画像を Data URI として埋め込みたい / 小さな PNG を文字列化して clipboard 経由でコードへ貼り付けたい / SSR 環境で外部画像参照を避けたい等、「画像 → Base64 文字列」変換を**作業の途中で 1〜2 度だけ呼び出す**来訪者。タイル UI から「ファイルを選ぶ → 即 Base64 文字列を取得」が 2 アクションで完結することがロード要因。
- **T1（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）**: 「画像を Base64 にしたい」「Data URI 化したい」と検索で辿り着く層。likes「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」「コピペで結果を受け取って、すぐ元の作業画面に戻れること」に直結する。ファイルドロップ → 出力文字列のコピーが**詳細ページに飛ばずに完結**することがタイル価値。
- **T2（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）**: 過去 Phase 8.1 で移行した 11 タイルと**操作モデルの一貫性**（タイル末尾の「詳細ページで開く」リンク / コピーボタンの挙動 / `role="status"` 結果欄）を維持する必要がある。画像入力型は構造的に新規だが、共通要素は完全同型に保つ。

#### 何のためにやるのか / どんな価値を提供するか

1. **来訪者価値の核心（CLAUDE.md Decision Making Principle 準拠）**: 既存 `image-base64` は (legacy) 配下に残存しており、ダークモード対応 / 新トークン体系 / モバイルタップターゲットの改善が `image-base64` 利用者にはまだ届いていない。同時にトップページに「画像をドラッグ&ドロップで Base64 化する」最短動線が存在しないため、競合（site24x7 / base64.guru 等）はトップで即操作可能なのに対し yolos.net は詳細ページに 1 階層入る必要がある。本サイクルで両方を解消する。
2. **新デザイン詳細ページ移行**: `Component.module.css` 内の旧トークン（`--color-*` 系）を新トークン（`--bg` / `--fg` / `--accent` / `--danger` / `--danger-soft` 等）に一括置換。旧 → 新トークン対応マッピングは cycle-205〜210 で確立済の SSoT を踏襲し、新規マッピングは原則発生させない（warning 系は cycle-210 で確立済 / image-base64 にはエラー系のみで warning 系トークンは含まれない見込みだが T-1 で実測確認）。
3. **画像入力型タイル初回 SSoT 確立（Phase 8.1 第 12 弾 = 新パラダイム第 3 波）**: cycle-200〜209 で単一 textarea 入力型 10 件 / cycle-210 で複合入力型タイル初回 1 件の SSoT が確立済。本サイクルでは **「File 入力 + 非同期 FileReader + 入力前後で UI 構造が変わるタイル」の SSoT を確立**し、後続の `image-resizer`（cycle-212 候補）/ B-318 / B-371 / B-372 等の画像系ワークフローツール群（複数サイクル相当）に再利用可能な基盤を作る。
4. **画像入力型タイル特有の AP-P21 適用範囲 SSoT 化**: cycle-210 §補足事項 4 項目 (i)(ii)(v)(vi) が複合入力型タイル特有の AP-P21 判定基準を SSoT 化した先例に従い、本サイクルでは「**未選択時 / 選択後で UI 構造が大きく変わる画像入力型タイル**」固有の AP-P21 判定基準適用範囲を §補足事項として明文化する。後続の画像入力型タイル planner（image-resizer 等）が引用する必須 SSoT 基盤となる。

#### viewport 採用方針

AP-WF05 網羅性ルールに従い、cycle-207〜210 と同型の **w375 / w1200 / w1900**（タイルプレビューは w1200 / w375）を採択する。

#### 「重い回」油断打ち消し策

本サイクルは「**画像入力型タイル初回 + ファイル選択 UI + 非同期 FileReader + 入力前後の UI 構造変化**」という 4 重新規性を抱える「重い回」（cycle-210 と同等以上の難度）として、以下を油断なく履行する:

- AP-WF03 / AP-WF05 / AP-WF12 / AP-WF16 / AP-P16 / AP-P17 / AP-P20 / AP-P21 の継続履行（MINOR-1 対応 = AP-WF03 builder 裁量排除 / AP-WF12 既存実体実測 を明示追加 / CRIT-1 / CRIT-2 / CRIT-5 / MAJOR-3 / MAJOR-6 / MAJOR-8 で AP-WF03 適用）。
- 計画書本文に登場するすべての数値 literal に「実測値 / 仕様値 / 推定値 + 経験的暫定値」の 3 分類ラベルを付ける（cycle-210 §R5 同型事故防止メモ準拠 / B-451 暫定運用）。
- 画像入力型タイル AP-P21 計測ケースは「**未選択時 / 選択後**」の 2 系統で実機計測する方針を計画段階で確定（後述 §論点 4 / §論点 8）。
- ファイル容量上限 / 非対応形式 / 読込失敗 / Base64 無効 / Base64 未入力の 5 種エラー文言の最大長を SSoT 候補として計画書に列挙し、実 SSoT は T-4 実機計測で確定（cycle-210 (vi) 同型）。
- 既存 `Component.test.tsx` 不在問題（cycle-210 と同型）は B-449 と同型の新規 backlog として独立扱いとし、本サイクル内では Tile テストのみ新規追加（過剰スコープ膨張を防止）。

### 作業内容

タスク分割の基本は cycle-200〜210 で確立した 4 タスク構成（T-1 現状把握 → T-2 詳細ページ移行 → T-3 タイル定義 → T-4 検証）を踏襲する。具体的なコード / 設定ファイルは builder が決定し、本計画書では各タスクの**目的・実施事項のリスト・完成条件**のみを literal 確定する（AP-P20 過剰具体化を回避）。

#### T-1: 現状把握と移行前 baseline 取得

**目的**: 移行作業の起点を確定し、後工程で「変更前後の差分」を客観的に比較できる素材を揃える。画像入力型タイル特有の「未選択時 / 選択後」UI 構造を計画段階で実体確認する。

**実施事項**:

- `src/tools/image-base64/` 配下のファイル構成、`logic.ts` の export、`meta.ts` の `keywords` / `faq` / `relatedSlugs`、既存テスト件数を grep / Read で実体確認（数値はすべて grep コマンドを併記して引用付き報告 = AP-P16 / AP-WF12 対策）。code-researcher 調査レポートおよび本計画 r2 の planner 実測値（後述）と一致するか T-1 builder が再実測。
- 主要事実の参考値（**実測値ラベル = code-researcher レポート / 直接 Read より引用 / T-1 で再実測必須**）:
  - `Component.tsx` 283 行（**実測値**）/ `logic.ts` 105 行（**実測値**）/ `Component.module.css` 200 行（**実測値**）/ `__tests__/logic.test.ts` 79 行（**実測値**）
  - 既存テスト件数 = **16 件**（**実測値** / `grep -cE '^\s*test\(|^\s*it\(' src/tools/image-base64/__tests__/logic.test.ts` で実測 / **Component.test.tsx 不存在**）
  - `logic.ts` export = `ImageBase64Result` interface + `ParsedImage` interface + `fileToBase64` + `isValidBase64Image` + `parseBase64Image` + `formatFileSize` の **6 件**（**実測値** / `SUPPORTED_MIME_TYPES` は非 export かつ未使用 = `eslint-disable` 付き / T-1 で grep 再実測）
  - `meta.ts` `relatedSlugs` = `["base64", "url-encode", "hash-generator", "image-resizer"]` **4 件**（**実測値**）/ `trustLevel: "verified"`
  - `Component.module.css` の `--color-*` 残存 = **31 箇所 / 9 種**（**実測値 = planner r2 で再実測 / CRIT-1 対応**）。コマンド出力:
    - `$ grep -c "var(--color-" src/tools/image-base64/Component.module.css` → `31`
    - `$ grep -oE "var\(--color-[a-z-]+" src/tools/image-base64/Component.module.css | sort | uniq -c` →
      - `4 var(--color-bg`
      - `2 var(--color-bg-secondary`
      - `6 var(--color-border`
      - `2 var(--color-error`
      - `1 var(--color-error-bg`
      - `8 var(--color-primary`
      - `1 var(--color-primary-hover`
      - `4 var(--color-text`
      - `3 var(--color-text-muted`
  - **warning 系トークン使用の有無**: image-base64 にはエラー文言は `.error` クラス（`--color-error` / `--color-error-bg`）のみで warning 系（黄色系トークン）は使われていない（**実測値** = `grep -E "warning" src/tools/image-base64/Component.module.css` → 0 件 / T-1 で再確認）
- **既存 11 タイル（cycle-200〜210）に「File 入力」「ファイル選択 UI」「FileReader 非同期」を持つタイルが存在しないことの実証**: 全 11 タイル（**実測値**）の `[A-Z]*Tile.tsx` を builder / reviewer 独立に grep（`grep -lE 'FileReader|type="file"' src/tools/*/[A-Z]*Tile.tsx` → 0 件 = **実測値**）。本サイクルが「画像入力型タイルの Phase 8.1 初導入」であることを SSoT として明示。
- `TILE_DECLARATIONS` 現状エントリ件数 = cycle-210 完了時点で **11 件**（**実測値** / `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts` で再実測）
- `meta.ts` の `relatedSlugs` **4 件**（**実測値**）全件実在を grep 実証（`for slug in base64 url-encode hash-generator image-resizer; do ls src/tools/$slug/meta.ts; done`）
- **既存 Component.tsx の UI 構造実測**: encode/decode タブ 2 種 / encode 側はドロップゾーン + 内側非表示 `<input type="file" accept="image/*">` / プレビュー `<img>` / ファイル情報 3 行 / 出力 textarea 2 種（Base64 / Data URI）+ コピーボタン 2 個 / decode 側は textarea + プレビューボタン + プレビュー画像 + ダウンロード `<a>`。エラー文言 5 種（後述 §論点 6）を計画段階で listing。**実装内容は touch しない**（kind=widget 標準パターン継続）が、タイル UI で何を継承するかの判断材料として実測する。**既存 Component.tsx L140-163 実測**: ドロップゾーンは `role="button"` + `tabIndex={0}` + `aria-label="画像ファイルを選択またはドラッグ&ドロップ"` + `onKeyDown` で Enter / Space → `fileInputRef.current?.click()` 経路（**実測値**）が実装済。本パターンを画像入力型タイル SSoT として継承（MAJOR-7 対応 = §論点 3 / §補足事項）。
- **競合調査スクショ取得**: §論点 11 採択結果（必須 3 サイト固定）に従い、baseline スクショ取得時に以下 3 サイトを併せて撮影（保存先 `tmp/cycle-211/competitor-research/`）。実測結果（出力形式）は planner が r2 段階で実測済（MAJOR-3 + MAJOR-6 対応 = §論点 5 / §論点 11 本文参照）。
  - 必須 3 サイト: **base64.guru/converter/encode/image** / **base64-image.de** / **onlinepngtools.com/convert-png-to-base64**（site24x7 は計画段階の WebFetch で 404 を確認 = **実測値**したため代替として onlinepngtools を採用）
  - スクショは「トップ UI が即時操作可能か」「主要出力が Data URI / bare base64 / 両方 / セレクタ式のいずれか」を判定する材料として取得。各サイト 1 枚 = 計 3 枚
- Playwright で移行前のスクリーンショットを取得（**実測値ラベル = 数値内訳**）:
  - **ベース 6 枚**（= w1200 / w1900 / w375 × ライト・ダーク 2 モード）: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 着手前撮影 + dark mode 必須）
  - **画像選択後状態 4 枚**（= encode / decode 2 モード × ライト・ダーク 2 モード）: (i) encode モード = 任意の小さな PNG ファイル選択後の状態 + (ii) decode モード = 有効 Data URI 入力後のプレビュー状態
  - **エラー表示状態 2 枚**（= ライト・ダーク 2 モード × エラー 1 種）: 「10MB 超過 or 非対応形式」のエラー枠表示状態
  - 合計 = baseline **計 12 枚**（**実測値計算 = 6 + 4 + 2 = 12** / 保存先 = `tmp/cycle-211/baseline/`）
- 既存テストの実行確認: `npm run test -- image-base64` で**既存 16 件全件緑**であることを確認（実測コマンド出力を引用付き報告）

**完成条件**:

- [ ] 移行前スクリーンショット **計 12 枚**（**実測値計算 = ベース 6 + 画像選択後 4 + エラー表示 2 = 12**）が `tmp/cycle-211/baseline/` 配下に保存
- [ ] 競合調査スクリーンショット **3 枚**（**仕様値 = MAJOR-6 で 3 サイト固定**）が `tmp/cycle-211/competitor-research/` 配下に保存
- [ ] 既存テスト全件緑 = `npm run test -- image-base64` の出力を引用付き報告（実測値 **16 件**（**実測値**）と T-1 builder 報告値が一致 / **不一致時は実測値を計画書に書き戻し**）
- [ ] grep 数値が planner r2 実測値と一致（`--color-*` 残存数 31 / 9 種 / `logic.ts` export 6 件 / 既存テスト 16 件 / `TILE_DECLARATIONS` 11 件 / warning 系トークン 0 件 / 画像入力型タイル既存 0 件）
- [ ] `meta.ts` `relatedSlugs` **4 件**全件実在を再確認
- [ ] `/internal/tiles/preview/[domain]/[slug]/page.tsx` 相当ルートが既存実装されていることを Read で確認（cycle-210 と同型）

**T-1 検証手順（AP-WF16）**: builder が grep コマンド全件の出力を引用付き報告 / reviewer が最低 1 つ以上を独立再実行 + 既存 11 タイルの「File 入力」「FileReader」grep を独立に実行

---

#### T-2: 詳細ページの (new) 配下移行 + 旧トークン置換 + T1 yaml 棚卸し + 既存 backlog 連動更新

**目的**: 詳細ページを新デザイン体系（1200px 標準 / 新トークン）に統一し、T1 yaml の search_intents 整合性を取り、既存 backlog の対象件数を更新する。

**実施事項**:

- `git mv` で `src/app/(legacy)/tools/image-base64/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `src/app/(new)/tools/image-base64/` 配下に移動
- `src/app/(new)/tools/image-base64/page.module.css` を新設（`.page { max-width: 1200px; margin: 0 auto; width: 100%; }` の標準パターン / 直近 11 ツールと完全同一）。`page.tsx` 側に `<div className={styles.page}>` ラッパー追加
- `src/tools/image-base64/Component.module.css` の旧トークン残存 **31 箇所 / 9 種**（**実測値 = planner r2 実測 / CRIT-1 対応**）を **cycle-203〜210 SSoT マッピング**で一括置換。**置換マッピング表（r2 で全 9 種確定 / cycle-210 L132-145 SSoT 同型）**:

  | 旧トークン              | 件数（実測値） | 新トークン        | マッピング根拠                                                                                                                                                                        |
  | ----------------------- | -------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `--color-bg`            | 4              | `--bg`            | cycle-203〜210 SSoT                                                                                                                                                                   |
  | `--color-bg-secondary`  | 2              | `--bg-soft`       | cycle-205 / cycle-207 SSoT 流用（secondary 系背景 = soft 階層対応）                                                                                                                   |
  | `--color-border`        | 6              | `--border`        | cycle-203〜210 SSoT                                                                                                                                                                   |
  | `--color-error`         | 2              | `--danger`        | cycle-203〜206 SSoT                                                                                                                                                                   |
  | `--color-error-bg`      | 1              | `--danger-soft`   | cycle-203〜206 SSoT                                                                                                                                                                   |
  | `--color-primary`       | 8              | `--accent`        | cycle-203〜210 SSoT                                                                                                                                                                   |
  | `--color-primary-hover` | 1              | `--accent-strong` | cycle-205 / cycle-207 SSoT 流用（hover 強調 = strong 階層対応 / `--accent-hover` は globals.css 未定義のため不採用 = **実測値** `grep -n "accent-hover" src/app/globals.css` → 0 件） |
  | `--color-text`          | 4              | `--fg`            | cycle-203〜210 SSoT                                                                                                                                                                   |
  | `--color-text-muted`    | 3              | `--fg-soft`       | cycle-203〜210 SSoT                                                                                                                                                                   |

  合計 **31 件**置換予定（**実測値**）。T-1 実測値と一致しない場合は本表を再修正。

- 並べ読み突合 grep で他の (new) ツール（base64 / hash-generator / kana-converter / line-break-remover / text-replace）の使用トークンと一致することを確認
- w1900 で本文幅が 1200px（**仕様値 = `tile-grid.ts` および (new) 標準パターン**）に収まっていることを確認
- **詳細ページ Component.tsx は touch しない**（kind=widget 標準パターン継続 / 既存 encode/decode タブ + ドロップゾーン + 2 種出力欄 + ダウンロード機能は visitor 価値が確立済）
- 既存 `<img>` 横の `lgtm[js/xss-through-dom]` インラインコメント等は維持（CSS Module 切替に伴う副作用がないことを T-4 で確認）
- **T1 yaml 追加（MAJOR-8 対応 / r2 で literal 確定 = AP-WF03）**:
  - **既存重複検索**: `grep -nE '画像|Base64|データURI|データ URI|base64|Data URI' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → **0 件**（**実測値 = planner r2 実測**）。画像系検索意図関連語は T1 yaml に未登録。
  - **5 候補語の比較表**（**実測値 = 競合調査 + 既存 Component.tsx UI 観察 / cycle-210 L46-62 同型構造**）:

    | 候補語                   | 採択 | 採択理由 / 不採用理由                                                                                                     |
    | ------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------- |
    | `画像Base64変換`         | ○    | 主検索意図（encode 主用途）/ 競合トップ UI 文言と整合（base64.guru / base64-image.de）                                    |
    | `画像 文字列化`          | ○    | 「画像 → 文字列」の自然語表現 / 競合「image to base64」の日本語等価                                                       |
    | `Data URI 化`            | ○    | HTML/CSS 埋め込み用途の主検索意図（CRIT-5 採択 = 案 E Data URI 主要出力と整合）                                           |
    | `画像 base64 エンコード` | ○    | エンジニア層の英語混在検索 / `Webサイト製作を学びたいエンジニア.yaml` likes と整合                                        |
    | `Base64 画像 デコード`   | ×    | 主用途は encode（§論点 1 採択）/ decode 用語は別サイクル decode 専用タイル起票時に追加（CRIT-6 / §キャリーオーバー 参照） |

  - **2 案以上の比較（AP-P17）**:
    - **案 X = 4 語追加（採択）**: 上記 ○ の 4 語を T1 yaml `search_intents` 末尾に追加（encode 系で網羅性確保 / decode 系は後続）
    - **案 Y = 3 語追加**: `Data URI 化` を除外 → CRIT-5 採択（Data URI 主要出力）と整合せず不採用
    - **案 Z = 5 語追加（decode 含む）**: §論点 1 採択（encode のみ）と矛盾 / decode タイル後続起票時に追加が SSoT 整合的 → 不採用
  - **採択結果 = 案 X / 4 語確定**: `画像Base64変換` / `画像 文字列化` / `Data URI 化` / `画像 base64 エンコード` を T-2 で追加（順序は記載順）

- **backlog 連動更新（CRIT-2 対応 = B 番号衝突解消 / `grep -nE '^\| B-[0-9]+' docs/backlog.md` で B-454 既存 = **実測値** を確認 / 次空き = B-455〜）**:
  - **B-443**（タイル ARIA 統一）: §論点 1 採択 = encode のみのため、タイルに排他選択 UI を持たない → B-443 件数据置き
  - **B-455 新規起票（= image-base64 Component / Tile テスト基盤整備）**: B-449 同型の新規 backlog（着手条件なし / P4 / Component.test.tsx 新規作成スコープ / 起票根拠 = cycle-211 T-1 実測で「Component.test.tsx 不存在 + 16 件 logic test のみ」を確認）
  - **B-453**（複合入力型タイル planner 引用必須 SSoT 昇格）: 本サイクルは画像入力型タイルのため直接的影響なし。未対応のまま放置（B-453 単独で別サイクル対応）

**完成条件**:

- [ ] `/tools/image-base64` が (new) 配下で正常表示（HTTP 200 OK）
- [ ] 旧 (legacy) パスにファイルが残存していない（3 ファイル全件 `git mv` 済）
- [ ] w1200 / w1900 / w375 で表示崩れがない（T-4 Playwright 視覚回帰で確認）
- [ ] `Component.module.css` 内に `--color-*` 系旧トークンが残存しない: `grep -c "var(--color-" src/tools/image-base64/Component.module.css` → `0`
- [ ] T1 yaml に画像系検索意図関連語 **4 語**（**実測値 = r2 で literal 確定** = `画像Base64変換` / `画像 文字列化` / `Data URI 化` / `画像 base64 エンコード`）が追加されている
- [ ] **B-455**（image-base64 Component / Tile テスト基盤整備）が `docs/backlog.md` Active セクションに追記されている
- [ ] `meta.ts` `relatedSlugs` **4 件**全件実在の再確認（touch 不要）

**T-2 検証手順（AP-WF16）**: builder が残存判定 grep / 200 OK 確認 / T1 yaml diff / backlog 更新箇所の grep を引用付き報告 / reviewer が最低 1 つ以上を独立再実行

---

#### T-3: タイル定義（kind=widget + 画像入力型タイル初回 + AP-P21 画像入力型適用パターン）

**目的**: トップページから 1 タップで起動可能なタイル UI を新設。Phase 8.1 第 12 弾の構造的新規性（**画像入力型タイル + ファイル選択 UI + FileReader 非同期 + 入力前後の UI 構造変化**）の運用パターン SSoT を確立する。

**実施事項**:

- **kind 判定**: image-base64 の詳細ページ Component は「タブ + ドロップゾーン + プレビュー + ファイル情報 + 2 種出力 + コピー」で縦に長く、128px タイルセル基準では収まらないため **kind=widget**
- タイル用コンポーネント `src/tools/image-base64/ImageBase64Tile.tsx` を新規実装
  - CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 11 タイルと同型）
  - `role="status" aria-live="polite"` を結果欄（base64 出力 textarea）に付与（既存 11 タイル同型）
  - **論点 1〜12 採択結果（後述）に従って UI を構築**
  - `logic.ts` の `fileToBase64()` を再利用（詳細ページと共通の非同期ロジック）
  - **タイル UI に見せる要素**: §論点 1〜5 で確定（タイルに含めるモード / ファイル入力 UI / 出力欄の種類 / 入力前後の構造）
  - **省略する要素**: §論点 1 採択結果（decode モード省略）/ §論点 5 採択結果（Data URI 省略）/ ファイル情報詳細（MIME / サイズ）はタイル省略可否を builder 判断（タイル枠余裕がある場合のみ簡易表示）
  - 末尾「詳細ページで開く」`<Link>` 配置（既存タイル同型）
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に image-base64 のエントリ追加（**recommendedSize = §論点 2 採択 = 案 第一推奨 cols=3 rows=3 / T-3 Playwright 実機確認で最終確定**）
- `npm run generate:tiles-registry` で codegen 実行（tilesCount: **11**（**実測値**）→ **12**（**実測値計算 = 11 + 1 = 12**））

**T-3 設計論点: タイル用テストの観点**

タイル用コンポーネントのテストを追加する。**最低 12 件**（**経験的暫定値** = cycle-210 = 11 件と同等以上 / MAJOR-4 対応 = 観点 (xi)(xii) を画像入力型タイル固有として追加）を**画像入力型タイル固有の観点**として確立する。各観点の具体的な assertion 文言・入力値・モック実装は builder 裁量（AP-P20 / AP-WF03 過剰具体化を回避）。

- 観点 (i) レンダリング（未選択時の初期描画 = ファイル選択 UI + 詳細リンクが DOM に存在）
- 観点 (ii) **File 選択挙動**（File オブジェクト + FileReader のモック化 / `fileInputRef.current?.click()` 経路 / `e.dataTransfer.files` 経路の 2 系統）
- 観点 (iii) **選択後の UI 構造変化**（base64 出力 textarea + Data URI 出力 textarea + コピーボタン 2 個が DOM に出現 / CRIT-5 採択 = 案 E 両方表示と整合）
- 観点 (iv) **コピーボタン押下挙動**（clipboard API モック検証 + コピー成功 UI 表示 / 2 個のコピーボタンそれぞれ）
- 観点 (v) **エラー 3 種表示**（encode で発生する 3 種 = 容量超過 / 非対応形式 / 読込失敗 / の表示）
- 観点 (vi) ARIA / role="status"（結果欄が `role="status"` + `aria-live="polite"` を持つ）
- 観点 (vii) **ドラッグ&ドロップ挙動**（§論点 3 採択 = 案 A 採用 / onDragEnter / onDragOver / onDrop でファイル受領）
- 観点 (viii) 詳細ページリンク（`/tools/image-base64` を指す）
- 観点 (ix) **`navigator.clipboard` 不在時のフォールバック**（cycle-210 同型 silent fail）
- 観点 (x) **`accept="image/*"` 属性の付与**（input[type=file] に画像のみ受け入れる accept 属性が指定されている）
- 観点 (xi) **`accept="image/*"` 属性 + ファイル種別 reject 時のエラー表示**（MAJOR-4 追加 / 観点 (x) と観点 (v) のクロスケース = 非画像ファイル選択時にエラー枠出現）
- 観点 (xii) **同じファイルを連続 2 回選択した時の挙動**（MAJOR-4 追加 / `input[type=file]` の change イベント再発火確認 = `e.target.value = ""` リセットパターン）

**完成条件**:

- [ ] `TILE_DECLARATIONS` に image-base64 が追加されている（**§論点 2 採択 = cols=3 rows=3**）
- [ ] codegen 成功し `tilesCount=12` になる（**実測値計算 = 11 + 1 = 12**）
- [ ] `ImageBase64Tile.tsx` のテスト **12 件以上**（**経験的暫定値**）が緑（観点 (i)〜(xii) を全て含む）
- [ ] タイル UI 上で「ファイル選択 → 非同期 FileReader → base64 / Data URI 出力 → コピー」がテスト観点 (ii)(iii)(iv) 全件緑 + DOM 検証 PASS（**CRIT-4 対応 = 検証可能命題に置換**）
- [ ] エラー枠 3 種（encode 系）の表示が Playwright スクショで 3 種それぞれ 1 行収納 + 高さ 40px ≤ h ≤ 60px を満たす（**CRIT-4 対応 / 「ファイルサイズが10MBを超えています」を最長文言として SSoT 候補**）
- [ ] 詳細ページ Component.tsx が touch されていない（`git diff src/tools/image-base64/Component.tsx` が空）

**T-3 検証手順（AP-WF16）**: builder が `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の 4 コマンド全件の出力を引用付き報告 / reviewer が 4 コマンド全件を独立再実行

---

#### T-4: 検証と統合確認（AP-P21 計測 / エラー表示挙動 / 入力前後の構造変化観察 / AP-WF16 全件再実行）

**目的**: 「重い回」として AP-WF16 reviewer 独立再実行を含む油断打ち消し策を完全実施し、来訪者に届く品質を保証する。**画像入力型タイル固有の「未選択時 / 選択後」の 2 系統 AP-P21 計測を実施**し、§補足事項として SSoT 化する。

**実施事項**:

- `/internal/tiles/preview/tools/image-base64` での単独レンダリング検証（Playwright w1200 / w375 × ライト / ダーク = **計 4 枚**（**実測値計算 = 2 viewport × 2 モード = 4**） 撮影）
- 移行後のスクリーンショット **計 12 枚**（**実測値計算 = ベース 6 + 画像選択後 4 + エラー表示 2 = 12**） を再撮影（T-1 同型 / `tmp/cycle-211/after-t4/`）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないこと（`/tools/image-base64` で 200 OK）
- タイルプレビュー上の動作確認:
  - 未選択時の表示（ファイル選択 UI / プレースホルダー）
  - 小さな PNG（数 KB）を選択 → base64 出力欄 + Data URI 出力欄 + コピーボタン 2 個出現（CRIT-5 採択 = 案 E）
  - 大きな画像（10MB（**仕様値** = `MAX_FILE_SIZE = 10 * 1024 * 1024`）上限ぎりぎり）を選択 → 同上 + ロード時間観察（§論点 10）
  - **エラー 3 種それぞれの実機表示**: (1) 10MB 超過ファイル → 「ファイルサイズが10MBを超えています」 / (2) 非対応形式（例: .pdf） → 「画像ファイルを選択してください」 / (3) FileReader 強制エラー → 「ファイルの読み込みに失敗しました」（MAJOR-5 対応 = (d) 計測対象文言を「ファイルサイズが10MBを超えています」(19 字) に確定）
  - キーボード操作: Tab で focus → Enter / Space でファイル選択ダイアログ起動（MAJOR-7 対応 = 既存 Component.tsx L140-163 のパターン継承）
- **【AP-P21 計測：画像入力型タイル固有「未選択時 / 選択後」2 系統 + コピー後 = 5 ケース】（MAJOR-5 対応 = (e) 追加）**:
  - **(a) 未選択時** = ファイル選択 UI のみ表示の状態で、ファイル選択 UI / 詳細リンクの `getBoundingClientRect()` 高さを計測
  - **(b) 選択後（小さな画像）** = 数 KB の PNG 選択後、ファイル選択 UI（or 縮退表示）+ base64 出力欄 + Data URI 出力欄 + コピーボタン 2 個 + 詳細リンクの高さを計測
  - **(c) 選択後（大きな画像）** = 上限ギリギリの画像（10MB 未満 / **仕様値**）選択後、同上を計測
  - **(d) エラー表示時** = 10MB 超過ファイル選択直後、エラー文言「ファイルサイズが10MBを超えています」（**実測値 = `src/tools/image-base64/Component.tsx` L? 引用** / 19 字 = **実測値 = 全角換算**）の枠 + ファイル選択 UI + 詳細リンクの高さを計測（出力欄は非表示）
  - **(e) コピーボタン押下後** = (b) 状態で base64 コピーボタンを押下し「コピー済み」表示に切替わった直後、ファイル選択 UI + base64 出力欄 + Data URI 出力欄 + コピーボタン 2 個（うち 1 個「コピー済み」） + 詳細リンクの高さを計測（MAJOR-5 追加）
  - **判定基準**:
    - (i) **下限 40px 以上**（**経験的暫定値** = AP-P21 SSoT / 全ケース、ファイル選択 UI / base64 出力欄 / Data URI 出力欄 / コピーボタン / エラー枠）
    - (ii) **「未選択時 / 選択後」の構造変化を許容**（cycle-210 (ii) で確立した「複合入力型タイル特有の正常変化」を画像入力型でも援用 / **詳細は §補足事項として SSoT 化**）
    - (iii) **(a)→(b) 変化率 ±15%（経験的暫定値）の適用基準**: 単一 textarea タイル基準 ±10%（**経験的暫定値** = cycle-209 引用） / 複合入力型 ±15%（**経験的暫定値** = cycle-210 引用）に続き、**画像入力型は「未選択時 / 選択後」を独立評価する方針**（§論点 8 で確定）。本サイクルが画像入力型 1 サンプル目のため、暫定値 ±15%（**経験的暫定値**）を起点とし、T-4 実測値で SSoT 化する。
    - (iv) **エラー枠 1 行収納基準**: cycle-210 同型 = 実測幅 ≤ 376px（**実測値 = cycle-210 T-4 引用**）+ 1 行収納 + 高さ 40〜60px（**経験的暫定値**）範囲内（3 種のうち最長文言 = 「ファイルサイズが10MBを超えています」(19 字) を計測 / SSoT は T-4 実機計測で確定）
    - (v) **(b)→(e) 変化率 ±15%（経験的暫定値）**: コピー後状態の構造変化を許容範囲内とする（MAJOR-5 追加）
- **【非同期 FileReader 観察】**: cycle-210 IME composition 観察の画像入力型タイル版として、以下を実機観察（保存先 `tmp/cycle-211/file-reader-observation/`）:
  - 小さな PNG（数 KB）/ 中サイズ（500KB）/ 大サイズ（10MB ぎりぎり）の 3 サンプルで FileReader.onload までの所要時間を Playwright で計測
  - ローディング表示の要否は §論点 10 で判断（暫定値: 100ms 超なら spinner 表示候補）
  - エラー時の onerror 経路の挙動確認（強制 FileReader エラーで onerror が発火し、エラー枠が出現するか）
- **【ブラウザ API 確認】** cycle-210 同型 2 項目:
  1. Hydration warning 0 件
  2. ファイル選択ダイアログ起動後の focus 残置（次操作で再度 Tab 移動できること）

**完成条件**:

- [ ] 全検証項目クリア。lint / format / test / build 全 4 コマンド exit code 0 で完了（**実測値 = builder 引用付き報告**）
- [ ] Playwright スクショ枚数: baseline 12 + tiles-preview 4 + after 12 + file-reader-observation 3（**経験的暫定値計算 = 3 サンプル × 1 枚**） + competitor-research 3（**仕様値 = 必須 3 サイト固定**） = **計 34 枚以上**（**実測値計算 = 12 + 4 + 12 + 3 + 3 = 34**）が `tmp/cycle-211/` 配下に保存
- [ ] AP-P21 計測 (a)〜(e) **5 ケース**（**実測値計算 = MAJOR-5 で (e) 追加 / 4 → 5**）実測値が引用付き報告され、§補足事項に SSoT として書き戻し
- [ ] エラー 3 種（encode 系）それぞれが Playwright スクショで 1 行収納 + 高さ 40px ≤ h ≤ 60px を満たす（**CRIT-4 対応 = 検証可能命題**）
- [ ] `role="status"` 検証完了（count=1 / aria-live="polite" が DOM に存在することを `getByRole("status")` で検証 PASS）
- [ ] `TILE_DECLARATIONS` の tilesCount が **11 → 12**（**実測値計算 = 11 + 1**）に増えたことを `src/tools/generated/tiles-registry.ts` で直接 Read 確認
- [ ] ブラウザ API 確認 2 項目 PASS（Hydration warning 0 件 = console 出力 0 件で確認 / focus 残置 = Tab 移動で次要素に focus が移ることを Playwright で検証）
- [ ] FileReader 所要時間ベンチを **3 サンプル**（**仕様値計算 = 数 KB / 500KB / 10MB の 3 サイズ**）取得し §論点 10 採択結果と整合（採択 = 暫定「ローディング表示なし」/ 100ms（**推定値 + 経験的暫定値 = NN/g RAIL 経験則**）超なら spinner 案に切替の PM 判断要否を builder 報告）

**T-4 検証手順（AP-WF16）**: builder が全実測値を引用付き報告 / reviewer が (i) 自動チェック 4 コマンド独立再実行、(ii) AP-P21 計測 **5 ケース**（**実測値計算 = MAJOR-5 で (e) 追加 / 4 → 5**）のうち最低 1 ケースを独立再現、(iii) ブラウザ API 2 項目のうち最低 1 項目を独立再計測

---

### 論点と判断

以下の論点について「採用案 / 検討した他案 / 判断理由」を明記する。**PM 判断は planner が行う**（owner 承認不要）。仮説の根拠が薄い論点は「T-X で実機確認後に確定」と明示する。すべての数値 literal には 3 分類ラベル（実測値 / 仕様値 / 推定値 + 経験的暫定値）を付ける。

#### 論点 1: タイルに含めるモード（encode のみ / encode + decode 両方）

**採用案 = 案 A（encode のみ）/ decode 来訪者の動線改善は §キャリーオーバー で後続サイクル起票候補として保持（CRIT-6 対応）**

- **案 A: encode のみ（画像→Base64）** ← **採択**
  - 来訪者の主用途は「画像を文字列化」（HTML/CSS/Markdown 埋め込み / コード貼り付け）。検索意図「画像 Base64 変換」は encode 方向が主（**推定値 + 経験的暫定値** = 競合 base64.guru / base64-image.de / onlinepngtools のトップが encode 優先 UI で構成されていることから推定 = **実測値 = planner r2 WebFetch 実測**）
  - decode（Base64→画像）の UI 構造は textarea 入力型で、画像入力型タイルとは UI 性質が**全く異なる**。同じタイルに両モードを同居させると `mode` トグル + 2 種の UI を両方収めることになり、タイル枠（**400×N px** = **仕様値** / `tile-grid.ts`）を著しく圧迫
  - 詳細ページには encode/decode 両モードが残存（touch しないため）。「タイルで encode → 詳細ページで decode」の責務分離が成立
  - **decode 来訪者の動線改善は §キャリーオーバー で後続サイクル起票候補として保持**（CRIT-6 対応 / GA データでの encode/decode 利用比率実測は本サイクルスコープ外 / 後続 backlog 検討）
- **案 B: encode + decode 両方（タブ切替）**: タブ切替で UI 性質が大きく変わるため、cols=3 rows=3 でも収まらない可能性が高い。複合入力型タイル + 画像入力型タイルの両 SSoT を 1 サイクルで確立するのは AP-P20 過剰スコープ。後続サイクルで decode 専用タイルを別途追加する選択肢も残せる
- **案 C: decode のみ**: 主用途と乖離。来訪者価値最大化に反する

#### 論点 2: タイルサイズ（cols × rows）

**第一推奨 = cols=3 rows=3（400×400px = 仕様値 = `tile-grid.ts`）/ T-3 Playwright 実機確認で確定**

- **過去 11 タイル**（**実測値** = TILE_DECLARATIONS 件数）**実測値（code-researcher レポート §2 引用）**: cols=3 rows=2（400×264px = **仕様値 = `tile-grid.ts`**）= **9 件**（**実測値**） / cols=3 rows=3（400×400px = **仕様値**）= **2 件**（**実測値** = qr-code / text-replace）
- **画像入力型タイルの構造要素（推定値 + 経験的暫定値）**: タイトル + ファイル選択 UI（ドロップゾーン）+ プレビュー（採用 = §論点 5 採択 = 案 E 両方表示のため一部省略可能性あり）+ base64 出力テキスト + Data URI 出力テキスト + コピーボタン 2 個 + 詳細リンク = **6〜7 要素**（**推定値 + 経験的暫定値** = 案 E 採択で 1 要素増）
- **第一推奨 = cols=3 rows=3（400×400px = 仕様値）の根拠（推定値 + 経験的暫定値）**:
  - cols=3 rows=2（**264px** = **仕様値**）では「ファイル選択 UI **60〜80px**（**推定値 + 経験的暫定値**） + base64 出力欄 ≥ **80px**（**経験的暫定値**） + Data URI 出力欄 ≥ **80px**（**経験的暫定値** = 案 E 採択で追加） + コピーボタン **31px**（**実測値 = cycle-209 引用**） × 2 個 + 詳細リンク **20px**（**経験的暫定値**） + padding/gap **50px**（**経験的暫定値**） = 概ね **350〜400px**（**推定値計算**）」で枠を超過する見込み。プレビューを含めると確実に溢れる
  - cols=3 rows=3（**400px** = **仕様値**）でも厳しいため、§論点 7 で「flex:1 + overflowY:auto」の膨張処理を併用する方針
  - qr-code（cols=3 rows=3 / 画像出力型）の先例と画像入力型タイルはサイズ感が近い
- **退避案**:
  - **(α) cols=3 rows=2（264px = 仕様値）**: 案 E 採択（base64 + Data URI 両方）では収まらないため、§論点 5 を案 B（bare のみ）or 案 D（Data URI のみ）に戻す必要あり。T-3 Playwright PASS の場合のみ採択
  - **(β) cols=4 rows=3（544×400px = 仕様値）**: ファイル選択 UI + プレビュー + 出力欄の 3 セクションを横並びに展開可能。ただし w375 で横スクロール発生リスク（cycle-210 退避案 β と同型 PM 判断 3 軸が必要）
- **T-3 Playwright 実機確認時期**: T-3 builder が第一推奨 cols=3 rows=3 で実装 → w375 / w1200 で枠内収納確認 → PASS なら確定 / FAIL なら PM 判断（cycle-210 退避案フローと同型）

#### 論点 3: ファイル入力 UI（ドロップゾーン / ボタンのみ / 両方）+ アクセシビリティ指針

**採用案 = 案 A（ドロップゾーン + クリックで file dialog 起動 / 既存 Component と同型）/ MAJOR-7 対応 = アクセシビリティ指針を画像入力型タイル SSoT として明示**

- **案 A: ドロップゾーン + クリックで file dialog 起動** ← **採択**
  - 既存 Component.tsx と完全同型 UI = T2 likes「操作性一貫」に合致
  - エンジニア来訪者は D&D に慣れている（**推定値** = `Webサイト製作を学びたいエンジニア.yaml` interests と整合）
  - cols=3 rows=3 枠内なら **80〜100px**（**推定値 + 経験的暫定値**）のドロップゾーン高さが確保可能
- **案 B: ボタン（`<button>` または `<label for="file-input">`）のみ**: D&D に慣れた来訪者の操作性が低下。タイル枠を縦に節約できるが、cols=3 rows=3 採択時は不要な節約
- **案 C: D&D + ボタン両方明示表示**: UI が冗長

**アクセシビリティ指針（MAJOR-7 対応 / 画像入力型タイル SSoT / 既存 Component.tsx L140-163 実装パターン継承）**:

- **実装方式**: `role="button"` + onClick で `inputRef.current?.click()` 経路を画像入力型タイル SSoT として採択（**実測値 = `src/tools/image-base64/Component.tsx` L140-163 引用**）。`<label>` ラップ方式は不採用（既存 Component.tsx と分裂を避ける）
- **キーボード操作**: `tabIndex={0}` 付与 + Tab で focus → Enter / Space キーで file dialog 起動（既存 Component.tsx L146-150 の `onKeyDown` ハンドラパターン継承）
- **aria-label**: 「画像ファイルを選択またはドラッグ&ドロップ」（既存 Component.tsx L145 と同一文言）
- **aria-describedby** 等の補助説明: タイル UI 内のドロップゾーン直下に `<p>` テキスト「クリックまたはドラッグ&ドロップで画像を選択」（既存 Component.tsx L152-154 同型）を配置することで、スクリーンリーダーが操作方法を読み上げる
- **`<input type="file">` の隠蔽**: 既存 Component.tsx L156-163 と同型 = `aria-label="画像ファイル選択"` 付与 + 視覚的に display:none 相当
- 本指針を **§補足事項 (vii)** にも書き残し、後続の画像入力型タイル planner（image-resizer 等）が引用する SSoT 基盤とする

#### 論点 4: ファイル選択前後の構造変化への対応

**採用案 = 案 A（構造変化を許容し、AP-P21 を「未選択時 / 選択後」2 系統で計測する）**

- **本論点が画像入力型タイル特有の SSoT 確立対象**: cycle-210 §補足事項 4 項目 (i)(ii)(v)(vi) が複合入力型タイル特有の AP-P21 適用範囲を SSoT 化した先例に従い、本サイクルでは「未選択時 / 選択後で UI 構造が大きく変わる画像入力型タイル」固有の判定基準を §補足事項として明文化する
- **案 A: 構造変化を許容 + 「未選択時 / 選択後」2 系統独立計測** ← **採択**
  - 画像入力型タイルは構造的に「未選択時 = ファイル選択 UI のみ / 選択後 = 出力欄 + コピーボタンが追加表示」が**正常な仕様**
  - cycle-210 (ii) で「複合入力型タイルでは膨張側 textarea / 結果欄の相互差判定は適用外」とした SSoT を画像入力型タイルに拡張し、「**未選択時 / 選択後の構造比較は適用外**」「**各系統内での AP-P21 (i) 下限 40px / (vi) エラー枠 1 行収納は適用**」とする
  - (a)→(b) 変化率の基準値は §論点 8 で別途扱う
- **案 B: 未選択時の UI に出力欄プレースホルダーを表示**（構造的差異を最小化）: 視覚的にスペースが空く / 未操作状態で「出力欄なのに空」と見える違和感。来訪者価値の観点で案 A が優位
- **案 C: 構造的差異を否定し、選択後のレイアウトを未選択時から表示**: 案 B と同様の問題 + 実装複雑化

#### 論点 5: 出力欄の種類（Data URI / bare base64 / 両方）— CRIT-5 対応で再評価

**採用案 = 案 E（bare base64 + Data URI 両方をタイル表示 / cols=3 rows=3 の rows=3 縦並び）**

- 既存 Component.tsx 実測値: タイル UI で base64（`<textarea rows={4}>` = **実測値**）+ Data URI（`<textarea rows={4}>` = **実測値**）+ コピーボタン **2 個**（**実測値**）+ ファイル情報 **3 行**（**実測値**）= 縦に長い
- **競合実測結果（**実測値 = planner r2 WebFetch 実測 / CRIT-5 / MAJOR-3 / MAJOR-6 対応**）**:

  | 競合サイト                                 | 主要出力形式                                                                                  | 来訪者操作                 |
  | ------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------- |
  | `base64.guru/converter/encode/image`       | **両方 + セレクタ式**（Plain text / Data URI / CSS / HTML/JSON/XML スニペット）               | ドロップダウンで形式選択   |
  | `base64-image.de`                          | **両方（HTML `<img>` タグ + CSS `background-image`）** = Data URI が主要 / bare base64 も表示 | 1 クリックで両方コピー可能 |
  | `onlinepngtools.com/convert-png-to-base64` | **両方（bare base64 がデフォルト / Data URI オプション）**                                    | option toggle で切替       |
  | `site24x7.com/tools/image-to-base64.html`  | **WebFetch 404**（**実測値** = planner r2 で URL 接続不可確認）                               | 計画段階では出力形式未確認 |

  **結論**: 主要競合は **Data URI を主要出力にしているか、両方を提示**。bare base64 のみを主要出力にしているサイトは少数派（**実測値**）。T1（特定の作業に使えるツールをさっと探している人）の主用途「HTML/CSS/Markdown 埋め込み」（計画書 §目的 L22 で明示）には **Data URI が最短動線**。

- **AP-P17 ゼロベース比較（4 案）**:
  - **案 A: Data URI のみ**: HTML/CSS にコピペして即使える / エンジニア来訪者が API リクエスト body 等で「bare base64 のみ」を必要とするケースで Data URI から prefix（`data:image/png;base64,`）を手動除去する必要あり（**1 アクション追加**）
  - **案 B: bare base64 のみ**: bare base64 は API body 等で直接使用可能 / HTML/CSS 埋め込み用途では `data:image/png;base64,` prefix を手動追加する必要あり（**1 アクション追加**）/ T1 主用途と乖離
  - **案 D: Data URI のみ**: 案 A と同等
  - **案 E: bare base64 + Data URI 両方タイル表示（rows=3 縦並び）** ← **採択（CRIT-5 対応）**
    - 来訪者の両ユースケース（HTML/CSS 埋め込み / API body）を **1 タイルで両方完結**（**追加アクション 0**）
    - 競合（base64.guru / base64-image.de / onlinepngtools）と同型 = T2 likes「操作モデルの一貫性」（visitor 学習コスト最小化）
    - コピーボタン 2 個でそれぞれ独立コピー = 来訪者は迷わず必要な形式を取得可能
    - 既存 Component.tsx と完全同型 = 詳細ページ↔タイルの分裂回避
    - **タイル枠収納リスク**: §論点 2 第一推奨 cols=3 rows=3（400px = **仕様値**）で base64 出力欄 + Data URI 出力欄を縦並びにすると概ね **80px × 2 = 160px** + コピーボタン 2 個 + ファイル選択 UI + 詳細リンク = ぎりぎりの収まり（**推定値計算**）。§論点 7 で `flex:1 + overflowY:auto` を併用 + T-3 Playwright 実機確認で確定（FAIL 時の退避 = §論点 2 退避案 (β) cols=4 rows=3 / または案 D Data URI のみへの切替）

- **来訪者価値最大化の根拠**（CLAUDE.md Decision Making Principle 準拠）:
  - 案 E は実装コスト（コピーボタン 2 個 + textarea 2 個 + flex 配置）が案 B / D より大きいが、来訪者が「prefix 手動操作」を回避できる価値が上回る
  - 実装コストを理由に案 B / D を採るのは CLAUDE.md「Implementation cost ... must never be a reason to choose an approach that delivers inferior UX」に反する

#### 論点 6: エラー文言枠 SSoT（5 種の最大長で枠サイズ確定）

**採用案 = §論点 1 採択（encode のみ）に従い、encode 系 3 種をタイルでも表示 / 既存文言を再利用 / 最大長の文言で枠サイズ確定 / SSoT は T-4 実機計測で確定**

- 既存 5 種エラー文言（**実測値ラベル = `src/tools/image-base64/Component.tsx` Read より引用**）:
  - (1) `"ファイルサイズが10MBを超えています"`（全角換算 ≈ 19 字）
  - (2) `"画像ファイルを選択してください"`（全角換算 ≈ 15 字）
  - (3) `"ファイルの読み込みに失敗しました"`（全角換算 ≈ 16 字）
  - (4) `"有効なBase64画像データではありません"`（全角換算 ≈ 19 字）/ ※ decode 採択時のみ / **encode 専用タイルでは表示しない**
  - (5) `"Base64文字列を入力してください"`（全角換算 ≈ 16 字）/ ※ decode 採択時のみ / **encode 専用タイルでは表示しない**
- **§論点 1 採択 = encode のみ → タイル UI で必要なのは (1)(2)(3) の 3 種**
- **最大長 = (1)「ファイルサイズが10MBを超えています」(19 字)** で枠サイズを SSoT 候補に設定
- **計画段階での予測値（推定値 + 経験的暫定値ラベル）**: cycle-210 text-replace エラー枠実測 h=46.09px / w=376px（**実測値 = cycle-210 T-4 引用**）は 17 字程度の文言。本サイクル最大 19 字なら同程度〜やや拡大（概ね h ≈ 46〜50px / w ≤ 376px が想定 / **推定値**）。**実 SSoT は T-4 実機計測で確定**（cycle-210 (vi) 同型方針）
- **判定**: 3 種すべて 1 行収納（折り返しなし）+ 高さ 40〜60px 範囲内 が T-4 完成条件

#### 論点 7: AP-P21 役割分担（画像入力型タイル固有の二分類）

**採用案 = 案 A（操作側 = ファイル選択 UI / 膨張側 = base64 出力欄 + Data URI 出力欄）**

- **案 A: 操作側 `flexShrink:0` = ファイル選択 UI（推奨 **80〜100px** 固定 = **推定値 + 経験的暫定値**）+ コピーボタン（**31px** = **実測値 = cycle-209 引用**） × 2 個 + 詳細リンク / 膨張側 `flex:1 + overflowY:auto` = base64 出力 textarea + Data URI 出力 textarea** ← **採択**
  - cycle-210 text-replace の二分類（操作側 / 膨張側）パターンを画像入力型タイルにも拡張
  - 案 E 採択（§論点 5）で膨張側が 2 つになるため、両者を `flex:1` の縦並びにする / または `flex:1` + 内側で 2 つの textarea を均等分割
  - プレビュー領域を採用する場合は cycle-207 qr-code の `flex:"0 0 auto" + aspectRatio + maxWidth` パターンを援用（**仕様値 + 実測値 = qr-code maxWidth=226px は cycle-207 T-3 引用**）
- **案 B: ファイル選択 UI を `flex:1` で展開**（未選択時の縦スペースを埋める）: 選択後にファイル選択 UI が縮小される際の CLS が大きすぎる。来訪者価値マイナス
- **案 C: プレビューを `flex:1`** : aspect-ratio が無効化される（cycle-207 で既に NG 実証済）

#### 論点 8: 画像入力型タイル AP-P21 (v) 基準値

**採用案 = 案 A（「未選択時 / 選択後」を独立評価し、各系統内で ±15% を経験的暫定値として設定 / 1 サンプル経験的暫定値で確定 / 画像入力型 N≥3 件で見直す = B-456 として起票）**

- 単一 textarea 基準: **±10%（経験的暫定値 = cycle-209 で確立 / cycle-209 (e) で 0.0%）**
- 複合入力型基準: **±15%（経験的暫定値 = cycle-210 で 1 サンプル / B-452 で N≥3 件見直し予定）**
- **画像入力型タイル基準**: 本サイクル T-4 実測で「未選択時 / 選択後」の構造変化が大きいため、**「未選択時 / 選択後」を独立評価**する方針が AP-P21 の趣旨に適合
- **本論点を画像入力型タイル N=1 SSoT として扱う根拠（O-1 対応）**: cycle-210 で複合入力型タイル N=1 段階で暫定 SSoT 化（補足事項 4 項目 + B-452 で N≥3 見直し）した先例と**同型運用**。「画像入力型 N≥3 で見直し」を明示することで、N=1 段階での暫定 SSoT 化は正当（暫定値を後続サイクルで補正する明確な経路 = B-456 が確保されている）
- **案 A: 「未選択時 / 選択後」独立評価 + 各系統内で ±15% を画像入力型タイル暫定値に設定** ← **採択**
  - 各系統内で出力欄が空 → エラー枠表示等の変化（CLS リスク）を **±15%**（**経験的暫定値**）以内で許容
  - 1 サンプル経験的暫定値で確定 → 画像入力型 N≥3 件（image-resizer + B-318 系画像系ツール群が積み上がる cycle-213〜215 前後）で見直す → **新規 backlog として B-456 を T-4 完了処理で起票**（CRIT-2 対応 = B 番号衝突解消 / B-454 既存 + B-455 = Component.test.tsx 整備 / B-456 = 画像入力型 AP-P21 (v) 基準値見直し）
- **案 B: 「未選択時 / 選択後」をまとめて単一系統で評価し ±20%**: 構造変化を含めた単一基準。「未選択 → 選択後」が構造的に正常な変化として扱えなくなる
- **案 C: 画像入力型タイルは AP-P21 (v) 適用外**: SSoT 喪失。複合入力型（cycle-210）で SSoT 化した運用と矛盾

#### 論点 9: 既存テスト基盤（Component.test.tsx 不在問題）

**採用案 = 案 B（B-449 同型の新規 backlog = B-455 起票で別サイクルに送る / 本サイクル内では Tile テスト 12 件のみ新規追加）**

- 現状: 既存 **16 件**（**実測値** / logic.test.ts のみ / T-1 で再実測）/ Component.test.tsx 不存在
- **案 A: cycle-211 で Component.test.tsx 新規整備**: cycle-209 line-break-remover の Component.test.tsx **21 件**（**実測値 = cycle-209 引用**）規模を参考に整備。重要だがサイクル負荷増大（AP-P20 過剰スコープ）
- **案 B: B-449 同型の新規 backlog = B-455 として独立扱い + 本サイクルでは Tile テスト **12 件**（**経験的暫定値**）のみ新規追加** ← **採択**
  - cycle-210 で B-449 を起票した運用パターンを継承
  - 詳細ページは touch しないため本サイクル内の整備緊急性は低い
  - 「Component テスト不在」自体は将来の改修リスクとして backlog で管理
  - **B 番号確定（CRIT-2 対応）**: `grep -nE '^\| B-[0-9]+' docs/backlog.md` で B-454 既存 = **実測値**（cycle-210 完了処理で起票済 = 「PM 即時編集 (b) 経路の差分レビューログ運用明文化」）を確認 / 次空き = **B-455**
- **案 C: Tile テストも省略**: Tile が新規実装なのでテスト必須（不採用）

#### 論点 10: 非同期処理の Tile 内表現

**採用案 = 案 B（ローディング表示なし / T-4 実測で 100ms 超なら案 A spinner に切替）**

- FileReader.readAsDataURL は典型的に数十 ms〜数百 ms（**推定値 + 経験的暫定値**）。10MB 上限 + Chrome 実装で **100〜500ms** 程度の見込み（**推定値**）
- **案 A: spinner（または「読み込み中...」テキスト）表示**: **100ms 超**で発火するパターンが UX セオリー（**推定値 + 経験的暫定値 = NN/g RAIL 経験則**（MAJOR-2 対応 = 「仕様値」ラベルから外す / Nielsen Norman の 100ms は経験則であり書面化された規格ではないため経験的暫定値に統一））
- **案 B: ローディング表示なし** ← **採択**（T-4 実測値次第で再評価）
  - 数十 ms なら不要 / 100ms 程度ならフラッシュ表示で逆効果
  - **T-4 で 3 サンプル（数 KB / 500KB / 10MB）（**仕様値計算** = 10MB は `MAX_FILE_SIZE` 上限）の所要時間を実測**し、最大値が **100ms**（**推定値 + 経験的暫定値 = NN/g RAIL 経験則**）超なら案 A に切替（PM 判断 = builder 報告後）
- **案 C: progress 通知（onprogress callback で進捗バー）**: 10MB 上限なら progress 表示の visitor 価値が小さい。実装複雑化に対して便益が薄い

#### 論点 11: 競合調査の要否

**採用案 = 案 B（必須 3 サイト固定 / 出力形式実測は planner r2 で完了 / T-1 builder はスクショ取得のみ / MAJOR-3 + MAJOR-6 対応）**

- 過去サイクル（cycle-209 line-break-remover / cycle-210 text-replace）では競合 7+ サイトのスクリーンショット調査を実施
- image-base64 はエンジニア向け色が強く競合パターンは比較的画一的だが、**出力形式（bare / Data URI / 両方）の主流は実測しないと判断できない**（CRIT-5 で再評価対象 = 計画段階で実測）
- **案 A: 競合調査スキップ**: 競合 UI を参照せずに設計判断する → CRIT-5 のような採択ミスを再発させるリスク → 不採用
- **案 B: 必須 3 サイト固定 + planner r2 で出力形式実測完了 / T-1 builder はスクショ取得のみ** ← **採択（MAJOR-3 + MAJOR-6 対応）**
  - **必須 3 サイト**（**仕様値 = MAJOR-6 で固定**）:
    1. `base64.guru/converter/encode/image`
    2. `base64-image.de`
    3. `onlinepngtools.com/convert-png-to-base64`（site24x7 は WebFetch 404 = **実測値 = planner r2 実測**で接続不可確認したため代替採用）
  - **出力形式実測は planner r2 で完了**（§論点 5 採択表参照）。T-1 builder は「baseline スクショ取得時に競合トップ UI のスクショも撮影」するのみ（負荷分散）
  - 各サイト 1 枚 = 計 **3 枚**（**仕様値**）を `tmp/cycle-211/competitor-research/` に保存
- **案 C: 標準版（7+ サイト）**: 過剰スコープ。3 サイトで主要パターン（両方 / セレクタ式 / Data URI 主体）を網羅できているため不要

#### 論点 12: 数値 literal 3 分類の適用

**採用案 = 計画書内のすべての数値に分類ラベルを付ける（B-451 未対応時の暫定運用 = cycle-210 §R5 同型事故防止メモを直接引用）**

- cycle-210 で確立した SSoT に従い、計画書内のすべての数値（cols × rows / プレビュー maxWidth / エラー枠想定 h / コピーボタン高さ / FileReader 所要時間想定 等）に対して以下のラベルを付与:
  - **実測値**: Read / grep / DOM 計測で確定（例: `Component.tsx` 283 行 = `wc -l` 引用 / 既存テスト 16 件 = `grep -cE` 引用 / cycle-210 エラー枠 h=46.09px = cycle-210 T-4 実機計測引用）
  - **仕様値**: **書面化された規格 or 自プロジェクト literal**（**MAJOR-2 対応で定義明確化**）に限定。具体例:
    - **書面化された規格**: WCAG / RFC / MIME spec（例: WCAG 2.5.8 下限 24px / 推奨 44px / `accept="image/*"` = MIME spec）
    - **自プロジェクト literal**: ソース内の named constant や定義値（例: 10MB = `MAX_FILE_SIZE = 10 * 1024 * 1024` literal 引用 / `tile-grid.ts` の `TILE_CELL_PX = 128` / cols × rows 寸法）
    - **「経験則」「業界慣習」は仕様値に該当しない**（MAJOR-2 = NN/g 100ms は経験則のため「推定値 + 経験的暫定値」に分類）
  - **推定値 + 経験的暫定値**: 計算式 or 1 サンプル経験値 or 経験則（例: プレビュー領域最小サイズ ≈ 150px は qr-code minHeight 引用 / FileReader 100ms 超 = NN/g RAIL 経験則 / ±15% = 複合入力型から踏襲した経験的暫定値）
- 推定値を SSoT として「literal 確定」する記述は禁止。「予測値」「見込み」「概ね」「程度」等の hedge 表現を必ず併用
- 実 SSoT は T-4 実機計測値に書き戻す方針（cycle-210 §補足事項 3 (vi) 同型）

---

### 検討した他の選択肢と判断理由

cycle-210 完了ノート（B-314 Notes / 次サイクル候補）で示された 3 候補から (a) image-base64 を選択した経緯と、本サイクルで**やらないこと**を明示する。

#### 次サイクル選択肢の比較（再掲 / cycle-210 完了ノート参照）

- **(a) image-base64（採用）**: 画像入力型タイル初回。来訪者ボリュームが大きく（base64 化はエンジニア向けでも image-resizer は一般来訪者層も対象）、新パラダイム確立で後続の image-resizer + B-318 系画像ワークフロー群を一括で前に進める。image-base64 を先にすることで「FileReader → 文字列出力」の単純構造から始めて、image-resizer の「FileReader → Canvas 操作 → blob 出力」へ段階的に複雑度を上げられる
- **(b) regex-tester / text-diff（不採用 / cycle-212 以降に温存）**: 複合入力型タイル 2 件目（B-452 N≥3 蓄積への寄与）。SSoT 引用の最初の適用先として価値は高いが、(a) と比べて新パラダイム確立の波及効果が小さい
- **(c) dummy-text / password-generator 等の単純構造ツール**: 既存パターン踏襲で実装コストは低いが、新パラダイム確立の機会を逸する

#### 本サイクルで「やらないこと」（スコープ外）

- **image-resizer 同時移行**: 「FileReader + Canvas + blob 出力」構造で image-base64 より複雑。本サイクルで両方を扱うのは AP-P20 過剰スコープ。cycle-212 候補として温存
- **Component.test.tsx 新規整備**: §論点 9 採択 = B-449 同型の独立 backlog **B-455** として起票（CRIT-2 対応 = B-454 既存）
- **SVG 拒否方針の変更**: 既存 `parseBase64Image` が `image/svg+xml` を XSS 防止のため拒否（**実測値 = `logic.ts` L75-77**）。本方針は維持（visitor 安全優先）
- **decode モードのタイル取込**: §論点 1 採択 = encode のみ。decode は詳細ページに残存
- **encode UI の操作モデル変更**: 既存 Component.tsx の「ドロップゾーン + クリックで file dialog」を維持（§論点 3）
- **進捗バー（onprogress）導入**: §論点 10 採択 = ローディング表示なし。T-4 実測で 100ms 超なら spinner（案 A）に切替（progress 進捗バーは導入しない）
- **B-451 / B-453 の knowledge 化**: §論点 12 採択 = cycle-210 §R5 + §補足事項 4 項目を直接引用する暫定運用。knowledge 文書新設は別 backlog として独立対応
- **logic.ts の touch**: 既存 6 export（`fileToBase64` / `parseBase64Image` / `isValidBase64Image` / `formatFileSize` + 2 interface）を維持。`SUPPORTED_MIME_TYPES` 非 export 未使用も touch しない（B-432 / B-431 系の一括対応を待つ）

#### 補足: PM 採択判断のメタ整理

論点 1〜12 のうち、論点 2 / 論点 6 / 論点 8 / 論点 10 は **T-X 実機確認後に確定**（暫定 SSoT を計画段階で literal 確定せず、hedge 表現で記述）。それ以外（論点 1 / 3 / 4 / 5 / 7 / 9 / 11 / 12）は計画段階で確定（builder 裁量を排除 / AP-WF03）。

**クロスリファレンス採択案併記（MINOR-4 対応）**:

- §論点 1 採択 = 案 A（encode のみ）
- §論点 2 採択（第一推奨）= cols=3 rows=3（400×400px / T-3 で確定）
- §論点 3 採択 = 案 A（ドロップゾーン + クリックで file dialog 起動）
- §論点 4 採択 = 案 A（構造変化を許容 + 2 系統独立計測）
- §論点 5 採択 = 案 E（bare base64 + Data URI 両方タイル表示 / CRIT-5 対応）
- §論点 6 採択（暫定）= encode 系 3 種をタイルでも表示 / 最長文言 (1) 19 字
- §論点 7 採択 = 案 A（操作側 = ファイル選択 UI / 膨張側 = 出力 textarea 2 個）
- §論点 8 採択 = 案 A（「未選択時 / 選択後」独立評価 + 各系統内 ±15% / B-456 で N≥3 見直し）
- §論点 9 採択 = 案 B（B-455 として独立扱い + Tile テスト 12 件のみ）
- §論点 10 採択 = 案 B（ローディング表示なし / T-4 実測で 100ms 超なら案 A 切替）
- §論点 11 採択 = 案 B（必須 3 サイト固定 / 実測は planner r2 完了）
- §論点 12 採択 = 計画書内すべての数値に分類ラベル付与

---

### 計画にあたって参考にした情報

- `tmp/research/2026-05-27-cycle-211-image-base64-tile-planning-research.md`（本サイクル計画策定調査レポート / AP-P21 現状記述 + 複合入力型 4 項目 + 過去 11 タイル決定パターン + 標準 Tile/Component 構造 + 画像入力型先行議論 + 数値 literal 3 分類 + B-449〜B-453 引用）
- `docs/cycles/cycle-210.md`（複合入力型タイル初回 SSoT 確立 / 数値 literal 3 分類 / AP-P21 二分類 / §補足事項 4 項目 (i)(ii)(v)(vi) / §R5 同型事故防止メモ / 計画書構造の雛形）
- `docs/cycles/cycle-207.md`（画像/SVG 出力型タイル初回 / aspect-ratio + maxWidth + flex:"0 0 auto" の画像領域パターン / rows=3 採択先例 / DL ボタン同居判断）
- `docs/cycles/cycle-209.md`〜`docs/cycles/cycle-200.md`（Phase 8.1 第 1〜10 弾 = 単一 textarea 入力型タイル標準パターン / AP-WF16 / AP-WF05 等の継続履行ベース）
- `docs/design-migration-plan.md`（Phase 8 全体方針 / image-base64 が Phase 8 対象 33 件中の 1 件であることの確認）
- `docs/anti-patterns/planning.md`（AP-P16 / AP-P17 / AP-P20 / AP-P21 各項 / 計画段階のアンチパターンチェックリスト全 21 項）
- `docs/anti-patterns/workflow.md`（AP-WF03 / AP-WF05 / AP-WF12 / AP-WF15 / AP-WF16 等の運用ルール）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1 likes / dislikes / search_intents）
- `docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2 likes 操作性一貫）
- `docs/targets/Webサイト製作を学びたいエンジニア.yaml`（エンジニア層 likes コピペ可能 / dislikes 長すぎる例）
- 既存 `src/tools/image-base64/` 配下のソース（`Component.tsx` 283 行 / `logic.ts` 105 行 / `Component.module.css` 200 行 / `__tests__/logic.test.ts` 79 行 / `meta.ts` / 既存テスト 16 件）
- 既存 `src/app/(legacy)/tools/image-base64/` のページ実装（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイル）
- 既存 11 タイル実装（`src/tools/*/[A-Z]*Tile.tsx` / 特に cycle-207 `QrCodeTile.tsx` および cycle-210 `TextReplaceTile.tsx` を直接参照）
- `docs/backlog.md` B-449 / B-450 / B-451 / B-452 / B-453（cycle-210 起票 / 各項の着手条件・スコープ）

## レビュー結果

### r1 レビュー（FAIL）→ r2 対応結果

**CRIT 指摘（6 件）対応結果**:

- **CRIT-1（`--color-*` 残存数 9 種 31 箇所の literal 書き戻し）**: §T-1 実施事項に planner r2 実測コマンド出力（`grep -c "var(--color-"` → 31 / `grep -oE ... | sort | uniq -c` → 9 種別件数）を引用付き併記。§T-2 実施事項のマッピング表を全 9 種で展開（`--color-bg-secondary → --bg-soft` / `--color-primary-hover → --accent-strong` を literal 確定 / `--accent-hover` は globals.css 未定義のため不採用を実測明示）。
- **CRIT-2（B 番号衝突解消）**: backlog 再実測（B-454 既存 / 次空き B-455）に基づき、B-454 全箇所を **B-455**（image-base64 Component / Tile テスト基盤整備）/ **B-456**（画像入力型タイル AP-P21 (v) 基準値 N≥3 件見直し）に統一。§T-2 / §論点 8 / §論点 9 / §キャリーオーバー / §補足事項 / §やらないこと 全箇所修正。
- **CRIT-3（§実施する作業のチェックリスト展開）**: cycle-210 同型で T-1〜T-4 の 4 項目を「= 未完了」付きで展開。
- **CRIT-4（完成条件の曖昧表現置換）**: T-3 / T-4 完成条件の「機能する」「実機で確認できる」を「テスト観点 (ii)(iii)(iv) 全件緑 + DOM 検証 PASS」「Playwright スクショで 3 種それぞれ 1 行収納 + 高さ 40px ≤ h ≤ 60px」等の検証可能命題に置換。
- **CRIT-5（§論点 5 AP-P17 ゼロベース比較強化 + 採択再検討）**: planner r2 で WebFetch 実測（base64.guru / base64-image.de / onlinepngtools / site24x7=404）を計画書本文に書き戻し。4 案（案 A / B / D / E）で比較し、Data URI 主要出力＝来訪者最短動線の根拠から **案 E（bare + Data URI 両方）採択**に変更。
- **CRIT-6（§論点 1 + §キャリーオーバー の decode タイル予告）**: §論点 1 採択理由に「decode 来訪者の動線改善は §キャリーオーバー で後続サイクル起票候補として保持」を literal 追記。§キャリーオーバー に **B-457 候補**（decode 専用タイル新設）を予告。

**MAJOR 指摘（8 件）対応結果**:

- **MAJOR-1（数値 literal 3 分類ラベル網羅性）**: L66 / L74 / L82 / L139 / L156 / L206 を含む全数値に分類ラベルを付与（実測値 / 仕様値 / 推定値 + 経験的暫定値）。
- **MAJOR-2（NN/g 100ms ラベル統一）**: §論点 10 で「仕様値」を外し「推定値 + 経験的暫定値 = NN/g RAIL 経験則」に統一。§論点 12 で「仕様値 = 書面化された規格 or 自プロジェクト literal」の定義を明文化（経験則は仕様値外）。
- **MAJOR-3（T-1 タスク量過剰 = 競合調査を計画段階で planner 実施）**: planner r2 で WebFetch 競合実測を完了し計画書本文に書き戻し。T-1 builder はスクショ取得のみとする。
- **MAJOR-4（T-3 タイルテスト観点追加）**: 観点 (xi) 「`accept="image/*"` + ファイル種別 reject 時のエラー表示」 + 観点 (xii) 「同じファイル連続 2 回選択時の挙動」を追加し最低 12 件に変更。
- **MAJOR-5（AP-P21 計測 (e) 追加 + (d) エラー文言確定）**: §T-4 に **(e) コピーボタン押下後** を 5 ケース目として追加。(d) 計測対象文言を「ファイルサイズが10MBを超えています」(19 字) に literal 確定。
- **MAJOR-6（競合調査必須サイト確定）**: 必須 3 サイト = base64.guru / base64-image.de / onlinepngtools（site24x7 は WebFetch 404 のため代替）を §論点 11 で固定。
- **MAJOR-7（ファイル選択 UI アクセシビリティ指針）**: §論点 3 / §補足事項 (vii) に画像入力型タイル SSoT として `role="button"` + onClick + `tabIndex={0}` + `aria-label` + `onKeyDown` (Enter / Space) パターンを明示。
- **MAJOR-8（T-2 T1 yaml 追加語 r2 で literal 確定）**: 既存 grep 実測（0 件）+ 5 候補語比較表 + 案 X / Y / Z の 2 案以上比較で **4 語確定**（`画像Base64変換` / `画像 文字列化` / `Data URI 化` / `画像 base64 エンコード`）。

**MINOR 指摘（4 件）対応結果**:

- **MINOR-1（油断打ち消し策に AP-WF03 追加）**: 6 項目 → 8 項目（AP-WF03 / AP-WF12 を明示追加）に拡張。
- **MINOR-2（用語統一 = 画像入力型タイル）**: 計画書全体で「画像入力型タイル」に統一（「画像系タイル」「画像入力型」単独使用を排除）。
- **MINOR-3（§キャリーオーバー 予告項目 3 件）**: B-455 / B-456 / B-457 候補を §キャリーオーバー に予告。
- **MINOR-4（クロスリファレンスに採択案併記）**: §補足: PM 採択判断のメタ整理 配下に「§論点 X 採択 = 案 Y」形式の併記リストを追加。

**Owner / PM 判断観点（2 件）対応結果**:

- **O-1（画像入力型タイル N=1 SSoT 化の妥当性）**: cycle-210 複合入力型タイル N=1 SSoT 化と同型運用である旨を §補足事項 (i)(iv) + §論点 8 採択理由に明示。「画像入力型 N≥3 で見直し」（B-456）を明示することで N=1 暫定 SSoT 化を正当化。
- **O-2（decode タイルキャリーオーバー扱い）**: §キャリーオーバー B-457 候補として後続サイクル起票候補に予告（CRIT-6 と統合対応）。

## キャリーオーバー

- **B-455**（image-base64 Component.test.tsx 新規整備）: T-2 で起票（CRIT-2 + MINOR-3 対応 / cycle-209 line-break-remover の Component.test.tsx 21 件規模を参考 / 着手条件なし / P4）
- **B-456**（画像入力型タイル AP-P21 (v) 基準値 N≥3 件見直し）: T-4 完了処理で起票（CRIT-2 + MINOR-3 対応 / 暫定 ±15% を image-resizer + B-318 系ツール群が積み上がる cycle-213〜215 前後で見直し / 着手条件 = 画像入力型タイル N≥3 件 / P3）
- **B-457 候補**（decode 専用タイル新設）: 後続サイクル候補として保持（CRIT-6 + O-2 + MINOR-3 対応 / image-resizer or B-318 系画像ワークフロー群の後の独立サイクルで判断 / 起票時期は cycle-211 完了処理で PM 判断 / GA データでの encode/decode 利用比率実測が起票判断材料）

## 補足事項

- **(i) 画像入力型タイル特有の AP-P21 適用範囲 SSoT（cycle-210 §補足事項 4 項目と同型運用 / O-1 対応）**: 「未選択時 / 選択後で UI 構造が大きく変わる画像入力型タイル」では、各系統内で AP-P21 (i) 下限 40px / (vi) エラー枠 1 行収納を適用し、「未選択時 / 選択後の構造比較は適用外」とする。N=1 サンプル段階での暫定 SSoT 化は、cycle-210 複合入力型タイル N=1 SSoT 化と**同型運用**（補足事項 + B-452 で N≥3 見直し経路確保）= 後続サイクル planner が引用する SSoT 基盤として正当。
- **(ii) 各系統内変化率 ±15% を画像入力型暫定値とする（§論点 8 採択結果の SSoT 化 / 経験的暫定値）**: 画像入力型 N≥3 件で見直し（B-456）。
- **(iii) エラー文言枠 SSoT（§論点 6 採択 / T-4 実機計測で確定）**: 3 種すべて 1 行収納 + 高さ **40〜60px**（**経験的暫定値**）範囲内。最長文言 = (1)「ファイルサイズが10MBを超えています」(19 字) で枠サイズ確定。
- **(iv) 画像入力型タイル N=1 SSoT 化の根拠（O-1 対応）**: cycle-210 で複合入力型タイル N=1 段階で補足事項 4 項目を暫定 SSoT 化（B-452 で N≥3 見直し経路確保）した先例と**同型運用**。「画像入力型 N≥3 で見直し」（= B-456）を明示することで N=1 段階での暫定 SSoT 化は正当。後続 image-resizer (cycle-212 候補) / B-318 系で N=2 → N=3 と積み上がる過程で本 SSoT を引用 + 検証する。
- **(v) FileReader 所要時間ベンチの SSoT（§論点 10 採択 / T-4 実機計測で確定）**: 3 サンプル（数 KB / 500KB / 10MB）で最大値 < 100ms ならローディング表示なしを SSoT 化 / 100ms 超なら spinner 案に切替（PM 判断）。
- **(vi) 画像入力型タイル decode 動線改善の SSoT（CRIT-6 + O-2 対応 / §キャリーオーバー B-457 候補と整合）**: タイル UI からの decode 動線は本サイクル不採用（§論点 1 採択 = encode のみ）/ 詳細ページに decode 残存 / 後続サイクル B-457 候補で「decode 専用タイル新設」を起票検討。
- **(vii) 画像入力型タイル ファイル選択 UI アクセシビリティ SSoT（MAJOR-7 対応 / §論点 3 採択結果）**: `role="button"` + `tabIndex={0}` + `aria-label="画像ファイルを選択またはドラッグ&ドロップ"` + `onKeyDown` で Enter / Space → `fileInputRef.current?.click()` 経路を画像入力型タイル SSoT として採択。`<input type="file">` 自体は `aria-label="画像ファイル選択"` 付与 + 視覚的に隠蔽。ドロップゾーン直下に `<p>` 補助説明「クリックまたはドラッグ&ドロップで画像を選択」を配置。後続の画像入力型タイル planner（image-resizer 等）が引用する SSoT 基盤。

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
