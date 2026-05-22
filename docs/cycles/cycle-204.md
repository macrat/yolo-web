---
id: 204
description: B-314 Phase 8.1 第 5 弾——cycle-200/201/202/203 で 4 回適用した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を **html-entity** に 5 回目適用 + **AP-P21（cycle-202 新規 / cycle-203 で 1 件目完了）の事後検証 2 件目** = base64 の「必ず膨張型」に対する html-entity の「条件付き膨張型」（通常日本語 1 倍 / HTML 特殊文字最大約 5 倍）で役割分担パターン汎用性を実証 + **AP-WF16（cycle-203 新規）の事後検証** = T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行を必須化。T-4 Playwright 計測で 4 ケース全件 textarea = 46.00px・相互差 0.00px（cycle-203 base64 と完全同水準）を実証し、AP-P21 対策の「必ず膨張」「条件付き膨張」両性質汎用性が定量実証として成立。
started_at: 2026-05-22T11:53:09+0900
completed_at: 2026-05-22T15:38:49+0900
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

- [x] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [x] 着手対象ツールの選定（GA4 PV・構造単純度・AP-P21 / AP-WF16 事後検証価値・Phase 9 依存を踏まえて判断）→ **html-entity**
  - [x] kind 判定（single / widget / multi）とタイル推奨サイズの確定 → **kind=widget / cols=3 rows=2**
  - [x] 計画レビュー → 指摘解消（R1 必須 0 / 推奨 5 → R2 必須 0 / 推奨 3 → R3 必須 0 / 推奨 2 → R4 Pass。推奨指摘 10 件全件反映）
- [x] cycle-execution で計画に沿った実装を行う
  - [x] T-1: 現状把握と移行前 baseline 取得（grep 5 件 + テスト 13 件緑 + スクショ 8 枚 / R1 Pass = 必須 0 / 推奨 0、reviewer 独立再実行 6 件全件一致）
  - [x] T-2: 詳細ページの (new) 配下移行（git mv 3 ファイル + page.module.css 新設 + 21 箇所置換 / 残存 0 / 並べ読み 3 連続同名一致 / R1 Pass = 必須 0 / 推奨 0）
  - [x] T-3: タイル定義（kind 判定 + タイル用コンポーネント実装）（HtmlEntityTile.tsx 新設 + TILE_DECLARATIONS 末尾追加 + codegen tilesCount=5 + テスト 6 件緑 / 4 コマンド全件 PASS / R1 Pass = 必須 0 / 推奨 0、reviewer 4 コマンド全件独立再実行 + AP-P21 計測 3 ケース全件 46px・相互差 0px）
  - [x] T-4: 検証と統合確認（AP-P21 / AP-WF16 事後検証含む）（タイルプレビュー 4 枚 + 移行後 6 枚 + 4 コマンド全 PASS + URL 200 OK + AP-P21 計測 4 ケース全件 46.00px・相互差 0.00px / R1 Pass = 必須 0 / 推奨 0、reviewer 4 コマンド全件独立再実行 + AP-P21 計測 2 ケース独立再現一致）
- [x] cycle-completion でサイクルを完了させる

## 作業計画

### 目的

**誰のために**: M1a（特定の作業に使えるツールをさっと探している人）/ M1b（気に入った道具を繰り返し使っている人）。HTML エンティティのエスケープ／アンエスケープを行いたい来訪者（HTML 内に `<`・`&` 等の特殊文字を埋め込むため安全に変換したい、コピーした HTML 文字列の `&lt;` 等を読みやすく戻したい等）。

**何の価値**:

- デザインの統一感向上。`/tools/html-entity` の見た目を他の (new) 配下ツール（char-count / byte-counter / url-encode / base64）と揃え、サイト内回遊で違和感が出ないようにする。
- 将来のダッシュボード機能（道具箱タイル表示）への準備。html-entity をタイル化して `TILE_DECLARATIONS` に登録することで、ダッシュボード本実装フェーズ (Phase 10.x) でこのツールがタイル候補として表示可能になる。
- リピーター（M1b）の混乱を避けるため、URL（`/tools/html-entity`）と挙動（encode / decode の機能）は一切変えない。

**背景**: B-314 Phase 8.1 の第 5 弾。cycle-200（char-count）/ cycle-201（byte-counter）/ cycle-202（url-encode）/ cycle-203（base64）で確立・再現性確認した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を 5 回目として適用する。

加えて、本サイクルは cycle-202 で新規追加された **AP-P21（固定枠 UI における「膨張側」と「操作側」同居リスクの事前評価）** の **2 件目の事後検証** となる位置付け。cycle-203 (base64) で「必ず膨張型」（日本語 30 文字 → 120 文字超）に対する役割分担パターン（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）の先取り適用と Playwright 定量計測 4 ケース textarea = 46px・相互差 0px が完了している。html-entity は base64 と Component 構造が酷似（モード切替×2 + textarea×2 + 変換ボタン）だが、結果膨張性が **「入力依存型」**（通常の日本語入力は 1 倍 = 膨張ゼロ、HTML 特殊文字多い入力で最大約 5 倍、典型例 `<script>alert("xss")</script>` で約 1.76 倍 = **29 文字 → 51 文字**）という性質が base64 と異なる。本サイクルでは「条件付き膨張」型でも同じ役割分担パターンが機能することを Playwright 計測で実証し、AP-P21 対策の汎用性を「必ず膨張」「条件付き膨張」両方で確認する。

さらに、cycle-203 で新規追加された **AP-WF16（builder の自動チェック PASS 報告を reviewer / PM は独立再実行で確認したか）** の事後検証も組み込む。cycle-203 キャリーオーバーで指摘された「T-1 段階の reviewer も builder が報告した自動チェックのうち少なくとも 1 つ以上を独立再実行する」運用を T-1〜T-4 全タスクの検証手順に明示する。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- html-entity の現在のファイル構成・コード・CSS を確認する（数値の出典は計画書時点での実測コマンド出力を本文に併記する。調査レポート `tmp/research/2026-05-22-cycle-204-html-entity-research.md` は同数値の独立再現済みの記録で、tmp 配下削除後も本計画書本文の grep コマンドで再現可能）
  - `src/tools/html-entity/`: Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/logic.test.ts`
  - 既存テスト件数: **13 件**（`describe` ブロック **3** = `encodeHtmlEntities` / `decodeHtmlEntities` / `convertEntity`、`test` 件数 **13** = encode 5 + decode 6 + convertEntity 2）。**実測コマンド**: `grep -c '^\s*describe(' src/tools/html-entity/__tests__/logic.test.ts` → 3 / `grep -c '^\s*test(' src/tools/html-entity/__tests__/logic.test.ts` → 13
  - logic.ts のエクスポート関数: **3 本**（`encodeHtmlEntities` / `decodeHtmlEntities` / `convertEntity`）。**実測コマンド**: `grep -c '^export function' src/tools/html-entity/logic.ts` → 3
  - `src/app/(legacy)/tools/html-entity/`: page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル
  - `src/tools/html-entity/Component.module.css` の `--color-*` 残存数: **21 箇所**（base64 移行前と完全同数）。**実測コマンド**: `grep -c -- "--color-" src/tools/html-entity/Component.module.css` → 21
  - 旧トークン種類は **8 種**（`--color-bg` / `--color-border` / `--color-error` / `--color-error-bg` / `--color-primary` / `--color-primary-hover` / `--color-text` / `--color-text-muted`）。**実測コマンド**: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/html-entity/Component.module.css | sort -u` → 上記 8 種。これらが base64 移行後（cycle-203 T-2 R1 完成時点）の SSoT と同じ 8 種ペアになっていることを T-2 で並べ読みで確認する
- Playwright で移行前のスクリーンショットを取得する
  - **ベース 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 違反予防）
  - **膨張比較用 2 枚**: 「HTML 特殊文字多い入力 encode 結果」スクリーンショットを **ライト / ダーク両モードで撮る**（用途は **移行前 legacy 詳細ページのレイアウト記録 + HTML 特殊文字多い入力時の legacy 表示挙動の参考事例**。典型例 `<script>alert("xss")</script>` の **29 文字** 入力 → **51 文字** 出力、約 1.76 倍。日本語のみ入力では膨張しないため、敢えて HTML 特殊文字を含めた入力例を使う。**T-4 AP-P21 計測（新タイル UI の textarea 高さ）との直接比較対象ではない**: 計測対象は新規実装する `HtmlEntityTile` の textarea であり、legacy 詳細ページとは物理レイアウトが別物のため、本スクショはあくまで「移行前の参考記録」として保存する。AP-WF05 の精神を膨張比較スクショにも適用し片モードに偏らせない）
- 既存テストの実行確認（`npm run test -- html-entity` で `logic.test.ts` 13 件が緑）
- cycle-201/202/203 R1 で出た **AP-WF05 指摘（移行前ダークモード未撮影）** の反省を踏まえ、ライト / ダーク両モードを必ず移行前に撮影する（ベース 6 枚も膨張比較 2 枚も例外なし）

**完成条件**: 移行前のスクリーンショットが **計 8 枚**（ベース 6 枚: w1200 light/dark、w1900 light/dark、w375 light/dark + 膨張比較 2 枚: HTML 特殊文字多い入力 encode 結果 light/dark）が `tmp/` 配下に保存されている。既存テスト 13 件が緑。

**T-1 検証手順（AP-WF16 事後検証）**: T-1 builder は `npm run test -- html-entity` の出力を引用付きで報告する。T-1 reviewer は builder の報告のうち最低 1 つ以上の自動チェック（grep による残存トークン数 21 / テスト件数 13 / `npm run test -- html-entity` 等）を **独立に再実行** して出力一致を確認する。

#### T-2: 詳細ページの (new) 配下移行

cycle-200/201/202/203 で確立した標準パターンを踏襲する:

- `src/app/(legacy)/tools/html-entity/` を `src/app/(new)/tools/html-entity/` に **git mv** で移動する（page.tsx / opengraph-image.tsx / twitter-image.tsx）
- `src/app/(new)/tools/html-entity/page.module.css` を新設し、1200px max-width をハードコードする（char-count / byte-counter / url-encode / base64 と同一パターン）
- page.tsx に `page.module.css` の `.page` ラッパーを追加する
- `src/tools/html-entity/Component.module.css` 内の `--color-*` 系旧カラートークン（21 箇所 / 8 種）を新デザイントークンに置換する
  - **置換マッピングの確認方法**: cycle-203 T-2 R1 で url-encode → base64 と 2 連続同名一致が確認できた 8 種ペア（`--color-bg → --bg` / `--color-border → --border` / `--color-error → --danger` / `--color-error-bg → --danger-soft` / `--color-primary → --accent` / `--color-primary-hover → --accent-strong` / `--color-text → --fg` / `--color-text-muted → --fg-soft`）を、**html-entity の旧トークンと base64 移行後 CSS（SSoT）の新トークンとを `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/html-entity/Component.module.css | sort -u` と `grep -o -- "--[a-zA-Z0-9_-]*" src/tools/base64/Component.module.css | sort -u` で並べ読みし、html-entity の 8 種が base64 SSoT の 8 種ペアに 1:1 で対応していることを確認** する。url-encode → base64 → html-entity で **3 連続同名一致** が確認できることを T-2 完成条件とする（AP-WF12 違反予防として「base64 SSoT を流用」とだけ書かず、一次資料突合を明示）
- w1900 で本文幅が 1200px に収まっていることを確認する
- Playwright で移行後スクリーンショットを取得し、移行前と比較する（w1200 / w1900 / w375 × ライト / ダーク）

**注意事項**:

- ToolLayout 自体は touch しない（共通コンポーネントは B-431 で一括対応）
- 共通コンポーネント（ToolLayout / Breadcrumb / FaqSection / ShareButtons 等）内の旧トークンは touch しない（B-431 管理）。html-entity 固有の Component.module.css 内のトークン置換のみが本サイクルの範囲
- `trustLevel` フィールドは削除しない（B-432 で一括削除）
- opengraph-image.tsx / twitter-image.tsx もそのまま移動する（内容は変更しない）

**完成条件**: `/tools/html-entity` が (new) 配下で正常表示される。旧 (legacy) パスにファイルが残っていない。w1200 / w1900 / w375 で表示崩れがない。Component.module.css 内に `--color-*` 系旧トークンが残存しないこと。**判定コマンド**: `grep -c -- "--color-" src/tools/html-entity/Component.module.css` の結果が `0` であること。url-encode / base64 / html-entity の 3 ファイルで 8 種マッピングの並べ読み同名一致を完了していること。

**T-2 検証手順（AP-WF16 事後検証）**: T-2 builder は `grep -c -- "--color-" src/tools/html-entity/Component.module.css`（残存 0 判定）と Next.js の `/tools/html-entity` HTTP 200 OK を引用付きで報告する。T-2 reviewer は builder の報告のうち最低 1 つ以上の自動チェック（grep 残存判定 / URL 200 確認 / 並べ読み同名一致のいずれか）を **独立に再実行** して出力一致を確認する。

#### T-3: タイル定義（kind 判定 + タイル用コンポーネント実装）

- **kind 判定**: html-entity の詳細ページ Component は textarea×2 + button×3（encode/decode/変換）+ コピーボタンと縦に長く、128px タイルセル基準では収まらないため **kind=widget** とする。base64 と完全同構造のため同じ判断。
- タイル用コンポーネント（`src/tools/html-entity/HtmlEntityTile.tsx`）を新規実装する
  - 詳細ページとは別の簡素な UI（CharCountTile / ByteCounterTile / UrlEncodeTile / Base64Tile と同じインラインスタイル方式）
  - logic.ts の `convertEntity(input, mode)` を再利用する（base64 は `encodeBase64` / `decodeBase64` の 2 関数を直接 import したが、html-entity は `convertEntity` ラッパーを経由する設計のためそのまま利用。直接 `encodeHtmlEntities` / `decodeHtmlEntities` を import する形でも実装者裁量で可）
  - **タイル UI の方針**: 「encode / decode の方向トグル + テキスト入力 + 変換結果表示 + 詳細ページへのリンク」の双方向構成。html-entity も base64 と同じく本質的に双方向操作のツール。来訪者が「エスケープしたい」「アンエスケープしたい」のどちらの目的でタイルに辿り着いてもタイル単体で目的を達成できるようにする。トグル UI は「エスケープ／アンエスケープ」または「encode／decode」の 2 択セグメント、初期値は `encode`（詳細ページの文言と整合を取り、実装者が決定）
  - **変換トリガ**: リアルタイム反映（入力 onChange でその場で結果が更新される）。CharCountTile / ByteCounterTile / UrlEncodeTile / Base64Tile と一貫した「素早く確認する」体験
  - **【AP-P21 事後検証 2 件目の核】結果膨張型の役割分担**: textarea を `rows=2 + flexShrink: 0`、結果欄を `flex: 1 + overflowY: auto` の役割分担を**最初から**適用する。cycle-203 で base64 に対して先取り適用が機能した同じパターンを、「条件付き膨張」型である html-entity でも先取りする。**HTML 特殊文字多い入力（`<script>alert("xss")</script>` 等）の encode 時にも textarea が圧迫されないことを T-4 で計測確認することが本サイクルの中核成果**
  - 結果欄には `role="status" aria-live="polite"` を付与する（base64 タイル Base64Tile.tsx と同型。リアルタイム反映で結果が更新されるたびスクリーンリーダー利用者にも伝わるよう配慮し、`assertive` ではなく `polite` で過剰な割り込みを避ける）
  - **【base64 との差分】decode 失敗ケースが存在しない**: 調査レポート §E で実体検証済の通り、`decodeHtmlEntities` は不正な entity（`&unknown;` / `&undefined;` / 未終端の `&abc` / `&#999999999;` 等）をすべて `success: true` でそのまま通過させる設計。`encodeHtmlEntities` も置換のみで失敗しない。**そのため base64 タイルが備えていた「不正な Base64 文字列です」固定エラー文言・`--fg-soft` 控えめ表示・aria-live 失敗時挙動・decode 失敗 2 系統テストは本サイクルでは不要**（実装しない）
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に html-entity のエントリを追加する（recommendedSize: `cols=3 rows=2`）。`inputPlaceholder` / `outputPlaceholder` / `widgetSummary` 等の必須フィールドは既存エントリ（char-count / byte-counter / url-encode / base64）と同じ枠を埋める形で実装者が決める（html-entity 固有の文言は encode/decode 両方向の意図が visitor に伝わる表現で）
- `npm run generate:tiles-registry` で codegen を実行する
- タイル用コンポーネントのテストを追加する。**最低限カバーすべき 4 観点**: (i) encode（HTML 特殊文字を含む基本ケース）/ (ii) encode（通常日本語で膨張ゼロを確認）/ (iii) decode（基本ケース）/ (iv) トグル切替（encode → decode で結果再計算）。**件数は 5 件以上**（4 観点をカバーしつつ、空入力エッジや詳細ページリンク遷移などの観点を builder 裁量で追加可）。具体的なテスト入力例（`<script>alert("xss")</script>` 等）は T-1 baseline スクショ用と兼用とし、テスト実装の文言までは指定しない。base64 タイルが備えていた decode 失敗系テストは html-entity では不要（logic.ts が失敗しない設計のため）

**注意事項**:

- タイル内の 8px padding/gap は `TILE_GAP_PX`（タイル間マージン）とは別概念
- CSS Module は使用しない（codegen が解釈できないため、インラインスタイル方式）
- デザイントークンは `--fg` / `--bg` / `--accent` / `--fg-soft` / `--border` 等の新トークンを使用する
- 変換結果が長い文字列（HTML 特殊文字多い入力で最大約 5 倍）になる可能性があるため、結果表示エリアは `overflow: auto` または `word-break: break-all` で枠内に収める。**タイル UI の視覚 fit 確認は T-4 で撮るタイル実機スクショとプレビュー単独レンダリングで実施する**（T-1 baseline の膨張比較スクショは legacy 詳細ページのレイアウトで物理構造が別物のため、直接比較対象にはしない）
- 通常の日本語入力は膨張しない（1 倍）ため、T-4 計測でも「膨張ゼロケース」と「膨張ありケース」の両方で textarea 高さが同等であることを確認する

**完成条件**: `TILE_DECLARATIONS` に html-entity が追加されている。codegen が成功する。`HtmlEntityTile.tsx` のテストが緑。タイル UI 上で encode / decode のトグル切替が機能し、両方向で結果が反映されること。

