---
id: 207
description: B-314 Phase 8.1 第 8 弾として qr-code 生成ツールのタイル化と (new)/tools/ 配下への詳細ページ移行を行う。cycle-200〜206 で 7 回適用済みの標準パターン通常運用を継続しつつ、これまでの「textarea×2 + 結果膨張ゼロ型」とは異なる「textarea 1 + 画像 / SVG 出力 + ダウンロードボタン」という画像出力型ツールの構造的差分を扱う初回として位置づける。
started_at: 2026-05-23T11:31:26+0900
completed_at: null
---

# サイクル-207

このサイクルでは、`B-314`（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8）の **第 8 弾**として `qr-code`（QR コード生成）を扱う。cycle-200〜206 で標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行）が 7 回適用済みで、cycle-206 で「標準パターン通常運用フェーズの初回」を完遂したため、本サイクルは **通常運用フェーズの 2 回目** + **画像 / SVG 出力型ツールの初回**として位置づける。

来訪者にとっての価値は「URL や Wi-Fi 情報、LINE 友だち追加リンクなどを QR コードにして、スマホへの受け渡しや紙への印刷など『日常の傍にある道具』として使えるようにする」一点。「日常の傍にある道具」コンセプトと特に親和性が高い実用ツールであり、新デザイン移行とタイル化の両側に直接価値を持つ。

構造的差分（これまでの 7 ツールと異なる点）:

- **画像 / SVG 出力型**: 入力は textarea 1（URL またはテキスト）、出力は QR コードの SVG タグと PNG DataURL。これまでの「textarea×2（双方向 / 一方向）+ 結果膨張ゼロ or 膨張型」とは異なる構造で、AP-P21 textarea 高さ計測 4 ケースのうち「出力 textarea」の枠は存在しない。代わりに「画像プレビューエリア」の高さ / 配置の検証が必要。
- **ダウンロードボタン**: PNG 形式での画像ダウンロード（`<a download>` 要素を動的生成して click）。タイル内 DL ボタン配置は計画段階で AP-P17 ゼロベース 3 案比較を実施し、**タイル下端に独立 DL ボタン配置**を採択確定（論点 0-b）。
- **誤り訂正レベル選択**: 4 状態（L / M / Q / H）の選択肢。これまでのオプション（2 状態セグメント / 3 種チェックボックス）とは異なる選択肢数で、タイル UI 収納方法を計画段階で AP-P17 ゼロベース 3 案比較し、**M 固定省略**を採択確定（論点 1）。

## 実施する作業

- [x] T-1: 現状把握と移行前 baseline 取得（qr-code のファイル構成 / 旧トークン箇所 / `logic.ts` export / 既存テスト / `TILE_DECLARATIONS` 件数を grep 実測で確認、Playwright で baseline 撮影、既存テストが緑であることの確認）
- [x] T-2: 詳細ページの `(new)/tools/qr-code/` 配下への移行 + GIF/PNG ミスラベル修正 (案 Y 確定) + **詳細ページの debounce 300ms リアルタイム化 + 「QRコード生成」ボタン削除** (T-2 セクション C 案 a 採択) + T1 yaml の search_intents への「QRコード」3 語追加（`page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイルを `git mv` で移動 + `page.module.css` 新設 / 1200px max-width 標準パターン / `Component.module.css` の旧トークンを新トークンに置換 / `logic.ts` を案 Y で PNG 化 + `logic.test.ts:14` の MIME 期待値更新 / Component.tsx の debounce 化 + ボタン削除 / T1 yaml に「QRコード」「QRコード 作成」「QRコード 生成」を追加）
- [ ] T-3: タイル定義（`src/tools/qr-code/QrCodeTile.tsx` などタイル UI 一式を新規実装、`kind=widget` / **cols=3 rows=3 確定（論点 0 案 C）** / 誤り訂正レベル M 固定（論点 1 案 B）/ debounce 300ms リアルタイム化（論点 2 案 C）/ **タイル下端に独立 DL ボタン配置（論点 0-b 案 A）** / AP-P21 画像出力型適応役割分担 / `TILE_DECLARATIONS` へのエントリ追加 / `npm run generate:tiles-registry` 再生成 / タイル用テスト追加）
- [ ] T-4: 検証と統合確認（Playwright 視覚回帰 + 画像プレビューエリア計測 + AP-WF16 reviewer 独立再実行 / baseline + tiles-preview + after の各種スクリーンショット / `lint` / `format:check` / `test` / `build` の 4 コマンド全件 reviewer 独立再実行）

詳細なタスク分解と作業計画は `/cycle-planning` フェーズで具体化する。

## 作業計画

### 目的

**誰のために**: T1（特定の作業に使えるツールをさっと探している人 / `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`）/ T2（気に入った道具を繰り返し使っている人 / `docs/targets/気に入った道具を繰り返し使っている人.yaml`）。QR コードを使う具体的来訪者像は以下が代表ケース:

- 名刺・チラシ・ポスター・店頭 POP に自社サイト URL を QR で載せたい個人事業者・小規模事業者
- 自宅 / 民泊 / カフェ / 来客時に Wi-Fi の SSID とパスワードを口頭でなく QR で渡したい人
- LINE 公式 / LINE 個人 の友だち追加 URL を紙物に印刷したいクリエイターや個人事業主
- 展示物 / 配布物 / 講義資料に補足情報の短いテキストや参考リンクを添えたい人
- 「自分の PC で開いているページをすぐ手元のスマホで開きたい」というワンショット用途の来訪者

これらに共通するのは「**紙とスマホの間のテキスト受け渡し**を 1 回で済ませたい」という非常に身近な日常需要であり、`docs/cycles/cycle-207.md` 冒頭で示した「日常の傍にある道具」コンセプトと最も親和性が高いカテゴリの 1 つ。

**何の価値**:

- **新デザインへの統一移行**: `/tools/qr-code` の見た目を他の (new) 配下 7 ツール（char-count / byte-counter / url-encode / base64 / html-entity / hash-generator / fullwidth-converter）と揃え、T2 likes「操作性・トーン&マナーが一貫」を満たす。
- **ダッシュボードからの即時アクセス**: タイル化により、「URL / 短いテキスト → QR」が 1 クリックで起動でき、入力 onChange リアルタイム反映により「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」（T1 likes）を最大化する。
- **GIF/PNG ミスラベル修正による来訪者価値の回復**: 既存詳細ページの「PNG形式でダウンロード」ボタンが実体として GIF を `qrcode.png` ファイル名で保存する **誤ラベル状態**である（テスト `logic.test.ts:14` が `data:image/gif` を期待していることで実証済）。来訪者が「PNG だと信じて保存したファイルが実体は GIF」というのは小さくない実害（印刷業者に入稿した際の取り扱いエラー / Slack や LINE が PNG プレビューと GIF アニメ枠を区別する場面での挙動不一致 / アクセシビリティ判定ツールで MIME 不一致警告 など）であり、「日常の傍にある道具」コンセプトで道具としての信頼を保つために本サイクルで修正する。

**T1 search_intents への「QRコード」3 語追加を本サイクル内で確保（SSoT 整合）**:

T1 の `search_intents`（`docs/targets/特定の作業に使えるツールをさっと探している人.yaml:28-34`）は現在「文字数カウント / 日付計算 / パスワード生成 / 全角半角変換 / BMI計算 / カラーコード 変換 / 単位変換」の 7 項目のみで、**「QRコード」「QRコード 作成」「QRコード 生成」は含まれていない**。これは事実として確認済（grep 実測 / 上記 yaml ファイル本文）。

判断: yaml 1 行追加のコスト ≪ SSoT 不整合（本サイクルで QR コード タイル + 詳細ページを充実させながら T1 search_intents に項目がないという不整合）のリスク。**本サイクル T-2 タスク内で「QRコード」「QRコード 作成」「QRコード 生成」の 3 語を T1 yaml に追加する**。これは「QR コード」というカテゴリの抜け項目 1 件の補填であり、search_intents 全体の網羅性レビューとは別レイヤー。

別 backlog として残す B-438 提案は、「**T1 / T2 ターゲット yaml の search_intents 棚卸し（全体網羅性の確認 + 抜けの一括洗い出し）**」という上位レイヤーの作業に再定義する。QR コード 1 件追加（本サイクル内）と棚卸し全体（B-438 提案 / 別 backlog）の関係は明確に分離する。

**3 語選定根拠（MINOR-J 反映）**: 既存 search_intents の表記形式（「文字数カウント」「全角半角変換」「カラーコード 変換」など）に倣い、**検索意図ワード単独形 1 種 + 動作動詞付き 2 種** の組合せで 3 語に絞った:

- 「QRコード」: 検索意図ワード単独形（カテゴリ名）。「QR コード変換ツール」「QR コードのサイト」等の関連検索を広く受け止める。
- 「QRコード 作成」: 動作動詞「作成」付き。一般的な日本語表現として最も自然。
- 「QRコード 生成」: 動作動詞「生成」付き。「QR コード生成サイト」のような複合語マッチング用。
- 除外: 「QRコード 読み取り」「QRコード スキャン」は当該ツールがスキャン機能を提供しないため、来訪者の期待と実体の不一致を避けるため意図的に除外。

**背景・Phase 8.1 全体での意義**: B-314 Phase 8.1 の **第 8 弾**。cycle-200〜206 で 7 回適用済の標準パターン（`kind=widget` / `page.module.css` 1200px ハードコード / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行 / AP-WF05 dark mode 撮影）に対して、本サイクルは **標準パターン通常運用フェーズの 2 回目 + 画像 / SVG 出力型ツールの初回** として位置付ける。cycle-206 で確立した「淡々と進むはずの油断打ち消し策」を継続しつつ、これまで 7 連続で扱った「textarea → textarea / 計測値」構造とは異なる「textarea → SVG / 画像 + ダウンロード」構造を扱う初の機会。

**viewport 採用方針**: AP-WF05 網羅性ルール（w360/w1280）に対し、本サイクルでは Phase 8.1 標準パターン（cycle-200〜206）に従い w375/w1200/w1900 +（タイルプレビューは w1200/w375）を採用する。AP-WF05 形式逸脱の見逃しを断つため、計画段階で本不整合を明示する（w360 タイル viewport は B-434 で Phase 10.1 必須検討、Phase 8.1 内では暫定許容）。

**「画像 / SVG 出力型ツール初回」の構造的差分**:

これまでの 7 ツール（char-count / byte-counter / url-encode / base64 / html-entity / hash-generator / fullwidth-converter）と本サイクルの構造差を計画書本文で明示する:

- (i) **出力が SVG 画像（と PNG/GIF DataURL）**: テキスト出力に比べて、出力エリアに **正方形（1:1）アスペクト比** と **最小読み取りサイズ制約（推奨 150px、絶対 76px）** がある。AP-P21 役割分担で扱ってきた「結果欄 flex: 1 + overflowY: auto」のパターンが SVG にそのまま適用できない（縦に伸ばしても横が伴わないと QR が縮小される）。
- (ii) **詳細ページが手動ボタントリガー**: cycle-200〜206 の 7 ツールはすべて onChange リアルタイム反映だったが、qr-code 詳細ページは「QRコード生成」ボタン押下型。タイル UI のトリガー方式は **AP-P17 ゼロベース 3 案比較**で再検討する（後述）。
- (iii) **誤り訂正レベル 4 状態**: これまでのオプション（2 状態セグメント / 3 種チェックボックス）と異なる選択肢数。タイル UI 内収納方法を **AP-P17 ゼロベース 3 案比較**で再検討する。
- (iv) **ダウンロード機能の存在**: テキスト出力では「コピー」が最終アクションだったが、QR では「ダウンロード」（または「スクショで保存」）が最終アクション。タイル内 / 詳細ページ内それぞれの配置を整理する。
- (v) **既存実装に機能的バグ（GIF/PNG ミスラベル）が残存**: 来訪者価値を直接毀損する欠陥であり、本サイクルで最小修正する（PM スコープ判断）。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- qr-code の現在のファイル構成・コード・CSS を **grep / Read で実体確認**する。数値の出典は本計画書本文に grep コマンドを併記し、`tmp/` 配下削除後も再現可能とする（AP-P16 / AP-WF12 対策）。
  - `src/tools/qr-code/`: `Component.tsx` (108 行) / `Component.module.css` (127 行) / `logic.ts` (41 行) / `meta.ts` / `__tests__/logic.test.ts`
  - `src/app/(legacy)/tools/qr-code/`: `page.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` の 3 ファイル
  - `Component.module.css` 内の `--color-*` 残存数: **22 箇所**。**実測コマンド**: `grep -c -- "--color-" src/tools/qr-code/Component.module.css` → 22（PM 事前確認済）
  - 旧トークン種類は **9 種**（`--color-bg` / `--color-bg-secondary` / `--color-border` / `--color-error` / `--color-error-bg` / `--color-primary` / `--color-primary-hover` / `--color-text` / `--color-text-muted`）。**実測コマンド**: `grep -o -- "--color-[a-zA-Z0-9_-]*" src/tools/qr-code/Component.module.css | sort -u`（PM 事前確認済）。これまでの 7 ツールで最大の旧トークン種類数（cycle-205 hash-generator: 7 種、cycle-206 fullwidth-converter: 5 種）。
  - `logic.ts` の export: 型 2（`ErrorCorrectionLevel` / `QrCodeResult`）+ 関数 1（`generateQrCode`）= **3 export**。**実測コマンド**: `grep -c '^export ' src/tools/qr-code/logic.ts` → 3（PM 事前確認済）
  - 既存テスト件数: `logic.test.ts` describe 1 / test **5 件**。**実測コマンド**: `grep -c '^\s*test(' src/tools/qr-code/__tests__/logic.test.ts` → 5（PM 事前確認済）。`meta.test.ts` は **存在しない**（cycle-206 fullwidth-converter とは異なる点）。
  - `TILE_DECLARATIONS` 現状エントリ件数: **7**。**実測コマンド**: `grep -c '^\s*slug: "' src/tools/_constants/tile-declarations.ts` → 7（PM 事前確認済 / tilesCount = 7）。`grep "domain:" ... | wc -l` を使うとコメント / 型定義の `domain:` も拾って 10 を返すため、literal ダブルクオート開始の `slug: "` でフィルタする形が再現性のある正解。codegen 出力ファイル `src/tools/generated/tiles-registry.ts` の `tilesCount` 値も併せて Read で直接確認できる。
  - **GIF/PNG ミスラベル事実の再確認**: `logic.test.ts:14` の `expect(result.dataUrl).toContain("data:image/gif")` が証拠。`qrcode-generator@^2.0.4` の `createDataURL()` 実装上、出力は GIF DataURL であることが test で固定化されている。Component.tsx L37 の `link.download = "qrcode.png"` と Component.tsx L102 の「PNG形式でダウンロード」ラベルは事実と矛盾。実装段階での T-2 タスクで方針を確定する。
