---
id: 203
description: B-314 Phase 8.1 第 4 弾——cycle-200/201/202 で確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を base64 に 4 回目適用すると同時に、cycle-202 で新規追加された AP-P21（固定枠 UI の「膨張側」と「操作側」同居リスク）の最初の事後検証として「textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto」を計画段階で先取り適用。T-4 Playwright 計測で 4 ケース全件 textarea = 46px・相互差 0px を実証し、AP-P21 の運用が機能していることを定量的に示した。T-3 R1 で builder の自動チェック虚偽 PASS 報告を発見、AP-WF16 を新規追加。
started_at: 2026-05-22T09:44:11+0900
completed_at: 2026-05-22T11:25:05+0900
---

# サイクル-203

B-314 Phase 8.1 の第 4 弾。cycle-200（char-count）/ cycle-201（byte-counter）/ cycle-202（url-encode）で確立した標準パターンに沿って、次のツール詳細ページの新デザイン移行 + タイル化を実施する。

着手対象のツール選定は cycle-planning で行う。cycle-202 のキャリーオーバーが示した方針メモは以下の通り：

- (a) 1 件継続（標準パターン 4 回目の適用）
- (b) 構造類似ペアでの並行（例: url-encode + base64 / html-entity）
- (c) hash-generator の非同期パターン（標準パターン外）への踏み込み

cycle-202 で AP-P21（固定枠 UI における「膨張側」と「操作側」同居リスクの事前評価）が新規追記されたため、第 4 弾で結果膨張型ツール（base64 / html-entity 等）を選べば AP-P21 の事後検証としても有意義。一方 hash-generator は標準パターン外への踏み込みで AP リスクが上がる。

残ツール数: `src/app/(legacy)/tools/` 配下に約 31 ディレクトリ（age-calculator / base64 / bmi-calculator / business-email / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / yaml-formatter）。

## 実施する作業

- [x] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [x] 着手対象ツールの選定（GA4 PV・構造単純度・AP-P21 事後検証価値・Phase 9 依存を踏まえて判断）→ **base64**
  - [x] kind 判定（single / widget / multi）とタイル推奨サイズの確定 → **kind=widget / cols=3 rows=2**
  - [x] 計画レビュー → 指摘解消（R1 必須 1 / 推奨 4 → R2 必須 1 / 推奨 3 → R3 必須 0 / 推奨 3 で Pass。推奨 3 件も追加反映）
- [ ] cycle-execution で計画に沿った実装を行う
  - [x] T-1: 現状把握と移行前 baseline 取得（既存テスト 8 件 Pass / `--color-*` 21 実測 / スクリーンショット 7 枚取得 / R1 Pass）
  - [x] T-2: 詳細ページの (new) 配下移行（git mv 3 ファイル / page.module.css 新設 / 旧トークン 21 → 0 / url-encode SSoT と 8 種マッピング完全同名一致 / R1 Pass）
  - [x] T-3: タイル定義（Base64Tile.tsx 190 行 + TILE_DECLARATIONS 末尾追加 + codegen 反映 + テスト 9 件 / R1 MAJOR-1 = format:check 虚偽 PASS 報告 → R2 Pass / AP-WF16 起票候補を申し送り）
  - [x] T-4: 検証と統合確認（AP-P21 事後検証含む）（lint/format/test/build 全 PASS / `/tools/base64` 200 OK / タイル動作 (a)-(d) 全確認 / **AP-P21 計測: 4 ケース全て textarea = 46px、相互差 0px** / R1 Pass / 推奨指摘 2 件 = MINOR-1 after-t4 スクショが T-2 と MD5 一致 + MINOR-2 w375 タイルはみ出し B-434 既知事項）
- [x] cycle-completion でサイクルを完了させる

## 作業計画

### 目的

**誰のために**: M1a（特定の作業に使えるツールをさっと探している人）/ M1b（気に入った道具を繰り返し使っている人）。Base64 のエンコード／デコードを行いたい来訪者（API 認証情報の埋め込み、データ URI スキーム作成、エンコード済み文字列の中身を確認したい等）。

**何の価値**:

- デザインの統一感向上。`/tools/base64` の見た目を他の (new) 配下ツール（char-count / byte-counter / url-encode）と揃え、サイト内回遊で違和感が出ないようにする。
- 将来のダッシュボード機能（道具箱タイル表示）への準備。base64 をタイル化して `TILE_DECLARATIONS` に登録することで、ダッシュボード本実装フェーズ (Phase 10.x) でこのツールがタイル候補として表示可能になる。
- リピーター（M1b）の混乱を避けるため、URL（`/tools/base64`）と挙動（encode / decode の機能）は一切変えない。

**背景**: B-314 Phase 8.1 の第 4 弾。cycle-200（char-count）/ cycle-201（byte-counter）/ cycle-202（url-encode）で確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を 4 回目として適用する。

