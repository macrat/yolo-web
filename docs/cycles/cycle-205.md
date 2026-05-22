---
id: 205
description: B-314 Phase 8.1 第 6 弾 = hash-generator のタイル化。`crypto.subtle` 非同期パターンを Phase 8.1 標準パターンに組み込む実証サイクル。
started_at: 2026-05-22T17:18:35+0900
completed_at: null
---

# サイクル-205

このサイクルでは、B-314 (Phase 8.1 = ツール・遊び詳細ページの新デザイン移行 + タイル化) の **第 6 弾**として `hash-generator` を対象にする。第 1〜5 弾（char-count / byte-counter / url-encode / base64 / html-entity）で確立した標準パターン（kind=widget / page.module.css 1200px ハードコード / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）に対して、**`crypto.subtle` を用いた非同期処理**という新性質を載せて実証する。AP-P21（固定枠 UI の膨張側 / 操作側役割分担）の事後検証は cycle-203 / cycle-204 で「必ず膨張型」「条件付き膨張型」の両性質汎用性が定量実証成立済み、AP-WF16（builder の自動チェック PASS 報告を reviewer / PM が独立再実行で確認）も cycle-204 で運用形確立済みのため、本サイクルは AP-P21 / AP-WF16 とも通常運用フェーズで進める。

## 実施する作業

- [x] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [x] 対象は **hash-generator**（cycle 概要文・補足事項で既に確定済）
  - [x] kind 判定（single / widget / multi）とタイル推奨サイズの確定 → **kind=widget / cols=3 rows=2**
  - [x] 非同期パターン（`crypto.subtle.digest`）特有の論点（loading state / race condition / エラー処理 / セグメント表示単一化 / 出力形式 hex 固定）を計画段階で確定
- [ ] cycle-execution で計画に沿った実装を行う
  - [ ] T-1: 現状把握と移行前 baseline 取得（grep による旧トークン残存数・テスト件数・関数 export 数の実体確認 + 移行前スクショ撮影 / AP-WF05 ライト・ダーク両モード必須 / 「結果表示済み状態」スクショも撮影）
  - [ ] T-2: `src/tools/hash-generator/Component.module.css` 旧トークン置換（21 箇所・7 種、特殊マッピング `--color-bg-secondary → --bg-soft` に注意）+ `(legacy)` → `(new)` ディレクトリ移行（page.tsx / page.module.css / opengraph-image.tsx / twitter-image.tsx）+ 並べ読みによる新トークンマッピング SSoT 突合
  - [ ] T-3: タイル定義（kind=widget / cols=3 rows=2）+ `HashGeneratorTile.tsx` 新規実装（セグメントコントロール 1 種切替・SHA-256 デフォルト・hex 固定・リアルタイム反映・race condition cleanup flag・loading 非表示・日本語フォールバック文言）+ テスト新規追加 + `TILE_DECLARATIONS` 末尾追加 + codegen 実行
  - [ ] T-4: 検証と統合確認（`/internal/tiles/preview/tools/hash-generator` 視覚 fit / AP-P21 textarea 高さ 4 ケース計測 / 4 コマンド全件 reviewer 独立再実行 / Playwright で w375 × w1200 × w1900 × light/dark スクショ）
- [ ] 計画レビューを受ける（reviewer 指摘を解消するまで R1〜Rn を回す）
- [ ] cycle-completion でサイクルを完了させる

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

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

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