- Playwright で移行前のスクリーンショットを取得する
  - **ベース 6 枚**: デスクトップ w1200 / w1900、モバイル w375 × **ライト / ダーク両モード**（AP-WF05 着手前撮影 + dark mode 必須）
  - **結果表示済み状態スクショ 2 枚（ライト・ダーク両モード）**: 任意の URL（例: `https://yolos.net/tools/qr-code` 自身、誤り訂正レベル M）を入力 → 「QRコード生成」ボタン押下 → 結果 SVG + DL ボタンが表示された状態を撮影。AP-WF05 着手前撮影ルールに従い両モードを撮影。cycle-205 / 206 と同水準の baseline 8 枚を担保する。
- 既存テストの実行確認: `npm run test -- qr-code` で 5 件全件緑であることを確認する。

**完成条件**: 移行前スクリーンショット **計 8 枚**（ベース 6 枚 + 結果表示済み 2 枚）が `tmp/cycle-207/baseline/` 配下に保存されている。既存テスト 5 件が緑。grep による旧トークン残存 22 / 9 種一覧 / export 3 / test 5 / `TILE_DECLARATIONS` 件数 7 の数値がいずれも本計画書本文と一致し、reviewer の独立再実行で確認されている。GIF/PNG ミスラベルの実体確認（DataURL prefix が `data:image/gif`、ファイル名は `qrcode.png`、ボタンラベルは「PNG形式でダウンロード」）が完了している。

**T-1 検証手順（AP-WF16）**: T-1 builder は `npm run test -- qr-code` 出力と上記 grep コマンド出力を引用付きで報告する。T-1 reviewer は最低 1 つ以上の自動チェックを **独立に再実行** して出力一致を確認する。

#### T-2: 詳細ページの (new) 配下移行 + GIF/PNG ミスラベル修正

cycle-200〜206 で確立した標準パターンを踏襲しつつ、画像出力型ツール初回として GIF/PNG ミスラベル修正を上乗せする。

**A. 移行作業**:

- `src/app/(legacy)/tools/qr-code/` を `src/app/(new)/tools/qr-code/` に **`git mv`** で移動する（page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル）
- `src/app/(new)/tools/qr-code/page.module.css` を新設し、1200px max-width をハードコードする（既存 (new) 配下 7 ツールと同一パターン）
- `page.tsx` に `page.module.css` の `.page` ラッパーを追加する
- `src/tools/qr-code/Component.module.css` 内の旧カラートークン **22 箇所 / 9 種** を新デザイントークンに置換する
  - **置換マッピング（PM が globals.css + 過去 3 ツール CSS を Read/grep 実測して再確定 / R3 で全面書き直し）**:
    - 実測コマンド共通: `grep -nE "var\(--" src/tools/{hash-generator,base64,html-entity}/Component.module.css` で各ツールの新トークン使用実績を確認、`grep -nE "^\s*--" src/app/globals.css` で globals.css 定義済みトークンを確認。

| 旧トークン (qr-code 現) | 新トークン (採択)                | globals.css 定義 (実測)                                                | hash-generator (cycle-205) 実績                                                                | base64 (cycle-203) 実績                      | html-entity (cycle-204) 実績                 |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| `--color-bg`            | `--bg`                           | L11 (light) / L83 (dark)                                               | L29, L63, L118 で使用                                                                          | L19, L65, L95 で使用                         | L19, L65, L95 で使用                         |
| `--color-bg-secondary`  | `--bg-soft`                      | L12 (light) / L84 (dark)                                               | L95 で使用                                                                                     | 未使用（base64 はパネル背景使用なし）        | 未使用                                       |
| `--color-border`        | `--border`                       | L25 (light) / L104 (dark)                                              | L22, L59, L93, L116 で使用                                                                     | L10, L29, L58, L93 で使用                    | L10, L29, L58, L93 で使用                    |
| `--color-error`         | `--danger`                       | L44 (light) / L130 (dark)                                              | 未使用 (hash-generator にエラー UI なし)                                                       | L108, L111 で使用                            | L108, L111 で使用                            |
| `--color-error-bg`      | `--danger-soft`                  | L46 (light) / L132 (dark)                                              | 未使用                                                                                         | L110 で使用                                  | L110 で使用                                  |
| `--color-primary`       | `--accent`                       | L31 (light) / L117 (dark)                                              | L33, L35, L68, L70, L101, L127 で使用                                                          | L33, L69, L71, L76, L78, L103 で使用         | L33, L69, L71, L76, L78, L103 で使用         |
| `--color-primary-hover` | **`--accent-strong`** **(訂正)** | L32 (light) / L118 (dark) ※ `--accent-hover` は globals.css に定義なし | **L79 で `--accent-strong` を hover に使用**（R3 実測で訂正、`--accent-hover` は誤記であった） | **L88 で `--accent-strong` を hover に使用** | **L88 で `--accent-strong` を hover に使用** |
| `--color-text`          | `--fg`                           | L18 (light) / L93 (dark)                                               | L28, L54, L62, L109, L119 で使用                                                               | L20, L64, L96 で使用                         | L20, L64, L96 で使用                         |
| `--color-text-muted`    | `--fg-soft`                      | L19 (light) / L94 (dark)                                               | L16 で使用                                                                                     | L46 で使用                                   | L46 で使用                                   |

