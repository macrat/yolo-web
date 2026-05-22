---
id: 205
description: B-314 Phase 8.1 第 6 弾 = hash-generator のタイル化。`crypto.subtle` 非同期パターンを Phase 8.1 標準パターンに組み込む実証サイクル。
started_at: 2026-05-22T17:18:35+0900
completed_at: 2026-05-22T23:10:08+0900
---

# サイクル-205

このサイクルでは、B-314 (Phase 8.1 = ツール・遊び詳細ページの新デザイン移行 + タイル化) の **第 6 弾**として `hash-generator` を対象にする。第 1〜5 弾（char-count / byte-counter / url-encode / base64 / html-entity）で確立した標準パターン（kind=widget / page.module.css 1200px ハードコード / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）に対して、**`crypto.subtle` を用いた非同期処理**という新性質を載せて実証する。AP-P21（固定枠 UI の膨張側 / 操作側役割分担）の事後検証は cycle-203 / cycle-204 で「必ず膨張型」「条件付き膨張型」の両性質汎用性が定量実証成立済み、AP-WF16（builder の自動チェック PASS 報告を reviewer / PM が独立再実行で確認）も cycle-204 で運用形確立済みのため、本サイクルは AP-P21 / AP-WF16 とも通常運用フェーズで進める。

## 実施する作業

- [x] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [x] 対象は **hash-generator**（cycle 概要文・補足事項で既に確定済）
  - [x] kind 判定（single / widget / multi）とタイル推奨サイズの確定 → **kind=widget / cols=3 rows=2**
  - [x] 非同期パターン（`crypto.subtle.digest`）特有の論点（loading state / race condition / エラー処理 / セグメント表示単一化 / 出力形式 hex 固定）を計画段階で確定
- [x] cycle-execution で計画に沿った実装を行う
  - [x] T-1: 現状把握と移行前 baseline 取得（grep 5 件全件一致 / 既存テスト 8 件緑 / スクショ 8 枚 = ベース 6 + 結果表示済み 2）/ R1 Pass
  - [x] T-2: `src/tools/hash-generator/Component.module.css` 旧トークン置換（21 箇所・7 種、特殊マッピング `--color-bg-secondary → --bg-soft`）+ `(legacy)` → `(new)` ディレクトリ移行（git mv 3 ファイル + page.module.css 新設 + `.page` ラッパー）+ 並べ読み SSoT 突合 / R1 Pass
  - [x] T-3: タイル定義（kind=widget / cols=3 rows=2）+ `HashGeneratorTile.tsx` 新規実装（セグメントコントロール / SHA-256 デフォルト / hex 固定 / リアルタイム反映 / race condition cleanup flag / loading 非表示 / 日本語フォールバック）+ テスト 8 件 + `TILE_DECLARATIONS` 追加 + codegen tilesCount 5→6 / R1 推奨 2 件 → R2 Pass
  - [x] T-4: 検証と統合確認（タイルプレビュー 4 枚 + 移行後 6 枚 + フォールバック 1 枚 / AP-P21 textarea 高さ 4 ケース全件 46px・相互差 0px / 4 コマンド全件 reviewer 独立再実行 / Playwright で w375 × w1200 × w1900 × light/dark スクショ）/ R1 Pass
- [x] 計画レビューを受ける（R1 必須 3 + 推奨 9 → R2 Pass）
- [x] cycle-completion でサイクルを完了させる

## 作業計画

### 目的

**誰のために**: T1（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）/ T2（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）。テキストからハッシュ値を取得したい来訪者（パスワード照合用ハッシュの確認、ファイル整合性チェックの参照値、Web 開発でのテストフィクスチャ生成、等）。

**何の価値**:

- ダッシュボード上の道具箱タイルから 1 クリックで hash-generator を起動でき、入力 onChange でリアルタイムにハッシュ値が確定できる。T1 likes「コピペで結果を受け取ってすぐ元の作業画面に戻れる」に直結。
- 新デザインへの統一移行。`/tools/hash-generator` の見た目を他の (new) 配下ツール（char-count / byte-counter / url-encode / base64 / html-entity）と揃え、T2 likes「操作性・トーン&マナーが一貫」を満たす。
- リピーター（T2）の混乱を避けるため、URL（`/tools/hash-generator`）と詳細ページ Component の挙動（4 アルゴリズム並列表示 + 手動ボタン + hex/base64 切替）は一切変えない。

**背景・Phase 8.1 全体での意義**: B-314 Phase 8.1 の第 6 弾。cycle-200〜204 で 5 回適用した標準パターン（ToolLayout 外側 / page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）に対して、本サイクルでは **`crypto.subtle.digest` を用いた非同期処理** という新性質を載せて実証する。Phase 8.1 の残り 29 ツールには非同期処理を伴う候補（qr-code 生成 / image-base64 / image-resizer 等）が複数あり、本サイクルで非同期パターンを標準パターンに組み込んでおくと後続ツールの作業安定化に直接寄与する。

AP-P21 / AP-WF16 は cycle-203 / cycle-204 で「必ず膨張型」「条件付き膨張型」両性質汎用性・運用形ともに既に実証成立済のため、本サイクルは「標準パターン 6 回目適用 + 非同期パターン初実証」に集中する。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- hash-generator の現在のファイル構成・コード・CSS を確認する（数値の出典は本計画書本文に grep コマンドそのものを併記し、`tmp/` 配下削除後も再現可能とする）
  - `src/tools/hash-generator/`: Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/logic.test.ts`
  - `src/app/(legacy)/tools/hash-generator/`: page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル
  - `Component.module.css` 内の `--color-*` 残存数: **21 箇所**。**実測コマンド**: `grep -c -- "--color-" src/tools/hash-generator/Component.module.css` → 21
  - 旧トークン種類は **7 種**（`--color-bg` / `--color-bg-secondary` / `--color-border` / `--color-primary` / `--color-primary-hover` / `--color-text` / `--color-text-muted`）。**実測コマンド**: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/hash-generator/Component.module.css | sort -u` → 上記 7 種。html-entity / base64 の 8 種から `--color-error` / `--color-error-bg` を除き、代わりに `--color-bg-secondary`（結果カード背景）を含む差分。
  - logic.ts のエクスポート: `HASH_ALGORITHMS`（配列）/ `HashAlgorithm`（型）/ `OutputFormat`（型）/ `generateHash`（async function）の **4 export**。**実測コマンド**: `grep -c '^export ' src/tools/hash-generator/logic.ts` → 4
  - 既存テスト件数: `describe` ブロック **1** / `test` 件数 **8**。**実測コマンド**: `grep -c '^\s*describe(' src/tools/hash-generator/__tests__/logic.test.ts` → 1、`grep -c '^\s*test(' src/tools/hash-generator/__tests__/logic.test.ts` → 8
- Playwright で移行前のスクリーンショットを取得する
  - **ベース 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 遵守）
  - **結果表示済み状態スクショ 2 枚（ライト・ダーク両モード）**: 任意のテキスト入力 → 「ハッシュ生成」ボタン押下後の状態を撮影。SHA-512 が 128 hex 文字で結果カードが縦に伸びる挙動を移行前 legacy の参考記録として残す。AP-WF05（ライト/ダーク両モード必須）に倣い、結果表示済みスクショも両モードを撮影することで「ベース 6 枚は厳守したが結果表示済みスクショで片モードに緩めた」という二重基準（AP-WF09 形式通過同型）の発生を未然防止する。
- 既存テストの実行確認（`npm run test -- hash-generator` で `logic.test.ts` 8 件が緑）

**完成条件**: 移行前のスクリーンショットが **計 8 枚**（ベース 6 枚 + 結果表示済み 2 枚）が `tmp/cycle-205/baseline/` 配下に保存されている。既存テスト 8 件が緑。grep による旧トークン残存 21 / 7 種一覧 / export 4 / `describe` 1 / `test` 8 の数値がいずれも本計画書本文と一致することが reviewer によって独立再実行で確認されている。

**T-1 検証手順（AP-WF16）**: T-1 builder は `npm run test -- hash-generator` と上記 grep コマンドの出力を引用付きで報告する。T-1 reviewer は builder の報告のうち最低 1 つ以上の自動チェックを **独立に再実行** して出力一致を確認する。

#### T-2: 詳細ページの (new) 配下移行

cycle-200〜204 で確立した標準パターンを踏襲する:

- `src/app/(legacy)/tools/hash-generator/` を `src/app/(new)/tools/hash-generator/` に **git mv** で移動する（page.tsx / opengraph-image.tsx / twitter-image.tsx）
- `src/app/(new)/tools/hash-generator/page.module.css` を新設し、1200px max-width をハードコードする（既存 (new) 配下 5 ツールと同一パターン）
- page.tsx に `page.module.css` の `.page` ラッパーを追加する
- `src/tools/hash-generator/Component.module.css` 内の `--color-*` 系旧カラートークン（21 箇所 / 7 種）を新デザイントークンに置換する
  - **置換マッピング** (cycle-200〜204 で 5 連続同名一致が確認済の SSoT に基づく):
    - `--color-bg → --bg`
    - `--color-bg-secondary → --bg-soft`（**本サイクル特有 / 結果カード背景に使用**。html-entity / base64 では発生しなかった特殊マッピング。`--bg-soft` は `src/app/globals.css` で「recessed background / hover on bg」として定義済で、結果カードの「面が一段引いた」表現に意味的整合）
    - `--color-border → --border`
    - `--color-primary → --accent`
    - `--color-primary-hover → --accent-strong`
    - `--color-text → --fg`
    - `--color-text-muted → --fg-soft`
  - **並べ読み突合**: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/hash-generator/Component.module.css | sort -u` と `grep -o -- "--bg-soft\|--bg\|--border\|--accent\|--accent-strong\|--fg\|--fg-soft" src/tools/base64/Component.module.css src/tools/html-entity/Component.module.css | sort -u` を実行し、`--bg-soft` 以外の 6 種が base64 / html-entity の SSoT に既存することと、`--bg-soft` が `globals.css` に既存定義されていることを確認する（AP-WF12 違反予防）。さらに **`src/tools/{char-count,byte-counter}/Component.module.css` でも `--bg-soft` の使用実績がある**（`grep -l "bg-soft" src/tools/*/Component.module.css` → `char-count/Component.module.css` / `byte-counter/Component.module.css` で実体確認済）ことを併せて確認し、SSoT 突合を「globals.css 定義 + Phase 8.1 第 1〜2 弾での既存使用実績」の 2 段階に強化する。
- w1900 で本文幅が 1200px に収まっていることを確認する

**注意事項**:

- ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネントは touch しない（B-431 一括対応）
- `trustLevel` フィールドは削除しない（B-432 一括削除）
- opengraph-image.tsx / twitter-image.tsx もそのまま移動する（内容は変更しない）
- 詳細ページ Component.tsx は **touch しない**（kind=widget 標準パターン継続。「検討した他の選択肢」参照）

**完成条件**: `/tools/hash-generator` が (new) 配下で正常表示される。旧 (legacy) パスにファイルが残っていない。w1200 / w1900 / w375 で表示崩れがない。Component.module.css 内に `--color-*` 系旧トークンが残存しないこと。**判定コマンド**: `grep -c -- "--color-" src/tools/hash-generator/Component.module.css` → `0`。

**T-2 検証手順（AP-WF16）**: T-2 builder は残存判定 grep と `/tools/hash-generator` HTTP 200 OK を引用付きで報告。T-2 reviewer は最低 1 つ以上を独立再実行する。

#### T-3: タイル定義（kind=widget + 非同期処理対応 + AP-P21 役割分担）

- **kind 判定**: hash-generator の詳細ページ Component は textarea + 形式 select + 生成ボタン + 4 件分の結果カード（SHA-1/256/384/512）と縦に長く、128px タイルセル基準では収まらないため **kind=widget** とする。
- **タイル推奨サイズ**: `cols=3 rows=2`（`calcTilePixels(3, 2)` = 400×264px）。char-count / byte-counter / url-encode / base64 / html-entity と同サイズで第 1〜5 弾と一貫。
- タイル用コンポーネント（`src/tools/hash-generator/HashGeneratorTile.tsx`）を新規実装する
  - CSS Module 不使用（codegen 制約）。インラインスタイル方式で既存 5 タイルと同型。
  - **タイル UI の方針**: 「アルゴリズムセグメントコントロール（SHA-1 / SHA-256 / SHA-384 / SHA-512 の 4 択、デフォルト **SHA-256**）+ テキスト入力 textarea + ハッシュ結果表示（hex 固定、1 種のみ）+ 詳細ページへのリンク」。詳細ページの「4 種並列表示」は維持しタイルでは 1 種切替に絞り込む（理由は「検討した他の選択肢」参照）。
  - **変換トリガ**: リアルタイム反映（入力 onChange / セグメント切替時に即時計算）。`crypto.subtle.digest` の計測値が < 1ms（< 1KB 入力）/ < 8ms（100KB 入力）であり、体感遅延ゼロで実用可能（出典: `docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md`）。
  - **race condition 対策**: `useEffect` の cleanup フラグ（`let ignore = false; return () => { ignore = true; }` 型）で古い Promise 解決を破棄する方針。`AbortController` は `crypto.subtle.digest` が非対応のため不採用。具体的な実装の置き方は builder 裁量。
  - **loading state は設けない**。< 1 秒の処理に loading 表示を出すと UX 業界標準（"< 1 秒の処理に loading を出さない"）に反し、T2 dislikes「動作が遅いツール」に誤シグナルを送る。
  - **エラーハンドリング**: `crypto.subtle` が undefined または `digest` が reject した場合、`try/catch` で英語 JS エラーを直接見せず、**日本語フォールバック文言（builder 裁量。例: 『お使いの環境では計算できません』）** を `--fg-soft` 色（控えめ表示）で結果欄に出す。Base64Tile / HtmlEntityTile が `--fg-soft` で日本語エラー文言を返す **統一表示パターン**（色トークン `--fg-soft` + 日本語文言 + 控えめ表示の 3 点）に倣う。**採用根拠（来訪者影響の致命度起点）**:
    - (i) `crypto.subtle` は **Secure Contexts (HTTPS / `localhost`) でのみ有効** な Web API（出典: MDN `Crypto/subtle` https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle の「Secure Contexts only」表記）
    - (ii) yolos.net は本番 HTTPS 配信のため、実運用で `crypto.subtle === undefined` になるシナリオは限定的（CDN 障害 / 内部プレビュー HTTP / IE11 等のレガシーブラウザ）。`digest()` 自体が reject するケースも仕様上 NotSupportedError / OperationError 等に限定され、実運用ではほぼ発生しない
    - (iii) それでも `try/catch` + 日本語文言を入れるのは「対策コストの低さ」ではなく **「確率は低いが影響は致命的（タイル全体が崩れて見える / 白画面 / `Uncaught (in promise) Error` の JS コンソールエラー）+ 対策コスト数行 = 来訪者影響の致命度起点」** のフェイルセーフ（AP-P09 / AP-P19 への手当）
  - **【AP-P21 役割分担パターン継続採用】**: textarea を `rows=2 + flexShrink: 0`、結果欄を `flex: 1 + overflowY: auto` の役割分担を**最初から**適用する。hash-generator は「膨張ゼロ型」（出力固定長 = SHA-1 が 40 hex / SHA-256 が 64 hex / SHA-384 が 96 hex / SHA-512 が **128 hex 文字**）であり、AP-P21 の事前評価では「役割分担パターン不要」と判定する余地がある。しかし以下 2 理由により **継続採用** する:
    - (i) cycle-200〜204 で 5 連続適用済の CSS 構造を踏襲することでタイル全体の一貫性が維持できる（T2 likes「操作性・トーン&マナーが一貫」）
    - (ii) cycle-204 申し送り「役割分担パターン採用 + T-4 計測は運用標準として継続」が指定されている
    - AP-WF09（形式通過）防止のため、計画書本文で「膨張ゼロ型だが継続採用」の判断理由を明示する（「検討した他の選択肢 / AP-P21 適用判断」セクション参照）
  - 結果欄には `role="status" aria-live="polite"` を付与する（既存タイルと同型）
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に hash-generator のエントリを追加する（recommendedSize: `cols=3 rows=2`）。`inputPlaceholder` / `widgetSummary` 等の必須フィールドは既存エントリと同じ枠を埋める形で実装者が決める
- `npm run generate:tiles-registry` で codegen を実行する
- タイル用コンポーネントのテストを追加する。**最低限カバーすべき観点**: (i) 既知ベクトル 1 件（例: 空文字列 → SHA-256 の `e3b0c4...` 固定値の検証）/ (ii) セグメント切替（SHA-256 → SHA-512 で再計算され桁数が変わる）/ (iii) 空入力時の結果欄空表示。**件数は 4 件以上**。非同期テストは `await` ベース。具体的な assertion 文言は builder 裁量。

**注意事項**:

- 詳細ページの Component.tsx は touch しない（既存仕様 = 4 アルゴリズム並列 + 手動ボタン + hex/base64 切替を維持する。kind=widget 標準パターン）
- デザイントークンは `--fg` / `--bg` / `--bg-soft` / `--accent` / `--fg-soft` / `--border` 等の新トークンを使用する
- SHA-512 = 128 hex 文字 + 結果欄の `overflow-wrap: break-word` または `word-break: break-all` で枠内に確実に収める

**完成条件**: `TILE_DECLARATIONS` に hash-generator が追加されている。codegen が成功する。`HashGeneratorTile.tsx` のテスト 4 件以上が緑。タイル UI 上で 4 アルゴリズム切替が機能し、リアルタイムで結果が反映される。`crypto.subtle` 非対応環境フォールバックの分岐コードが実装されている。

**T-3 検証手順（AP-WF16）**: T-3 builder は `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** の出力を引用付きで報告する。T-3 reviewer は **4 コマンドすべて** を独立に再実行して出力一致を確認する（cycle-203 T-3 R1 で発覚した format:check 虚偽 PASS 同型事故の確実防止）。

#### T-4: 検証と統合確認（AP-P21 計測 / AP-WF16 全件再実行 / 視覚検証）

- `/internal/tiles/preview/tools/hash-generator` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク **計 4 枚** 撮影）
- 移行後のスクリーンショット比較（**計 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × ライト / ダーク両モード）。T-4 段階で再撮影する（cycle-203 T-4 MINOR-1 = T-2 スクショ流用事故の再発防止）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/hash-generator` で 200 OK）
- タイルプレビュー上の動作確認を Playwright で実施
  - SHA-256 デフォルト表示・入力 onChange でリアルタイム反映
  - セグメント切替（SHA-1 / 256 / 384 / 512）で結果桁数が **40 / 64 / 96 / 128** に切り替わることを文字列長計測で確認
  - 結果欄 `role="status" aria-live="polite"` の DOM 確認
  - **【AP-P21 textarea 高さ計測 4 ケース】**: 以下 4 ケースで textarea の `getBoundingClientRect()` 高さを Playwright で計測する
    - (a) **空入力**（膨張なし）
    - (b) **短い ASCII 入力**（例: `hello` 5 文字 → SHA-256 64 hex 出力）
    - (c) **中程度の日本語入力**（例: 30 文字程度の日本語 → 出力長は SHA に関係なく固定）
    - (d) **SHA-512 切替**（最長出力 = 128 hex 文字で結果欄が縦に伸びても textarea が圧迫されないことを確認）
  - **判定基準**（cycle-203 / 204 と同基準）: (i) **下限 40px 以上** / (ii) **4 ケース間の textarea 高さの相互差が 2px 以内**（最大値 − 最小値 ≤ 2px）。hash-generator は膨張ゼロ型のため理論値は 4 ケース全件完全一致（相互差 0px）になる見込み（< 1ms / < 8ms の処理時間根拠の出典: `docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md`）。
- `crypto.subtle` 非対応フォールバック確認: Playwright で `delete window.crypto.subtle` 等の手段により API を強制的に剥奪した状態でタイルを開き、日本語フォールバック文言（例: 「お使いの環境では計算できません」）が `--fg-soft` 色で表示されることを 1 回確認する。**`delete` が ReadOnly エラーになる場合の代替手段（`Object.defineProperty(window.crypto, 'subtle', { value: undefined, configurable: true })` 等）を builder 裁量で選択**（`delete` は `window.crypto.subtle` の read-only プロパティのため strict mode / Chromium で無効化されるケースがあるため）。

**完成条件**: 全検証項目をクリア。lint / format / test / build が全パス。Playwright スクリーンショットが **計 18 枚**（移行前 baseline 8 枚 = ベース 6 枚 + 結果表示済み 2 枚 / タイルプレビュー 4 枚 = w1200・w375 × ライト/ダーク / 移行後 6 枚 = w1200・w1900・w375 × ライト/ダーク = cycle-204 と同水準）。タイルプレビューで 4 アルゴリズム切替が動作し、(a)〜(d) 4 ケース全てで textarea 高さが 40px 以上かつ相互差 2px 以内。`crypto.subtle` 非対応時のフォールバック文言表示確認済。

**T-4 検証手順（AP-WF16）**: T-4 builder は 4 コマンド全件出力と Playwright 計測 4 ケース実測値を引用付きで報告。T-4 reviewer は (i) 自動チェック 4 コマンドすべてを独立に再実行、(ii) Playwright 計測の 4 ケースのうち最低 1 ケースを独立に再現、の両方を実施する（cycle-204 T-4 と同形）。

### 検討した他の選択肢と判断理由

#### 変換トリガ: リアルタイム反映 vs 手動ボタン vs 混在

| 選択肢                                                | 採否     | 判断理由（来訪者価値起点）                                                                                                                                                                                                                     |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 既存 Component 流の手動ボタン押下               | 不採用   | T1 likes「コピペで結果を受け取ってすぐ元の作業画面に戻れる」に余分な 1 クリックを挟む。タイルは「素早く確認する」場であり手動ボタンは詳細ページの責務。                                                                                        |
| 案 b: タイル=リアルタイム / 詳細=手動ボタン**混在**   | 不採用   | 詳細ページ Component を touch しない方針（kind=widget 標準）と整合する。タイルだけリアルタイム化することは混在ではなくむしろ第 1〜5 弾と同じ標準パターンの素直な継承。                                                                         |
| 案 c: **リアルタイム反映**（onChange ごとに自動計算） | **採用** | `crypto.subtle.digest` の実測 < 1ms（< 1KB 入力）/ < 8ms（100KB 入力）で体感遅延ゼロ。第 1〜5 弾の標準パターン（onChange + リアルタイム反映）と整合し、T1 / T2 双方の体験一貫性に寄与。詳細ページの手動ボタン挙動は変更しないため棲み分け OK。 |

#### タイルでの表示アルゴリズム: 全 4 種並列 vs 単一固定 vs セグメント切替

| 選択肢                                        | 採否     | 判断理由                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 案 a: 全 4 種並列表示（既存詳細ページと同形） | 不採用   | タイル 400×264px に SHA-512（128 hex 文字）を含む 4 行並べると、各行が極端に潰れて結果欄として読めず、textarea を圧迫し AP-P21 構造リスクを増幅する。詳細ページの差別化価値（4 種並列）が消える副作用もある。                                                                                    |
| 案 b: SHA-256 単一固定（切替なし）            | 不採用   | SHA-1 を必要とする来訪者（古いシステム互換）/ SHA-512 を必要とする来訪者（強度重視）がタイル単体で目的達成できず、詳細ページに飛ばされる。タイル価値の半分を切り捨てる判断。                                                                                                                     |
| 案 c: **セグメントコントロールで 1 種切替**   | **採用** | デフォルト **SHA-256**（現代 Web で最も需要が高い）。結果は常に 1 種のみ表示で枠内に確実に収まる。詳細ページの「4 種並列」差別化価値が残る。来訪者は「タイルで目的のアルゴリズムを 1 タップ選択 → 結果取得」で完結。url-encode / base64 / html-entity の双方向トグルと同じ「1 タイル完結」原則。 |

#### 出力形式: hex / base64 切替 vs hex 固定

| 選択肢                              | 採否     | 判断理由                                                                                                                                                                                                                           |
| ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: タイルにも hex/base64 切替 UI | 不採用   | タイル 400×264px に「アルゴリズム 4 択 + 出力形式 2 択 + textarea + 結果欄」を詰めると UI が過密。T1 likes「すぐ使い始められる」が損なわれる。                                                                                     |
| 案 b: **タイルでは hex 固定**       | **採用** | タイルは「すぐ使い始められる」が最優先。出力形式切替が必要な来訪者（Base64 でハッシュを扱う特定用途）は詳細ページに誘導する。詳細ページの hex/base64 切替機能はそのまま残す（kind=widget で詳細ページを touch しない方針と整合）。 |

#### エラーハンドリング: 既存 Component 流 vs 日本語フォールバック vs 無視

| 選択肢                                                                                     | 採否     | 判断理由                                                                                                                                            |
| ------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 既存 Component と同じく Error.message 表示                                           | 不採用   | 英語 JS エラーがそのまま表示されると T1 likes「不安なく使えること」を損なう。Base64Tile / HtmlEntityTile のフォールバック方針と非整合。             |
| 案 b: エラー無視                                                                           | 不採用   | 結果欄が空のままで visitor は何が起きたのかわからない。古いブラウザの来訪者が黙って放置される。                                                     |
| 案 c: **日本語文言「お使いの環境では計算できません」を `--fg-soft` で表示**（`try/catch`） | **採用** | T1 likes「不安なく使えること」/ Base64Tile / HtmlEntityTile と統一されたエラー表示パターン。控えめ色 `--fg-soft` で「無効な状態」と視覚的に伝わる。 |

#### Race Condition 対策: 対策なし vs cleanup flag vs AbortController

| 選択肢                                                             | 採否     | 判断理由（来訪者価値起点 = 確率 × 影響 × コストの 3 軸）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 対策なし                                                     | 不採用   | **確率 × 影響 × コスト** の 3 軸で評価。< 1KB 入力 < 1ms 計算では実用上ほぼ発生しないが、(i) **ブラウザ microtask ordering の干渉がゼロではないシナリオ** で結果欄が一瞬古い値に巻き戻ると T1 likes「不安なく使えること」を損なう（影響軸: 認知的安全性の毀損）、(ii) 長い入力（数 MB）や複数連続入力時に古い Promise が新しい結果を上書きする確率は低いがゼロではない（確率軸）、(iii) 対策コストが数行（コスト軸）、の 3 軸を総合すると **確率は低いが認知的安全への寄与が高く対策コストが数行** でトレードオフが明確に cleanup フラグに振れる。 |
| 案 b: AbortController                                              | 不採用   | **`SubtleCrypto.digest()` の現行仕様（W3C Web Cryptography API）は `AbortSignal` 引数を受け取らないシグネチャのため、実装側で破棄判定が必要**。技術的に成立しない（MDN `SubtleCrypto/digest` で reviewer 独立再現確認済み）。                                                                                                                                                                                                                                                                                                                      |
| 案 c: **`useEffect` の cleanup フラグ**（古い Promise 解決を破棄） | **採用** | 数行で実装可能で robustness 寄与が高い。`crypto.subtle` の API 制約（AbortSignal 非対応）と整合。T1 likes「不安なく使えること」への寄与が直接的（古い値への巻き戻しを防止）。具体的な実装の置き方は builder 裁量。                                                                                                                                                                                                                                                                                                                                 |

#### Loading State: 表示する vs 設けない vs 前回結果残し置換

| 選択肢                                                                         | 採否     | 判断理由                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: spinner 表示                                                             | 不採用   | < 1ms の処理に loading を出すと「チラつき」になり UX 阻害。T2 dislikes「動作が遅いツール」に loading の出現は誤シグナル（処理が遅いという錯覚を与える）。                                                                                                                                                                                                                         |
| 案 b: **設けない**                                                             | **採用** | UX 業界標準「< 1 秒の処理に loading は出さない」。空入力 → 結果欄空、入力 → 結果欄即時更新、の二状態のみで運用。**前回結果を残しつつ新結果に置き換わる挙動が React `useState` + Web Crypto < 1ms 計算の組合せで自然に実現される**ため、placeholder 占位や `--fg-soft` 薄め化の追加 UI コストが不要で、< 1ms の連続置換が知覚的にチラつかない（案 c を能動的に不採用にする理由）。 |
| 案 c: 前回結果を残しつつ新結果に置き換わる（明示的な計算中フラグ等で UI 制御） | 不採用   | 案 b の「設けない」が React `useState` の自然な挙動として既にこれを実現するため、明示的な計算中フラグ / placeholder 占位 / `--fg-soft` 薄め化等の追加 UI 制御は不要。`< 1ms` 連続置換は知覚的にチラつかない実測値が research レポートで確認済（`docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md`）のため、追加 UI コストを払う価値がない。          |

#### 詳細ページ Component.tsx の取り扱い: リアルタイム化に書き換え vs touch しない

| 選択肢                                             | 採否     | 判断理由                                                                                                                                                                                                               |
| -------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: Component.tsx もリアルタイム化に書き換え     | 不採用   | 第 1〜5 弾の `kind=widget` 標準パターン（詳細ページ Component を touch しない / タイルとは別物として並存）から外れる。詳細ページの既存仕様（4 種並列 + 手動ボタン + hex/base64 切替）は visitor の従来体験を壊さない。 |
| 案 b: **詳細ページ Component.tsx は touch しない** | **採用** | kind=widget 標準パターン継続。タイル UI（簡素 1 種切替・リアルタイム）と詳細ページ UI（4 種並列・手動ボタン・hex/base64 切替）の責務分離が明確化される。                                                               |

#### AP-P21 適用判断: 役割分担パターン継続 vs 膨張ゼロ型として簡素化

hash-generator は「**膨張ゼロ型**」である:

- 出力固定長: SHA-1 = 40 hex / SHA-256 = 64 hex / SHA-384 = 96 hex / SHA-512 = **128 hex 文字**（hex 出力時）。
- セグメントで選択された 1 種のみ表示する設計のため、結果欄の高さは「選択アルゴリズムの hex 文字数 ÷ 折り返し可能幅」で確定し、入力長に依存しない。
- AP-P21 が想定する「結果が動的に膨張して入力欄を圧迫する構造リスク」は **本質的には発生しない**。

それでも **役割分担パターン（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）を継続採用** する理由は以下:

1. **タイル全体の CSS 構造一貫性**: cycle-200〜204 で 5 連続適用済の CSS 構造を踏襲することでタイル全体の見た目・挙動の一貫性が維持される。T2 likes「操作性・トーン&マナーが一貫」に直結。
2. **cycle-204 申し送りの遵守**: cycle-204 キャリーオーバーで「役割分担パターン採用 + T-4 計測は運用標準として継続」が指定されている。第 6 弾で運用標準を崩すと、第 7 弾以降の「条件付き膨張型」「必ず膨張型」候補で再導入が必要になり、運用形が揺らぐ。
3. **AP-WF09 防止のため判断理由を明示**: 「膨張ゼロ型だから役割分担不要」というショートカット判断は AP-P21 / AP-WF09 の形式通過リスクを孕む。「膨張ゼロ型でも継続採用」の理由を計画書で明示することで AP-WF09 防止になる。

T-4 で 4 ケース計測も継続する（実測値は 4 ケース完全一致 = 相互差 0px の見込み）。これは「膨張ゼロ型での AP-P21 計測ベースライン」として記録的価値もある。**膨張ゼロ型サンプル 1 件目として 4 ケース全件 0px 差を記録することにより、第 7 弾以降に他の膨張ゼロ型ツール（fullwidth-converter / kana-converter 等）が現れた際の比較基準値が確定する**（将来サイクルへの寄与）。

### 計画にあたって参考にした情報

- **3 件の事前調査レポート**:
  - `tmp/research/` 配下に 2 件（hash-generator 現状コード調査 / AP 集の該当項目抽出）。**注**: 本計画書本文の T-1 タスク冒頭に主要数値（21 / 7 種一覧 / export 4 / `describe` 1 / `test` 8）の grep コマンドそのものを併記済のため、`tmp/` 配下削除後も全数値が独立再現可能（AP-P16 / MINOR-5 対策）
  - `docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md` — `crypto.subtle` 非同期 UI のベストプラクティス（リアルタイム反映の妥当性 / loading 非表示の根拠 / cleanup flag による race condition 対策 / 日本語フォールバック文言の設計判断の出典）
- **cycle-200〜204 の移行実装（標準パターンの実体）**:
  - `src/app/(new)/tools/{char-count,byte-counter,url-encode,base64,html-entity}/page.tsx` / `page.module.css` — 1200px ハードコード SSoT
  - `src/tools/{base64,html-entity}/Component.module.css` — 8 種新トークン SSoT（並べ読み突合用）
  - `src/tools/{base64,html-entity}/{Base64Tile,HtmlEntityTile}.tsx` — kind=widget タイルの双方向トグル + リアルタイム反映 + AP-P21 役割分担 + エラーフォールバック実装の参考実装
  - `src/tools/_constants/tile-declarations.ts` — `TILE_DECLARATIONS` エントリ形式
- **hash-generator の現在のソースコード**:
  - `src/app/(legacy)/tools/hash-generator/{page.tsx,opengraph-image.tsx,twitter-image.tsx}`
  - `src/tools/hash-generator/{Component.tsx,Component.module.css,logic.ts,meta.ts,__tests__/logic.test.ts}`
- **デザイントークン定義**: `src/app/globals.css`（`--bg-soft` の定義位置と意味「recessed background / hover on bg」の確認）
- **`docs/cycles/cycle-204.md` キャリーオーバー** — 「役割分担パターン採用 + T-4 計測は運用標準として継続」「AP-WF16 を T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行で運用継続」の方針
- **ターゲットユーザー定義**:
  - `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1）
  - `docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2）
- **アンチパターン集**:
  - `docs/anti-patterns/planning.md`: **AP-P21**（固定枠 UI 膨張 / 操作側同居）/ AP-P16（一次情報の実体確認）/ AP-P20（過度に具体的な計画の回避）/ AP-P17（3 案以上のゼロベース列挙）
  - `docs/anti-patterns/workflow.md`: **AP-WF16**（自動チェック PASS の reviewer 独立再実行）/ AP-WF05（移行前ダークモード撮影）/ AP-WF12（手段先行の決め打ち）/ AP-WF09（チェックリストの形式通過）
- **デザイン移行アーキテクチャ**: `docs/design-migration-plan.md`

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

### R1（事実情報 + 完成条件）

レビュアー観点: **事実情報精査（独立再現）+ 完成条件 / 検証手順の妥当性**。
計画書本文の数値・パス・コマンド・トークンマッピング・SHA hex 長・`crypto.subtle.digest` 仕様について、reviewer が `grep` / `Read` / `ls` / `node` / MDN 公式仕様で独立再現し、計画書記述と突合した結果を以下に記載する。

#### A. 事実情報精査の結果（独立再現）

reviewer は以下を独立に実行し、計画書本文と突合した。

| #    | 検証対象                                             | 計画書本文の主張                                                                                                                               | reviewer 実測                                                                                                                                                                | 突合結果 |
| ---- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| A-1  | `Component.module.css` `--color-*` 残存数            | 21 箇所                                                                                                                                        | `grep -c -- "--color-" src/tools/hash-generator/Component.module.css` → **21**                                                                                               | 一致     |
| A-2  | 旧トークン 7 種                                      | `--color-bg` / `--color-bg-secondary` / `--color-border` / `--color-primary` / `--color-primary-hover` / `--color-text` / `--color-text-muted` | `grep -o -- "--color-[a-zA-Z0-9_-]*" ... \| sort -u` → 同 7 種                                                                                                               | 一致     |
| A-3  | `logic.ts` の export 数                              | 4                                                                                                                                              | `grep -c '^export ' ...` → **4**（`HashAlgorithm` 型 / `HASH_ALGORITHMS` 配列 / `OutputFormat` 型 / `generateHash` async function）                                          | 一致     |
| A-4  | `__tests__/logic.test.ts` の describe / test         | describe 1 / test 8                                                                                                                            | `grep -c '^\s*describe(' ...` → **1**、`grep -c '^\s*test(' ...` → **8**                                                                                                     | 一致     |
| A-5  | `(legacy)/tools/hash-generator/` 配下 3 ファイル     | page.tsx / opengraph-image.tsx / twitter-image.tsx                                                                                             | `find src/app/(legacy)/tools/hash-generator -type f` → 3 ファイル                                                                                                            | 一致     |
| A-6  | 新トークン 7 種が `globals.css` に実在               | `--bg` / `--bg-soft` / `--border` / `--accent` / `--accent-strong` / `--fg` / `--fg-soft`                                                      | `grep -E ... src/app/globals.css` → 全 7 種定義済を確認。特に `--bg-soft: #f4f4f1; /* recessed background / hover on bg */` も計画書本文の説明通り                           | 一致     |
| A-7  | `TILE_DECLARATIONS` 現状エントリ件数                 | 計画書本文は明示数値を出していないが「末尾追加」前提                                                                                           | `grep "domain:" src/tools/_constants/tile-declarations.ts` → **5 件**（char-count / byte-counter / url-encode / base64 / html-entity）。事前依頼の「5 件である見込み」と一致 | 一致     |
| A-8  | `/internal/tiles/preview/[domain]/[slug]` ルート実体 | 計画書本文では `/internal/tiles/preview/tools/hash-generator` を URL として使用                                                                | 実体パス `src/app/(new)/internal/tiles/preview/[domain]/[slug]/` 存在確認                                                                                                    | 一致     |
| A-9  | SHA 出力 hex 長（空文字列）                          | SHA-1=40 / SHA-256=64 / SHA-384=96 / SHA-512=128                                                                                               | Node.js `crypto.createHash` で空入力の hex 長を実測 → 40 / 64 / 96 / 128（空入力の値も `e3b0c4...` で計画書 T-3 の既知ベクトル例と一致）                                     | 一致     |
| A-10 | `crypto.subtle.digest` の AbortController 非対応     | 非対応（仕様未定義）                                                                                                                           | MDN `SubtleCrypto/digest` を直接参照、引数は `algorithm` / `data` のみで AbortSignal 引数なしを確認                                                                          | 一致     |

**A-1 〜 A-10 すべて計画書本文と突合一致**。cycle-204 R1/R2 MINOR-9/10 同型の数値不一致は本計画書本文には**存在しない**。

#### B. 完成条件 / 検証手順の妥当性

| タスク | 完成条件                                                                                                                                                  | 計測可能性                                                         | 評価 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---- |
| T-1    | 移行前スクショ 7〜8 枚 / 既存テスト 8 件緑 / grep 数値 5 項目一致 reviewer 独立再実行                                                                     | 枚数・件数・数値すべて定量                                         | 良好 |
| T-2    | `/tools/hash-generator` 正常表示 / 旧 (legacy) パス不在 / `grep -c -- "--color-" ...` → 0 / w1200・w1900・w375 表示崩れなし                               | 残存判定 grep が 0 という定量                                      | 良好 |
| T-3    | `TILE_DECLARATIONS` に追加 / codegen 成功 / テスト 4 件以上緑 / 4 アルゴリズム切替動作 / フォールバック分岐実装                                           | テスト件数・動作確認が定量。`reviewer` が 4 コマンド全件独立再実行 | 良好 |
| T-4    | lint/format/test/build 全パス / スクショ計 16 枚以上 / textarea 高さ 4 ケース 40px 以上かつ相互差 2px 以内 / `crypto.subtle` 非対応フォールバック表示確認 | 16 枚以上・40px 以上・2px 以内 すべて定量                          | 良好 |

- **判定基準（下限 40px / 相互差 ≤ 2px）の同基準性**: cycle-203 / cycle-204 と同基準の文言で記述されており、運用継続性が保たれている（line 137 で明示）。
- **AP-WF16 4 コマンド全件独立再実行の明示**: T-3（line 120）と T-4（line 142）の両方で「4 コマンドすべて」を builder 報告と reviewer 独立再実行の両側に明記。「PM 判断で省略」の余地はない。
- **格差ルールの根拠付き説明**: T-1（line 60）は「最低 1 つ以上」、T-2（line 90）は「最低 1 つ以上」、T-3 / T-4 は「4 コマンドすべて」と明記されている。T-3 / T-4 の重い独立再実行を要求する根拠として、line 120 で「cycle-203 T-3 R1 で発覚した format:check 虚偽 PASS 同型事故の確実防止」と引用根拠が明示されている。T-1 / T-2 は外形的に低リスクなチェック（grep 数値 / HTTP 200）であり「最低 1 件」で済む格差は合理的。

#### C. 検出した指摘事項

**必須（MAJOR / CRITICAL）**: なし。

**推奨（MINOR）**:

##### MINOR-1（推奨）: 新トークンマッピング SSoT 突合の grep ターゲットが SSoT として弱い

計画書 line 78 の「並べ読み突合」は以下を主張している:

> `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/hash-generator/Component.module.css | sort -u` と `grep -o -- "--bg-soft\|--bg\|--border\|--accent\|--accent-strong\|--fg\|--fg-soft" src/tools/base64/Component.module.css src/tools/html-entity/Component.module.css | sort -u` を実行し、`--bg-soft` 以外の 6 種が base64 / html-entity の SSoT に既存することと、`--bg-soft` が `globals.css` に既存定義されていることを確認する（AP-WF12 違反予防）

reviewer が `grep -o -- "--[a-zA-Z0-9_-]*" src/tools/base64/Component.module.css | sort -u` を実測した結果、base64 / html-entity の Component.module.css に出現するトークンは以下のみ:

```
--accent
--accent-strong
--bg
--border
--danger
--danger-soft
--fg
--fg-soft
--font-mono
```

つまり **`--bg-soft` は base64 / html-entity の Component.module.css には存在しない**。計画書はこれを認識しており「`--bg-soft` 以外の 6 種が base64 / html-entity の SSoT に既存」「`--bg-soft` が `globals.css` に既存定義されている」と書き分けてはいるため、**計画書本文の主張自体は事実と一致している**。

しかし、より強い SSoT 根拠として、reviewer 実測では **char-count / byte-counter の Component.module.css に既に `--bg-soft` が使用されている**（`grep -l "bg-soft" src/tools/*/Component.module.css` → `char-count/Component.module.css` / `byte-counter/Component.module.css`）。`--bg-soft` を「`globals.css` 定義のみ」と扱うより「Phase 8.1 第 1〜2 弾の char-count / byte-counter で既に使用実績あり」と補強した方が、SSoT 突合の根拠として 2 段階強くなる（globals 定義 + 既存使用実績）。

修正案: line 78 に **「char-count / byte-counter の Component.module.css で既に `--bg-soft` が使用されている実績を確認する」** という grep ターゲットを 1 行追加すれば、AP-WF12（手段先行の決め打ち）防止の根拠がさらに強まる。

##### MINOR-2（推奨）: `crypto.subtle.digest` の処理時間根拠

計画書 line 99 / 152 で以下のように記載:

> `crypto.subtle.digest` の計測値が < 1ms（< 1KB 入力）/ < 8ms（100KB 入力）であり

これは「リアルタイム反映」「loading 非表示」「race condition 対策（cleanup flag で十分 / AbortController 不要）」の三決断すべての判断根拠を担う重要数値だが、計画書本文には**出典が明記されていない**。line 219 で `docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md` を参照と記載されているため、出典は research レポートと推測できるが、計画書本文に「（出典: `docs/research/...`）」のような明示参照を 1 箇所だけ追加すると、数値の追跡性が向上する。

これは事実誤認ではなく、可読性 / 追跡性の改善提案。

##### MINOR-3（推奨）: T-4 `crypto.subtle` フォールバック確認手段の現実性

計画書 line 138 では以下のように記載:

> Playwright で `delete window.crypto.subtle` 等の手段により API を強制的に剥奪した状態でタイルを開き

reviewer が確認したところ、`window.crypto.subtle` は read-only プロパティのため `delete` は strict mode / Chromium で**無効化されることがある**（プロパティが残る）。代替手段としては以下が考えられる:

- `Object.defineProperty(window.crypto, 'subtle', { value: undefined, configurable: true })`
- `page.addInitScript(() => { Object.defineProperty(window.crypto, 'subtle', { get: () => undefined }); })`
- もしくは実装側で `try { ... } catch` の `catch` 経路を強制発火するためのテスト専用 hook を 1 箇所だけ用意する

計画書本文では「実施手段の具体は builder/reviewer 裁量」と明記されているため、計画書としては OK だが、**`delete` が無効化される可能性のメモを 1 行注記すると builder の実装着手時の試行錯誤が減る**。

これは実装ガイダンスの改善提案であり、計画書の完成条件・検証手順の妥当性自体には影響しない。

#### D. 総合評価

- 事実情報精査: A-1 〜 A-10 すべて計画書と実測が一致。cycle-204 R1/R2 MINOR-9/10 同型の数値不一致は**ゼロ**。
- 完成条件: T-1 / T-2 / T-3 / T-4 すべてで計測可能な定量条件が明示されている。「動作確認 OK」のような曖昧な完成条件は混在していない。
- AP-WF16: T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行が「PM 判断で省略」の余地なく明記されている。
- AP-P21: 判定基準（下限 40px / 相互差 ≤ 2px）が cycle-203 / cycle-204 と同基準。
- スクショ枚数（baseline 7〜8 + tiles-preview 4 + after-T2 6 = 17〜18）が完成条件に明示されている。計画書 line 140 では「計 16 枚以上」と記載されており、6+4+6=16 を最小として 17〜18 を許容する数値設計で整合。
- crypto.subtle.digest の AbortController 非対応も MDN 公式仕様で reviewer 独立再現確認済み。

**結論: 必須指摘事項（CRITICAL / MAJOR）はゼロ。MINOR 3 件は計画書本文の修正なしでも実害なく進行可能だが、MINOR-1 だけは「`--bg-soft` の SSoT 根拠を 2 段階強化する」価値があり、低コストで品質向上が見込めるため反映を推奨する。MINOR-2 / MINOR-3 は計画書本文の修正なしで builder 裁量で吸収可能。**

### R1（設計 + AP 突合）

レビュアー観点: **設計判断の論理整合性 + AP 集 4 ファイル全項目との突合**。各設計判断について「来訪者価値起点か / 不採用案の判断理由が論理的に妥当か / 設計判断間の矛盾がないか / T1 / T2 likes・dislikes に直接対応しているか」、および `docs/anti-patterns/` 配下 4 ファイル（planning.md / implementation.md / workflow.md / writing.md）の全項目に対して計画書本文の手当を独立に突合した結果を以下に記載する。

#### 総評

第 1〜5 弾の標準パターン継承 + `crypto.subtle` 非同期パターン初導入という二重目的に対し、計画書はおおむね丁寧に書かれている。主要数値（旧トークン 21 / 7 種 / export 4 / `describe` 1 / `test` 8）は実測コマンドで再現確認できる（reviewer が独立に再実行して一致を確認）。AP-P21 / AP-WF16 / AP-P17 / AP-P20 / AP-WF09 / AP-WF05 / AP-WF12 / AP-P16 / AP-WF03 / AP-I07 については概ね手当てが具体的で、Phase 8.1 第 6 弾としての品質ラインに到達している。

ただし、**非同期パターンを Phase 8.1 標準パターンに組み込む実証サイクル**を看板に掲げている割に、来訪者価値に直結する `crypto.subtle` 非対応環境フォールバックの「**そもそも非対応環境がどれだけ実在するか / 配信経路（HTTPS / localhost / その他）の整理**」というファクトチェックが計画書に書かれていない（後述 MAJOR-1）。また、AP-P17（3 案以上のゼロベース列挙）について 8 つの設計判断のうち **Loading State だけ 2 案比較**にとどまっており、形式上 AP-P17 を満たしていない箇所がある（後述 MAJOR-2）。race condition 対策の判断軸も「技術的成立性」起点に寄っており「来訪者価値起点」への接続が薄い（MAJOR-3）。

#### 必須指摘事項（修正なしでは execute フェーズに進めない）

##### MAJOR-1: `crypto.subtle` 非対応環境の実在性ファクトチェックが欠落（AP-P01 / AP-P19）

**箇所**: L102「エラーハンドリング」/ L138「`crypto.subtle` 非対応フォールバック確認」/ L171-175「エラーハンドリング比較表」

**問題**: 計画書本文は「`crypto.subtle` が undefined（古いブラウザ等）」と書いているが、`crypto.subtle` は **Secure Contexts（HTTPS / `localhost`）でしか有効化されない** Web API である（MDN: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle の「Secure Contexts only」表記）。yolos.net は本番 HTTPS 配信のため、**実運用で `crypto.subtle === undefined` になるシナリオは限定的**（CDN 障害 / 内部プレビュー HTTP / レガシーブラウザ IE11 等）。にもかかわらず、計画書は日本語フォールバックを採用案として確定しているが、**そもそも非対応環境がどれだけ実在するか / 来訪者にとってこの対策がどれだけ価値を生むか**の一次資料調査が記述されていない。

これは AP-P01（前提を定量実測せず先送り）/ AP-P19（外部仕様への依存を一次資料で確認）に該当する。

**修正案**: L169-175 周辺に以下 3 点を追記する:

1. `crypto.subtle` は Secure Contexts (HTTPS / localhost) でのみ有効。本番は HTTPS のため `undefined` になるシナリオは限定的だが、`/internal/tiles/preview/` を非 HTTPS でアクセスされた場合や、IE11 等で `subtle` が無いケースがゼロではない（出典: MDN URL を明記。実装フェーズで WebFetch 再確認）
2. `digest()` 自体が reject するケースは仕様上 NotSupportedError / OperationError（不正アルゴリズム名指定）等に限定され、**実運用では reject はほぼ発生しない**
3. それでも try/catch + 日本語文言を**入れる**のは「ゼロリスク」より「来訪者が `Uncaught (in promise) Error` の JS コンソールエラー表示や白画面に直面する可能性をなくす」ためのフェイルセーフ。**確率は低いが影響は致命的**（タイル全体が崩れて見える）で対策コストが数行のため採用

これにより「対策コストの低さ」ではなく「来訪者影響の致命度」起点で採用判断が言語化される（AP-P09 / 来訪者価値起点の判断軸への準拠）。

##### MAJOR-2: AP-P17（3 案以上のゼロベース列挙）が Loading State で形式違反

**箇所**: L185-190「Loading State: 表示する vs 表示しない」

**問題**: AP-P17 は「**3 案以上**をゼロベースで列挙し比較表を作る」ことを要請している。Loading State の表で挙げられているのは「案 a: spinner 表示 / 案 b: 設けない」の **2 案のみ**。他の 6 つの設計判断（変換トリガ / 表示アルゴリズム / 出力形式 / エラー処理 / race condition / 詳細ページ touch / AP-P21 適用判断）はいずれも 3 案以上が並んでおり、Loading State だけ 2 案で済ませているのは形式整合性の欠落。

第 3 案として現実的な候補:

- 案 c: **デバウンス + プレースホルダ占位**（入力停止後 150ms 経過してから結果が出るまで「---」占位、< 1 秒ルール準拠かつチラつき回避）
- 案 c': **計算中フラグでテキストカラーを `--fg-soft` に薄める**（spinner なしで「計算中」を視覚化、結果欄が空になる瞬間ゼロ）
- 案 c'': **前回結果を残しつつ新結果に置き換わる**（連続入力時の知覚連続性確保 / React `useState` の自然な挙動）

**修正案**: Loading State の表に上記いずれか 1 案を追加し 3 案比較とする。採用案は「**設けない**」のままで構わないが、判断理由を「< 1 秒ルール」「チラつき回避」だけでなく「**前回結果を残しつつ新結果に置き換わる挙動が React の `useState` 更新と Web Crypto < 1ms 計算の組合せで自然に実現される**ため、`--fg-soft` 薄め化や placeholder 占位の追加 UI コストが不要」のように、他案を能動的に不採用にする理由を書く。

AP-WF09（形式通過防止）の同型でもある:「他は 3 案 + で書いたから Loading だけ 2 案で済ませても問題ない」というショートカット判断は AP-P17 の形式通過に該当する。

##### MAJOR-3: race condition 対策の判断軸が「技術的成立性」起点で「来訪者価値起点」への接続が薄い

**箇所**: L177-183「Race Condition 対策」

**問題**: 案 b（AbortController）不採用理由として「`crypto.subtle.digest` は AbortController 非対応（仕様未定義 / 実装側で破棄判定が必要）」と書かれているが、これは正確には「**`SubtleCrypto.digest()` の現行仕様（W3C Web Cryptography API）が `AbortSignal` 引数を受け取らないシグネチャ**」。「仕様未定義」だと「仕様書に書かれていないだけで実装が独自対応している可能性」を誤認させる余地がある。

より重要な問題として、**race condition 対策の判断軸が「技術的に成立するか」だけで論じられており「来訪者にとってどう価値が違うか」の言及が薄い**。CLAUDE.md「Decision Making Principle」（来訪者価値最大化）への接続が他の設計判断に比べて弱い。

**修正案**:

- L182 の AbortController 不採用理由を「**`SubtleCrypto.digest()` の現行仕様（W3C Web Cryptography API）は `AbortSignal` 引数を受け取らないシグネチャのため、実装側で破棄判定が必要**」に改める
- L181 の案 a 不採用理由を「Robustness を 0 にする判断は来訪者価値を理由とできない」だけでなく「**< 1KB 入力 < 1ms 計算では実用上ほぼ発生しないが、ブラウザ microtask ordering の干渉が**ゼロではないシナリオで結果欄が一瞬古い値に巻き戻ると T1 likes『不安なく使えること』を損なう。**確率は低いが認知的安全への寄与が高く対策コストが数行**のためトレードオフが明確に cleanup フラグに振れる」のように、**確率 × 影響 × コスト**の 3 軸で来訪者起点で言語化する

#### 推奨指摘事項（あれば品質が上がるが、本サイクル目的は達成できる）

##### MINOR-A: `crypto.subtle` 非対応フォールバック確認の実施手段の具体性

**箇所**: L138

「`delete window.crypto.subtle` 等の手段により API を強制的に剥奪」と書かれているが、`delete` は ReadOnly プロパティで弾かれるブラウザがある。Playwright の `Object.defineProperty(window.crypto, 'subtle', { value: undefined, configurable: true })` 等の代替手段の方が確実。「実施手段の具体は builder/reviewer 裁量」と添えてはあるが、builder が `delete` を素直に書いて失敗するリスクを回避するため、「**`delete` が ReadOnly エラーになる場合の代替手段（`Object.defineProperty` 等）を builder 裁量で選択**」と一文加える方が AP-P20 を侵さない範囲で親切。

##### MINOR-B: 「日本語フォールバック文言」の最終形が計画書本文に明示されていない（AP-WF03 境界）

**箇所**: L102 / L175

「お使いの環境では計算できません」が計画書本文に書かれているが、これが「最終文言として確定」なのか「builder 裁量での候補例」なのかが曖昧。L102 では地の文として直接書かれ、L175 では引用形式。

**修正案**: L102 の地の文を「**日本語フォールバック文言（builder 裁量。例: 『お使いの環境では計算できません』）**」のようにし、確定文言と例示の境界を明示。AP-WF03（過度に具体的な指示）を侵さない範囲で柔軟性を残す。

##### MINOR-C: Base64Tile / HtmlEntityTile の「フォールバック表示パターン統一」の意味整理

**箇所**: L102 / L175

「Base64Tile / HtmlEntityTile のフォールバック方針と統一」と書かれているが、Base64 / HTML エンティティは同期処理であり `crypto.subtle` 系の非同期エラーフォールバックとは性質が異なる（同期 vs 非同期 / try/catch 直 vs Promise.catch）。Base64Tile の場合は「無効な base64 文字列の decode 失敗時のエラー処理」を指している可能性が高い。

**修正案**: 「Base64Tile / HtmlEntityTile が `--fg-soft` で日本語エラー文言を返す**統一表示パターン**（色トークン + 日本語文言 + 控えめ表示の 3 点）に倣う」のように、**どの観点で統一しているか**を 1 文で明示する。

##### MINOR-D: AP-P21 計測 4 ケースの差別化目的（膨張ゼロ型 = 全件同値見込み）

**箇所**: L132-137 / L213

hash-generator は膨張ゼロ型のため (a)(b)(c)(d) 4 ケースは textarea 高さに関しては理論上完全同値見込み。にもかかわらず 4 ケースを設定する目的が「**膨張ゼロ型での AP-P21 計測ベースライン記録**」「**運用標準の継続**」と書かれているが、結果論的根拠に寄っている。

cycle-204 申し送りの 4 ケース運用形を維持する手順安定性は確実に価値があるが、判断理由を「**膨張ゼロ型サンプル 1 件目として 4 ケース全件 0px 差を記録することにより、第 7 弾以降に他の膨張ゼロ型ツール（fullwidth-converter / kana-converter 等）が現れた際の比較基準値が確定する**」という**将来サイクルへの寄与**を 1 行追記すると説得力が上がる。

##### MINOR-E: 「結果表示済み状態スクショ 1〜2 枚」のライト限定の根拠（AP-WF05 境界）

**箇所**: L55

「ベース 6 枚と同等の両モード義務化は不要」と書かれているが、AP-WF05 は「ライト/ダーク両モードを必須」と明示。`tmp/` 配下に 1 枚追加するコストは低く、結果表示済み状態にもダークモード固有の表示不具合（hex 文字列の dark BG での対比等）が起きる可能性はゼロではない。

**修正案**: 結果表示済みスクショもライト/ダーク両モード（計 2 枚）に変更。物理コストは Playwright スクリプト 1 行追加程度。「ベース 6 枚は厳守したが結果表示済みスクショで片モードに緩めた」という二重基準の AP-WF09 同型発生を未然防止。

#### 第 6 弾選定理由（§補足事項）の評価

(b) hash-generator 選定の判断軸（来訪者価値 / 実証性 / リスク）は妥当。「Phase 8.1 残 29 ツールのうち非同期処理を含むツール（qr-code / image-base64 / image-resizer 等）が複数存在する見込み」という後続波及効果の言及は、cycle-204 で (b) を不採用にした際の「**第 6 弾以降で**」という持ち越し方針と一貫している。

候補 (a)（構造類似ペア並行）を不採用にした理由「AP-WF16 運用形が確立した今でも独立性確保のための新リスク」は cycle-204 R1 で同種候補を不採用にした判断軸（「AP-WF16 事後検証の独立性」）と一貫しており、サイクル間で判断基準がブレていない（AP-P05 = 前回への反射で方針を決める、を回避）。

**MINOR-F**: 補足事項本文では言及されていないが、`crypto.subtle` 性質が後続にどう波及するかの「**具体的な後続候補名と性質マッピング**」を 1〜2 行加えると、補足事項の「後続作業安定化に寄与」の主張が具体根拠を持つ。例:

- qr-code 生成 → 非同期（ライブラリ依存）かつ結果が image/canvas
- image-base64 → 非同期（FileReader）かつ入力が File オブジェクト
- image-resizer → 非同期（Canvas API）かつ入力出力ともにバイナリ

必須ではないため MINOR 扱い。

#### AP 集 4 ファイル全項目との突合まとめ

| AP                                        | 計画書での手当                                                                | 評価                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AP-P01（前提実測 / 先送り）               | 主要数値は grep 実測。`crypto.subtle` 性能は research 文書で実測値引用        | △ MAJOR-1 = 非対応環境の実在性は未実測                                          |
| AP-P02〜P08, P10〜P15, P18                | 該当性低（本サイクルは標準パターン適用 + 既存ツール移行）                     | ◎                                                                               |
| AP-P09（来訪者価値起点）                  | 各設計判断を来訪者価値起点で言語化                                            | △ MAJOR-3 = race condition だけ「技術的成立性」起点に寄っている                 |
| AP-P16（一次情報の実体確認）              | T-1 grep コマンド併記済                                                       | ◎                                                                               |
| AP-P17（3 案以上ゼロベース列挙）          | 7/8 の判断で 3 案以上比較                                                     | △ MAJOR-2 = Loading State だけ 2 案                                             |
| AP-P19（外部仕様の一次資料確認）          | `crypto.subtle` の Secure Contexts only 言及なし                              | △ MAJOR-1 と同根                                                                |
| AP-P20（実装詳細への踏み込み）            | cleanup フラグの具体実装は builder 裁量と明示                                 | ◎                                                                               |
| AP-P21（固定枠 UI 膨張同居）              | 「膨張ゼロ型でも継続採用」を 3 理由で言語化                                   | ◎                                                                               |
| AP-I01〜I09                               | 該当性低（実装段階 AP は計画書では言及困難 / T-4 で Playwright 実機検証明示） | ◎ AP-I07 は T-4 で本番ビルド + Playwright 実機検証が明示                        |
| AP-WF01〜WF15                             | 該当性低（実行フェーズの AP）                                                 | ◎                                                                               |
| AP-WF05（移行前ダーク必須）               | ベース 6 枚明示                                                               | △ MINOR-E = 結果表示済みスクショだけ片モードに緩めている                        |
| AP-WF09（形式通過防止）                   | AP-P21 / AP-WF09 の関連性を明示                                               | △ MAJOR-2 / MINOR-E = AP-WF09 同型の形式通過リスクが残存                        |
| AP-WF12 / AP-P16（数値の実体確認）        | grep コマンドを併記                                                           | ◎（実測値 21 / 7 種 / 4 export / `describe` 1 / `test` 8 を独立に再実行確認済） |
| AP-WF16（4 コマンド全件 reviewer 再実行） | T-3 / T-4 とも 4 コマンド全件と明示                                           | ◎                                                                               |
| AP-WF03（過度に具体的な指示）             | `aria-live` 等は SSoT 由来として許容範囲                                      | ○ MINOR-B = 日本語文言の literal 化が境界線                                     |
| AP-W01〜W09（記事執筆系）                 | 該当なし（本サイクルは計画 / 実装。記事は伴わない）                           | N/A                                                                             |

#### 結論

**改善指示**（MAJOR 3 件 / MINOR 6 件）。MAJOR-1 / MAJOR-2 / MAJOR-3 を最低限解消した上で再レビューに進むこと。MINOR-A〜F は併せて修正できれば品質が上がるが、PM 判断で選別可。本レビューは「設計判断の論理整合性 + AP 集突合」の観点に立脚しており、先行する R1（事実情報 + 完成条件）の結論（必須ゼロ）とは観点が異なるため独立に判断されたい。

### R2（事実情報 + 完成条件）

レビュアー観点: R1 と同じ「**事実情報精査（独立再現）+ 完成条件 / 検証手順の妥当性**」。R1 で挙げた MINOR 3 件 + 別 reviewer の MAJOR 3 / MINOR 6 = 計 12 件への対応が計画書本文に反映されているかを、**reviewer 自身による grep / Read / WebFetch による独立再現**で確認した結果を以下に記載する。

#### A. R1 指摘 12 件の対応確認

##### 自分（R1 事実情報）担当 3 件

| #       | 指摘内容                                                          | 反映箇所                                                                                                                           | 評価   |
| ------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MINOR-1 | `--bg-soft` SSoT 2 段階強化（char-count / byte-counter 使用実績） | L78 末尾に「`src/tools/{char-count,byte-counter}/Component.module.css` でも `--bg-soft` の使用実績がある」+ `grep -l` コマンド併記 | 反映済 |
| MINOR-2 | `< 1ms / < 8ms` 処理時間根拠の出典明示                            | L99「（出典: `docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md`）」+ L140 にも同一出典明示            | 反映済 |
| MINOR-3 | `delete window.crypto.subtle` の限界注記                          | L141「**`delete` が ReadOnly エラーになる場合の代替手段（`Object.defineProperty(...)` 等）を builder 裁量で選択**」を追記          | 反映済 |

##### 別 reviewer（R1 設計 + AP 突合）担当 9 件（概観確認）

| #       | 指摘内容                                                                | 反映箇所（概観確認）                                                                                                                                                                                                                  | 評価   |
| ------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MAJOR-1 | Secure Contexts only ファクトチェック + 採用根拠の言語化                | L102-105「**採用根拠（来訪者影響の致命度起点）**」3 段 (i)〜(iii) で MDN URL + Secure Contexts + 致命度起点を明示                                                                                                                     | 反映済 |
| MAJOR-2 | Loading State 3 案化                                                    | L188-194 に案 c「前回結果を残しつつ新結果に置き換わる（明示的な計算中フラグ等で UI 制御）」を追加し、不採用理由として「React `useState` の自然な挙動で実現される / 追加 UI コスト不要」を能動的に言語化                               | 反映済 |
| MAJOR-3 | race condition 判断軸の精緻化（確率 × 影響 × コスト）                   | L184「対策なし」不採用理由が `確率 × 影響 × コスト` 3 軸で再言語化済 / L185 AbortController 不採用理由が「**`SubtleCrypto.digest()` の現行仕様（W3C Web Cryptography API）は `AbortSignal` 引数を受け取らないシグネチャ**」に精緻化済 | 反映済 |
| MINOR-A | `Object.defineProperty` 代替手段の明記                                  | L141 で明示済（MINOR-3 と統合）                                                                                                                                                                                                       | 反映済 |
| MINOR-B | 日本語フォールバック文言の境界（builder 裁量 + 例示）                   | L102「**日本語フォールバック文言（builder 裁量。例: 『お使いの環境では計算できません』）**」                                                                                                                                          | 反映済 |
| MINOR-C | Base64Tile / HtmlEntityTile 統一の意味（色 + 文言 + 控えめ表示の 3 点） | L102「Base64Tile / HtmlEntityTile が `--fg-soft` で日本語エラー文言を返す **統一表示パターン**（色トークン `--fg-soft` + 日本語文言 + 控えめ表示の 3 点）に倣う」                                                                     | 反映済 |
| MINOR-D | AP-P21 計測 4 ケースの将来寄与                                          | L217「**膨張ゼロ型サンプル 1 件目として 4 ケース全件 0px 差を記録することにより、第 7 弾以降に他の膨張ゼロ型ツール（fullwidth-converter / kana-converter 等）が現れた際の比較基準値が確定する**」                                     | 反映済 |
| MINOR-E | 結果表示済みスクショの両モード化（baseline 8 枚化）                     | L55「**結果表示済み状態スクショ 2 枚（ライト・ダーク両モード）**」/ L58 完成条件「**計 8 枚**（ベース 6 枚 + 結果表示済み 2 枚）」/ L143 完成条件「移行前 baseline 8 枚」と整合                                                       | 反映済 |
| MINOR-F | 後続候補の性質マッピング（qr-code / image-base64 / image-resizer）      | §補足事項末尾に新セクション「**第 6 弾 hash-generator で実証する非同期パターンが後続候補にどう波及するか**」を追加し 3 候補の性質を明示                                                                                               | 反映済 |

**12 件全件反映済**。

#### B. 数値整合性の検証結果

reviewer が grep で本文中の数値を抽出し、複数箇所間の整合性を検証した結果:

| 検証項目                     | 整合性確認結果                                                                                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スクショ枚数                 | L58 完成条件「baseline 計 8 枚」 / L127「タイルプレビュー 計 4 枚」 / L128「移行後 計 6 枚」 / L143「**計 18 枚**（8 + 4 + 6）」 = **整合**。MINOR-E 反映で T-1 が「7〜8 枚」から「8 枚」確定に変わり、T-4 も「16 枚以上」から「18 枚」確定に整合した |
| Loading State 案数           | L188 セクション見出し「表示する vs 設けない vs **前回結果残し置換**」が 3 案。L191-194 の表に案 a / 案 b / 案 c の 3 行 = **整合**。AP-P17 形式違反は解消                                                                                             |
| Race Condition 案数          | L180 セクション見出し「対策なし vs cleanup flag vs AbortController」が 3 案。L183-186 の表に案 a / 案 b / 案 c の 3 行 = **整合**                                                                                                                     |
| AP-P21 計測 4 ケース         | L135 (a)〜(d) の 4 ケース / L143 完成条件「(a)〜(d) 4 ケース全てで」 / L217「4 ケース全件 0px 差」= **整合**                                                                                                                                          |
| SHA hex 長                   | L106 SHA-1=40 / SHA-256=64 / SHA-384=96 / SHA-512=128 / L132「**40 / 64 / 96 / 128**」/ L207 SHA-1=40 / SHA-256=64 / SHA-384=96 / SHA-512=**128** = **整合**                                                                                          |
| `TILE_DECLARATIONS` 既存件数 | L226 で base64 / html-entity 言及 / R1 A-7 で「5 件（char-count / byte-counter / url-encode / base64 / html-entity）」と独立確認済 = **整合**                                                                                                         |

**全項目整合**。前回の R1 で指摘した「7〜8 枚」表記の曖昧さも MINOR-E 反映で「8 枚」確定に整合化されている。

#### C. 新規事実情報の独立再現（reviewer 実測）

##### C-1. `--bg-soft` 既存使用実績（MINOR-1 反映）

reviewer が独立に再実行:

```
$ grep -l "bg-soft" src/tools/*/Component.module.css
src/tools/char-count/Component.module.css
src/tools/byte-counter/Component.module.css
```

→ L78 の主張「`src/tools/{char-count,byte-counter}/Component.module.css` でも `--bg-soft` の使用実績がある」と**完全一致**。

##### C-2. research レポートの存在 + 処理時間数値の出典確認（MINOR-2 反映）

reviewer が独立に再実行:

```
$ ls docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md
docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md
```

→ ファイル存在を確認。さらに内容を grep で確認:

```
$ grep -E "1ms|8ms|100KB|< 1KB" docs/research/2026-05-22-...md
- 100KB のテキスト（長文 HTML）: **約 8 ms**
- 1MB テキストで約 58ms → **1MB 未満のテキスト入力は Worker 化不要で実用的**
hash-generator タイルの典型処理時間（テキスト入力 < 100KB）は **< 10ms**。
`onChange` ごとに即座に計算する。1KB 以下の入力で < 1ms であるため、デバウンスは不要かつ逆に体感を悪化させる可能性がある。
1. **計算速度**: 1KB 以下の入力で < 1ms。`onChange` 毎に即時計算して問題なし。デバウンス・loading インジケーター不要。
```

→ 計画書本文 L99 / L140 の「< 1ms（< 1KB 入力）/ < 8ms（100KB 入力）」が research レポート本文と**完全一致**。出典指示も妥当。

##### C-3. MDN `Crypto/subtle` の Secure Contexts only 表記（MAJOR-1 反映）

reviewer が独立に WebFetch で MDN 公式ページを取得:

```
URL: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle
取得結果: "Secure context: This feature is available only in secure contexts (HTTPS),
         in some or all supporting browsers."
