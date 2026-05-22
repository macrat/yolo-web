---
id: 206
description: B-314 Phase 8.1 第 7 弾として fullwidth-converter（全角半角変換）のタイル化と (new)/tools/ 配下への詳細ページ移行を行う。cycle-205 で hash-generator が非同期パターン初挑戦を完了したため、本サイクルは標準パターン通常運用フェーズに復帰し、双方向 textarea×2 + 同期処理 + 結果膨張ゼロ型 + オプション複数（英数字 / カタカナ / 記号）という構造的差分を 7 回目の通常運用で確認する。
started_at: 2026-05-22T23:37:11+0900
completed_at: 2026-05-23T01:01:59+0900
---

# サイクル-206

このサイクルでは、`B-314`（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8）の **第 7 弾**として `fullwidth-converter`（全角半角変換）を扱う。cycle-200〜205 で標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行）が 6 回適用済み、AP-P21 両性質汎用性も実証成立しているため、本サイクルは **標準パターン通常運用フェーズの初回**として位置づける。

来訪者にとっての価値は「全角半角変換も新デザインで使え、ダッシュボードのタイルとしても並べられる」一点。実装上の構造的差分（オプションチェックボックス 3 種、半角カタカナ非対応の選択肢を含む 6 種の英数字 / カタカナ / 記号変換）を計画時点で SSoT として整理する。

## 実施する作業

- [x] T-1: 現状把握と移行前 baseline 取得（fullwidth-converter のファイル構成 / 旧トークン 17 箇所・5 種 / `logic.ts` export 5 / 既存テスト 16 + 6 / `TILE_DECLARATIONS` 件数 6 を grep 実測で確認、Playwright で baseline 計 8 枚撮影、既存テスト 22 件が緑であることの確認）
- [x] T-2: 詳細ページの `(new)/tools/fullwidth-converter/` 配下への移行（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイルを `git mv` で移動 + `page.module.css` 新設 / 1200px max-width 標準パターン / `Component.module.css` の旧トークン 17 箇所・5 種 + `accent-color` 1 行を新トークンに置換）
- [x] T-3: タイル定義（`src/tools/fullwidth-converter/FullwidthConverterTile.tsx` などタイル UI 一式を新規実装、`kind=widget` / cols=3 rows=2 / セグメントコントロール 2 状態（半角 / 全角）+ オプション省略全 ON 固定 / AP-P21 役割分担パターン / `TILE_DECLARATIONS` へのエントリ追加 / `npm run generate:tiles-registry` 再生成 / タイル用テスト 6 件以上）
- [x] T-4: 検証と統合確認（Playwright 視覚回帰 + AP-P21 textarea 高さ計測 4 ケース + AP-WF16 reviewer 独立再実行 / baseline 8 枚 + tiles-preview 4 枚 + after 6 枚 = 計 18 枚 / `lint` / `format:check` / `test` / `build` の 4 コマンド全件 reviewer 独立再実行）

## 作業計画

### 目的

**誰のために**: T1（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）/ T2（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）。全角半角変換を必要とする来訪者（フォーム入力の半角揺れ整形・帳票データのカタカナ正規化・古いシステムが要求する半角カタカナへの変換・Excel コピペ時の表記統一など）。

T1 の `search_intents` には「**全角半角変換**」が**明示的に含まれている**（`docs/targets/特定の作業に使えるツールをさっと探している人.yaml:31`）。すなわち本ツールは「検索流入で着地した来訪者がそのまま使う」用途が想定された道具であり、タイル化と新デザイン化はその両側に直接価値を持つ。

**何の価値**:

- 新デザインへの統一移行: `/tools/fullwidth-converter` の見た目を他の (new) 配下 6 ツール（char-count / byte-counter / url-encode / base64 / html-entity / hash-generator）と揃え、T2 likes「操作性・トーン&マナーが一貫」を満たす。
- ダッシュボード上の道具箱タイルから 1 クリックで起動でき、入力 onChange でリアルタイムに変換結果を確定できる。T1 likes「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」/「コピペで結果を受け取ってすぐ元の作業画面に戻れる」に直結。
- T2 のリピーター（既存利用者）の混乱を避けるため、URL（`/tools/fullwidth-converter`）と詳細ページ Component の挙動（双方向トグル + 3 種チェックボックス + コピーボタン）は一切変えない。

**背景・Phase 8.1 全体での意義**: B-314 Phase 8.1 の **第 7 弾**。cycle-200〜205 で 6 回適用した標準パターン（kind=widget / `page.module.css` 1200px ハードコード / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行 / AP-WF05 dark mode 撮影）に対して、本サイクルは **標準パターン通常運用フェーズの初回** として位置付ける。cycle-205 で実証目的のメタ要素（非同期パターン初導入）を伴った後の最初のサイクルであり、「実証目的が薄い分だけ淡々と進むはず」という油断がレビュー手順省略の誘因にならないよう、計画段階で AP-WF16 reviewer 独立再実行と AP-WF05 dark mode 着手前撮影を明示する。

**viewport 採用方針の明示**: AP-WF05 の網羅性ルール（w360/w1280）に対し、本サイクルでは Phase 8.1 標準パターン（cycle-200〜205）に従い w375/w1200/w1900 + （タイルプレビューは w1200/w375）を採用する。AP-WF05 形式逸脱の見逃しを断つため、計画段階で本不整合を明示する（w360 タイル viewport は B-434 で Phase 10.1 必須検討、Phase 8.1 内では暫定許容）。

構造的差分は (i) 双方向 textarea×2 + 同期処理 + 結果膨張ゼロ型（base64 / hash-generator に続く 3 件目の膨張ゼロ系統サンプル）、(ii) **オプション 3 種チェックボックス（英数字 / カタカナ / 記号）という Phase 8.1 内で初出の UI 要素**。後者がタイル UI（cols=3 rows=2 = 400×264px）内にどう収めるかが本サイクル最大の設計判断であり、AP-P17 に従って 3 案以上のゼロベース比較を必須とする（後述「検討した他の選択肢と判断理由」参照）。