- **エラー系トークン (`--danger` / `--danger-soft`) の採用は qr-code が hash-generator / fullwidth-converter とは異なり、base64 / html-entity と同型のエラー UI を持つため**。globals.css L44-46 (light) / L130-132 (dark) に定義済で、base64 L108-111 / html-entity L108-111 で既に採用実績あり。
- **`--accent-hover` トークンは globals.css に存在しない**（R3 で実測訂正済）。hover は `--accent-strong` を使う。これは hash-generator L79 / base64 L88 / html-entity L88 で確立済のパターン。
- **`#fff` リテラル 2 箇所の根拠区別**:
  - `.generateButton { color: #fff }`: ボタン文字色。背景色は `--accent` トークン（OKLCH 値はモードで変化）。T-2 builder は **「白文字 (#fff) vs `--accent` 値」のコントラスト比を WCAG AA 基準 4.5:1 以上で実測**し、ライト / ダーク両モードで担保されていることを確認する（測定値を `tmp/cycle-207/contrast-check.md` に残す）。**ダーク mode で 4.5:1 を下回った場合の退避策**: `grep -rn 'color: #fff' src/tools/*/Component.module.css` で多数の同型ヒット（image-resizer / business-email / cron-parser / keigo-reference / unix-timestamp / password-generator / hash-generator など実測で 40+ 行ヒット）が確認されており、**qr-code 単独問題ではなく全ツール共通の問題**。本サイクルは qr-code の WCAG 実測値を `contrast-check.md` に記録するのみで完了し、qr-code 単独修正は行わない。代わりに **B-440 提案（`--accent` + `#fff` の WCAG AA 適合度の全ツール一括点検 + 必要に応じて globals.css の `--accent` 値再調整）** を起票し PM エスカレーション。
  - `.qrImage { background-color: #fff }`: **QR コードの黒モジュールに対する白背景は読み取り精度の本質要件**（ダークモードで黒背景にすると QR が反転し読み取り不能になる）。トークン化はせず `#fff` 固定で確定（計画書通り、再点検不要）。
- w1900 で本文幅が 1200px に収まっていることを確認する

**B. GIF/PNG ミスラベル修正（AP-P17 ゼロベース 3 案比較 → 案 Y 採択確定）**:

ミスラベル修正の選択肢を以下 3 案で比較する（AP-P17 適用）。

- **案 X: ファイル名と表記を GIF に統一**（ラベル "PNG形式" + ファイル名 `qrcode.png` を **どちらも "GIF" + `qrcode.gif`** に変更）
- **案 Y: 真の PNG 化（採択）**（DataURL 生成経路を `qr.renderTo2dContext(ctx, cellSize)` + `canvas.toDataURL("image/png")` に置換 / ボタンラベル「PNG形式でダウンロード」と DL ファイル名 `qrcode.png` は据え置き / **Quiet Zone は自前実装**: `renderTo2dContext` は margin パラメータを受け付けないため、後述の手順で margin を canvas に焼き込む）
- **案 Z: SVG ダウンロードに置き換え**（PNG ボタンを廃止し、SVG をそのまま Blob 化してダウンロード）

評価軸: (i) 来訪者価値（一般来訪者が「QR を保存して印刷 / SNS 共有」する典型用途で実害が小さい順）/ (ii) 実装規模 / (iii) スコープ整合 / (iv) 将来の拡張余地（B-433 等への影響）。

**採択: 案 Y（真の PNG 化）確定**。

**採択理由（Decision Making Principle = より良い UX を選ぶ）**:

1. **来訪者価値**: 「PNG」という事前期待に実体が一致する。印刷業者入稿 / SNS 投稿 / アクセシビリティ検査ツールでの MIME 整合性が最大。案 X は来訪者期待を下方修正する形（PNG だと思っていたら GIF）で来訪者価値が劣る。案 Z は DL 形式変更で「いつもの PNG が消えた」という別種の体験変化が起きる。
2. **実装規模**: 中程度。qrcode-generator の `renderTo2dContext()` を `<canvas>` に描画し `canvas.toDataURL("image/png")` で DataURL を取得する経路は同期 API で副作用が小さい（モバイル Safari でも `toDataURL("image/png")` は安定実装）。
3. **スコープ整合**: 本サイクルは「移行 + タイル化」が主目的だが、GIF/PNG ミスラベルは来訪者の小さくない実害であり、最小修正で解消できる本変更は AP-WF15「サイクル中の補修課題の振り分け軸」で本サイクル内取込が妥当。
4. **将来の拡張余地**: 案 Z（SVG DL）は B-437 提案として別 backlog で温存する（PNG 廃止ではなく PNG + SVG 併設の拡張余地を残す）。

**注**: 過去案で `createImgTag()` を案 Y の候補経路として挙げていたが、`createImgTag()` の実装は内部で `createDataURL()`（GIF 出力）を呼ぶため PNG にならない。**正しい経路は `qr.renderTo2dContext(ctx, cellSize)` で `<canvas>` に描画 → `canvas.toDataURL("image/png")` で PNG DataURL を取得**、の 2 段経路に確定する（実測根拠: `node_modules/qrcode-generator/dist/qrcode.js` L557 (createDataURL = GIF 出力本体) / L577 (createImgTag = 内部 createDataURL 呼出) / L719 (renderTo2dContext) + `node_modules/qrcode-generator/dist/qrcode.d.ts:50` (`renderTo2dContext(context: CanvasRenderingContext2D, cellSize?: number): void` = margin パラメータが API シグネチャに存在しないことを確認済)）。

**Quiet Zone（QR 周囲のマージン 4 セル）の自前実装が必須（R3 で MAJOR-2 として明文化）**: `renderTo2dContext` は `margin` パラメータを取らず（d.ts:50 シグネチャ実測）、実装本体（dist/qrcode.js L719-728）も margin を一切描画しない。既存 `logic.ts` は `createDataURL(8, 4)` で margin=4 を渡しているが、`renderTo2dContext` に置き換えた時点でこの margin=4 は失われる。Quiet Zone は QR 仕様上の必須要件（最小 4 セル分の白マージン）で、欠落するとスマホ読み取り精度が大幅に低下する（来訪者価値直接毀損）。

**本質要件**:

- (i) margin = 4 セル分の白マージンを四辺に確保する
- (ii) DataURL 出力前に Quiet Zone を canvas に焼き込む（PNG 化後に画像処理で足すのではなく、描画段階で含める）

**Quiet Zone を確保するために必要な最小手順（擬似コードレベル、変数名・関数呼び出し literal は builder 裁量）**:

1. qrcode-generator のインスタンスからモジュール数を取得（`getModuleCount()` 同等）
2. margin = 4 セル / cellSize = 8 を推奨初期値として確定（builder 裁量で調整可、ただし margin < 4 にはしないこと）
3. canvas の幅・高さを「`(モジュール数 + margin × 2) × cellSize`」相当のサイズで確保し、margin 込みで拡大する
4. canvas 全面を `#fff` で塗りつぶし、Quiet Zone を確保する
5. 描画原点を margin × cellSize 分だけ右下にずらす（`ctx.translate` 同等）
6. `renderTo2dContext(ctx, cellSize)` で QR モジュール本体を描画する
7. `canvas.toDataURL("image/png")` で PNG DataURL を取得する

この 7 手順を `logic.ts` の `generateQrCode` 内で実施することで、(i) DataURL が `data:image/png` で始まる / (ii) Quiet Zone 4 セル分（margin=4 × cellSize=8 = 32px）が四辺に維持される、の 2 点が同時に満たされる。手順 5 の `translate` は手順 3 の canvas 拡大とセットで「QR 本体が margin の内側に描かれる」ことを保証する設計。手順 4 を省略すると初期化された透過 canvas のまま QR が描かれて Quiet Zone が背景透過になり、PNG 化後に背景色によっては読み取れなくなるため必須。

**フォールバック条項は設けない**: 想定外の実装上の壁にぶつかった場合は、builder 裁量で案 X に退避するルートは認めず、**PM エスカレーション + 再計画**を要する。Decision Making Principle 「実装コストは選択理由にしてはならない」に照らし、本サイクル内で案 Y を完遂することを前提とする。

**C. 詳細ページのリアルタイム化を本サイクル内に含めるか（AP-P17 ゼロベース 3 案比較 → 案 a 採択）**:

タイル側のトリガー方式を「debounce リアルタイム」とした上で、詳細ページ側を本サイクルでどう扱うかを 3 案比較する。Decision Making Principle「より良い UX が達成可能なら必ずそれを選ぶ / 実装コストは選択理由にしてはならない」に直接照らす論点。

- 案 a: **詳細ページもリアルタイム化（本サイクル内、採択）** — 詳細ページの「QRコード生成」ボタン押下型 UX を debounce リアルタイムに変更（タイルと挙動一致）
- 案 b: **タイルもボタン押下型（既存挙動踏襲）** — タイル側のリアルタイム化を見送り、両者とも手動ボタン
- 案 c: **計画通り（タイル先行 / 詳細別 backlog）** — タイル = リアルタイム / 詳細 = 手動ボタン据え置き、詳細のリアルタイム化は B-436 提案で別サイクル

| 評価軸                               | 案 a: 詳細もリアルタイム（**採択**）                                                                                                                                                                                                                                                                        | 案 b: タイルもボタン押下型                                                   | 案 c: タイル先行 / 詳細別 backlog                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値                       | タイル / 詳細とも即時性が最大。T1 likes「すぐ使い始められる」が両方で達成。先行サイト調査でもベストプラクティスとして確認済。                                                                                                                                                                               | T1 likes 即時性が両方で損失（UX 退化）。**Decision Making Principle 違反**。 | タイルだけ即時性、詳細は劣後。T2 likes「同じ道具を繰り返し使う際の操作性・挙動の一貫」を毀損し続ける期間が発生（B-436 着手まで）。 |
| (ii) T2 likes 操作性一貫             | 完全一貫。タイルから詳細に遷移した来訪者が同じ操作モデルを継続できる。                                                                                                                                                                                                                                      | 一貫。だが (i) を犠牲にする一貫であり constitution と逆行。                  | **不一貫**。同 URL で挙動が変わる混乱リスクを意図的に持ち越す。R1 MAJOR-4 指摘の T2 likes 違反の発生源。                           |
| (iii) Decision Making Principle 適合 | 適合。実装コスト（半サイクル相当 = `useEffect` + debounce + ボタン削除判断 + テスト更新）を理由に劣後 UX を選ばない。                                                                                                                                                                                       | 違反。即時性 UX を捨てる側を選ぶ。                                           | 違反（弱）。実装コストを理由に T2 likes 整合を遅らせている。                                                                       |
| (iv) スコープ整合                    | Phase 8.1 標準「Component.tsx touch しない」からの逸脱は GIF/PNG 修正で既に確定済で、リアルタイム化を同じ Component.tsx touch 内に同梱することで **Component.tsx を 1 タスク（1 PR / 1 commit）内で完結させる**（GIF/PNG 修正とリアルタイム化を同一改修で扱う、別 builder タスクとして 2 個に分解しない）。 | Phase 8.1 標準に最も忠実だが、UX 退化が代償。                                | Phase 8.1 標準に概ね忠実、GIF/PNG 修正 1 件だけ逸脱。                                                                              |
| (v) 実装コスト                       | 中（half-cycle 相当）。debounce + cleanup は本サイクル T-3 でタイル側にも実装するため、その派生形を詳細ページにも適用すれば追加コストは限定的。                                                                                                                                                             | 最低。                                                                       | 中（本サイクルではタイル側だけ）。                                                                                                 |
| (vi) テスト追加                      | `logic.test.ts` は変えない（同期ロジックは不変）。Component の debounce 動作テストはタイル側で追加するため、詳細ページに同型を 1〜2 件追加する程度。                                                                                                                                                        | 追加なし。                                                                   | 追加なし（タイル側のみ）。                                                                                                         |

**採択: 案 a（詳細ページもリアルタイム化、本サイクル内）確定**。

**採択理由**:

1. **Decision Making Principle に忠実**: 「より良い UX が達成可能ならそれを選ぶ」「実装コストは選択理由にしてはならない」に最も適合。半サイクル相当の実装コストは Phase 8.1 全体 34 ツールから見れば誤差範囲。
2. **T2 likes 操作性一貫**: タイルと詳細の挙動差を生まない。R1 MAJOR-4 指摘の T2 likes 違反を計画段階で解消。
3. **debounce 実装の共通化**: タイル側でも詳細側でも同じ debounce + cleanup パターンを使えるため、追加実装コストは限定的（cycle-205 hash-generator cleanup パターンの debounce 派生として両方に適用）。
4. **「QRコード生成」ボタンの扱い**: ボタンは **削除する**。debounce リアルタイム化により手動トリガーは不要になり、UI もシンプルになる。これにより詳細ページの SVG プレビューエリアが約 40+8=48px 拡大する副次効果も得られる。
5. **GIF/PNG 修正で既に Component.tsx を 1 度 touch することが確定済**であり、リアルタイム化の改修と同時に行えば **Component.tsx を 1 タスク（1 PR / 1 commit）内で完結させる**（GIF/PNG 修正とリアルタイム化を同一改修で扱う、別 builder タスクとして 2 個に分解しない）ことができる。

**実装方針**: 詳細ページ Component.tsx の修正範囲は (i) `useEffect` + `setTimeout` で input / errorCorrection 変更を 300ms debounce → `generateQrCode()` 呼び出し / (ii) 「QRコード生成」ボタン削除 / (iii) 案 Y による PNG 化（renderTo2dContext + toDataURL + Quiet Zone 自前実装）/ (iv) その他は touch しない（ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネント参照は維持）。

**ボタン削除後の最初の操作フィードバック（MINOR-B）**: 「QRコード生成」ボタンを削除するとボタンが持っていたアフォーダンス（「ここを押すと QR が出る」）が失われる。AP-P07（来訪者の認知モデル起点）に従い、補う UI ヒントを以下のいずれかで実装する:

- 入力欄プレースホルダーに「URL またはテキストを入力すると自動で QR が生成されます」のヒントを表示
- または同義のヒント文を入力欄付近に常時表示
- 空入力時のプレビュー領域には「入力を待っています」等の状態説明を表示（タイル / 詳細ページ共通）

文言は builder 裁量で最終決定するが、上記いずれかの形で「ボタン無し = 自動生成」のメンタルモデルを来訪者に伝える UI を必ず実装する。

**注意事項**:

- ToolLayout / Breadcrumb / FaqSection / ShareButtons 等の共通コンポーネントは touch しない（B-431 一括対応）
- `meta.ts` の `trustLevel: "verified"` は削除しない（B-432 一括削除を待つ）
- opengraph-image.tsx / twitter-image.tsx の内容は変更しない（**実体確認 (MINOR-D)**: `src/app/(legacy)/tools/qr-code/opengraph-image.tsx` (22 行) を Read で確認した結果、`@/lib/ogp-image` と `@/tools/registry` 経由の静的 OGP 生成のみで `logic.ts` 依存はない。実測コマンド: `grep -c "logic" src/app/\(legacy\)/tools/qr-code/opengraph-image.tsx` → 0。本サイクル T-2 で opengraph / twitter-image は内容変更なし、`git mv` のみで安全）
- 詳細ページ Component.tsx の修正範囲は (i) GIF/PNG → 案 Y による PNG 化（renderTo2dContext + toDataURL）/ (ii) debounce 300ms リアルタイム化 + 「QRコード生成」ボタン削除（C 採択により）/ (iii) 上記以外は touch しない（共通コンポーネント参照は維持、`meta.ts` の `trustLevel: "verified"` は削除しない、opengraph/twitter-image は変更しない）。

**完成条件**（チェックリスト形式、R4 MINOR-C 整形）:

- [ ] `/tools/qr-code` が (new) 配下で正常表示される（HTTP 200 OK）
- [ ] 旧 (legacy) パスにファイルが残っていない（3 ファイルすべて `git mv` 済）
- [ ] w1200 / w1900 / w375 で表示崩れがない
- [ ] Component.module.css 内に `--color-*` 系旧トークンが残存しない: `grep -c -- "--color-" src/tools/qr-code/Component.module.css` → `0`
- [ ] `--accent-hover`（globals.css に存在しないトークン）を誤記していない: `grep -c 'accent-hover' src/tools/qr-code/Component.module.css` → `0`
- [ ] hover 用 `--accent-strong` への置換が反映されている: `grep -c 'accent-strong' src/tools/qr-code/Component.module.css` → `1 以上`（R3 MAJOR-1 訂正反映）
- [ ] `#fff` リテラル 2 箇所（`.generateButton color` / `.qrImage background-color`）が維持されている
- [ ] GIF/PNG ミスラベルは **案 Y（真の PNG 化）で解消**:
  - [ ] `logic.ts` の DataURL 生成経路が `renderTo2dContext` + `canvas.toDataURL("image/png")` に置換されている
  - [ ] Quiet Zone 自前実装の 7 手順により margin 4 × cellSize 8 = 32px の白マージンが四辺に維持されている
  - [ ] DataURL prefix が `data:image/png` で始まる
  - [ ] DL ファイル名 `qrcode.png` 据え置き
  - [ ] DL ボタンラベル「PNG形式でダウンロード」据え置き
  - [ ] MIME / ファイル名 / ボタンラベルの三者一致 + Quiet Zone 維持
- [ ] `logic.test.ts:14` の MIME 期待値が `"data:image/gif"` → `"data:image/png"` に更新されている（案 Y 採択により必須）
- [ ] 詳細ページが debounce 300ms リアルタイム化されている（C 採択により）
- [ ] 「QRコード生成」ボタンが削除されている
- [ ] ボタン削除を補う UX ヒント文（プレースホルダー or 入力欄付近の常時表示 + 空入力プレビュー領域の状態説明）が実装されている（R3 MINOR-B）
- [ ] 詳細ページ Component.tsx の debounce + cleanup 動作テスト 1〜2 件（連続入力で再描画抑制 / cleanup で前回 `setTimeout` の `clearTimeout` が走る）が追加され緑（R3 MINOR-I）
- [ ] T1 yaml `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` の `search_intents` に「QRコード」「QRコード 作成」「QRコード 生成」の 3 語が追加されている

**T-2 検証手順（AP-WF16）**: T-2 builder は残存判定 grep / `/tools/qr-code` HTTP 200 OK / GIF/PNG 修正後の DataURL prefix と DL ファイル名のスクリーンショット（または DevTools 確認）を引用付きで報告する。T-2 reviewer は最低 1 つ以上を独立再実行する。

#### T-3: タイル定義（kind=widget + 誤り訂正レベル UI + トリガー方式 + AP-P21 画像出力型適応）

- **kind 判定**: qr-code の詳細ページ Component は「入力 textarea + 誤り訂正セレクト + 生成ボタン + SVG プレビュー + DL ボタン」で縦に長く、128px タイルセル基準では収まらないため **kind=widget** とする。

##### T-3 設計論点 0（AP-P17 ゼロベース 3 案）: タイルサイズ rows=2 vs rows=3 × DL ボタン配置の数値整合

タイル枠サイズと DL ボタン配置は密接に絡むため、合算した 3 案として比較し、計画段階で採択案を 1 つに確定する（実装段階で覆さない）。

タイル 1 セル = 128px、gap = 8px、padding = 16px の前提（cycle-200〜206 標準）。

- 案 A: **rows=2 (400×264px) + DL ボタン省略**
  - 内訳: padding 16+16=32px、textarea(40px) + 隙間 8px + SVG プレビュー(?) = 264-32 = **232px が利用可能**。textarea+ 隙間 48px を差し引くと **SVG エリア 184px 確保可能**。DL ボタン省略でフッター 0px。
- 案 B: **rows=2 (400×264px) + DL ボタン同居**
  - 内訳: 232px の縦から textarea+ 隙間 48px + DL ボタン(40px) + 隙間 8px = 96px を差し引いて **SVG エリア 136px**。判定基準「150px 以上」を **下回るため不可**。
- 案 C: **rows=3 (400×400px) 拡大 + DL ボタン同居（採択）**
  - 内訳: 400-32=368px から textarea+ 隙間 48px + DL ボタン+ 隙間 48px = 96px を差し引いて **SVG エリア 272px**。アスペクト比 1:1 を強制すると幅 = 400-32 = 368px 内で 272px 正方形が安定収納可能。

5 軸評価:

| 評価軸                           | 案 A (rows=2 + DL 省略)                                                                                                                        | 案 B (rows=2 + DL 同居)                                          | 案 C (rows=3 拡大 + DL 同居)（**採択**）                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値（視認性）         | SVG 184px で読み取り可。ただしタイル内で「QR を実利用（スマホでスキャン or 保存）」する完結度が欠落する（DL が無いと結局詳細ページへ）。       | SVG 136px は判定基準 150px を下回り、QR がボヤけて視認性が低下。 | SVG 272px は推奨最小 150px を大きく超え、最も視認性が高い。タイル内で完結（プレビュー + DL）でき、T1 likes「すぐ使い始められる」が最大化。                                                                                                                                                                                                                                                                                               |
| (ii) AP-P21 / 枠内収納           | 余裕あり。                                                                                                                                     | **基準下回り（150px 未満）で不可**。                             | 余裕あり。AP-P21 画像出力型適応 SSoT の判定基準 150px を全 4 ケースで安定クリア。                                                                                                                                                                                                                                                                                                                                                        |
| (iii) ダッシュボード全体バランス | rows=2 で他タイル並みのコンパクト感。                                                                                                          | 同上。                                                           | rows=3 はやや大きい。**実測 (R3 MAJOR-3 訂正)**: `grep -E 'rows:\s*3' src/tools/_constants/tile-declarations.ts` → 0 件。既存 7 タイルはすべて cols=3 rows=2 で、rows=3 タイルは現状ゼロ。**本サイクルが Phase 8.1 で rows=3 を初導入する 1 例目**になる。cols=3 rows=3 (400×400px) は既存の cols=3 rows=2 と同列幅でダッシュボード grid の自然な拡張であり、Phase 10.1 ダッシュボード設計時の rows=3 投入実証データとしても価値がある。 |
| (iv) 詳細ページ誘導との責務分離  | タイル = プレビュー専 / 詳細 = 保存・DL の責務分離は明確だが、「タイルでプレビューを見た来訪者の半数程度が DL も済ませたい」需要を満たせない。 | -                                                                | タイル = プレビュー + DL / 詳細 = 細部制御 (L/M/Q/H 選択 + その他) の責務分離。詳細ページの誘導は維持され、タイル内での完結率も高い。                                                                                                                                                                                                                                                                                                    |
| (v) 実装コスト                   | 低（DL UI なし）。                                                                                                                             | 中。                                                             | 中（DL ハンドラ + Canvas 経路）。                                                                                                                                                                                                                                                                                                                                                                                                        |

**採択: 案 C（rows=3 + DL 同居）確定**。

**採択理由（来訪者価値最大化）**: SVG 272px の視認性 + タイル内完結（DL 含む）で T1 likes 最大化。案 A は DL 省略で「タイル → 詳細遷移 → DL」の余分遷移が発生し、案 B は SVG 136px で判定基準を下回り視認性破綻。Decision Making Principle に従い実装コストは選択理由にしない。

##### T-3 設計論点 0-b（参考確定）: タイル内 DL ボタン配置の 3 案比較

論点 0 で「rows=3 + DL 同居」を採択した上で、DL ボタンの配置形式を以下 3 案で再点検し、計画段階で確定する。

- 案 A: **タイル下端に独立 DL ボタンを配置（採択）**（テキストボタン「PNG形式でダウンロード」を SVG プレビュー直下に置く）
- 案 B: **DL を詳細ページに委ねる**（タイル内に DL ボタンを置かず、タイルからのアクションは詳細ページ遷移のみ）
- 案 C: **プレビュークリックで DL**（SVG プレビューをクリックすると DL が走る、暗黙インタラクション）

| 評価軸                      | 案 A: 独立 DL ボタン（**採択**）                                                            | 案 B: 詳細ページ委ね                                                 | 案 C: プレビュークリックで DL                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値              | 明示的なボタンで「DL できる」アフォーダンスが明確。タイル内完結が達成され T1 likes 最大化。 | タイル内完結が崩れ「タイル → 詳細 → DL」の余分遷移発生。             | 暗黙インタラクションは発見されにくく、「クリックしたら勝手にファイル DL が走った」と困惑するリスク。 |
| (ii) AP-P21 適合            | 40px の DL ボタン + 隙間 8px は論点 0 案 C の数値内に収まる（SVG 272px 確保）。             | DL UI なしで余裕。                                                   | DL UI なし扱い + プレビューに onClick。                                                              |
| (iii) アクセシビリティ      | `<button>` 要素で適切に role / label が設定可能、キーボード操作可。                         | -                                                                    | `<img>` クリックでの DL 動作はキーボード操作が複雑、スクリーンリーダーへの説明も難しい。             |
| (iv) 詳細ページとの責務分離 | タイル = プレビュー + DL / 詳細 = 細部制御。明確。                                          | タイル = プレビューのみ / 詳細 = 全部。シンプルだが (i) で価値低下。 | タイル = プレビュー + 暗黙 DL / 詳細 = 細部制御。発見性低下。                                        |
| (v) 実装コスト              | 中（cycle-202〜206 のコピーボタン UI と同型）。                                             | 最低。                                                               | 中（onClick + DL 起動）。                                                                            |

**採択: 案 A（タイル下端に独立 DL ボタン）確定**。

**採択理由**: アフォーダンス明示性 + キーボード操作可能性 + タイル内完結。論点 0 案 C の 272px SVG エリアと両立する数値整合は試算済（上記 (ii) 行）。

##### T-3 設計論点 1（AP-P17 ゼロベース 3 案）: 誤り訂正レベルのタイル UI 収納方法

タイル枠（400×264px or 400×400px）にモード操作・入力・SVG プレビュー・DL ボタンを収める前提で、誤り訂正レベル 4 状態（L/M/Q/H）の UI 収納を 3 案比較する。

| 評価軸                       | 案 A: select（プルダウン）                                                                                                         | 案 B: M 固定省略（**第一推奨**）                                                                                                                                                                                           | 案 C: 4 状態セグメントコントロール                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| (i) 来訪者価値               | 4 状態すべてをタイルから切替可能。ただし「誤り訂正って何？」を理解している来訪者は少数派で、選択肢を出すこと自体が認知負荷になる。 | T1 likes「すぐ使い始められる」を最大化。**先行サイト調査（cycle-207 research）で大半のサイトが誤り訂正レベルを非表示・固定にしている事実** と一致。詳細ページで L/M/Q/H 全選択可能なため、選択を要する来訪者の動線は残る。 | セグメント 4 列で誤り訂正レベル選択を視覚的に明示。ただしタイル幅 400px に 4 ボタン + ラベル「誤り訂正」を載せると窮屈、モバイル w375 でレイアウト破綻リスク高い。 |
| (ii) AP-P21 / 枠内収納       | プルダウン 1 行（約 32px）追加。rows=3 (400px) 想定で SVG エリアへの圧迫小。                                                       | 0 行追加。最大の余裕。                                                                                                                                                                                                     | セグメント 1 段（約 36px）追加 + 4 ボタン横並びで w375 では 1 ボタンあたり 60px 程度に圧縮、視認性低下。                                                           |
| (iii) 詳細ページとの責務分離 | タイル = 全機能 / 詳細 = 全機能 で重複しタイル価値が薄い。                                                                         | タイル = 即時性（M 固定）/ 詳細 = 細部制御（L/M/Q/H 選択 + GIF/PNG）の責務分離が明確。cycle-206 で確立した分業形と整合。                                                                                                   | タイル = 全機能（L/M/Q/H）/ 詳細 = 全機能 で重複し責務分離が不明瞭。                                                                                               |
| (iv) M がデフォルトで妥当か  | -                                                                                                                                  | **妥当**。M（15% 復元率）は QR 業界の事実標準で qrcode-generator のデフォルト値、CMAN の「推奨」ラベルも M。「日常の傍にある道具」の最大公約数として最適。                                                                 | -                                                                                                                                                                  |
| (v) 実装コスト               | 低（既存 select を inline style 化）。                                                                                             | 最低（誤り訂正 UI を排除するだけ）。                                                                                                                                                                                       | 中（セグメントコントロールを 4 状態化）。fullwidth-converter（cycle-206）の 2 状態セグメントを 4 状態に拡張する形だが、横幅制約が厳しい。                          |

**採択: 案 B（M 固定省略）**。

**採択理由（来訪者価値最大化原則）**:

1. T1 likes「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」に最も合致。M は QR 業界デファクト + qrcode-generator のデフォルト + CMAN「推奨」表示と整合する **最大公約数値**。
2. 先行サイト 7 件のうち大半（QRCG / QRCode Monkey / Kaywa / goqr.me / QR のススメ / qrcode-maker.jp）が誤り訂正 UI を非表示にしている事実と一致。yolos.net 独自に複雑化する正当性が薄い。
3. 詳細ページとの責務分離（タイル = 即時性 / 詳細 = 細部制御）が cycle-206 fullwidth-converter「オプション 3 種チェックボックスのタイル省略」と整合し、Phase 8.1 全体の分業形を統一できる。
4. AP-P21 適応で SVG プレビューエリアに最大の余白を確保でき、画像出力型ツール初回の構造的差分（最小読み取りサイズ 150px 推奨）を担保しやすい。

##### T-3 設計論点 2（AP-P17 ゼロベース 3 案）: タイル UI のトリガー方式

タイルにおける QR 生成の起動方式を 3 案比較する。

| 評価軸                  | 案 A: 手動ボタン（既存詳細ページ踏襲）                                                                        | 案 B: リアルタイム（onChange 即時）                                                                                                                                  | 案 C: debounce リアルタイム（**第一推奨**）                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (i) 来訪者価値          | T1 likes「コピペで結果を受け取ってすぐ元の作業画面に戻れる」に余分な 1 クリック。タイルの即時性が損なわれる。 | 入力ごとに即座に QR が更新され、最大の即時性。ただし日本語 IME の確定前の半端な入力でも生成が走り、結果が CPU 安定後にやっと正しいものに収束する見え方になる可能性。 | onChange + debounce 300ms（Nielsen「1 秒以内」基準内）。即時性を保ちつつ IME 確定前のチラつきを抑える。先行サイト QRCG / QRCode Monkey / goqr.me が採用する現代的なベストプラクティスと整合。 |
| (ii) 実装コスト         | 低（既存ロジック維持）。                                                                                      | 低。`useEffect` で `input` / `errorCorrection` 依存の即時生成。                                                                                                      | 中。`setTimeout` + `clearTimeout` cleanup。cycle-205 で確立した useEffect cleanup パターンを **debounce の clearTimeout** に応用。                                                            |
| (iii) AP-P21 / 性能     | 影響なし。                                                                                                    | 多入力で連続再生成、qrcode-generator は同期処理 < 10ms（Nielsen「0.1 秒以内」）で性能上は問題なし。                                                                  | 性能影響なし。UI のチラつき抑制で来訪者体感が向上。                                                                                                                                           |
| (iv) 詳細ページとの整合 | 詳細ページも手動ボタンのまま統一。即時性が両方で損失（UX 退化）。                                             | タイル = リアルタイム / 詳細 = 手動 の挙動分離。T2 likes「操作性一貫」違反。                                                                                         | **タイル / 詳細とも debounce リアルタイム化（T-2 セクション C 案 a 採択により）**。挙動一致 + T2 likes「操作性一貫」を担保。                                                                  |
| (v) ボタン UI 排除      | -                                                                                                             | 排除可能（タイル内スペース節約 = SVG プレビューエリア拡大）。                                                                                                        | 排除可能（タイル + 詳細ページの両方で「QRコード生成」ボタン削除）。                                                                                                                           |

**採択: 案 C（debounce リアルタイム）**。

**採択理由**:

1. T1 likes（即時性）と「IME 確定前のチラつき抑制」を両立し、来訪者体感が最大。先行サイト調査でもベストプラクティスとして示された方式（300ms = Nielsen「1 秒以内」基準内 + 先行サイト調査で QRCG / QRCode Monkey / goqr.me が 200〜400ms 帯を採用、research レポート §2.4 / §3.2 参照）。
2. 「生成」ボタンを排除できることで、タイル内 SVG プレビューエリアを 36px + 8px ≒ 44px 拡大できる。AP-P21 画像出力型適応で最小読み取りサイズ 150px 確保に直接寄与。
3. T-2 セクション C 採択により詳細ページも debounce リアルタイム化されるため、**挙動差は本サイクル内で解消**される（T2 likes「操作性一貫」を満たす）。
4. cycle-205 で確立した **useEffect cleanup パターン**（非同期 race condition 対策）を **debounce の clearTimeout** に応用する形で再利用。qr-code 自体は同期処理だが、cleanup 関数で `clearTimeout` を呼ぶ構造は同型で、Phase 8.1 標準パターンの自然な拡張になる。

##### T-3 設計論点 3: AP-P21 画像出力型適応の SSoT 定義

cycle-202〜206 で確立した AP-P21 役割分担パターン（操作側 = `flexShrink: 0` / 膨張側 = `flex: 1 + overflowY: auto`）は「テキスト出力」の前提で設計されており、qr-code の **SVG 画像出力（正方形 + 最小サイズ制約）** には直接適用できない。本サイクルで AP-P21 の画像出力型適応 SSoT を定義する:

- **入力 textarea**: `rows=2` + `flexShrink: 0`（既存 7 ツールと同じ役割。圧迫されない）
- **誤り訂正 UI**: なし（採択案 B により）
- **SVG プレビューコンテナ**: **正方形維持** + **最小高さ = 150px**（判定基準・変更不可） + **最大高さ ≈ 272px**（**論点 0 案 C 採択 = rows=3 (400×400px) 確定時の試算上限**、padding/textarea/DL 各分を差し引いた残余）。`flex: 1` で残り高さを取りつつ、`aspect-ratio: 1` で正方形を強制し、SVG が `max-width: 100%; height: auto` で内側に収まる。
- **DL ボタン**: `flexShrink: 0`（圧迫されない）。タイル下端に固定。
- **画像出力型固有の本質要件**: (i) Quiet Zone（QR 周囲のマージン 4 モジュール）を必ず維持 / (ii) SVG モジュール数が入力長に応じて段階的に変化することを 4 ケースで観測可能 / (iii) コンテナ背景は `#fff` 固定（QR 読み取り精度要件）。
- **「日常の傍にある道具」コンセプトとの整合**: タイル内の QR はプレビュー兼スキャン可能サイズを目指す（150px 確保 = 物理 2cm 相当、QR の絶対最小読み取り条件をクリア）。詳細ページでは PNG 8 セル / マージン 4 で 320px 以上のスキャン可能サイズ。

**SVG プレビューエリア高さ計測 4 ケース**:

cycle-203〜206 の AP-P21 textarea 計測パターンを画像出力型に置き換え、以下 4 ケースで Playwright + `getBoundingClientRect()` でプレビューコンテナの高さを計測する:

- (a) **空入力**: プレースホルダーまたは空表示状態でのコンテナ高さ。最小高さ 150px 確保の確認。
- (b) **短い ASCII 入力**: 例 `https://yolos.net`（19 文字）→ 21〜25 モジュール程度の小さい QR。コンテナ正方形が維持されているか。
- (c) **中程度の入力**: 例 80 文字程度の URL or 短い日本語文。約 33〜37 モジュールの中程度 QR。
- (d) **長い入力（誤り訂正 M で限界に近い）**: 例 数百文字の日本語混在テキスト。最大モジュール数の QR。コンテナサイズが固定維持され、SVG が縮小して収まっているか。

**判定基準（変更不可・来訪者価値担保用）**: (i) **4 ケース全件でコンテナ高さが 150px 以上**（推奨最小読み取りサイズ、QR 物理 2cm 相当） / (ii) **4 ケース間のコンテナ高さ相互差が 2px 以内**（AP-P21 cycle-203〜206 の整合性基準を継承、画像出力型でも適用） / (iii) **入力欄 textarea の高さは 4 ケースで 40px 以上 + 相互差 2px 以内**（画像出力型でも入力側の AP-P21 基準を維持） / (iv) **SVG コンテナのアスペクト比が 1:1 ± 0.05 に維持**（正方形担保）。

**画像出力型固有の計測項目（変更不可、本サイクルで新規追加）**:

- (v) **SVG モジュール数の妥当性**: 4 ケース各々で SVG タグから `<rect>` 数等を取得し、誤り訂正 M / typeNumber 自動検出の理論値とおおむね一致することを確認（短い URL なら 21-25 モジュール、長い日本語なら 33-37 以上のモジュール）。SVG のモジュール数が極端に少ない / 多い場合は logic.ts の引数ミスを示唆。
- (vi) **Quiet Zone（マージン 4 セル）維持確認**: `createSvgTag(cellSize, margin)` の margin 引数が 4 で渡されていること、SVG の周囲に Quiet Zone が描画されていることを 4 ケースのうち最低 1 ケースで目視 + DOM 確認。Quiet Zone が欠落するとスマホアプリの読み取り精度が大きく低下するため画像出力型固有の本質要件。

**実装パラメータ（builder 推奨初期値、最終決定は builder 裁量）**:

- debounce 300ms（Nielsen「1 秒以内」基準。短すぎるとチラつき、長すぎると即時性損失）
- `aspect-ratio: 1` / 別解: `padding-bottom: 100%` トリック等
- `createSvgTag(cellSize, margin)` の cellSize は 4 を推奨初期値（タイルプレビュー時）。詳細ページは 4、PNG 化時の renderTo2dContext は 8（既存 logic.ts 踏襲）。
- `max-height: 240px` 等の CSS 値は builder 裁量で調整可（判定基準 (i)(ii)(iv) を満たす限り）。

##### T-3 設計論点 4: タイル用テストの観点（最低 6 件）

タイル用コンポーネントのテストを追加する。**最低 6 件**、以下の観点 (i)〜(vi) をすべて含むこと。assertion 文言は builder 裁量。

- (i) **空入力時の表示**: プレースホルダー表示 + DL ボタン非活性 or 非表示 + `role="img"` 要素の存在チェック
- (ii) **短い入力で SVG が生成される**: 入力 `"test"` → SVG タグが描画される + `aria-label` が動的化されている
- (iii) **URL 入力で SVG が生成される**: 入力 `"https://yolos.net"` → SVG が描画される
- (iv) **debounce 動作**: 連続入力中は再描画が抑制され、debounce 経過後に最終結果が反映される（fake timers でテスト）
- (v) **長い入力でもエラーにならない**（誤り訂正 M 固定での上限内の入力）
- (vi) **DL ボタンの click ハンドラ**: 動的に生成される `<a>` 要素が (1) `download` 属性 `qrcode.png` を持つ / (2) `href` 属性が **`data:image/png` で始まる**（`base64,` 等の続き形式は builder 裁量、MINOR-H 反映）、の 2 点を assertion（jsdom 上で `document.createElement` をスパイ、または `appendChild` を観測）。「DL を起動する」という曖昧な表現ではなく、生成 DOM の属性検査として書く。

##### T-3 タイル定義 共通

- タイル用コンポーネント（`src/tools/qr-code/QrCodeTile.tsx`）を新規実装する
  - CSS Module 不使用（codegen 制約）。インラインスタイル方式で既存 7 タイルと同型。
  - **aria-label 動的化**（cycle-207 research §2.1 提示）: 入力ありなら「「`{input.slice(0, 30)}`」の QR コード」、空なら「QR コードプレビューエリア」。
  - **`role="status" aria-live="polite"`** をプレビューコンテナに付与（hash-generator / fullwidth-converter で確立したパターン）。
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に qr-code のエントリを追加（**recommendedSize は cols=3 rows=3 確定**、論点 0 案 C 採択による）
- `npm run generate:tiles-registry` で codegen を実行する（tilesCount: 7 → 8）

**完成条件**: `TILE_DECLARATIONS` に qr-code が追加されている（cols=3 rows=3 確定）。codegen が成功し `tilesCount=8` になる（`src/tools/generated/tiles-registry.ts` の Read 直接確認も併用）。`QrCodeTile.tsx` のテスト **6 件以上**（観点 (i)〜(vi) を全て含む）が緑。タイル UI 上で onChange + debounce 300ms のリアルタイム生成が機能し、誤り訂正レベル M 固定で SVG プレビューが正方形を維持して 150px 以上で表示される。

**T-3 検証手順（AP-WF16）**: T-3 builder は `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` の **4 コマンドすべて** の出力を引用付きで報告する。T-3 reviewer は **4 コマンドすべて** を独立に再実行して出力一致を確認する（cycle-205 / 206 と同型の運用継続）。

#### T-4: 検証と統合確認（AP-P21 計測 / AP-WF16 全件再実行 / 視覚検証）

- `/internal/tiles/preview/tools/qr-code` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク **計 4 枚** 撮影）
- 移行後のスクリーンショット比較（**計 8 枚**: ベース 6 枚 = デスクトップ w1200 / w1900、モバイル w375 × ライト / ダーク両モード + 結果表示済み 2 枚 = ライト / ダーク両モードで任意の URL → debounce 後 SVG + DL ボタン表示済み状態）。T-4 段階で再撮影する（cycle-203 T-4 MINOR-1 = T-2 スクショ流用事故の再発防止）。baseline 8 枚と対応させ before/after 突合の網羅性を担保。
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/qr-code` で 200 OK）
- GIF/PNG ミスラベル修正の最終確認: DL されたファイルの実際の MIME タイプを DevTools / Playwright で取得し、ボタンラベル「PNG形式でダウンロード」/ ファイル名 `qrcode.png` と矛盾しないことを確認
- タイルプレビュー上の動作確認を Playwright で実施
  - デフォルト表示（空入力）でプレビューコンテナがプレースホルダー or 空状態で描画される
  - 入力 onChange + 300ms debounce で SVG が更新される
  - **【AP-P21 画像出力型適応 4 ケース計測】**: SVG プレビューコンテナの `getBoundingClientRect()` 高さ + 幅 + アスペクト比、textarea の高さを以下 4 ケースで計測
    - (a) 空入力
    - (b) 短い ASCII 入力（例: `https://yolos.net`）
    - (c) 中程度の入力（例: 80 文字程度の URL）
    - (d) 長い入力（M 固定の限界近く、例: 数百文字の日本語混在）
  - **判定基準**: (i) SVG コンテナ高さ全件 150px 以上 / (ii) 4 ケース間 SVG コンテナ高さ相互差 ≤ 2px / (iii) textarea 高さ全件 40px 以上 + 相互差 ≤ 2px / (iv) SVG コンテナのアスペクト比が 1:1 ± 0.05 に維持 / (v) **SVG モジュール数が入力長 4 ケースで意図通り変化**（短い入力ほど少モジュール、長い入力ほど多モジュール）/ (vi-svg) **SVG 側 Quiet Zone**: `createSvgTag(cellSize, 4)` 経由で SVG 周囲に Quiet Zone が描画されている（DOM 確認）/ (vi-png) **PNG 側 Quiet Zone (R3 MAJOR-2 追加)**: 案 Y の自前実装で margin = 4 × cellSize = 8 = **32px の白マージンが PNG DataURL の四辺に存在**することを判定する。Playwright で PNG DataURL を `<img>` にロード → `<canvas>` に decode → `getImageData()` で四辺各 32px 分の全画素が `#fff` であることを assertion（最低 1 ケース、または 4 ケース全件で検査）
  - `role="status"` `aria-live="polite"` `aria-label` 動的化の DOM 確認
  - **IME 確定前の debounce 実機観察 (R4 MINOR-D)**: 日本語 IME 入力中の半端な状態（変換候補表示中 / 確定前）で QR が暴れない（debounce 300ms に吸収される）ことを Playwright で実機観察する。最低 1 ケース実施。fake timers のテスト（T-3 観点 iv）と補完する位置付け。補足事項に明記した「画像出力型初回固有の油断打ち消し策 (ii)」の T-4 段階での担保。

**完成条件**: 全検証項目をクリア。lint / format / test / build が全パス。Playwright スクリーンショットが **計 20 枚**（移行前 baseline 8 枚 + タイルプレビュー 4 枚 + 移行後 after 8 枚）。AP-P21 画像出力型適応 4 ケース計測で 4 基準（判定基準 i〜iv）+ 画像出力型固有 3 項目（v / vi-svg / vi-png）すべてクリア。GIF/PNG ミスラベル修正の三者一致（MIME = `data:image/png` / ファイル名 = `qrcode.png` / ボタンラベル = 「PNG形式でダウンロード」）が確認されている。IME 確定前 debounce 実機観察が完了している。

**T-4 検証手順（AP-WF16）**: T-4 builder は 4 コマンド全件出力と Playwright 計測 4 ケース実測値を引用付きで報告。T-4 reviewer は (i) 自動チェック 4 コマンドすべてを独立に再実行、(ii) Playwright 計測の 4 ケースのうち最低 1 ケースを独立に再現、の両方を実施する（cycle-205 / 206 と同形）。

### 検討した他の選択肢と判断理由

#### スコープ外（別 backlog 化）にした 4 件 + 本サイクル内取込判断にした 1 件のゼロベース判断

検討した 5 件のうち、別 backlog 化と決めた 4 件（種別タブ追加 / SVG DL ボタン / search_intents 全体棚卸し / 装飾機能）、および本サイクル内取込判断にした 1 件（詳細ページのリアルタイム化 = T-2 セクション C 案 a 採択）について、4 軸（来訪者価値・スコープ整合・規模・歯止め策）で言語化する。

##### 1. 種別タブ追加（URL / テキスト / Wi-Fi の 3 種）

| 評価軸           | 判断                                                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) 来訪者価値   | **高い**（特に Wi-Fi QR は近年急増、日本国内需要 15-20%）。ただし現状の textarea 単一で URL / テキストはすでに対応可能で、Wi-Fi が新規価値の主軸。                                     |
| (b) スコープ整合 | **不整合**。B-314「移行 + タイル化」は既存機能の新デザイン適用が定義であり、種別タブの新規追加は新機能。                                                                               |
| (c) 規模         | **大きい**。Wi-Fi QR は SSID + パスワード + 暗号化方式（WPA/WPA2/WEP）の 3 フィールド + WIFI スキーム文字列生成ロジック + テスト追加。詳細ページの UI 大幅改修。1 サイクル丸ごと相当。 |
| (d) 歯止め策     | **新規 backlog 起票**（B-435 提案 = 「QR コードツールへの種別タブ追加（URL / テキスト / Wi-Fi）」、P3 程度）で温存。                                                                   |

