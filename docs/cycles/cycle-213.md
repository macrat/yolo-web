---
id: 213
description: B-314 Phase 8.1 第 14 弾 = password-generator 新デザイン移行 + タイル化（単純構造ツール継続 / M1a 一般来訪者の普遍的需要「パスワード生成」をタイル動線「ボタン一発生成 → コピー」最短UXで提供）
started_at: 2026-05-27T23:21:53+0900
completed_at: 2026-05-28T03:30:13+0900
---

# サイクル-213

このサイクルでは、`password-generator` ツールの詳細ページを新デザイン（`(legacy)` → `(new)`）に移行し、トップページからの最短動線となるツールタイルを新規実装する。**Phase 8.1 第 14 弾**として、cycle-200〜212 で確立した単純構造ツールの移行運用パターンを踏襲しつつ、M1a 一般来訪者（オンラインサービス登録時にパスワードが必要な人）の普遍的需要に対して「タイル上でボタン一発生成 → コピー → 元の作業に戻る」という最短UXを提供する。

## 実施する作業

- [x] /cycle-planning で作業計画を立てる
- [x] T-1: 現状把握と移行前 baseline 取得（旧トークン残存実測 / 既存テスト件数確認 / baseline スクリーンショット撮影 / TILE_DECLARATIONS 実測値訂正 13 件確定 / reviewer PASS NIT-1 1 件は PM 即時編集で計画書修正済）
- [x] T-2: 詳細ページ (new) 配下移行 + 旧トークン置換 + meta.ts 棚卸し + 既存 backlog 連動更新
- [x] T-3: PasswordGeneratorTile.tsx 新規実装 + Tile テスト追加 + TILE_DECLARATIONS 登録（tilesCount: 13 → 14 / Tile テスト 13 件全件緑 / 論点 B 採択を `useState` 遅延初期化に進化 / reviewer r2 PASS）
- [x] T-4: 検証と統合確認（AP-P21 計測 + cycle-200〜212 SSoT 引用検証 + lint/format/test/build 全 PASS）

## 作業計画

### 目的

#### 誰のために

- **M1a（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）**: オンラインサービスの新規アカウント登録時 / Wi-Fi パスワード設定時 / API キーや初期パスワード作成時 / 共有用に使い捨てパスワードが欲しい時 / 既存パスワードを定期更新したい時、といった「ランダムなパスワード文字列を 1 つ欲しい」という単一の用事で検索流入する初回来訪者層。likes「ページを開いた瞬間に入力欄が見える」「コピペで結果を受け取って元の作業に戻れる」「外部に送られない安心感」（= ブラウザ完結 + サーバー送信なし）に直結する。`search_intents` には `"パスワード生成"` が既に登録済（**実測値** / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml:30`）。
- **M1b（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）**: アカウント管理業務 / 開発者の API キー量産 / IT 担当者の社内アカウント発行などで定形的にパスワード生成を反復する来訪者。likes「ブックマーク URL でツールがすぐ表示される」「サイト内ツールの操作性・トーン&マナーの一貫性」（cycle-205 hash-generator / cycle-211 image-base64 / cycle-212 image-resizer タイルとの操作モデル整合）に直結する。dislikes「URL 変更でリダイレクト未設定」を `(legacy) → (new)` 移行で踏まないことが必須。
- **S1（Web サイト製作を学びたいエンジニア / `docs/targets/Webサイト製作を学びたいエンジニア.yaml`）**: 開発時のテストアカウント / DB シード / トークン生成などの開発用途。タイル動線優先層ではないが、`crypto.getRandomValues` を用いたブラウザ完結のエントロピー計算実装パターンへの技術的興味が howItWorks 価値を持つ層として詳細ページ移行の恩恵を受ける。

#### 何のためにやるのか / どんな価値を提供するか

1. **来訪者価値の核心（CLAUDE.md Decision Making Principle 準拠）**: `password-generator` は `(legacy)` 配下に残存しており、ダークモード対応・新トークン体系・モバイルタップターゲット改善が来訪者にまだ届いていない。同時にトップページに「パスワード生成 → コピー」の最短動線が存在しないため、M1a の最も多い初回流入面（トップ）から普遍的需要に応えられていない。本サイクルで両方を解消する。
2. **新デザイン詳細ページ移行**: `Component.module.css` 内の旧トークン（`--color-*` 系 = **16 箇所 / 7 種 / 実測値** = T-1 で再実測 + Component.tsx の `strengthColors` 内 hex 直書き 4 箇所 + CSS 内 `#fff` 1 箇所）を新トークン（`--bg` / `--fg` / `--accent` / `--danger` / `--warning` / `--success` 等）に一括置換。cycle-203〜212 で確立済の SSoT マッピング 9 種を踏襲し、本サイクルでは hex → 強度色トークン（`--danger` / `--warning` / `--success` / `--accent`）の置換が **新規 4 種マッピング**として加わる（後述 §引用する SSoT）。
3. **タイル動線による最短 UX = M1a 普遍的需要への直接応答**: 競合調査（`docs/research/2026-05-28-password-generator-competitor-analysis.md` / **実測値**）から、英語圏大手 3 社（1Password / Bitwarden / LastPass）+ Graviness は**ページロード時自動生成**で「1 クリック = コピー完結」を実現済。yolos.net 現状は「2 クリック（生成 → コピー）」で 1 クリック分の摩擦がある。タイル化 + 自動生成型（後述 §論点 B）で**「トップ → タイル上で 1 クリックコピー」= 競合最短値を超える 0 ナビゲーション体験**を提供する。
4. **差別化軸の最大活用**: 競合調査結果から yolos.net の保持すべき差別化軸は (i) ブラウザ完結 + サーバー送信なし (ii) シンプル + 広告なし (iii) **記号デフォルトオン**（Bitwarden / 1Password はデフォルトオフ / **仕様値** = `src/tools/password-generator/logic.ts:9-15` 4 文字種すべて `true`）(iv) **デフォルト 16 文字**（**仕様値** = `logic.ts:9` length=16 / 競合大手 12〜20 文字より長め）(v) **エントロピー計算による 4 段階強度評価**（`evaluateStrength` / **実測値** = `logic.ts` export 5 種）。タイル UI ではこれらをそのまま継承する。
5. **画像入力型 N=2（cycle-211 + cycle-212）完了直後の momentum 活用 + ボタン押下型 SSoT 再利用**: cycle-200〜212 で「ボタン押下型単純構造ツール」の SSoT は cycle-205 hash-generator（kind=widget / cols=3 rows=2 / `crypto.subtle.digest` 非同期）で確立済 + cycle-209 line-break-remover 等で再現済。本サイクルは「ボタン押下型 + マウント時自動生成 + コピーボタン文言変化 + 強度バー」という構造で、過去 SSoT を**ボタン押下型単純構造ツール SSoT として 4 回目以降の引用適用**する（経験的暫定値 ±10%）。

#### viewport 採用方針

AP-WF05 網羅性ルールに従い、cycle-200〜212 と同型の **w375 / w1200 / w1900**（タイルプレビューは w1200 / w375）を採択する。light / dark の 2 モード × 3 viewport = **6 系統**を AP-P21 / 視覚回帰の両方で網羅する。

#### 「単純構造ツールゆえの油断」打ち消し策

本サイクルは「ボタン押下型 + マウント時自動生成 + コピーボタン文言変化 + 強度バー」という比較的単純な構造だが、過去 13 サイクルの中で**画像入力型 N=2 直後の momentum を活かしつつ、単純構造ツール経験的暫定値 ±10% を引用適用する**。油断ポイントとして以下を計画段階で明示し履行する（MINOR-5 対応 = 本サイクル独自リスク 3 点を冒頭で強調 + 既存 AP 群の継続履行を末尾に簡潔化）:

**本サイクル独自の重要リスク 3 点**（過去 13 サイクルに前例がない構造的新規性）:

- **(本サイクル独自リスク 1) 「パスワードは秘密情報」配慮**: 生成されたパスワードは「秘密情報」であり、`role="status" aria-live="polite"` を付けると AT がパスワード文字列を読み上げる可能性がある（盗み聞きリスク）。後述 §論点 F でこの ARIA 設計を独立論点化する。これは過去 13 サイクルで前例のない**本サイクル独自の新規 SSoT 候補**。
- **(本サイクル独自リスク 2) マウント時自動生成型タイル初出**: cycle-200〜212 のタイル 13 件すべて「ユーザー操作起点」だが、本サイクルは「マウント時自動生成」= タイル表示時点で副作用（`crypto.getRandomValues` 呼び出し）が発生する初の構造。React StrictMode 下の二重 mount / Hydration mismatch / SSR 静的生成との関係を T-1 で実体確認する。
- **(本サイクル独自リスク 3) 強度バー = 固定高さ要素を操作側に配置**: 強度に応じて色が変わる要素は AP-P21 の役割分担パターン（操作側 `flexShrink:0` / 膨張側 `flex:1` + `overflowY:auto`）（cycle-210 L37 SSoT 引用 / 後述「AP-P21 役割分担」と表記）で「操作側 `flexShrink:0` 配下の固定高さ要素」として扱う必要がある。色変化は AP-P21 高さ計測には影響しない見込みだが計画段階で確認しておく。

その他の油断ポイント:

- **「再生成」ボタン文言変化**: cycle-205 hash-generator / cycle-211 image-base64 / cycle-212 image-resizer で「コピーボタン文言変化（コピー → コピー済み → 自動復帰）」が確立済（cycle-212 §補足事項 (x) SSoT 再評価結果 = AP-P21 適用外）。本サイクルでもこの SSoT を引用適用する。
- **OGP / SNS シェア時の挙動**: タイル状態でスクショ撮影 + SNS シェアされた場合、表示中のパスワードが画像に残る。タイル UI の OGP 自動生成は本サイクル対象外（タイル UI は OGP 経路ではない）だが、計画段階で「秘密情報を表示する UI である」前提を明示しておく。**本論点は §キャリーオーバー で B-460（仮 / 秘密情報 SNS 露出リスク SSoT 化）として完了時に正式起票**（Owner-PM 課題対応 / 本サイクル内ではスコープ外）。
- **既存 `Component.test.tsx` 不在問題**（**実測値** / `ls src/tools/password-generator/__tests__/` → `logic.test.ts` のみ）は B-449 / B-455 / B-458 同型の新規 backlog として独立扱いとし、本サイクル内では Tile テストのみ新規追加（過剰スコープ膨張を防止 / cycle-211 / cycle-212 同型運用）。
- **既存 AP 群の継続履行**: AP-WF03 / AP-WF05 / AP-WF12 / AP-WF16 / AP-P16（4 分類ラベル必須 + 生成元 literal 直近併記）/ AP-P17 / AP-P20 / AP-P21（役割分担パターン = 操作側 `flexShrink:0` / 膨張側 `flex:1` + `overflowY:auto`）/ AP-I11 を継続履行する。
- 計画書本文に登場するすべての数値 literal に「実測値 / 仕様値 / 実装値 / 推定値 + 経験的暫定値」の 4 分類ラベル + 生成元（コマンド or ファイルパス + 行番号）を直近に併記する（AP-P16 強化）。

### 作業内容

タスク分割の基本は cycle-200〜212 で確立した 4 タスク構成（T-1 現状把握 → T-2 詳細ページ移行 → T-3 タイル定義 → T-4 検証）を踏襲する。具体的なコード / 設定ファイルは builder が決定し、本計画書では各タスクの**目的・実施事項のリスト・完成条件**のみを literal 確定する（AP-P20 過剰具体化を回避）。

#### T-1: 現状把握と移行前 baseline 取得