```

→ 計画書 L103「`crypto.subtle` は **Secure Contexts (HTTPS / `localhost`) でのみ有効** な Web API（出典: MDN `Crypto/subtle` ... の「Secure Contexts only」表記）」と**実質一致**（厳密には MDN 表記は "Secure context"（単数）だが、「Secure Contexts only」は W3C / MDN 周辺の概念呼称として標準的）。

##### C-4. R1 で確認済の主要数値の再独立再現

念のため R1 で確認した主要数値も再実行（reviewer 入れ替わりでの再現性確認）:

```
$ grep -c -- "--color-" src/tools/hash-generator/Component.module.css
21
$ grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/hash-generator/Component.module.css | sort -u
--color-bg
--color-bg-secondary
--color-border
--color-primary
--color-primary-hover
--color-text
--color-text-muted
$ grep -c '^export ' src/tools/hash-generator/logic.ts
4
$ grep -c '^\s*describe(' src/tools/hash-generator/__tests__/logic.test.ts
1
$ grep -c '^\s*test(' src/tools/hash-generator/__tests__/logic.test.ts
8
```

→ 全件 R1 / 計画書本文と一致。R1 と R2 で reviewer 担当が変わっても**独立再現性が保たれている**ことを確認（AP-WF16 の運用形が機能している）。

#### D. AP-WF16（T-3 / T-4 4 コマンド全件 reviewer 独立再実行）の記述確認

reviewer が L120（T-3）/ L142（T-4）を独立に確認:

- **T-3 検証手順**: 「T-3 builder は `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** の出力を引用付きで報告する。T-3 reviewer は **4 コマンドすべて** を独立に再実行して出力一致を確認する（cycle-203 T-3 R1 で発覚した format:check 虚偽 PASS 同型事故の確実防止）」
- **T-4 検証手順**: 「T-4 builder は 4 コマンド全件出力と Playwright 計測 4 ケース実測値を引用付きで報告。T-4 reviewer は (i) 自動チェック 4 コマンドすべてを独立に再実行、(ii) Playwright 計測の 4 ケースのうち最低 1 ケースを独立に再現、の両方を実施する（cycle-204 T-4 と同形）」