**判断**: 別 backlog 化（B-435 提案）。

##### 2. 詳細ページのリアルタイム化（本サイクル内取込済）

本論点は T-2 設計論点 C のゼロベース 3 案比較（案 a / b / c）で再検討し、**案 a（詳細ページもリアルタイム化、本サイクル内）を採択**した。Decision Making Principle「より良い UX が達成可能なら必ずそれを選ぶ / 実装コストは選択理由にしてはならない」と T2 likes「操作性一貫」に最も適合するため。詳細は T-2 セクション C を参照。

**判断**: 本サイクル内取込（B-436 提案は取り下げ）。

##### 3. SVG ダウンロードボタンの追加

| 評価軸           | 判断                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) 来訪者価値   | **中**。印刷業者入稿 / Illustrator 等のベクター編集需要には SVG が最適。一般来訪者は PNG で十分。                                                       |
| (b) スコープ整合 | **不整合**。既存にない機能の追加で「移行 + タイル化」のスコープ外。                                                                                     |
| (c) 規模         | **小**。`new Blob([svgTag])` + `URL.createObjectURL` でボタン 1 個追加。0.2 サイクル相当。                                                              |
| (d) 歯止め策     | **新規 backlog 起票**（B-437 提案 = 「QR コードツールに SVG ダウンロードボタンを追加」、P4 程度）で温存。実装が小さいため他のサイクルの隙間で着手可能。 |