**目的**: 移行作業の起点を確定し、後工程で「変更前後の差分」を客観的に比較できる素材を揃える。hash-generator パターン（ボタン押下型 / kind=widget / `crypto.subtle.digest` **非同期 = Promise を返す**）との突合 / 本サイクル password-generator は `crypto.getRandomValues` **同期 = Uint32Array に書き込み即返却 = mount 時自動生成可能**な構造差を T-1 で実体確認する（MDN 仕様 = `crypto.getRandomValues()` は同期的に値を書き込む / `crypto.subtle.digest()` は Promise を返す非同期 API / **仕様値** = W3C Web Cryptography API 仕様）。

**実施事項**:

- `src/tools/password-generator/` 配下のファイル構成、`logic.ts` の export、`meta.ts` の `keywords` / `faq` / `relatedSlugs` 周辺、既存テスト件数を grep / Read で実体確認（数値はすべて grep コマンドを併記して引用付き報告 = AP-P16 / AP-WF12 対策）。
- 主要事実の参考値（**実測値ラベル = planner 計画段階で実測 / T-1 builder が再実測必須**）:
  - `Component.tsx` 行数 / `Component.module.css` 行数 / `logic.ts` 行数 / `meta.ts` 行数 = **168 / 145 / 71 / 42**（**実測値** / `wc -l src/tools/password-generator/{Component.tsx,Component.module.css,logic.ts,meta.ts}` の出力 = `tmp/research/2026-05-28-password-generator-migration-survey.md` L16-21 引用）
  - `__tests__/logic.test.ts` のテストケース数 = **11 件**（**実測値** / `grep -cE '^\s*(test|it)\(' src/tools/password-generator/__tests__/logic.test.ts` → 11）
  - **Component.test.tsx 不存在**の確認（**実測値** / `ls src/tools/password-generator/__tests__/` → `logic.test.ts` のみ）
  - `Component.module.css` の `--color-*` 残存 = **16 箇所 / 7 種**（**実測値**）。コマンド出力（planner 実測 = 上記 survey レポート L92-108 引用）:
    - `$ grep -c "var(--color-" src/tools/password-generator/Component.module.css` → `16`
    - `$ grep -oE "var\(--color-[a-z-]+" src/tools/password-generator/Component.module.css | sort | uniq -c` →
      - `1 var(--color-bg`
      - `2 var(--color-bg-secondary`
      - `2 var(--color-border`
      - `5 var(--color-primary`
      - `1 var(--color-primary-hover`
      - `4 var(--color-text`
      - `1 var(--color-text-muted`
  - **warning 系トークン使用の有無**: password-generator は `.error` / `.warning` 系の旧トークンを使用していない（**推定値 + 経験的暫定値** = cycle-211 / cycle-212 同型の事前確認 / T-1 builder が `grep -E "warning|error" src/tools/password-generator/Component.module.css` で再確認 / 0 件が期待値）
  - **CSS 内 hex 直書き**: **1 箇所** = `#fff`（**実測値** = survey L116 引用 / `generateButton` の文字色）→ T-2 で `--fg-invert` または `var(--bg)` 等への置換が必要
  - **Component.tsx 内 hex 直書き**: **4 箇所** = `strengthColors` の `#dc3545` (weak) / `#fd7e14` (fair) / `#28a745` (good) / `#007bff` (strong)（**実測値** = `src/tools/password-generator/Component.tsx:20-25` 引用）→ T-2 で `--danger` / `--warning` / `--success` / `--accent` への置換が必要
- **logic.ts export 件数の実測** = **5 種** (`PasswordOptions` / `DEFAULT_OPTIONS` / `generatePassword` / `PasswordStrength` / `evaluateStrength`)（**実測値** = T-1 で `grep -c '^export ' src/tools/password-generator/logic.ts` で再実測 / survey L160-164 引用）
- **DEFAULT_OPTIONS 仕様値**: length=16 / uppercase=true / lowercase=true / digits=true / symbols=true / excludeAmbiguous=false（**仕様値** = `logic.ts` 内 `DEFAULT_OPTIONS` 定義参照 / T-1 で行番号併記して再引用）
- **TILE_DECLARATIONS 現状エントリ件数 = 13 件**（**実測値** / T-1 builder 実測で確定 = `src/tools/generated/tiles-registry.ts:46` の `tilesCount=13` / `grep -c "^\s*slug:" src/tools/_constants/tile-declarations.ts` → 14 だが L82 `slug: string;` 型定義行が 1 件カウントされている / 実エントリは L115（char-count）〜L251（image-resizer）の 13 件 / コマンドは `src/tools/generated/tiles-registry.ts:46` の `tilesCount` を直接 Read するか `grep "domain:" src/tools/_constants/tile-declarations.ts | wc -l` = 13 に変更 / cycle-212 完了時点 = image-resizer 含む）。本サイクル完了時に **14 件**（**実測値計算 = 13 + 1**）となる
- `meta.ts` の `relatedSlugs` = `["hash-generator", "qr-code", "email-validator"]` **3 件**（**実測値** = survey L51 引用）。全件実在を grep 実証
- **既存 11 件 logic test の全件緑確認**: `npm run test -- password-generator` で **11 件**（**実測値**）全件緑（実測コマンド出力を引用付き報告）
- **既存 Component.tsx の UI 構造実測**: 文字数スライダー（min=8 / max=128 / 仕様値 = `Component.tsx:68-69` 引用）+ 大文字 / 小文字 / 数字 / 記号 / 紛らわしい文字除外 の 5 チェックボックス + 強度バー（強度ラベル + 強度値 + 強度メーター width 25/50/75/100%）+ 「パスワード生成」ボタン + 結果表示（`<code>` + コピーボタン / コピー後「コピー済み」2 秒間表示）。**入力テキストエリアなし**（survey L191-192 引用）= ボタン押下型単純構造ツールの典型
- **strengthLabels 文字列実測**: weak=「弱い」/ fair=「普通」/ good=「良い」/ strong=「強い」（**実測値** = `Component.tsx:13-18` 引用 / 各 2 字）
- **競合調査結果の引用先確認**: `docs/research/2026-05-28-password-generator-competitor-analysis.md` が既に存在（**実測値** / `ls docs/research/2026-05-28-*` → 1 ファイル）。本サイクルは**この調査結果を一次資料**として参照する
- **画像入力型タイル 2 件（image-base64 / image-resizer）+ ボタン押下型タイル件数の確認**: `grep -lE 'FileReader|type="file"' src/tools/*/[A-Z]*Tile.tsx` で画像入力型 **2 件**実測 / 残り **11 件**（**実測値計算 = 13 - 2**）はテキスト型 + ボタン押下型混在 / 本サイクル password-generator は「入力欄なし + ボタン押下型 + 自動生成」の単純構造としては 13 件中初のパターン（推定値 = T-1 で `grep` 確認）
- **`src/app/globals.css` のトークン定義実測**（CRIT-1 対応 / planner 実測完了）: `grep -nE '^\s*--(danger|danger-soft|danger-strong|warning|warning-soft|warning-strong|success|success-soft|success-strong|accent|accent-strong|accent-soft|fg-invert|fg-invert-soft|bg|bg-soft|bg-softer|fg|fg-soft|fg-softer|border|border-strong)\b' src/app/globals.css` でライト `:root`（L9-73）+ ダーク `:root.dark`（L76-148）の両方に 12 種マッピング先（`--bg` / `--bg-soft` / `--border` / `--accent` / `--accent-strong` / `--fg` / `--fg-soft` / `--fg-invert` / `--danger` / `--warning` / `--success`）全件定義済を実測。T-1 builder が独立再実行し、0 件のトークンがあれば §論点 D / 強度色マッピング表 (T-2) を再検討する
- **`evaluateStrength` 閾値の実装値確認**（MAJOR-5 対応 / planner 実測完了）: `grep -nE 'weak|fair|good|strong|entropy|40|60|80' src/tools/password-generator/logic.ts` で閾値を実測 = entropy < 40 → weak / < 60 → fair / < 80 → good / >= 80 → strong（**実装値** = `src/tools/password-generator/logic.ts:67-70` 引用）。DEFAULT_OPTIONS（length=16 / 4 文字種オン / charset = 26+26+10+26 = 88 文字）でのエントロピー = 16 × log2(88) ≈ **103.35**（**実測値計算** = `node -e 'console.log(16*Math.log2(88))'` → 103.3506...）→ 103.35 >= 80 → ラベル = **`strong`**（**実装値**）= 強度ラベル「強い」が DEFAULT_OPTIONS で確定。T-3 観点 (v) の assertion はこの実装値 `strong` を前提とする（planner 推定ではなく実装値に基づく）
- Playwright で移行前のスクリーンショットを取得:
  - **ベース 6 枚** = w1200 / w1900 / w375 × ライト・ダーク（AP-WF05）
  - **生成後状態 2 枚** = ライト・ダーク（パスワード生成 + 強度バー反映後）
  - **コピー後状態 2 枚** = ライト・ダーク（「コピー済み」文言表示中）
  - **オプション操作後状態 2 枚** = ライト・ダーク（例: 紛らわしい文字除外 ON + 記号 OFF で強度が weak 寄りに変化した状態）
  - 合計 = baseline **12 枚**（**実測値計算 = 6 + 2 + 2 + 2 = 12** / 保存先 = `tmp/cycle-213/baseline/`）
- 既存テスト全件緑確認: `npm run test -- password-generator` で **11 件**（**実測値**）全件緑（実測コマンド出力を引用付き報告）

**完成条件**:

- [x] 移行前スクリーンショット **計 12 枚**（**実測値計算 = ベース 6 + 生成後 2 + コピー後 2 + オプション操作後 2 = 12**）が `tmp/cycle-213/baseline/` 配下に保存
- [x] 既存テスト全件緑 = `npm run test -- password-generator` の出力を引用付き報告（実測値 **11 件** と T-1 builder 報告値が一致 / 不一致時は実測値を計画書に書き戻し）
- [x] grep 数値が planner 実測値と一致（`--color-*` 残存数 16 / 7 種 / TILE_DECLARATIONS **13 件**（実測値訂正 / planner 当初の 14 件は型定義行 `slug: string;` 誤カウント / T-1 builder で実体確認）/ Component.test.tsx 不存在 / warning 系トークン 0 件 / CSS hex 1 箇所 / Component.tsx hex 4 箇所 / logic.ts export 5 種）
- [x] `meta.ts` `relatedSlugs` **3 件**全件実在
- [x] strengthColors の hex 4 種と CSS `#fff` 1 種の合計 **5 種類の hex 直書き**（**実測値計算 = 4 + 1**）の置換マッピング表が T-2 で完成
- [x] **12 種のマッピング先トークン**（`--bg` / `--bg-soft` / `--border` / `--accent` / `--accent-strong` / `--fg` / `--fg-soft` / `--fg-invert` / `--danger` / `--warning` / `--success`）が `src/app/globals.css` のライト `:root` + ダーク `:root.dark` 両方に全件定義済（CRIT-1 対応）
- [x] `evaluateStrength` 閾値の実装値（< 40 weak / < 60 fair / < 80 good / >= 80 strong）が `src/tools/password-generator/logic.ts:67-70` で確認済 + DEFAULT_OPTIONS でのラベル = `strong`（**実装値計算** = 16 × log2(88) ≈ 103.35）（MAJOR-5 対応）

**T-1 検証手順（AP-WF16）**: builder が grep コマンド全件の出力を引用付き報告 / reviewer が最低 1 つ以上を独立再実行。

---

#### T-2: 詳細ページの (new) 配下移行 + 旧トークン置換 + meta.ts 棚卸し + 既存 backlog 連動更新

**目的**: 詳細ページを新デザイン体系（1200px 標準 / 新トークン）に統一し、`search_intents` 整合性を取り、既存 backlog の対象件数を更新する。

**実施事項**:

- `git mv` で `src/app/(legacy)/tools/password-generator/{page.tsx,opengraph-image.tsx,twitter-image.tsx}` を `src/app/(new)/tools/password-generator/` 配下に移動
- `src/app/(new)/tools/password-generator/page.module.css` を新設（`.page { max-width: 1200px; margin: 0 auto; width: 100%; }` の標準パターン / 直近 13 ツールと完全同一）。`page.tsx` 側に `<div className={styles.page}>` ラッパー追加
- `src/tools/password-generator/Component.module.css` の旧トークン残存 **16 箇所 / 7 種**（**実測値**）+ CSS hex 直書き **1 箇所** + Component.tsx hex 直書き **4 箇所** = **合計 21 箇所 / 11 種**（**実測値計算 = 16 + 1 + 4 / 7 + 1 + 4 = 11 種ではなく、12 種**）の置換を実施
- **置換マッピング表**（cycle-203〜212 SSoT 9 種 + **本サイクル新規 4 種**）:

  | 旧トークン / hex                 | 件数（実測値） | 新トークン                                                                                                  | マッピング根拠                                                                                                                                                        |
  | -------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `--color-bg`                     | 1              | `--bg`                                                                                                      | cycle-203〜212 SSoT                                                                                                                                                   |
  | `--color-bg-secondary`           | 2              | `--bg-soft`                                                                                                 | cycle-205 / cycle-207 / cycle-211 / cycle-212 SSoT 流用                                                                                                               |
  | `--color-border`                 | 2              | `--border`                                                                                                  | cycle-203〜212 SSoT                                                                                                                                                   |
  | `--color-primary`                | 5              | `--accent`                                                                                                  | cycle-203〜212 SSoT                                                                                                                                                   |
  | `--color-primary-hover`          | 1              | `--accent-strong`                                                                                           | cycle-205 / cycle-207 / cycle-211 / cycle-212 SSoT 流用                                                                                                               |
  | `--color-text`                   | 4              | `--fg`                                                                                                      | cycle-203〜212 SSoT                                                                                                                                                   |
  | `--color-text-muted`             | 1              | `--fg-soft`                                                                                                 | cycle-203〜212 SSoT                                                                                                                                                   |
  | CSS `#fff`                       | 1              | `--fg-invert` または `var(--bg)`（builder 裁量 / `--fg-invert` 優先 / hash-generator 等の先例 grep で確定） | **本サイクル新規 4 種マッピングの 1 種目** / cycle-213 で SSoT 候補化                                                                                                 |
  | Component.tsx `#dc3545` (weak)   | 1              | `--danger`                                                                                                  | **本サイクル新規 4 種マッピングの 2 種目** / `src/app/globals.css` L44 の `--danger` 定義参照（**実装値** = ライト `:root` / ダーク `:root.dark` L130 両方に定義済）  |
  | Component.tsx `#fd7e14` (fair)   | 1              | `--warning`                                                                                                 | **本サイクル新規 4 種マッピングの 3 種目** / `src/app/globals.css` L40 の `--warning` 定義参照（**実装値** = ライト `:root` / ダーク `:root.dark` L126 両方に定義済） |
  | Component.tsx `#28a745` (good)   | 1              | `--success`                                                                                                 | **本サイクル新規 4 種マッピングの 4 種目** / `src/app/globals.css` L36 の `--success` 定義参照（**実装値** = ライト `:root` / ダーク `:root.dark` L122 両方に定義済） |
  | Component.tsx `#007bff` (strong) | 1              | `--accent`                                                                                                  | cycle-203〜212 SSoT 再利用（`--accent` を strong に再使用 / 「最強 = サイトの主アクション色」整合）                                                                   |

  合計 **置換 21 箇所** / **12 種**（**実測値計算 = 16 + 1 + 4 / 7 + 1 + 4 = 12**）。T-1 実測値と一致しない場合は本表を再修正。**新規 4 種マッピング**（`#fff` → `--fg-invert`、3 強度 hex → `--danger` / `--warning` / `--success`）は cycle-213 で初確立する SSoT 候補（本サイクル §補足事項 (i) で書き戻し）

- **Component.tsx の hex 置換実装方針**: `strengthColors` の Record 値を CSS 変数文字列（`"var(--danger)"` 等）にする / または `Component.module.css` 内でクラス（`.strengthWeak` / `.strengthFair` / `.strengthGood` / `.strengthStrong`）に分離してインラインスタイル `style={{ color }}` を廃止する（builder 裁量 / `--danger` 等は `src/app/globals.css` で定義済 = T-1 planner 実測完了）。**`--danger-strong` 等の派生トークンが必要になった場合は `src/app/globals.css` の更新も含めて builder が PM 判断**（**実装値** = `--danger-strong` はライト `:root` L45 / ダーク `:root.dark` L131 に定義済 / `--warning-strong` / `--success-strong` / `--accent-strong` も同様に定義済 = `grep -nE '^\s*--(danger|warning|success|accent)-strong' src/app/globals.css` で確認可能）
- 並べ読み突合 grep で他の (new) ツールの使用トークンと一致することを確認（AP-WF12 違反予防）
- w1900 で本文幅が 1200px に収まっていることを確認
- **詳細ページ Component.tsx / Component.module.css は hex / 強度色適用方法（クラス分離 or Record 値書き換え）の切替に伴う最小差分以外は touch しない**（kind=widget 標準パターン継続 / 既存機能は visitor 価値が確立済 / 具体的には Component.tsx の `strengthColors` Record 定義とその参照箇所、および Component.module.css 内 `#fff` 1 箇所 + 強度色クラス追加（採用時のみ） 以外は touch しない）
- **meta.ts の search_intents 整合性確認**:
  - **既存重複検索**: `grep -nE 'パスワード|password' docs/targets/特定の作業に使えるツールをさっと探している人.yaml` → `"パスワード生成"` の 1 件のみ既登録（**実測値** = survey L237-241 引用）
  - **追加候補 4 語の比較表**（cycle-211 / cycle-212 §T-2 同型構造）:

    | 候補語                   | 採択 | 採択理由 / 不採用理由                                                                                          |
    | ------------------------ | ---- | -------------------------------------------------------------------------------------------------------------- |
    | `パスワード 作成`        | ○    | スペース区切りの主流検索パターン / OS 文脈の自然語 / Google サジェスト上位想定                                 |
    | `ランダム パスワード`    | ○    | 競合 LUFT / cman 等が SEO 強い検索意図 / 「ランダム性」訴求 = yolos.net の `crypto.getRandomValues` 実装と整合 |
    | `強いパスワード`         | ○    | M1a 普遍的需要「強度の高いパスワード」が直接検索される語 / 強度バー差別化軸と整合                              |
    | `password 生成`          | ○    | 英日混在の検索パターン / 開発者層（M1a の API キー需要 + S1）の自然語                                          |
    | `パスワード 生成 ツール` | ×    | 「ツール」サフィックス付きはロングテール過剰拡張 / `"パスワード 作成"` で十分カバー                            |
    | `パスフレーズ`           | ×    | yolos.net 未実装機能 / 検索意図不一致 / 別途 backlog 候補                                                      |

  - **2 案以上の比較（AP-P17）**:
    - **案 X = 4 語追加（採択）**: 上記 ○ の 4 語を T1 yaml `search_intents` 末尾に追加
    - **案 Y = 3 語追加**: `password 生成` を除外 → 開発者層と英日混在検索を逃すため不採用
    - **案 Z = 5 語追加**（「パスワード 生成 ツール」を含む）: ロングテール過剰拡張による検索意図純度低下 → 不採用
    - **案 W = 6 語追加**（「パスフレーズ」も含む）: 未実装機能の検索流入は来訪者期待値とのギャップを生む → 不採用
  - **採択結果 = 案 X / 4 語確定**: `パスワード 作成` / `ランダム パスワード` / `強いパスワード` / `password 生成` を T-2 で T1 yaml に追加

- **backlog 連動更新**:
  - **B-455 / B-458 系**（Component.test.tsx 不在問題）: 本サイクル T-1 実測「Component.test.tsx 不存在 + 11 件 logic test のみ」を踏まえ、cycle-211 / cycle-212 同型の新規 backlog として **B-459** を起票（**実測値** = `grep -oE "^\| B-[0-9]+" docs/backlog.md | sort -u | tail -1` → `B-458` が最新 = 次の空き番号は **B-459** / planner 計画段階で確定）（着手条件なし / P4 / Component.test.tsx 新規作成スコープ）。なお Owner-PM 課題対応で「秘密情報 SNS 露出リスク SSoT 化」も新規起票候補 = **B-460** として §キャリーオーバーに記載（本サイクル完了時に正式起票）
  - **B-456**（画像入力型タイル AP-P21 役割分担パターンの ±15% 経験的暫定値 = cycle-211 補足事項 (ii) SSoT の N≥3 件見直し / 旧表記「AP-P21 (v)」は cycle-211/212 補足事項 (v) 由来のサブ番号であり AP-P21 本文には存在しないため厳密化）: 本サイクルは画像入力型ではないため直接影響なし / 据置き
  - **B-314 Phase 8.1 全体進捗**: 全 34 ツール中本サイクル完了で **14 件目**（**実測値計算 = 13 + 1**）/ 残 20+ 件 / 進捗欄を更新

**完成条件**:

- [x] `/tools/password-generator` が (new) 配下で正常表示（HTTP 200 OK）
- [x] 旧 (legacy) パスにファイルが残存していない（3 ファイル全件削除済）
- [x] w1200 / w1900 / w375 で表示崩れがない（T-4 視覚回帰で確認済 / after スクショ 15 枚で並べ読み比較 PASS）
- [x] `Component.module.css` 内に `--color-*` 系旧トークンが残存しない: `grep -c "var(--color-" src/tools/password-generator/Component.module.css` → `0`
- [x] CSS `#fff` 1 箇所 + Component.tsx hex 4 箇所が新トークンに置換済: `grep -E '#fff|#dc3545|#fd7e14|#28a745|#007bff' src/tools/password-generator/{Component.tsx,Component.module.css}` → `0` 件（コメント行のみ）
- [x] T1 yaml にパスワード生成系検索意図 **4 語**が追加されている（案 X 採択分）
- [x] **B-459**（`docs/backlog.md` Queued セクション L100 に追記済）
- [x] `meta.ts` `relatedSlugs` **3 件**全件実在の再確認（touch 不要）
- [x] **新規 4 種マッピング**（`#fff` / `#dc3545` / `#fd7e14` / `#28a745`）が §補足事項 (α) に SSoT として書き戻し済（T-4 完了）

**T-2 検証手順（AP-WF16）**: builder が残存判定 grep / 200 OK 確認 / T1 yaml diff / backlog 更新箇所の grep を引用付き報告 / reviewer が最低 1 つ以上を独立再実行。

---

#### T-3: タイル定義（kind=widget + ボタン押下型 + 自動生成型 SSoT 確立）

**目的**: トップページから 1 タップで起動可能なタイル UI を新設。Phase 8.1 第 14 弾の構造的新規性（**ボタン押下型 + マウント時自動生成 + 強度バー + コピーボタン文言変化**）の SSoT を cycle-205 / cycle-211 / cycle-212 から引用適用しつつ、マウント時自動生成型の新パターンを SSoT 化する。

**実施事項**:

- **kind 判定**: password-generator の詳細ページ Component は「文字数スライダー + 5 チェックボックス + 強度バー + 生成ボタン + 結果表示 + コピーボタン」で縦に並ぶが、タイルでは詳細オプションを省略しタイル単体で完結する設計のため **kind=widget**（cycle-205 hash-generator / cycle-211 / cycle-212 と同型）
- タイル用コンポーネント `src/tools/password-generator/PasswordGeneratorTile.tsx` を新規実装
  - CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 14 タイルと同型）
  - **論点 A〜I 採択結果（後述）に従って UI を構築**
  - `logic.ts` の既存 export（`generatePassword` / `DEFAULT_OPTIONS` / `evaluateStrength`）を再利用
  - **省略要素**（§論点 C 採択結果）: 文字数スライダー / 5 チェックボックス / 紛らわしい文字除外オプション（詳細ページへ全委譲）
  - **残す要素**（§論点 B 案 B1 + §論点 D 案 D1 + §論点 I 案 I1 採択反映）: マウント時自動生成済パスワード表示（`<code>` 1 行）/ 強度バー（小サイズ）/ 「コピー」ボタン（押下後「コピー済み」表示 → 2 秒後自動復帰）/ 「再生成」ボタン / 「オプションを設定して生成 →」詳細ページリンク
  - 末尾「オプションを設定して生成 →」`<Link>` 配置（§論点 I 案 I1 採択 = 詳細リンクテキストは「オプションを設定して生成 →」）
  - **AP-I11 setTimeout cleanup**: コピーボタン文言復帰の 2 秒タイマー（cycle-205 / cycle-211 / cycle-212 SSoT 同型）= `useRef<NodeJS.Timeout | null>` + `useEffect` cleanup で React StrictMode 下二重実行に対応
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に password-generator のエントリ追加（**recommendedSize = §論点 A 採択 = 第一推奨 cols=3 rows=2 / T-3 Playwright 実機確認で最終確定**）
- `npm run generate:tiles-registry` で codegen 実行（tilesCount: **13**（**実測値** / T-1 で確定）→ **14**（**実測値計算 = 13 + 1**））

**T-3 設計論点: タイル用テストの観点**

タイル用コンポーネントのテストを追加する。**最低 10 件**（**経験的暫定値** = cycle-205 hash-generator = 8 件と同等以上 / 本サイクルはマウント時自動生成 + 強度バー + コピーボタン文言変化 + 再生成 の構造的新規性で観点を加算 = 計 10 件以上）を**ボタン押下型 + マウント時自動生成型タイル固有の観点**として確立する。各観点の具体的な assertion 文言・入力値・モック実装は builder 裁量（AP-P20 / AP-WF03 過剰具体化を回避）。

- 観点 (i) **マウント時自動生成**（§論点 B 案 B1 採択 = 初回 render 時点で `<code>` 内にパスワード文字列が DOM 存在 / 16 文字 / DEFAULT_OPTIONS 全文字種オン）
- 観点 (ii) **再生成挙動**（再生成ボタン押下 → `<code>` 内のパスワード文字列が変化 / 連続 2 回押下で別文字列が生成される / `crypto.getRandomValues` モック有無の判定）
- 観点 (iii) **コピー挙動**（コピーボタン押下 → `navigator.clipboard.writeText` モックが正しいパスワード文字列で呼ばれる）
- 観点 (iv) **コピーボタン文言変化**（コピー後 「コピー」 → 「コピー済み」 / 2 秒後自動復帰 / `vi.useFakeTimers()` + `vi.advanceTimersByTime(2000)` で復帰検証）
- 観点 (v) **強度バー表示**（§論点 D 案 D1 採択 = 強度バーが DOM に存在 / DEFAULT_OPTIONS（length=16 / 4 文字種オン / charset=88 / entropy ≈ 103.35 / `logic.ts:67-70` 閾値 >= 80 = `strong` / **実装値** = planner 計画段階で実測完了）では `evaluateStrength` が **`strong`** を返し、強度ラベル「強い」（**実装値** = `Component.tsx:13-18` 引用）が DOM 表示されることを assertion）
- 観点 (vi) **詳細ページリンク**（`/tools/password-generator` を指す / リンクテキスト「オプションを設定して生成 →」/ §論点 I 案 I1 採択反映）
- 観点 (vii) **ARIA / 秘密情報配慮**（§論点 F 採択結果 = `<code>` 要素には `aria-live` を付けない / または `aria-live="off"` 明示 / 強度ラベル側に `role="status" aria-live="polite"` 付与で「秘密情報」を AT 読み上げ対象から除外 / 詳細は §論点 F）
- 観点 (viii) **コピー失敗時のフォールバック**（`navigator.clipboard` 未定義環境 = 旧ブラウザ / 非 secure context での挙動 / try/catch 内サイレント or 「コピーできません」フォールバック文言表示 / cycle-205 hash-generator フォールバック SSoT 同型 / 文言の最大長を §論点 G で確定）
- 観点 (ix) **再生成 + コピー連続挙動**（再生成 → コピー → 再生成 = コピー済み文言がリセットされる、または継続する / 仕様確定は §論点 E）
- 観点 (x) **AP-I11 setTimeout cleanup**（コピーボタン文言復帰 2 秒タイマー実行中にコンポーネントがアンマウントされた場合の memory leak 防止 / `vi.useFakeTimers()` + コンポーネント unmount + setTimeout 残存 ID の clearTimeout 検証）

**完成条件**:

- [x] `TILE_DECLARATIONS` に password-generator が追加されている（**§論点 A 採択 = cols=3 rows=2 第一推奨 / T-3 実機確認で確定**）
- [x] codegen 成功し `tilesCount=14` になる（**実測値計算 = 13 + 1 = 14**）
- [x] `PasswordGeneratorTile.tsx` のテスト **10 件以上**（**経験的暫定値**）が緑（観点 (i)〜(x) を全て含む / 実測 13 件全件緑）
- [x] タイル UI 上で「マウント時自動生成 → コピー」のフローが観点 (i)(iii) で実証 + DOM 検証 PASS
- [x] 詳細ページ Component.tsx / Component.module.css が「hex / 強度色適用方法切替に伴う最小差分」以外で touch されていない（`git diff src/tools/password-generator/Component.tsx src/tools/password-generator/Component.module.css` が hex 関連の差分のみ = `strengthColors` Record 定義 + 参照箇所 + CSS 内 `#fff` + 強度色クラス追加（採用時のみ））
- [x] AP-I11 setTimeout cleanup 観点が PASS（観点 (x) / cycle-211 / cycle-212 SSoT 同型 / `vi.getTimerCount()` 直接検証で確認）

**T-3 検証手順（AP-WF16）**: builder が `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の 4 コマンド全件の出力を引用付き報告 / reviewer が 4 コマンド全件を独立再実行。

---

#### T-4: 検証と統合確認（AP-P21 計測 + cycle-200〜212 SSoT 引用検証 + AP-WF16 全件再実行）

**目的**: 「単純構造ツールゆえの油断」打ち消し策を完全実施し、来訪者に届く品質を保証する。**ボタン押下型 + マウント時自動生成型タイル**の AP-P21 計測 3〜4 系統を実施し、cycle-200〜212 SSoT 引用適用結果を §補足事項として SSoT 書き戻しする。

**実施事項**:

- `/internal/tiles/preview/tools/password-generator` での単独レンダリング検証（Playwright w1200 / w375 × ライト / ダーク = **計 4 枚**）
- 移行後のスクリーンショット **計 12 枚**（T-1 と同型）を再撮影（`tmp/cycle-213/after-t4/`）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないこと（`/tools/password-generator` で 200 OK）
- タイルプレビュー上の動作確認:
  - マウント時自動生成（初期 16 文字パスワードが既に `<code>` に表示されている）
  - コピーボタン押下 → クリップボードコピー成功 → 「コピー済み」表示 → 2 秒後「コピー」に復帰
  - 再生成ボタン押下 → 別の 16 文字パスワードに置き換わる
  - 強度バーの色 + 幅変化（DEFAULT_OPTIONS では `strong` レベル想定 = 100% width / `--accent` 色）
  - 詳細リンク押下 → `/tools/password-generator` 詳細ページに遷移
  - キーボード操作: Tab で focus → Enter / Space で各ボタン押下 / `tabIndex` 制御
- **【AP-P21 計測：ボタン押下型 + マウント時自動生成型タイル「3〜4 系統独立」計測 / 軸 = 高さ計測】（§論点 G 採択結果に従う）**:
  - **(a) マウント時表示** = タイトル + パスワード `<code>` + 強度バー + コピーボタン + 再生成ボタン + 詳細リンクの `getBoundingClientRect()` 高さを計測
  - **(b) 再生成後** = 別パスワード文字列に置き換わった状態の高さを計測（文字数は同じ 16 文字想定 = (a) と差ゼロが期待値）
  - **(c) コピー後** = コピーボタン文言が「コピー済み」に変化した状態の高さを計測（cycle-211 (x) / cycle-212 (x) SSoT 引用適用 = 文言変化は AP-P21 適用外 = 操作側 `flexShrink:0` 配下 / (a) との差ゼロが期待値）
  - **(d) エラー時**（§論点 G 採択 = 含める / オプション組み合わせで全文字種オフ時のエラー or コピー API 未対応時のエラー = §論点 G で確定）
  - **判定基準**（cycle-200〜212 SSoT 引用適用 = ボタン押下型単純構造ツール経験的暫定値 ±10%）:
    - (i) **下限 40px 以上**（**経験的暫定値** = AP-P21 SSoT / 全 3〜4 ケース、全要素）
    - (ii) **構造変化を許容**（cycle-211 (i) 引用 = 「マウント時 / 再生成後 / コピー後 / エラー」の 3〜4 系統独立評価 / 系統間比較は適用外）
    - (iii) **各系統内変化率 ±10%**（**経験的暫定値** = ボタン押下型単純構造ツール = cycle-205 / cycle-209 / 同型値 / 画像入力型 ±15% より厳しい）
    - (iv) **コピーボタン文言変化は AP-P21 適用外**（cycle-211 (x) / cycle-212 (x) 引用 SSoT / 操作側 `flexShrink:0` 配下 / cycle-213 で 3 回目の引用適用 = SSoT 強化）
- **【ブラウザ API 確認】** cycle-210 / cycle-211 / cycle-212 同型 2 項目:
  1. Hydration warning 0 件
  2. `crypto.getRandomValues` がブラウザ環境で利用可能（モック不要 + Secure Contexts 確認）
- **【cycle-200〜212 SSoT 引用適用結果の §補足事項 書き戻し】**:
  - **(α) 9 種マッピング表 + 新規 4 種マッピング**（T-2 で確立）を §補足事項 (i) に SSoT として書き戻し
  - **(β) コピーボタン文言変化 AP-P21 適用外**（cycle-211 / cycle-212 で 2 回 SSoT 確立 / 本サイクルで 3 回目 = 確定 SSoT 化）を §補足事項 (ii) に書き戻し
  - **(γ) 操作側 `flexShrink:0` / 膨張側 `flex:1` 二分類**（cycle-210 L37 SSoT / cycle-212 で spinner も flexShrink:0 配下 / 本サイクルで強度バーが flexShrink:0 配下に該当）を §補足事項 (iii) に書き戻し
  - **(δ) AP-I11 setTimeout cleanup**（cycle-211 / cycle-212 / 本サイクル = 3 連続 = SSoT 確立）を §補足事項 (iv) に書き戻し
  - **(ε) ボタン押下型単純構造ツール経験的暫定値 ±10%**（cycle-205 / cycle-209 / 本サイクル）を §補足事項 (v) に SSoT として書き戻し
  - **(ζ) 秘密情報配慮 ARIA 設計**（§論点 F 採択結果 = `<code>` は `aria-live` なし / 強度側に `role="status"` 付与）を §補足事項 (vi) に**本サイクル独自の新規 SSoT 候補**として書き戻し
  - **(η) マウント時自動生成型タイル SSoT**（§論点 B 案 B1 採択結果 = マウント時自動生成パターン / 競合英語圏大手 3 社準拠）を §補足事項 (vii) に**本サイクル独自の新規 SSoT 候補**として書き戻し
- **B-456（画像入力型タイル AP-P21 役割分担パターンの ±15% 経験的暫定値 = cycle-211 補足事項 (ii) SSoT の N≥3 件見直し）に関する記述**: 本サイクルは画像入力型ではないため進捗影響なし / §補足事項 **(ι)** に「N=2 据置き / 次回画像入力型サイクルで N=3 達成見込み」と明示（T-4 時点で (θ) = コピーボタン文言変化 N=3 SSoT 拡張が追加されたため (ix) ではなく (ι) に繰り下げ）

**完成条件**:

- [x] 全検証項目クリア。lint / format / test / build 全 4 コマンド exit code 0 で完了（lint PASS / format:check PASS / test 4510 件全件緑 / build tilesCount=14 PASS）
- [x] Playwright スクショ枚数: baseline 12 + tiles-preview 4 + after 12 = **計 28 枚以上**（**実測値計算 = 12 + 4 + 15 = 31 枚**）が `tmp/cycle-213/` 配下に保存（after-t4 = 15 枚 / 完成条件超過 PASS）
- [x] AP-P21 計測 (a)〜(d) **4 系統独立**実測値が引用付き報告され、§補足事項に SSoT として書き戻し: (a) マウント時 / (b) 再生成後 / (c) コピー後 の 3 系統 PASS + (d) エラー時は「`navigator.clipboard.writeText` を `throw` するモック設定 + Playwright 再現スクリプト（`measure-error.mjs`）で再現可能、silent fail・構造変化なし確認」として計測実施（T-4-report.md §1 参照）
- [x] `TILE_DECLARATIONS` の tilesCount が **13 → 14**（**実測値計算 = 13 + 1**）に増えたことを `src/tools/generated/tiles-registry.ts` で直接 Read 確認（L47: `// Count at generation time: tilesCount=14`）
- [x] ブラウザ API 確認 2 項目 PASS（Hydration warning 0 件 / `crypto.getRandomValues` 利用可能）
- [x] cycle-200〜212 SSoT 引用適用結果 (α)〜(ε) + 本サイクル独自の新規 SSoT 候補 (ζ)(η)(θ) + B-456 進捗 (ι) が §補足事項 に書き戻し（T-4 完了時 §補足事項 セクション全文記載済み）