**「チェックボックスが Phase 8.1 内で初出」の出典確認**: `grep -l 'type="checkbox"' src/tools/{char-count,byte-counter,url-encode,base64,html-entity,hash-generator}/Component.tsx` 実行 → ヒット 0 件（exit 1 = match なし）を確認済。cycle-200〜205 で扱った 6 ツールはいずれも `<input type="checkbox"` を持たないため、本サイクルが Phase 8.1 内のチェックボックス初出ツールとして正しく成立する。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- fullwidth-converter の現在のファイル構成・コード・CSS を確認する。数値の出典は本計画書本文に grep コマンドを併記し、`tmp/` 配下削除後も再現可能とする。
  - `src/tools/fullwidth-converter/`: Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/{logic.test.ts,meta.test.ts}`
  - `src/app/(legacy)/tools/fullwidth-converter/`: page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル
  - `Component.module.css` 内の `--color-*` 残存数: **17 箇所**。**実測コマンド**: `grep -c -- "--color-" src/tools/fullwidth-converter/Component.module.css` → 17
  - 旧トークン種類は **5 種**（`--color-bg` / `--color-border` / `--color-primary` / `--color-text` / `--color-text-muted`）。**実測コマンド**: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/fullwidth-converter/Component.module.css | sort -u` → 上記 5 種。cycle-205 hash-generator (7 種) より少なく、`--color-bg-secondary` / `--color-primary-hover` / `--color-error` / `--color-error-bg` は存在しない。
  - logic.ts のエクスポート: 型 2 (`ConvertMode` / `ConvertOptions`) + 関数 3 (`toHalfwidth` / `toFullwidth` / `convert`) の **5 export**。**実測コマンド**: `grep -c '^export ' src/tools/fullwidth-converter/logic.ts` → 5
  - 既存テスト件数: `logic.test.ts` describe 3 / test 16、`meta.test.ts` describe 1 / test 6。**実測コマンド**: `grep -c '^\s*test(' src/tools/fullwidth-converter/__tests__/logic.test.ts` → 16、`grep -c '^\s*test(' src/tools/fullwidth-converter/__tests__/meta.test.ts` → 6
  - `meta.ts` の `trustLevel`: `"verified"`（変更しない）
  - `TILE_DECLARATIONS` 現状エントリ件数: **6**。**実測コマンド**: `grep "domain:" src/tools/_constants/tile-declarations.ts | wc -l` → 6
- Playwright で移行前のスクリーンショットを取得する
  - **ベース 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 遵守）
  - **結果表示済み状態スクショ 2 枚（ライト・ダーク両モード）**: 任意のテキスト（全角英数 + 全角カタカナ濁音を含む 30 文字程度）を入力 → 「半角に変換」結果が出ている状態を撮影。AP-WF05 着手前撮影ルールに従い、両モードを撮影することで cycle-205 と同水準（baseline 8 枚）を担保する。
- 既存テストの実行確認（`npm run test -- fullwidth-converter` で `logic.test.ts` 16 件 + `meta.test.ts` 6 件 = 22 件が緑）

**完成条件**: 移行前のスクリーンショットが **計 8 枚**（ベース 6 枚 + 結果表示済み 2 枚）が `tmp/cycle-206/baseline/` 配下に保存されている。既存テスト 22 件が緑。grep による旧トークン残存 17 / 5 種一覧 / export 5 / `test` 16 / `test` 6 / `TILE_DECLARATIONS` 件数 6 の数値がいずれも本計画書本文と一致することが reviewer によって独立再実行で確認されている。

**T-1 検証手順（AP-WF16）**: T-1 builder は `npm run test -- fullwidth-converter` と上記 grep コマンドの出力を引用付きで報告する。T-1 reviewer は builder の報告のうち最低 1 つ以上の自動チェックを **独立に再実行** して出力一致を確認する。

#### T-2: 詳細ページの (new) 配下移行

cycle-200〜205 で確立した標準パターンを踏襲する:

- `src/app/(legacy)/tools/fullwidth-converter/` を `src/app/(new)/tools/fullwidth-converter/` に **git mv** で移動する（page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル）
- `src/app/(new)/tools/fullwidth-converter/page.module.css` を新設し、1200px max-width をハードコードする（既存 (new) 配下 6 ツールと同一パターン）
- page.tsx に `page.module.css` の `.page` ラッパーを追加する
- `src/tools/fullwidth-converter/Component.module.css` 内の `--color-*` 系旧カラートークン（17 箇所 / 5 種）を新デザイントークンに置換する
  - **置換マッピング** (cycle-200〜205 で確立した SSoT):
    - `--color-bg → --bg`
    - `--color-border → --border`
    - `--color-primary → --accent`
    - `--color-text → --fg`
    - `--color-text-muted → --fg-soft`
  - **特殊マッピング不要**: `--color-bg-secondary` / `--color-primary-hover` / `--color-error` / `--color-error-bg` がいずれも存在しないため、cycle-205 のような `--bg-soft` への特殊マッピングや日本語フォールバックの色付け考慮は本サイクル不要。5 対 5 の単純な置換。
  - **`accent-color` の置換**: `accent-color: var(--color-primary)` 行（チェックボックスのチェック色を `--color-primary` で指定している）も `accent-color: var(--accent)` に置換対象として明示する（実装段階で見落とすリスクのある 1 行のため計画書で言及）。
  - **並べ読み突合**: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/fullwidth-converter/Component.module.css | sort -u` と base64 / html-entity / hash-generator の `Component.module.css` のトークン使用実績を比較し、5 種すべてが第 1〜6 弾で既に使用されている SSoT に存在することを確認する（AP-WF12 違反予防）。
- w1900 で本文幅が 1200px に収まっていることを確認する

**注意事項**:

- ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネントは touch しない（B-431 一括対応）
- `meta.ts` の `trustLevel: "verified"` は削除しない（B-432 一括削除を待つ。本サイクル新規追加ファイルでも維持）
- opengraph-image.tsx / twitter-image.tsx もそのまま移動する（内容は変更しない）
- 詳細ページ Component.tsx は **touch しない**（kind=widget 標準パターン継続）

**完成条件**: `/tools/fullwidth-converter` が (new) 配下で正常表示される。旧 (legacy) パスにファイルが残っていない。w1200 / w1900 / w375 で表示崩れがない。Component.module.css 内に `--color-*` 系旧トークンが残存しないこと。**判定コマンド**: `grep -c -- "--color-" src/tools/fullwidth-converter/Component.module.css` → `0`。

**T-2 検証手順（AP-WF16）**: T-2 builder は残存判定 grep と `/tools/fullwidth-converter` HTTP 200 OK を引用付きで報告。T-2 reviewer は最低 1 つ以上を独立再実行する。

#### T-3: タイル定義（kind=widget + 双方向トグル + オプション収納設計 + AP-P21 役割分担）

- **kind 判定**: fullwidth-converter の詳細ページ Component は「モード切替 2 ボタン + オプション 3 チェックボックス + 入力 textarea + 出力 textarea + コピーボタン」と縦に長く、128px タイルセル基準では収まらないため **kind=widget** とする。
- **タイル推奨サイズ**: `cols=3 rows=2`（`calcTilePixels(3, 2)` = 400×264px）。第 1〜6 弾と同サイズで一貫。
- タイル用コンポーネント（`src/tools/fullwidth-converter/FullwidthConverterTile.tsx`）を新規実装する
  - CSS Module 不使用（codegen 制約）。インラインスタイル方式で既存 6 タイルと同型。
  - **タイル UI の方針**: 「モード切替セグメントコントロール 2 状態（半角 / 全角）+ 入力 textarea + 結果欄 + 詳細ページへのリンク」。**オプション 3 種チェックボックスはタイルでは省略し全 ON 固定** とする（後述「検討した他の選択肢と判断理由」§オプション収納方法の比較で採択案として確定）。
  - **`accent-color` トークンの責務分離**: タイル UI はチェックボックスを持たないため `accent-color` トークン使用なし。詳細ページ Component.module.css の `accent-color: var(--color-primary)` → `accent-color: var(--accent)` 置換のみで十分（T-2 タスクで対応する 1 行）。
  - **変換トリガ**: リアルタイム反映（入力 / セグメント切替で即座に結果が更新される）。`convert()` は純粋同期関数で計算コストゼロ（base64 / html-entity / url-encode と同様）。cycle-205 で確立した非同期パターン（`useEffect` cleanup / loading 非表示 / 日本語フォールバック）は本サイクル不要。
  - **`useMemo` の使用可否**: builder 裁量。判断基準として、fullwidth-converter は純粋同期関数 + 計算コスト極小のため `useMemo` の効果は微小。Base64Tile / HtmlEntityTile は前例として参照可能だが、必須ではない。
  - **エラーハンドリング**: `convert()` は失敗経路を持たない純粋関数のため、cycle-205 hash-generator のような try/catch + 日本語フォールバック文言は **本サイクル不要**。空入力時は結果欄を空表示にする。
  - **【AP-P21 役割分担パターン継続採用】**: textarea を `rows=2 + flexShrink: 0`、結果欄を `flex: 1 + overflowY: auto` の役割分担を**最初から**適用する。fullwidth-converter は「**膨張ゼロ型**」（半角 1 文字 ↔ 全角 1 文字。濁音カタカナの toHalfwidth で 1 文字 → 2 文字の微増があるが base64 4 倍 / url-encode 3 倍とは桁違いに小さく、構造リスクとしては実質発生しない）。それでも継続採用する理由は以下:
    - (i) cycle-200〜205 で 6 連続適用済の CSS 構造を踏襲することでタイル全体の見た目・挙動の一貫性が維持される（T2 likes「操作性・トーン&マナーが一貫」）
    - (ii) cycle-204 / cycle-205 申し送り「役割分担パターン採用 + T-4 計測は運用標準として継続」が指定されている
    - (iii) AP-WF09（形式通過）防止のため、「膨張ゼロ型だが継続採用」の判断理由を計画書本文で明示する
  - 結果欄には `role="status" aria-live="polite"` を付与する（既存タイルと同型）
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に fullwidth-converter のエントリを追加する（recommendedSize: `cols=3 rows=2`）。`inputPlaceholder` / `widgetSummary` 等の必須フィールドは既存エントリと同じ枠を埋める形で実装者が決める
- `npm run generate:tiles-registry` で codegen を実行する（tilesCount: 6 → 7）
- タイル用コンポーネントのテストを追加する。**件数は 6 件以上**、以下の観点 (i)〜(vi) をすべて含むこと。assertion 文言は builder 裁量。
  - (i) **モード切替 → 入力保持**（toHalfwidth → toFullwidth に切り替えても入力テキストが保持され、結果欄だけが再計算される）
  - (ii) **toHalfwidth デフォルト動作（全 ON）**（オプション全 ON 固定で全角英数字 / 全角カタカナ / 全角記号がすべて半角化される、混在入力 1 件）
  - (iii) **toFullwidth デフォルト動作（全 ON）**（オプション全 ON 固定で半角英数字 / 半角カタカナ / 半角記号がすべて全角化される、混在入力 1 件）
  - (iv) **濁音カタカナの toHalfwidth**（+1 文字膨張エッジケース。例: 全角「ガ」→ 半角 `ｶﾞ` 2 文字）
  - (v) **半濁音カタカナの toHalfwidth**（例: 全角「パ」→ 半角 `ﾊﾟ` 2 文字）
  - (vi) **空入力**（結果欄が空表示で、role="status" を持つ要素として描画される）

**注意事項**:

- 詳細ページの Component.tsx は touch しない（既存仕様 = 双方向トグル + 3 種チェックボックス + コピーボタンを維持する。kind=widget 標準パターン）
- デザイントークンは `--fg` / `--bg` / `--accent` / `--fg-soft` / `--border` 等の新トークンを使用する
- タイルでは半角 ⇄ 全角の双方向トグルを維持する（一方向固定にしない。url-encode / base64 / html-entity と同型）

**完成条件**: `TILE_DECLARATIONS` に fullwidth-converter が追加されている。codegen が成功し `tilesCount=7` になる。`FullwidthConverterTile.tsx` のテスト **6 件以上**（観点 (i)〜(vi) を全て含む）が緑。タイル UI 上でモード切替が機能し、リアルタイムで結果が反映される。

**T-3 検証手順（AP-WF16）**: T-3 builder は `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** の出力を引用付きで報告する。T-3 reviewer は **4 コマンドすべて** を独立に再実行して出力一致を確認する（cycle-203 T-3 R1 で発覚した format:check 虚偽 PASS 同型事故の確実防止 / cycle-205 で運用形確立）。