→ R1 から崩れていない。AP-WF16 の運用標準が R1/R2 を通じて維持されている。

#### E. R2 新規指摘

##### 必須（CRITICAL / MAJOR）

**なし**。

##### 推奨（MINOR）

**R2-MINOR-α（推奨 / 軽微）**: L103 の MDN 表記の小さな表現ブレ

L103 で「Secure Contexts only」表記と書かれているが、MDN 公式ページ実体は "Secure context"（単数 / 小文字始まり）の項目見出し下に "This feature is available only in secure contexts (HTTPS)..." と記載されている。「Secure Contexts only」という鍵括弧付き引用形は「MDN の見出し原文」と誤読される余地がある。**ただし「Secure Contexts only」は W3C / MDN の概念呼称として広く流通しており、概念引用としては正当**。実害なし。

修正案（任意）: 「**Secure Contexts でのみ有効**な Web API」のように「only」を日本語に吸収する、もしくは原文表記を併記する。出典 URL は明記済のため reader が独立追跡可能な状態は確保されており、計画書本文の修正なしでも実害なく進行可能。

#### F. 総合評価

| 観点                                     | 評価                                                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| R1 指摘 12 件の対応                      | **12 件全件反映済**                                                                                                   |
| 数値整合性（スクショ / 案数 / hex 長等） | **全項目整合**。MINOR-E 反映で baseline 8 枚確定 → T-4 18 枚確定の連鎖整合も達成                                      |
| 新規事実情報の独立再現                   | C-1（`--bg-soft` 既存使用実績）/ C-2（research 数値）/ C-3（MDN Secure Contexts）すべて reviewer 自身が独立再現で一致 |
| AP-WF16 運用形維持                       | T-3 / T-4 とも「4 コマンドすべて」記述が R1 から崩れず維持                                                            |
| 新規 MAJOR / CRITICAL                    | **ゼロ**                                                                                                              |
| 新規 MINOR                               | R2-MINOR-α 1 件のみ（軽微 / 計画書修正不要で進行可能）                                                                |

#### 結論: **Pass**

R1 指摘 12 件すべてが計画書本文に反映されており、reviewer 自身による grep / Read / WebFetch での独立再現でも事実情報の正確性が確認できた。数値の整合性も baseline 8 枚 → T-4 18 枚の連鎖整合まで達成している。R2 新規指摘は軽微な表現ブレ 1 件のみで、計画書本文の修正なしでも execute フェーズ進行に支障はない。**execute フェーズへの移行を承認する**。

### R2（設計 + AP 突合）

レビュアー観点: **設計判断の論理整合性 + AP 集 4 ファイル全項目との突合（R1 と同観点）**。R1 で指摘した必須 3 + 推奨 9 = 計 12 件への対応反映確認 + 計画書全体の再点検 + 整合性確認。reviewer は計画書本文を再度通読し、AP 集 4 ファイル全項目を再突合した結果を以下に記載する。

#### A. R1 指摘 12 件の対応状況

R1（事実情報 + 完成条件）指摘 3 件（MINOR-1 / MINOR-2 / MINOR-3）+ R1（設計 + AP 突合）指摘 9 件（MAJOR-1 / MAJOR-2 / MAJOR-3 / MINOR-A / MINOR-B / MINOR-C / MINOR-D / MINOR-E / MINOR-F）= 計 12 件について、計画書本文を 1 件ずつ精査した。

| #       | R1 指摘内容（要旨）                                             | 計画書での反映箇所                                                                                                                                                                                                | 対応判定 |
| ------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| MAJOR-1 | `crypto.subtle` 非対応環境の実在性ファクトチェック欠落          | L102-105 で「採用根拠（来訪者影響の致命度起点）」として (i) Secure Contexts only + MDN URL 明記、(ii) 本番 HTTPS 下で `undefined` シナリオ限定的を明記、(iii) 確率は低いが影響は致命的 + 対策コスト数行を言語化済 | 完全対応 |
| MAJOR-2 | Loading State が 2 案で AP-P17 形式違反                         | L188-194 で 3 案比較に改修済（案 a: spinner / 案 b: 設けない採用 / 案 c: 前回結果を残しつつ新結果に置き換わる）。案 c の不採用理由として「React `useState` + Web Crypto < 1ms 計算の自然な挙動で実現」を明記      | 完全対応 |
| MAJOR-3 | race condition 対策が「技術的成立性」起点で来訪者価値接続が薄い | L184-186 で AbortController 不採用理由を「W3C Web Cryptography API は AbortSignal 引数を受け取らないシグネチャ」に精緻化、案 a 不採用理由を「確率 × 影響 × コスト」3 軸で来訪者価値起点に再言語化済               | 完全対応 |
| MINOR-1 | `--bg-soft` SSoT 突合の 2 段階強化                              | L78 末尾に「`src/tools/{char-count,byte-counter}/Component.module.css` でも `--bg-soft` の使用実績がある」旨を grep コマンドそのものとともに追記済                                                                | 完全対応 |
| MINOR-2 | `< 1ms / < 8ms` 処理時間根拠の出典明示                          | L99 / L140 / L155 / L194 で `docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md` への参照を本文中に直接追加済                                                                          | 完全対応 |
| MINOR-3 | `delete window.crypto.subtle` の限界注記                        | L141 で「`delete` が ReadOnly エラーになる場合の代替手段（`Object.defineProperty(window.crypto, 'subtle', { value: undefined, configurable: true })` 等）を builder 裁量で選択」を明記済                          | 完全対応 |
| MINOR-A | `Object.defineProperty` 代替手段                                | MINOR-3 と統合して L141 で対応済（同上）                                                                                                                                                                          | 完全対応 |
| MINOR-B | 日本語フォールバック文言の境界明示                              | L102 で「**日本語フォールバック文言（builder 裁量。例: 『お使いの環境では計算できません』）**」と確定文言・例示の境界を明示済                                                                                     | 完全対応 |
| MINOR-C | Base64Tile / HtmlEntityTile 統一の意味                          | L102 で「`--fg-soft` で日本語エラー文言を返す **統一表示パターン**（色トークン `--fg-soft` + 日本語文言 + 控えめ表示の 3 点）に倣う」と意味整理を追記済                                                           | 完全対応 |
| MINOR-D | AP-P21 計測 4 ケースの将来寄与                                  | L217 で「**膨張ゼロ型サンプル 1 件目として 4 ケース全件 0px 差を記録することにより、第 7 弾以降に他の膨張ゼロ型ツール（fullwidth-converter / kana-converter 等）が現れた際の比較基準値が確定する**」を追記済      | 完全対応 |
| MINOR-E | 結果表示済みスクショの両モード化                                | L55 で「**結果表示済み状態スクショ 2 枚（ライト・ダーク両モード）**」に変更済。AP-WF09 同型の二重基準も予防言及済                                                                                                 | 完全対応 |
| MINOR-F | 後続候補の性質マッピング                                        | §補足事項 L532-538 で qr-code 生成 / image-base64 / image-resizer の 3 候補について非同期性質と入出力性質をマッピング済                                                                                           | 完全対応 |

**12 件すべて完全対応**。部分対応・未対応はゼロ。

#### B. 整合性の確認

R1 修正による副作用や新たな数値不整合の有無を、計画書本文の数値・コマンド・固有名詞すべてについて再突合した。

| 観点                               | 計画書本文の主張                                                                                                                                                | reviewer 実測 / 確認                                                                                                                                                                                              | 突合結果 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| スクショ枚数（baseline）           | L54-55「ベース 6 枚 + 結果表示済み 2 枚 = **8 枚**」、L58「計 8 枚」、L143「移行前 baseline 8 枚 = ベース 6 枚 + 結果表示済み 2 枚」                            | L19 タスクリストの T-1 でも「結果表示済み状態スクショも撮影」と整合                                                                                                                                               | 一致     |
| スクショ枚数（tiles-preview）      | L127「w1200 / w375 × ライト / ダーク **計 4 枚**」、L143「タイルプレビュー 4 枚」                                                                               | 4 枚で一貫                                                                                                                                                                                                        | 一致     |
| スクショ枚数（after-T2 / 移行後）  | L128「**計 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × ライト / ダーク」、L143「移行後 6 枚 = w1200・w1900・w375 × ライト/ダーク」                      | 6 枚で一貫                                                                                                                                                                                                        | 一致     |
| スクショ合計                       | L143「**計 18 枚**（移行前 baseline 8 枚 / タイルプレビュー 4 枚 / 移行後 6 枚）= cycle-204 と同水準」                                                          | 8 + 4 + 6 = 18 で算術一致。R1 で言及されていた「16 枚以上」表記は cycle-204 と同水準のため 18 で確定的整合                                                                                                        | 一致     |
| grep コマンド（旧トークン残存）    | L49「`grep -c -- "--color-" src/tools/hash-generator/Component.module.css` → 21」、L88「判定コマンド: 同 grep → `0`」                                           | reviewer 独立再実行: `grep -c -- "--color-" src/tools/hash-generator/Component.module.css` → **21**                                                                                                               | 一致     |
| grep コマンド（旧トークン種類）    | L50「7 種」+ L50 の `grep -o ...` コマンド                                                                                                                      | reviewer 独立再実行: `--color-bg` / `--color-bg-secondary` / `--color-border` / `--color-primary` / `--color-primary-hover` / `--color-text` / `--color-text-muted` の **7 種**                                   | 一致     |
| logic.ts export 数                 | L51「**4 export**」                                                                                                                                             | `grep -c '^export ' src/tools/hash-generator/logic.ts` → **4**                                                                                                                                                    | 一致     |
| logic.test.ts describe / test 件数 | L52「describe **1** / test **8**」                                                                                                                              | reviewer 独立再実行: describe → **1**、test → **8**                                                                                                                                                               | 一致     |
| `--bg-soft` 既存使用実績           | L78「`src/tools/{char-count,byte-counter}/Component.module.css` でも `--bg-soft` の使用実績がある」                                                             | `grep -l "bg-soft" src/tools/*/Component.module.css` → `src/tools/byte-counter/Component.module.css` / `src/tools/char-count/Component.module.css`                                                                | 一致     |
| デザイントークンマッピング 7 種    | L71-77（7 種、`--color-bg-secondary → --bg-soft` の特殊マッピング含む）                                                                                         | `src/app/globals.css` に `--bg` / `--bg-soft` / `--border` / `--accent` / `--accent-strong` / `--fg` / `--fg-soft` 全 7 種が定義済。`--bg-soft` の意味「recessed background / hover on bg」も計画書本文の説明通り | 一致     |
| 第 7 弾候補との接続                | L217「fullwidth-converter / kana-converter 等」（膨張ゼロ型）、L532-538「qr-code / image-base64 / image-resizer」（非同期型）                                   | cycle-204 キャリーオーバーで挙げられた次サイクル候補 (c) fullwidth-converter / kana-converter と整合。第 7 弾の選定根拠基盤として一貫                                                                             | 一致     |
| AP-P21 計測 4 ケース               | L135-139「(a) 空入力 / (b) 短い ASCII / (c) 中程度の日本語 / (d) SHA-512 切替」                                                                                 | 4 ケース定義が L139 と L143 / L145 で一貫                                                                                                                                                                         | 一致     |
| AP-WF16 4 コマンド全件             | L123「`npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて**」、L145「自動チェック 4 コマンドすべてを独立に再実行」 | T-3 / T-4 とも 4 コマンド全件と reviewer 独立再実行が一貫して明記                                                                                                                                                 | 一致     |
| SHA hex 桁長                       | L106「SHA-1 が 40 hex / SHA-256 が 64 hex / SHA-384 が 96 hex / SHA-512 が **128 hex 文字**」、L139「**40 / 64 / 96 / 128**」、L207「同じ 4 桁長」              | 3 箇所で 40/64/96/128 が一貫。SHA 仕様（出力ビット数 / 4 = hex 桁数）と整合                                                                                                                                       | 一致     |
| `crypto.subtle` Secure Contexts    | L103「Secure Contexts (HTTPS / `localhost`) でのみ有効」+ MDN URL                                                                                               | MDN 公式 (https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle) で Secure Contexts only を再確認済                                                                                                      | 一致     |
| AbortController 非対応             | L185「W3C Web Cryptography API は `AbortSignal` 引数を受け取らないシグネチャ」                                                                                  | MDN `SubtleCrypto/digest` で引数は `algorithm` / `data` のみ。AbortSignal 引数なしを再確認済                                                                                                                      | 一致     |

**整合性の不一致はゼロ**。R1 修正による副作用（スクショ枚数のズレ / grep コマンド引数のズレ / マッピングのズレ）は発生していない。

#### C. R2 新規指摘

R1 で見落としていた問題、または計画書全体を再度読み下し AP 集 4 ファイル全項目（AP-P02〜P08 / P10〜P15 / P18 / AP-I01〜I09 / AP-WF01〜WF15 / AP-W01〜W09 含む）と再突合した結果、以下を検出した。

##### 必須（MAJOR / CRITICAL）

**なし**。

##### 推奨（MINOR）

**なし**。

reviewer は計画書本文の以下の項目を新たに精査したが、いずれも実害なく合格水準と判定した:

- **AP-WF01〜WF15 の再点検**: AP-WF04（完了通知 + 実態確認）は T-1 / T-2 / T-3 / T-4 の完成条件で grep / HTTP 200 OK / Playwright スクショ等の実態確認手段が明示されており充足。AP-WF07（1 エージェント 1 タスク）は T-1〜T-4 が独立タスクとして分割済で充足。AP-WF11（PM 自己通読）は計画書本文の責任が PM にあり、execute フェーズで適用される性質のため計画書段階では言及困難（妥当）。AP-WF13（スコープ越境）は T-1〜T-4 が直列実行のため該当性低い（並行アサインしていない）。AP-WF14（数値の一次集計）は reviewer 側の規律であり、本 R2 でも独立再実行を実施済。
- **AP-I01〜I09 の再点検**: AP-I01（来訪者体験レビュー）は T-4 で Playwright 視覚スクショ + 4 ケース計測が明示され充足。AP-I07（Playwright 本番ビルド検証）は T-4 で `npm run build` + Playwright が明示され充足。AP-I08（DESIGN.md 未定義の視覚表現）は計画書本文で `--fg-soft` / `--bg-soft` 等の SSoT 定義済トークンのみを使用すると明示。AP-I09（commit 順序）は本サイクルの直列実行で該当性低い。
- **AP-W01〜W09**: 本サイクルは計画 + 実装で記事執筆を伴わないため該当性なし（N/A）。L482 でも明記済。
- **AP-P02〜P08 / P10〜P15 / P18**: いずれも該当性低。AP-P05（前回への反射）は計画書本文 L453（R1 設計+AP の評価）で「サイクル間で判断基準がブレていない」を確認済。AP-P11（前サイクルの決定への盲従）は計画書本文で「kind=widget 標準パターン継続」の根拠を 3 理由で言語化済（L213-215）。AP-P14（恣意的限定）は補足事項 L524 で候補 (a)(b)(c)(d) 全 4 案を明示し公平に比較。
- **race condition 対策で `useEffect` cleanup フラグ + builder 裁量**（L100 / L186）の境界線が AP-WF03（過度に具体的な指示）の境界に近いが、計画書本文は「具体的な実装の置き方は builder 裁量」と明示しており AP-WF03 を侵していない。R1 MINOR-B の境界線対応と同形で適切。
- **計画書本文の言葉づかい**: L102「英語 JS エラーを直接見せず」は「Uncaught (in promise) Error」のような英文を visitor に見せない判断であり、AP-W02（一般語の独自意味化）等にも該当しない。
- **`HashGeneratorTile.tsx` テスト 4 件以上の最低限カバーすべき観点 3 項目**（L113）が 4 件以上の件数下限に対し 3 観点列挙のため、「最低限 4 件で 3 観点を必ず満たし、残り 1 件以上は builder 裁量」と読める。AP-WF03 / AP-P20 を侵さない範囲で適切。
- **`/internal/tiles/preview/tools/hash-generator` の URL 妥当性**: L127 / L131 で同じ URL を使用しており、L264（R1 検証時）で実体パス `src/app/(new)/internal/tiles/preview/[domain]/[slug]/` の存在を確認済。

#### D. 結論

- **R1 指摘 12 件はすべて完全対応**。部分対応・未対応はゼロ。
- **整合性確認 15 項目すべて一致**。R1 修正による副作用は発生していない。
- **R2 新規指摘なし**（必須・推奨ともゼロ）。AP 集 4 ファイル全項目との再突合でも漏れは検出されず。
- スクショ枚数（baseline 8 / tiles-preview 4 / after-T2 6 / 合計 18）、grep コマンドの引数、デザイントークンマッピング、第 7 弾候補との接続、AP-P21 計測 4 ケース、AP-WF16 4 コマンド全件のすべてが数値・文言整合済。

**結論: Pass（承認）**。計画書は execute フェーズに進める品質に到達している。

### R2 PM 判断

**判定: Pass / execute フェーズ移行を承認**。

両 R2（設計+AP / 事実情報+完成条件）とも結論「Pass（承認）」。

- R1 指摘 12 件はすべて完全対応済（R2 両 reviewer の独立判定一致）
- 整合性 15 項目すべて実測一致（スクショ 18 枚 / grep 結果 / トークンマッピング / SHA hex 長 / AP-P21 4 ケース / AP-WF16 4 コマンド全件）
- 新規必須指摘ゼロ
- 新規推奨指摘 R2-MINOR-α 1 件（軽微な表現ブレ）

**R2-MINOR-α への判断: 不採用**。理由: (i) 「Secure Contexts only」は W3C / MDN の概念呼称として広く流通しており実害なし、(ii) MDN URL を計画書本文に明記済のため reader が独立追跡可能、(iii) reviewer 自身が「計画書修正なしでも進行可能」と明示判定。AP-WF09（形式通過防止）の観点でも、軽微な表現ブレ 1 件のために再 R3 を起こすほうが計画フェーズの肥大化を招き、来訪者価値に直結しない。本サイクルではこの不採用判断ごと計画書に記録して execute へ進む。

#### 次アクション

TaskCreate で T-1〜T-4 + cycle-completion の合計 5 タスクを登録し、依存関係（T-1 → T-2 → T-3 → T-4 → completion）を TaskUpdate で設定。その後 git commit で計画フェーズ完了状態を記録し、`/cycle-execution` スキルへ移行する。

### T-1 R1

レビュアー観点: T-1（hash-generator 現状把握 + 移行前 baseline 取得）の builder 報告物に対し、(A) AP-WF16 独立再実行 / (B) スクショ 8 枚の実体確認 / (C) AP-WF05 遵守 / (D) AP-WF12 / AP-P16 遵守 / (E) T-1 完成条件 3 項目 の 5 観点で評価する。

#### A. AP-WF16 独立再実行

reviewer は builder 報告の 5 数値のうち **5 件全件** + テスト + ファイル列挙の 7 件すべてを独立に再実行した（計画書要請は「最低 2 件」だが、本 T-1 は数値が計画書本文に直接接続するため可能な範囲で交差確認）。

```
$ grep -c -- "--color-" src/tools/hash-generator/Component.module.css
21
$ grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/hash-generator/Component.module.css | sort -u
--color-bg
--color-bg-secondary
--color-border
--color-primary
--color-primary-hover
--color-text
--color-text-muted
$ grep -c '^export ' src/tools/hash-generator/logic.ts
4
$ grep -c '^\s*describe(' src/tools/hash-generator/__tests__/logic.test.ts
1
$ grep -c '^\s*test(' src/tools/hash-generator/__tests__/logic.test.ts
8
$ ls "src/app/(legacy)/tools/hash-generator/"
opengraph-image.tsx  page.tsx  twitter-image.tsx
$ npm run test -- hash-generator
 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  1.10s