**T-4 検証手順（AP-WF16）**: builder が全実測値を引用付き報告 / reviewer が (i) 自動チェック 4 コマンド独立再実行、(ii) AP-P21 **3〜4 系統独立計測のうち最低 1 ケース**を独立再現、(iii) ブラウザ API 2 項目のうち最低 1 項目を独立再計測。

---

### 論点と判断

以下の論点について「採用案 / 検討した他案 / 判断理由」を明記する。**PM 判断は planner が行う**（owner 承認不要）。仮説の根拠が薄い論点は「T-X で実機確認後に確定」と明示する。すべての数値 literal には 4 分類ラベル（実測値 / 仕様値 / 実装値 / 推定値 + 経験的暫定値）+ 生成元（コマンド or ファイルパス + 行番号）を直近に併記する（AP-P16 強化）。AP-P17 に従い、各論点で**来訪者価値 → 範囲整合 → 規模 → 歯止め** の 4 軸評価を実施。

#### 論点 A: タイルの recommendedSize

**第一推奨 = 案 A1（cols=3 rows=2 = 400×264px = 仕様値）/ T-3 Playwright 実機確認で確定**

- **要素数（推定値 + 経験的暫定値 / §論点 B 案 B1 + §論点 C 全委譲 + §論点 D 案 D1 + §論点 I 案 I1 採用反映）**: タイトル + パスワード `<code>` 1 行 + 強度バー（強度ラベル + 強度メーター = 1 行）+ コピーボタン + 再生成ボタン（2 ボタン横並べ = 1 行）+ 詳細リンク = **5〜6 要素 / 行数 5**。cycle-205 hash-generator（6〜7 要素 / cols=3 rows=2 採用）と同等規模 = cols=3 rows=2 で収まる見込み
- **案 A1: cols=3 rows=2 (400×264px = 仕様値)** ← **採択**
  - **来訪者価値**: M1a 最短動線 / トップから 1 タップ + 1 クリック完結
  - **範囲整合**: cycle-205 hash-generator と同枠 = 操作モデル一貫
  - **規模**: 過去 14 タイル中 cols=3 rows=2 は複数件先例あり（hash-generator / char-count 等）
  - **歯止め（退避案 A2 cols=3 rows=3 への切替トリガー）**:
    - **(1) §論点 D 案 D1 採用の強度バーが (a) マウント時系統の総高さで cols=3 rows=2 枠超過した場合**（T-3 実機確認で判定）
    - **(2) コピー / 再生成 2 ボタン横並べが w375 で折り返し or タップターゲット 44×44px 確保不能の場合**（T-3 builder 判定）
- **案 A2: cols=3 rows=3 (400×400px = 仕様値)**: 縦長で要素を余裕を持って配置可能。退避案として保持。M1b の操作モデル一貫性（hash-generator と同枠）からは A1 優位
- **案 A3: cols=4 rows=2 (536×264px = 仕様値)**: 横長。パスワード文字列を 1 行で広く表示可能だが、w375 で横スクロール発生リスク（cycle-210 / cycle-211 退避案と同型懸念）/ 過去採用先例なし → 不採用

#### 論点 B: 自動生成 vs 手動生成（マウント時挙動）

**採用案 = 案 B1（マウント時に自動生成）**

| 案                                      | 構成                                                                     | 来訪者価値                                                                       | 範囲整合                                                                         | 規模                          | 歯止め                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| **B1: マウント時自動生成** ← **採択**   | タイルレンダリング時点で 16 文字パスワード生成済 / コピー 1 クリック完結 | **最大** = 競合最短値（英語圏大手 3 社 + Graviness の標準）に一致 / M1a 最短動線 | 競合差別化軸 (iii)(iv)(v)（記号オン + 16 文字 + 強度メータ）を保持しつつ動線短縮 | useEffect マウント時 1 行追加 | パスワード生成は `crypto.getRandomValues` 同期処理 = `<1ms` 高速 / マウント遅延なし |
| B2: ボタン押下で初回生成                | 詳細ページの現状 = 「パスワード生成」ボタン押下が必要                    | 中（2 クリック必要 = 競合より 1 クリック遅い）                                   | yolos.net 現状維持                                                               | 0 行                          | -                                                                                   |
| B3: マウント時 + 自動再生成（N 秒ごと） | 一定時間後に勝手にパスワードが変わる                                     | 低（コピー前に文字列が変わると混乱 / 来訪者意図と不一致）                        | 競合先例なし                                                                     | 過剰                          | -                                                                                   |

**採用根拠**:

- 競合調査結果（`docs/research/2026-05-28-password-generator-competitor-analysis.md` L434-436 引用 = 「### 実装推奨優先度」見出し + 「1. タイルロード時の自動生成: …」項目 / `awk 'NR>=434 && NR<=436' docs/research/2026-05-28-password-generator-competitor-analysis.md` で再現可能）が明示する「実装推奨優先度 1 = タイルロード時の自動生成」に直接対応
- yolos.net 現状の弱み「ページロード後に手動生成が必要 = 2 クリック」（同 L334-336 引用 = 「### 弱み」見出し + 「1. ページロード後に手動生成が必要」項目 / `awk 'NR>=334 && NR<=336' docs/research/2026-05-28-password-generator-competitor-analysis.md` で再現可能）を解消する唯一の方法
- 競合英語圏大手 3 社 + Graviness の **N=4 先例**があり実装パターンが確立済
- CLAUDE.md Decision Making Principle = 「最も成果を得られる選択肢を、実装工数を理由に妥協しない」と整合

#### 論点 C: タイルに含めるオプションの粒度

**採用案 = 案 C1（オプション全委譲 / タイルにはオプション操作 UI を含めない）**

| 案                                                  | 構成                                                                                       | 来訪者価値                                               | 範囲整合                                      | 規模                                       | 歯止め                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| **C1: 全委譲（タイルにオプションなし）** ← **採択** | DEFAULT_OPTIONS（16 文字 / 4 文字種オン）でマウント時自動生成 / オプション変更は詳細ページ | M1a 最短動線最大 / 「素早く 1 つ欲しい」需要に 100% 適合 | 競合英語圏大手 3 社（オプション最小化）と同型 | UI 要素最小 = cols=3 rows=2 で確実に収まる | 来訪者がカスタマイズしたい場合は詳細リンクで遷移可能 |
| C2: 部分提供（長さスライダーのみ）                  | スライダー追加 / 8〜128 文字を 1 タイル内で変更可能                                        | 中（カスタマイズ可能だがタイル面積を圧迫）               | LUFT / cman 日本語圏競合と同型                | UI 要素+1 / cols=3 rows=3 検討必要         | スライダーのモバイル UX 課題（タップ精度）           |
| C3: 部分提供（文字種チェック 4 個含む）             | 文字種 4 チェックボックス + 長さスライダー                                                 | 低（オプションノイズが「素早く 1 つ欲しい」と矛盾）      | 詳細ページの劣化コピーになる                  | UI 要素+5 / cols=3 rows=4 必要             | M1a の利用シーンから乖離                             |

**採用根拠**:

- 競合調査の §5「タイル化における最小機能セット」(`competitor-analysis.md` §5 全体 = L346 開始 / 必須機能テーブル L352-360 / **割愛可能テーブル L362-370** / 追加差別化テーブル L371-381 / `awk 'NR>=346 && NR<=381' docs/research/2026-05-28-password-generator-competitor-analysis.md` で再現可能) が明示する「割愛可能（詳細ページに委譲）」項目 4 種（文字数スライダー / 文字種チェック / 紛らわしい文字除外 / 強度メーター）のうち、強度メーターのみ §論点 D で含める判定 / 残り 3 種は全委譲が正解
- DEFAULT_OPTIONS の現状値（16 文字 + 全文字種オン）が yolos.net の差別化軸 (iii)(iv)（記号オン + 16 文字）を体現しており、変更すると差別化軸が崩れる
- タイル UI の核心は「最短動線」/ オプションは「カスタマイズ層」= 詳細ページの責務

#### 論点 D: 強度バーの表示要否

**採用案 = 案 D1（タイルに強度バー表示 / 小サイズ + 強度ラベル併記）**

| 案                                          | 構成                                                | 来訪者価値                                                                 | 範囲整合                        | 規模                                                                                                     | 歯止め                                                             |
| ------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **D1: 強度バー表示（小サイズ）** ← **採択** | パスワード文字列下に「強度: 強い ████」の 1 行表示  | 差別化軸 (v) を最大流入面でアピール / Bitwarden の crack time 同等の安心感 | yolos.net 差別化軸 (v) と整合   | UI 要素+1 行（高さ約 24-32px / 推定値 + 経験的暫定値 / cycle-205 hash-generator 操作 UI 高さ実測値範囲） | DEFAULT_OPTIONS では常時 `strong` = 視覚ノイズになる可能性は低い   |
| D2: 表示しない                              | パスワード文字列 + コピー / 再生成 / 詳細リンクのみ | 低（差別化軸 (v) が見えない / 競合と区別不能）                             | 競合最小構成と同等 = 差別化なし | UI 要素省略                                                                                              | 強度メーター = エントロピー計算は yolos.net の数少ない技術的差別化 |
| D3: 強度ラベルのみ（バー描画なし）          | 「強度: 強い」テキストのみ                          | 中（テキストのみで視覚インパクト弱）                                       | 中間案                          | UI 要素+0.5 行                                                                                           | バー描画 + ラベルの組み合わせが視覚的に強い                        |

**採用根拠**:

- 競合調査 §5「追加すべき差別化要素」テーブル（`competitor-analysis.md` L371-381 / 「強度バー（小サイズ）」行 = L378 周辺 / `awk 'NR>=371 && NR<=381' docs/research/2026-05-28-password-generator-competitor-analysis.md` で再現可能）= 「強度バー（小サイズ）」推奨判定が明示
- yolos.net の数少ない技術的差別化軸 (v)（エントロピー計算）をトップで可視化する唯一の方法
- 強度バーは AP-P21 の役割分担パターン（操作側 `flexShrink:0` / 膨張側 `flex:1` + `overflowY:auto` / cycle-210 補足事項 (v) SSoT）で「操作側 `flexShrink:0` 配下の固定高さ要素」として配置 = 高さ計測影響なし

#### 論点 E: 「再生成」ボタン文言変化と「コピー」ボタン文言変化の組み合わせ

**採用案 = 案 E1（コピーボタン文言変化 cycle-211 / cycle-212 SSoT 引用適用 + 再生成は文言変化なし）**