**判断**: 別 backlog 化（B-437 提案）。

##### 4. T1 / T2 search_intents 全体の棚卸し（QR コード 1 件追加は本サイクル内で対応済）

「QRコード」「QRコード 作成」「QRコード 生成」の 3 語の追加は **本サイクル T-2 で実施**（SSoT 整合確保のため）。別 backlog 化するのは「search_intents 全体の網羅性棚卸し（QR コード以外にも未掲載の抜け項目がないかの一括レビュー）」という上位レイヤーの作業。

| 評価軸           | 判断                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| (a) 来訪者価値   | **間接的に高い**。yaml はターゲット定義の SSoT で、検索流入導線の設計に使われる。網羅性が高いほど将来のコンテンツ計画でカテゴリ優先度を正確に評価できる。                                                                      |
| (b) スコープ整合 | **不整合（棚卸し全体）**。QR コード 1 件追加と異なり、全体棚卸しは Google Trends / Search Console 等の実測データを伴う調査作業で、規模が大きい。                                                                               |
| (c) 規模         | **中**。T1 / T2 両 yaml の現状項目を全件レビュー + 検索ボリュームの実測 + 不足項目の洗い出し + 追加。1 サイクル相当。                                                                                                          |
| (d) 歯止め策     | **新規 backlog 起票**（B-438 提案 = 「T1 / T2 ターゲット yaml の search_intents 全体棚卸し」、P3 程度）。本サイクル内では QR コード 3 語追加で SSoT 整合を確保し、棚卸し全体は別サイクルでまとめて実施する分業形を明文化する。 |