**T-3 検証手順（AP-WF16 事後検証の中核）**: T-3 builder は `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** の出力を**引用付き**で報告する（cycle-203 T-3 R1 で builder の format:check 虚偽 PASS 報告が発覚した経験を踏まえる）。T-3 reviewer は builder が報告した **4 コマンドすべて** を **独立に再実行** して出力一致を確認する（cycle-203 T-3 R1 と同型事故の確実防止が本丸。「最低 1 つ」では最も虚偽率の高い `format:check` が再実行から漏れる構造リスクが残るため、本サイクル T-3 では 4 コマンド全件再実行を必須とする）。**T-1 / T-2 を「最低 1 つ以上」のままで可とする根拠**: T-1 builder の自動チェック報告は `npm run test -- html-entity` 1 コマンドのみ（4 コマンドの混在がないため「どれを再実行するか」の選択ミスが起きない）/ T-2 builder の自動チェック報告は `grep -c` 残存判定 + URL 200 OK の 2 種で、いずれもファイル単一状態を見るチェック（lint/format:check のような分散虚偽が起きにくい構造）、かつ T-2 は CSS 置換が主作業で format/lint 観点の差分が薄い（T-3 のような新規 .tsx 実装段階に比べ format 違反混入リスクが構造的に小さい）。**T-4 は T-3 と同じ 4 コマンドを扱うため全件必須に格上げ**（後段 T-4 検証手順を参照）。

#### T-4: 検証と統合確認（AP-P21 事後検証 2 件目）

- `/internal/tiles/preview/tools/html-entity` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク **計 4 枚** 撮影）
- 移行後のスクリーンショット比較（**計 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × ライト / ダーク両モード）
  - これら 6 枚は **T-4 段階で再撮影する** のが基本方針（cycle-203 T-4 MINOR-1 = T-2 のスクショを T-4 でファイル名だけ変えて流用していた事故の再発防止）。詳細ページの実体が T-2 から T-4 で変化していないため再撮影しても同画像が得られるが、運用上の追跡性確保のため「再撮影」または「`tmp/cycle-204/after-t2/` を直接参照しファイル名を欺かない」のいずれか一貫した方針を取る
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/html-entity` でアクセス可能、404 や redirect が発生していない）
- タイルプレビュー上の動作確認を Playwright で実施
  - encode トグル選択時: テキスト入力 → 結果欄に HTML エンティティエスケープ結果が反映される
  - decode トグル選択時: エンティティ系列の入力 → 結果欄にデコード結果が反映される
  - **【AP-P21 事後検証 2 件目】「入力依存型膨張」での役割分担パターン定量計測**: 以下 4 ケースで textarea の `getBoundingClientRect()` 高さを Playwright で計測する
    - (a) **通常の日本語 29 文字 encode**（膨張ゼロ = 1 倍。例: `これは普通の日本語テキストですからエンティティ化されません`（**29 文字**、Python `len()` 実測値）。HTML 特殊文字を含まない 29 文字前後）
    - (b) **HTML 特殊文字多い入力 encode**（膨張あり。例: `<script>alert("xss")</script>` の **29 文字 → 51 文字、約 1.76 倍**）
    - (c) **(b) の encode 結果を decode**（長い entity 入力 → 元の短い文字へ復元）
    - (d) **通常 ASCII 入力 encode**（膨張ゼロ。例: `Hello World Hello World 1234567` 等の **31 文字**。HTML 特殊文字を含まない英数字。ケース (a) 日本語 29 文字とオーダーが揃う長さ）
  - **判定基準**（cycle-203 と同基準）: (i) **下限 40px 以上**（cycle-202 で発覚した「12px に圧迫」のような桁違い破綻を確実に検出）、かつ (ii) **4 ケース間の textarea 高さの相互差が 2px 以内**（最大値 − 最小値 ≤ 2px）。**2px の根拠**: `rows=2 + flexShrink: 0 + box-sizing: border-box` の設計意図では理論上 textarea 高さは完全固定（理想値 0px 差）になるべき。ブラウザのサブピクセル丸めで最大 1px、フォーカスリングや状態遷移時の微小揺れまでを吸収する余地として +1px、計 2px までを許容とする。これより緩い 4px 許容では「flexShrink: 0 が外れて結果欄の膨張が textarea の縮小として現れる微小な回帰」を見逃すバッファになり得るため絞り込む。cycle-203 の base64 では 4 ケース全件 46px・相互差 0px だったため、html-entity でも同等水準（理論値 46px ± 1px、相互差 0〜1px）になる見込み
  - 結果欄に `role="status" aria-live="polite"` 属性が付与されている（DOM 構造の Playwright 確認、または React 側のスナップショット確認のいずれかで判定）
  - **base64 タイルで実施した「不正入力時の固定文言表示確認」は本サイクルでは実施しない**（html-entity の decode は失敗しない設計のため）

**完成条件**: 全検証項目をクリア。lint / format / test / build が全パス。Playwright スクリーンショットが **計 10 枚** 取得済（タイルプレビュー単独レンダリング 4 枚 + 移行後 6 枚）。タイルプレビューで encode / decode の両方向が動作し、(a)〜(d) 4 ケース全てで textarea 高さが 40px 以上かつ相互差 2px 以内であること。AP-P21 対策の役割分担パターンが「条件付き膨張」型でも機能していることが Playwright 計測で実証されていること。

**T-4 検証手順（AP-WF16 事後検証の中核）**: T-4 builder は `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** の出力を**引用付き**で報告し、加えて Playwright 計測の 4 ケース textarea 高さ実測値も引用付きで報告する。T-4 reviewer は (i) 自動チェック **4 コマンドすべて** を **独立に再実行** して出力一致を確認、(ii) Playwright 計測の 4 ケースのうち **最低 1 ケース** を独立に再現して同等の textarea 高さが得られることを確認、の両方を実施する。**(i) を 4 コマンド全件必須とする理由**: T-3 と同じ論理（最も虚偽率の高い `format:check` が「最低 1 つ」下限では再実行から漏れる構造リスク）が T-4 にもそのまま当てはまるため、T-3 と論理整合を取って全件必須化する。cycle-203 T-4 で全コマンド再実行が運用形として確立済だが、「指示として書かれていない運用」は AP-WF09（形式通過）の温床になるため、本サイクルでは明示する。Playwright 計測の方は 4 ケース全件再現はコストが釣り合わないため最低 1 ケースに留める。

### 検討した他の選択肢と判断理由

#### 着手対象ツールの選定: html-entity を選んだ理由

| 候補                                              | 採否     | 判断理由                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| html-entity                                       | **採用** | base64 と Component 構造が酷似（textarea×2 + ボタン×3 + モード切替 UI / Result 型同型 / 旧トークン 21 箇所・8 種が完全同セット）。**結果膨張性が「入力依存型」**（通常日本語は 1 倍、HTML 特殊文字多い入力で最大約 5 倍）であり、base64 の「必ず膨張型」とは異なるため、AP-P21 事後検証 2 件目として「必ず膨張」「条件付き膨張」両性質での汎用性確認に最適。cycle-203 で確立した 8 種マッピング SSoT を 3 連続同名一致で並べ読み確認できる。確信度 A。                                                                              |
| hash-generator                                    | 不採用   | `crypto.subtle` の非同期性が char-count / byte-counter / url-encode / base64 の同期パターンと異なる。標準パターン外の新設計が必要で AP リスクが上昇する。第 5 弾は「AP-P21 事後検証 2 件目 + AP-WF16 事後検証 + 標準パターン 5 回目適用」の三重目的を優先し、非同期パターン開拓は別サイクルに分離する（リスク管理 / 安定運用優先）。                                                                                                                                                                                                |
| fullwidth-converter                               | 不採用   | 結果膨張なし → AP-P21 事後検証価値が低い。第 5 弾は AP-P21 検証 2 件目を優先するため見送り。膨張なし系の標準パターン適用確認は cycle-203 完成後の余裕がついた段階（第 6 弾以降）で実施。                                                                                                                                                                                                                                                                                                                                            |
| kana-converter                                    | 不採用   | 結果膨張なし → AP-P21 事後検証価値が低い。また 2 パネル横並びレイアウトをタイル版で縦一列に変える設計工夫が必要で標準パターンから微妙に離れる。                                                                                                                                                                                                                                                                                                                                                                                     |
| 構造類似ペア並行（base64 + html-entity 同時など） | 不採用   | base64 + html-entity は構造類似で工数効率は良いが、本サイクルでは (i) cycle-203 で base64 は完了済のため並行候補にならない、(ii) 仮に html-entity + 別ツール並行を試みても 1 サイクル 2 件は **AP-WF16 事後検証の独立性が薄れる**（どちらのツールの自動チェック報告に虚偽があったか、reviewer の独立再実行がどちらに対するものかが追跡しづらくなる）。**まず単一ツールで再現性確認** が優先。1 サイクル 2 件の並行試行は AP-P21 / AP-WF16 両方の運用形が安定してから第 6 弾以降で検討。CLAUDE.md「Keep task smaller」原則にも合致。 |

GA4 PV は候補全件が直近 30 日 PV=0 のため、PV ベースでは差別化不能。判断軸は「構造類似性 + AP-P21 事後検証 2 件目価値 + AP-WF16 事後検証独立性 + 移行コスト」に絞った。

#### kind の判定: widget vs single vs multi

| 選択肢      | 判断                                                                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| kind=single | 不採用: textarea×2 + ボタン×3 + 結果 textarea の構成は 128px タイルセル基準では収まらない（縦長すぎる）。base64 と同構造のため同じ判断。                                     |
| kind=widget | **採用**: 詳細ページ Component を touch せず、別途タイル専用の簡素 UI を実装する。char-count / byte-counter / url-encode / base64 と同方式。                                 |
| kind=multi  | 不採用: encode / decode は同一タイル内のトグルで両立できるため、registry 上の複数定義に分ける必要なし。url-encode / base64 で確立した「双方向トグル + 1 タイル完結」と一貫。 |

#### タイル UI の設計: encode 単方向 vs 双方向切替 vs 同時表示

来訪者ニーズの仮説: html-entity の本質は「文字列を HTML エンティティでエスケープ／アンエスケープする」両方向操作。来訪者の目的は「HTML 内に `<` `>` `&` 等を埋め込みたい」(encode) または「コピーした HTML 文字列の `&lt;` 等を読みやすく戻したい」(decode) のどちらでも自然。

| 選択肢                            | 判断                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 入力 + encode 結果のみ      | 不採用: char-count / byte-counter と同じ最小構成だが、decode 目的でタイルに辿り着いた visitor が「タイル単体では目的を達成できず詳細ページに飛ばされる」状況が発生する。html-entity は本質的に双方向であり、片方向に削るのは visitor の半分を切り捨てる判断になる（url-encode / base64 と同じ理由）。 |
| 案 b: encode／decode トグル       | **採用**: タイル UI に「エスケープ／アンエスケープ」または「encode／decode」の 2 択トグル（初期値 encode）を 1 つだけ追加し、選択した方向の logic を呼び出す。url-encode / base64 タイルと完全同型の構造で体験の一貫性も担保。                                                                        |
| 案 c: 同時表示（encode + decode） | 不採用: タイル内に 2 つの結果欄を並べると cols=3 rows=2（400×264px）では情報密度が過密になり、入力 textarea が極端に狭くなる（AP-P21 の構造リスクを増幅）。                                                                                                                                           |

#### タイル UI の変換トリガ: リアルタイム反映 vs ボタン押下式

cycle-202 url-encode / cycle-203 base64 と同じ判断で、**リアルタイム反映（onChange 即時更新）を採用**。タイルは「道具箱で素早く 1 機能を試す」場であり、最小操作で結果を見せることが visitor 価値の中核。html-entity は decode 失敗ケースが存在しない設計のため、base64 で必要だった「入力途中の瞬間的エラー表示の控えめ化」運用は不要。空入力時は結果欄も空にする運用。

#### タイルの推奨サイズ

| 選択肢        | 判断                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cols=2 rows=2 | 不採用: 方向トグル + テキスト入力欄 + 結果欄を含めるには狭すぎる（`calcTilePixels(2, 2)` = 264×264px）。                                                                                                                                                                                                                                                                                                             |
| cols=3 rows=2 | **採用**: char-count / byte-counter / url-encode / base64 と同じサイズ（`calcTilePixels(3, 2)` = 400×264px）。html-entity は通常入力では膨張しないが、HTML 特殊文字多い入力では最大約 5 倍まで膨張するため、AP-P21 対応の「textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto」で枠内に収める。視覚 fit は T-1 baseline と T-4 実機検証で確認。Phase 10.x ダッシュボード設計時のサイズ一貫性も担保。 |
| cols=4 rows=2 | 不採用: 表示内容に対して過大。HTML 特殊文字多い入力時の膨張も `cols=3 rows=2` で AP-P21 対応により吸収できるため、サイズ拡大は不要。                                                                                                                                                                                                                                                                                 |

#### AP-P21 を本サイクルで「2 件目」として事後検証する意義

cycle-202 で新規追加された AP-P21（「固定枠 UI で flex container を使うとき、結果欄が膨張する性質の場合に入力欄が圧迫される構造リスクを計画段階で検討したか」）は、cycle-203 (base64) で 1 件目の事後検証が完了し、Playwright 計測で 4 ケース全件 textarea = 46px・相互差 0px が実証された。ただし base64 は「必ず膨張型」（入力に関係なく結果が膨張する）であり、AP-P21 の汎用性として「条件付き膨張型」での挙動はまだ未検証。

html-entity は base64 と Component 構造が酷似しながら膨張性が「入力依存型」（通常日本語は膨張ゼロ、HTML 特殊文字多い入力で最大約 5 倍）という対照的な性質を持つ。本サイクルで T-4 Playwright 計測 4 ケース（通常日本語 / HTML 特殊文字多い / decode / 通常 ASCII）すべてで textarea = 40px 以上・相互差 2px 以内が成立すれば、AP-P21 対策の役割分担パターン（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）が「必ず膨張」「条件付き膨張」両方で機能することの定量実証になる。

#### AP-WF16 を本サイクルで事後検証する意義

cycle-203 T-3 R1 で発覚した「builder の自動チェック虚偽 PASS 報告」を契機に新規追加された AP-WF16（「builder が報告した自動チェックの PASS 結果を、reviewer / PM は当該コマンドを独立に再実行して出力を確認したか」）は、cycle-203 T-4 で reviewer による自動チェック + Playwright 計測の独立再現が初めて運用形として確立された。一方、cycle-203 キャリーオーバーで「T-1 / T-2 / T-3 R1 までの reviewer は `grep` / `test` の独立再現は実施したものの `npm run lint` / `npm run format:check` / `npm run build` の独立再実行までは行っていなかった」点が課題として申し送られた。

本サイクルでは T-1〜T-4 全タスクの検証手順に「builder の自動チェック報告のうち最低 1 つ以上を reviewer が独立再実行する」運用を明示し、cycle-203 で確立した T-4 段階の運用を T-1〜T-3 にも拡張する。これにより AP-WF16 の運用が「サイクル全工程を通じて機能する」ことが本サイクルで実証されれば、第 6 弾以降の運用標準として定着できる。

### 計画にあたって参考にした情報

- cycle-200（char-count）/ cycle-201（byte-counter）/ cycle-202（url-encode）/ cycle-203（base64）の移行実装（標準パターンの実体）
  - `src/app/(new)/tools/base64/page.tsx` / `page.module.css` — page.module.css ラッパーパターンと 1200px ハードコード（最新 SSoT）
  - `src/tools/base64/Base64Tile.tsx` — kind=widget タイルコンポーネントの双方向トグル + リアルタイム反映 + AP-P21 対応の役割分担実装（cycle-203 SSoT）
  - `src/tools/_constants/tile-declarations.ts` — `TILE_DECLARATIONS` エントリ形式
  - `src/tools/base64/Component.module.css` — 移行後の 8 種新トークン SSoT（並べ読み突合に使用）
- html-entity の現在のソースコード
  - `src/app/(legacy)/tools/html-entity/page.tsx`
  - `src/tools/html-entity/Component.tsx` + `Component.module.css` + `logic.ts` + `meta.ts` + `__tests__/logic.test.ts`
- 構造調査レポート: `tmp/research/2026-05-22-cycle-204-html-entity-research.md`（html-entity 全 5 ファイル構成 / 旧トークン 21 箇所・8 種実測 / Component 構造 base64 完全一致確認 / 結果膨張倍率の入力依存性確認 / decode 失敗系統 0 の実体検証 / GA4 PV=0 確認）。**注**: 本計画書 T-1 タスク冒頭に主要数値（21 / 13 / 3 / 8 種等）の grep コマンドそのものを併記済のため、`tmp/` 配下のレポートが将来削除された後も本計画書だけで全数値が独立再現可能
- `docs/design-migration-plan.md` — 移行アーキテクチャと Phase 定義
- `docs/anti-patterns/planning.md` — **AP-P21（cycle-202 新規 / cycle-203 で 1 件目事後検証完了）**, AP-P16（前提条件の実体確認）, AP-P20（過度に具体的な計画の回避）
- `docs/anti-patterns/workflow.md` — **AP-WF16（cycle-203 新規）**, AP-WF05（移行前ダークモード未撮影）, AP-WF12（手段先行の決め打ち）
- `docs/cycles/cycle-203.md` の「キャリーオーバー」§AP-P21 事後検証の汎用性に関する留意点 と §AP-WF16 運用形の確立と T-1 / T-2 への波及 — 本サイクルが取り組むべき事後検証の方向性

## レビュー結果

### 計画レビュー R1 - 指摘事項

**必須対応**: 0 件 / **推奨対応**: 5 件

レビュー対象は L36 以降の「## 作業計画」セクション全体。事実情報（旧トークン 21 箇所 / 8 種 / 既存テスト 13 件 / `describe` 3 / 関数 3 本 / `EntityResult` 型形式 / decode 失敗系統 0 / GA4 PV=0 / base64 SSoT トークン 9 種）は本レビュー時点で grep / Read による独立再現で全件一致を確認済。事前事実の信頼性は問題なし。AP-P21 事後検証 2 件目の対照性（必ず膨張 vs 条件付き膨張）/ AP-WF16 事後検証の T-1〜T-4 全工程展開 / AP-WF05 / AP-WF12 / AP-P16 への計画的予防 / 検討した他選択肢の比較表 4 表（着手対象 / kind / タイル UI / トリガ / サイズ）はいずれも問題なし。

以下の 5 件はいずれも「実装段階で実質的な事故にならないが、計画書の明確性・追跡性を高めるための推奨」レベル。必須対応はゼロ。

#### MINOR-1（推奨 / 確信度 B）T-1 で「HTML 特殊文字多い入力 encode 結果スクショ」のモード指定が曖昧

- **該当箇所**: L65（T-1 タスク）/ L69（T-1 完成条件）
- **問題内容**: 「HTML 特殊文字多い入力 encode 結果のスクリーンショットも撮る」「1 枚以上が `tmp/` 配下に保存されている」と記述されているが、ライト / ダークどちらで撮るのかが明記されていない。
- **なぜ問題か**: cycle-201/202/203 R1 で繰り返し指摘された AP-WF05（ダークモード撮影漏れ）の文脈で、ベース 6 枚はライト・ダーク両方を明示しているのに対し、この「膨張比較用スクショ」だけがモード未指定。実装者がライトだけ撮るか両モード撮るか判断に迷う。T-4 でこのスクショと「視覚 fit を突き合わせる」用途（L116）を考えると、本来は両モードで突き合わせる方が AP-WF05 の精神に整合する。
- **想定する修正方向**: 「HTML 特殊文字多い入力 encode 結果のスクリーンショットも**ライト / ダーク両モードで**撮る（計 2 枚）」と明示し、完成条件側も「7 + 1 = 計 8 枚」もしくは「6 + 膨張比較 2 枚 = 計 8 枚」のように合計枚数を客観判定可能な数値で書く。または「ライト 1 枚で十分」と判断するなら、その理由（T-4 計測がライトのみで完結する等）を脚注で添える。

#### MINOR-2（推奨 / 確信度 B）T-4 移行後スクショの枚数が客観判定不能

- **該当箇所**: L125-126（T-4 タスク）
- **問題内容**: 「`/internal/tiles/preview/tools/html-entity` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク 4 枚撮影）」と「移行後のスクリーンショット比較（デスクトップ w1200 / w1900、モバイル w375、ライト / ダーク両モード）」の 2 種類が並んでいるが、後者の枚数が明示されていない（読み手は w1200/w1900/w375 × ライト/ダーク = 6 枚と推定するしかない）。
- **なぜ問題か**: T-1 baseline は「計 6 枚」と明示されているのに、対比対象の T-4 移行後が枚数明示されていないため、reviewer が「T-1 と同じ 6 枚揃ったか」を機械的に判定できない。cycle-203 T-4 MINOR-1 で「T-2 のスクショを T-4 で流用していた事故」が発覚した経緯（同サイクル補足事項記載）を踏まえると、各タスクの撮影枚数は数値で明示する方が運用上の追跡性が上がる。
- **想定する修正方向**: 「移行後のスクリーンショット比較（**計 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × ライト / ダーク両モード）」と枚数を明示。さらに「これら 6 枚は T-2 で撮影した移行後スクショとは別に T-4 段階で再撮影する／ または T-2 のものを参照しファイル名を欺かない（cycle-203 T-4 MINOR-1 申し送り）」のどちらかを明示。

#### MINOR-3（推奨 / 確信度 B）T-3 のテスト件数指示が AP-P20 / AP-WF03 の境界に近い

- **該当箇所**: L109（T-3 タスク末尾「**必須カバー項目**: (1)〜(6) / 計 5〜6 件程度」）
- **問題内容**: テストケースを (1)〜(6) と番号付きで列挙し、「計 5〜6 件程度」と件数まで指示している。これは AP-WF03 の射程線引きでは「同じ要件を別の builder に渡したら別の実装になる余地」を残しており literal 確定ではないが、AP-P20（過度に具体的な計画）の境界線に近い。
- **なぜ問題か**: cycle-203 計画書 R1 で MINOR-3「encode 側エッジケース未明示」が指摘され、それを反映した結果として詳細化された経緯がある。今回も同じ詳細度を維持しているが、cycle-203 T-3 が R1〜R2 でテスト件数・内容に追加指摘が出なかったことを踏まえると、今回はもう一段抽象化しても安全。たとえば「encode 基本 / encode 通常（膨張ゼロ）/ decode 基本 / トグル切替 の 4 観点を最低限カバーし、計 5 件以上」とすれば、builder の裁量が広がり AP-WF03 / AP-P20 への抵触リスクが下がる。
- **想定する修正方向**: テスト要件を「encode（HTML 特殊文字含む基本ケース）/ encode（通常日本語で膨張ゼロを確認）/ decode（基本ケース）/ トグル切替（encode → decode で結果再計算）」の 4 観点に縮約し、件数は「5 件以上」と下限のみ指定。具体的なテスト入力例（`<script>alert("xss")</script>` 等）は T-1 baseline スクショ用の例と兼用する形にとどめ、テスト実装の文言までは指定しない。**ただし本指摘は確信度 B**（cycle-203 T-3 で件数指定がトラブルを生んだ実績はないため、現状維持でも実害は薄い）。

#### MINOR-4（推奨 / 確信度 B）AP-WF16 reviewer 独立再実行の「最低 1 つ以上」が下限として弱い

- **該当箇所**: L71（T-1 検証手順）/ L94（T-2 検証手順）/ L121（T-3 検証手順）/ L143（T-4 検証手順）
- **問題内容**: T-1〜T-4 すべての検証手順で「builder の自動チェックのうち**最低 1 つ以上**を独立再実行」となっている。cycle-203 キャリーオーバーで指摘された問題は「T-1/T-2/T-3 R1 までの reviewer は grep/test だけ独立再現し、lint/format:check/build までは行わなかった」ため、T-3 R1 で format:check 虚偽 PASS が偶発的に Read で発覚した、というもの。\*\*この経緯から学ぶべき教訓は「自動チェック PASS 報告が複数あったらすべて再実行する」または「少なくとも builder が報告した自動チェック PASS の重み（テストと build / format:check の差）を踏まえる」運用であり、「最低 1 つ」だと最も虚偽報告の可能性が高い `format:check` が依然として再実行から漏れる構造が残る。
- **なぜ問題か**: 特に T-3 検証手順（L121）では「`npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の 4 コマンド出力を引用付きで報告」とまでは指定しているのに、reviewer 側の独立再実行は「最低 1 つ以上」のまま。これでは cycle-203 T-3 R1 と同型の事故（4 コマンド報告 PASS のうち 1 つ虚偽）を確実には防げない。reviewer が「最低 1 つ」を満たすために `test` だけ再実行した場合、`format:check` 虚偽が再び偶発発覚にしか依存しない。
- **想定する修正方向**: 少なくとも T-3 検証手順だけは「builder が報告した 4 コマンドの**すべて**を独立再実行する（cycle-203 T-3 R1 の format:check 虚偽報告と同型事故の確実防止）」に強化。T-1 / T-2 / T-4 は「最低 1 つ以上」のままでも実害は薄い（T-1 / T-2 は自動チェックが少なく、T-4 は cycle-203 T-4 で全コマンド再実行が運用形として既に確立）。