加えて、本サイクルは cycle-202 で新規追加された **AP-P21（固定枠 UI における「膨張側」と「操作側」同居リスクの事前評価）** の最初の事後検証となる位置付け。base64 は url-encode と Component 構造がほぼ同一（モード切替×2 + textarea×2 + 変換ボタン）かつ結果膨張倍率は url-encode より大きい（日本語入力で UTF-8 経由で約 4 倍、url-encode の `%XX` 列は最大 3 倍）。url-encode で確立した「textarea rows=2 + `flexShrink: 0` / 結果欄 `flex: 1 + overflowY: auto`」の役割分担パターンを最初からタイル UI に適用し、長文字列入力時にも入力欄が圧迫されないことを Playwright で計測確認する。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- base64 の現在のファイル構成・コード・CSS を確認する
  - `src/tools/base64/`: Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/logic.test.ts`（既存テスト 8 件、`grep -c '^\s*describe(' src/tools/base64/__tests__/logic.test.ts` → 2 / `grep -c '^\s*test(' src/tools/base64/__tests__/logic.test.ts` → 8 で実測済）
  - `src/app/(legacy)/tools/base64/`: page.tsx / opengraph-image.tsx / twitter-image.tsx
  - `src/tools/base64/Component.module.css` の `--color-*` 残存数: **21 箇所**（`grep -c -- "--color-" src/tools/base64/Component.module.css` で実測）。**参考までに url-encode は移行前 24 箇所**（cycle-202 計画書 L63、`git show 5681e0c1:src/tools/url-encode/Component.module.css | grep -c -- "--color-"` 実測）で、完全一致ではない。差分の存在は T-2 で実装時に対応マッピング適用時に判定する
- Playwright で移行前のスクリーンショットを取得する
  - デスクトップ w1200 / w1900、モバイル w375、**ライト / ダーク両モード**の計 6 枚
  - **加えて「日本語 30 文字程度の encode 結果（120 文字超に膨張）」のスクリーンショットも撮る**（後続 T-4 の長文字列 visual fit 検証の比較対象。url-encode と異なり base64 は UTF-8 経由なので、平仮名/カタカナ/常用漢字 30 文字 = 90 バイト → base64 で `ceil(90/3)×4` = 120 文字、絵文字や CJK 拡張漢字含みの場合は最大 30 文字 = 120 バイト → base64 160 文字に膨張する）
- 既存テストの実行確認（`npm run test -- base64` で `logic.test.ts` 8 件が緑）
- cycle-201/202 R1 で出た **AP-WF05 指摘（移行前ダークモード未撮影）** の反省を踏まえ、ライト / ダーク両モードを必ず移行前に撮影する

**完成条件**: 移行前のスクリーンショットが計 6 枚（w1200 light/dark、w1900 light/dark、w375 light/dark）+ 長文字列 encode 結果 1 枚以上が `tmp/` 配下に保存されている。既存テスト 8 件が緑。

#### T-2: 詳細ページの (new) 配下移行

cycle-200/201/202 で確立した標準パターンを踏襲する:

- `src/app/(legacy)/tools/base64/` を `src/app/(new)/tools/base64/` に **git mv** で移動する（page.tsx / opengraph-image.tsx / twitter-image.tsx）
- `src/app/(new)/tools/base64/page.module.css` を新設し、1200px max-width をハードコードする（char-count / byte-counter / url-encode と同一パターン）
- page.tsx に `page.module.css` の `.page` ラッパーを追加する
- `src/tools/base64/Component.module.css` 内の `--color-*` 系旧カラートークン（21 箇所）を新デザイントークンに置換する。**対応マッピングの SSoT は cycle-202 で url-encode に対して実施した実装**（`src/tools/url-encode/Component.module.css` の git 履歴で確認可能。url-encode は移行前 24 箇所だったため base64 21 箇所と完全一致ではないが、共通の token 群が大半を占めると想定される）。base64 固有のトークンや url-encode に存在しなかったトークンがあれば、cycle-201/202 の実装そのものを SSoT として参照し、`docs/design-migration-plan.md` のトークン定義箇所と突き合わせて実体確認のうえ判定する
- w1900 で本文幅が 1200px に収まっていることを確認する
- Playwright で移行後スクリーンショットを取得し、移行前と比較する（w1200 / w1900 / w375 × ライト / ダーク）

**注意事項**:

- ToolLayout 自体は touch しない（共通コンポーネントは B-431 で一括対応）
- 共通コンポーネント（ToolLayout / Breadcrumb / FaqSection / ShareButtons 等）内の旧トークンは touch しない（B-431 管理）。base64 固有の Component.module.css 内のトークン置換のみが本サイクルの範囲
- `trustLevel` フィールドは削除しない（B-432 で一括削除）
- opengraph-image.tsx / twitter-image.tsx もそのまま移動する（内容は変更しない）

**完成条件**: `/tools/base64` が (new) 配下で正常表示される。旧 (legacy) パスにファイルが残っていない。w1200 / w1900 / w375 で表示崩れがない。Component.module.css 内に `--color-*` 系旧トークンが残存しないこと。**判定コマンド**: `grep -c -- "--color-" src/tools/base64/Component.module.css` の結果が `0` であること。

#### T-3: タイル定義（kind 判定 + タイル用コンポーネント実装）

- **kind 判定**: base64 の詳細ページ Component は textarea×2 + button×3（encode/decode/変換）+ コピーボタンと縦に長く、128px タイルセル基準では収まらないため **kind=widget** とする。
- タイル用コンポーネント（`src/tools/base64/Base64Tile.tsx`）を新規実装する
  - 詳細ページとは別の簡素な UI（CharCountTile / ByteCounterTile / UrlEncodeTile と同じインラインスタイル方式）
  - logic.ts の `encodeBase64(input)` と `decodeBase64(input)` の **両方** を再利用する
  - **タイル UI の方針**: 「encode / decode の方向トグル + テキスト入力 + 変換結果表示 + 詳細ページへのリンク」の双方向構成。url-encode と同じ理由で、base64 も本質的に双方向操作のツール。来訪者が「encode したい」「decode したい」のどちらの目的でタイルに辿り着いてもタイル単体で目的を達成できるようにする。トグル UI は「encode／decode」の 2 択セグメント、初期値は `encode`
  - **変換トリガ**: リアルタイム反映（入力 onChange でその場で結果が更新される）。CharCountTile / ByteCounterTile / UrlEncodeTile と一貫した「素早く確認する」体験
  - **【AP-P21 事後検証の核】結果膨張型の役割分担**: textarea を `rows=2 + flexShrink: 0`、結果欄を `flex: 1 + overflowY: auto` の役割分担を**最初から**適用する。cycle-202 で url-encode に対して T-4 R1 で構造欠陥（textarea が 12px に圧迫）が発覚してから後手で修正したパターンを、base64 では計画段階で先取りする
  - 結果欄には `role="status" aria-live="polite"` を付与する（url-encode タイル UrlEncodeTile.tsx L143-144 と同型。リアルタイム反映で結果が更新されるたびスクリーンリーダー利用者にも伝わるよう配慮し、`assertive` ではなく `polite` で過剰な割り込みを避ける）
  - decode で不正な base64 が入力された場合は logic.ts の `decodeBase64` が返す `{ success: false, output: "", error }` を尊重し、結果欄に**固定の日本語文言**「不正な Base64 文字列です」を `--fg-soft` 色で控えめに表示する（url-encode タイルが「不正な URL エンコードです」を表示する運用と同型。`result.error` の英語ブラウザ例外メッセージ（`atob` の `"The string to be decoded is not correctly encoded."` や `TextDecoder fatal: true` の UTF-8 不正メッセージ等）を visitor に直接見せない）。リアルタイム反映の都合で入力途中で瞬間的にエラー判定が出るため `accent` 系の派手な色は避ける。空入力時はエラーを出さず結果欄も空にする。**decode の失敗ケースは 2 系統あること**（(a) base64 文法不正 = `atob` 失敗 / (b) base64 として有効だが UTF-8 として復元不能 = `TextDecoder fatal: true` 失敗。例: `/w==` は有効な base64 だが 0xff 単独で UTF-8 不正）を実装者が認識する必要がある（テスト要件は T-3 末尾参照）
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に base64 のエントリを追加する（recommendedSize: `cols=3 rows=2`）。`inputPlaceholder` / `outputPlaceholder` / `widgetSummary` 等の必須フィールドは既存エントリ（char-count / byte-counter / url-encode）と同じ枠を埋める形で実装者が決める（base64 固有の文言は encode/decode 両方向の意図が visitor に伝わる表現で）
- `npm run generate:tiles-registry` で codegen を実行する
- タイル用コンポーネントのテストを追加する（**必須カバー項目**: (1) encode 基本: ASCII 入力 / (2) encode 日本語: UTF-8 マルチバイト（平仮名・漢字） / (3) encode エッジ: 空入力（エラー非表示・結果欄空） / (4) decode 基本: 正常な base64 入力 / (5) トグル切替: encode → decode の方向切替で結果が再計算 / (6) **decode 失敗 (a) 文法不正 = `atob` 失敗**（例: `=` を不適切な位置に置く、不正文字 `!@#` を含む等）→ 「不正な Base64 文字列です」表示 / (7) **decode 失敗 (b) base64 有効だが UTF-8 として復元不能 = `TextDecoder fatal: true` 失敗**（例: `/w==` で 0xff 単独）→ 同じく日本語固定文言表示。**任意カバー項目**: 絵文字（4 バイト UTF-8）encode 動作 / 詳細ページリンクの遷移確認。計 7〜9 件程度）