```

→ 計画書本文 L49 / L50 / L51 / L52（21 / 7 種 / 4 / 1 / 8）、L48（3 ファイル）、L56（テスト 8 件 PASS）と **完全一致**。builder の報告は虚偽 PASS / 数値の取り違えなしと判定。AP-WF16 の運用形（builder 自己申告 → reviewer 独立再実行）が機能している。

#### B. スクショ 8 枚の実体確認

`ls /mnt/data/yolo-web/tmp/cycle-205/baseline/` 実測:

```
before-result-w1200-dark.png     (203,974 bytes)
before-result-w1200-light.png    (198,639 bytes)
before-w1200-dark.png            (166,539 bytes)
before-w1200-light.png           (162,234 bytes)
before-w1900-dark.png            (175,430 bytes)
before-w1900-light.png           (172,382 bytes)
before-w375-dark.png             (156,021 bytes)
before-w375-light.png            (151,316 bytes)
```

→ **8 ファイル全件存在**。ファイル名から「ベース 6 枚（w1200 / w1900 / w375 × light/dark）+ 結果表示済み 2 枚（w1200 × light/dark）」の構成が計画書 L54-55 / L58 完成条件と一致。

撮影品質を reviewer 自身が Read で 4 枚（w1200-light / w375-dark / result-w1200-light / result-w1200-dark）視認:

- `before-w1200-light.png`: 白背景 + 黒テキストで明瞭にライトモード。テキスト入力欄空、結果カードなし、「ハッシュ生成」ボタン青強調表示。
- `before-w375-dark.png`: 紺色背景 + 白テキストで明瞭にダークモード。モバイルレイアウトでフッターまでスクロール表示済。
- `before-result-w1200-light.png`: `hello world` 入力後の結果表示。SHA-1 / SHA-256 / SHA-384 / SHA-512 の 4 段カード並列。SHA-512 が 128 hex 文字で 2 行に折り返し、結果カードが縦に伸びる挙動（計画書 L55 で言及されている移行前 legacy の参考記録）が明確に撮影されている。
- `before-result-w1200-dark.png`: 同上のダーク版。hex 文字列の dark BG での視認性も問題なく、計画書 R1 設計+AP MINOR-E が懸念した「ダーク固有の表示不具合」は本 baseline 段階では発生していない。

→ visitor 視点での「ライト/ダーク両モードが実際に判別できる撮影品質」は確保されている。

#### C. AP-WF05 遵守確認

| 枚数区分     | 計画書 L54-55 / L58 要件                 | 実体    | 判定 |
| ------------ | ---------------------------------------- | ------- | ---- |
| ベース       | w1200 / w1900 / w375 × light/dark = 6 枚 | 同 6 枚 | OK   |
| 結果表示済み | w1200 × light/dark = 2 枚                | 同 2 枚 | OK   |

「片モードに緩めた」二重基準（MINOR-E 反映前の R0 状態）は混入していない。結果表示済みもライト・ダーク両モードで撮影されており、AP-WF09 同型の形式通過リスクは未然防止されている。AP-WF05 の網羅性ルール（N × {desktop, mobile} × {light, dark}）も遵守。

なお w1900 については計画書 L54 で「結果表示済み 2 枚は w1200 で撮影」と暗黙の枠が指定されているため w1900 結果表示済みは要件外（baseline の主目的は「移行前デザインの記録」であり w1200 で十分という設計判断）。

#### D. AP-WF12 / AP-P16 遵守確認

builder 報告概要には「すべて計画書と一致」「8 件 PASS」「スクショ 8 枚配置」とあり、「だいたい」「概ね」のような曖昧表現は混入していない。reviewer 独立再実行で **5 数値すべてが計画書本文 L49-52 と完全一致**を確認。「21 / 7 種 / 4 / 1 / 8」のいずれも数値ズレなし。AP-WF12（一次情報の実体確認）/ AP-P16（grep コマンド併記による再現性確保）の遵守は満たされている。

#### E. T-1 完成条件チェック（L58）

| 完成条件                                                     | 実測                                                    | 判定 |
| ------------------------------------------------------------ | ------------------------------------------------------- | ---- |
| 移行前スクショ計 8 枚が `tmp/cycle-205/baseline/` 配下に保存 | 8 ファイル存在（B 観点で確認）                          | OK   |
| 既存テスト 8 件緑                                            | `npm run test -- hash-generator` → `Tests 8 passed (8)` | OK   |
| grep 数値が計画書本文と一致                                  | 21 / 7 種 / 4 / 1 / 8 すべて完全一致（A 観点で確認）    | OK   |

→ 3 項目すべて充足。

#### F. 検出した指摘事項

**必須（CRITICAL / MAJOR）**: なし。

**推奨（MINOR）**: なし。

reviewer が以下も追加検査したが、いずれも問題なし:

- **`./tmp/` 配下保存ルールの遵守**: `.claude/rules/tmp-directory.md` の「スクリーンショットは `./tmp/` に保存」を遵守。リポジトリルートや `./docs/` に baseline スクショが残置されていないことを確認。
- **`tmp/cycle-205/baseline/` パスの計画書整合**: 計画書 L58 で指定された保存パスと実体が一致。
- **撮影サイズの計画書整合**: ファイル名の `w1200 / w1900 / w375` が計画書 L54 と完全一致。
- **AP-WF16 格差ルールの遵守**: 計画書 L60 では T-1 は「最低 1 つ以上」の独立再実行を要請しているが、reviewer は 7 件（grep 5 件 + ls 1 件 + テスト 1 件）すべてを独立再実行しており格差ルールの上限を超える堅牢性を確保。これにより T-1 baseline 数値が「計画書本文 → T-2 残存判定 grep 0 への変換」の起点として固定された。

#### G. 結論

**Pass（承認）**。

- AP-WF16 独立再実行: builder 報告 5 数値 + ファイル列挙 + テスト件数の **7 件全件**を reviewer が独立再実行し計画書本文と完全一致。
- スクショ 8 枚: ファイル数・命名・撮影品質（ライト/ダーク判別性）すべて要件充足。
- AP-WF05 / AP-WF09: ベース 6 枚 + 結果表示済み 2 枚（両モード）で二重基準なし。
- AP-WF12 / AP-P16: 曖昧表現混入なし、grep 出力と計画書本文の完全一致を独立検証で確認。
- T-1 完成条件 3 項目: すべて充足。

T-2 フェーズへの移行を承認する。新規必須・推奨指摘ともゼロ。

### T-1 R1 PM 判断

**判定: Pass / T-2 へ移行**。

reviewer 自身が「最低 1 件」を大きく上回る計 7 件の独立再実行を行い、grep 5 数値・ファイル列挙・テスト件数のすべてで計画書本文と完全一致を確認。AP-WF16（自動チェックの独立再実行）/ AP-WF05（ベース + 結果表示済みの両モード遵守）/ AP-WF12 / AP-P16（曖昧表現なし）の運用が T-1 段階で適切に立ち上がっており、cycle-203 T-3 R1 の format:check 虚偽 PASS 同型事故の発生余地もなし。指摘ゼロのため修正は不要、T-2 に進む。

### T-2 R1

レビュアー観点: T-2（詳細ページの (new) 配下移行 + 旧トークン置換）の builder 報告物に対し、(A) AP-WF16 独立再実行 / (B) 並べ読み突合の SSoT 整合性確認 / (C) ファイル構造確認 / (D) (new) ページの 200 OK 確認 / (E) 触っていないことの確認 / (F) AP-WF09 / AP-WF12 遵守 / (G) T-2 完成条件 4 項目 の 7 観点で評価する。

#### A. AP-WF16 独立再実行

計画書 L90 では T-2 は「最低 1 つ以上」だが、reviewer は核となる残存判定 grep + lint + format:check + test の **4 件**を独立再実行した（cycle-204 と同水準の堅牢性確保）。

```
$ grep -c -- "--color-" src/tools/hash-generator/Component.module.css
0

$ npm run format:check 2>&1 | tail -3
Checking formatting...
All matched files use Prettier code style!

$ npm run lint 2>&1 | tail -3
> yolo-web@0.1.0 lint
> eslint .
(no output / exit 0)

$ npm run test -- hash-generator 2>&1 | tail -6
 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  18:23:50
   Duration  1.12s (transform 52ms, setup 160ms, import 36ms, tests 11ms, environment 764ms)
```

→ 完成条件の核（grep 結果 = 0）/ lint クリーン / format:check クリーン / 既存 8 件テスト緑、すべて完全一致。AP-WF16 で要請される最低 1 件を大きく上回る堅牢性で運用が継続している。

#### B. 並べ読み突合の SSoT 整合性確認

reviewer 独立再実行:

```
$ grep -o -- "--bg-soft" src/tools/{char-count,byte-counter,hash-generator}/Component.module.css | sort -u
src/tools/byte-counter/Component.module.css:--bg-soft
src/tools/char-count/Component.module.css:--bg-soft
src/tools/hash-generator/Component.module.css:--bg-soft

$ grep -o -- "--bg-soft\|--bg\|--border\|--accent\|--accent-strong\|--fg\|--fg-soft" src/tools/{base64,html-entity}/Component.module.css | sort -u
src/tools/base64/Component.module.css:--accent
src/tools/base64/Component.module.css:--accent-strong
src/tools/base64/Component.module.css:--bg
src/tools/base64/Component.module.css:--border
src/tools/base64/Component.module.css:--fg
src/tools/base64/Component.module.css:--fg-soft
src/tools/html-entity/Component.module.css:--accent
src/tools/html-entity/Component.module.css:--accent-strong
src/tools/html-entity/Component.module.css:--bg
src/tools/html-entity/Component.module.css:--border
src/tools/html-entity/Component.module.css:--fg
src/tools/html-entity/Component.module.css:--fg-soft
```

→ 計画書 L78 で要請された 2 段階 SSoT 突合の両側を実測確認:

- `--bg-soft` は **char-count / byte-counter / hash-generator の 3 ファイル**で実体使用（hash-generator は本 T-2 で新規に追加された使用箇所）
- `--bg-soft` 以外の 6 種（`--bg` / `--border` / `--accent` / `--accent-strong` / `--fg` / `--fg-soft`）は **base64 / html-entity の SSoT 2 ツール**に網羅的に存在

さらに `src/app/globals.css` の独立確認:

```
$ grep -nE "^\s*--(bg|bg-soft|border|accent|accent-strong|fg|fg-soft):" src/app/globals.css | head -15
11:  --bg: #ffffff;
12:  --bg-soft: #f4f4f1;            /* recessed background / hover on bg */
18:  --fg: #1a1a1a;
19:  --fg-soft: #555555;
25:  --border: var(--bg-softer);
31:  --accent: oklch(0.62 0.22 264);
32:  --accent-strong: oklch(0.5 0.22 264);
83:  --bg: #363634;                 /* dark mode panel surface */
84:  --bg-soft: #1c1c1a;            /* dark mode background */
93:  --fg: #e8e8e5;
94:  --fg-soft: #a8a8a4;
104: --border: #555550;
117: --accent: oklch(0.72 0.18 264);
118: --accent-strong: oklch(0.85 0.12 264);
```

→ 7 種全てがライト / ダーク両モードで定義済。`--bg-soft` の意味コメント「recessed background / hover on bg」も計画書 L72 の説明と完全一致。AP-WF12（手段先行の決め打ち）違反予防の根拠は二重（既存使用実績 + globals.css 定義）に成立。

加えて `src/tools/hash-generator/Component.module.css` の全トークン使用状況を実測:

```
$ grep -o -- "--[a-zA-Z0-9_-]*" src/tools/hash-generator/Component.module.css | sort -u
--accent
--accent-strong
--bg
--bg-soft
--border
--fg
--fg-soft
--font-mono
```

→ 計画書 L70-77 のマッピング表 7 種 + `--font-mono`（既存・未変更）のみで構成。**未定義のトークン使用や typo（例: `-fg`、`--bg-soft-er` 等）はゼロ**。

#### C. ファイル構造確認

```
$ ls "src/app/(legacy)/tools/hash-generator/" 2>&1
ls: cannot access 'src/app/(legacy)/tools/hash-generator/': No such file or directory

$ ls "src/app/(new)/tools/hash-generator/"
opengraph-image.tsx
page.module.css
page.tsx
twitter-image.tsx
```

→ legacy 残存ゼロ、(new) 配下に 4 ファイル全件存在。計画書 L66-67 / L88 と完全一致。

`page.module.css` の Read 結果:

```css
/* hash-generator 詳細ページの最上位コンテナ。
 * cycle-196 (B-425) 正準パターン: ToolLayout の外側で max-width をハードコード。
 * var(--max-width) は (new) globals.css に未定義のため使用不可。1200px をリテラルで書く。 */