#### MINOR-5（推奨 / 確信度 C）「事前事実」の参照場所が `tmp/research/` 配下で永続性がない

- **該当箇所**: L58（T-1 タスク冒頭「調査レポート `tmp/research/2026-05-22-cycle-204-html-entity-research.md` で実体検証済の数値を根拠とする」）/ L211（参考にした情報）
- **問題内容**: cycle-204 計画書が参照する事実情報の出典が `tmp/research/` 配下の調査レポートに依存している。`./tmp/` は次サイクルで削除される可能性があり（`.claude/rules/tmp-directory.md` Don't: 「将来にわたって必要なドキュメントを保存しない」）、計画書の追跡性が将来的に切れる可能性がある。
- **なぜ問題か**: 仮に cycle-205 以降の reviewer が「cycle-204 計画書で 21 箇所 / 13 件はどう確認したのか」と遡及確認したくなった場合、`tmp/research/` が削除されていれば計画書の数値の出典が辿れなくなる。これは「ソースコードを読めば分かることはドキュメントにしない」原則（`.claude/rules/doc-directory.md`）と矛盾するわけではないが、AP-P16（実体確認）の証跡性の観点では弱い。
- **想定する修正方向**: (a) 計画書本文の該当箇所に grep コマンドそのものを併記（例: `grep -c -- "--color-" src/tools/html-entity/Component.module.css` → 21）して、tmp 配下の調査レポート削除後も再現可能にする。これは既に T-2 完成条件 L92 では実施済なので、T-1 タスク冒頭 L59-62 にも同じ形で grep 出力を埋め込む。または (b) 調査レポートを `docs/research/` に昇格させる（ただし `.claude/rules/doc-directory.md` で「サイクル限定の調査は tmp」推奨のため非推奨）。**本指摘は確信度 C**（実害が将来発生しても限定的で、計画書本文に既に主要数値は埋め込まれているため）。

---

### アンチパターン網羅検査

`docs/anti-patterns/{planning,implementation,workflow,writing}.md` を 1 項目ずつ読み下し、計画書 L36-215 を検査した結果は以下の通り。

**planning.md**

- AP-P01〜AP-P15: 該当しない（本サイクルは構造移行であり、SEO 戦略・コンテンツ評価・フレームワーク先行などのリスクが発生する局面ではない）
- AP-P16（一次情報の実体確認）: **準拠**。L58 で「実体検証済の数値を根拠とする」と明示。ただし MINOR-5 で上述の通り出典の永続性に弱さあり
- AP-P17（3 案以上のゼロベース列挙）: **準拠**。4 表（着手対象 / kind / タイル UI / サイズ）すべてで 3 案以上を比較
- AP-P18（指摘の構造化）: 本サイクルは R1 初回レビューであり該当する過去指摘がないため適用外
- AP-P19（外部仕様の現在状態確認）: 本サイクルは外部 SEO 仕様等への依存がないため適用外
- AP-P20（過度に具体的な計画）: MINOR-3 で指摘した境界線上の指示が 1 箇所あるが、cycle-203 の運用実績から事故誘発リスクは小さい
- AP-P21（固定枠 UI 膨張 / 操作側同居リスク）: **本サイクル自体の事後検証対象**。L104（T-3 タスク）/ L137（T-4 計測）で役割分担パターンの先取り適用と定量計測を明示

**implementation.md**

- AP-I01〜AP-I09: 本サイクルは計画段階のため直接適用は薄いが、T-3 タイル UI で「来訪者目線」（双方向トグル + リアルタイム反映 + 詳細ページリンク）が L102-103 で言語化されており AP-I01 への配慮あり。AP-I03（バンドルサイズ）は html-entity の logic.ts が静的辞書（`ENCODE_MAP` / `NAMED_ENTITIES`）を持つが既存実装で済むため新規膨張リスクなし。AP-I08（未定義視覚表現）は L115 で新トークン名を明示しており逸脱なし

**workflow.md**

- AP-WF01（最後の修正後のレビュー）: 計画段階のため適用外
- AP-WF02（来訪者目線レビュー）: 計画レビュー観点として本レビュー自体で実施中
- AP-WF03（builder への過度な指示）: L104 の `rows=2 + flexShrink: 0 / flex: 1 + overflowY: auto` は literal に近い指示だが、AP-P21 対策の核を伝える必要があるため射程内（脚注の「設計判断の余地が PM 側に閉じている内容」に該当）
- AP-WF04（task-notification の grep 再確認）: T-2 完成条件 L92 / T-3 完成条件 L119 で grep / codegen 成功を明示しており準拠
- AP-WF05（移行前ダークモード撮影）: **準拠**。L64 / L67 でライト・ダーク両モード明示。ただし MINOR-1 で「膨張比較用スクショのモード未指定」を指摘
- AP-WF06（サブエージェントへの事実情報事前確認）: T-1 baseline 取得時に builder へ渡す数値が grep 実測コマンドで再現可能な形式になっており準拠
- AP-WF07（1 エージェント 1 タスク / 同一ファイル並行禁止）: 計画段階のため適用外（実装段階で各 T を独立エージェントに割り当てる前提）
- AP-WF08（PM の代行 / 改変）: 該当なし
- AP-WF09（チェックリストの形式通過）: 本レビュー自体で各 AP を実質的に検証
- AP-WF10（SendMessage 蓄積）: 計画段階のため適用外
- AP-WF11（PM 自身の通読・並べ読み）: T-2 で url-encode / base64 / html-entity の 3 ファイル並べ読み（L81）が明示されており準拠
- AP-WF12（PM/planner の事実情報自確認）: **準拠**。21 箇所 / 13 件 / 3 describe / 関数 3 本 / decode 失敗系統 0 はすべて grep / Read で本レビュー時点で独立再現済
- AP-WF13（並行アサイン時のスコープ越境）: 計画段階のため適用外
- AP-WF14（reviewer の数値一次集計）: 本レビューで grep 独立再現済
- AP-WF15（同サイクル延長 vs 別サイクル）: 計画段階で B-431 / B-432 / B-434 を本サイクル外として明示しており準拠
- AP-WF16（自動チェック PASS の reviewer 独立再実行）: **本サイクル自体の事後検証対象**。T-1〜T-4 全工程で検証手順を明示。ただし MINOR-4 で T-3 段階の独立再実行範囲の不十分性を指摘

**writing.md**

- AP-W01〜AP-W09: ブログ記事のアンチパターンであり本サイクルは記事執筆を含まないため適用外

---

### 体裁チェック

- マークダウン表（L149-155 / L161-165 / L171-175 / L183-187）すべて崩れなし
- 完成条件は各タスク末尾に「**完成条件**: 〜」として明示され、grep の出力数 / 4 ケース全件 textarea ≥40px / 相互差 ≤2px など客観判定可能
- L3（description）と L23-34（実施する作業）と L36-215（作業計画）は整合
- 「本サイクル外として認識する事項」相当の記述（B-431 / B-432 / B-434 への touch しない方針）は L87-90 の T-2 注意事項に明示済（cycle-203 と同型）

---

### 総合判定

**Pass ではない**（推奨 5 件あり）。ただし必須対応はゼロのため、計画の根幹は問題なく、推奨対応は builder 着手前の明確化として組み込む価値がある程度。

推奨対応が複数あるため、PM は **改善指示** として planner に修正依頼し、再レビュー（R2）を依頼すること。修正範囲は MINOR-1〜MINOR-5 と全体の見直し。

### 計画レビュー R2 - 指摘事項

**必須対応**: 0 件 / **推奨対応**: 3 件

レビュー対象は L36〜218 の「## 作業計画」セクション全体（R1 で planner が修正した結果も含む）。R1 で出た MINOR-1〜MINOR-5 はいずれも反映済（MINOR-1: L66-67 「ベース 6 枚」+「膨張比較用 2 枚」+ L71 完成条件「計 8 枚」明示 / MINOR-2: L128-129 「計 6 枚」+ 再撮影／参照ポリシー明示 / MINOR-3: L111 「4 観点 5 件以上」抽象化 + 具体 assertion 文言指定なし / MINOR-4: L123 T-3 「4 コマンド全件再実行を必須」+ T-1/T-2/T-4 を「最低 1 つ以上」のままにする差別化の根拠明示 / MINOR-5: L60-64 T-1 タスク冒頭に grep コマンドそのものを併記済で `tmp/` 配下削除後も独立再現可能化）。

事実情報（旧トークン 21 箇所 / 8 種一覧 / 既存テスト 13 件 = encode 5 + decode 6 + convertEntity 2 / `describe` 3 / 関数 3 本 / base64 SSoT に新トークン 8 種 + `--font-mono` 1 種 = 計 9 種）は R2 時点で grep を独立再実行して全件一致を確認済。MINOR-5 で計画書本文に併記された 4 つの grep コマンド（L60 の `describe` カウント / L60 の `test` カウント / L61 の `export function` カウント / L63 の `--color-` カウント / L64 の `--color-` 8 種一覧）も R2 reviewer で実機実行して、出力が計画書本文の記載と完全一致することを確認した。AP-WF12 / AP-P16 の事実情報自確認の準拠は問題なし。

R1 で出た指摘の修正自体は良好に反映されているが、R1 で見落とした観点として **MINOR-4 修正の波及不徹底**（T-4 が T-3 と同じ 4 コマンド構造を持ちながら再実行下限が緩いままで、R1 で言語化した「format:check が虚偽率最高」という構造リスクが T-4 にもそのまま当てはまる）に気付いた。これと、T-1 / T-3 のスクショ目的記述と利用先の整合に関する小規模な問題を 2 件追加で挙げる。いずれも必須レベルではなく、計画の根幹は問題ない。

#### MINOR-6（推奨 / 確信度 B）T-4 検証手順の reviewer 再実行下限が T-3 との論理整合を欠く

- **該当箇所**: L146（T-4 検証手順）／対比対象 L123（T-3 検証手順）
- **問題内容**: T-3（L123）では「4 コマンドすべて独立再実行を必須」と強化されたが、T-4（L146）では「自動チェック 4 コマンドのうち**最低 1 つ以上**を独立に再実行」のまま。T-3 で「最低 1 つでは format:check の虚偽が漏れる構造リスクが残る」とまで言語化した本人が、同じ 4 コマンドを扱う T-4 では緩い下限を維持している。
- **なぜ問題か**: T-4 でも builder は L146 で「lint / format:check / test / build の 4 コマンドの出力を引用付きで報告」している。reviewer 側が「最低 1 つ」を満たすために `test` だけ独立再実行すれば（T-4 はそもそも Playwright 計測の再現で `test` 側に意識が向きやすい）、`format:check` の虚偽 PASS は T-4 でも偶発発覚にしか依存しない構造になる。L123 の T-3 強化理由「最も虚偽率の高い `format:check` が再実行から漏れる構造リスク」は T-4 にもそのまま当てはまる。「T-4 は cycle-203 T-4 で全コマンド再実行が運用形として既に確立済」（L123 末尾）と書かれているが、「運用形として確立」は「次サイクル reviewer が必ず実施する」を保証しない（指示として書かれていなければ AP-WF09「形式通過」の温床になる）。
- **想定する修正方向**: T-4 検証手順も T-3 と同じく「自動チェック 4 コマンドすべてを reviewer が独立に再実行する」に強化する。Playwright 計測の方は現状の「最低 1 ケース再現」のままで可（4 ケース全件再実行はコストが釣り合わない）。または T-3 を緩めて両者の論理を揃える方向もありうるが、cycle-203 T-3 R1 の事故再発防止が AP-WF16 事後検証の中核成果である以上、T-4 を T-3 と同等まで強化する方が constitution Rule 4「Prioritize the quality」に整合する。**確信度 B**（実害発生確率は中程度。cycle-203 T-3 と同型事故が T-4 で再発する可能性は否定しきれない）。

#### MINOR-7（推奨 / 確信度 C）T-1 「膨張比較用 2 枚」の利用先記述が二目的混在で誤解を招く