| 案                                                           | コピー挙動                                                          | 再生成挙動                        | 来訪者価値                                                       | 範囲整合                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| **E1: コピーボタン文言変化 + 再生成文言変化なし** ← **採択** | 「コピー」→「コピー済み」（2 秒で復帰）= cycle-211 / cycle-212 SSoT | 押下時に再生成（文言変化なし）    | cycle-211 / cycle-212 SSoT と完全同型 / リピーターの認知負荷ゼロ | cycle-200〜212 SSoT 整合        |
| E2: コピーボタン文言変化 + 再生成文言変化あり                | 同上                                                                | 「再生成」→「生成しました」→ 復帰 | 低（再生成は瞬間操作 = フィードバック不要）                      | yolos.net 内一貫性なし          |
| E3: コピーボタン文言なし（即時消える）+ 再生成文言なし       | コピーフィードバックなし                                            | 同上                              | 低（コピー成功が分からない）                                     | cycle-211 / cycle-212 SSoT 違反 |

**採用根拠**:

- cycle-211 (x) / cycle-212 (x) で 2 回 SSoT 確立 = 本サイクルで 3 回目の引用適用 = SSoT 確定化
- 再生成は「瞬時に新パスワードが表示される」= 結果自体がフィードバック / 文言変化不要

#### 論点 F: 「秘密情報」配慮の ARIA 設計

**採用案 = 案 F1（パスワード `<code>` には `aria-live` 付与しない / 強度ラベル側に `role="status" aria-live="polite"` 付与）**

| 案                                                               | パスワード要素                                             | 強度ラベル要素                     | 来訪者価値                                                                   | リスク                                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **F1: パスワードは aria-live なし / 強度側に status** ← **採択** | `<code>` 要素 / `aria-live` なし or `aria-live="off"` 明示 | `role="status" aria-live="polite"` | 視覚障害者にも強度情報は届く / パスワード自体は読み上げ対象外 = 秘密情報配慮 | スクリーンリーダー利用者がパスワード変更通知を得られない → 「Tab で `<code>` にフォーカス → 手動読み上げ」で代替可能 |
| F2: 両方に aria-live 付与                                        | `<code>` に `role="status" aria-live="polite"`             | 同上                               | 視覚障害者にもパスワード即読み上げ                                           | **盗み聞きリスク**: AT がパスワード文字列を音声で読み上げ / 公共空間や同室者がいる環境で秘密漏洩                     |
| F3: 両方とも aria-live なし                                      | aria-live なし                                             | aria-live なし                     | 視覚障害者には変更通知が一切届かない                                         | AT 体験劣化                                                                                                          |

**採用根拠**:

- 「秘密情報」を AT 読み上げ対象から除外することはアクセシビリティとセキュリティのトレードオフの最適解 = F1 採択
- 強度ラベル（「強い」/「弱い」等 = 2 字程度）は秘密情報ではないため `role="status"` 付与は安全
- フォーカス時の手動読み上げは AT 標準動作 = 視覚障害者が意図的にパスワードを聞きたい時のみ起動
- 本論点は cycle-200〜212 で確立されていない**本サイクル独自の新規 SSoT 候補** = §補足事項 (vi) に書き戻し

#### 論点 G: AP-P21 計測の系統分け（エラー時系統の扱い）

**採用案 = 案 G2（3 系統 = (a) マウント時 / (b) 再生成後 / (c) コピー後 / (d) エラー時は実機検証で発生条件を確認して追加判定）**

| 案                                               | 系統数                                                              | 系統内訳                                                                           | 範囲整合 |
| ------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- |
| G1: 2 系統                                       | (a) マウント時 / (b) コピー後                                       | cycle-205 と同型 = 単純構造ツール最低限                                            |
| **G2: 3 系統 + エラー時条件付き追加** ← **採択** | (a) マウント時 / (b) 再生成後 / (c) コピー後 + (d) エラー時条件付き | cycle-211 / cycle-212 4 系統との中間 / ボタン押下型単純構造ツール固有              |
| G3: 4 系統強制                                   | (a)(b)(c)(d) すべて強制計測                                         | cycle-211 / cycle-212 画像入力型 4 系統と同等 / エラー発生条件が不自然な場合は過剰 |

**採用根拠**:

- ボタン押下型単純構造ツール = エラー発生条件が画像入力型より少ない（オプション組み合わせで全文字種オフ時 / `navigator.clipboard` 未対応時のみ）
- (d) エラー時の発生条件:
  - **発生条件 (d-α)**: 全文字種オフでオプション組み合わせ不正 → タイル UI ではオプション操作なし（§論点 C 全委譲）= **タイル側では発生しない**
  - **発生条件 (d-β)**: `navigator.clipboard.writeText` reject → 旧ブラウザ or 非 secure context = T-4 で実機再現困難
  - **発生条件 (d-γ)**: `crypto.getRandomValues` 未対応 → IE11 等のレガシー = サポート対象外
- T-4 builder 判定: (d) エラー時計測は (d-β) のみ Playwright で `navigator.clipboard.writeText` を `throw` するモックで再現可能 / 再現できれば計測 / 再現困難なら 3 系統で完結
- 経験的暫定値 ±10% を 3 系統に適用 = cycle-200〜212 SSoT 整合

#### 論点 H: search_intents 追加候補確定 + `meta.ts` keywords との重複論点

**採用案 = 案 H1（4 語追加 = `パスワード 作成` / `ランダム パスワード` / `強いパスワード` / `password 生成`）+ keywords 重複是認**

§T-2 の比較表参照（同論点を T-2 実施事項に組み込み済）。本論点は T-2 builder の T1 yaml diff で最終確定する。

**`meta.ts` keywords 5 件と T1 yaml 追加候補 4 語の重複論点（MAJOR-6 対応）**:

`src/tools/password-generator/meta.ts:10-16` の `keywords` = `["パスワード生成", "パスワード作成", "ランダムパスワード", "安全なパスワード", "パスワードジェネレーター"]` **5 件**（**実装値** = planner Read 完了 / `meta.ts:11-15` 引用）。T1 yaml 追加候補 4 語と以下のように対応する:

| meta.ts keywords                     | T1 yaml 追加候補                      | 関係                                                              |
| ------------------------------------ | ------------------------------------- | ----------------------------------------------------------------- |
| `パスワード生成`                     | (既登録 = `パスワード生成`)           | 既存 T1 yaml `search_intents` L30 と完全一致 = 重複なし           |
| `パスワード作成`（スペースなし）     | `パスワード 作成`（スペースあり）     | スペース有無のみの差分 = 別検索クエリとして両方カバーする意義あり |
| `ランダムパスワード`（スペースなし） | `ランダム パスワード`（スペースあり） | 同上 = スペース有無で別クエリ                                     |
| `安全なパスワード`                   | `強いパスワード`                      | 別語 = 重複なし / 「安全」と「強い」は意味的に近接                |
| `パスワードジェネレーター`           | (なし)                                | meta.ts のみ                                                      |
| (なし)                               | `password 生成`                       | T1 yaml のみ追加 = 英日混在クエリ                                 |

**スペース有無のみの差分を T1 yaml に追加する意義**:

- meta.ts keywords は HTML `<meta name="keywords">` 経由の補助シグナル（現代の Google では効果限定的）
- T1 yaml `search_intents` は **ターゲット M1a の検索クエリ実体カバレッジ**を定義する一次資料 = 別目的
- Google サジェスト / 実検索ログでは「パスワード作成」「パスワード 作成」両方が独立クエリとして観測される（経験的暫定値 / Google サジェスト直接観測は本サイクル対象外）
- T1 yaml 側はスペースありを採択することで「検索意図実体としての別クエリ」をカバー / meta.ts はスペースなしのまま据置 = 役割分担

**AP-P17 ゼロベース比較に追加する縮約案**:

- **案 X = 4 語追加（採択 / 既存）**: スペース有無差分 2 語 + 別語 2 語 = 4 語
- **案 X' = 3 語縮約（追加検討）**: `password 生成` / `強いパスワード` / `ランダム パスワード` の 3 語に縮約 / `パスワード 作成` を除外（meta.ts `パスワード作成` でスペースなし版がカバー済 = 重複是認）
- **案 X'' = 2 語縮約（追加検討）**: `password 生成` / `強いパスワード` の 2 語のみ追加 / スペース差分 2 語を除外（過剰登録回避を最大化）

**採用根拠（4 語維持）**:

- M1a 普遍的需要のカバレッジ最大化が来訪者価値最大化に直結（CLAUDE.md Decision Making Principle）
- T1 yaml 過剰登録による副作用は「リスト管理コスト」のみ = 実害なし
- スペース有無で別クエリとなる Google 検索仕様 = 両方カバーが正解
- → **案 X 採択 / 案 X' / X'' は不採用**

#### 論点 I: 詳細リンクテキスト

**採用案 = 案 I1（「オプションを設定して生成 →」）**

| 案                                            | テキスト                                                                             | 来訪者価値 |
| --------------------------------------------- | ------------------------------------------------------------------------------------ | ---------- |
| **I1: オプションを設定して生成 →** ← **採択** | カスタマイズ層への明確な導線 / 競合調査 §5「タイル化における最小機能セット」推奨表現 | 高         |
| I2: 詳細ページで全機能 →                      | 「全機能」が抽象的                                                                   | 中         |
| I3: もっとカスタマイズ →                      | カジュアル / 来訪者意図と整合的だが意味曖昧                                          | 中         |
| I4: 詳細を見る →                              | サイト内一貫表現だが特異性なし                                                       | 低         |

**採用根拠**:

- 競合調査結果 §5 (`competitor-analysis.md` L392 引用) で推奨されている表現を直接採用
- 「オプション」と「生成」の 2 語が両方含まれることで、リンク先で何ができるかが一目で分かる
- M1a の「カスタマイズしたい時のみ詳細へ」「素早く 1 つ欲しい時はタイルで完結」の動線分岐が明確

---

### 引用する SSoT

本サイクルで引用 / 再利用する SSoT を列挙する（cycle-211 / cycle-212 同型構造）。

1. **cycle-203〜212 9 種マッピング表**（cycle-211 §T-2 L114-127 SSoT / cycle-212 §T-2 L128-139 SSoT）→ password-generator の `--color-*` **16 箇所 / 7 種**に**全引用適用**（warning 系トークン使用なし = 既存 9 種すべて流用 + **本サイクル新規 4 種マッピング**を追加）
2. **本サイクル新規 4 種マッピング**（CSS `#fff` → `--fg-invert` / Component.tsx 3 強度 hex → `--danger` / `--warning` / `--success`）= 本サイクル §補足事項 (i) で SSoT 化 / 後続の hex 直書き残存ツール（meta 集計で件数把握 = builder 確認）に引用可能
3. **コピーボタン文言変化 AP-P21 適用外**（cycle-211 (x) / cycle-212 (x) で N=2 SSoT 確立 / 本サイクルで **N=3 確定化**）
4. **操作側 `flexShrink:0` / 膨張側 `flex:1` 二分類**（cycle-210 L37 SSoT / cycle-212 で spinner も flexShrink:0 配下）→ 本サイクル強度バーが flexShrink:0 配下に該当
5. **AP-WF05 viewport 網羅性ルール**: w375 / w1200 / w1900 + light / dark = 6 系統
6. **AP-I11 setTimeout cleanup**: コピーボタン文言復帰の 2 秒タイマーで useRef + useEffect cleanup（cycle-211 / cycle-212 / 本サイクル = 3 連続 SSoT）
7. **kind=widget 標準パターン**（cycle-200〜212 で 13 件確立 / 本サイクル 14 件目）
8. **ボタン押下型単純構造ツール経験的暫定値 ±10%**（cycle-205 / cycle-209 等で確立 / 画像入力型 ±15% より厳しい）
9. **新規 SSoT 候補 (ζ)**: 秘密情報配慮 ARIA 設計（§論点 F 採択結果）= 本サイクル独自で確立
10. **新規 SSoT 候補 (η)**: マウント時自動生成型タイル SSoT（§論点 B 案 B1 採択結果）= 本サイクル独自で確立