**判断**: QR コード 3 語追加は **本サイクル T-2 で実施**。search_intents 全体棚卸しは別 backlog 化（B-438 提案、上位レイヤー作業として再定義）。

##### 5. ロゴ埋め込み / 色変更 / フレーム追加などの装飾機能

| 評価軸           | 判断                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) 来訪者価値   | **低 - 中**。装飾は店舗 / ブランドオーナーの一部用途には便利だが、yolos.net の差別化軸「シンプル・高速・登録不要」とは方向性が対立する。先行サイト調査でも「装飾なし」を採用する yolos.net の方向性が QRCG 等の有料化サイトとの差別化として有効と判断済（research §1.2 / §4.2）。                                                      |
| (b) スコープ整合 | **強い不整合**。「移行 + タイル化」のスコープを大きく超える新機能群。                                                                                                                                                                                                                                                                  |
| (c) 規模         | **非常に大きい**。色変更だけでも UI とロジック追加、ロゴ埋め込みはファイルアップロード + Canvas 合成、フレームは SVG 加工。1 機能あたり 1 サイクル相当。                                                                                                                                                                               |
| (d) 歯止め策     | **新規 backlog 起票しない**（差別化軸との整合を再考する優先順位低）。代わりに「補足事項」セクションに **観測トリガー 3 種**（年次レビュー時 / Phase 10 完了時 / 装飾系クエリの月間流入 100 回超過）を明示し、いずれかに該当した時点で B-439 提案として起票するルートを保持する。トリガー未到達の間は本計画書の記録のみで歯止めとする。 |

**判断**: backlog 起票せず、本計画書本文での記録のみ。

#### 補足: PM 採択判断のメタ整理

上記 5 件のうち別 backlog 化した 4 件に共通する判断パターンは「**B-314 Phase 8.1 のスコープ（移行 + タイル化）を厳密に守ることで、Phase 8.1 全体（34 ツール）の進行速度を維持する**」である。1 サイクルで「移行 + タイル化 + 種別タブ + SVG DL + 棚卸し + 装飾機能」を全部入りすると数倍規模になり、レビュー精度低下 / バグ混入 / 来訪者影響長期化のリスクが急増する。一方、本サイクル内に取り込んだ 3 件 = (i) GIF/PNG ミスラベル修正（来訪者の実害解消・最小修正）/ (ii) 詳細ページの debounce リアルタイム化（Decision Making Principle = より良い UX が達成可能なら必ずそれを選ぶ / T2 likes 操作性一貫）/ (iii) T1 yaml への「QRコード」3 語追加（SSoT 整合）は、いずれも来訪者価値直結 + 実装規模が半サイクル以下 + Phase 8.1 標準パターンの自然な拡張、という共通軸で取り込み判断した（AP-WF15「サイクル中の補修課題の振り分け軸」を採用）。