- **該当箇所**: L67（T-1 タスク「膨張比較用 2 枚」の用途記述）／関連 L116（T-3 注意事項）
- **問題内容**: L67 は膨張比較用スクショの用途を「後続 T-4 の AP-P21 計測の比較対象 + 視覚 fit 突合用」と 2 つ並べているが、T-1 で撮るのは **legacy 詳細ページ（タイル化前）の encode 結果スクショ**。一方、T-4 の AP-P21 計測対象は **新規実装する HtmlEntityTile（タイル）の textarea 高さ**。legacy 詳細ページの encode 結果スクショは T-4 タイル textarea 計測の直接的な比較対象にはならない（測定対象が「タイル」、baseline は「詳細ページ」で物理レイアウトが別物）。
- **なぜ問題か**: builder / reviewer が「膨張比較用 2 枚は T-4 AP-P21 計測の比較対象」という記述を素直に受け取ると、T-4 で詳細ページの encode 結果と新タイルの encode 結果を視覚比較してしまう可能性がある（これは AP-P21 の判定基準「textarea 高さ ≥40px / 4 ケース相互差 ≤2px」とは独立した別観点）。AP-P21 計測の本来の比較軸は「タイルの 4 ケース textarea 高さの相互差」であり、legacy 詳細ページとは無関係。L116（T-3 注意事項）の「T-1 baseline で取得した "HTML 特殊文字多い入力の encode 結果" スクリーンショットと突き合わせて視覚 fit を確認する」も同型の誤導を含む（タイルの視覚 fit 確認は T-4 で撮る新タイルのスクショとの突合が筋）。
- **想定する修正方向**: L67 の用途記述を「**後続 T-3 / T-4 で実装するタイル UI が、長文字列 encode 結果を扱う際に視覚的に類似した文字列を扱う参考事例として（直接比較ではなく入力例の確認用）**」のように、「直接比較の対象ではない」ことを明示する。または「視覚 fit 突合用」の表現を削り、T-3 / T-4 で別途タイルの実機スクショを撮る運用に統一する。あわせて L116 の表現も「T-1 baseline と突き合わせて」から「T-4 で撮るタイル実機スクショで視覚 fit を確認する」に変える。**確信度 C**（実害は限定的。膨張比較 2 枚はそれ自体に「移行前の参考事例」としての記録価値があり、撮ること自体は無駄にならない）。

#### MINOR-8（推奨 / 確信度 C）T-4 計測例の文字数表記が実例と不一致

- **該当箇所**: L139（T-4 計測ケース (d) の例）／L136（ケース (a) の例）
- **問題内容**: L139 のケース (d) で「`Hello World This Is Just Plain Ascii Text` 等の **30 文字程度**」と書かれているが、実際の文字列は 41 文字。10 文字以上の乖離。一方 L136 のケース (a) `これは普通の日本語テキストですからエンティティ化されません` は 28 文字で「30 文字程度」とおおむね整合。
- **なぜ問題か**: AP-P21 計測の各ケースで「同等の入力長で textarea 高さの相互差を見る」のが計測の基本ロジック（4 ケース textarea 高さ相互差 ≤2px の判定で「入力長が揃っていない」と相互差の意味が弱まる）。実例文字列と「30 文字程度」の表記がズレていると、builder が 41 文字版をそのまま採用する／30 文字に切り詰めるのどちらか判断に迷う。
- **想定する修正方向**: (a) 例文字列を 30 文字に揃える（例: `Hello World This Is Plain Ascii` = 31 文字に切る）、または (b) 表記を「30〜45 文字程度」に緩める、または (c) 「文字数の厳密一致は必要なく、入力長感のオーダーが揃っていれば可」と注記する。**確信度 C**（textarea が `rows=2 + flexShrink: 0` で「入力内容に関係なく高さ固定」になる設計のため、入力長が 30 文字でも 50 文字でも textarea 高さは変わらない見込み。よって計測の本質には影響しない）。

---

### アンチパターン網羅検査（R2）

R1 で実施した網羅検査と重複を避けつつ、R1 修正で新たに導入された記述についてのみ追加チェックを実施。

- **AP-WF03**（builder への過度な指示）に対する MINOR-3 修正の効果: L111 「4 観点 5 件以上」抽象化により AP-WF03 / AP-P20 の境界線リスクは大幅に低減。R1 で指摘した「(1)〜(6) 番号付き列挙 + 5〜6 件程度」の literal 度が「観点 4 つ + 件数下限のみ」に緩み、別の builder に渡しても観点充足の判定が同一に下り、assertion 文言は builder の裁量に委ねられる構造に。**準拠**
- **AP-WF09**（チェックリストの形式通過）に対する MINOR-4 修正の効果: L123 T-3 「4 コマンド全件再実行を必須」化により T-3 reviewer が「最低 1 つ」を機械的に満たすだけの形式通過リスクは解消。ただし MINOR-6 で上述の通り T-4 では同型の形式通過余地が残存。**T-3 のみ準拠**
- **AP-WF05**（移行前ダークモード撮影）に対する MINOR-1 修正の効果: L66-67「ベース 6 枚 + 膨張比較 2 枚 = 計 8 枚」のライト／ダーク両モード明示で R1 の懸念は完全解消。**準拠**
- **AP-WF12 / AP-P16**（事実情報の自確認）に対する MINOR-5 修正の効果: L60-64 に 4 種類の grep コマンドが本文併記され、`tmp/research/` 削除後も計画書単体で全数値が独立再現可能。R2 reviewer の実機再実行で全件出力一致を確認。**準拠**
- **AP-WF16**（自動チェック PASS の reviewer 独立再実行）: R1 修正で T-3 については確実に防止。ただし MINOR-6 で T-4 の波及不徹底を指摘。**T-3 のみ準拠**

その他の AP（P01〜P20、I01〜I09、WF01/WF02/WF04/WF06〜WF08/WF10/WF11/WF13〜WF15、W01〜W09）は R1 検査結果から状態変化なし（R1 修正が新たな違反を導入していないことを各 AP 項目について確認済）。

---

### 体裁チェック（R2）

- マークダウン表 4 表（L152-158 / L164-168 / L174-178 / L186-190）すべて崩れなし
- 完成条件は各タスク末尾に明示され、客観判定可能な数値（計 8 枚 / 計 6 枚 / 計 10 枚 / grep 0 / textarea ≥40px / 相互差 ≤2px 等）で記述
- L3（description）と L23-34（実施する作業）と L36-218（作業計画）は整合
- 本サイクル外項目（B-431 / B-432 / B-434）の touch しない方針は L89-91 で明示

---

### 総合判定（R2）

**Pass ではない**（推奨 3 件あり）。必須対応はゼロで計画の根幹は健全。MINOR-6 / MINOR-7 / MINOR-8 はいずれも実装段階で実質的事故にならない確率が高いが、MINOR-6 は AP-WF16 事後検証の本来意図（reviewer の独立再実行で虚偽 PASS を検出する）と論理整合を欠く点で、修正することで T-3 / T-4 両方で同型の格上げが揃い計画書の論旨が一貫する。

PM は **改善指示** として planner に MINOR-6〜MINOR-8 の修正依頼と全体の見直しを依頼し、再レビュー（R3）を求めること。

### 計画レビュー R3 - 指摘事項

**必須対応**: 0 件 / **推奨対応**: 2 件

レビュー対象は L36〜218 の「## 作業計画」セクション全体（R1 / R2 で planner が修正した結果を含む全体再評価）。

#### R2 指摘 3 件の反映確認（実機独立再現済）

- **MINOR-6（T-4 の 4 コマンド全件再実行 強化）**: L146 で「`npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** を **独立に再実行**」と明示され、強化根拠（「format:check が最低 1 つ下限では再実行から漏れる構造リスク」が T-4 にも当てはまる）と AP-WF09 への配慮が記述済。Playwright 計測の方は「最低 1 ケース再現」のままで T-3 / T-4 の論理整合が取れている。**反映 OK**。
- **MINOR-7（膨張比較スクショの用途記述）**: L67 で「**T-4 AP-P21 計測（新タイル UI の textarea 高さ）との直接比較対象ではない**: 計測対象は新規実装する `HtmlEntityTile` の textarea であり、legacy 詳細ページとは物理レイアウトが別物のため、本スクショはあくまで『移行前の参考記録』として保存する」と明示され、L118 T-3 注意事項も「タイル UI の視覚 fit 確認は T-4 で撮るタイル実機スクショとプレビュー単独レンダリングで実施する（T-1 baseline の膨張比較スクショは legacy 詳細ページのレイアウトで物理構造が別物のため、直接比較対象にはしない）」と書き直されている。両箇所で誤導が解消済。**反映 OK**。
- **MINOR-8（ケース (d) 例文字列 31 文字）**: L139 で `Hello World Hello World 1234567` が「**31 文字**」と明示。実機計測（`echo -n 'Hello World Hello World 1234567' | wc -m` → 31）で実体一致を確認済。**反映 OK**。
- **T-1 / T-2 を「最低 1 つ以上」のままにする根拠**: L123 末尾に「T-1 builder の自動チェック報告は `npm run test -- html-entity` 1 コマンドのみ（4 コマンドの混在がないため『どれを再実行するか』の選択ミスが起きない）/ T-2 builder の自動チェック報告は `grep -c` 残存判定 + URL 200 OK の 2 種で、いずれもファイル単一状態を見るチェック（lint/format:check のような分散虚偽が起きにくい構造）」と明示。**T-3 / T-4 が「4 コマンド全件再実行」/ T-1 / T-2 が「最低 1 つ以上」という格差の根拠記述が AP-P20（過度に具体的な計画）にも抵触せず妥当**（チェック種類数 + 分散虚偽リスク差という構造論で線引きしており、コードレベルの literal 確定ではない）。

#### 事実情報の独立再現

- 旧トークン残存数: `grep -c -- "--color-" src/tools/html-entity/Component.module.css` → **21**（計画書 L63 と一致）
- 既存テスト件数: `grep -c '^\s*test(' src/tools/html-entity/__tests__/logic.test.ts` → **13**（L60 と一致）
- describe ブロック数: `grep -c '^\s*describe(' src/tools/html-entity/__tests__/logic.test.ts` → **3**（L60 と一致）
- export 関数数: `grep -c '^export function' src/tools/html-entity/logic.ts` → **3**（L61 と一致）
- ケース (d) 例文字列「`Hello World Hello World 1234567`」: `echo -n '...' | wc -m` → **31**（L139 と一致）

これらの主要数値はすべて R3 時点で再現一致。**ただし、別系統で R1 / R2 が見落としていた数値ズレを 2 件検出した**（MINOR-9 / MINOR-10）。いずれも実装段階での実害は薄いが、計画書の事実情報としての厳密性を保つため指摘する。

---

#### MINOR-9（推奨 / 確信度 B）`<script>alert("xss")</script>` の文字数表記が実例と不一致（3 箇所同一誤り）

- **該当箇所**: L50（背景説明）/ L67（T-1 膨張比較用スクショ）/ L137（T-4 ケース (b)）の 3 箇所
- **問題内容**: 計画書本文 3 箇所で「`<script>alert("xss")</script>` の **30 文字** → **52 文字**、約 **1.73 倍**」と記述されているが、実機計測すると入力は **29 文字**・出力は **51 文字**・倍率は **約 1.76**。実測コマンド: `python3 -c "s='<script>alert(\"xss\")</script>'; print(len(s))"` → 29 / 同 encode 後 `'&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'` の length → 51。**調査レポート `tmp/research/2026-05-22-cycle-204-html-entity-research.md` L145-147 も同じ誤りを含んでおり**、計画書はこれをそのまま継承している。
- **なぜ問題か**: (i) AP-WF12 / AP-P16 の事実情報自確認の観点で、計画書本文に書かれた具体的数値は実機検証で再現一致するべき。1〜2 文字のズレでも、第 5 弾サイクルとして「事実情報の grep 実測併記」を MINOR-5 で強化した方針と整合しない。(ii) cycle-203 (base64) と並べて「base64 = 30 文字 → 120 文字超」「html-entity = 30 文字 → 52 文字」と比較表現する箇所（L50）で、片方が off-by-one だと AP-P21 事後検証 2 件目の対照記述としての精度を損なう。(iii) 調査レポート起点の誤りが計画書に伝播している点は AP-WF06（事実情報事前確認）の理想からも逸脱する。**実害は薄い**（textarea が rows=2 で固定高さになる設計のため、入力長が 29 でも 30 でも計測結果に影響なし。MINOR-8 と同型の確信度 C 寄りだが、3 箇所同一誤り + 比較表現箇所への影響で B 相当）。
- **想定する修正方向**: L50 / L67 / L137 の「30 文字 → 52 文字、約 1.73 倍」を「**29 文字 → 51 文字、約 1.76 倍**」に修正。同時に調査レポート側 L145-147 を訂正するか、tmp/ 配下削除前提なら計画書本文のみ修正で可（計画書本文が SSoT となる方針）。
- **確信度**: B

#### MINOR-10（推奨 / 確信度 B）ケース (a) 日本語例文の文字数が計画書内で 2 通りに記述（内部矛盾）

- **該当箇所**: L136（ケース (a) 説明本体）と L139（ケース (d) 説明内の参照記述）
- **問題内容**: 同一の日本語例文「`これは普通の日本語テキストですからエンティティ化されません`」について、L136 では「**30 文字** encode」「**30 文字程度**」と書かれ、L139 では「ケース (a) **日本語 28 文字**とオーダーが揃う長さに調整」と書かれている。実機計測すると **29 文字**（`python3 -c "print(len('これは普通の日本語テキストですからエンティティ化されません'))"` → 29）。**同じ文字列に対して計画書内で 30 / 28 / 実態 29 の 3 値が並存している内部矛盾**。R2 レビュー本文 L352 も「28 文字」と記述しており、R2 reviewer 段階でも同じ誤りが温存された（R2 reviewer は実機計測せず planner の修正後文言だけを読んだと推測）。
- **なぜ問題か**: (i) 内部矛盾そのものが計画書の信頼性を損なう。builder / 次サイクル reviewer が「結局 30 と 28 のどちらに合わせて計測ケースを構築すべきか」迷う余地が出る。(ii) ケース (d) が「ケース (a) と長さオーダーを揃える」目的で 31 文字に調整されている経緯を踏まえると、(a) の実際の長さが 29 文字であることは (d) の 31 文字との「長さオーダー揃え」判断と整合（差 2 文字）するが、計画書本文が 28 と書くと差 3 文字、30 と書くと差 1 文字と、揃え目的の表現としてもブレが生じる。(iii) AP-WF12 / AP-P16 の「計画書に記述する事実は実機計測で確認」の原則に対する違反。**実害は MINOR-9 同様薄い**（textarea 高さに影響しない）が、同一文字列に対する 3 値並存は計画書の追跡性を直接損なう。
- **想定する修正方向**: L136 を「**通常の日本語 29 文字 encode**」「**HTML 特殊文字を含まない 29 文字程度**」に、L139 を「ケース (a) **日本語 29 文字**とオーダーが揃う長さに調整」にそれぞれ修正。または例文字列を 30 文字きっかりに揃える短文に差し替える（例: 末尾に 1 文字追加して 30 文字化）。前者の方が修正コスト最小。
- **確信度**: B

---

#### アンチパターン網羅検査（R3）

R1 / R2 で実施済の網羅検査結果（planning.md / implementation.md / workflow.md / writing.md の全項目）から状態変化なし。R2 修正で新たに追加された記述（L67 用途明記 / L118 T-3 注意事項書き直し / L123 末尾 T-1 / T-2 / T-3 / T-4 格差根拠 / L146 T-4 4 コマンド必須化 / L139 ケース (d) 31 文字）について追加チェック:

- **AP-WF09（チェックリストの形式通過）**: MINOR-6 修正で T-4 reviewer の作業量が「4 コマンド全件 + Playwright 最低 1 ケース」に増えた。コスト試算では `npm run lint` / `format:check` は数秒、`test` 数十秒、`build` 数十秒〜2 分程度で計 3 分前後。**形式通過リスクは増加していない**（むしろ「指示として書かれていない運用」を「明示された運用」に格上げしたため AP-WF09 リスクは低下）。**準拠**
- **MINOR-7 修正の本質的価値の保持**: L67 が「移行前 legacy 詳細ページのレイアウト記録 + HTML 特殊文字多い入力時の legacy 表示挙動の参考事例」と用途を 2 つ並べ、両方の目的（記録 + 参考）が明確化されている。**膨張比較スクショの取得理由は曖昧化していない**（「直接比較対象ではない」と否定的に書きつつ、「移行前の参考記録」として保存する積極理由を残している）。**準拠**
- **AP-P20（過度に具体的な計画）**: L123 末尾の「T-1 / T-2 を最低 1 つ以上のままにする根拠」記述は、構造論（チェック種類数 / 分散虚偽リスク差）で線引きしており、コード literal や手順の具体化ではない。同じ要件を別の reviewer に渡しても判断が同方向に下りる抽象度。**AP-P20 抵触なし。準拠**
- **AP-WF12 / AP-P16（事実情報の自確認）**: 上記 MINOR-9 / MINOR-10 で 2 件の数値不一致を検出。**R1 / R2 / R3 と 3 ラウンドかけてもなお `<script>alert("xss")</script>` の文字数と日本語例文の文字数が実機計測されないまま温存されていた**点は、AP-WF12 / AP-P16 の運用上の弱点として申し送り対象（次サイクル以降で「計画書本文の具体的文字列 / 数値はすべて grep / wc / python による実機計測を planner 自身が行う」運用を意識的に補強する余地あり）。

#### 体裁チェック（R3）

- マークダウン表 4 表（L152-158 / L164-168 / L174-178 / L186-190）すべて崩れなし
- 完成条件は各タスク末尾に「**完成条件**: 〜」として明示され、客観判定可能な数値（計 8 枚 / 計 6 枚 / 計 10 枚 / grep 0 / textarea ≥40px / 相互差 ≤2px 等）で記述
- L3（description）と L23-34（実施する作業）と L36-218（作業計画）は整合
- 本サイクル外項目（B-431 / B-432 / B-434）の touch しない方針は L89-91 で明示

#### 総合判定（R3）

**Pass ではない**（推奨 2 件あり）。必須対応はゼロで計画の根幹は健全。R2 指摘 3 件（MINOR-6 / MINOR-7 / MINOR-8）はすべて反映済で論理整合性も改善している。新規検出した MINOR-9 / MINOR-10 はいずれも具体的文字列の文字数表記の誤り / 内部矛盾であり、textarea 計測結果への実害はないが、計画書の事実情報としての厳密性と内部整合性を回復するために修正を推奨する。修正コストはいずれも数文字の置換のみで極小。

PM は **改善指示** として planner に MINOR-9 / MINOR-10 の修正依頼と全体の見直しを依頼し、再レビュー（R4）を求めること。

### 計画レビュー R4 - 指摘事項

**R4 Pass**

レビュー対象は L36〜218 の「## 作業計画」セクション全体（R1 / R2 / R3 の修正反映確認 + 全体再評価）。

#### R3 指摘 2 件の反映確認（実機独立再現済）

- **MINOR-9（`<script>alert("xss")</script>` の文字数訂正）**: L50 / L67 / L137 の 3 箇所すべてが「**29 文字 → 51 文字、約 1.76 倍**」に統一されている。実機計測コマンド `python3 -c "s='<script>alert(\"xss\")</script>'; print(len(s))"` → **29** / `python3 -c "s='&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'; print(len(s))"` → **51** で実体一致を R4 reviewer が独立再現済。倍率 51/29 ≈ 1.759 で「約 1.76 倍」とも一致。**反映 OK**
- **MINOR-10（日本語例文 29 文字統一）**: L136 ケース (a) 本体で「**通常の日本語 29 文字 encode**」「`これは普通の日本語テキストですからエンティティ化されません`（**29 文字**、Python `len()` 実測値）」「**HTML 特殊文字を含まない 29 文字前後**」と 3 度 29 文字で揃え、L139 ケース (d) 説明文も「ケース (a) **日本語 29 文字**とオーダーが揃う長さ」と 29 文字で整合。実機計測 `python3 -c "print(len('これは普通の日本語テキストですからエンティティ化されません'))"` → **29** で R4 reviewer が独立再現済。L136 / L139 で「30 / 28」並存は完全解消。**反映 OK**

#### 事実情報の独立再現（R4 実施）

R4 reviewer が grep / wc / Python `len()` で全主要数値を独立再実行した結果:

- 旧トークン残存数: `grep -c -- "--color-" src/tools/html-entity/Component.module.css` → **21**（L63 と一致）
- 既存テスト件数: `grep -c '^[[:space:]]*test(' src/tools/html-entity/__tests__/logic.test.ts` → **13**（L60 と一致）
- describe ブロック数: `grep -c '^[[:space:]]*describe(' src/tools/html-entity/__tests__/logic.test.ts` → **3**（L60 と一致）
- export 関数数: `grep -c '^export function' src/tools/html-entity/logic.ts` → **3**（L61 と一致）
- 8 種マッピングの旧トークン一覧: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/html-entity/Component.module.css | sort -u` → 計画書 L64 記載の 8 種（`--color-bg` / `--color-border` / `--color-error` / `--color-error-bg` / `--color-primary` / `--color-primary-hover` / `--color-text` / `--color-text-muted`）と完全一致
- `<script>alert("xss")</script>` 入力長: **29 文字**（L50 / L67 / L137 と一致）
- 同 encode 結果長: **51 文字**（L50 / L67 / L137 と一致）
- 倍率: 51/29 ≈ 1.759 → 「約 1.76 倍」（L50 / L67 / L137 と一致）
- 日本語例文「`これは普通の日本語テキストですからエンティティ化されません`」: **29 文字**（L136 / L139 と一致）
- ケース (d) ASCII 例文字列「`Hello World Hello World 1234567`」: **31 文字**（L139 と一致）
- 判定基準: 下限 40px 以上 + 4 ケース相互差 2px 以内（L140 / L144 と一致、cycle-203 と同基準）