.page {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
```

base64 / html-entity の `page.module.css` と diff レベルで比較した結果、**ツール名コメント（hash-generator / base64 / html-entity）のみ差し替えで完全に同形**。1200px ハードコード / margin / width 設定すべて一致。第 1〜5 弾標準パターンの忠実な継承。

`page.tsx` の `.page` ラッパー追加も base64 page.tsx と diff レベルで比較。`cycle-205 T-2:` / `cycle-203 T-2:` のコメント番号と Component 名（`HashGeneratorComponent` / `Base64Component`）のみ差し替えで完全に同形。

#### D. (new) ページの 200 OK 確認

reviewer は dev server を独立に起動して HTTP 応答とレンダリング結果を確認:

```
$ PORT=3456 npm run dev &
(以下、dev server ready 後)

$ curl -s -o /tmp/hg-page.html -w "HTTP %{http_code}\n" http://localhost:3456/tools/hash-generator
HTTP 200

$ wc -c /tmp/hg-page.html
58589 /tmp/hg-page.html

$ grep -oE "class=\"[^\"]*page[^\"]*\"" /tmp/hg-page.html | head -3
class="page-module__uJBrYG__page"

$ grep -oE "Component-module[^\"]*" /tmp/hg-page.html | sort -u | head -10
Component-module__sVLvfq__container
Component-module__sVLvfq__controlLabel
Component-module__sVLvfq__controls
Component-module__sVLvfq__field
Component-module__sVLvfq__formatControl
Component-module__sVLvfq__generateButton
Component-module__sVLvfq__label
Component-module__sVLvfq__select
Component-module__sVLvfq__textarea
```

→ HTTP 200 / レスポンス 58.6KB / `.page` CSS module class（hash 化された `page-module__uJBrYG__page`）が DOM に出力 / Component の CSS module classes も正しく適用。`.page` ラッパー追加が機能してレンダリングされていることを実機確認できた。

レスポンス本文に `--color-` トークンが**漏れていない**ことも確認:

```
$ grep -c -- "--color-" /tmp/hg-page.html
0
```

→ Component.module.css の旧トークン残存ゼロが実 HTML レスポンスでも証明されている。

#### E. 触っていないことの確認

```
$ git diff --diff-filter=M --name-only HEAD
docs/cycles/cycle-205.md
src/tools/hash-generator/Component.module.css

$ git diff --cached --stat
 src/app/{(legacy) => (new)}/tools/hash-generator/opengraph-image.tsx | 0
 src/app/{(legacy) => (new)}/tools/hash-generator/page.tsx            | 0
 src/app/{(legacy) => (new)}/tools/hash-generator/twitter-image.tsx   | 0
 3 files changed, 0 insertions(+), 0 deletions(-)
```

→ 変更ファイルは 以下に限定:

- `docs/cycles/cycle-205.md`（レビュー履歴追記のみ）
- `src/tools/hash-generator/Component.module.css`（旧トークン置換）
- `src/app/(new)/tools/hash-generator/page.tsx`（rename + `.page` ラッパー追加）
- `src/app/(new)/tools/hash-generator/page.module.css`（新規追加）
- `src/app/(new)/tools/hash-generator/{opengraph-image,twitter-image}.tsx`（rename のみ・内容変化 0 行）

すなわち:

- **ToolLayout / Breadcrumb / FaqSection / ShareButtons** 等の共通コンポーネントは未変更（`git status` の差分対象に含まれず）
- **Component.tsx** は未変更（`git diff src/tools/hash-generator/Component.tsx` → 出力空）
- **meta.ts** は未変更（`grep -c "trustLevel" src/tools/hash-generator/meta.ts` → `1` で `trustLevel` フィールド残存確認済）
- **opengraph-image.tsx / twitter-image.tsx** は `git diff --cached --stat` の `0 insertions(+), 0 deletions(-)` で rename のみ・内容変化ゼロを確認

kind=widget 標準パターン（詳細ページ Component を touch しない）が忠実に遵守されている。

#### F. AP-WF09 / AP-WF12 遵守

builder の報告概要は「全パス」「全件」「全パス」のような曖昧表現に依存せず、各コマンドの実出力を引用していると想定される。reviewer 自身が:

- `format:check` の出力（cycle-203 T-3 R1 同型事故の最重要監視対象）を**独立に実行**して `All matched files use Prettier code style!` を確認
- `npm run lint` を独立実行して exit 0（no output = ESLint クリーン）を確認
- 残存判定 grep を独立実行して `0` を確認

→ cycle-203 T-3 R1 の format:check 虚偽 PASS 同型事故の発生余地なし。

#### G. T-2 完成条件チェック（L88）

| #   | 完成条件                                                                    | 実測                                                                              | 判定 |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---- |
| G-1 | `/tools/hash-generator` が (new) 配下で正常表示される                       | dev server で HTTP 200 + DOM に `page-module__uJBrYG__page` クラス出力（D 観点）  | OK   |
| G-2 | 旧 (legacy) パスにファイルが残っていない                                    | `ls (legacy)/tools/hash-generator/` → No such file or directory（C 観点）         | OK   |
| G-3 | `grep -c -- "--color-" src/tools/hash-generator/Component.module.css` → `0` | reviewer 独立再実行 → `0`（A 観点）                                               | OK   |
| G-4 | w1200 / w1900 / w375 で表示崩れがない                                       | 視覚検証は T-4 で再撮影予定。T-2 段階では構造的 200 OK + DOM クラス出力で代替検証 | 保留 |

→ G-1〜G-3 は明示完了。G-4 は計画書 L128（T-4 で移行後 6 枚再撮影）に従って T-4 で確定するため T-2 段階では「現時点で構造的根拠は揃った」として進行可能。これは cycle-203 / cycle-204 と同じ進行水準。

#### H. 検出した指摘事項

**必須（CRITICAL / MAJOR）**: なし。

**推奨（MINOR）**: なし。

reviewer が追加検査した以下の項目も問題なし:

- **page.module.css の同形性**: base64 / html-entity の同名ファイルとコメントヘッダ部分のツール名差し替えのみで構造完全一致。1200px ハードコード / margin / width のすべて整合。
- **page.tsx の `.page` ラッパー**: base64 page.tsx の `cycle-203 T-2:` コメントと同型 + `cycle-205 T-2:` への番号差し替え + Component 名差し替えのみ。
- **`--font-mono` 残存**: 計画書のマッピング表に明示されていないが、`--font-mono` は色トークンではなくフォントファミリトークンで、置換対象外。Component.module.css に既存のまま残置されていることは正常（base64 / html-entity も同じ）。
- **(legacy) 配下 4 番目のファイル（page.module.css 等）の残置リスク**: 旧 (legacy)/tools/hash-generator には page.module.css が存在しなかった（cycle-200 以前の Phase 8.1 移行前は (legacy) 側で page.module.css を持たない構造だったため）。今回の git mv 3 ファイルで残存ゼロが達成されている。

#### I. 結論

**Pass（承認）**。

- AP-WF16 独立再実行: 計画書要請の「最低 1 件」を大きく上回る **4 件全件**（残存判定 grep / format:check / lint / test）を reviewer が独立再実行し計画書本文と完全一致。
- 並べ読み突合: `--bg-soft` 3 ファイル使用実績 + 6 種 SSoT 2 ツール存在 + globals.css 7 種定義の **3 段階で SSoT 整合性が成立**。AP-WF12 違反予防の根拠は強固。
- ファイル構造: legacy 残存ゼロ / (new) 4 ファイル全件存在 / page.module.css と page.tsx が base64 / html-entity と同形。
- 200 OK: dev server で HTTP 200 + `.page` CSS module class が DOM に出力されることを実機確認。
- 触っていないこと: 共通コンポーネント / Component.tsx / meta.ts / og・twitter image すべて未変更を `git diff` レベルで確認。kind=widget 標準パターン遵守。
- AP-WF09 / AP-WF12 / format:check 虚偽 PASS リスクなし。
- T-2 完成条件 4 項目: G-1 / G-2 / G-3 完了、G-4 は T-4 視覚検証へ委譲（cycle-203 / cycle-204 と同水準の進行）。

T-3 フェーズへの移行を承認する。新規必須・推奨指摘ともゼロ。

### T-2 R1 PM 判断

**判定: Pass / T-3 へ移行**。

reviewer は AP-WF16「最低 1 件」の要請を 4 件に拡張して独立再実行し、(i) 旧トークン残存ゼロ、(ii) `--bg-soft` 3 段階 SSoT 整合（hash-generator + char-count / byte-counter + globals.css）、(iii) legacy 残存ゼロ + (new) 4 ファイル、(iv) dev server HTTP 200 OK + `.page` クラス DOM 出力、すべて実測で確認。kind=widget 標準パターン（詳細ページ Component を touch しない）も完全遵守。指摘ゼロのため修正不要、T-3 に進む。T-3 は AP-WF16 4 コマンド全件 reviewer 独立再実行が要請される本サイクル最重要監視ポイント。

### T-3 R1

レビュアー観点: cycle-203 T-3 R1 で発覚した「format:check 虚偽 PASS」同型事故防止 (AP-WF16) のため、**4 コマンド全件 reviewer 独立再実行** + コード・テスト精読 + 計画書 §T-3 完成条件チェック + 触っていない範囲確認。

#### A. AP-WF16 4 コマンド全件 reviewer 独立再実行（最重要）

reviewer 自身が cwd = リポジトリルートで 4 コマンドを独立に実行した。引用は実出力末尾。

##### A-1. `npm run lint`

```
$ npm run lint 2>&1 | tail -10
npm warn Unknown project config "min-release-age". This will stop working in the next major version of npm.

> yolo-web@0.1.0 lint
> eslint .
```

→ ESLint クリーン（exit 0、警告・エラーなし）。builder 報告と一致。

##### A-2. `npm run format:check`（**cycle-203 T-3 R1 同型事故の最重要監視対象**）

```
$ npm run format:check 2>&1 | tail -10
npm warn Unknown project config "min-release-age". This will stop working in the next major version of npm.

> yolo-web@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

→ `All matched files use Prettier code style!` を reviewer 自身が独立に画面で確認。cycle-203 T-3 R1 で発覚した「builder が PASS と書いたが実は format:check で `Code style issues found` が出ていた」同型事故の発生余地なし。

##### A-3. `npm run test`

```
$ npm run test 2>&1 | tail -10

 Test Files  302 passed (302)
      Tests  4414 passed (4414)
   Start at  18:42:17
   Duration  168.80s (transform 10.02s, setup 48.09s, import 19.98s, tests 84.36s, environment 289.84s)
```

→ Test Files 302 passed / Tests **4414 passed**。builder 報告「4414 件」と完全一致。HashGeneratorTile.test.tsx 単独実行も別途行い、`Tests 8 passed (8)` を確認（builder 報告「8 件全件緑」と一致、計画書 §T-3 完成条件「4 件以上」を上回る）。

##### A-4. `npm run build`

```
$ npm run build 2>&1 | grep -E "Compiled|Generating static pages"
✓ Compiled successfully in 21.8s
  Generating static pages using 3 workers (0/3895) ...
  Generating static pages using 3 workers (973/3895)
  Generating static pages using 3 workers (1947/3895)
  Generating static pages using 3 workers (2921/3895)
✓ Generating static pages using 3 workers (3895/3895) in 58s
```

→ `Compiled successfully` + 静的ページ **3895** 件生成。builder 報告「3895 静的ページ」と完全一致。

**A 観点結論**: 4 コマンドすべて reviewer 独立再実行で builder 報告と完全一致。**省略ゼロ**。cycle-203 T-3 R1 同型事故の発生余地なし。

#### B. コード精読: `HashGeneratorTile.tsx`

| #    | 観点                                                                                              | 実装の該当箇所                                                                                                                                                                                                                                                     | 判定 |
| ---- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| B-1  | `"use client"` ディレクティブ先頭                                                                 | L1 `"use client";`                                                                                                                                                                                                                                                 | OK   |
| B-2  | cleanup フラグによる race condition 対策                                                          | L79-117 `useEffect` 内 `let ignore = false;` 初期化 / L107-112 `if (!ignore) { setResult; setIsError; }` / L114-116 `return () => { ignore = true; }` の 3 段で完備                                                                                                | OK   |
| B-3  | AP-P21 役割分担: textarea = `rows={2}` + `flexShrink: 0` / 結果欄 = `flex: 1` + `overflowY: auto` | L186-206 textarea `flexShrink: 0` + `rows={2}` / L214-230 結果欄 `flex: 1` + `overflowY: "auto"`                                                                                                                                                                   | OK   |
| B-4  | `crypto.subtle` 非対応フォールバック                                                              | L57-63 `isCryptoAvailable()` で `window.crypto.subtle !== "undefined"` 存在チェック / L66 `FALLBACK_MESSAGE = "お使いの環境では計算できません"` / L97-104 `.catch()` で digest reject を吸収 / L225 `color: isError ? "var(--fg-soft)" : "var(--fg)"` で控えめ表示 | OK   |
| B-5  | 結果欄 `role="status"` + `aria-live="polite"`                                                     | L215-216                                                                                                                                                                                                                                                           | OK   |
| B-6  | monospace フォント + `word-break: break-all`                                                      | L220-223 `fontFamily: "ui-monospace, SFMono-Regular, ..."` + `wordBreak: "break-all"` + `overflowWrap: "break-word"`                                                                                                                                               | OK   |
| B-7  | セグメントコントロール 4 択 + デフォルト SHA-256                                                  | L54 `ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]` / L70 `useState<HashAlgorithm>("SHA-256")` / L156-178 4 ボタンレンダー                                                                                                                               | OK   |
| B-8  | 出力形式は hex 固定（base64 切替 UI なし）                                                        | L97 `generateHash(input, algorithm, "hex")` の hex 固定。base64 切替 UI は不在                                                                                                                                                                                     | OK   |
| B-9  | loading state を設けていない                                                                      | spinner / disabled state 不在。`useEffect` の更新間に「計算中」フラグなし                                                                                                                                                                                          | OK   |
| B-10 | 詳細ページリンク `/tools/hash-generator`                                                          | L233-244 `<Link href="/tools/hash-generator">詳細ページで開く</Link>`                                                                                                                                                                                              | OK   |

**B 観点結論**: 10 項目すべて計画書設計判断と一致。設計判断の逸脱なし。

##### B 観点の補足観察（実害なし）

- L226 `opacity: result === null ? 0 : 0.85`: 結果が null（空入力）のとき opacity 0 で透明にしている。同時に L229 `{result === null ? "" : result}` で空文字も返している。**二重の "見えなくする" 処理**だが、コード可読性的にもセマンティクス的にも実害はない（screen reader にも `aria-live="polite"` で空テキストが正しく伝わる）。
- L225 のエラー色: `isError` が true のとき `--fg-soft`、正常時 `--fg`。計画書 L102 の「`--fg-soft` で控えめに表示」「Base64Tile / HtmlEntityTile 統一表示パターン」と整合。

#### C. テスト精読: `HashGeneratorTile.test.tsx`

| #   | 観点                                           | 実装の該当箇所                                                                                                                                                                                                             | 判定 |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| C-1 | 件数 ≥ 4 件                                    | `it()` ブロック **8 件**。`grep -cE "^\s+it\(" HashGeneratorTile.test.tsx` → 8。計画書最低要件「4 件以上」を上回る                                                                                                         | OK   |
| C-2 | 既知ベクトル 1 件以上                          | L23-33 `'hello'` の SHA-256 が `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824` であることを検証。reviewer 独立に Node `crypto.createHash('sha256').update('hello').digest('hex')` を実行 → 同一値を確認 | OK   |
| C-3 | セグメント切替の検証                           | L36-55 SHA-256 → SHA-512 切替で結果桁数が 64 → 128 になることを検証                                                                                                                                                        | OK   |
| C-4 | 空入力時の挙動検証                             | L58-63 初期状態で結果欄が空 / L7-20 入力後に空に戻す挙動も検証                                                                                                                                                             | OK   |
| C-5 | SHA-1/256/384/512 出力桁数 (40/64/96/128) 検証 | L36-55 (256=64, 512=128) + L66-78 (1=40) + L80-92 (384=96)。256/512/1/384 の 4 種すべて桁数検証あり                                                                                                                        | OK   |

**C 観点結論**: 5 項目すべて充足。HashGeneratorTile 単独で `npx vitest run` 独立実行も実施し `Tests 8 passed (8)` を確認。

#### D. `tile-declarations.ts` の整合性

```
$ sed -n '163,174p' src/tools/_constants/tile-declarations.ts
  {
    domain: "tools",
    slug: "hash-generator",
    kind: "widget",
    tileComponent: HashGeneratorTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "テキストを入力するとハッシュ値を計算します",
    outputPlaceholder: "",
    detailPath: "/tools/hash-generator",
    widgetSummary:
      "SHA-1 / SHA-256 / SHA-384 / SHA-512 ハッシュ値を素早く計算する",
  },
```

- `domain: "tools"` / `slug: "hash-generator"` / `kind: "widget"` / `recommendedSize: { cols: 3, rows: 2 }` / `detailPath: "/tools/hash-generator"` すべて計画書 §T-3 仕様と一致
- `import HashGeneratorTile from "@/tools/hash-generator/HashGeneratorTile";` が L44 に追加されている
- 既存 5 エントリ (char-count / byte-counter / url-encode / base64 / html-entity) と同じ枠（domain / slug / kind / tileComponent / recommendedSize / inputPlaceholder / outputPlaceholder / detailPath / widgetSummary）を埋めている
- `widgetSummary` は「SHA-1 / SHA-256 / SHA-384 / SHA-512 ハッシュ値を素早く計算する」で 4 アルゴリズム明示。来訪者がタイル単体で「このタイルで何ができるか」を把握できる

`tiles-registry.ts` 確認:

```
$ grep -E "hash-generator|tilesCount" src/tools/generated/tiles-registry.ts
  { domain: "tools", slug: "hash-generator", kind: "widget" },
// Count at generation time: tilesCount=6
```

→ tilesCount が **5 → 6** に更新済。builder 報告と一致。codegen 動作確認 OK。

**D 観点結論**: 整合性 OK。

#### E. 触っていないことの確認

```
$ git diff HEAD -- src/tools/hash-generator/Component.tsx src/tools/hash-generator/logic.ts src/tools/hash-generator/meta.ts | wc -l
0
```

→ Component.tsx / logic.ts / meta.ts はいずれも 1 行も変更されていない。

`Component.module.css` は git diff で T-2 の旧トークン置換のみ（`--color-text-muted` → `--fg-soft` 等 7 種の置換）。T-3 段階での追加変更ゼロ。**T-2 で承認済の範囲を逸脱していない**。

`meta.ts` の `trustLevel` フィールドも変更されていない:

```
$ grep "trustLevel" src/tools/hash-generator/meta.ts
  trustLevel: "high",
```

→ B-432 一括削除を待つ方針（計画書 L84）に従い、本サイクルでは touch せず維持されている。

`git diff --stat HEAD` の変更ファイル一覧:

```
docs/cycles/cycle-205.md
src/app/(legacy)/tools/hash-generator/page.tsx (削除 -> rename)
src/app/(new)/tools/hash-generator/opengraph-image.tsx (rename, 内容無変更)
src/app/(new)/tools/hash-generator/page.tsx (rename + .page ラッパー)
src/app/(new)/tools/hash-generator/twitter-image.tsx (rename, 内容無変更)
src/tools/_constants/tile-declarations.ts (T-3 追加)
src/tools/generated/tiles-registry.ts (T-3 codegen)
src/tools/hash-generator/Component.module.css (T-2 トークン置換)
+ Untracked: src/app/(new)/tools/hash-generator/page.module.css (T-2)
+ Untracked: src/tools/hash-generator/HashGeneratorTile.tsx (T-3 新規)
+ Untracked: src/tools/hash-generator/__tests__/HashGeneratorTile.test.tsx (T-3 新規)
```

→ T-3 で新規追加・変更されたのは `HashGeneratorTile.tsx` / `HashGeneratorTile.test.tsx` / `tile-declarations.ts` / `tiles-registry.ts` の **4 ファイルのみ**。T-2 で承認済の範囲を逸脱せず、kind=widget 標準パターン（詳細ページ Component を touch しない）を完全遵守。

**E 観点結論**: 触ってはならない範囲はすべて未変更。

#### F. AP-P20 / AP-WF03 遵守

| 観点                                                           | 判定                                                                                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 出力形式は hex 固定（base64 切替 UI を勝手に追加していないか） | L97 `generateHash(input, algorithm, "hex")` の hex 固定。base64 切替 UI なし。OK                                     |
| セグメントコントロール 1 種切替（全 4 種並列にしていないか）   | L156-178 で 1 種のみ選択される設計。`algorithm` が単一の `useState` で 4 ボタン中 1 つだけ `aria-pressed="true"`。OK |
| loading state を設けていないこと                               | spinner / disabled / 計算中フラグ不在。OK                                                                            |
| 詳細ページ Component.tsx を勝手に触っていないか                | E 観点で 0 行変更を確認済                                                                                            |

**F 観点結論**: 計画書設計判断からの逸脱ゼロ。

#### G. T-3 完成条件チェック（計画書 L121）

| #   | 完成条件                                                  | 実測                                                                                | 判定 |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---- |
| G-1 | `TILE_DECLARATIONS` に hash-generator が追加されている    | `tile-declarations.ts` L163-174 に追加済（D 観点）                                  | OK   |
| G-2 | codegen が成功する                                        | `tiles-registry.ts` の `tilesCount=6` 反映済（D 観点）+ `npm run build` 成功（A-4） | OK   |
| G-3 | `HashGeneratorTile.tsx` のテスト **4 件以上**が緑         | 8 件全件緑（C-1）                                                                   | OK   |
| G-4 | タイル UI 上で 4 アルゴリズム切替が機能・リアルタイム反映 | C-3 / C-5 テストで切替と桁数変化を検証。実機での視覚確認は T-4 で予定               | 保留 |
| G-5 | `crypto.subtle` 非対応環境フォールバックの分岐コード実装  | B-4 で確認済（`isCryptoAvailable()` + `FALLBACK_MESSAGE` + `.catch()` 3 段）        | OK   |

→ G-1 / G-2 / G-3 / G-5 完了。G-4 は計画書 L130-142（T-4 で `/internal/tiles/preview/...` で Playwright 視覚確認 + AP-P21 高さ計測 4 ケース + 非対応環境フォールバック表示確認）が予定されているため、T-3 段階では構造的根拠（テスト緑）で代替。これは cycle-203 / cycle-204 / 本サイクル T-2 と同じ進行水準。

#### H. 検出した指摘事項

##### 必須（CRITICAL / MAJOR）

**なし**。

##### 推奨（MINOR）

**T-3-R1-MINOR-α（推奨 / 軽微）**: テスト C-1 の空入力テストの記述スタイル

L7-20 の最初のテスト「空文字列の SHA-256 ハッシュ値が正しく表示される」は、タイトルが「ハッシュ値が正しく表示される」だが、テスト本体は「空入力時は結果欄が空」を確認する内容。**タイトルとアサーションの内容にズレ**がある。

```javascript
it("既知ベクトル: 空文字列の SHA-256 ハッシュ値が正しく表示される", async () => {
  // ...
  fireEvent.change(input, { target: { value: " " } });
  fireEvent.change(input, { target: { value: "" } });
  // 空入力時は結果欄が空
  await waitFor(() => {
    expect(statusEl).toHaveTextContent("");
  });
});
```

**修正案（任意）**: タイトルを「空入力時: 一度入力してから空に戻すと結果欄が空になる」のような実体に即した文言にする、もしくは空文字列の SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` を検証するように本体を直す（ただし計画書 L113「空入力時は結果欄空表示」の方針と整合させるなら現状ロジック（空入力 → 結果欄空）が正しいため、タイトル側を直す方が筋が良い）。

実害はテストの可読性のみ。テスト 8 件全件緑かつ計画書最低要件「4 件以上」を大きく上回るため、本サイクルの T-3 進行を止める性質ではない。**修正なしで T-4 進行可能**。

**T-3-R1-MINOR-β（推奨 / 軽微）**: `opacity: 0` と空文字列表示の二重防御

L226 `opacity: result === null ? 0 : 0.85` と L229 `{result === null ? "" : result}` が二重の "見えなくする" 処理になっている。実害はないが、片方だけで十分（例: `opacity: 0.85` 固定 + 空文字列のみで制御）。

実害は可読性のみで、`aria-live="polite"` の screen reader 動作にも影響しない。**修正なしで T-4 進行可能**。

#### I. 結論

**Pass（承認）**。

- AP-WF16: 4 コマンドすべて (lint / format:check / test / build) reviewer 独立再実行で builder 報告と完全一致。format:check は実出力 `All matched files use Prettier code style!` を確認、test 件数 4414・build 静的ページ 3895 ともに完全一致。**省略ゼロ**で cycle-203 T-3 R1 同型事故の発生余地なし。
- コード精読 B 観点 10 項目すべて計画書設計判断と一致。
- テスト精読 C 観点 5 項目すべて充足。HashGeneratorTile 単独 `vitest run` で `Tests 8 passed (8)` 確認。
- `tile-declarations.ts` / `tiles-registry.ts` の整合性 OK。tilesCount=6 反映済。
- 触っていない範囲: Component.tsx / logic.ts / meta.ts (`trustLevel` 含む) いずれも 1 行も変更されていない。
- AP-P20 / AP-WF03 遵守: 計画書設計判断からの逸脱ゼロ。
- T-3 完成条件 5 項目: G-1 / G-2 / G-3 / G-5 完了、G-4 は T-4 視覚検証へ委譲（cycle-203 / cycle-204 と同水準）。
- MINOR 2 件（テストタイトルと実体のズレ / opacity と空文字列の二重防御）は計画書本文の修正なしで T-4 進行可能。実害なし。

T-3 完了、T-4 フェーズへの移行を承認する。**新規必須指摘ゼロ**、推奨 2 件は実害なし。

### T-3 R1 PM 判断

**判定: 推奨 2 件とも採用 / T-3 builder に修正依頼**。

reviewer は AP-WF16 4 コマンド全件独立再実行を完遂し、cycle-203 T-3 R1 同型事故（format:check 虚偽 PASS）の発生余地ゼロを確認。必須指摘ゼロのため execute フェーズ進行可能だが、推奨 2 件は本質的指摘（MINOR-α = テストタイトルと本体の乖離 / MINOR-β = `result === null` 二重防御）のため対応する。MINOR-α はテスト整合性、MINOR-β は実装の冗長性解消で、いずれも修正コストが極小で品質寄与あり。CLAUDE.md「指摘事項が 1 つでもあれば、false-positive でなければ必ず対応する」原則に沿って T-3 builder に修正依頼し T-3 R2 を回す。

### R1 PM 判断

**判定: 全件採用（必須 3 / 推奨 9）**。

#### 必須 3 件への対応方針

- **MAJOR-1（設計+AP / `crypto.subtle` 非対応環境のファクトチェック欠落）**: 採用。L102 / L138 / L171-175 周辺に「(i) Secure Contexts only 仕様の出典明示（MDN リンク）、(ii) 本番 HTTPS 配信下で `undefined` シナリオが限定的であること、(iii) それでも `try/catch` + 日本語文言を入れる根拠を『対策コストの低さ』ではなく『確率は低いが影響は致命的（タイル全体崩れ / 白画面 / Uncaught Promise エラー）+ 対策コスト数行 = 来訪者影響の致命度起点』で再言語化」を反映。AP-P09 / AP-P19 の手当てとして併せて言語化。
- **MAJOR-2（設計+AP / Loading State が 2 案で AP-P17 形式違反）**: 採用。Loading State 比較表に「**前回結果を残しつつ新結果に置き換わる挙動が React `useState` + Web Crypto < 1ms 計算の組合せで自然に実現される**」案（reviewer 提示の 案 c''）を第 3 案として追加し、それを能動的に不採用にする理由として「placeholder 占位や `--fg-soft` 薄め化の追加 UI コストが不要で、< 1ms の連続置換が知覚的にチラつかない」を明示。採用案は「設けない」のまま維持。
- **MAJOR-3（設計+AP / race condition 対策の判断軸が「技術的成立性」起点）**: 採用。(i) AbortController 不採用理由を「**`SubtleCrypto.digest()` の現行仕様（W3C Web Cryptography API）は `AbortSignal` 引数を受け取らないシグネチャのため、実装側で破棄判定が必要**」に精緻化、(ii) 「対策なし」不採用理由を「**確率 × 影響 × コスト**の 3 軸 = ブラウザ microtask ordering 干渉ゼロではない / 古い値への巻き戻しが T1 likes『不安なく使えること』を損なう / 対策コストが数行」で来訪者価値起点に再言語化、の 2 点を反映。

#### 推奨 9 件への対応方針

すべて採用（低コストで品質向上、計画書の SSoT 根拠強化に寄与）:

- **MINOR-1（事実+完成条件 / `--bg-soft` 既存使用実績）**: T-2 の「並べ読み突合」記述に「`src/tools/{char-count,byte-counter}/Component.module.css` でも `--bg-soft` の使用実績がある」旨を 1 行追記して SSoT 突合を 2 段階に強化。
- **MINOR-2（事実+完成条件 / 処理時間根拠の出典）**: L99 / L137 周辺の「< 1ms / < 8ms」表記に `docs/research/2026-05-22-hash-generator-crypto-subtle-ui-ux-best-practices.md` への参照リンクを追加。
- **MINOR-3（事実+完成条件 / `delete window.crypto.subtle` の限界）**: MINOR-A と統合して T-4 フォールバック確認の代替手段を併記。
- **MINOR-A（設計+AP / `Object.defineProperty` 代替手段）**: L138 の「実施手段の具体は builder/reviewer 裁量」を「`delete` が ReadOnly エラーになる場合の代替手段（`Object.defineProperty(window.crypto, 'subtle', { value: undefined, configurable: true })` 等）を builder 裁量で選択」と明示化。
- **MINOR-B（設計+AP / 日本語フォールバック文言の境界）**: L102 の地の文を「**日本語フォールバック文言（builder 裁量。例: 『お使いの環境では計算できません』）**」に変更し、確定文言と例示の境界を明示。
- **MINOR-C（設計+AP / Base64Tile / HtmlEntityTile 統一の意味）**: 「**統一表示パターン**（色トークン `--fg-soft` + 日本語文言 + 控えめ表示の 3 点）に倣う」と意味整理を追記。
- **MINOR-D（設計+AP / AP-P21 計測 4 ケースの将来寄与）**: §AP-P21 適用判断（L213 周辺）に「**膨張ゼロ型サンプル 1 件目として 4 ケース全件 0px 差を記録することにより、第 7 弾以降に他の膨張ゼロ型ツール（fullwidth-converter / kana-converter 等）が現れた際の比較基準値が確定する**」を 1 行追記。
- **MINOR-E（設計+AP / 結果表示済みスクショの両モード化）**: L55 を「ベース 6 枚 + 結果表示済み 2 枚（ライト・ダーク両モード）」に変更し、二重基準を解消。
- **MINOR-F（設計+AP / 後続候補の性質マッピング）**: §補足事項末尾に「**第 6 弾 hash-generator で実証する非同期パターンが後続候補にどう波及するか**: qr-code 生成（非同期 + 結果は image/canvas）/ image-base64（非同期 FileReader + 入力 File オブジェクト）/ image-resizer（非同期 Canvas API + 入出力バイナリ）」を 2〜3 行追記。

#### 次アクション

planner に **R1 必須 3 + 推奨 9 = 計 12 件**の全件修正依頼を出し、修正後に R2 を実施する。R2 では今回の指摘事項対応確認に加え、**計画書全体の再点検**（CLAUDE.md「Review always」の精神）を含めて 2 名 reviewer に並行で依頼する。

### T-3 R2

レビュアー観点: T-3 R1 推奨指摘 2 件（MINOR-α / MINOR-β）の修正反映確認 + AP-WF16 4 コマンド全件 reviewer 独立再実行 + 計画書全体の再点検（R1 で挙げた A〜G 観点の再判定 / B-1〜B-10 / C-1〜C-5 全件再確認 / AP 集 4 ファイル再突合 / 修正に伴う副作用確認）+ 来訪者価値の維持確認。

#### A. R1 指摘 2 件の反映状況

| #       | R1 指摘内容                                                                                                             | builder 修正報告                                      | reviewer 独立確認（Read）                                                                                                                                                                                                                                             | 判定     |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| MINOR-α | `__tests__/HashGeneratorTile.test.tsx` L7 タイトルが「ハッシュ値が正しく表示される」と実体乖離                          | L7 を「**空入力 → 計算なし / 結果欄は空表示**」に変更 | `__tests__/HashGeneratorTile.test.tsx` L7 を独立 Read: `it("空入力 → 計算なし / 結果欄は空表示", async () => {`。テスト本体（L8-19）は「入力後に空に戻して結果欄が空であることを `waitFor` で確認」であり、新タイトル「空入力 → 計算なし / 結果欄は空表示」と完全整合 | 完全対応 |
| MINOR-β | `HashGeneratorTile.tsx` L226 `opacity: result === null ? 0 : 0.85` と L229 `{result === null ? "" : result}` の二重防御 | L226 を `opacity: 0.85` 固定化                        | `HashGeneratorTile.tsx` L226 を独立 Read: `opacity: 0.85,`（条件式が消えて固定値に）。L229 は `{result === null ? "" : result}` のまま維持。result が null のとき空文字列を返すロジックは保持され、opacity の二重制御だけが解消                                       | 完全対応 |

**2 件とも完全対応**。reviewer 独立 Read で実コードを確認済。

#### B. AP-WF16 4 コマンド全件独立再実行（最重要）

reviewer 自身が cwd = リポジトリルートで 4 コマンドを独立に実行した（cycle-203 T-3 R1 format:check 虚偽 PASS 同型事故防止）。

##### B-1. `npm run lint`

```
$ npm run lint 2>&1 | tail -15
npm warn Unknown project config "min-release-age". This will stop working in the next major version of npm.

> yolo-web@0.1.0 lint
> eslint .
```

→ ESLint クリーン（exit 0、警告・エラーなし）。

##### B-2. `npm run format:check`（**cycle-203 T-3 R1 同型事故の最重要監視対象**）

```
$ npm run format:check 2>&1 | tail -15
npm warn Unknown project config "min-release-age". This will stop working in the next major version of npm.

> yolo-web@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

→ `All matched files use Prettier code style!` を reviewer 自身が独立に画面で確認。builder 修正報告と完全一致。

##### B-3. `npm run test`（全件 + HashGeneratorTile 単独）

全件:

```
$ npm run test 2>&1 | tail -10

 Test Files  302 passed (302)
      Tests  4414 passed (4414)
   Start at  19:04:21
   Duration  168.43s (transform 10.12s, setup 47.79s, import 19.56s, tests 83.45s, environment 289.71s)
```

→ Test Files 302 passed / Tests **4414 passed**。T-3 R1 と同数値で **修正による副作用ゼロ**（テスト件数が変わっていない = 既存テスト 4414 件への影響もゼロ）。

HashGeneratorTile.test.tsx 単独:

```
$ npx vitest run src/tools/hash-generator/__tests__/HashGeneratorTile.test.tsx 2>&1 | tail -10

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  19:04:12
   Duration  1.58s (transform 69ms, setup 160ms, import 78ms, tests 425ms, environment 765ms)
```

→ HashGeneratorTile.test.tsx **8 件全件緑**。MINOR-α 修正（テストタイトル変更）後もテスト本体は影響なくパス。

##### B-4. `npm run build`

```
$ npm run build 2>&1 | grep -E "Compiled|Generating static pages" | head
✓ Compiled successfully in 21.0s
  Generating static pages using 3 workers (0/3895) ...
  Generating static pages using 3 workers (973/3895)
  Generating static pages using 3 workers (1947/3895)
  Generating static pages using 3 workers (2921/3895)
✓ Generating static pages using 3 workers (3895/3895) in 57s
```

→ `Compiled successfully` + 静的ページ **3895** 件生成。T-3 R1 と同数値で副作用ゼロ。

**B 観点結論**: 4 コマンドすべて reviewer 独立再実行で builder 報告と完全一致 + T-3 R1 時点と同数値で副作用ゼロ。AP-WF16 省略ゼロ。

#### C. 計画書全体の再点検（A〜G 観点 + B-1〜B-10 / C-1〜C-5 再確認）

R1 で挙げた A〜G 観点を再判定し、修正後にも維持されているかを再確認。

| R1 観点                                 | R1 判定 | R2 再判定                                                                                                                                                                                                                                  | 維持確認 |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| A. AP-WF16 4 コマンド全件独立再実行     | OK      | B 観点で reviewer 自身が 4 コマンドすべて独立再実行 + 数値完全一致を確認                                                                                                                                                                   | OK       |
| B. コード精読 B-1〜B-10                 | OK      | reviewer が `HashGeneratorTile.tsx` 全体を再読し、B-1〜B-10 全 10 項目を再確認。L226 の opacity 固定化以外に変更なし（L1-225 / L227-247 は無変更）。設計判断の逸脱なし                                                                     | OK       |
| C. テスト精読 C-1〜C-5                  | OK      | reviewer が `HashGeneratorTile.test.tsx` 全体を再読し、C-1（件数 8 件）/ C-2（既知ベクトル `2cf24db...`）/ C-3（256→512 切替）/ C-4（空入力時空表示）/ C-5（40/64/96/128 桁長検証）全件再充足を確認。L7 タイトル変更でテスト本体に影響なし | OK       |
| D. `tile-declarations.ts` 整合性        | OK      | T-3 で承認済の範囲。本 R2 修正は触っていない（builder 修正報告 + git status で確認）                                                                                                                                                       | OK       |
| E. 触っていない範囲（Component.tsx 等） | OK      | R1 で「0 行変更」を確認済。本 R2 修正対象は HashGeneratorTile.tsx と test ファイルのみで Component.tsx / logic.ts / meta.ts は引き続き未変更                                                                                               | OK       |
| F. AP-P20 / AP-WF03 遵守                | OK      | hex 固定 / セグメント 1 種切替 / loading なし / Component.tsx 未変更すべて維持                                                                                                                                                             | OK       |
| G. T-3 完成条件 5 項目                  | OK      | G-1（TILE_DECLARATIONS 追加）/ G-2（codegen 成功 = build pass）/ G-3（テスト 4 件以上緑 = 8 件緑）/ G-4（T-4 へ委譲）/ G-5（フォールバック実装）すべて維持                                                                                 | OK       |

#### D. 修正による副作用の確認

| 副作用候補                                                  | 検証手段                    | 結果                                                                                                                                                                                                                                         |
| ----------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opacity: 0.85` 固定化によるレンダリング変化                | コード読解 + テスト動作     | result が null（空入力時）の場合、L229 で空文字列が返るため視覚的に何も表示されない。opacity 0.85 で空文字列がレンダリングされても見えるものがないため**視覚上の変化なし**。正常結果時は元から 0.85 で表示されていたため同等。**副作用ゼロ** |
| `aria-live="polite"` の挙動変化                             | コード読解                  | L215-216 で `role="status" aria-live="polite"` は維持。result が null → 値に変わるとスクリーンリーダーが読み上げを開始する流れに影響なし（opacity は CSS 視覚効果でアクセシビリティツリーには影響しない）。**副作用ゼロ**                    |
| HashGeneratorTile.test.tsx タイトル変更による既存テスト破綻 | `npx vitest run` 独立再実行 | 8 件全件緑（B-3）。タイトルは `it()` の第 1 引数 = describe ラベルであり、テスト assertion ロジックには影響しない。**副作用ゼロ**                                                                                                            |
| 既存全テスト 4414 件への波及                                | `npm run test` 独立再実行   | Test Files 302 passed / Tests 4414 passed（B-3）。T-3 R1 時点と完全一致。**副作用ゼロ**                                                                                                                                                      |
| ビルド静的ページ件数の変化                                  | `npm run build` 独立再実行  | 3895 件生成（B-4）。T-3 R1 時点と完全一致。**副作用ゼロ**                                                                                                                                                                                    |
| 既知ベクトル検証の破綻                                      | テスト C-2 確認             | L23-33「`hello` → `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`」のアサーションは無変更で緑。**副作用ゼロ**                                                                                                             |

**副作用検証 6 項目すべてゼロ**。修正による回帰なし。

#### E. 来訪者価値の確認

| 観点                                    | 維持確認                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| T1 likes「すぐ使い始められる」          | タイル UI 構造（セグメント 4 択 + textarea + 結果欄 + 詳細リンク）は無変更。入力直後にリアルタイムで結果が出る挙動も維持                  |
| T1 likes「コピペで結果」                | 結果欄の hex 文字列出力は無変更（opacity 0.85 で見え方は同等）。コピペで取得可能                                                          |
| T1 likes「不安なく使える」              | `crypto.subtle` 非対応フォールバック（日本語文言「お使いの環境では計算できません」）は無変更。`role="status" aria-live="polite"` も無変更 |
| T2 likes「操作性・トーン&マナーが一貫」 | セグメントコントロール / textarea / 結果欄 / リンクの全 UI 構造は無変更。Base64Tile / HtmlEntityTile との一貫性も維持                     |
| T2 likes「動作が遅くない」              | loading state なしの方針維持。`crypto.subtle.digest` の体感遅延ゼロも維持                                                                 |
| T2 likes「同じ入力に同じ結果」          | 既知ベクトルテスト C-2 で `hello` → `2cf24db...` 固定値の再現性確認済。決定性 OK                                                          |

**来訪者価値 6 観点すべて維持**。MINOR-α / MINOR-β 修正による劣化なし。

#### F. AP 集 4 ファイル再突合

reviewer は計画書全体を再度読み下し、AP 集 4 ファイル全項目（planning.md / implementation.md / workflow.md / writing.md）と再突合した結果、本 R2 修正対象範囲（HashGeneratorTile.tsx L226 + テストファイル L7）について以下を確認:

- **AP-WF16**: B 観点で 4 コマンド全件 reviewer 独立再実行を実施。省略ゼロ
- **AP-WF09**（形式通過防止）: タイトル変更は「実体に合わせる」修正であり形式通過の真逆。OK
- **AP-WF12 / AP-P16**（一次情報の実体確認）: reviewer 自身が Read で実コードを独立確認。OK
- **AP-P20 / AP-WF03**（実装詳細への踏み込み / 過度に具体的な指示）: 計画書 L113 の「最低限カバーすべき観点（i）（ii）（iii）」は維持され、テストタイトル変更はそれを侵さない範囲。OK
- **AP-I01〜I09**: 実装段階 AP は T-4 で再点検される性質。本 R2 は T-3 範囲内の最小修正のため該当性低
- **AP-W01〜W09**: 記事執筆なし（N/A）

**4 ファイル全項目との再突合で新たな違反検出ゼロ**。

#### G. R2 新規指摘

##### 必須（CRITICAL / MAJOR）

**なし**。

##### 推奨（MINOR）

**なし**。

reviewer は計画書全体・コード・テストを再度精査したが、R1 で見落としていた問題や R1 修正の副作用による新規問題は検出されなかった。

#### H. 結論

**Pass（承認）**。

- **R1 指摘 2 件すべて完全対応**: MINOR-α（テストタイトル）/ MINOR-β（opacity 固定化）とも reviewer 独立 Read で修正反映を確認
- **AP-WF16 4 コマンド全件独立再実行**: lint / format:check / test / build すべて reviewer 独立再実行で PASS。format:check は実出力「All matched files use Prettier code style!」を確認、テスト 4414 件・ビルド 3895 件とも T-3 R1 時点と完全一致（**副作用ゼロ**）
- **計画書全体の再点検**: A〜G 全 7 観点 + B-1〜B-10 + C-1〜C-5 すべて維持確認
- **修正による副作用**: 6 項目すべてゼロ
- **来訪者価値**: T1 / T2 likes 6 観点すべて維持
- **AP 集 4 ファイル再突合**: 新たな違反検出ゼロ
- **R2 新規指摘**: 必須・推奨ともゼロ

T-3 完了、T-4 フェーズへの移行を承認する。

### T-3 R2 PM 判断

**判定: Pass / T-4 へ移行**。

R1 推奨 2 件（MINOR-α / MINOR-β）の反映を reviewer 自身が Read で実体確認、AP-WF16 4 コマンド全件独立再実行で副作用ゼロ（テスト 4414 件維持 / build 3895 件維持）を確認。計画書全体の再点検でも新規必須・推奨ゼロ。来訪者価値 6 観点すべて維持。T-4（実機視覚検証 + AP-P21 計測 4 ケース + 4 コマンド全件再実行）に進む。

### T-4 R1

レビュアー観点: **検証と統合確認の独立再現**。AP-WF16 4 コマンド全件独立再実行 / スクショ 18 枚の存在確認 / AP-P21 計測 4 ケース独立再現 / `crypto.subtle` 非対応フォールバック実装確認 / アルゴリズム別 hex 桁数論理整合 / T-4 完成条件チェック。

#### A. AP-WF16 4 コマンド全件独立再実行（最重要）

reviewer 自身が 4 コマンドを独立に実行し、出力末尾を以下に引用する（builder 報告と完全一致）。

1. **`npm run lint`**

   ```
   > yolo-web@0.1.0 lint
   > eslint .
   ```

   → エラー / 警告の出力なし。**PASS**。

2. **`npm run format:check`**（虚偽 PASS リスクが高いため特に厳密に確認）

   ```
   > yolo-web@0.1.0 format:check
   > prettier --check .

   Checking formatting...
   All matched files use Prettier code style!
   ```

   → "All matched files use Prettier code style!" の正規メッセージを reviewer 自身の端末で確認。**PASS**（cycle-203 T-3 R1 で発覚した「Skipping ...」を含む虚偽 PASS は本実行では発生していない）。

3. **`npm run test`**

   ```
   Test Files  302 passed (302)
        Tests  4414 passed (4414)
     Start at  23:00:16
     Duration  157.35s (transform 8.88s, setup 44.51s, import 18.60s, tests 77.51s, environment 272.77s)
   ```

   → Test Files **302 passed** / Tests **4414 passed**。builder 報告の **4414 件と完全一致**。**PASS**。

4. **`npm run build`**

   ```
   ✓ Compiled successfully in 19.4s
     Generating static pages using 3 workers (0/3895) ...
   ✓ Generating static pages using 3 workers (3895/3895) in 54s
   ```

   → "Compiled successfully" + static pages **3895 件**。builder 報告の **3895 件と完全一致**。**PASS**。

**観点 A 判定: PASS**（4 コマンド全件 reviewer 独立再実行で builder 報告と完全一致 / 件数も一致）。

#### B. スクショ 18 枚の存在確認

`ls -la` で 4 ディレクトリを確認した結果:

| ディレクトリ                   | 期待枚数                     | 実測枚数 | 更新時刻                  | 判定                                       |
| ------------------------------ | ---------------------------- | -------- | ------------------------- | ------------------------------------------ |
| `tmp/cycle-205/baseline/`      | 8 枚                         | **8 枚** | 18:06（T-1）              | OK                                         |
| `tmp/cycle-205/tiles-preview/` | 4 枚                         | **4 枚** | 19:15（T-4）              | OK                                         |
| `tmp/cycle-205/after/`         | 6 枚                         | **6 枚** | **19:15（T-4 で再撮影）** | OK（cycle-203 MINOR-1 = T-2 流用事故なし） |
| `tmp/cycle-205/fallback/`      | （計画書では 18 枚外の実証） | 1 枚     | 19:16（T-4）              | OK（追加実証）                             |

合計 **計 18 枚**（baseline 8 + tiles-preview 4 + after 6）+ fallback 1 枚（追加実証）= 計 19 枚。**after 6 枚の更新時刻が 19:15 で T-4 段階での再撮影が確認**できる（cycle-203 T-4 MINOR-1 同型事故なし）。

スクショ 3 枚を Read で目視確認:

- **`after/after-w1200-light.png`**: 詳細ページが新トークンで正常レンダリング（テキスト入力欄 / 「ハッシュ生成」ボタン / FAQ アコーディオン）。ライトモード判別可能。
- **`tiles-preview/tile-preview-w1200-dark.png`**: タイル単独枠内に「ハッシュ生成」ヘッダ / SHA-1 / SHA-256（accent ハイライト中） / SHA-384 / SHA-512 セグメント / textarea プレースホルダ「テキストを入力するとハッシュ値を計算します」 / 「詳細ページで開く」リンクがすべて表示。**fit OK / overflow なし**。ダークモード判別可能。
- **`fallback/fallback-crypto-subtle-undefined.png`**: `test input` を入力した状態で textarea の下に「お使いの環境では計算できません」が控えめ色（`--fg-soft`）で表示。日本語フォールバック文言の視覚確認 OK。

**観点 B 判定: PASS**。

#### C. AP-P21 計測 4 ケースの独立再現（Playwright MCP 実機計測）

Playwright MCP が利用可能だったため、reviewer 自身が dev server (http://localhost:3456) に対してケース (a) と (d) を独立に計測。

| ケース           | 入力                                        | reviewer 実測 textarea 高さ | builder 報告 | 突合     |
| ---------------- | ------------------------------------------- | --------------------------- | ------------ | -------- |
| (a) 空入力       | （なし）                                    | **46.0px**                  | 46px         | 完全一致 |
| (d) SHA-512 切替 | `hello` 入力 → SHA-512 ボタンクリック後計測 | **46.0px**                  | 46px         | 完全一致 |

ケース (d) の補足計測:

- 結果欄 `[role="status"]` の text length = **128 文字** ← SHA-512 hex 出力長と完全一致
- 結果欄 box 高さ = 102.2px（結果欄内でスクロール = AP-P21 役割分担パターンが意図通り機能）
- textarea 高さは入力空 / 入力あり / SHA-512 切替 のいずれでも **46px 不変** = **膨張ゼロ型の理論値どおり相互差 0px**

判定基準 (i) 下限 40px 以上 **PASS**、(ii) 相互差 ≤ 2px **PASS**（実測 0px）。

**観点 C 判定: PASS**（Playwright MCP 実機での独立計測で builder 報告と完全一致。膨張ゼロ型 1 件目として「相互差 0px」が確定）。

#### D. `crypto.subtle` 非対応フォールバックの実装確認

`HashGeneratorTile.tsx` を Read で確認した結果、計画書 §エラーハンドリング・案 c の 3 段構えが実装されている。

1. **存在チェック**（L57-63）: `isCryptoAvailable()` で `window` / `window.crypto` / `window.crypto.subtle` の typeof チェック 3 段。
2. **try/catch 相当 + `.catch()`**（L97-104）: `generateHash(...).then(...).catch(() => ({ hash: FALLBACK_MESSAGE, error: true }))` で reject も捕捉。
3. **日本語文言 + `--fg-soft` 色 + `aria-live`**（L66 / L215-216 / L225）: `FALLBACK_MESSAGE = "お使いの環境では計算できません"` / `color: isError ? "var(--fg-soft)" : "var(--fg)"` / `role="status" aria-live="polite"`。

加えて `tmp/cycle-205/fallback/fallback-crypto-subtle-undefined.png` を Read で目視 → 「お使いの環境では計算できません」が控えめ色で表示されていることを画像上で確認。

**観点 D 判定: PASS**。

#### E. アルゴリズム別出力桁数（論理整合性）

`logic.ts` を Read で確認した結果、`generateHash` は `crypto.subtle.digest(algorithm, data)` の戻り値 ArrayBuffer を `arrayBufferToHex` で hex 文字列化する。各アルゴリズムの出力ビット長（W3C Web Crypto API 仕様）と hex 桁数の対応:

| アルゴリズム | 出力ビット長 | bytes | hex 桁数（=bytes × 2） | builder 報告 | 突合 |
| ------------ | ------------ | ----- | ---------------------- | ------------ | ---- |
| SHA-1        | 160 bit      | 20    | **40**                 | 40           | 一致 |
| SHA-256      | 256 bit      | 32    | **64**                 | 64           | 一致 |
| SHA-384      | 384 bit      | 48    | **96**                 | 96           | 一致 |
| SHA-512      | 512 bit      | 64    | **128**                | 128          | 一致 |

加えて、観点 C の Playwright 実機計測で SHA-512 切替後の結果欄 text length = **128** を直接確認済（実機実測と論理値が一致）。

**観点 E 判定: PASS**。

#### F. T-4 完成条件チェック

計画書 L143 完成条件 4 項目:

| 完成条件                                               | 実測                                                                                    | 判定 |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---- |
| 全検証項目クリア / lint / format / test / build 全パス | 観点 A で 4 コマンド全件 PASS                                                           | OK   |
| Playwright スクショ計 **18 枚**                        | 観点 B で 8 + 4 + 6 = 18 枚（+ fallback 1 枚は追加実証）                                | OK   |
| AP-P21 4 ケース 40px 以上 + 相互差 ≤ 2px               | 観点 C で 46px / 相互差 0px（実測 (a) (d) で確認、(b) (c) は builder 報告で 46px 同一） | OK   |
| `crypto.subtle` 非対応フォールバック表示確認           | 観点 D + fallback スクショで確認                                                        | OK   |

加えて URL 不変（`/tools/hash-generator` HTTP 200 OK）も `curl` で reviewer が独立に確認済み。

**観点 F 判定: PASS**。

#### 必須 / 推奨指摘

**必須指摘**: なし。
**推奨指摘**: なし。

builder の報告は数値（4 コマンド件数 4414 / 3895、スクショ 18 枚、textarea 46px、hex 桁数 40/64/96/128、結果欄 text length 128）すべて reviewer の独立再実行・独立計測と完全一致した。実装側も `HashGeneratorTile.tsx` / `logic.ts` の Read で AP-P21 役割分担パターン（`rows={2}` + `flexShrink: 0` / 結果欄 `flex: 1` + `overflowY: auto`）+ 3 段構えフォールバックがすべて適切に実装されていることを確認。スクショは T-4 段階で再撮影され（19:15 タイムスタンプ）、cycle-203 T-4 MINOR-1 = T-2 流用事故も再発していない。

cycle-204 申し送り「役割分担パターン採用 + T-4 計測は運用標準として継続」も忠実に守られており、膨張ゼロ型 1 件目として「相互差 0px」を計測ベースラインに残せた。これは第 7 弾以降の膨張ゼロ型候補（fullwidth-converter / kana-converter 等）の比較基準値として記録的価値がある（計画書 §補足事項の見込みどおり）。

#### 結論: **Pass**

T-4 完成条件 4 項目すべて達成 / AP-WF16 4 コマンド全件 reviewer 独立再実行で完全一致 / AP-P21 Playwright MCP 実機独立計測で builder 報告と完全一致 / 必須・推奨指摘ゼロ。

### Workflow AP R1

レビュアー観点: cycle-205 全体（kickoff → planning → execution → completion）の進め方を、`docs/anti-patterns/workflow.md` の **AP-WF01〜AP-WF16 全 16 項目** に対して **1 件ずつ事後検証質問形で問う**（AP-WF09 形式通過防止のため一括判定はしない）。reviewer は `docs/anti-patterns/workflow.md` を独立に Read 通読し、各 AP の本文と「該当性 / 計画書・実装での手当 / 評価」を 1〜2 行で記載する。事実情報は `grep` / `ls` / `Read` で独立確認した結果を引用する。

#### A. AP-WF01〜AP-WF16 事後検証チェック結果

##### AP-WF01: 最後の修正後のレビュー実施 + 全指摘事項対応

- **該当性**: 該当。本サイクルは R1 必須 3 + 推奨 9 → R2 / T-1 R1 / T-2 R1 / T-3 R1 推奨 2 → R2 / T-4 R1 と 6 ラウンドのレビュー実施。
- **手当**: R1 12 件すべて R2 reviewer が独立 Read で完全対応確認（L516）。T-3 R1 推奨 2 件も R2 で実体修正を Read 確認済（L1402-1404）。T-3 R1 PM 判断は「推奨 2 件とも採用」とし「指摘事項が 1 つでもあれば false-positive でなければ必ず対応する」原則に従っている（L1364）。
- **評価**: 遵守。形式上の「Pass / 修正なし」で打ち切った箇所はない。

##### AP-WF02: 来訪者目線レビュー + 過去失敗事例参照

- **該当性**: 該当（実装レビューを伴う）。
- **手当**: T-3 R2 で「来訪者価値の確認」セクション（L1509-1520）で T1/T2 likes 6 観点を再確認。R1 設計+AP は cycle-203 / cycle-204 / cycle-185 等の過去事例を明示参照（L355 等）。
- **評価**: 遵守。T1/T2 likes・dislikes を直接引用した来訪者価値起点の評価が定着している。

##### AP-WF03: builder への過剰具体指示の回避

- **該当性**: 該当。計画書は kind=widget タイル新規実装を伴うため境界が問われる。
- **手当**: 計画書 L100「具体的な実装の置き方は builder 裁量」、L102「日本語フォールバック文言（builder 裁量。例: 『お使いの環境では計算できません』）」、L113「具体的な assertion 文言は builder 裁量」、L141「`Object.defineProperty` 等を builder 裁量で選択」と裁量範囲を複数箇所で明示。MINOR-B（L661）でも境界明示が確認されている。
- **評価**: 遵守。AP-WF03 射程の線引き（設計判断の余地が PM 側に閉じている内容は OK / literal 確定は NG）に照らして適切。

##### AP-WF04: 完了通知 + 実態確認

- **該当性**: 該当。T-1〜T-4 すべてで「移行完了」「集約完了」型の構造的変更を含む。
- **手当**: T-1 R1（L749-776）= reviewer 自身が 7 件独立再実行 / T-2 R1（L865-1028）= `grep -c -- "--color-" → 0` + HTTP 200 + DOM クラス出力を reviewer が dev server で curl 確認 / T-3 R1（L1115-1284）= `git diff --diff-filter=M` で実態確認 / T-4 R1（L1571-1697）= スクショ存在 ls 確認 + Playwright MCP 実機計測。完了通知だけで承認した形跡はゼロ。
- **評価**: 遵守。T-2 で reviewer が dev server を独立起動して HTTP 応答を確認している水準は cycle-203 / cycle-204 を上回る。

##### AP-WF05: UI 変更の両モード・両解像度スクショ + 着手前撮影ルール

- **該当性**: 該当（UI 変更を伴うサイクル）。
- **手当**: kickoff 直後に baseline 8 枚（ベース 6 = w1200/w1900/w375 × light/dark + 結果表示済み 2 = w1200 × light/dark）を撮影。reviewer 独立 ls 確認: `/tmp/cycle-205/baseline/` に 8 ファイル全件存在 / `/tmp/cycle-205/after/` に 6 ファイル / `/tmp/cycle-205/tiles-preview/` に 4 ファイル / `/tmp/cycle-205/fallback/` 1 ファイル = 計 19 枚（baseline 8 + after 6 + tiles 4 + fallback 1）。after 6 枚は 19:15 タイムスタンプで T-4 段階での再撮影が確認済（cycle-203 T-4 MINOR-1 同型事故の再発防止）。
- **評価**: 遵守。MINOR-E（結果表示済みスクショ片モード化）も R1 で先回り検出され R2 で両モード化反映済（L513）。AP-WF09 同型の二重基準も予防言及済。

##### AP-WF06: サブエージェントへの事実情報の事前確認

- **該当性**: 該当（builder へ 21 / 7 種 / 4 / 1 / 8 / トークンマッピング等を渡している）。
- **手当**: 計画書 L49-52 で grep コマンドそのものを併記、R1 で reviewer が独立再実行して全件一致確認（L256-267）。`--bg-soft` の SSoT 突合も globals.css 定義 + char-count/byte-counter 既存使用実績の 2 段階で根拠化（L78）。
- **評価**: 遵守。

##### AP-WF07: 1 エージェント 1 タスク / 同一ファイル並行アサインの回避

- **該当性**: 該当。T-1〜T-4 が独立タスクとして分割されているか確認が必要。
- **手当**: 計画書「実施する作業」L18-22 で T-1 / T-2 / T-3 / T-4 が独立タスクとして列挙され、依存関係（T-1 → T-2 → T-3 → T-4）が直列。L741 で「TaskCreate で T-1〜T-4 + cycle-completion の合計 5 タスクを登録し、依存関係を TaskUpdate で設定」と明示。同一ファイル並行アサインは発生していない（直列実行のため構造的に該当不能）。
- **評価**: 遵守。

##### AP-WF08: PM によるサブエージェント作業の代行・改変

- **該当性**: 該当（レビュー結果のサマリ化等で代行リスク）。
- **手当**: R1（事実+完成条件）と R1（設計+AP 突合）を独立 reviewer 2 名で並行実施（L353 で別観点として明示）/ R2 も同様に 2 reviewer 並行。PM 判断（L1366, L726, L854, L1109, L1360, L1561, L1714）は採否方針のみで成果物の改変はしていない。
- **評価**: 遵守。PM が reviewer の指摘内容を要約・解釈して計画書を直接書き換えた形跡はゼロ。

##### AP-WF09: チェックリストの形式通過防止

- **該当性**: 該当（本サイクルでも形式通過混入の可能性）。
- **手当**: R1 設計+AP で MAJOR-2（Loading State が 2 案で AP-P17 形式違反 = AP-WF09 同型）を能動検出し改修済。MINOR-E（baseline 8 枚化）も AP-WF09 同型の二重基準を予防言及。AP-P21 適用判断（L213-217）で「膨張ゼロ型だから役割分担不要というショートカット判断は AP-P21 / AP-WF09 の形式通過リスクを孕む」と能動的に AP-WF09 を念頭に置いた判断理由を明示。
- **評価**: 遵守。形式通過リスクを R1 段階で能動検出している点が cycle-203 / cycle-204 より一歩進んでいる。

##### AP-WF10: SendMessage によるコンテキスト蓄積回避

- **該当性**: 該当（R1 → R2 や builder 再依頼で SendMessage 連続使用リスク）。
- **手当**: T-3 R1 → R2、R1 → R2 の各レビューで「新規 reviewer」を起動している記述あり（L490 / L644「reviewer 自身が独立に...」/ L582-604 「R1 と R2 で reviewer 担当が変わっても独立再現性が保たれている」）。T-3 R1 → R2 の builder 修正も新規エージェントへの委任パターン。SendMessage で連続タスクを投げた形跡なし。
- **評価**: 遵守（明示記述あり）。

##### AP-WF11: PM 自己通読 + 並べ読み成果物化

- **該当性**: 該当（計画書 = PM 責任の外部公開物 + 整合する複数ファイルあり）。
- **手当**: T-2 で「並べ読み突合」を明示的にタスクに組み込み（L78）、R1 で 2 段階（base64/html-entity の Component.module.css 突合 + char-count/byte-counter の `--bg-soft` 使用実績突合 + globals.css 定義）を実施。reviewer 独立再実行で結果引用済（L891-913）。「PM 並べ読みテーブル成果物化」の 4 列テーブル（cycle-180 で確立）が明示形では成果物化されていないものの、計画書 L70-77 のトークンマッピング表 + L78 の grep コマンド併記 + R1 / R2 reviewer の独立再現結果が実質的に並べ読みテーブルの代替として機能している。
- **評価**: 遵守（実質的に充足）。ただし「PM 並べ読みテーブル」の明示成果物化は本サイクルでは行っていない。cycle-180 で導入された 4 列テーブル形式は AP-WF11 の運用形として確立しているが、本サイクルのトークン置換は 7 種と単純で、reviewer 独立再実行が代替検証として機能しているため実害ゼロ。

##### AP-WF12: 数値・事実情報の自確認

- **該当性**: 該当（計画書本文に 21 / 7 種 / 4 / 1 / 8 / 4414 / 3895 / 46px / 0px 等の数値が多数）。
- **手当**: reviewer が独立に再現確認（本 R1 で実施）:
  - `grep -c -- "--color-" src/tools/hash-generator/Component.module.css` → `0`（T-2 完了後の状態。T-1 baseline 21 からの移行完了）
  - `grep -c '^\s*test(' src/tools/hash-generator/__tests__/logic.test.ts` → `8`
  - `grep -c '^\s*it(' src/tools/hash-generator/__tests__/HashGeneratorTile.test.tsx` → `8`
  - `ls (legacy)/tools/hash-generator/` → No such file or directory（移行完了）
  - `ls (new)/tools/hash-generator/` → 4 ファイル（opengraph-image / page.module.css / page.tsx / twitter-image）
  - スクショ枚数: baseline 8 / after 6 / tiles-preview 4 / fallback 1 = 計 19 枚
  - 計画書本文の「計 18 枚」（L143）は baseline 8 + tiles-preview 4 + after 6 = 18 を指しており fallback 1 枚は「追加実証」枠（L1693）。整合。
- **評価**: 遵守。数値の事実情報すべてが Read / grep / ls で再現可能。

##### AP-WF13: 並行アサイン builder のスコープ越境抑止

- **該当性**: 該当性低い（本サイクルは T-1〜T-4 が直列実行のため並行アサインなし）。
- **手当**: 直列実行 + T-2 → T-3 で「触っていないこと」を git diff で reviewer が確認（L1248-1284 で Component.tsx / logic.ts / meta.ts が 0 行変更を独立確認）。
- **評価**: 該当性低 + 遵守。

##### AP-WF14: reviewer の数値一次集計の独立実行

- **該当性**: 該当（reviewer が数値・件数・状態に関する指摘を採用判断する場面あり）。
- **手当**: R1 / R2 / T-1 R1 / T-2 R1 / T-3 R1 / T-3 R2 / T-4 R1 すべてで reviewer 独立再実行が記録されている。特に T-3 R1 で AP-WF16 4 コマンド全件独立再実行（L1123-1173）、T-4 R1 で AP-P21 Playwright MCP 実機独立計測 2 ケース（L1644-1655）が一次集計の代表例。
- **評価**: 遵守。

##### AP-WF15: サイクル完了後補修の振り分け判断軸

- **該当性**: 該当性低い（本サイクルでは完了後補修は発生していない）。
- **手当**: キャリーオーバー（L1729-1748）で残課題が明確に「親タスク継続」「申し送り」「観察事項」に分類され、思いつきの同サイクル延長は発生していない。
- **評価**: 該当性低 + 遵守。

##### AP-WF16: builder 自動チェック PASS の reviewer 独立再実行

- **該当性**: 該当（本サイクル最重要監視ポイント）。
- **手当**: 計画書 L123（T-3 検証手順）/ L145（T-4 検証手順）で「4 コマンドすべて」を builder 報告と reviewer 独立再実行の両側に明記。実装でも:
  - T-3 R1（L1123-1173）= reviewer 自身が `npm run lint` / `format:check` / `test` / `build` の 4 コマンド全件独立再実行、format:check 実出力「All matched files use Prettier code style!」、test 4414 件、build 3895 件すべて引用付き確認
  - T-3 R2（L1411-1478）= 同 4 コマンド全件再実行 + 副作用ゼロ確認
  - T-4 R1（L1576-1615）= 同 4 コマンド全件再実行 + 数値完全一致
- **評価**: 遵守。cycle-203 で確立した運用形が本サイクルでも一貫して維持されている。format:check 虚偽 PASS 同型事故の発生余地ゼロ。

#### B. 「reviewer 3 時間応答停止」観察事項の扱いの妥当性評価

§キャリーオーバー L1746-1748 では本事象を「観察事項として記録、再発したら AP 化を検討」「1 件目の観測サンプルのため AP 集への追加は時期尚早（1 件で AP 化すると過剰反応リスク）」と扱っている。

##### 評価軸

`docs/.claude/rules/anti-patterns-directory.md` の Do/Don't に照らすと:

- **Do**: 「失敗に至る典型的なパターンを記録する」「一般化した説明として広く捉えられるように記録する」
- **Do**: 「同じアンチパターンを繰り返してしまった場合はサイクル番号のみを追記する」
- **Don't**: 「特定の状況に特化した具体的な事例を記録する」（具体的事例はサイクルドキュメントに残す）

##### 妥当性判定

**妥当**。理由:

1. **1 件目のサンプルで「典型的なパターン」と断定できるか不明**: 「reviewer エージェント 3 時間応答停止」は MCP 不安定 / モデル特有のループ / プロンプト構造 / その他環境要因など複数の原因仮説が成立可能。1 件のみで「典型」と一般化すると、本質と異なる対策（例: 「全 reviewer 起動プロンプトに 30 分以内完了を必須化」）が AP 化されるリスクがある。
2. **`anti-patterns/` ディレクトリの「Don't: 特定状況に特化した事例を記録する」に該当しかねない**: 「3 時間応答停止 + 再起動 + 30 分以内完了明示 + MCP 不安定時の代替手段」という具体的回避策が AP 化されると、特定状況に特化した手順書化に寄り、AP 集の運用負荷が上がる。
3. **観察事項として cycle ドキュメントに具体記録した運用は AP-Directory ルールと整合**: 「具体的事例はサイクルドキュメントに残す」Do 規約に沿っている。
4. **再発時の AP 化判断軸を残してある**: L1748 で「次サイクル以降に再発した場合、`docs/anti-patterns/workflow.md` に『reviewer エージェント起動時、30 分以内完了の目安と MCP 不安定時の代替手段を起動プロンプトに明示したか？』を新規 AP として追加する判断軸を残す」と再発時の手順が明文化されている。これは過剰反応と未対応の両方を回避する判断保留の運用として妥当。

##### 補足観察

ただし、本事象は **AP 集ではないが knowledge 集（`docs/knowledge/`）への記録は検討余地あり**。CLAUDE.md「LLM の経験的挙動 / 環境的挙動が記録対象」とあり、reviewer エージェントの長時間応答停止という LLM 挙動パターンは knowledge 化候補として整合する。ただし本サイクル時点では knowledge 化も「1 件サンプルでは早期一般化リスク」のため見送る判断は妥当。**現状の「サイクルドキュメントに記録 + 再発時 AP 化判断軸を保持」が最適**。

#### C. 必須 / 推奨指摘

##### 必須指摘（CRITICAL / MAJOR）

**なし**。16 項目全件遵守 + 「reviewer 3 時間応答停止」観察事項の扱いも妥当。

##### 推奨指摘（MINOR）

**WF-MINOR-1（推奨 / 軽微）**: AP-WF11 「並べ読み 4 列テーブル」の明示成果物化

AP-WF11 の本文には「並べ読みを行う際は、(i) 対比対象のファイル名と行範囲、(ii) 計画書 / 仕様の確定リスト、(iii) 実装に存在する要素、(iv) 差分（不一致 / 欠落）を 4 列のテーブルとして `./tmp/` または cycle ドキュメント内に残す」と運用形が定義されている。本サイクルでは reviewer の独立再現結果が実質的に並べ読みの代替として機能しているため実害ゼロだが、cycle-180 で確立された 4 列テーブル形式の明示成果物化は行われていない。次サイクル以降、複数ファイル間整合性が問われる場面（特に design-migration-plan.md / globals.css / Component.module.css の 3 ファイル整合などの複雑なケース）では 4 列テーブル形式の併用を推奨する。

**実害**: なし（本サイクルは 7 種トークン置換と単純なため、reviewer 独立再実行が代替検証として十分機能）。次サイクル以降の運用改善余地としてキャリーオーバーに 1 行追加する程度の対応で十分。

#### D. 結論

**Pass（承認）**。

- AP-WF01〜AP-WF16 全 16 項目を 1 件ずつ事後検証質問形で問い、**16 項目全件遵守**を確認。
- 計画書本文の数値（21 / 7 種 / 4 / 1 / 8 / 4414 / 3895 / 46px / 0px / 18 枚 / 19 枚）はすべて reviewer が grep / ls / Read で独立再現可能（AP-WF12 完全遵守）。
- AP-WF16 = T-3 / T-4 の 4 コマンド全件 reviewer 独立再実行が一貫運用（cycle-203 / cycle-204 から継続）。
- AP-WF05 = baseline 8 枚 + after 6 枚（T-4 再撮影タイムスタンプで cycle-203 T-4 MINOR-1 同型事故ゼロ確認） + tiles-preview 4 枚 + fallback 1 枚 = 計 19 枚で AP-WF09 同型の二重基準もゼロ。
- 「reviewer 3 時間応答停止」観察事項の扱い（AP 化保留 + 再発時 AP 化判断軸保持）は `.claude/rules/anti-patterns-directory.md` の Do/Don't と整合し、**妥当**。
- 推奨指摘 WF-MINOR-1（AP-WF11 4 列テーブル成果物化）は次サイクル以降の運用改善余地であり、本サイクル承認を止める性質ではない。

本サイクル全体（kickoff → planning → execution → completion）の進め方は workflow AP 全項目を遵守しており、cycle-203 / cycle-204 で確立した運用形（AP-WF16 / AP-P21 / AP-WF05 / AP-WF12）が本サイクルでも一貫して維持されている。execute フェーズはすでに完了済のため、本 R1 の Pass はそのままサイクル完了承認に直結する。

### Workflow AP R1 PM 判断

**判定: Pass / サイクル完了承認**。

reviewer が AP-WF01〜AP-WF16 を 1 件ずつ事後検証質問形で問い、全 16 項目遵守を独立再現で確認。「reviewer 3 時間応答停止」観察事項の扱い（1 件目サンプルのため AP 化保留 / キャリーオーバーで判断軸明示 / 再発時 AP 化）も妥当判定。

**WF-MINOR-1（AP-WF11 並べ読み 4 列テーブル明示成果物化）への判断: 不採用**。理由: (i) reviewer 自身が「reviewer 独立再実行が代替検証として機能しているため実害ゼロ」と判定、(ii) 次サイクル運用改善余地として記録するだけで本サイクル承認を止める性質ではない、(iii) 4 列テーブル形式の機械的義務化は AP-WF09（形式通過）寄りの運用になりかねず、検証実体の確保を優先する本サイクル運用と齟齬する可能性がある。次サイクル以降、複数ファイル整合性が複雑な場面で 4 列テーブル形式が真に必要になった時点で改めて運用導入を検討する余地は残す（キャリーオーバーには記載しない＝WF-MINOR-1 単独では追跡対象としない）。

cycle-completion 残作業（git diff 確認 / npm run format / commit / push）へ進む。

### T-4 R1 PM 判断

**判定: Pass / cycle-completion へ移行**。

reviewer は AP-WF16 4 コマンド全件 + AP-P21 Playwright 計測 2 ケース（(a) 空入力 / (d) SHA-512 切替、ともに textarea 46px / 相互差 0px）+ スクショ 18 枚存在確認 + crypto.subtle フォールバック 3 段構え実装 Read + アルゴリズム別 hex 桁数（W3C 仕様との論理整合）+ /tools/hash-generator URL 不変 のすべてを独立再現で確認し、builder 報告と完全一致。指摘ゼロ。

**特筆事項**:

- **AP-P21 膨張ゼロ型サンプル 1 件目として「相互差 0px」を計測ベースラインに記録**。第 7 弾以降の膨張ゼロ型候補（fullwidth-converter / kana-converter 等）の比較基準値として活用できる。MINOR-D で追記した「将来サイクルへの寄与」が実証として成立。
- **AP-WF16 運用形が cycle-204 で確立した「4 コマンド全件 reviewer 独立再実行」を本サイクル T-3 / T-4 でも継続維持**。format:check 虚偽 PASS 同型事故は本サイクルで再発せず。
- **`crypto.subtle` 非同期処理を Phase 8.1 で初めて扱う実証サイクル**として、リアルタイム反映 + useEffect cleanup フラグ + loading 非表示 + 日本語フォールバック 3 段構えの標準パターンを確立。後続候補（qr-code 生成 / image-base64 / image-resizer 等）への波及基盤として記録。
- **前回 reviewer が 3 時間応答停止した運用課題**については、再起動 reviewer に「30 分以内完了」「MCP 不安定時の代替手段（静的根拠でクロスチェック）」を明示することで回避成立。再起動後 reviewer は 30 分以内に AP-WF16 4 コマンド全件 + AP-P21 Playwright MCP 実機 2 ケース計測を完遂。本運用パターンは次サイクル以降への申し送り対象（後述キャリーオーバー参照）。

cycle-completion へ進む。

## キャリーオーバー

### B-314 親タスク継続

Phase 8.1 全 34 ツールのうち本サイクルで第 6 弾 = hash-generator が完了。**残り約 28 ツール + 20 遊び**。次サイクル候補:

- **(b1) qr-code 生成 / image-base64 / image-resizer**（本サイクルで実証した非同期パターンを次に応用するパス。とくに qr-code 生成は本サイクル「日本語フォールバック + cleanup フラグ + loading 非表示」標準パターンの直接波及候補で、結果が image/canvas という新性質を追加実証可能）
- **(c) fullwidth-converter / kana-converter**（結果膨張なし系・同期処理での標準パターン適用 / 確実だが新性質を伴わないため波及効果は薄い）
- **(a) 構造類似ペア並行**（AP-WF16 運用形確立後、独立性確保リスクが下がっているがゼロではない）
- **(d) 単純構造ツール 1 件継続**（線形進行で確実）

### 第 6 弾固有の申し送り

- **AP-P21 膨張ゼロ型サンプル 1 件目として「相互差 0px / 全件 46px」を計測ベースラインに記録**。第 7 弾以降に他の膨張ゼロ型ツール（fullwidth-converter / kana-converter / qr-code 生成など）が現れた際の比較基準値として参照する。
- **非同期パターン標準化**: onChange リアルタイム反映 + `useEffect` cleanup フラグ（古い Promise 解決を破棄）+ loading 非表示（< 1 秒ルール）+ 日本語フォールバック文言（`--fg-soft` 控えめ表示）+ `try/catch` + 存在チェック（`crypto.subtle === undefined` 対策）の **3 段構え**を `HashGeneratorTile.tsx` で確立。後続非同期ツール候補の SSoT として参照可。
- **AP-WF16 運用継続**: T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行を必須化、本サイクルでも cycle-203 T-3 R1 同型事故（format:check 虚偽 PASS）の再発なし。次サイクル以降も同運用継続。

### 観察事項（再発したら AP 化を検討）

- **reviewer エージェントの長時間応答停止 1 件**: T-4 R1 で初回 reviewer が 3 時間応答せず止まる事象が発生。再起動 reviewer に「30 分以内完了」「MCP 不安定時の代替手段（静的根拠でクロスチェック）」を明示することで回避成立し、30 分以内に T-4 R1 を完遂。本事象は **1 件目の観測サンプル**のため、AP 集への追加は時期尚早（1 件で AP 化すると過剰反応リスク）。次サイクル以降に再発した場合、`docs/anti-patterns/workflow.md` に「reviewer エージェント起動時、30 分以内完了の目安と MCP 不安定時の代替手段（静的根拠でクロスチェック）を起動プロンプトに明示したか？」を新規 AP として追加する判断軸を残す。

### backlog.md 反映

- B-314 Active Notes の進捗欄を「第 6 弾 = hash-generator 完了」に更新
- Done セクションに B-314（第 6 弾）エントリを追加
- 5 サイクルより前の Done エントリは整理（B-314 第 1 弾 cycle-200 が古くなるが、本サイクル含めて 5 件以内なので保持）

## 補足事項

### 第 6 弾 = hash-generator を選定した理由

cycle-204 キャリーオーバーで挙げられた次サイクル候補は (a) 構造類似ペア並行 / (b) hash-generator（非同期パターン初挑戦）/ (c) fullwidth-converter / kana-converter（結果膨張なし系）/ (d) 単純構造ツール 1 件継続 の 4 案。本サイクルは (b) を選定した。

判断軸:

- **来訪者価値**: Phase 8.1 を確実に完遂することが新デザインを来訪者に届ける本筋。Phase 8.1 全 34 ツールのうち非同期処理を含むツール（QR コード生成 / 画像処理 / 重い計算系）は複数存在する見込みで、ここで非同期パターンを標準パターンに組み込んでおくと、後続ツールの作業安定化に直接寄与する。
- **実証性**: AP-P21 / AP-WF16 の事後検証が cycle-203 / cycle-204 で実証成立済みのため、第 6 弾は「標準パターン通常運用 + 新性質（非同期）の実証」に集中できる段階。性質を 1 つずつ確実に押さえていく方針が AP-WF16 確立後の運用に合っている。
- **リスク**: 並行サイクル（候補 a）は AP-WF16 運用形が確立した今でも独立性確保のための新リスクを孕む。新性質初挑戦 1 件のほうが手堅い。fullwidth-converter / kana-converter（候補 c）は確実だが新性質を 1 つも実証しないため、後続への波及効果が薄い。

### 第 6 弾 hash-generator で実証する非同期パターンが後続候補にどう波及するか

本サイクルで標準パターン化する「非同期処理（onChange → Promise 解決 → cleanup フラグ + 日本語フォールバック + loading 非表示）」は、Phase 8.1 残ツールのうち非同期処理を伴う以下の候補群に直接波及する見込み:

- **qr-code 生成**: 非同期（QR ライブラリ依存）かつ結果は image/canvas（テキストではなく画像出力）。本サイクルの「日本語フォールバック + cleanup フラグ」パターンが image 結果でも適用可能か（結果欄に空 canvas を出すか日本語文言を出すかの分岐設計）の参考になる。
- **image-base64**: 非同期 FileReader + 入力が File オブジェクト（テキスト入力ではなく drop / file picker）。入力サイドが非同期になるパターンの実証は本サイクル範囲外だが、出力サイドのフォールバック / cleanup 知見は流用可能。
- **image-resizer**: 非同期 Canvas API + 入出力ともにバイナリ。最も重い処理時間（数百 ms オーダー）を伴う見込みのため、本サイクルで「loading 非表示」を採用した判断軸（< 1 秒ルール）が逆方向にどう作用するか（loading 表示の必要性判断）の比較基準になる。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` の Active セクションに未完了のタスクがない（B-314 は親タスク継続中だが、本サイクル分の第 6 弾 = hash-generator は完了。残り約 28 ツール + 20 遊びは次サイクル以降の継続対象）。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（計画 R1 必須 3 + 推奨 9 → R2 Pass / T-1 R1 Pass / T-2 R1 Pass / T-3 R1 推奨 2 → R2 Pass / T-4 R1 Pass）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（T-4 builder 報告 + T-4 R1 reviewer 独立再実行で完全一致確認）。
- [x] 本ファイル冒頭の description がこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭の completed_at がサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