### 計画にあたって参考にした情報

- **直前の 2 つの調査レポート**:
  - `/mnt/data/yolo-web/docs/research/2026-05-23-qr-code-tool-ux-image-output-patterns.md`（QR コード生成ツール UI/UX 調査 / 画像/SVG 出力型ツールのベストプラクティス / 主要 QR 系サイト 7 件 Playwright 巡回 / WCAG / Nielsen 応答時間ガイドライン）
  - `tmp/research/2026-05-23-cycle-207-qr-code-code-research.md`（または code-researcher の直前出力 = qr-code 現状コード構造調査、本計画書 T-1 タスク冒頭に主要数値の grep コマンドを併記済で `tmp/` 配下削除後も独立再現可能）
- **cycle-200〜206 の移行実装（標準パターンの実体）**:
  - `src/app/(new)/tools/{char-count,byte-counter,url-encode,base64,html-entity,hash-generator,fullwidth-converter}/page.tsx` / `page.module.css` — 1200px ハードコード SSoT
  - `src/tools/{base64,html-entity,hash-generator,fullwidth-converter}/Component.module.css` — 新トークン SSoT（並べ読み突合用）
  - `src/tools/{base64,html-entity,hash-generator,fullwidth-converter}/{Base64Tile,HtmlEntityTile,HashGeneratorTile,FullwidthConverterTile}.tsx` — kind=widget タイルのリアルタイム反映 + AP-P21 役割分担実装の参考実装
  - `src/tools/_constants/tile-declarations.ts` — `TILE_DECLARATIONS` エントリ形式
- **qr-code の現在のソースコード**:
  - `src/app/(legacy)/tools/qr-code/{page.tsx,opengraph-image.tsx,twitter-image.tsx}`
  - `src/tools/qr-code/{Component.tsx,Component.module.css,logic.ts,meta.ts,__tests__/logic.test.ts}`
- **qrcode-generator ライブラリ**: `package.json` で `qrcode-generator@^2.0.4`。同期 API で `createSvgTag()` / `createDataURL()` / `createImgTag()` / `renderTo2dContext()` を提供。`createDataURL()` の出力は **GIF DataURL**（test L14 で固定化済）、`createImgTag()` も内部で `createDataURL()` を呼ぶため GIF。PNG 化は `renderTo2dContext(ctx, cellSize)` + `canvas.toDataURL("image/png")` 経路 + Quiet Zone 自前実装で行う。**実測根拠の引用統一**: `node_modules/qrcode-generator/dist/qrcode.js` L557 (createDataURL = GIF 出力本体) / L577 (createImgTag = 内部 createDataURL 呼出) / L719 (renderTo2dContext) + `node_modules/qrcode-generator/dist/qrcode.d.ts:50` (`renderTo2dContext(context: CanvasRenderingContext2D, cellSize?: number): void` = margin パラメータが API シグネチャに存在しない)。
- **デザイントークン定義**: `src/app/globals.css`（`--bg` / `--bg-soft` / `--border` / `--accent` / **`--accent-strong`**（hover 用、R3 MAJOR-1 訂正反映）/ `--fg` / `--fg-soft` / `--danger` / `--danger-soft`。エラー系は L44-46 ライトモード / L130-132 ダークモード定義で PM 実測確認済。**`--accent-hover` は globals.css に存在しないため参照しない**）
- **`docs/cycles/cycle-205.md` / `cycle-206.md` キャリーオーバー**: 「AP-WF16 を T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行で運用継続」「AP-WF05 dark mode 必須」「AP-P21 計測 4 ケースを標準運用として継続」「『淡々と進むはず』油断打ち消し策」「画像出力型ツール初回のため非同期パターン (cycle-205) 直接波及は不要、debounce 派生のみ」
- **ターゲットユーザー定義**:
  - `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1。`search_intents` に「QRコード」が現状未掲載 → **本サイクル T-2 で 3 語追加**。全体棚卸しは B-438 提案で別 backlog）
  - `docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2）
- **アンチパターン集**:
  - `docs/anti-patterns/planning.md`: **AP-P17**（3 案以上のゼロベース列挙）/ **AP-P21**（固定枠 UI 膨張 / 操作側同居）/ AP-P16（一次情報の実体確認）/ AP-P20（過度に具体的な計画の回避）/ AP-P07（来訪者の認知モデル起点 UI 選択）/ AP-P09（来訪者価値起点ゴール）
  - `docs/anti-patterns/workflow.md`: **AP-WF16**（自動チェック PASS の reviewer 独立再実行）/ **AP-WF05**（移行前ダークモード撮影）/ AP-WF12（手段先行 / 一次情報の実体確認）/ AP-WF09（チェックリストの形式通過）/ AP-WF11（並べ読み 4 列テーブル）/ AP-WF15（サイクル中の補修課題の振り分け軸）
- **デザイン移行アーキテクチャ**: `docs/design-migration-plan.md`
- **backlog の関連項目**: `docs/backlog.md` B-431（共通コンポーネント置換）/ B-432（trustLevel 一括削除）/ B-433（タイル UI / 詳細ページの localStorage 共有）/ B-434（w360 タイル viewport）/ B-435 提案 / B-437 提案 / B-438 提案 / B-439 提案 / B-440 提案 / B-441 提案（B-436 提案は本サイクル取込済のため取り下げ）

### 完成条件（サイクル全体）

- [ ] `Component.module.css` の旧トークン置換完了（`grep -c -- "--color-" src/tools/qr-code/Component.module.css` → `0`）
- [ ] `#fff` リテラル 2 箇所（`.generateButton color` / `.qrImage background-color`）は維持されている
- [ ] `(legacy)/tools/qr-code/` のファイルが残存していない（3 ファイル全件 (new) 配下に移動済）
- [ ] `src/app/(new)/tools/qr-code/page.module.css` 新設、`.page` ラッパーで 1200px max-width 適用
- [ ] GIF/PNG ミスラベル修正完了（**案 Y 採択確定**: `logic.ts` が renderTo2dContext + canvas.toDataURL("image/png") 経路 / DataURL prefix `data:image/png` / ファイル名 `qrcode.png` / ボタンラベル「PNG形式でダウンロード」の三者一致）
- [ ] `logic.test.ts:14` の MIME 期待値が `"data:image/png"` に更新済（案 Y 採択により必須）
- [ ] 詳細ページが debounce 300ms リアルタイム化されており、「QRコード生成」ボタンが削除されている（C 採択により）
- [ ] T1 yaml `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` の `search_intents` に「QRコード」「QRコード 作成」「QRコード 生成」の 3 語が追加されている
- [ ] `.generateButton color: #fff` のコントラスト比 WCAG AA 基準 4.5:1 以上が両モードで実測担保されている（`tmp/cycle-207/contrast-check.md` に記録）
- [ ] `TILE_DECLARATIONS` に qr-code エントリ追加（kind=widget / cols=3 rows=3 確定 / 詳細パス `/tools/qr-code`）
- [ ] `npm run generate:tiles-registry` で `tilesCount=8` に更新（`src/tools/generated/tiles-registry.ts` を Read で直接確認）
- [ ] `QrCodeTile.tsx` 新規実装（誤り訂正レベル M 固定 / onChange + debounce 300ms リアルタイム生成 / AP-P21 画像出力型適応 / `role="status" aria-live="polite"` / aria-label 動的化 / タイル下端に独立 DL ボタン配置）
- [ ] タイル用テスト **6 件以上**が緑（観点 (i) 空入力 / (ii) 短い入力 / (iii) URL 入力 / (iv) debounce 動作 / (v) 長い入力 / (vi) DL `<a>` 要素の `download="qrcode.png"` + `href` が **`data:image/png` 始まり**、をすべて含む）
- [ ] 既存テスト 5 件が引き続き緑（test L14 の MIME 期待値更新済）
- [ ] `/internal/tiles/preview/tools/qr-code` で 4 viewport（w1200 / w375 × light / dark）表示確認
- [ ] AP-P21 画像出力型適応 4 ケース計測で 4 判定基準（SVG 高さ全件 150px 以上 / 相互差 ≤ 2px / textarea 高さ全件 40px 以上 + 相互差 ≤ 2px / アスペクト比 1:1 ± 0.05）+ 画像出力型固有 3 項目（SVG モジュール数妥当 / SVG 側 Quiet Zone 維持 / **PNG 側 Quiet Zone 32px 維持の getImageData 検査**）全件クリア
- [ ] Playwright スクショ baseline 8 + tiles-preview 4 + after 8 = **計 20 枚** が `tmp/cycle-207/` 配下に保存
- [ ] `npm run lint` / `npm run format:check` / `npm run test` / `npm run build` 全件 PASS
- [ ] T-3 / T-4 で reviewer が 4 コマンドすべて独立再実行して出力一致を確認（AP-WF16）
- [ ] AP-WF05 dark mode 撮影が baseline / tiles-preview / after の各段階で実施されている

### 本サイクル外として認識する事項

- **B-431**（共通コンポーネントの旧トークン置換）: 本サイクルではスコープ外。Phase 8.1 完了前の任意タイミングで実施可能。
- **B-432**（`trustLevel` フィールド一括削除）: Phase 8.1 全 34 ツール完了後の一括対応。本サイクルでは `trustLevel: "verified"` を維持。
- **B-433**（タイル UI / 詳細ページの localStorage 共有による入力値保持）: 本サイクルでは未実装。Phase 10.1 ダッシュボード設計時または Phase 8.1 全完了後にタイル全般の共通機能として横展開。
- **B-434**（w360 viewport でのタイル表示）: 本サイクルでは暫定許容。Phase 10.1 ダッシュボード設計時の必須検討項目。
- **B-435 提案**（QR コードツールへの種別タブ追加 / URL・テキスト・Wi-Fi の 3 種）: 本サイクル外。Wi-Fi QR は SSID + パスワード + 暗号化方式の 3 フィールド + WIFI スキーム文字列生成で 1 サイクル丸ごと相当。
- ~~**B-436 提案**（詳細ページのリアルタイム化 + ボタン削除）~~ → **本サイクル T-2 セクション C 案 a 採択で内包済（別 backlog 起票なし）**。Decision Making Principle 適合のため取り下げた。
- **B-437 提案**（SVG ダウンロードボタンの追加）: 本サイクル外。実装小規模だが新機能追加でスコープ外。
- **B-438 提案**（T1 / T2 search_intents 全体棚卸し）: 本サイクル外。QR コード 3 語追加は T-2 で完了済、棚卸し全体は別レイヤー作業として残置。
- **B-439 提案**（QR コード装飾機能の提供可否再検討、観測トリガー駆動）: 本サイクル外。補足事項に明示した 3 種の観測トリガー（年次レビュー時 / Phase 10 完了時 / 装飾系クエリ流入 100 回/月超過）のいずれか到達時に起票するルートを保持。
- **B-440 提案 (R3 MINOR-A)**（`--accent` + `#fff` の WCAG AA 適合度の全ツール一括点検）: 本サイクル外。qr-code の WCAG 実測でダーク mode が 4.5:1 を下回った場合に PM エスカレーション + B-440 起票 → 全ツール（image-resizer / business-email / cron-parser / keigo-reference / unix-timestamp / password-generator / hash-generator / qr-code など 40+ 箇所）共通問題として globals.css の `--accent` 値再調整を含めて一括対応。
- **B-441 提案 (R3 MINOR-E)**（QR コード DL ファイル名の連番回避策）: 本サイクル外。タイル / 詳細の DL がともに `qrcode.png` で同名となるためブラウザ側で `qrcode (1).png` 等に連番化される現象を、ハッシュ / タイムスタンプ付きファイル名で回避する案。リアルタイム化で頻度増の可能性があるが、本サイクルでは観察事項に留めて温存。
- **装飾機能（ロゴ埋め込み / 色変更 / フレーム）**: backlog 起票せず、yolos.net の差別化軸「シンプル・高速・登録不要」を保つ方針で **意図的に非提供**。観測トリガー（次節「補足事項」に明記）に該当した場合のみ再検討対象とする。