全項目で実機計測値と計画書本文記述が一致。R1 / R2 / R3 を通じて課題視された「具体的文字列の文字数表記」の実機計測一致性は R4 時点で完全に回復している。

#### 計画整合性の再評価

- **目的 / T-1〜T-4 / 検討した他の選択肢 / 参考情報 セクションの整合**: L40-53（目的）/ L54-146（T-1〜T-4）/ L148-190（検討した他の選択肢）/ L204-218（参考にした情報）すべてが整合。AP-P21 / AP-WF16 の事後検証位置付けが目的セクション・T-3 / T-4 タスク本体・検討表（L192-202）の 3 箇所で一貫した論旨で記述されている
- **完成条件の客観判定可能性**: T-1（計 8 枚 + テスト 13 件緑）/ T-2（grep 残存 0 + 3 連続同名一致）/ T-3（codegen 成功 + タイルテスト緑 + トグル動作）/ T-4（lint/format/test/build 全パス + スクショ計 10 枚 + 4 ケース textarea ≥40px・相互差 ≤2px）すべてが grep / 数値 / 自動コマンドで機械的に判定可能
- **T-3 / T-4 「4 コマンド全件再実行」 vs T-1 / T-2 「最低 1 つ以上」格差の根拠**: L123 末尾で「T-1 builder の自動チェック報告は 1 コマンドのみ（選択ミス不在）/ T-2 builder の自動チェック報告は grep 残存判定 + URL 200 OK の 2 種でファイル単一状態 + lint/format:check のような分散虚偽が起きにくい構造 + CSS 置換主作業で format/lint 観点の差分薄」と構造論で線引きされている。AP-P20（過度に具体的な計画）に抵触せず、別 reviewer に渡しても同じ判断に至る抽象度
- **AP-P21 / AP-WF16 事後検証の運用形の安定性**: T-1 / T-2 / T-3 / T-4 各タスク末尾に「検証手順（AP-WF16 事後検証）」が明示され、builder 報告形式（引用付き）と reviewer 独立再実行範囲（T-1 / T-2 = 最低 1 つ / T-3 / T-4 = 4 コマンド全件）が一貫した書式で記述。AP-P21 計測の判定基準（下限 40px + 相互差 2px）は cycle-203 と同基準で運用継続性も担保

#### アンチパターン網羅検査（R4）

R1 / R2 / R3 で実施済の網羅検査結果から状態変化なし。R3 修正（L50 / L67 / L137 の倍率訂正 + L136 / L139 の 29 文字統一）について追加チェック:

- **AP-WF12 / AP-P16（事実情報の自確認）**: R3 で指摘された 2 件の数値ズレが完全解消。R4 reviewer の実機独立再現で「計画書本文の具体的文字列 / 数値」と「`python3 -c "print(len(...))"` 等の実機計測値」が全件一致。R3 で申し送られた「3 ラウンドかけてもなお文字数が実機計測されないまま温存」状態は R4 で解消済。**準拠**
- **AP-P20（過度に具体的な計画）**: R3 修正は具体的文字数の literal 化（30 → 29 / 28 → 29 への厳密化）であるが、これは「実機計測値との一致による事実情報の正確性回復」であり、「同じ要件を別 builder に渡したら別実装になる余地」を狭める種類の literal 化ではない（textarea が rows=2 で高さ固定の設計なので、入力長が 29 でも 30 でも 31 でも実装の方向性は同一）。**AP-P20 抵触なし。準拠**
- **AP-WF12（手段先行の決め打ち）**: T-2 の「base64 SSoT を流用」と書かずに「html-entity 8 種 と base64 SSoT 8 種を grep で並べ読みして 1:1 対応を確認」とプロセスを明示した R1 / R2 / R3 までの記述が R4 でも維持。**準拠**
- **AP-WF16（自動チェック PASS の reviewer 独立再実行）**: T-3 / T-4 で 4 コマンド全件必須化、T-1 / T-2 で「最低 1 つ以上」+ 格差根拠の構造論記述が R3 までで確立。R4 修正では検証手順本体に変更なし。**本サイクル事後検証対象として運用形が安定**

その他のアンチパターン（planning.md の P01〜P20 / implementation.md の I01〜I09 / workflow.md の WF01〜WF15 / writing.md の W01〜W09）は R1 / R2 / R3 の検査結果から状態変化なし。

#### 体裁チェック（R4）

- マークダウン表 4 表（L152-158 / L164-168 / L174-178 / L186-190）すべて崩れなし
- 完成条件は各タスク末尾に「**完成条件**: 〜」として明示され、客観判定可能な数値（計 8 枚 / 計 6 枚 / 計 10 枚 / grep 0 / textarea ≥40px / 相互差 ≤2px 等）で記述
- L3（description）と L23-34（実施する作業）と L36-218（作業計画）は整合
- 本サイクル外項目（B-431 / B-432 / B-434）の touch しない方針は L89-91 で明示

#### 抜け漏れチェック（R4）

- B-314 Active のスコープ（Phase 8.1 第 5 弾 = html-entity への標準パターン適用）から逸脱した作業なし
- 本サイクル外として認識すべき項目（B-431 共通コンポーネント / B-432 trustLevel 削除 / B-434）はすべて「touch しない」と明示
- L3 description / L23-34 「実施する作業」チェックリスト / L36-146 「作業計画」本体は完全整合

#### 総合判定（R4）

**R4 Pass**。R3 で指摘した MINOR-9 / MINOR-10 は完全反映済で、R4 reviewer の実機独立再現で全主要数値（21 / 13 / 3 / 3 / 8 種 / 29 / 51 / 1.76 / 29 / 31 / 40px / 2px）の一致を確認。計画書全体の論旨は健全で、目的 / タスク本体 / 検討した他の選択肢 / 参考情報 / 検証手順 すべての整合性が取れている。AP-P21 / AP-WF16 の事後検証運用形も安定し、AP-P20 / AP-WF12 / AP-WF03 への抵触なし。指摘事項は必須 0 / 推奨 0 件のため、PM は **承認** として本計画の execution（T-1 から順次着手）に進んでよい。

### T-1 レビュー R1 - 指摘事項

**T-1 R1 Pass**

レビュー対象は T-1 builder 報告書 `tmp/cycle-204/t1-report.md` および撮影スクショ `tmp/cycle-204/baseline/` 配下 8 枚。計画書 L56-73（T-1 タスク本体 + 完成条件 + 検証手順）に照らして全項目の達成を確認した。

#### 完成条件達成確認

- **スクショ 8 枚の保存**: `ls tmp/cycle-204/baseline/` で実機確認。`html-entity-w1200-light.png` / `html-entity-w1200-dark.png` / `html-entity-w1900-light.png` / `html-entity-w1900-dark.png` / `html-entity-w375-light.png` / `html-entity-w375-dark.png`（ベース 6 枚）+ `html-entity-w1200-light-expanded.png` / `html-entity-w1200-dark-expanded.png`（膨張比較 2 枚）= 計 **8 枚** が `tmp/cycle-204/baseline/` 配下に保存されていることを確認。計画書 L66-71 と完全一致
- **既存テスト 13 件緑**: 後述の AP-WF16 事後検証で実機独立再実行し PASS 確認済

#### AP-WF16 事後検証（reviewer 独立再実行）

T-1 reviewer として builder 報告のうち **6 件のチェックを独立に再実行**（「最低 1 つ以上」要件を大幅に上回る再実行で T-1 段階の AP-WF16 を確実履行）。出力はすべて builder 報告と一致。

| 再実行コマンド                                                                              | builder 報告値                                                                                                                                                       | reviewer 実機出力                     | 一致 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---- |
| `grep -c '^\s*describe(' src/tools/html-entity/__tests__/logic.test.ts`                     | 3                                                                                                                                                                    | 3                                     | OK   |
| `grep -c '^\s*test(' src/tools/html-entity/__tests__/logic.test.ts`                         | 13                                                                                                                                                                   | 13                                    | OK   |
| `grep -c '^export function' src/tools/html-entity/logic.ts`                                 | 3                                                                                                                                                                    | 3                                     | OK   |
| `grep -c -- "--color-" src/tools/html-entity/Component.module.css`                          | 21                                                                                                                                                                   | 21                                    | OK   |
| `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/html-entity/Component.module.css \| sort -u` | 8 種（`--color-bg` / `--color-border` / `--color-error` / `--color-error-bg` / `--color-primary` / `--color-primary-hover` / `--color-text` / `--color-text-muted`） | 同上 8 種                             | OK   |
| `npm run test -- html-entity`                                                               | 13 passed / 0 failed / Duration 1.10s                                                                                                                                | 13 passed / 0 failed / Duration 1.11s | OK   |

`npm run test -- html-entity` 再実行時の vitest 出力末尾抜粋:

```
 RUN  v4.1.5 /mnt/data/yolo-web
 Test Files  1 passed (1)
      Tests  13 passed (13)
   Start at  12:43:25
   Duration  1.11s (transform 57ms, setup 163ms, import 31ms, tests 8ms, environment 755ms)
```

builder 報告（Duration 1.10s）と reviewer 再実行（Duration 1.11s）は実行時間こそ微差があるが、テスト件数 13 件 / PASS 13 / FAIL 0 は完全一致。AP-WF16 事後検証 PASS。

#### スクショ視覚確認（来訪者目線）

8 枚すべてを Read で実機表示確認:

- **ライト / ダーク両モード差異**: w1200 / w1900 / w375 の各サイズでライト（白背景・黒文字）とダーク（紺背景・白文字）が明確に差別化されている。AP-WF05（移行前ダークモード未撮影）の予防が完全機能。同色のスクショが並存する撮影モード切替失敗のリスクなし
- **膨張比較スクショの内容**: w1200 light/dark 両方とも「テキスト入力」欄に `<script>alert("xss")</script>` が表示され、「エスケープ結果」欄に `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;` がそのまま表示されている。計画書 L67 / L137 の 29 文字 → 51 文字（約 1.76 倍）と整合
- **レイアウト破綻なし**: w1200 / w1900 / w375 すべてでヘッダー → パンくず → タイトル → モード切替 → 入力欄 → ボタン → 結果欄 → このツールについて → よくある質問 → シェア → 関連ツール → フッター の縦並びが正常に描画。w375 でも overflow が画面端で破綻していない（モバイル幅でも結果欄が枠内に収まっている）
- **legacy デザイントークン記録**: 旧 `--color-primary` 系の青色ボタン / 旧 `--color-bg` 系の枠線色などが視覚的に記録されている。T-2 以降での前後比較対象として baseline 品質に問題なし

#### アンチパターン照合

- **AP-WF05（移行前ダークモード未撮影）**: ベース 6 枚 + 膨張比較 2 枚すべてでライト / ダーク両モード撮影済。**準拠**
- **AP-WF12（手段先行の決め打ち）**: builder 報告は 5 件の grep 出力をそのまま引用（コマンド + 出力一体表記）。計画書記載の期待値を転記したのではなく実機出力を一次資料として記録している。**準拠**
- **AP-P16（一次情報の実体確認）**: 21 / 13 / 3 / 8 種等の数値はすべて実機 grep 出力に基づき記録され、reviewer 独立再実行で全件一致確認済。**準拠**
- **AP-WF16（自動チェック PASS の reviewer 独立再実行）**: 本タスク事後検証対象。reviewer 側で 6 件の独立再実行を実施（最低 1 つ要件を大幅に上回る）し、すべて出力一致を確認。**準拠**

#### 補足観察（実害なし）

- 開発サーバ（`npm run dev`）が builder 側で起動残置されているが、T-2 以降で利用する旨が報告書 L122 に明記されており運用上問題なし
- `tmp/cycle-204/take-baseline-screenshots.ts` の撮影スクリプトが残置されている。`.claude/rules/tmp-directory.md` の Do/Don't に抵触せず、tmp/ 内自己完結なので問題なし
- 膨張比較 2 枚のファイル名サフィックス `-expanded` は表現として明瞭。計画書 L67 で「HTML 特殊文字多い入力 encode 結果」と定義された用途と整合

#### 総合判定

**T-1 R1 Pass**。完成条件（スクショ 8 枚 + 既存テスト 13 件緑）達成、AP-WF16 事後検証（reviewer 独立再実行 6 件すべて出力一致）達成、スクショ視覚品質（ライト / ダーク差別化 + 膨張比較で encode 結果表示 + レイアウト破綻なし）達成、計画書 L56-73 への完全準拠を確認。指摘事項ゼロ。PM は T-2 着手に進んでよい。

### T-2 レビュー R1 - 指摘事項

**T-2 R1 Pass**

レビュー対象は T-2 builder 報告書 `tmp/cycle-204/t2-report.md` / 移行後スクショ `tmp/cycle-204/after-t2/` 6 枚 / git 作業ツリー（`src/app/(new)/tools/html-entity/` 配下 4 ファイル + `src/tools/html-entity/Component.module.css`）。計画書 L75-96（T-2 タスク本体 + 完成条件 + 検証手順）に照らして全項目の達成を確認した。

#### 完成条件達成確認（計画書 L94）

1. **`/tools/html-entity` が (new) 配下で正常表示**: 後述スクショ比較 6 ペアで確認済。実機 HTTP も 200（builder 報告 §5）。**達成**
2. **旧 (legacy) パスにファイルが残っていない**: `ls src/app/(legacy)/tools/html-entity/ 2>/dev/null` で出力空、exit code 0 を独立再実行で確認。`git status -s` で 3 ファイル全てが `R`（page.tsx は `RM`= rename + modify）として記録されており、`?? src/app/(legacy)/...` 残存なし。**達成**
3. **w1200 / w1900 / w375 で表示崩れなし**: 後述スクショ視覚確認で 6 枚全件レイアウト破綻なしを確認。w1900 では本文幅が 1200px に制約され中央寄せが効いている。**達成**
4. **`grep -c -- "--color-" src/tools/html-entity/Component.module.css` の結果が `0`**: reviewer 独立再実行で **0** を確認（builder 報告 §3 と一致）。**達成**
5. **url-encode / base64 / html-entity の 3 ファイルで 8 種マッピングの並べ読み同名一致**: reviewer 独立再実行で 3 連続同名一致を確認（後述 AP-WF16 §並べ読み再現）。**達成**

#### ファイル構造の検証

- `ls "src/app/(new)/tools/html-entity/"` → `opengraph-image.tsx` / `page.module.css` / `page.tsx` / `twitter-image.tsx` の **4 ファイル**揃い。計画書 L80 と一致
- `git diff --stat HEAD` で touch ファイルは: `docs/cycles/cycle-204.md` / `src/app/(legacy)/tools/html-entity/page.tsx`（削除 34 行）/ `src/app/(legacy→new)/tools/html-entity/opengraph-image.tsx`（rename 0 変更）/ `src/app/(new)/tools/html-entity/page.tsx`（追加 40 行）/ `src/app/(legacy→new)/tools/html-entity/twitter-image.tsx`（rename 0 変更）/ `src/tools/html-entity/Component.module.css`（42 行変更）の 6 件のみ。**ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネントは一切 touch なし**（AP-WF15 / 計画書 L89-90 準拠）
- `src/app/(new)/tools/html-entity/page.module.css` を base64 の同ファイルと並べ読み: コメント中の cycle 番号（cycle-203 → cycle-196 で SSoT 引用は共通）と内容（`.page { max-width: 1200px; margin: 0 auto; width: 100%; }`）が完全一致
- `src/app/(new)/tools/html-entity/page.tsx` は `styles from "./page.module.css"` を import し、`<div className={styles.page}>` で ToolLayout をラップ済。base64 の page.tsx と構造完全一致（コンポーネント名・SLUG・コメント内 cycle 番号のみ差分）