---

### 検討した他の選択肢と判断理由

#### 本サイクル対象選定の代替案

- **代替案 1: 複合入力型 N=2（text-diff / regex-tester）**: SSoT 引用検証鮮度の観点で価値があるが、Phase 8.1 残り 20+ ツールで後続消化可能 / M1a 普遍的需要（パスワード生成）の優先度が高い
- **代替案 2: 画像入力型 N=3（B-318 系 / 画像形式変換等）**: 規模が大きく単一サイクル不可 / B-456 N=3 達成は次回画像入力型サイクルで対応
- **代替案 3: ボタン押下型単純構造ツール他候補（dummy-text / json-formatter / uuid-generator 等）**: 来訪者価値（M1a 普遍的需要）で password-generator が最大 = `search_intents` に既登録 + 競合調査済 = 計画立案コスト最小
- **採択結果 = password-generator**: PM 判断 = M1a 普遍的需要 + 競合差別化軸明確 + 既存調査資産活用 = 来訪者価値最大化

#### Component.test.tsx 新規作成スコープを本サイクルに含めるか

- 案 X: 含める = B-449 / B-455 / B-458 系のスコープ拡大 → 過剰スコープ膨張リスク
- **案 Y: 含めない（採択）** = cycle-211 / cycle-212 同型運用 / 新規 backlog **B-459**（planner 確定 = backlog.md 最新 B-458 の次）として独立扱い = サイクル粒度の安定化

#### CSS `#fff` の置換先トークン選定

- 案 α: `--bg`（背景色を反転利用） = ライト / ダーク両モードで自動的に色反転 / 概念的にやや遠回り
- **案 β: `--fg-invert`（採択候補 / builder 裁量で最終確定）** = 「文字色の反転」を直接表現 / 既存 (new) ツールで先例 grep で確認 / 概念整合性高
- 案 γ: `#fff` のまま据置 = 旧トークンと同じ問題（ダークモード非対応）が残るため不採用

#### 強度色マッピングの代替案

- 案 i: weak=`--danger` / fair=`--warning` / good=`--success` / strong=`--accent`（**採択**）
- 案 ii: weak=`--danger` / fair=`--warning` / good=`--accent` / strong=`--accent-strong` = good と strong の区別が弱い / `--success` を活用しない
- 案 iii: weak=`--danger` / fair=`--danger-soft` / good=`--success` / strong=`--success-strong` = 「強度上昇 = success 系」直感的だが weak と fair の区別が弱い

**採用根拠**: yolos.net の (new) デザイントークンに `--success` / `--warning` / `--danger` / `--accent` の 4 種が定義済 = 全活用が SSoT 整合 / 強度 4 段階 × トークン 4 種が 1:1 対応 = 認知負荷最小

---

### 計画にあたって参考にした情報