#### T-4: 検証と統合確認（AP-P21 計測 / AP-WF16 全件再実行 / 視覚検証）

- `/internal/tiles/preview/tools/fullwidth-converter` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク **計 4 枚** 撮影）
- 移行後のスクリーンショット比較（**計 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × ライト / ダーク両モード）。T-4 段階で再撮影する（cycle-203 T-4 MINOR-1 = T-2 スクショ流用事故の再発防止）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/fullwidth-converter` で 200 OK）
- タイルプレビュー上の動作確認を Playwright で実施
  - デフォルト表示（toHalfwidth 状態）
  - モード切替（半角 ⇄ 全角）で結果が反転すること
  - 入力 onChange でリアルタイム反映
  - 結果欄 `role="status" aria-live="polite"` の DOM 確認
  - **【AP-P21 textarea 高さ計測 4 ケース】**: 以下 4 ケースで textarea の `getBoundingClientRect()` 高さを Playwright で計測する
    - (a) **空入力**（膨張なし）
    - (b) **短い ASCII 入力**（例: `ABC123` 6 文字 → 全角変換で同長 6 文字）
    - (c) **中程度の日本語入力**（例: 全角カタカナ 30 文字 → 半角変換で 30 文字前後、濁音含むと若干増加）
    - (d) **濁音含む全角カタカナを半角に変換**（最大膨張ケース。1 文字 → 2 文字の微増が積み上がる入力で結果欄が縦に伸びても textarea が圧迫されないことを確認）
  - **判定基準**（cycle-203 / 204 / 205 と同基準）: (i) **下限 40px 以上** / (ii) **4 ケース間の textarea 高さの相互差が 2px 以内**（最大値 − 最小値 ≤ 2px）。fullwidth-converter は実質膨張ゼロ型のため、cycle-205 hash-generator の実測値（4 ケース全件 46px・相互差 0px）と一致することを確認する。**膨張ゼロ型 2 件目のサンプル**として cycle-205（1 件目）と同水準が再現されれば、kana-converter 等 3 件目以降の比較基準値が 2 サンプルで補強される（将来サイクルへの寄与）。

**完成条件**: 全検証項目をクリア。lint / format / test / build が全パス。Playwright スクリーンショットが **計 18 枚**（移行前 baseline 8 枚 = ベース 6 枚 + 結果表示済み 2 枚 / タイルプレビュー 4 枚 = w1200・w375 × ライト/ダーク / 移行後 6 枚 = w1200・w1900・w375 × ライト/ダーク = cycle-205 と同水準）。タイルプレビューでモード切替が動作し、(a)〜(d) 4 ケース全てで textarea 高さが 40px 以上かつ相互差 2px 以内。

**T-4 検証手順（AP-WF16）**: T-4 builder は 4 コマンド全件出力と Playwright 計測 4 ケース実測値を引用付きで報告。T-4 reviewer は (i) 自動チェック 4 コマンドすべてを独立に再実行、(ii) Playwright 計測の 4 ケースのうち最低 1 ケースを独立に再現、の両方を実施する（cycle-204 / cycle-205 と同形）。

### 検討した他の選択肢と判断理由

#### 【最重要】オプション 3 種チェックボックスのタイル UI 内収納方法（AP-P17 = 3 案以上のゼロベース列挙）

タイル UI（cols=3 rows=2 = 400×264px）にモード切替セグメント + textarea + 結果欄 + 詳細リンクが収まる前提で、Phase 8.1 内で初出の UI 要素「オプション 3 種チェックボックス（英数字 / カタカナ / 記号）」をどう扱うかが本サイクル最大の設計判断。AP-P17 に従い、最低 3 案を表形式で並列比較する。

| 評価軸                      | 案 A: タイル内に 3 チェックボックス全配置                                                                                                                                                                                                                                          | 案 B: 固定 All-ON で省略（**採用**）                                                                                                                                                                                                                                    | 案 C: 事前設定セグメント（「全変換」/「英数字のみ」/「カタカナのみ」等）                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値              | オプション個別制御がタイル上で可能。最大の自由度。**ただし最大公約数ユースケース（全 ON）で十分な来訪者にとっては UI 過密が体験悪化**。                                                                                                                                            | T1 likes「すぐ使い始められる」を最大化。**最大公約数ユースケース（全 ON で英数字 / カタカナ / 記号すべてを変換）が大半の利用者の用途と一致**。オプション個別制御が必要な来訪者は詳細ページで対応 → タイル価値（即時性）と詳細ページ価値（細部制御）の責務分離が明確化。 | 「英数字のみ」「カタカナのみ」等の事前設定で典型用途を 1 タップ切替。中間的な解像度。                                           |
| (ii) AP-P21 リスク          | **高い**。チェックボックスが縦方向のスペースを消費し、textarea (rows=2) + 結果欄 (flex:1) との同居で 264px 高さ枠が圧迫される。「セグメント + チェックボックス 3 行 + textarea + 結果欄 + リンク」で 6 要素を縦積みする構造になり、operator side（textarea）の最低高さ確保が困難。 | **低い**。要素数が「セグメント + textarea + 結果欄 + リンク」の 4 要素に収まり、cycle-200〜205 の 6 ツールと同構造で AP-P21 計測ベースライン（46px ± 0.5px）への再現性が高い。                                                                                          | **中**。セグメントが 2 段（モード切替 + 事前設定）になり、要素数は 5。AP-P21 リスクは案 A と案 B の中間。                       |
| (iii) 詳細ページとの差別化  | **詳細ページの差別化価値が消える**。タイル単体ですべてが完結し、詳細ページに飛ぶ動機が無くなる（FAQ / 関連リンク / 解説のリピーター回遊価値だけが残るが、本ツールに関する詳細ページの主要価値は失われる）。                                                                        | **明確に保たれる**。「3 種オプション個別制御 + コピー UI + 全機能」は詳細ページの専属価値。タイル = 即時性 / 詳細 = 細部制御 の責務分離が明確で T2 likes「目的別の使い分けが分かる」に寄与。                                                                            | 事前設定の 3〜4 種で典型ケースを覆うため詳細ページの差別化価値は **部分的に低下**（個別チェックボックスの真の自由度のみ残る）。 |
| (iv) cols=3 rows=2 枠内収納 | **困難**。実装上の余裕がほぼ無く、ラベル省略 / 文字サイズ縮小等のヒーロー的対応が必要。                                                                                                                                                                                            | **余裕あり**。第 1〜6 弾の構造と同じ 4 要素縦積みで収まる。                                                                                                                                                                                                             | **可能だが余裕は少ない**。セグメント 2 段で縦方向を占有する。                                                                   |
| (v) 実装コスト              | 高（チェックボックスのインラインスタイル化 + AP-P21 計測条件の追加検証）。                                                                                                                                                                                                         | 低（既存 6 タイルと同パターン）。                                                                                                                                                                                                                                       | 中（事前設定のラベル設計 + UI 状態管理の追加）。                                                                                |

**採択: 案 B（固定 All-ON で省略）**。

**採択理由（来訪者価値最大化原則による正当化）**:

1. T1 likes（特に「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」「コピペで結果を受け取ってすぐ元の作業画面に戻れる」）に対して、案 B が最大のフィット感を持つ。タイルは「素早く確認する」場であり、デフォルト（全変換）で最大公約数的に動作する設計が「すぐ使い始められる」を最大化する。
2. 詳細ページとの責務分離が最も明確で、T2 likes「目的別の使い分けが分かる」に直接寄与する。タイル = 即時性 / 詳細 = 細部制御 の二段構成は cycle-200〜205 の標準パターン継承とも整合する。
3. 案 A は AP-P21 リスクが高く、案 C は中間的だが詳細ページの差別化価値を部分的に侵食する。案 B は AP-P21 リスクが最も低く、計測ベースライン（46px ± 0.5px）への再現性が確実。
4. 実装コストは判断軸の最後だが、案 B が最も低い。実装コストが低いことを採用理由にはしていないが、来訪者価値・AP-P21 リスク・差別化価値の 3 軸で勝った上で実装コストも低いという結果になっている。

**「全変換」がほぼ全ての利用者の期待動作と一致する根拠**:

- 詳細ページの実装デフォルトも `alphanumeric: true / katakana: true / symbol: true` の全 ON（`src/tools/fullwidth-converter/Component.tsx:10-14`）であり、来訪者の典型用途を製品側が「全 ON」と判断してきた SSoT が既に存在する。
- T1 の `search_intents` に「全角半角変換」が明示的に含まれ、その検索意図は「半角揺れを全角に揃えたい / 全角揺れを半角に揃えたい」という最大公約数的なものが大半。「英数字だけ半角化したい（カタカナはそのまま）」のような選択的変換は少数派ユースケースで詳細ページに譲ることが妥当。

#### AP-P21 適用判断: 役割分担パターン継続採用 vs 膨張ゼロ型として簡素化

fullwidth-converter は **実質膨張ゼロ型**（半角 1 文字 ↔ 全角 1 文字。濁音カタカナの toHalfwidth で 1 文字 → 2 文字の微増があるが、base64 4 倍 / url-encode 3 倍とは桁違いに小さく、構造リスクとしては実質発生しない）。

それでも **役割分担パターン（textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto）を継続採用** する理由は以下:

1. **タイル全体の CSS 構造一貫性**: cycle-200〜205 で 6 連続適用済の CSS 構造を踏襲することでタイル全体の見た目・挙動の一貫性が維持される（T2 likes）。
2. **cycle-204 / cycle-205 申し送りの遵守**: 「役割分担パターン採用 + T-4 計測は運用標準として継続」が指定されている。第 7 弾で運用標準を崩すと第 8 弾以降の「条件付き膨張型」「必ず膨張型」候補で再導入が必要になり運用形が揺らぐ。
3. **AP-WF09 防止のため判断理由を明示**: 「膨張ゼロ型だから役割分担不要」というショートカット判断は AP-P21 / AP-WF09 の形式通過リスクを孕む。「膨張ゼロ型でも継続採用」の理由を計画書で明示することで AP-WF09 防止になる。
4. **膨張ゼロ型サンプル 2 件目としての記録的価値**: cycle-205 hash-generator が膨張ゼロ型 1 件目として「相互差 0px / 全件 46px」を計測ベースラインに残している。本サイクルが 2 件目として 4 ケース計測を継続し再現性を確認することで、kana-converter 等の 3 件目以降の比較基準値が 2 サンプルで確定する（将来サイクルへの寄与）。

#### 変換トリガ: リアルタイム反映 vs 手動ボタン vs 混在

| 選択肢                                            | 採否     | 判断理由（来訪者価値起点）                                                                                                                                                                                        |
| ------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 手動ボタン押下                              | 不採用   | T1 likes「コピペで結果を受け取ってすぐ元の作業画面に戻れる」に余分な 1 クリックを挟む。タイルは「素早く確認する」場であり手動ボタンは詳細ページの責務。                                                           |
| 案 b: タイル=リアルタイム / 詳細=既存（**採用**） | **採用** | 詳細ページ Component を touch しない方針（kind=widget 標準）と整合。詳細ページの既存 UI（リアルタイム）はそのまま。第 1〜6 弾の標準パターン素直な継承。`convert()` は純粋同期関数で計算コストゼロのため遅延ゼロ。 |
| 案 c: タイル=手動 / 詳細=リアルタイム             | 不採用   | タイル価値（即時性）と詳細ページ責務（細部制御）の責務分離原則と逆向き。                                                                                                                                          |

#### 詳細ページ Component.tsx の取り扱い: 触る vs 触らない

| 選択肢                                             | 採否     | 判断理由                                                                                                                                                                                                              |
| -------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: Component.tsx を新デザイン向けに書き換え     | 不採用   | 第 1〜6 弾の `kind=widget` 標準パターン（詳細ページ Component を touch しない / タイルとは別物として並存）から外れる。既存仕様（双方向トグル + 3 種チェックボックス + コピーボタン）は visitor の従来体験を壊さない。 |
| 案 b: **詳細ページ Component.tsx は touch しない** | **採用** | kind=widget 標準パターン継続。タイル UI（簡素 / オプション全 ON 固定）と詳細ページ UI（フル機能）の責務分離が明確化される。                                                                                           |

#### `meta.ts` の `trustLevel: "verified"` の取り扱い

| 選択肢                     | 採否     | 判断理由                                                                                                                                                                                                         |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 本サイクルで削除     | 不採用   | B-432（`docs/backlog.md:76`）の着手条件「Phase 8.1 全 34 ツール完了後」が **未達**。本サイクルは第 7 弾 / 34 のため未達確定。漸進削除は「型は optional / 実体は verified」の中間状態を生み AP-I02 同型のリスク。 |
| 案 b: **維持**（**採用**） | **採用** | B-432 着手条件未達のため B-432 一括削除を待つ。cycle-205 でも維持済。                                                                                                                                            |

### 計画にあたって参考にした情報

- **調査レポート**: `tmp/research/2026-05-22-cycle-206-fullwidth-converter-research.md`（fullwidth-converter 現状コード調査 / 旧トークン 17・5 種 / TILE_DECLARATIONS 6 件 / オプション収納 3 案の素案 / AP-P21 適用判断の素案）。本計画書 T-1 タスク冒頭に主要数値（17 / 5 種 / export 5 / test 16 + 6 / TILE_DECLARATIONS 6）の grep コマンドを併記済のため、`tmp/` 配下削除後も全数値が独立再現可能（AP-P16 対策）
- **cycle-200〜205 の移行実装（標準パターンの実体）**:
  - `src/app/(new)/tools/{char-count,byte-counter,url-encode,base64,html-entity,hash-generator}/page.tsx` / `page.module.css` — 1200px ハードコード SSoT
  - `src/tools/{base64,html-entity,hash-generator}/Component.module.css` — 新トークン SSoT（並べ読み突合用）
  - `src/tools/{base64,html-entity,hash-generator}/{Base64Tile,HtmlEntityTile,HashGeneratorTile}.tsx` — kind=widget タイルの双方向トグル + リアルタイム反映 + AP-P21 役割分担実装の参考実装
  - `src/tools/_constants/tile-declarations.ts` — `TILE_DECLARATIONS` エントリ形式
- **fullwidth-converter の現在のソースコード**:
  - `src/app/(legacy)/tools/fullwidth-converter/{page.tsx,opengraph-image.tsx,twitter-image.tsx}`
  - `src/tools/fullwidth-converter/{Component.tsx,Component.module.css,logic.ts,meta.ts,__tests__/{logic.test.ts,meta.test.ts}}`
- **デザイントークン定義**: `src/app/globals.css`（`--bg` / `--border` / `--accent` / `--fg` / `--fg-soft` の定義確認）
- **`docs/cycles/cycle-204.md` / `cycle-205.md` キャリーオーバー**: 「役割分担パターン採用 + T-4 計測は運用標準として継続」「AP-WF16 を T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行で運用継続」「fullwidth-converter / kana-converter 等が膨張ゼロ型 2〜3 件目候補」の方針
- **ターゲットユーザー定義**:
  - `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1。`search_intents` に「全角半角変換」を含む = 本ツールが直接該当）
  - `docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2）
- **アンチパターン集**:
  - `docs/anti-patterns/planning.md`: **AP-P17**（3 案以上のゼロベース列挙）/ **AP-P21**（固定枠 UI 膨張 / 操作側同居）/ AP-P16（一次情報の実体確認）/ AP-P20（過度に具体的な計画の回避）/ AP-P09（来訪者価値起点ゴール）
  - `docs/anti-patterns/workflow.md`: **AP-WF16**（自動チェック PASS の reviewer 独立再実行）/ **AP-WF05**（移行前ダークモード撮影）/ AP-WF12（手段先行の決め打ち）/ AP-WF09（チェックリストの形式通過）
- **デザイン移行アーキテクチャ**: `docs/design-migration-plan.md`
- **backlog の関連項目**: `docs/backlog.md` B-431（共通コンポーネント置換）/ B-432（trustLevel 一括削除）/ B-433（タイル UI / 詳細ページの localStorage 共有）/ B-434（w360 タイル viewport）

### 完成条件（サイクル全体）

- [x] `Component.module.css` の旧トークン置換完了（`grep -c -- "--color-" src/tools/fullwidth-converter/Component.module.css` → `0`）
- [x] `(legacy)/tools/fullwidth-converter/` のファイルが残存していない（3 ファイル全件 (new) 配下に移動済）
- [x] `src/app/(new)/tools/fullwidth-converter/page.module.css` 新設、`.page` ラッパーで 1200px max-width 適用
- [x] `TILE_DECLARATIONS` に fullwidth-converter エントリ追加（kind=widget / cols=3 rows=2 / 詳細パス `/tools/fullwidth-converter`）
- [x] `npm run generate:tiles-registry` で `tilesCount=7` に更新
- [x] `FullwidthConverterTile.tsx` 新規実装（モード切替セグメント / オプション全 ON 固定 / リアルタイム反映 / AP-P21 役割分担 / `role="status" aria-live="polite"`）
- [x] タイル用テスト **6 件以上**が緑（観点 (i) モード切替 → 入力保持 / (ii) toHalfwidth 全 ON / (iii) toFullwidth 全 ON / (iv) 濁音カタカナの toHalfwidth / (v) 半濁音カタカナの toHalfwidth / (vi) 空入力 をすべて含む）
- [x] 既存テスト 22 件（logic 16 + meta 6）が引き続き緑
- [x] `/internal/tiles/preview/tools/fullwidth-converter` で 4 viewport（w1200 / w375 × light / dark）表示確認
- [x] AP-P21 textarea 高さ 4 ケース全件で下限 40px 以上 / 相互差 ≤ 2px（cycle-205 実測値 4 ケース全件 46px・相互差 0px との一致を確認）
- [x] Playwright スクショ baseline 8 + tiles-preview 4 + after 6 = **計 18 枚** が `tmp/cycle-206/` 配下に保存
- [x] `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` 全件 PASS
- [x] T-3 / T-4 で reviewer が 4 コマンドすべて独立再実行して出力一致を確認（AP-WF16）
- [x] AP-WF05 dark mode 撮影が baseline / tiles-preview / after の各段階で実施されている

### 本サイクル外として認識する事項

- **B-431**（共通コンポーネントの旧トークン置換）: 本サイクルではスコープ外。Phase 8.1 完了前の任意タイミングで実施可能。
- **B-432**（`trustLevel` フィールド一括削除）: Phase 8.1 全 34 ツール完了後の一括対応。本サイクルでは `trustLevel: "verified"` を維持。
- **B-433**（タイル UI / 詳細ページの localStorage 共有による入力値保持）: 本サイクルでは未実装。Phase 10.1 ダッシュボード設計時または Phase 8.1 全完了後にタイル全般の共通機能として横展開。
- **B-434**（w360 viewport でのタイル表示）: 本サイクルでは暫定許容。Phase 10.1 ダッシュボード設計時の必須検討項目。
- **kana-converter**: cycle-207 候補として保留（fullwidth-converter と構造類似 / 膨張ゼロ型 3 件目候補）。本サイクル内では着手しない。
- **オプション 3 種チェックボックスのタイル内提供**: 採択案 B（固定 All-ON 省略）により本サイクル内では実装しない。将来 B-433 localStorage 共有実装時に「詳細ページで設定したオプション値をタイルに反映する」形で間接的に提供される可能性はあるが、Phase 10.1 以降の検討事項。

### 候補ツール比較（kickoff 時の絞り込み）

cycle-205 完了時点での残ツール約 28 件のうち、以下を比較し fullwidth-converter を選定した（kickoff フェーズで確定 / 本計画書では再評価対象としない）。

- **(b1) qr-code 生成**: 非同期パターン直接応用、出力が視覚（SVG/canvas）で構造的に大きく異なる。cycle-205 で確立した非同期パターン SSoT を 2 件目で検証する価値はあるが、視覚出力 UI の設計判断が増えるため本サイクル外。
- **(b2) image-base64 / image-resizer**: 入力が画像ファイル（FileReader 非同期 + Canvas）で、テキスト系 6 ツールとは入力構造が異なる。非同期パターンの 2 件目を別系統で扱うのは情報量過多のため後続サイクル。
- **(c1) fullwidth-converter（採択）**: 双方向 textarea×2 + 同期処理 + 結果膨張ゼロ + オプション 3 種という構造で、cycle-204 html-entity の派生として最も低リスク。**選定**。
- **(c2) kana-converter**: fullwidth-converter と構造類似。cycle-207 候補として残す。
- **(d) より単純な構造のツール（dummy-text 等）**: 単機能で構造的差分が少なく、cycle-200 char-count 直後と同等の情報量。標準パターン通常運用フェーズの初回検証としては差分が少なすぎるため後続サイクル。

**採択理由**:

1. **構造的差分の段階性**: オプション 3 種チェックボックスという「タイル UI の cols=3 rows=2 (400×264px) 内に複数 UI 要素を収める設計判断」が新しい（本計画書 §「【最重要】オプション 3 種チェックボックスのタイル UI 内収納方法」で 3 案比較済）。
2. **非同期パターン SSoT のクールダウン**: cycle-205 で確立直後の非同期パターンをいきなり 2 件目に適用すると、SSoT に未発見のバグが残っていた場合に 2 サイクル連続失敗のリスク。1 サイクル挟むことで cycle-205 成果物が安定運用に入ったかを別系統で確認できる。
3. **AP-P21 膨張ゼロ型サンプル増強**: cycle-205 hash-generator に続く 2 件目の膨張ゼロ型計測サンプルとして、textarea 4 ケース計測の比較ベースラインに追加できる。
4. **来訪者価値の確実性**: cycle-202〜204 で 3 回成功している「双方向 textarea×2 構造」の 4 回目で、失敗リスクが最も低い候補。

## レビュー結果

（`/cycle-planning` 以降で記入）

## キャリーオーバー

### B-314 親タスク継続

Phase 8.1 全 34 ツールのうち本サイクルで第 7 弾 = fullwidth-converter が完了。**残り約 27 ツール + 20 遊び**（Phase 8.1 内ツール）。次サイクル候補:

- **(b1) qr-code 生成 / image-base64 / image-resizer**（cycle-205 で確立した非同期パターン SSoT の 2 件目応用。とくに qr-code は「日本語フォールバック + cleanup フラグ + loading 非表示」の直接波及候補）
- **(c) kana-converter**（fullwidth-converter と構造類似 / 膨張ゼロ型 3 件目候補 / 標準パターン通常運用の自然な続き）
- **(d) 単純構造ツール 1 件継続**（線形進行で確実）

### AP-P21 膨張ゼロ型サンプル 2 件目の定量記録

T-4 Playwright 計測で 4 ケース全件 textarea 高さ = **46.00px・相互差 0.00px**、結果欄 `overflowY: auto` を確認。cycle-205 hash-generator（膨張ゼロ型 1 件目 / 4 ケース全件 46px・相互差 0px）と完全同水準で 2 サンプル一致。kana-converter 等 3 件目以降の比較基準値として 2 サンプルが確定した。

### 標準パターン通常運用フェーズ初回の油断ゼロ完遂

§補足事項で明文化した 3 点の油断打ち消し策（AP-WF16 reviewer 独立再実行 / AP-WF05 dark mode 撮影 / AP-P21 計測の維持）が本サイクルで functional に機能した:

- **AP-WF16**: lint / format:check / test（4420 件）/ build（3895 ページ）の 4 コマンド全件 reviewer 独立再実行を T-3 / T-4 で履行。cycle-203 T-3 R1 の format:check 虚偽 PASS 同型事故は本サイクルでも再発なし。
- **AP-WF05**: T-1 着手前に baseline 8 枚（ベース 6 枚 + 結果表示済み 2 枚）を dark mode 含めて撮影済。tiles-preview 4 枚 / after 6 枚でも dark mode 必須を履行。
- **AP-P21**: 膨張ゼロ型でも役割分担パターン継続採用 + 4 ケース計測を維持。「膨張ゼロ型だから省略」というショートカット判断（AP-WF09 同型）は発生しなかった。

次回以降の標準パターン通常運用に継承する。

### 観察事項（cycle-205 R1 同型事象の再発有無）

cycle-205 T-4 R1 で観測された「reviewer 長時間応答停止」は本サイクルでは **再発なし**。1 件目の観測サンプルにとどまる。AP 化は引き続き見送り。

### 新規 AP 起票なし

本サイクルは標準パターン通常運用フェーズ初回として位置づけ、AP 新規追加は不要。cycle-203〜205 で確立した既存 AP 運用形（AP-WF16 / AP-WF05 / AP-P21 / AP-WF09）がすべて遵守された。

## 補足事項

- **「淡々と進むはず」という油断を打ち消す**: 本サイクルは **標準パターン通常運用フェーズの初回**である点を明示的に意識する。cycle-200〜205 のように「AP 新規起票」「事後検証 1 件目 / 2 件目」「非同期パターン初挑戦」のような実証目的のメタ要素が薄い分、計画と実装が淡々と進む見通し。逆に「淡々と進むはず」という油断が AP-WF16 reviewer 独立再実行や AP-WF05 dark mode 撮影をスキップする誘因にならないよう、以下を計画書本文で明文化する:
  - T-3 / T-4 で `lint` / `format:check` / `test` / `build` の **4 コマンド全件 reviewer 独立再実行** を本サイクルでも維持する（AP-WF16）。
  - T-1 着手前の baseline 撮影は **dark mode を含めて先に撮る**（AP-WF05 着手前撮影ルール）。tiles-preview / after の撮影も dark mode 必須。「実証目的が薄いから dark mode は省略」のような形式通過（AP-WF09）を発生させない。
  - T-3 / T-4 で AP-P21 textarea 高さ 4 ケース計測（下限 40px 以上 / 相互差 ≤ 2px、cycle-205 実測値 4 ケース全件 46px との一致を確認）を実施する。膨張ゼロ型 2 件目サンプルとしての記録的価値があるため、「実質発生しないリスクなので計測省略」というショートカット判断を回避する。
- **オプション 3 種チェックボックスの将来再検討余地**: 本サイクルでは案 B（固定 All-ON 省略）を採択したが、B-433（localStorage 共有）実装時または来訪者からのオプション需要が定量的に観測された時点で、案 A / C を再検討する余地は残す。本サイクルキャリーオーバーに記載するか否かは PM 判断（観察事項に留めるか backlog 登録するか）。
- **cycle-205 観察事項の再発確認**: cycle-205 T-4 R1 で観測された「初回 reviewer の応答停止」は 1 件目の観察サンプルにとどまり AP 化見送り。本サイクルで再発したら `docs/anti-patterns/workflow.md` への AP 追加を検討する。
- **MCP ツール（Playwright / GA）の前景実行**: T-1 baseline / T-4 tiles-preview / T-4 after の Playwright 撮影、および AP-P21 計測の DOM 計測は CLAUDE.md「Use foreground sub-agent for MCP tools」に従い前景サブエージェントで実施する。背景モードでは MCP ツールが使えない。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（T-1〜T-3 R1 Pass、T-4 R1 で MINOR-1/2 のみ指摘 → 本作業で解消）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