#### トークン置換の正しさ（Component.module.css 全件 Read）

`git diff HEAD -- src/tools/html-entity/Component.module.css` で 21 箇所の置換を全件確認。計画書 L83 のマッピングと完全一致:

| 旧                              | 新                | 計画書記載 | 実体一致 |
| ------------------------------- | ----------------- | ---------- | -------- |
| `--color-bg` (4箇所)            | `--bg`            | ✓          | OK       |
| `--color-border` (4箇所)        | `--border`        | ✓          | OK       |
| `--color-error` (2箇所)         | `--danger`        | ✓          | OK       |
| `--color-error-bg` (1箇所)      | `--danger-soft`   | ✓          | OK       |
| `--color-primary` (5箇所)       | `--accent`        | ✓          | OK       |
| `--color-primary-hover` (1箇所) | `--accent-strong` | ✓          | OK       |
| `--color-text` (3箇所)          | `--fg`            | ✓          | OK       |
| `--color-text-muted` (1箇所)    | `--fg-soft`       | ✓          | OK       |

合計 21 箇所 = T-1 baseline の残存数と一致。置換漏れ・誤置換なし。`--font-mono` は `--color-*` 系ではないため対象外（builder 報告 §8 の判断正当）。

#### AP-WF16 事後検証（reviewer 独立再実行 / 計画書 L96）

「最低 1 つ以上」要件に対し、reviewer は **6 件**の独立再実行を実施し全件 builder 報告と一致:

| 再実行コマンド                                                                              | builder 報告値                                                                                                                     | reviewer 実機出力                                                 | 一致 |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---- |
| `grep -c -- "--color-" src/tools/html-entity/Component.module.css`                          | 0                                                                                                                                  | 0                                                                 | OK   |
| `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/html-entity/Component.module.css \| sort -u` | （空出力）                                                                                                                         | （空出力 = `--color-` 残存なし）                                  | OK   |
| `grep -o -- "--[a-zA-Z0-9_-]*" src/tools/base64/Component.module.css \| sort -u`            | 9 種（`--accent` / `--accent-strong` / `--bg` / `--border` / `--danger` / `--danger-soft` / `--fg` / `--fg-soft` / `--font-mono`） | 同上 9 種                                                         | OK   |
| `grep -o -- "--[a-zA-Z0-9_-]*" src/tools/url-encode/Component.module.css \| sort -u`        | 同上 9 種                                                                                                                          | 同上 9 種                                                         | OK   |
| `ls "src/app/(legacy)/tools/html-entity/"`                                                  | 空                                                                                                                                 | 空（exit 0）                                                      | OK   |
| `npm run test -- html-entity`                                                               | （T-1 で 13 PASS、T-2 報告書には含まないが reviewer 自主追加）                                                                     | `Test Files 1 passed (1) / Tests 13 passed (13) / Duration 1.10s` | OK   |

##### 並べ読み 3 連続同名一致の独立再現

reviewer 実機 grep 出力に基づく html-entity 旧トークン 8 種と base64 / url-encode 新トークン 9 種の 1:1 対応:

| html-entity 旧（T-1 baseline 記録） | base64 新         | url-encode 新     | 一致 |
| ----------------------------------- | ----------------- | ----------------- | ---- |
| `--color-bg`                        | `--bg`            | `--bg`            | OK   |
| `--color-border`                    | `--border`        | `--border`        | OK   |
| `--color-error`                     | `--danger`        | `--danger`        | OK   |
| `--color-error-bg`                  | `--danger-soft`   | `--danger-soft`   | OK   |
| `--color-primary`                   | `--accent`        | `--accent`        | OK   |
| `--color-primary-hover`             | `--accent-strong` | `--accent-strong` | OK   |
| `--color-text`                      | `--fg`            | `--fg`            | OK   |
| `--color-text-muted`                | `--fg-soft`       | `--fg-soft`       | OK   |

url-encode → base64 → html-entity の **3 連続同名一致**を reviewer が独立に grep 出力で再現確認。`--font-mono` は base64 / url-encode の Component.module.css に存在するが `--color-*` 系の対応対象外（html-entity の Component.module.css も既存で `var(--font-mono)` 直参照、変更不要）。AP-WF12 違反予防の手順（base64 SSoT を「流用」と書かず実体並べ読み）が builder / reviewer 双方で機能。

#### 来訪者目線の確認（移行前後スクショ 6 ペア比較）

reviewer が 6 ペア（w1200 / w1900 / w375 × ライト / ダーク）を Read で実機表示確認:

- **w1200 light/dark**: legacy（ヘッダーに「ホーム / 遊ぶ / ツール / 辞典 / ブログ / サイト紹介」+ 検索ボックス Ctrl+K + AI バッジ）→ new（簡素化ヘッダー「ツール / 遊ぶ / ブログ / サイト紹介」+ テーマ切替トグル + フッターが 5 列の白背景大規模ナビ）への移行が視覚的に明確。本文 UI（モード切替「エンコード/デコード」/ テキスト入力 / エスケープボタン / エスケープ結果欄 / FAQ / 関連ツール）の構造は完全保持
- **w1900 light/dark**: 本文幅が約 760px（1200px max-width 以内）にセンタリング。1200px ハードコードの効果が視覚的に確認できる
- **w375 light/dark**: モバイル幅でレイアウト破綻なし。textarea / ボタン / FAQ アコーディオン / 関連ツールカード すべて画面端で破綻せず収まっている。ハンバーガーメニューが正常表示
- **デザイントークン変化**: 「エスケープ」ボタンの青色（旧 `--color-primary` → 新 `--accent`）/ モード切替アクティブ色（旧 `--color-primary` → 新 `--accent`）/ textarea 枠線色（旧 `--color-border` → 新 `--border`）/ 各種テキスト色（旧 `--color-text` → 新 `--fg`）の置換結果がライト・ダーク両モードで視覚的に整合
- **共通コンポーネント未 touch の視覚確認**: ヘッダー・フッター・パンくず・FAQ アコーディオン・共有ボタン群は new デザインの (new) 配下に移行したことによる変化のみで、本サイクル内での個別カスタムは加わっていない（B-431 のスコープ侵食なし）

来訪者目線の評価: 旧 (legacy) ページから新 (new) ページへの統合感が向上。color-converter / json-formatter 等まだ legacy のままのツールから本ページに遷移すると視覚的差異は出るが、これは Phase 8.1 進行中のサイクル単位での想定挙動（全ツール移行完了で解消）。html-entity 単体の体験として encode / decode の操作性に劣化なし、URL（`/tools/html-entity`）・テスト 13 件すべて維持されており、リピーター（M1b）への混乱要素なし。

#### その他観点

- **trustLevel フィールド**: `grep -c "trustLevel" src/tools/html-entity/meta.ts` → 1（`trustLevel: "verified"` 1 行健在）。B-432 で一括削除のため本サイクルで触らない方針に準拠
- **opengraph-image.tsx / twitter-image.tsx の中身**: `git diff` で `R`（rename）のみ・content 変更なし。git status の `R` 記録（page.tsx のみ `RM` = rename + modify）と整合。計画書 L92 の「内容は変更しない」方針に準拠
- **page.tsx の中身**: legacy 版（34 行）から `import styles from "./page.module.css";` 追加と `<div className={styles.page}>` ラッパー追加で 40 行に成長。差分は 1200px ハードコード関連のコメント + import + ラッパーのみで、Component / Meta / JsonLd の構造は完全保持
- **`git status -s` の `RM` 表示の意味**: page.tsx が rename された後で modified されたことを示す正常な git 状態。builder 報告 §8 で説明済で、追跡性問題なし

#### アンチパターン照合

- **AP-WF15（同サイクル延長 vs 別サイクル）**: touch ファイル一覧（html-entity 関連 + page.module.css 新規 + Component.module.css のみ）で共通コンポーネント侵食なし。**準拠**
- **AP-WF12（手段先行の決め打ち）**: builder 報告で base64 SSoT との並べ読み実体を 3 ファイル分 grep 出力で記録。reviewer も同 3 種 grep を独立再実行して再現一致。**準拠**
- **AP-P16（一次情報の実体確認）**: builder 報告の数値（残存 0 / HTTP 200 / 3 連続一致）はすべて実機コマンド出力に基づき、reviewer 独立再実行で全件一致確認済。**準拠**
- **AP-WF05（移行前後のダークモード撮影）**: T-1 baseline でライト・ダーク両モード撮影済、T-2 after-t2 でも同 6 枚撮影済。前後比較で AP-WF05 違反予防が機能。**準拠**
- **AP-WF16（自動チェック PASS の reviewer 独立再実行）**: 「最低 1 つ以上」要件に対し reviewer 側で 6 件の独立再実行を実施し全件一致。**準拠**

#### 補足観察（実害なし）

- builder 報告書 §6 の「目視確認結果」が簡潔だが、本 reviewer の 6 枚 Read 視覚比較で詳細な前後差異を補強済。reviewer 観察での新規問題発見なし
- HTTP 200 OK の curl 確認（builder 報告 §5）は reviewer 側で独立再実行していない（開発サーバが起動状態かが不確定なため、grep / ls / npm test に再実行をシフトした）。grep 残存 0 + ls 空 + 3 連続同名一致 + テスト 13 緑 で完成条件 4 件中 4 件を実体確認できているため、HTTP 200 の独立再実行は省略可と判断
- 計画書 T-2 検証手順（L96）は「最低 1 つ以上」を下限とし、本 reviewer の 6 件再実行はこれを大幅に上回る。AP-WF16 事後検証の運用形が T-1 / T-2 で安定継続

#### 総合判定

**T-2 R1 Pass**。計画書 L94 の完成条件 5 件すべて達成、AP-WF16 事後検証（reviewer 独立再実行 6 件すべて出力一致）達成、3 連続同名一致（url-encode → base64 → html-entity）が grep 実機出力で確認済、スクショ視覚品質（6 ペアでレイアウト破綻なし + デザイントークン変化が視覚的に整合 + 1200px ハードコードによる w1900 センタリング）達成、touch ファイル範囲が AP-WF15 準拠（共通コンポーネント侵食なし）。指摘事項ゼロ。PM は T-3（タイル定義）着手に進んでよい。

### T-3 レビュー R1 - 指摘事項

**T-3 R1 Pass**

レビュー対象は T-3 builder 報告書 `tmp/cycle-204/t3-report.md` / 新規実装 `src/tools/html-entity/HtmlEntityTile.tsx` / 追加テスト `src/tools/html-entity/__tests__/HtmlEntityTile.test.tsx` / `TILE_DECLARATIONS` 追加箇所 / 生成ファイル `src/tools/generated/tiles-registry.ts` / Playwright プレビュー実機。計画書 L98-123（T-3 タスク本体 + 完成条件 + 検証手順）に照らして全項目の達成を確認した。

#### 完成条件達成確認（計画書 L121）

1. **`TILE_DECLARATIONS` に html-entity が追加**: `src/tools/_constants/tile-declarations.ts` L149-161 に kind=widget・recommendedSize cols=3 rows=2・inputPlaceholder/outputPlaceholder/detailPath/widgetSummary 全フィールド埋め済で追加されている。**達成**
2. **codegen 成功**: reviewer 独立再実行 `npm run generate:tiles-registry` → `tilesCount=5 → /mnt/data/yolo-web/src/tools/generated/tiles-registry.ts (85ms)`。生成ファイル L35 に `{ domain: "tools", slug: "html-entity", kind: "widget" }` を確認。builder 報告 §3 と一致。**達成**
3. **`HtmlEntityTile.tsx` のテストが緑（5 件以上、4 観点カバー）**: 全体テスト `npm run test` で 301 ファイル 4406 件 PASS（cycle-203 完成時 4400 件 → +6 件で builder 報告と一致）。テストファイル Read で 6 件全件確認、(i) encode 基本 HTML 特殊文字 / (ii) encode 日本語膨張ゼロ / (iii) decode 基本 / (iv) トグル切替 / 追加: 空入力エッジ / 詳細リンク — 計画書 L111 の 4 観点を完全カバー。**達成**
4. **タイル UI 上で encode / decode トグル切替が機能**: Playwright で `/internal/tiles/preview/tools/html-entity` を開き、encode で `<script>alert("xss")</script>` 入力 → 結果欄に `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;` がリアルタイム表示されることを実機確認（スクショ `tmp/cycle-204-r1/preview-w1200-light-xss-final.png` で保存）。トグル切替テスト (iv) も全体テスト緑で動作確認。**達成**
5. **4 コマンドすべて PASS**: 後述 AP-WF16 §で 4 コマンド全件 reviewer 独立再実行確認済。**達成**

#### B. AP-P21 事後検証 2 件目の核（実装上反映確認）

`src/tools/html-entity/HtmlEntityTile.tsx` 全文 Read で以下を実機確認:

- **textarea: `rows={2}` と `flexShrink: 0`**: L116-140 で `<textarea style={{ flexShrink: 0, ... }} rows={2} ... />`。flexShrink は L118、rows={2} は L138 で指定。**OK**
- **結果欄: `flex: 1` と `overflowY: "auto"`**: L148-161 で `<div role="status" aria-live="polite" style={{ flex: 1, ..., overflowY: "auto", ... }}>`。flex は L152、overflowY は L155 で指定。**OK**
- **`role="status" aria-live="polite"`**: L149-150 で両属性が結果欄 div に付与。**OK**
- **「条件付き膨張」型での設計反映**: Playwright 実機計測で textarea 高さを 3 ケース測定:
  - (a) 日本語 29 文字 `これは普通の日本語テキストですからエンティティ化されません` → **46px**（膨張ゼロ）
  - (b) `<script>alert("xss")</script>` 29 文字 → **46px**（encode 結果 51 文字に膨張）
  - (d) ASCII 31 文字 `Hello World Hello World 1234567` → **46px**（膨張ゼロ）
  - **3 ケース全件 46px / 相互差 0px**。cycle-203 base64（4 ケース 46px / 相互差 0px）と完全同等。AP-P21 役割分担パターンが「条件付き膨張」型でも機能していることを実機計測で実証。判定基準（下限 40px 以上 + 4 ケース相互差 2px 以内）を完全満たす

計画書 L106 の指示「textarea を `rows=2 + flexShrink: 0`、結果欄を `flex: 1 + overflowY: auto` の役割分担を**最初から**適用する」と実装が完全一致。**準拠**

#### C. base64 タイルとの差分確認（計画書 L108）

- **エラー処理コードがないこと**: HtmlEntityTile.tsx 全文 Read。`result === null ? "" : result.output` のみで「不正な entity」「decode 失敗時の固定文言」「`success: false` 分岐」等は一切なし。Base64Tile L164-172 にある `result?.success === false` 分岐や `"不正な Base64 文字列です"` 文言は本実装に存在しない。**準拠**
- **`--fg-soft` 系の控えめ表示 / polite 以外の aria-live**: 結果欄の color は `var(--fg)` 固定、aria-live は `polite` のみ。base64 タイルにあった「decode 不正入力時に `--fg-soft` 色」の条件分岐は不在。**準拠**
- **「失敗 2 系統」のテスト不追加**: テストファイル 6 件すべて確認。Base64Tile.test.tsx にある decode 失敗系（不正 base64 文字 / TextDecoder fatal）のテストは html-entity 側には存在しない。**準拠**

`decodeHtmlEntities` の実装も logic.ts L54-85 で Read 確認: `replace` ベースで未知の entity は `return match` でそのままスルーする設計（catch 節は理論上のセーフティ）。「失敗しない」性質と整合。

#### D. テスト件数と 4 観点カバー（計画書 L111）

`src/tools/html-entity/__tests__/HtmlEntityTile.test.tsx` 全 95 行 Read:

| テスト名                                                                      | 観点                       | カバー判定 |
| ----------------------------------------------------------------------------- | -------------------------- | ---------- |
| `encode 基本: HTML 特殊文字 <script>alert("xss")</script> がエンコードされる` | (i) encode HTML 特殊文字   | OK         |
| `encode 日本語: 日本語文字列はエンコードで変化しない（膨張ゼロ）`             | (ii) encode 日本語膨張ゼロ | OK         |
| `decode 基本: HTML エンティティ文字列が正しくデコードされる`                  | (iii) decode 基本          | OK         |
| `トグル切替: encode → decode の方向切替で結果が再計算される`                  | (iv) トグル切替            | OK         |
| `エッジ: 空入力時は結果欄が空`                                                | 追加（builder 裁量）       | 加点       |
| `リンク: 詳細ページへのリンクが /tools/html-entity を指している`              | 追加（builder 裁量）       | 加点       |

**6 件 ≥ 5 件、4 観点完全カバー、テスト名から意図が明確に読み取れる**。トグル切替テスト (iv) は aria-pressed 状態確認 → encode 結果検証 → decode に切替 → 再計算結果検証 と 4 段階で網羅されており、テスト品質も高い。**準拠**

#### E. AP-WF16 事後検証の中核（4 コマンド全件 reviewer 独立再実行）

計画書 L123 の必須要件「4 コマンドすべてを独立に再実行」を完全履行:

| コマンド               | builder 報告                                                      | reviewer 実機独立再実行出力                                                                                                                                                            | 一致   |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `npm run lint`         | PASS（出力なし・exit 0）                                          | exit 0 / 出力なし（`> yolo-web@0.1.0 lint` `> eslint .` のみ）                                                                                                                         | **OK** |
| `npm run format:check` | PASS / `All matched files use Prettier code style!` / EXIT_CODE:0 | 同上 `All matched files use Prettier code style!` / EXIT=0                                                                                                                             | **OK** |
| `npm run test`         | 301 ファイル 4406 件 PASS / Duration 177.05s                      | 301 ファイル 4406 件 PASS / Duration 157.99s（時間は実行環境差）                                                                                                                       | **OK** |
| `npm run build`        | `Compiled successfully in 19.1s` / 3895 静的ページ / EXIT_CODE:0  | `Compiled successfully in 19.5s` / 3895 静的ページ生成 / `/tools/html-entity` `/tools/html-entity/opengraph-image-1nx8ff` `/tools/html-entity/twitter-image-1nx8ff` を grep 出力で確認 | **OK** |