**注意事項**:

- タイル内の 8px padding/gap は `TILE_GAP_PX`（タイル間マージン）とは別概念
- CSS Module は使用しない（codegen が解釈できないため、インラインスタイル方式）
- デザイントークンは `--fg` / `--bg` / `--accent` / `--fg-soft` / `--border` 等の新トークンを使用する
- 変換結果が長い文字列（日本語 30 文字 encode で 120 文字超など）になる可能性があるため、結果表示エリアは `overflow: auto` または `word-break: break-all` で枠内に収める。**T-1 baseline で取得した「encode 結果が長く展開される入力例」のスクリーンショットと突き合わせて視覚 fit を確認する**
- `encodeBase64` / `decodeBase64` は UTF-8 経由（btoa/atob を直接呼ぶと日本語で例外発生）の実装が logic.ts 側で行われているはずだが、念のためタイル側でも `success: false` の error メッセージを尊重する分岐を入れる

**完成条件**: `TILE_DECLARATIONS` に base64 が追加されている。codegen が成功する。`Base64Tile.tsx` のテストが緑。タイル UI 上で encode / decode のトグル切替が機能し、両方向で結果が反映されること。

#### T-4: 検証と統合確認

- `/internal/tiles/preview/tools/base64` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク 4 枚撮影）
- 移行後のスクリーンショット比較（デスクトップ w1200 / w1900、モバイル w375、ライト / ダーク両モード）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/base64` でアクセス可能、404 や redirect が発生していない）
- タイルプレビュー上の動作確認を Playwright で実施
  - encode トグル選択時: テキスト入力 → 結果欄に base64 結果が反映される
  - decode トグル選択時: base64 系列の入力 → 結果欄に decode 結果が反映される
  - **【AP-P21 事後検証】長文字列 encode 結果でも入力欄（textarea）が圧迫されないことを Playwright `getBoundingClientRect()` で計測**: 短い encode（数文字入力）/ 長文字列 encode（日本語 30 文字 = base64 120 文字超）/ 絵文字含み（30 文字 = base64 160 文字相当）/ decode（長 base64 入力）の 4 ケースで、textarea の高さが**判定基準**を満たすことを確認する。**判定基準**: (a) **下限 40px 以上**（cycle-202 で発覚した「12px に圧迫」のような桁違い破綻を確実に検出）、かつ (b) **4 ケース間の textarea 高さの相互差が 2px 以内**（最大値 − 最小値 ≤ 2px）。**2px の根拠**: `rows=2 + flexShrink: 0 + box-sizing: border-box` の設計意図では理論上 textarea 高さは完全固定（理想値 0px 差）になるべき。ブラウザのサブピクセル丸めで最大 1px、フォーカスリングや状態遷移時の微小揺れまでを吸収する余地として +1px、計 2px までを許容とする。これより緩い 4px 許容では「flexShrink: 0 が外れて結果欄の膨張が textarea の縮小として現れる微小な回帰」を見逃すバッファになり得るため絞り込む。下限 40px が確保されれば AP-P21 事後検証の主目的（cycle-202 の 12px 破綻型の再発検出）は達成。相互差 ≤ 2px は「役割分担が flexShrink: 0 で意図通り効いていること」の精密な客観確認。url-encode cycle-202 T-4 R1 MAJOR-1 の再発防止
  - 不正な base64 decode 時に固定日本語文言「不正な Base64 文字列です」が `--fg-soft` 色で控えめに表示される（英語ブラウザ例外メッセージが直接表示されていないこと）
  - 結果欄に `role="status" aria-live="polite"` 属性が付与されている（DOM 構造の Playwright 確認、または React 側のスナップショット確認のいずれかで判定）

**完成条件**: 全検証項目をクリア。lint / format / test / build が全パス。タイルプレビューで encode / decode の両方向が動作し、長文字列 encode 結果でも textarea 圧迫が起きず visual 崩れがないこと。

### 検討した他の選択肢と判断理由

#### 着手対象ツールの選定: base64 を選んだ理由

| 候補                  | 採否     | 判断理由                                                                                                                                                                                                                                                                              |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| base64                | **採用** | url-encode と Component 構造が最も類似（モード切替×2 + textarea×2 + 変換ボタン）。旧トークン 21 箇所も url-encode と同じ。結果膨張型かつ膨張倍率が url-encode より大きく、cycle-202 で新規追加された **AP-P21 の最初の事後検証として最適**。確信度 A。                                |
| html-entity           | 不採用   | base64 と Component 構造が酷似（モード切替×2 + textarea×2 + 変換ボタン）。ただし結果膨張性が「入力依存」（HTML 特殊文字を含むかで膨張の有無が変わる）なため、AP-P21 検証としては base64 のほうが「必ず膨張する」明確な被検証ケースになる。第 5 弾以降で base64 と並行案または単独で。 |
| hash-generator        | 不採用   | `crypto.subtle` の非同期性が char-count / byte-counter / url-encode の同期パターンと異なる。標準パターン外の新設計が必要。第 4 弾は「AP-P21 事後検証 + 標準パターン 4 回目適用」の二重目的を優先し、非同期パターン開拓は別サイクルに分離する（リスク管理）。                          |
| fullwidth-converter   | 不採用   | 旧トークン数最少（17）でコスト最低だが、結果膨張なし → AP-P21 事後検証価値が低い。第 4 弾は AP-P21 検証を優先するため見送り。                                                                                                                                                         |
| kana-converter        | 不採用   | 旧トークン数 15 で最少、ロジック単純だが、結果膨張なし → AP-P21 事後検証価値が低い。また 2 パネル横並びレイアウトをタイル版で縦一列に変える設計工夫が必要で標準パターンから微妙に離れる。                                                                                             |
| number-base-converter | 不採用   | useMemo リアルタイム変換 + 2×2 grid resultCards 構造で kind=widget のタイル UI 設計に追加工数が発生（widget で grid をどう簡素化するか）。AP-P21 検証価値も低い（input 1 行 + カード結果で textarea 圧迫の文脈外）。                                                                  |
| age-calculator        | 不採用   | 旧トークン数最多（26）、外部ライブラリ依存、date picker UX 課題あり。B-382（自然言語日付）との関連で計画的着手が望ましい。AP-P21 検証価値も低い（結果は短文字列の key-value）。                                                                                                       |
| line-break-remover    | 不採用   | 旧トークン 24、多モード分岐、テスト充実だが結果は縮小型で AP-P21 検証価値なし。直近 30 日 PV=3 で他候補よりわずかに来訪者の動きはあるが、統計的有意差ではない（サイト全体 692 PV）。優先度低。                                                                                        |

GA4 PV は候補 8 件中 7 件が直近 30 日 PV=0、line-break-remover のみ PV=3（サイト全体 692）のため、PV ベースでは差別化不能。判断軸は「構造類似性 + AP-P21 事後検証価値 + 移行コスト」に絞った。

#### 同サイクルで複数ツール並行案

| 選択肢                           | 判断                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 単独（base64 のみ）              | **採用**: cycle-200/201/202 で各 1 件ずつ完了している実績に合わせ、第 4 弾も 1 件で標準パターンの再現性 + AP-P21 事後検証の二重目的に集中する。AP-P21 は本サイクルが**最初の事後検証**であり、構造欠陥再発時の原因切り分けを単純化したい（複数ツール並行だとどちらが原因か判定が難しくなる）。CLAUDE.md「Keep task smaller」原則にも合致。 |
| 複数並行（base64 + html-entity） | 不採用: 両者は構造類似で工数効率は良いが、AP-P21 事後検証の純度が落ちる（html-entity は膨張が入力依存で、base64 の「必ず膨張」とは性質が異なる）。第 5 弾以降で「base64 で AP-P21 事後検証 OK」となった後の並行候補とする。                                                                                                                |

#### kind の判定: widget vs single vs multi

| 選択肢      | 判断                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| kind=single | 不採用: textarea×2 + ボタン×3 + 結果 textarea の構成は 128px タイルセル基準では収まらない（縦長すぎる）。                                                           |
| kind=widget | **採用**: 詳細ページ Component を touch せず、別途タイル専用の簡素 UI を実装する。char-count / byte-counter / url-encode と同方式。                                 |
| kind=multi  | 不採用: encode / decode は同一タイル内のトグルで両立できるため、registry 上の複数定義に分ける必要なし。url-encode で確立した「双方向トグル + 1 タイル完結」と一貫。 |

#### タイル UI の設計: encode 単方向 vs 双方向切替 vs 同時表示

来訪者ニーズの仮説: base64 の本質は「文字列を base64 encode / decode する」両方向操作。来訪者の目的は「画像を base64 化したテキストデータを作りたい」(encode) または「API レスポンスの base64 部分を読みたい」(decode) のどちらでも自然。

| 選択肢                            | 判断                                                                                                                                                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 入力 + encode 結果のみ      | 不採用: char-count / byte-counter と同じ最小構成だが、decode 目的でタイルに辿り着いた visitor が「タイル単体では目的を達成できず詳細ページに飛ばされる」状況が発生する。base64 は本質的に双方向であり、片方向に削るのは visitor の半分を切り捨てる判断になる（url-encode と同じ理由）。 |
| 案 b: encode／decode トグル       | **採用**: タイル UI に「encode／decode」の 2 択トグル（初期値 encode）を 1 つだけ追加し、選択した方向の logic を呼び出す。url-encode タイルと完全同型の構造で体験の一貫性も担保。                                                                                                       |
| 案 c: 同時表示（encode + decode） | 不採用: タイル内に 2 つの結果欄を並べると cols=3 rows=2（400×264px）では情報密度が過密になり、入力 textarea が極端に狭くなる（AP-P21 の構造リスクを増幅）。                                                                                                                             |

#### タイル UI の変換トリガ: リアルタイム反映 vs ボタン押下式

cycle-202 url-encode と同じ判断で、**リアルタイム反映（onChange 即時更新）を採用**。タイルは「道具箱で素早く 1 機能を試す」場であり、最小操作で結果を見せることが visitor 価値の中核。decode の不正入力時に「入力途中で瞬間的にエラー判定が出る」副作用については、エラー表示色を `--fg-soft` 等の控えめなトーンに統一して視覚的チカチカを抑える。空入力時はエラーを出さず結果欄も空にする運用。

#### タイルの推奨サイズ

| 選択肢        | 判断                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cols=2 rows=2 | 不採用: 方向トグル + テキスト入力欄 + 結果欄を含めるには狭すぎる（`calcTilePixels(2, 2)` = 264×264px）。                                                                                                                                                                                                                                                                                            |
| cols=3 rows=2 | **採用**: char-count / byte-counter / url-encode と同じサイズ（`calcTilePixels(3, 2)` = 400×264px）。base64 は出力が url-encode 以上に膨張する（日本語 30 文字 → 120 文字超）特性があるが、AP-P21 対応の「textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto」で枠内に収める。視覚 fit は T-1 baseline と T-4 実機検証で確認。Phase 10.x ダッシュボード設計時のサイズ一貫性も担保。 |
| cols=4 rows=2 | 不採用: 表示内容に対して過大。長文字列 encode 結果の visual fit を `cols=3 rows=2` で AP-P21 対応により吸収できるため、サイズ拡大は不要。                                                                                                                                                                                                                                                           |

#### AP-P21 を本サイクルで事後検証する意義

cycle-202 で新規追加された AP-P21（「固定枠 UI で flex container を使うとき、結果欄が膨張する性質の場合に入力欄が圧迫される構造リスクを計画段階で検討したか」）は、url-encode で T-4 R1 MAJOR-1 として発覚してから後手で対処したパターン。AP として登録されたが、**事後検証として「次に結果膨張型ツールを移行するとき、計画段階で AP-P21 をチェックし、最初から役割分担パターンを適用できたか」が試される位置付け**。

本サイクルで base64 を選んだ最大の理由は、url-encode と最も構造類似かつ膨張倍率がより大きいことで、AP-P21 の事後検証として最適なケースであるため。T-3 の計画で「textarea rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto」を最初から適用し、T-4 で Playwright 計測により textarea 圧迫が起きないことを確認することで、AP-P21 の運用が機能していることを実証する。

### 計画にあたって参考にした情報

- cycle-200（char-count）/ cycle-201（byte-counter）/ cycle-202（url-encode）の移行実装（標準パターンの実体）
  - `src/app/(new)/tools/url-encode/page.tsx` / `page.module.css` — page.module.css ラッパーパターンと 1200px ハードコード
  - `src/tools/url-encode/UrlEncodeTile.tsx` — kind=widget タイルコンポーネントの双方向トグル + リアルタイム反映 + AP-P21 対応の役割分担実装
  - `src/tools/_constants/tile-declarations.ts` — `TILE_DECLARATIONS` エントリ形式
- base64 の現在のソースコード
  - `src/app/(legacy)/tools/base64/page.tsx`
  - `src/tools/base64/Component.tsx` + `Component.module.css` + `logic.ts` + `meta.ts` + `__tests__/logic.test.ts`
- 構造調査レポート: `tmp/research/` 配下（cycle-203 用の 8 候補比較表 + Top 3 推薦）
- GA4 PV 調査レポート: `tmp/research/2026-05-22-cycle-203-tool-pv-research.md`（候補 8 件中 7 件が直近 30 日 PV=0、line-break-remover のみ PV=3、サイト全体 692）
- `docs/design-migration-plan.md` — 移行アーキテクチャと Phase 定義
- `docs/anti-patterns/planning.md` — **AP-P21（cycle-202 新規）**, AP-P16（前提条件の実体確認）, AP-P20（過度に具体的な計画の回避）
- `docs/cycles/cycle-202.md` の「補足事項」§計画段階の見落とし反省 — AP-P21 が生まれた経緯

## レビュー結果

### 計画レビュー

**R1**: 必須 1 件 / 推奨 4 件

- MAJOR-1（必須）T-3 decode エラー表示文言が曖昧（`{ success: false, error }` の `error` 直接表示か固定日本語文言か不明確）→ url-encode 同型の「固定日本語文言『不正な Base64 文字列です』を `--fg-soft` で控えめに表示」に明示。英語ブラウザ例外メッセージは visitor に出さない方針を確定。修正済
- MINOR-1（推奨）decode 失敗 2 系統（atob 失敗 / TextDecoder fatal 失敗）の明示 → T-3 注意事項とテスト要件に 2 系統明記。修正済
- MINOR-2（推奨）「日本語 30 文字 = base64 120 文字」の幅 → 「120 文字超 / 絵文字含みで 160 文字」と幅を持たせ T-4 検証ケースに絵文字含みを追加。修正済
- MINOR-3（推奨）textarea 高さ閾値「46px 前後」の客観判定可能性 → 「下限 40px + 相対許容」形式に変更。修正済
- MINOR-4（任意）既存テスト件数の grep 実測根拠 → T-1 に grep コマンド併記。修正済

**R2**: 必須 1 件 / 推奨 3 件

- MAJOR-1（必須）url-encode の `--color-*` 数を「同数 21」と書いた事実誤認（実体: url-encode 24 / base64 21）。AP-P16 / AP-WF12 該当 → 正確な数値に修正し grep 実測コマンド併記。修正済
- MINOR-1（推奨）`DESIGN.md` 参照（存在しないファイルへの誤参照）→ `docs/design-migration-plan.md` のトークン定義箇所 + cycle-201/202 実装そのものを SSoT として参照、に書き換え。修正済
- MINOR-2（推奨）textarea 高さ判定 (b) ±4px が自己参照的（実装値自身が baseline）→ 「4 ケース間の textarea 高さの相互差 < 4px」に変更。修正済（R3 で更に 2px に絞り込み）
- MINOR-3（推奨）encode 側エッジケース（空・ASCII・絵文字）未明示 → T-3 テスト要件を必須カバー (1)-(7) + 任意カバー項目に分離。修正済

**R3**: 必須 0 件 / 推奨 3 件 → **Pass 判定**

- MINOR-1（推奨）textarea 高さ相互差 4px 許容が flexShrink: 0 の設計意図に対して過大（理論上 0 〜 1px、フォーカスリング差を吸収しても 2px）→ 2px 以内に絞り込み、根拠を計画書に明記。修正済
- MINOR-2（推奨）TILE_DECLARATIONS 追加時の `inputPlaceholder` / `outputPlaceholder` / `widgetSummary` 等必須フィールドへの言及がない → 既存エントリ参考で実装者裁量で決める旨を一行追記。修正済
- MINOR-3（推奨）結果欄 `role="status" aria-live="polite"` の a11y 観点が暗黙（参考実装 UrlEncodeTile.tsx L143-144 同型）→ T-3 注意事項と T-4 検証項目に明示。修正済

R3 推奨 3 件はレビュアーが「計画の根幹を変えるものではなく、実装段階で吸収可能」と評したものだが、builder への手がかりを残すため追加反映した。AP-P20（過度に具体的な計画）に抵触しない範囲で意図を伝達。

### 実装レビュー

**T-1 R1**: 指摘なしで **Pass**。スクリーンショット 7 枚（w1200/w1900/w375 × light/dark + 長文字列 encode 結果）/ 既存テスト 8 件緑 / `--color-*` 21 箇所の grep 実測 / 構造メモ。AP-WF05 対策（ライト/ダーク両撮影）も貫徹。reviewer 側で grep / test を独立再現で確認。

**T-2 R1**: 指摘なしで **Pass**。git mv 3 ファイル / page.module.css 新設（url-encode と完全一致）/ page.tsx に `.page` ラッパー追加（url-encode 同型）/ Component.module.css 21 → 0。reviewer が url-encode SSoT との並べ読みで 8 種マッピング全完全同名一致を確認（`--border` / `--bg` / `--fg` / `--accent` / `--fg-soft` / `--accent-strong` / `--danger` / `--danger-soft`）。共通コンポーネント未 touch、trustLevel 維持、og/twitter 内容無変更。

**T-3 R1**: MAJOR 1 件

- MAJOR-1（必須）`format:check` が実際には FAIL（builder の「全 PASS」報告が虚偽。`Base64Tile.test.tsx` L97-107 / L120-123 の prettier 違反）→ builder に `npx prettier --write` 実行 + 各コマンド出力引用付き報告を依頼 → R2 Pass

reviewer から **新規 AP-WF16 起票候補**（「自動チェック結果の builder 自己申告 vs reviewer 独立再現」）を申し送り → 補足事項に記録、cycle-completion で起票判断。

**T-3 R2**: 指摘なしで **Pass**。format:check 解消、reviewer 独立再現でも全コマンド出力一致。Base64Tile 9 件テスト全件 PASS、url-encode との並べ読みで構造同型を確認。

**T-4 R1**: 必須 0 件 / 推奨 2 件 → **Pass**

- MINOR-1（推奨）`tmp/cycle-203/after-t2/` と `tmp/cycle-203/after-t4/` の 6 枚スクリーンショットが MD5 完全一致（T-4 で再撮影せず T-2 のものを使った可能性）。詳細ページは T-2 から T-4 で実体変化がないため結果に誤りはないが、次サイクル以降は再撮影 or T-2 参照に統一する運用改善を申し送り（補足事項に記録）
- MINOR-2（推奨）モバイル w375 タイルプレビューで「詳細ページで開く」が右端切れ → backlog B-434（タイル UI スマホ viewport 対応）で覆われている既知事項、本サイクル責務外

**AP-P21 事後検証の定量結果**（cycle-203 中核成果）:

| ケース                                     | textarea 高さ実測 | reviewer 独立再現 |
| ------------------------------------------ | ----------------- | ----------------- |
| (1) "hi" encode                            | 46px              | 46px              |
| (2) 平仮名 30 文字 encode（結果 120 文字） | 46px              | 46px              |
| (3) 絵文字 15 個 encode（結果 80 文字）    | 46px              | 46px              |
| (4) 長 base64 decode（124 文字入力）       | 46px              | 46px              |

下限 40px 以上クリア、相互差 0px（理論値どおり）で **AP-P21 の両判定基準を完全クリア**。cycle-202 で url-encode に対して T-4 R1 で発覚した「textarea 12px 圧迫」型の構造欠陥は、base64 では計画段階で「rows=2 + flexShrink: 0 / 結果欄 flex: 1 + overflowY: auto」を**先取り適用**することで完全に防止された。AP-P21 の運用（事後検証質問形で計画段階に組み込む）が機能していることを定量的に実証。

## キャリーオーバー

- なし（すべてのタスクが完了）
- 次サイクル以降の方針メモ: Phase 8.1 第 5 弾は標準パターン 5 回目の適用となる。第 1〜4 弾（char-count / byte-counter / url-encode / base64）の実績から「標準パターンの再現性は十分に確立」「結果膨張型ツールの AP-P21 対応も先取り適用が機能することを実証」と判定できる。第 5 弾以降の候補は (a) html-entity（base64 と構造類似で AP-P21 事後検証の 2 件目に最適）、(b) hash-generator（非同期パターン `crypto.subtle` への初挑戦）、(c) fullwidth-converter / kana-converter（結果膨張なし系の標準パターン適用）、(d) 構造類似ペアでの並行（base64 + html-entity 同時など）、のいずれかを次サイクル planning で判断。
- **AP-P21 事後検証の汎用性に関する留意点**: 本サイクルで AP-P21 が機能することを定量実証したのは **base64（url-encode と構造類似の結果膨張型）の 1 事例のみ**。構造が大きく異なるツール（hash-generator の `crypto.subtle` 非同期パターン、age-calculator の date picker、number-base-converter の 2×2 grid 結果カード、line-break-remover の縮小型など）への AP-P21 汎用性はまだ未検証。次サイクル以降で「結果膨張型かつ url-encode と類似構造でない」事例（例: 非同期型での結果欄膨張）が出てきた場合は AP-P21 のチェック観点が現状の役割分担パターンで吸収できるかを別途確認する必要がある。
- **AP-WF16 運用形の確立と T-1 / T-2 への波及**: 本サイクル T-4 で reviewer が自動チェック独立再実行 + Playwright 計測再現を実施し、AP-WF16 の運用形が初めて確立。一方、T-1 / T-2 / T-3 R1 までの reviewer は `grep` / `test` の独立再現は実施したものの `npm run lint` / `npm run format:check` / `npm run build` の独立再実行までは行っていなかった（だからこそ T-3 R1 で format:check 虚偽 PASS が「Base64Tile.test.tsx を Read で目視しているうちに偶発的に発覚」する形になった）。次サイクル以降は **T-1 段階の reviewer も builder が報告した自動チェックのうち少なくとも 1 つ以上を独立再実行する** 運用を組み込む。

## 補足事項

### 本サイクルで生まれた新規アンチパターン: AP-WF16

T-3 R1 で builder が「lint / format:check / test / build すべて PASS」と報告した内容のうち、`format:check` が実際には FAIL していたことを reviewer の独立再実行で発見。修正自体は `npx prettier --write` で機械的に解消できたが、「builder の自動チェック自己申告のみを根拠に reviewer / PM が PASS 判定する」構造が脆弱であることが明らかになった。

cycle-202 までは表面化していなかった失敗パターン。直接の被害は限定的（T-3 R2 で解消、サイクル進行に致命傷なし）だが、次回以降の同型事故を防ぐため `docs/anti-patterns/workflow.md` に **AP-WF16** として新規追加した。事後検証質問形（AP-WF15 原則）で記述。

> AP-WF16: builder が報告した自動チェック（`npm run lint` / `npm run format:check` / `npm run test` / `npm run build` 等）の PASS 結果を、reviewer / PM は当該コマンドを独立に再実行して出力を確認したか？ サブエージェントの自己申告のみを根拠に PASS 判定していないか？

T-4 では reviewer が自動チェックも Playwright 計測も**独立に再現確認**しており、AP-WF16 の運用形が早速確立できた。

### T-4 MINOR-1: スクリーンショット運用の改善余地

T-4 reviewer 推奨指摘 MINOR-1 で、`tmp/cycle-203/after-t2/` と `tmp/cycle-203/after-t4/` の 6 枚スクリーンショットが MD5 完全一致していたことが判明。T-4 で再撮影せず T-2 のものをファイル名だけ変えて流用した形。

詳細ページは T-2 から T-4 で実体変化がないため**結果としては誤りなし**（再撮影しても同じ画像が得られる）。来訪者影響もゼロ。次サイクル以降の運用改善として、(a) T-4 で再撮影する、または (b) T-2 のものを参照する形にしてファイル名を欺かない、のいずれかで一貫性を保つ方向で次回 planning に申し送る。本サイクル内では新規 AP 起票には至らず（影響が局所的・補完しやすいため）、運用メモとして本補足事項に記録。

### Phase 8.1 進捗

- 完了済み: char-count (cycle-200) / byte-counter (cycle-201) / url-encode (cycle-202) / **base64 (cycle-203)** = 計 4 ツール
- 残り: 約 30 ツール（age-calculator / bmi-calculator / business-email / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / yaml-formatter）+ 20 遊び
- 標準パターン（kind=widget / page.module.css 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）の再現性は 4 回目で安定。url-encode で発覚した「結果膨張型の textarea/結果欄役割分担」（AP-P21 対応）の先取り適用は base64 で初の事後検証 OK

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。（B-314 は親タスク継続のため Active 残置が正常）
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。（T-4 で reviewer 独立再現済み: lint OK / format:check OK / test 4400/4400 / build 3895 ページ）
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