### 候補ツール比較（kickoff 時の絞り込み）

cycle-206 完了時点での残ツール約 27 件のうち、以下を比較し qr-code を選定した（kickoff フェーズで確定 / 本計画書では再評価対象としない）。

- **(a) qr-code 生成（採択）**: 「日常の傍にある道具」コンセプトとの強い親和性 + 画像 / SVG 出力型ツール初回の構造的差分（textarea 1 + SVG / 画像出力 + DL ボタン + 誤り訂正 4 状態）+ 既存実装の GIF/PNG ミスラベル修正という来訪者価値直結の補修。**選定**。
- **(b) image-base64 / image-resizer**: 入力が画像ファイル（FileReader 非同期 + Canvas）で構造的差分が大きい。cycle-205 非同期パターン応用先候補だが、画像 / SVG 出力型を qr-code で扱った直後に画像入力型を扱うのは情報量過多。qr-code の次サイクル候補として残す。
- **(c) kana-converter**: fullwidth-converter（cycle-206）と構造類似で膨張ゼロ型 3 件目候補。標準パターン通常運用の継続として手堅いが、画像 / SVG 出力型の機会を qr-code に譲った。次サイクル以降で扱う。
- **(d) より単純な構造のツール**: 構造的差分が少なく Phase 8.1 通常運用 2 回目としては差分不足。

**採択理由**:

1. **「日常の傍にある道具」コンセプト適合度**: URL / Wi-Fi / LINE 友だち追加 URL を紙物・スマホ間で受け渡すのは典型的な日常需要で、コンセプトとの親和性が最高クラス。
2. **構造的差分の段階性**: 画像 / SVG 出力型ツール初回として、AP-P21 役割分担の画像出力型適応 SSoT を新規に定義できる（kana-converter ではこの新 SSoT 機会は得られない）。
3. **既存実装の補修機会**: GIF/PNG ミスラベルという来訪者の小さくない実害が本サイクル最小修正で解消できる（PM スコープ判断、AP-WF15 同型の振り分け軸を採用）。
4. **来訪者検索流入の見込み**: T1 search_intents への「QRコード」3 語追加は **本サイクル T-2 内で実施**して SSoT 整合を確保する。実際の検索流入見込みは「パスワード生成」級に大きいと PM は見立てるため、yaml 追加とタイル + 新デザイン詳細ページの整備を同時並行で進め、本サイクル完了直後から流入を正面で受け入れる体制を作る。全体棚卸し（B-438 提案）は別レイヤーで温存。

## レビュー結果

### 計画フェーズ（R1 → R4）

2 名の reviewer（来訪者価値・スコープ観点 / AP 監査・運用形整合観点）に並行レビューさせ、計 4 回のレビュー・修正サイクルを経て承認を得た。

- **R1**: MAJOR 計 6 件（rows=2 vs rows=3 の AP-P17 3 案比較欠落 / タイル内 DL ボタン配置の 3 案比較欠落 / GIF/PNG 修正のフォールバック条項が Decision Making Principle 違反 / タイル先行リアルタイム化の T2 likes 一貫性違反 / T1 yaml への QRコード 未掲載放置 / `TILE_DECLARATIONS` grep コマンド出力不一致）+ MINOR 10 件。計画書を独立にゼロベース再構築し、採択案を計画段階で確定する形に修正。
- **R2**: MAJOR 計 3 件（`--accent-hover` 不在の事実誤認 / `renderTo2dContext` の margin 引数不在 = Quiet Zone 自前実装必須 / 「rows=3 hash-generator 実績済」事実誤認）+ MINOR 8 件。一次情報未確認による誤記述（AP-P16 / AP-WF12 同型）が複数発覚し、並べ読み 4 列テーブル全行を一次情報で再確認 + Quiet Zone 自前実装 7 手順を計画書本文に SSoT 化。
- **R3**: MAJOR 1 件（L493 「デザイントークン定義」リストへの `--accent-hover` 残置 = R3 修正の伝播漏れ）+ MINOR 5 件。MAJOR-1 訂正対象の全文 grep ダブルチェックで残置を解消 + Quiet Zone 7 手順を自然言語擬似コードに整理（AP-P20 / AP-WF03 抵触緩和）+ T-2 完成条件をチェックリスト形式に整形 + T-4 検証手順に Playwright での IME debounce 実機観察を追加。
- **R4**: **2 名の reviewer 双方から承認（CRIT 0 / MAJOR 0 / MINOR 0）**。AP 監査全項目で違反なし、過去サイクル運用形との整合 OK、新規 AP 起票候補なし。execute フェーズへの移行を承認。

### 採択された主要設計判断

- **GIF/PNG ミスラベル修正**: AP-P17 3 案比較で **案 Y（真の PNG 化、`renderTo2dContext` + `canvas.toDataURL("image/png")` + Quiet Zone 自前実装 7 手順）** を採択確定。フォールバック条項なし（Decision Making Principle 適合）。`logic.test.ts:14` の MIME 期待値変更を必須化。
- **詳細ページのリアルタイム化**: AP-P17 3 案比較で **案 a（詳細ページも debounce 300ms リアルタイム化 + 「QRコード生成」ボタン削除）** を本サイクル内取込確定。Component.tsx を 1 タスク内で完結。B-436 提案は取り下げ。
- **T1 yaml への QRコード 3 語追加**: 本サイクル T-2 内で `search_intents` に「QRコード」「QRコード 作成」「QRコード 生成」を追加（SSoT 整合）。全体棚卸しは B-438 提案として別レイヤー化。
- **タイルサイズと DL ボタン配置**: AP-P17 3 案比較で **rows=3 (400×400px) + DL ボタン同居（タイル下端独立配置）** を採択確定。SVG プレビュー 272px 確保（推奨最小 150px の 1.81 倍）。Phase 8.1 で rows=3 を初導入する 1 例目（Phase 10.1 ダッシュボード設計時の実証データ）。
- **誤り訂正レベルのタイル UI 収納**: AP-P17 3 案比較で **案 B（M 固定省略）** を採択確定。詳細ページで L/M/Q/H 全選択可能、タイルは即時性最大化。
- **タイル UI のトリガー方式**: AP-P17 3 案比較で **案 C（onChange + debounce 300ms）** を採択確定。
- **AP-P21 画像出力型適応 SSoT**: 操作側（textarea / DL ボタン）= `flexShrink: 0` / 膨張側（SVG プレビュー）= `flex: 1 + aspect-ratio: 1` + 最小高さ 150px / 最大 272px。判定基準 4 + 画像出力型固有 2（SVG モジュール数 / Quiet Zone）を本サイクルで新規定義。

### 別 backlog 化した提案

B-435（種別タブ）/ B-437（SVG DL）/ B-438（search_intents 全体棚卸し）/ B-439（装飾機能観測トリガー駆動再検討）/ B-440（`--accent` + `#fff` WCAG 全ツール一括点検）/ B-441（DL ファイル名連番回避）。

### 次サイクル運用形への示唆

- 画像出力型 SSoT の確立は Phase 8.1 残りツール（image-base64 / image-resizer 等）の標準雛形に流用可
- R3 で「`--accent-hover` 訂正の伝播漏れ」が発生したため、訂正対象文字列の **全文 grep ダブルチェック** をセルフチェック手順に組み込む価値あり
- Quiet Zone 7 手順の自然言語擬似コード化は AP-P20「過度に具体的な計画の回避」と「本質要件の明確化」を両立した参考実装パターン

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

- **画像 / SVG 出力型ツール初回**: これまでの 7 ツール（char-count / byte-counter / url-encode / base64 / html-entity / hash-generator / fullwidth-converter）は全て「textarea → textarea」または「textarea → 計測値」の構造だったため、本サイクルでは「textarea → 画像 / SVG」という新しい出力構造を扱う。AP-P21 役割分担パターン（タイル = 入力 + リアルタイム表示 / 詳細ページ = 入力 + 結果 + コピー / DL）を画像出力型にどう適応するかを計画時点で SSoT 整理する。
- **誤り訂正レベルのタイル UI 収納**: cycle-206 fullwidth-converter のオプション 3 種チェックボックスでは AP-P17 ゼロベース 3 案比較を経て案 B（全 ON 固定省略）を採択した。QR の誤り訂正レベルは 4 状態の選択肢であり、来訪者の用途分布によって最適解が異なる可能性がある。タイル UI 収納方法を AP-P17 ゼロベース 3 案比較で再検討する。
- **「淡々と進むはず」という油断を打ち消す**: cycle-206 で確立した「通常運用フェーズでもメタ要素が薄いことを油断に変えない」運用形を継続。AP-WF16（4 コマンド全件 reviewer 独立再実行）/ AP-WF05（dark mode 撮影）/ 画像プレビュー高さ計測の運用形をスキップしないよう計画書本文で明文化する。
- **画像出力型初回固有の油断打ち消し策（本サイクルで新規追加）**:
  - (i) **SVG コンテナの正方形維持と最小サイズ 150px 確保**: 4 ケース計測で必ず判定基準を実測する。テキスト出力型の AP-P21 既存基準だけで OK 判定しない。
  - (ii) **IME 確定前の debounce 動作**: 日本語入力中の半端な状態で QR が暴れないこと（debounce 300ms による吸収）を Playwright で実機確認する。fake timers のテストだけで満足しない。
  - (iii) **GIF/PNG ミスラベルの三者一致確認**: 修正後の DataURL prefix / DL ファイル名 / ボタンラベルの三者一致を DevTools or Playwright で実測する。「変更したつもり」で見落とさない。
- **装飾機能（ロゴ / 色変更 / フレーム）非提供の観測トリガー**: 本サイクルでは装飾機能を意図的に非提供とする。以下のいずれかが発生した時点で「装飾機能の提供可否」を再検討する観測トリガーを明示しておく:
  - (a) **次の年次レビュー時**（Phase 8.1 完了時点 / docs/design-migration-plan.md の年次見直しタイミング）
  - (b) **Phase 10（ダッシュボード設計）完了時**（タイル全般の運用知見が蓄積された後の総合判断時点）
  - (c) **Google Search Console / GA で装飾系クエリ（「QRコード ロゴ」「QRコード 色」「QRコード フレーム」等）の月間流入が 100 回を超えた時**（定量的需要シグナル）
  - いずれかに該当した時点で B-439 提案（QR コード装飾機能の提供可否再検討）として backlog 起票するルートを残す。それまでは差別化軸「シンプル・高速・登録不要」を維持する。
- **観察 — DL ファイル名連番化 (MINOR-E)**: タイル / 詳細とも DL ファイル名は `qrcode.png` で同名のため、ブラウザのダウンロードフォルダで `qrcode (1).png` / `qrcode (2).png` のように連番化される。これは現状実装でも同じだが、リアルタイム化により「同入力で複数回 DL」の頻度が増える可能性がある。**ハッシュやタイムスタンプを含むファイル名（例: `qrcode-<8桁hash>.png` / `qrcode-2026-05-23-1430.png`）にする案** は来訪者の DL 後の管理利便性を向上させるが、本サイクルではスコープ外として **B-441 提案（QR コード DL ファイル名の連番回避策）** として温存する。次サイクル以降の検討対象。**B-441 提案として温存する旨は「### 本サイクル外として認識する事項」セクションを参照（R4 MINOR-B クロスリンク）**。
- **MCP ツール（Playwright / GA）の前景実行**: T-1 baseline / T-4 tiles-preview / T-4 after の Playwright 撮影、および画像プレビューの DOM 計測は CLAUDE.md「Use foreground sub-agent for MCP tools」に従い前景サブエージェントで実施する。背景モードでは MCP ツールが使えない。

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