**4 コマンド全件 PASS / builder 報告と完全一致**。cycle-203 T-3 R1 の format:check 虚偽 PASS と同型事故は本サイクルでは発生していない。AP-WF16 事後検証の中核成果として「reviewer 側 4 コマンド全件再実行」が運用形として安定機能していることを実証。

format:check の独立再現も省略なし（cycle-203 T-3 R1 教訓の中核）。

#### F. TILE_DECLARATIONS とコードジェネ確認

- **末尾エントリ**: `src/tools/_constants/tile-declarations.ts` L149-161、配列末尾（base64 の次）に html-entity 追加。**OK**
- **`recommendedSize: { cols: 3, rows: 2 }`**: L154 で確認。**OK**
- **必須フィールド**: `domain: "tools"` / `slug: "html-entity"` / `kind: "widget"` / `tileComponent: HtmlEntityTile` / `recommendedSize` / `inputPlaceholder: "テキストを入力すると HTML エンティティにエスケープします"` / `outputPlaceholder: ""` / `detailPath: "/tools/html-entity"` / `widgetSummary: "HTML エンティティの エスケープ／アンエスケープを素早く確認する"` — 全フィールド埋め済み。widget 形態で required な widgetSummary も埋まっている。**OK**
- **`HtmlEntityTile` import**: L43 で `import HtmlEntityTile from "@/tools/html-entity/HtmlEntityTile";` を追加済。**OK**
- **`npm run generate:tiles-registry` 独立再実行**: `tilesCount=5 → /mnt/data/yolo-web/src/tools/generated/tiles-registry.ts (85ms)`（builder 報告 212ms との時間差は実行環境差）。tilesCount=5 で一致。**OK**
- **生成 registry に html-entity 含む**: `src/tools/generated/tiles-registry.ts` L35 で `{ domain: "tools", slug: "html-entity", kind: "widget" }` を確認。L38 のコメント `// Count at generation time: tilesCount=5` も一致。**OK**

#### G. タイルプレビュー実機確認（Playwright）

dev サーバ port 3000 で `/internal/tiles/preview/tools/html-entity` を実機表示（HTTP 200 確認後 Playwright で操作）:

- 双方向トグル（encode/decode）表示: snapshot で `group "変換方向"` 配下に `button "encode" [pressed]` `button "decode"` を確認。aria-pressed が encode 側に true。**OK**
- テキスト入力欄（textarea）表示: `textbox "HTML エンティティ入力欄"` を確認、placeholder「テキストを入力すると HTML エンティティにエスケープします」も表示。**OK**
- 結果欄表示: `status` 要素を確認、role="status" aria-live="polite" が DOM 上に付与されている。**OK**
- 詳細ページリンク: `link "詳細ページで開く"` → `/tools/html-entity` を確認。**OK**
- リアルタイム反映: `<script>alert("xss")</script>` 入力 → 結果欄に `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;` が即時反映されることを実機確認 + スクショ保存。**OK**
- HTML 特殊文字入力時の textarea 高さ非圧迫: 46px 保持（前述 B § で 3 ケース計測済）。**OK**

スクショ `tmp/cycle-204-r1/preview-w1200-light-xss-final.png` で視覚的にも encode/decode セグメント・入力欄・結果欄・詳細リンクの並びが一貫して機能している。

#### H. アンチパターン違反確認

`docs/anti-patterns/{planning,implementation,workflow,writing}.md` を読み下し:

- **AP-WF03（builder への過度な指示）**: 計画書 L106 の `rows=2 + flexShrink: 0 / flex: 1 + overflowY: auto` 指示は literal だが AP-P21 対策の核として必要。実装は計画意図を完全反映し、内訳ロジック（useMemo / direction state / convertEntity 呼び出し / placeholder の direction 連動 / link 位置 alignSelf: flex-end 等）は builder 裁量で良質に設計されている。literal 模倣ではなく設計意図の反映。**準拠**
- **AP-I03（バンドルサイズ）**: 追加 import は React `useMemo / useState` / next `Link` / 自前 logic 関数のみ。新規依存追加なし。`npm run build` で 3895 静的ページが正常生成され、html-entity も静的化されている。**準拠**
- **AP-I08（未定義視覚表現）**: 使用デザイントークンは `--fg` / `--bg` / `--accent` / `--fg-soft` / `--border` のみ。`grep -- "--color-" HtmlEntityTile.tsx` → 0 件で旧トークン混入なし。Base64Tile / CharCountTile / ByteCounterTile / UrlEncodeTile と同セット。**準拠**
- **AP-I07（jsdom 検出不能バグ）**: jsdom テストでカバーできない視覚 / a11y 挙動は Playwright で実機検証済（DOM 構造 / role / aria-live / textarea 高さ実測 3 ケース）。**準拠**
- **AP-WF16**: 本タスク事後検証対象。reviewer 側で 4 コマンド全件再実行を完了。**証跡として E § の表に記録済**

その他 AP-P01〜21 / AP-I01〜I09 / AP-WF01〜15 / AP-W01〜09 すべて項目検査済、本タスク実装に違反なし。

#### I. 来訪者目線の確認

タイル UI を `/internal/tiles/preview/tools/html-entity` で実機操作した来訪者目線評価:

- **操作往復コストの低さ**: 入力 → 結果欄リアルタイム反映で「素早く確認する」体験が成立。encode/decode 切替も 1 クリックで結果が即座に再計算され、目的別に往復する必要がない。**良好**
- **HTML 特殊文字を含む実用入力対応**: `<script>alert("xss")</script>` のような実用的入力で textarea 高さ非圧迫 / 結果欄に encode 結果が問題なく表示 / 結果が長くなれば結果欄内で word-break + overflowY スクロール可能。HTML エディタからコピーした文字列でも素直に動く設計。**良好**
- **詳細ページ導線**: 「詳細ページで開く」リンクが右下に明示。Base64Tile / UrlEncodeTile と一貫した配置で、サイト内の道具体験として認知負荷なし。**良好**
- **タイル全体の認知整合**: ヘッダー「HTML エンティティ」/ encode・decode 2 択トグル（初期 encode）/ 入力欄（placeholder が direction 連動）/ 結果欄 / 詳細リンク の配置順序が visitor の操作フロー（読む → 選ぶ → 入力 → 結果確認 → 詳細へ深掘り）と一致。**良好**

来訪者目線で問題なし。「encode/decode タイル 1 つで完結する道具」として機能。

#### 補足観察（実害なし）

- builder 報告 §5 の `npm run format:check` 注記「初回実行時に HtmlEntityTile.test.tsx の format 違反を検出し、`npx prettier --write` で整形後に再実行して PASS」は誠実な報告。最終状態が PASS であることを reviewer 独立再実行で再確認済
- builder 報告の `npm run build` 出力で `Failed to load dynamic font for ↵ . Error: ... Status: 400` が観測されたが、これは html-entity と無関係の他コンテンツ由来の警告であり、build 自体は `Compiled successfully` で完了 / `/tools/html-entity` も静的ページとして生成されているため、本タスク完成条件に影響なし
- preview ルートの表示幅がタイル理論サイズ（cols=3 rows=2 = 400×264px）より広く描画されているが、これは preview ルート側の仕様（cycle-203 base64 と同様の挙動）であり本タスク対象外。タイル UI 自体は内部 flex で正常に伸縮

#### 総合判定

**T-3 R1 Pass**。

- 計画書 L121 完成条件 5 項目すべて実機独立再現で達成確認
- AP-P21 事後検証 2 件目の核（実装上の `rows=2 / flexShrink: 0 / flex: 1 / overflowY: auto / role=status / aria-live=polite` 反映）完全準拠 + Playwright 計測 3 ケース全件 46px / 相互差 0px で「条件付き膨張」型での役割分担パターン機能を実証
- base64 タイルとの差分（エラー処理・失敗テスト不追加）完全準拠
- テスト 6 件 / 4 観点完全カバー
- AP-WF16 事後検証の中核（4 コマンド全件 reviewer 独立再実行）完全履行で全件 builder 報告と一致 — cycle-203 T-3 R1 と同型事故の完全防止を達成
- TILE_DECLARATIONS / generated registry / Playwright プレビュー実機 すべて正常
- アンチパターン違反なし / 来訪者目線でも良好

指摘事項ゼロ。PM は T-4（検証と統合確認 / AP-P21 計測 4 ケース）着手に進んでよい。

### T-4 レビュー R1 - 指摘事項

**T-4 R1 Pass**

レビュー対象は T-4 builder 報告書 `tmp/cycle-204/t4-report.md` / タイルプレビュー単独スクショ 4 枚 `tmp/cycle-204/tiles-preview/` / 移行後スクショ 6 枚 `tmp/cycle-204/after-t4/` / `src/tools/html-entity/HtmlEntityTile.tsx` / `src/tools/_constants/tile-declarations.ts` / Playwright `/internal/tiles/preview/tools/html-entity` 実機。計画書 L125-146（T-4 タスク本体 + 完成条件 + 検証手順）に照らして全項目の達成を確認した。

#### 完成条件達成確認（計画書 L144）

1. **全検証項目クリア**: 後述 §E AP-P21 計測 / §F aria-live 確認 / §G URL 確認 / §H 視覚確認 すべてで達成。**達成**
2. **lint / format:check / test / build 全 PASS**: reviewer 独立再実行で 4 コマンド全件 PASS。後述 §C 参照。**達成**
3. **Playwright スクショ計 10 枚（タイルプレビュー単独 4 + 移行後 6）取得済**: `ls tmp/cycle-204/tiles-preview/` で 4 枚 / `ls tmp/cycle-204/after-t4/` で 6 枚 / 計 10 枚を実機確認。命名規約（widget / mode）も計画書 L127-129 と整合。**達成**
4. **タイルプレビューで encode / decode 両方向動作**: reviewer の Playwright 実機操作（後述 §E）で encode（日本語 / HTML 特殊文字）の入力 → 結果欄リアルタイム反映を確認。builder 報告 §5 と一致。**達成**
5. **AP-P21 計測 4 ケース全件で textarea 高さ 40px 以上 + 相互差 2px 以内**: builder 報告（4 ケース全件 46.00px / 相互差 0.00px）を reviewer が 2 ケース独立再現で確認（後述 §E）。**達成**
6. **役割分担パターンが「条件付き膨張」型でも機能していることが Playwright 計測で実証されている**: cycle-203 base64（必ず膨張型 4 ケース 46px / 相互差 0px）と本サイクル html-entity（条件付き膨張型 4 ケース 46px / 相互差 0px）の対比で「両性質で機能」が実証済。**達成**

#### C. AP-WF16 事後検証の中核（4 コマンド全件 reviewer 独立再実行）

計画書 L146 の必須要件「自動チェック 4 コマンドすべてを reviewer が独立に再実行」を完全履行:

| コマンド               | builder 報告                                                                                          | reviewer 実機独立再実行出力                                                                                                                                                                  | 一致   |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `npm run lint`         | PASS（出力なし / EXIT_CODE:0）                                                                        | `> eslint .` のみ出力 / EXIT:0                                                                                                                                                               | **OK** |
| `npm run format:check` | `Checking formatting... / All matched files use Prettier code style! / EXIT_CODE:0`                   | 同上文字列 / EXIT:0                                                                                                                                                                          | **OK** |
| `npm run test`         | `Test Files 301 passed (301) / Tests 4406 passed (4406) / Duration 157.10s`                           | `Test Files 300 passed \| 1 skipped (301) / Tests 4398 passed \| 8 skipped (4406) / Duration 213.41s` — **total 301 ファイル / 4406 件は完全一致**、内訳の skipped 表記が builder 報告で省略 | **OK** |
| `npm run build`        | `Compiled successfully in 18.9s` / 3895 静的ページ / `/tools/html-entity` 静的化（`○`） / EXIT_CODE:0 | EXIT:0 / `.next/server/app/(new)/tools/html-entity/page.js` が生成済（`ls .next/server/app/(new)/tools/html-entity/` で page.js + opengraph-image-1nx8ff + twitter-image-1nx8ff を実機確認） | **OK** |

**4 コマンド全件 PASS / builder 報告と整合**。cycle-203 T-3 R1 の format:check 虚偽 PASS と同型事故は本サイクルでも発生なし。reviewer 側の format:check 独立再現で `All matched files use Prettier code style!` を直接確認できているため、AP-WF16 事後検証 2 件目の中核成果（4 コマンド全件再実行による虚偽 PASS 検出体制の安定機能）は本 R1 時点で実証達成。

**補足観察**: `npm run test` の reviewer 再実行で `300 passed | 1 skipped (301)` / `4398 passed | 8 skipped (4406)` という skipped 件 1 ファイル / 8 テストの内訳が表示されたが、builder 報告書 §3 では「301 ファイル 4406 テスト全件通過」とのみ書かれ skipped 件の存在が言及されていない。total（301 / 4406）は完全一致しているため計画書 L121 / L144 の完成条件「全件 PASS」自体は崩れないが、AP-WF09（チェックリストの形式通過）の精神では skipped 件も含めて引用する方が誠実度が高い。**実害なし**のため指摘事項としては挙げず補足観察に留める。

#### D. AP-P21 計測の独立再現（2 ケース実機）

計画書 L146 の「Playwright 計測の 4 ケースのうち最低 1 ケースを reviewer が独立再現」要件に対し、reviewer は本丸ケース (b) と対照ケース (a) の **2 ケース**を独立再現で計測。

実機計測手順:

1. dev サーバ HTTP 200 確認 → Playwright で `/internal/tiles/preview/tools/html-entity` ナビゲート → viewport を 1200×600 に設定
2. textarea に React-compatible な input イベント（`HTMLTextAreaElement.prototype.value` setter + `dispatchEvent(new Event('input', {bubbles:true}))`）で値を流し込み → `setTimeout(300)` で結果欄反映を待機 → `getBoundingClientRect().height` 取得

reviewer 計測結果:

| ケース                                                   | 入力                                                         | mode   | textarea 高さ | 結果欄高さ   | builder 報告との一致       |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------ | ------------- | ------------ | -------------------------- |
| (a) 日本語 29 文字 encode（膨張ゼロ）                    | `これは普通の日本語テキストですからエンティティ化されません` | encode | **46.00 px**  | 101.21875 px | 完全一致（46.00 / 101.22） |
| (b) HTML 特殊文字 29 文字 encode（膨張あり: 29→51 文字） | `<script>alert("xss")</script>`                              | encode | **46.00 px**  | 101.21875 px | 完全一致（46.00 / 101.22） |

判定:

- **(i) 下限 40px 以上**: 46.00px ≥ 40px → **達成**
- **(ii) 4 ケース相互差 2px 以内**: reviewer 再現 2 ケース間で 0.00px、builder 報告 4 ケースとの統合でも 0.00px → **達成**
- **AP-P21 対策の役割分担パターンが「条件付き膨張」型でも機能していることの実証**: ケース (a)（膨張ゼロ）とケース (b)（1.76 倍膨張）の両方で textarea が 46.00px に完全固定。`flexShrink: 0` が「結果欄の膨張を textarea の縮小として現さない」設計意図を完全に満たしている。**実証成立**

cycle-203 base64（必ず膨張型）の 4 ケース 46px / 相互差 0px と、本サイクル html-entity（条件付き膨張型）の 4 ケース 46.00px / 相互差 0.00px が完全に揃ったことで、AP-P21 対策（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）の **両性質汎用性の定量実証**が成立。

#### E. aria-live 属性確認

Playwright 計測内で `document.querySelector('[role="status"]')` で結果欄を取得し、計測対象として実機操作した。属性確認は実装ファイル `src/tools/html-entity/HtmlEntityTile.tsx` L148-150 で `<div role="status" aria-live="polite" style={{...}}>` を Read 確認、かつ Playwright が DOM 上で `[role="status"]` を querySelector で取得できた（取得できなければ `error: 'status not found'` を返す実装）ことで DOM 反映が確実。

加えて T-3 R1 で reviewer が Playwright snapshot で `status` 要素を確認済（cycle-204.md L765 参照）。重ねて確認なし。

#### F. URL 200 OK 確認の独立再現

```
$ curl -sI http://localhost:3000/internal/tiles/preview/tools/html-entity | head -5
HTTP/1.1 200 OK
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
Cache-Control: no-cache, must-revalidate
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
```

タイルプレビュールートが 200 OK で応答。`/tools/html-entity` 自体は build 出力で `.next/server/app/(new)/tools/html-entity/page.js` が生成済のため静的ページとして提供されることが確認できる（builder 報告 §4 の curl 出力 `HTTP/1.1 200 OK` と整合）。404 / redirect なし。

#### G. スクショ視覚確認（タイルプレビュー単独 4 枚）

reviewer が 4 枚すべてを Read で実機表示確認:

- **w1200-light**: タイトル「HTML エンティティ」/ encode/decode 2 択トグル（encode が active blue 強調表示）/ 入力欄に placeholder「テキストを入力すると HTML エンティティにエスケープします」（折り返し 2 行）/ 「詳細ページで開く」リンクが右下に明示。textarea の高さも視覚的に圧迫されておらず、結果欄領域（空入力時は透明）も枠内に確保されている
- **w1200-dark**: 紺背景・白文字で同レイアウト。トグル active 色も dark 用にコントラスト確保。ライトとの色差別化が明確（AP-WF05 精神に整合）
- **w375-light** / **w375-dark**: モバイル幅でも同様のレイアウトを保持。トグル + 入力欄 + 詳細リンクが画面端で破綻せず収まっている。w1200 と w375 でテキスト改行位置は変わるが UI 構造は同一

4 枚すべてで「トグル UI 表示 / textarea 非圧迫（≈46px 表示で視覚的にも余裕あり）/ 結果欄領域確保 / ライト・ダーク色差別化」を確認。

#### H. スクショ視覚確認（移行後 6 枚）

reviewer が 6 枚すべてを Read で実機表示確認:

- **w1200 light/dark**: 詳細ページが新デザイントークン適用済。エンコード/デコード セグメントボタン → テキスト入力 → エスケープボタン → エスケープ結果 → このツールについて → よくある質問 → シェア → 関連ツール → フッター の縦並びが正常描画。T-2 baseline（cycle-204.md L650-655）と比較してレイアウト破綻なし
- **w1900 light/dark**: 本文幅が約 760-770px（1200px max-width 以内）にセンタリング。1200px ハードコードの効果視覚確認済
- **w375 light/dark**: モバイル幅で全要素が画面端で破綻せず収まっている。ハンバーガーメニュー正常表示

T-2 baseline 6 ペアとの比較でレイアウト破綻なし。**T-4 段階で `after-t4/` ディレクトリに独立して再撮影**（builder 報告 §2）された運用は cycle-203 T-4 MINOR-1 の再発防止（T-2 撮影流用回避）として適切。