1. **password-generator 現状調査レポート**: `tmp/research/2026-05-28-password-generator-migration-survey.md`（**実測値**ベースのファイル構成 / トークン残存 / UI 構造 / logic.ts export 等）
2. **競合調査レポート**: `docs/research/2026-05-28-password-generator-competitor-analysis.md`（**実測値** + Playwright 実機確認 = 2026-05-28 / 英語圏大手 3 社 + 日本語圏 4 社 + RANDOM.ORG + Graviness = 8 サイト棚卸し / タイル設計推奨仕様 / 差別化軸評価）
3. **cycle-212**（直前サイクル / 画像入力型 N=2）: `docs/cycles/cycle-212.md` の §論点 / §補足事項 / §キャリーオーバー（9 種マッピング SSoT / spinner 中間状態 SSoT / AP-I11 SSoT）
4. **cycle-211**（画像入力型 N=1 + (i)〜(x) 補足事項 SSoT 確立元）: `docs/cycles/cycle-211.md`
5. **cycle-209**（line-break-remover = 単純構造ツール直近）: `docs/cycles/cycle-209.md`
6. **cycle-205**（hash-generator = ボタン押下型先例 / kind=widget cols=3 rows=2 / `crypto.subtle.digest` 非同期 / コピーボタン文言変化 SSoT 確立）: `docs/cycles/cycle-205.md`
7. **CLAUDE.md / docs/constitution.md / docs/anti-patterns/**: AP-I10 / AP-I11 / AP-P16（強化 4 分類 + 生成元 literal 直近併記）/ AP-P17 / AP-P20 / AP-P21 / AP-WF03 / AP-WF05 / AP-WF12 / AP-WF16
8. **docs/targets/**: M1a `特定の作業に使えるツールをさっと探している人.yaml`（`"パスワード生成"` 既登録の実測確認）/ M1b `気に入った道具を繰り返し使っている人.yaml` / S1 `Webサイト製作を学びたいエンジニア.yaml`
9. **`src/tools/password-generator/`**: Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/logic.test.ts` の Read による実測
10. **`src/tools/_constants/tile-declarations.ts`**: 既存 **13 件**（**実測値** / T-1 builder 実測 = `tiles-registry.ts:46` `tilesCount=13` / cycle-212 完了時点）のタイル定義
11. **`src/app/globals.css`**: `--danger` / `--warning` / `--success` / `--accent` / `--fg-invert` 等のデザイントークン定義の Read 確認（**実測値** = planner Read 完了 / ライト `:root` L9-73 / ダーク `:root.dark` L76-148 両方に 12 種マッピング先全件定義済 / 0 件のトークンが見つかった場合は §論点 D / 強度色マッピング (T-2) を再検討）

## レビュー結果

### 計画レビュー

- **r1 → r5 一括（計画書執筆時に reviewer 1 名にレビュー依頼）**: CRIT 1 件 + MAJOR 6 件 + MINOR 5 件 + NIT 1 件 + Owner-PM 課題 1 件 = 計 14 件指摘
  - CRIT-1: `(new)/globals.css` 不存在ファイル参照 → 全 6 箇所を `src/app/globals.css` に修正 + T-1 にトークン定義実測指示追加
  - MAJOR-1: 競合調査引用行番号 4 箇所ズレ → `awk 'NR>=X && NR<=Y'` 実体確認後修正 + 再現コマンド併記
  - MAJOR-2: 「AP-P21 (v)」サブ番号表記濫用 → 「AP-P21 の役割分担パターン（操作側 flexShrink:0 / 膨張側 flex:1 + overflowY:auto / cycle-210 補足事項 (v) SSoT）」に統一
  - MAJOR-3: T-1 にトークン定義実測指示追加 + 完成条件に「12 種マッピング先全件定義済」追加
  - MAJOR-4: 「hex 部分以外 touch しない」とクラス分離案の整合性 → 「最小差分以外 touch しない」に修正
  - MAJOR-5: `evaluateStrength` 閾値を計画段階で実測（logic.ts:67-70 = weak<40/fair<60/good<80/strong>=80）+ DEFAULT_OPTIONS で entropy ≈ 103.35 → `strong` を実装値として観点 (v) assertion 確定
  - MAJOR-6: §論点 H に meta.ts keywords 5 件と T1 yaml 追加 4 語の重複論点セクション追加 + 案 X / X' / X'' ゼロベース比較
  - MINOR-1〜5 / NIT-1 / Owner-PM 課題: 全件対応（詳細は L155〜L450 各論点参照）
- **r5 再レビュー（同一 reviewer）**: 前回 14 件すべて解消確認 / 新規 CRIT / MAJOR の発生なし / **CRIT 0 / MAJOR 0 / MINOR 0 / NIT 0 / Owner-PM 0 = 計 0 件 = PASS**
  - 実体ファイル（globals.css / logic.ts / meta.ts / 競合調査 / backlog.md / TILE_DECLARATIONS）と突き合わせて数値 literal・行番号引用・実測値計算が全件一致を確認
  - AP-P16 強化（実測値 / 仕様値 / 実装値 / 推定値 + 経験的暫定値 + 生成元 literal 直近併記）の網羅性が前回比で大幅向上
  - charset = 88 文字 / entropy ≈ 103.35（`node -e 'console.log(16*Math.log2(88))'`）/ 閾値 40/60/80 / B-458 最新 → B-459 / B-460 / globals.css L9-73 / L44 等の新規追加 literal すべて 4 分類ラベル + 生成元併記済

### 実装レビュー

- **T-1 r1（実装レビュー）**: PASS（CRIT 0 / MAJOR 0 / MINOR 0 / NIT 1）
  - NIT-1: TILE_DECLARATIONS 実エントリ数の計画書誤記（14 件 → 実測 13 件 / 型定義行 `slug: string;` 誤カウント）→ PM 即時編集経路 (AP-WF09 (b)) で計画書 L49 / L90 / L96 / L111 / L210 / L230 / L285 / L529 の 8 箇所を 13 / 14 に統一修正
  - 独立検証: builder 報告の全実測値（行数 / テスト件数 / トークン残存 / hex 数 / globals.css 12 種トークン定義 / baseline スクショ 12 枚）が reviewer 独立計測で一致確認
- **T-2 r1（実装レビュー）**: 改善指示（CRIT 0 / MAJOR 1 / MINOR 3 / NIT 2 = 計 6 件）
  - MAJOR-1: backlog.md L106 B-460 が 4 列構造で他 Deferred 行（B-456/B-457 = 5 列）と不整合 → builder 修正
  - MINOR-1: T-2 report 集計値に AP-P16 4 分類ラベル + 生成元併記欠落 → builder 修正
  - MINOR-2: `.next/dev/types/validator.ts` stale cache 残存（build は PASS）→ T-2 report に注記追加
  - MINOR-3: cycle-213.md L180-188 T-2 完成条件チェックボックス未付与 → builder 修正
  - NIT-1: T-2 report 集計の分け方の表記揺れ → MINOR-1 と同時解消
  - NIT-2: OGP 経路注記 → backlog B-460 / T-2 report 両方に追記
- **T-2 r2（実装レビュー）**: PASS（CRIT 0 / MAJOR 0 / MINOR 0 / NIT 0 = 計 0 件）
  - 前回 6 件すべて解消確認 / 新規問題の発生なし
  - 独立検証: `var(--color-*)` 残存 0 / hex 0 / lint PASS / format:check PASS / vitest 4497 件全件緑 / (legacy) 削除確認 / backlog 列構造 6 pipes 統一確認
- **T-3 r1（実装レビュー）**: 改善指示（CRIT 0 / MAJOR 1 / MINOR 2 / NIT 1 = 計 4 件）
  - 論点 B「`useEffect` → `useState` 遅延初期化」変更を **reviewer 承認**（hydration 直後の空表示フリッカ回避 + lint エラー回避 + StrictMode 二重実行回避 = 来訪者価値向上 / SSoT (η) でも望ましい）
  - MAJOR-1: 観点 (iii) 再生成テストが `expect(typeof before).toBe("string")` で意味のないアサーション → `expect(after).not.toBe(before)` + 連続 2 回押下検証に強化
  - MINOR-1: 観点 (viii) AP-I11 cleanup が `console.error` 検証のみ（React 18 で警告削除済のため検出不能） → `vi.getTimerCount()` 直接検証に置換
  - MINOR-2: `vi.useFakeTimers()` の対象限定推奨 → コメント追記
  - NIT-1: PasswordGeneratorTile.tsx L22 コメントが `useEffect` のまま残存 → `useState 遅延初期化` に修正
- **T-3 r2（実装レビュー）**: PASS（CRIT 0 / MAJOR 0 / MINOR 0 / NIT 0 = 計 0 件）
  - 前回 4 件すべて解消確認 / 新規問題の発生なし
  - **ミューテーション検出力の独立検証**: reviewer が実装側に意図的バグ混入 → 観点 (iii) (viii) が確実に赤化することを確認（他 12 件は緑のまま）
  - 独立検証: vitest 13 件全件緑 / lint PASS / format:check PASS / build PASS（tilesCount=14）/ test 全体 4510 件 PASS / TILE_DECLARATIONS 登録確認
- **T-4 r1（実装レビュー）**: 改善指示（CRIT 0 / MAJOR 0 / MINOR 1 / NIT 2 = 計 3 件）
  - MINOR-1: §補足事項 (θ) ラベル二重定義（完成条件 L287 = B-456 進捗 / 本文 L660 = コピーボタン N=3）→ 完成条件を「(ζ)(η)(θ) + B-456 進捗 (ι)」に修正 + 本文 (ι) ラベル明示
  - NIT-1: T-4 report AP-P21 集計表のラベル併記が一括方式 → 列ヘッダに `[実測値 / measure-precise.mjs]` 個別併記強化
  - NIT-2: §補足事項 (α) 表の hex 値が Tailwind 系誤記（`#dc2626/#d97706/#16a34a/#2563eb`）→ Bootstrap 系実体（`#dc3545/#fd7e14/#28a745/#007bff` / Component.tsx:21 引用）に統一修正
- **T-4 r2（実装レビュー）**: 改善指示（CRIT 0 / MAJOR 0 / MINOR 2 / NIT 0 = 計 2 件）
  - MINOR-1: T-4 r1/r2 のレビュー履歴が §レビュー結果未追記 → 本セクションに追記（本コミット）
  - MINOR-2: T-1/T-2/T-3 完成条件チェックボックスが多数 `[ ]` のまま → PM 即時編集 (AP-WF09 (b)) で T-1 6 件 / T-2 2 件 / T-3 6 件を [x] に更新
- **T-4 r3（PM 即時編集後の整合確認）**: 最終 PASS 想定（builder/PM 運用記録の補完のみ / 実体 fact は r1/r2 で全件確認済）

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>
- **B-460（仮 / 本サイクル完了時に正式起票）**: 秘密情報を表示する UI（パスワード生成 / OAuth トークン / API キー等）の SNS シェア / スクリーンショット / OGP 自動生成時のリスク対策 SSoT 化。Owner-PM 課題対応 = 本サイクル §「単純構造ツールゆえの油断」打ち消し策 で「OGP / SNS シェア時の挙動」リスクを認識したが、本サイクル内ではスコープ外として処理。優先度 = P3 / 着手条件 = 秘密情報を扱う 2 件目以降のツール（OAuth token generator / API key generator 等）が backlog に登場した時点。**B-460** = `grep -oE "^\| B-[0-9]+" docs/backlog.md | sort -u | tail -1` → B-458 / **B-459** が Component.test.tsx 不在対応で本サイクル T-2 で起票済 → 次の空き番号 **B-460** を本サイクル完了時に正式起票

## 補足事項

### cycle-200〜212 SSoT 引用適用結果 + 本サイクル独自新規 SSoT

**(α) 9 種マッピング表 + 新規 4 種マッピング（T-2 確立 / §補足事項 (i)）**

cycle-200〜212 で確立した 9 種マッピング（`--color-bg → --bg` / `--color-bg-secondary → --bg-soft` / `--color-border → --border` / `--color-primary → --accent` / `--color-primary-hover → --accent-strong` / `--color-text → --fg` / `--color-text-muted → --fg-soft` / `--color-error → --danger` / `--color-error-bg → --bg-soft`）を password-generator T-2 で全引用適用 PASS（16 箇所置換完了 / `var(--color-*)` 残存 0 件 / hex 4 箇所 + CSS `#fff` 1 箇所の計 5 箇所も置換）。本サイクルで新規 4 種マッピングを追加確立:

| 旧表現（hex 直書き / **実測値** `Component.tsx:21` コメント行） | 新表現（CSS 変数） | 用途             |
| --------------------------------------------------------------- | ------------------ | ---------------- |
| `#dc3545`                                                       | `var(--danger)`    | 強度 weak の色   |
| `#fd7e14`                                                       | `var(--warning)`   | 強度 fair の色   |
| `#28a745`                                                       | `var(--success)`   | 強度 good の色   |
| `#007bff`                                                       | `var(--accent)`    | 強度 strong の色 |

これにより cycle-200〜213 通算マッピング種数 = **13 種確立**（9 種継承 + 4 種新規）。

**(β) コピーボタン文言変化 AP-P21 適用外 N=3 確立（§補足事項 (ii)）**

- cycle-211 (x): image-base64 コピーボタン文言幅 51→73px (+43%) = 操作側 `flexShrink:0` 配下の文言変化として AP-P21 適用外（SSoT N=1）
- cycle-212 (x): image-resizer 同型引用適用 PASS（SSoT N=2）
- cycle-213 (c): password-generator コピーボタン「コピー」→「コピー済み」文言変化 = 高さ変化 0px / AP-P21 適用外（SSoT N=3 = 確定 SSoT 化）

**後続サイクル planner**: コピーボタン文言変化（height / width の変動）は AP-P21 系統内変化率 ±10% 判定の**適用外**として引用可（N=3 確立）。

**(γ) 操作側 `flexShrink:0` / 膨張側 `flex:1` 二分類（§補足事項 (iii)）**

- cycle-210 L37 SSoT: 複合入力型タイルでの役割分担パターン確立
- cycle-212: spinner も flexShrink:0 配下に配置（画像入力型で再確認）
- cycle-213: 強度バー（固定高さ 4px + ラベル 28.39px 合計）= 操作側 `flexShrink:0` 配下の固定高さ要素として配置 = 色変化のみで高さ不変（計測 PASS）

**後続サイクル planner**: 操作側 `flexShrink:0` = タイトル / 操作 UI / 固定高さ情報要素 / ボタン / 詳細リンク / 強度バー。膨張側 `flex:1 + overflowY:auto` = 長さ可変な出力エリア（textarea / 出力欄等）。

**(δ) AP-I11 setTimeout cleanup N=3 連続 SSoT 確立（§補足事項 (iv)）**

- cycle-211: image-base64 コピーボタン 2秒タイマー（初出）
- cycle-212: image-resizer spinner 遅延表示タイマー（N=2）
- cycle-213: password-generator コピーボタン 2秒タイマー（N=3 = 確定 SSoT 化）

**後続サイクル planner**: `setTimeout` / `setInterval` 発火時は必ず `useRef` で ID 保持 + `useEffect` cleanup で `clearTimeout` / `clearInterval`（AP-I11）。

**(ε) ボタン押下型単純構造ツール経験的暫定値 ±10% 本サイクル実測値（§補足事項 (v)）**

本サイクル AP-P21 計測結果（w1200 headless / tiles preview / light モード / **実測値 = `measure-precise.mjs` T-4**）:

| 要素                     | (a) マウント時 h | (b) 再生成後 h | (c) コピー後 h | 系統内変化率 | 判定 |
| ------------------------ | ---------------- | -------------- | -------------- | ------------ | ---- |
| タイトル `<p>`           | 20.39px          | 20.39px        | 20.39px        | 0%           | PASS |
| パスワード `<code>`      | 41.80px          | 41.80px        | 41.80px        | 0%           | PASS |
| 強度バー `[role=status]` | 28.39px          | 28.39px        | 28.39px        | 0%           | PASS |
| 再生成ボタン             | 32px             | 32px           | 32px           | 0%           | PASS |
| コピーボタン             | 32px             | 32px           | 32px           | 0%           | PASS |
| 詳細リンク               | 20.39px          | 20.39px        | 20.39px        | 0%           | PASS |

系統内変化率 **全件 0% = ±10% 経験的暫定値を大幅に下回る PASS**。メインコンテンツ要素 `<code>` = 41.80px（≥40px 基準 PASS）。ボタン = 32px（単純操作系 UI は 40px 未満が許容される / cycle-211 コピーボタン 31px PASS と同型）。

**(ζ) 秘密情報配慮 ARIA 設計（本サイクル独自の新規 SSoT N=1 / §補足事項 (vi)）**

- パスワード表示 `<code>` 要素: **`aria-live` を意図的に付与しない**（盗み聞きリスク回避 = AT がパスワード文字列を自動読み上げするリスクを排除）
- 強度ラベル `<div role="status" aria-live="polite">`: 強度テキスト「強い」「弱い」等（2〜3 字 = 秘密情報ではない）のみを AT に通知

**後続サイクル planner**: OAuth token / API key generator 等の秘密情報を扱うツールのタイル実装で本パターンを引用可。N=1 暫定 SSoT として次サイクル以降で N≥2 による見直しを推奨。

**(η) マウント時自動生成型タイル SSoT（本サイクル独自の新規 SSoT N=1 / §補足事項 (vii)）**

- **採択経路**: `useState` 遅延初期化（initializer 関数）による同期呼び出し
- `useEffect` 内での `setState` を回避 → `react-hooks/set-state-in-effect` lint エラー回避
- React StrictMode 二重実行でも初回マウント時に 1 回だけ生成（二重生成なし）
- Hydration mismatch 回避（SSR 時 `crypto.getRandomValues` は Node.js / Edge 両対応）
- hydration 直後の空表示フリッカなし（`password` state が初期値から非空文字列で開始）

```tsx
const [password, setPassword] = useState<string>(() =>
  generatePassword(DEFAULT_OPTIONS),
);
```

**後続サイクル planner**: マウント時に同期 API で値を生成するタイル（dice roll / 乱数生成 / UUID 等）は `useEffect` ではなく `useState` 遅延初期化を使用（N=1 SSoT / cycle-213 T-3 reviewer 承認）。

**(θ) コピーボタン文言変化 AP-P21 適用外 N=3 + role="status" SSoT 拡張（§補足事項 (viii)）**

- cycle-211 (x) / cycle-212 (x) = コピーボタン文言変化 AP-P21 適用外（N=2 確立）
- cycle-213 = 3 回目の引用適用で N=3 達成 → **正式 SSoT 化**（将来サイクルでの前例数 PASS）
- `role="status"` 付与方針（cycle-212 (viii) γ 拡張）: 「強度ラベルのみに付与 / `<code>` パスワードには付与しない」= 秘密情報配慮 ARIA 設計 (ζ) と整合

**(ι) B-456 進捗: 画像入力型タイル AP-P21 ±15% 経験的暫定値 N=2 据置き**

本サイクルは画像入力型ではないため B-456 進捗なし。N=2 据置き。次回画像入力型サイクル（B-318 系 / regex-tester 等の後に来る画像入力型 3 件目）で N=3 達成見込み。

### ブログ化判断

cycle-213 は Phase 8.1 第 14 弾 = 既存ツール（password-generator）の新デザイン移行 + タイル化で、過去 13 サイクル（cycle-200〜212）と同型の運用が中心。新規性は「マウント時自動生成型タイル = `useState` 遅延初期化経路（SSoT η）」「秘密情報配慮 ARIA 設計（SSoT ζ）= `<code>` aria-live なし + 強度ラベル role="status"」だが、いずれも実装ニッチで来訪者（M1a / M1b / S1 含む target user）への直接的な学習価値は薄い。

過去 Phase 8.1 サイクル（cycle-200〜212）も全てブログ化なしの convention に従い、**本サイクルもブログ化なし**と判断（cycle-211/212 同型のブログ化判断保留パターンを継承）。Phase 8.1 全体完了後（残り 21 ツール + 20 遊び）に Phase 8.1 振り返り記事を起票する選択肢を保持。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-314 は Active 継続 = Phase 8.1 全 34 ツール完了まで継続）。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている（計画 r1〜r5 PASS / T-1 r1 PASS NIT-1 PM 即時編集 / T-2 r1→r2 PASS / T-3 r1→r2 PASS / T-4 r1→r2→r3 PASS = 計 12 回レビュー全件解消）。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（T-4 で 4 コマンド全 PASS / test 4510 件全件緑 / tilesCount=14）。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている（2026-05-28T03:30:13+0900）。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている（B-459 / B-460 起票済）。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