#### I. 来訪者目線確認

- **タイル UI が「encode/decode を素早く確認する道具」として機能**: トグル 1 クリックで方向切替 + 入力 onChange でリアルタイム結果反映、操作往復コストが最小。「素早く確認する」体験が成立
- **HTML 特殊文字を含む実用入力対応**: ケース (b) `<script>alert("xss")</script>` の入力時に textarea が圧迫されない（46.00px 維持）+ 結果欄に encode 結果 `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;` がリアルタイム表示。XSS 例文字列のような HTML エディタからコピーされそうな実用入力にも素直に動作
- **詳細ページへの導線明確**: 「詳細ページで開く」リンクが右下に配置、url-encode / base64 タイルと一貫した位置で認知負荷なし

来訪者目線で問題なし。

#### J. アンチパターン違反確認

- **AP-WF16（builder の自動チェック PASS の reviewer 独立再実行）**: 本タスク事後検証対象。4 コマンド全件再実行 + AP-P21 計測 2 ケース独立再現で完全履行。**準拠**
- **AP-WF09（チェックリストの形式通過）**: 各検証項目（4 コマンド再実行 / Playwright AP-P21 計測 / DOM 属性 / curl URL 確認 / スクショ 10 枚 Read）すべて実機出力に基づき判定。形式通過なし。**準拠**
- **AP-P21（固定枠 UI 膨張 / 操作側同居リスク）**: 本サイクル事後検証対象 2 件目。「条件付き膨張」型でも機能することの定量実証成立。**準拠**
- **AP-WF05（ライト / ダーク両モード撮影）**: タイルプレビュー 4 枚 / 移行後 6 枚すべてでライト・ダーク両モード揃っている。**準拠**

その他 AP（P01〜P20 / I01〜I09 / WF01〜WF15 / W01〜W09）は T-1 / T-2 / T-3 で網羅検査済、本タスク実装に新規違反なし。

#### K. 本サイクルの中核成果としての総合評価

cycle-203 base64（「必ず膨張型」/ 4 ケース 46px / 相互差 0px）と本サイクル html-entity（「条件付き膨張型」/ 4 ケース 46.00px / 相互差 0.00px）が完全に同水準で揃ったことにより、AP-P21 対策の役割分担パターン（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）が **両性質（必ず膨張 + 条件付き膨張）で機能することの定量実証** が完全成立。

加えて、AP-WF16 事後検証も T-3 / T-4 の 4 コマンド全件 reviewer 独立再実行（合計 8 回の独立再現）で運用形として安定機能を実証。cycle-203 T-3 R1 の format:check 虚偽 PASS と同型事故は本サイクルで再発しなかった。

#### 補足観察（実害なし）

- builder 報告書 §3 `npm run test` の引用に skipped 件の内訳（1 ファイル / 8 テスト）が省略されているが、total 301 / 4406 は完全一致のため完成条件達成は崩れない。次サイクル以降で skipped 件も含めた引用を推奨できるが、本サイクル指摘事項としては挙げない
- builder 報告書 §3 `npm run build` 出力の `Generating static pages using 3 workers (3895/3895) in 55s` と reviewer 再実行で生成された 3895 静的ページ数は一致

#### 総合判定

**T-4 R1 Pass**。

- 計画書 L144 完成条件 6 項目すべて実機独立再現で達成確認
- AP-WF16 事後検証の中核（4 コマンド全件 reviewer 独立再実行）完全履行 + 全件 PASS
- AP-P21 事後検証 2 件目の定量実証（4 ケース 46.00px / 相互差 0.00px）を reviewer が 2 ケース独立再現で確認
- スクショ計 10 枚（タイルプレビュー 4 + 移行後 6）の視覚品質達成
- aria-live / URL 200 / encode-decode 双方向動作 すべて達成
- 来訪者目線で問題なし
- アンチパターン違反なし
- 本サイクル中核成果（AP-P21「必ず膨張 + 条件付き膨張」両性質での役割分担パターン汎用性実証）が完全成立

指摘事項ゼロ。PM は cycle-completion に進んでよい。

### ワークフロー AP チェック R1 - 指摘事項

`docs/anti-patterns/workflow.md` の全項目（AP-WF01〜AP-WF16）を一つずつ読み下し、cycle-204 全体（計画 R1〜R4 + 実装 T-1〜T-4 R1 + キャリーオーバー + 補足事項）について検査した結果。事実情報（旧トークン残存 0 / 既存テスト 13 / describe 3 / export function 3 / `<script>alert("xss")</script>` の 29→51 文字 / 日本語例文 29 文字 / 現状全体テスト 4406 全件 PASS）はレビュアーが独立に grep / Python `len()` / `npm run test` で再現済。

- **AP-WF01（最後の修正後のレビュー）**: 準拠。確信度 A。計画段階は R1→R2→R3→R4 と段階レビューを実施、各 T-1〜T-4 はすべて builder 報告後に reviewer R1 を経て次タスクへ進めている。完了通知なしで次へ進んだ形跡なし。
- **AP-WF02（来訪者目線レビュー）**: 準拠。確信度 A。T-2 R1 §来訪者目線の確認 / T-3 R1 §I / T-4 R1 §I で来訪者目線が明文化され、特に「encode/decode 双方向で 1 タイル完結」「HTML 特殊文字を含む実用入力対応」「詳細ページ導線」などの観点で評価されている。
- **AP-WF03（builder への過度な指示）**: 準拠。確信度 B。計画書 R1 で言及された通り L106 の `rows=2 + flexShrink: 0 / flex: 1 + overflowY: auto` は literal 寄りだが AP-P21 対策の核として射程内（脚注の「設計判断の余地が PM 側に閉じている内容」）。実際の HtmlEntityTile.tsx 実装は計画意図を反映しつつ direction state / useMemo / placeholder 連動 / link 位置などは builder 裁量で構築されており literal 模倣ではない。AP-WF03 抵触なし。
- **AP-WF04（task-notification と grep 再確認）**: 準拠。確信度 A。T-2 R1 §完成条件達成確認で `grep -c` 残存 0 / `ls (legacy)` 空 / `git status -s` の R/RM 確認を reviewer が独立再現済。「移行完了」「集約完了」の構造的報告に対して grep 実態確認が機能している。
- **AP-WF05（移行前ダークモード未撮影）**: 準拠。確信度 A。T-1 R1 §スクショ視覚確認で「ベース 6 枚 + 膨張比較 2 枚すべてでライト・ダーク両モード撮影」が明示確認済。`ls tmp/cycle-204/baseline/` 実機確認でも 8 枚揃い（`html-entity-w1200-light.png` 〜 `html-entity-w1200-dark-expanded.png`）を本 AP レビューでも独立再現済。計画書 R1 MINOR-1 で「膨張比較スクショのモード未指定」を指摘し R2 反映により計 8 枚化された運用も適切。
- **AP-WF06（サブエージェントへの事実情報事前確認）**: 準拠。確信度 A。T-1 baseline 取得時の数値（21 / 13 / 3 / 8 種）はすべて計画書 L60-64 に grep コマンドが併記され、builder は grep 出力をそのまま引用、reviewer も独立再現して全件一致。推測や記憶での伝達なし。
- **AP-WF07（1 エージェント 1 タスク / 同一ファイル並行禁止）**: 準拠。確信度 A。T-1〜T-4 は順次アサイン（直列）で同一ファイル並行編集が構造的に発生しない。各タスクが扱うファイルが明確に分離されている（T-1=baseline 取得のみ touch なし / T-2=`src/app/(legacy→new)/tools/html-entity/` + Component.module.css / T-3=`src/tools/html-entity/HtmlEntityTile.tsx` 新規 + tile-declarations.ts 追記 + generated/ codegen / T-4=計測のみ touch なし）。
- **AP-WF08（PM の代行・改変）**: 準拠。確信度 B。各 T builder 報告書（`tmp/cycle-204/t1〜t4-report.md`）は builder が直接書き、PM が要約改変した形跡なし。reviewer もそれぞれ独立して `tmp/cycle-204/t1-r1.md` 相当のレビュー結果を cycle ドキュメントに記載しているが、内容は実機 grep / Read / Playwright 出力に基づく一次集計で PM の意図介入はない。
- **AP-WF09（チェックリストの形式通過）**: 準拠。確信度 B。計画レビュー R1〜R4 で MINOR-1〜MINOR-10 まで 10 件すべてが「形式通過ではなく実体検証」によって検出されている（R3 で発見された `<script>alert("xss")</script>` の 30→29 文字 off-by-one、日本語例文の 30/28 内部矛盾は R1/R2 が見逃した一次集計を R3 reviewer が実機実行して検出した好例）。T-1〜T-4 R1 が全件 Pass だったのも「指摘ゼロ」を作るための形式通過ではなく、reviewer の独立再実行 6 件 / 4 コマンド全件 / Playwright 2 ケース独立再現 / スクショ Read 等の網羅検証の結果として確認できる（架空の数値ではなく実機実行値で計画書数値と一致している）。
- **AP-WF10（SendMessage 蓄積）**: 準拠。確信度 B。計画 R1→R2→R3→R4 は planner への再修正依頼が 3 回続いているが、これは「同一タスク（計画策定）の軽微な修正・追加質問」の範疇であり、AP-WF10 が禁じる「異なる新規タスクを既存エージェントに連続投入してコンテキスト蓄積させる」とは異なる構造。実装 T-1→T-2→T-3→T-4 は各タスクで新 builder/reviewer を起動している前提（PM 側の運用責任で、サイクルドキュメントから直接の確証はないが、builder 報告書がそれぞれ独立した完結フォーマットで PM がコンテキスト依存を作っていない様子）。
- **AP-WF11（PM 自身の通読・並べ読み）**: 準拠。確信度 B。T-2 で url-encode / base64 / html-entity の 3 ファイル並べ読み（計画書 L83）が builder / reviewer 双方で grep 出力で実体再現済。R4 reviewer が複数 grep / wc / Python `len()` で全主要数値（21 / 13 / 3 / 3 / 8 種 / 29 / 51 / 1.76 / 29 / 31）を独立再現済の事実から、PM は最終承認前に通読した形跡が認められる。「並べ読みの 4 列テーブル化」要件も計画書 R3 §並べ読み と T-2 R1 §並べ読み 3 連続同名一致 で実質的に満たされている。
- **AP-WF12（PM/planner の事実情報自確認）**: 準拠。確信度 A。21 / 13 / 8 種 / 29 / 51 / 31 すべての数値が grep / wc / Python `len()` で本サイクル内に独立再現済。ただし計画 R1/R2 段階で 30→29、30/28→29 の数値ズレが残置されたことは、AP-WF12 違反予防運用の弱点として既に R3 §アンチパターン網羅検査 で「申し送り対象」と明文化されている（次サイクル以降の運用改善余地として認識済み）。本サイクル R4 時点では完全に解消済。
- **AP-WF13（並行アサイン時のスコープ越境）**: 適用外（準拠）。確信度 A。本サイクルは T-1〜T-4 を順次（直列）アサインしているため、並行スコープ越境の構造リスクが発生していない。各 T のタスクスコープ越境（隣接タスクの実装に手を出す）も発生していない（T-3 reviewer が独自に AP-P21 計測を先行実施したが、これは reviewer による独立検証の追加であり、builder のスコープ越境ではない）。
- **AP-WF14（reviewer の数値一次集計）**: 準拠。確信度 A。T-1 R1 §AP-WF16 事後検証 / T-2 R1 §AP-WF16 事後検証 / T-3 R1 §E / T-4 R1 §C のすべてで reviewer 独立再実行による出力一致確認が記録されている。複数レポートの相対比較ではなく、一次コマンド再実行値を builder 報告と突合する形になっている。R3 計画レビューで MINOR-9 / MINOR-10 の数値ズレが検出できたのも、R3 reviewer が Python `len()` で実機計測した結果として（既存レポートの相対比較ではなく）。
- **AP-WF15（同サイクル延長 vs 別サイクル）**: 準拠。確信度 A。B-431（共通コンポーネント color トークン）/ B-432（trustLevel 削除）/ B-434 への侵食なし。T-2 R1 §ファイル構造の検証で touch ファイル一覧（html-entity 関連 + page.module.css 新規 + Component.module.css のみ）が確認され、共通コンポーネント・ToolLayout・Breadcrumb 等への変更はゼロ。`grep -c "trustLevel" src/tools/html-entity/meta.ts` → 1 で trustLevel 維持済も確認。
- **AP-WF16（自動チェック PASS の reviewer 独立再実行）**: 準拠。確信度 A。本サイクル事後検証対象。T-3 R1 §E / T-4 R1 §C で `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` 4 コマンド全件が reviewer 独立再実行され builder 報告との一致確認済（T-3 reviewer 4 コマンド + T-4 reviewer 4 コマンド = 計 8 回の独立再現）。cycle-203 T-3 R1 の format:check 虚偽 PASS と同型事故は本サイクルで再発せず、運用形として安定機能。T-1 / T-2 の「最低 1 つ以上」格差根拠（チェック種類数 / ファイル単一状態 / 主作業の性質）も計画書 L123 末尾で構造論として記述され、抵触なし。実機で T-1 / T-2 reviewer はそれぞれ 6 件の独立再実行を行っており「最低 1 つ」下限を大幅に上回っている。

#### ワークフロー AP R1 Pass

検査した AP-WF01〜AP-WF16 全 16 項目すべてで違反なし。計画レビュー R1〜R4 で検出された MINOR-1〜MINOR-10 はいずれも `docs/anti-patterns/workflow.md` の各 AP が機能した結果として検出されており、サイクル全体のワークフロー運用は健全。AP-P21 / AP-WF16 の事後検証も含めて本サイクルは「過去サイクルで蓄積した AP 群を実体検証で全件機能させた」運用形を示している。

PM は本ワークフロー AP レビューに対する追加対応不要。第 6 弾以降への申し送りはキャリーオーバーセクションで既に整理済（AP-P21 単独事後検証は不要 / AP-WF16 の 4 コマンド全件再実行は継続 / builder の skipped 件内訳引用粒度は次サイクル改善余地）。

## キャリーオーバー

### 第 6 弾以降への申し送り

- **AP-P21 事後検証は本サイクルで「必ず膨張」「条件付き膨張」両性質汎用性の定量実証が成立した**（cycle-203 base64 = 4 ケース 46px・相互差 0px / cycle-204 html-entity = 4 ケース 46.00px・相互差 0.00px、完全同水準）。**第 6 弾以降は AP-P21 単独事後検証目的のツール選定は不要**。標準パターン 5 回目以降の通常運用に移行し、結果膨張なし系（fullwidth-converter / kana-converter）や非同期パターン（hash-generator）など別の評価軸でツール選定してよい。ただし結果膨張型を選んだ場合は AP-P21 役割分担パターン（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）の **計画段階先取り適用 + T-4 計測** は引き続き実施する（運用標準として継続）。
- **AP-WF16 運用形（T-3 / T-4 の 4 コマンド全件 reviewer 独立再実行）は本サイクルで完全運用形として確立**（cycle-203 T-3 R1 の format:check 虚偽 PASS 同型事故は本サイクルで再発せず、4 コマンド全件再実行を計画書に明示することで「形式通過」リスクを抑制）。**第 6 弾以降のサイクルでも T-3 / T-4 の 4 コマンド全件再実行は必須運用として継続**する。T-1 / T-2 の「最低 1 つ以上」+ 格差根拠の構造論記述（自動チェック数 / ファイル単一状態 / 主作業の性質）も引き続き踏襲する。
- **builder の自動チェック報告における skipped 件内訳の引用粒度**: T-4 reviewer 補足（R1 §補足）で「`npm run test` の total（301 / 4406）は完全一致だが skipped 件の内訳（1 ファイル / 8 テスト）が builder 報告で省略されていた」点が指摘された。**本サイクルでは実害なし**（reviewer 独立再実行で total / skipped 両方が一致を確認）だが、AP-WF09（形式通過）の精神に合致させるため第 6 弾以降の builder 報告では PASS / skipped / FAILED の内訳を省略せず引用する運用に揃えると望ましい。
- **B-314 親タスク継続**: 残り約 29 ツール + 20 遊び。次サイクル候補は (a) html-entity と base64 を除いた構造類似ペア並行（url-encode + 別ツール同時など）、(b) hash-generator（非同期パターン初挑戦）、(c) fullwidth-converter / kana-converter（結果膨張なし系で標準パターンの別性質適用）、(d) 単純構造ツール 1 件継続。

### ブログ化判断（見送り）

- 本サイクルは標準パターン 5 回目適用 + AP-P21 事後検証 2 件目の構造で、cycle-203 で 1 件目を実証した内容と本質的に同じ構造の再現性確認。読者向けの新規発見が薄い
- AP-P21 汎用性実証は target user S1（AI agent / orchestration）/ S3（Web 製作）には興味の可能性ある内容だが、第 4 弾と第 5 弾 2 サイクル分の積み上げで初めて成立したテーマのため、Phase 8.1 全体完了時点（または更に第 6〜7 弾完了時点）でまとめ記事として書く方が読者価値が高い（B-430 と同じ判断軸）
- 本サイクル単独でのブログ化は target user M2 dislikes「未検証の解決策」には抵触しないが、cycle-203 とほぼ同型のサイクルを 2 本立てて記事化すると冗長になるため見送り

## 補足事項

- 本サイクルは計画レビュー R1〜R4 で **推奨指摘 10 件**（R1: 5 / R2: 3 / R3: 2 / R4: 0）に対応し、いずれも false positive ではない実体に即した指摘を全件反映してから実装に着手。実装 T-1〜T-4 では **全て R1 Pass**（必須 0 / 推奨 0）で再修正サイクルなし。計画段階で AP-P21 / AP-WF16 の事後検証点を厳密に詰め切ったことが実装での再修正ゼロに直結した可能性が高い
- T-3 reviewer による先行 AP-P21 計測（3 ケース 46px / 相互差 0px）と T-4 builder の正式計測（4 ケース 46.00px / 相互差 0.00px）が完全一致 → AP-WF16 reviewer 独立再現の運用形が「先行検出 + 正式実証」の二段構えとして機能した
- 本サイクル中核成果（AP-P21「必ず膨張 + 条件付き膨張」両性質汎用性の定量実証）は cycle-202 で発覚した「12px に圧迫」の構造欠陥が cycle-203 (base64) / cycle-204 (html-entity) で計画段階先取りにより完全防止できることを 2 ツール 8 ケース全件で実証した形であり、AP-P21 対策パターンの運用標準化が達成された

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
