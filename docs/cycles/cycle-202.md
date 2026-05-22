---
id: 202
description: B-314 Phase 8.1 第 3 弾——cycle-200/201 で確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を踏襲して、次のツール詳細ページの新デザイン移行 + タイル化を実施する。
started_at: 2026-05-22T07:21:04+0900
completed_at: null
---

# サイクル-202

B-314 Phase 8.1 の第 3 弾。cycle-200（char-count）と cycle-201（byte-counter）で確立した標準パターンに沿って、次のツール詳細ページの新デザイン移行 + タイル化を実施する。

着手対象のツール選定は cycle-planning で行う。前サイクル(201) のキャリーオーバー方針として「次サイクルは hash-generator / base64 等の小規模ツールから着手予定」が示されているが、GA4 PV / 構造単純度 / Phase 9 依存などを踏まえて最終判断する。

残ツール数の現状: `src/app/(legacy)/tools/` 配下に約 32 ディレクトリ（age-calculator / base64 / bmi-calculator / business-email / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / url-encode / yaml-formatter）。

## 実施する作業

- [x] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [x] 着手対象ツールの選定（GA4 PV・構造単純度・Phase 9 依存を踏まえて判断）→ url-encode
  - [x] kind 判定 (single / widget / multi) とタイル推奨サイズの確定 → kind=widget / cols=3 rows=2
  - [x] 計画レビュー → 指摘解消（R1 5件 / R2 5件 → R3 Pass）
- [ ] cycle-execution で計画に沿った実装を行う
  - [x] T-1: 現状把握と移行前 baseline 取得（既存テスト 6 件 Pass / スクリーンショット 8 枚取得 / R1 MINOR-1 → R2 Pass）
  - [x] T-2: 詳細ページの (new) 配下移行（git mv + page.module.css 新設 + 旧トークン置換 + ビルド確認）
  - [x] T-3: タイル定義（UrlEncodeTile.tsx 新規 + TILE_DECLARATIONS 追加 + codegen + テスト 8 件）
  - [x] T-4: 検証と統合確認（Playwright 実機検証 + lint/format/test/build 全 Pass / R1 MAJOR-1 + MINOR-1/3 → R2 Pass）
- [ ] cycle-completion でサイクルを完了させる

## 作業計画

### 目的

**誰のために**: M1a（特定の作業に使えるツールをさっと探している人）/ M1b（気に入った道具を繰り返し使っている人）。URL 文字列のパーセントエンコード／デコードを行いたい来訪者。

**何の価値**:

- デザインの統一感向上（新デザインシステムへの移行）。`/tools/url-encode` の見た目を他の (new) 配下ツール（char-count / byte-counter）と揃え、サイト内回遊で違和感が出ないようにする。
- 将来のダッシュボード機能（道具箱タイル表示）への準備。url-encode をタイル化して `TILE_DECLARATIONS` に登録することで、ダッシュボード本実装フェーズ (Phase 10.x) でこのツールがタイル候補として表示可能になる。
- リピーター（M1b）の混乱を避けるため、URL（`/tools/url-encode`）と挙動（encode / decode の機能）は一切変えない。

**背景**: B-314 Phase 8.1 の第 3 弾。cycle-200（char-count）と cycle-201（byte-counter）で確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を 3 回目として適用する。標準パターンの再現性と安定性を引き続き確認する位置付け。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- url-encode の現在のファイル構成・コード・CSS を確認する
  - `src/tools/url-encode/`: Component.tsx / Component.module.css / logic.ts / meta.ts / `__tests__/logic.test.ts`（既存テスト 6 件）
  - `src/app/(legacy)/tools/url-encode/`: page.tsx / opengraph-image.tsx / twitter-image.tsx
- Playwright で移行前のスクリーンショットを取得する（デスクトップ w1200 / w1900、モバイル w375、ライト / ダーク両モードの計 6 枚）。「encode 結果が長く展開される入力例」（日本語 30 文字程度を含む文字列が `%E3%82...` で 3 倍前後に膨張するパターン）も含めて撮影し、後続 T-4 の visual fit 検証の比較対象にする
- 既存テストの実行確認（`npm run test -- url-encode` 等で `logic.test.ts` が通ること）
- cycle-201 R1 で AP-WF05 指摘（移行前ダークモード未撮影）が出た反省を踏まえ、**ライト / ダーク両モードを必ず移行前に撮影しておく**

**完成条件**: 移行前のスクリーンショットが計 6 枚（w1200 light/dark、w1900 light/dark、w375 light/dark）`tmp/` 配下に保存されている。既存テスト 6 件が緑。

#### T-2: 詳細ページの (new) 配下移行

cycle-200/201 で確立した標準パターンを踏襲する:

- `src/app/(legacy)/tools/url-encode/` を `src/app/(new)/tools/url-encode/` に **git mv** で移動する（page.tsx / opengraph-image.tsx / twitter-image.tsx）
- `src/app/(new)/tools/url-encode/page.module.css` を新設し、1200px max-width をハードコードする（char-count / byte-counter と同一パターン）
- page.tsx に `page.module.css` の `.page` ラッパーを追加する
- `src/tools/url-encode/Component.module.css` 内の `--color-*` 系旧カラートークン（24 箇所）を新デザイントークンに置換する。**対応マッピングの SSoT は cycle-201 で byte-counter に対して実施した実装**（`src/tools/byte-counter/Component.module.css` の git 履歴で確認可能）。url-encode 固有のトークンがあれば DESIGN.md の新トークン規約に沿って実体確認のうえ判定する
- w1900 で本文幅が 1200px に収まっていることを確認する
- Playwright で移行後スクリーンショットを取得し、移行前と比較する（w1200 / w1900 / w375 × ライト / ダーク）

**注意事項**:

- ToolLayout 自体は touch しない（共通コンポーネントは B-431 で一括対応）
- 共通コンポーネント（ToolLayout / Breadcrumb / FaqSection / ShareButtons 等）内の旧トークンは touch しない（B-431 で管理）。url-encode 固有の Component.module.css 内のトークン置換のみが本サイクルの範囲
- `trustLevel` フィールドは削除しない（B-432 で一括削除）
- opengraph-image.tsx / twitter-image.tsx もそのまま移動する（内容は変更しない）

**完成条件**: `/tools/url-encode` が (new) 配下で正常表示される。旧 (legacy) パスにファイルが残っていない。w1200 / w1900 / w375 で表示崩れがない。Component.module.css 内に `--color-*` 系旧トークンが残存しないこと。**判定コマンド**: `grep -c -- "--color-" src/tools/url-encode/Component.module.css` の結果が `0` であること。

#### T-3: タイル定義（kind 判定 + タイル用コンポーネント実装）

- **kind 判定**: url-encode の詳細ページ Component は textarea×2 + button×4 + 結果表示と縦に長く、タイルセル（128px ベース）に収まらないため **kind=widget** とする。
- タイル用コンポーネント（`src/tools/url-encode/UrlEncodeTile.tsx`）を新規実装する
  - 詳細ページとは別の簡素な UI（CharCountTile / ByteCounterTile と同じインラインスタイル方式）
  - logic.ts の `encodeUrl(input, "component")` と `decodeUrl(input, "component")` の **両方** を再利用する
  - **タイル UI の方針**: 「encode / decode の方向トグル + テキスト入力 + 変換結果表示 + 詳細ページへのリンク」の双方向構成とする。url-encode は本質的に双方向操作のツールであり、来訪者が「encode したい」「decode したい」のどちらの目的でタイルに辿り着いても、タイル単体で目的を達成できるようにする。トグル UI は「encode／decode」の 2 択セグメント（ラジオボタン相当）で、初期値は `encode`。詳細ページ Component も既に encode/decode 方向トグル（`modeSwitch`）を実装済みのため、タイル側も双方向にすることで詳細ページとタイルの体験が一貫する。詳細ページの mode 切替（`component` / `full`）はタイルでは扱わず、`component` 固定とする（理由は後述「検討した他の選択肢」参照）
  - **変換トリガ**: リアルタイム反映（入力 onChange でその場で結果が更新される）を採用する。CharCountTile / ByteCounterTile と一貫した「素早く確認する」体験を提供するため。詳細ページは「変換」ボタン押下式だが、タイル UI は最小操作で結果を見せることを優先する。理由は後述「検討した他の選択肢」参照
- `src/tools/_constants/tile-declarations.ts` の `TILE_DECLARATIONS` 配列末尾に url-encode のエントリを追加する（recommendedSize: `cols=3 rows=2`）
- `npm run generate:tiles-registry` で codegen を実行する
- タイル用コンポーネントのテストを追加する（基本 encode 動作 / 基本 decode 動作 / トグル切替 / 空入力 / 日本語など特殊文字 / 不正な `%XX` decode 入力時のエラー表示、計 6〜8 件程度）

**注意事項**:

- タイル内の 8px padding/gap は `TILE_GAP_PX`（タイル間マージン）とは別概念
- CSS Module は使用しない（codegen が解釈できないため、インラインスタイル方式）
- デザイントークンは `--fg` / `--bg` / `--accent` / `--fg-soft` / `--border` 等の新トークンを使用する
- 変換結果が長い文字列（日本語 30 文字 encode で 90 文字超など）になる可能性があるため、結果表示エリアは `overflow: auto` または `word-break: break-all` で枠内に収める。T-1 baseline で取得した「encode 結果が長く展開される入力例」のスクリーンショットと突き合わせて視覚 fit を確認する
- decode で不正な `%XX` 系列が入力された場合は logic.ts の `decodeUrl` が返す `success: false` を尊重し、結果欄に控えめなエラー表示（`--fg-soft` 色で「不正な URL エンコードです」程度）を出す（CharCountTile / ByteCounterTile にはなかった分岐のため実装で抜けないこと）。リアルタイム反映の都合上、入力途中で `%E`「`%E3`」など未完成の `%XX` 段階でも瞬間的にエラー判定が出るが、`accent` 色の派手なエラー表示にすると入力中の視覚的チカチカが発生するため、デザイントークンは抑え目（`--fg-soft` 等）に統一する。空入力時はエラーを出さず結果欄も空にする

**完成条件**: `TILE_DECLARATIONS` に url-encode が追加されている。codegen が成功する。`UrlEncodeTile.tsx` のテストが緑。タイル UI 上で encode / decode のトグル切替が機能し、両方向で結果が反映されること。

#### T-4: 検証と統合確認

- `/internal/tiles/preview/tools/url-encode` での単独レンダリング検証（Playwright で w1200 / w375 × ライト / ダーク 4 枚撮影）
- 移行後のスクリーンショット比較（デスクトップ w1200 / w1900、モバイル w375、ライト / ダーク両モード）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/url-encode` でアクセス可能、404 や redirect が発生していない）
- タイルプレビュー上の動作確認を Playwright で実施
  - encode トグル選択時: テキスト入力 → 結果欄に encode 結果が反映される
  - decode トグル選択時: `%XX` 系列の入力 → 結果欄に decode 結果が反映される
  - encode 結果が長い文字列（日本語 30 文字程度の入力で結果 90 文字超）でも `cols=3 rows=2` (`calcTilePixels(3, 2)` = 400×264px) のタイル枠内に収まる（はみ出し / レイアウト崩れがない）

**完成条件**: 全検証項目をクリア。lint / format / test / build が全パス。タイルプレビューで encode / decode の両方向が動作し、長文字列 encode 結果でも visual 崩れがないこと。

### 検討した他の選択肢と判断理由

#### 着手対象ツールの選定: url-encode を選んだ理由

| 候補                  | 採否     | 判断理由                                                                                                                                                                                                     |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| url-encode            | **採用** | logic が同期 2 関数（encodeUrl / decodeUrl）で最もシンプル。textarea + ボタン + 結果 textarea の構成が char-count / byte-counter の「入力 + 結果」パターンに近く、標準パターンを素直に適用できる。確信度 B。 |
| html-entity           | 不採用   | url-encode と構造類似（textarea×2 + ボタン×4）で第 4 弾以降で採用予定。今回は 1 件先行して標準パターンの 3 回目適用を優先。                                                                                  |
| number-base-converter | 不採用   | useMemo によるリアルタイム変換 + 2×2 grid resultCards 構造で kind=widget のタイル UI 設計に追加工数が発生（widget で grid をどう簡素化するかの設計判断）。確信度 A だが、今回は標準パターン踏襲を優先。      |
| hash-generator        | 不採用   | `crypto.subtle` の非同期性が char-count / byte-counter の同期パターンと異なる。標準パターン外の実装が必要なため、第 4 弾以降に回す。                                                                         |
| base64                | 不採用   | url-encode と構造非常に類似のため、今回は片方のみ採用。複数並行で工数効率を測るのは第 4 弾以降のサイクルで検討。                                                                                             |
| unix-timestamp        | 不採用   | `--color-*` 旧トークン 36 箇所（候補中 1.6 倍）+ useEffect/setInterval（時刻更新）+ 2 セクション構成の三重難点で他候補と工数が乖離。                                                                         |

GA4 PV は候補 6 件すべて直近 30 日で 0、移行済み char-count = 1 / byte-counter = 6（サイト全体 692）のため、PV ベースでは差別化不能。判断軸は「構造単純度と確立済み標準パターンへの適合性」に絞った。

#### 同サイクルで複数ツール並行案

| 選択肢                          | 判断                                                                                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 単独（url-encode のみ）         | **採用**: cycle-200/201 で各 1 件ずつ完了している実績に合わせ、第 3 弾も 1 件で標準パターンの再現性をさらに確認する。CLAUDE.md「Keep task smaller」の原則にも合致。                                     |
| 複数並行（url-encode + base64） | 不採用: 構造類似ペアで工数効率を測る価値はあるが、まだ標準パターンの定着初期で複雑性を上げるリスクが残る。第 4 弾以降で「3 サイクル目までは順調」の手応えを得てから検討する（次サイクル以降の判断軸）。 |

#### kind の判定: widget vs single vs multi

| 選択肢      | 判断                                                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| kind=single | 不採用: textarea×2 + ボタン×4 + 結果 textarea の構成は 128px タイルセル基準では収まらない（縦長すぎる）。                                                                                                     |
| kind=widget | **採用**: 詳細ページ Component を touch せず、別途タイル専用の簡素 UI を実装する。char-count / byte-counter と同方式。                                                                                        |
| kind=multi  | 不採用: kind=multi は registry 上の複数定義として枝分かれする形態で、url-encode の encode / decode は同一タイル内のトグルで両立できるため不要。1 タイル内で完結する方が「道具箱で素早く片付ける」体験に合う。 |

#### タイル UI の設計: encode 単方向 vs 双方向切替 vs 同時表示

来訪者ニーズの仮説: url-encode の本質は「URL 文字列を encode / decode する」両方向操作で、char-count / byte-counter のような「1 つの数値が答え」の単方向ツールとは性質が異なる。来訪者の目的は「日本語/特殊文字を URL に入れたい」(encode) または「URL ログの `%XX` を読みたい」(decode) のどちらでも自然で、どちらが多数派かを GA4 PV で測ることもできない（候補 6 件すべて直近 30 日 PV=0、推測ベース）。CLAUDE.md「Decision Making Principle」: 実装コストを理由に劣る UX を選んではならない。

| 選択肢                            | 判断                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 a: 入力 + encode 結果のみ      | 不採用: char-count / byte-counter と同じ最小構成で「タイルとしての一貫性」「実装が CharCountTile / ByteCounterTile からほぼ流用可能」というメリットはあるが、**decode 目的でタイルに辿り着いた visitor が「タイル単体では目的を達成できず詳細ページに飛ばされる」状況**が発生する。url-encode は本質的に双方向であり、片方向に削るのは visitor の半分を切り捨てる判断になる。CharCountTile / ByteCounterTile との一貫性は「kind=widget + recommendedSize cols=3 rows=2 + デザイントークン」レベルで十分担保される。 |
| 案 b: encode／decode トグル       | **採用**: タイル UI に「encode／decode」の 2 択トグル（初期値 encode）を 1 つだけ追加し、選択した方向の logic を呼び出す。トグル UI は操作要素 1 つの追加にとどまり、「タイルで素早く確認する」体験を大きく損なわない。一方で encode / decode のどちらの目的の visitor もタイル単体で目的を達成できる。url-encode の本質に応える設計。タイル枠 cols=3 rows=2（`calcTilePixels(3, 2)` = 400×264px）は方向トグル + 入力欄 + 結果欄 + 詳細リンクを収めるのに十分な余裕がある。                                         |
| 案 c: 同時表示（encode + decode） | 不採用: タイル内に 2 つの結果欄を並べると cols=3 rows=2（400×264px）では情報密度が過密になり、入力 textarea が極端に狭くなる。また「encode と decode のどちらの結果を見るか」が常に視線分散の対象となり、目的が明確な visitor にとって却ってノイズが多い。                                                                                                                                                                                                                                                          |

#### タイル UI の mode（`component` vs `full`）の扱い

詳細ページの Component.tsx は EncodeMode として `component`（`encodeURIComponent` 相当）と `full`（`encodeURI` 相当）を切替可能な select を持つ。

| 選択肢                          | 判断                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component` 固定                | **採用**: URL パラメータの値部分を encode する用途が最頻ケースで、来訪者が「URLエンコード」というキーワードで想起する典型用途と一致する。`full` は URL 全体（`http://example.com/path?...`）をまとめて encode する用途で、限定的。タイルは「素早く片付ける」場であり、最頻ケースに絞ることで操作数を最小化する。`full` が必要な visitor は詳細ページに移動すれば mode 切替できる（タイル枠内に詳細ページリンクを配置済）。 |
| `component` / `full` トグル可能 | 不採用: 案 b で encode / decode トグルを既に 1 つ持っており、その上に mode トグルも追加すると操作要素が 2 軸に増え、cols=3 rows=2 のタイル枠内で UI が窮屈になる。`full` は限定用途のため、最頻ケース固定 + 詳細ページ誘導で十分。                                                                                                                                                                                         |
| `full` 固定                     | 不採用: `full` モードは `?` や `&` を encode しないため、来訪者が「URL パラメータの値を encode したい」典型用途では期待通りの結果にならない。                                                                                                                                                                                                                                                                              |

mode 切替の頻度は GA4 では現在計測不能のため（同一ページ内 select 切替で外部から測れない）、本サイクル時点では「最頻ケース仮説」に基づく推測ベースでの確定とする。Phase 10.x で詳細ページの mode select 切替イベントを GA4 に送る計装を入れれば、次世代タイル設計で実測判断に切替可能。

#### タイル UI の変換トリガ: リアルタイム反映 vs ボタン押下式

詳細ページの Component.tsx は「変換」ボタン押下で結果を表示する設計。CharCountTile / ByteCounterTile はリアルタイム反映（onChange 即時更新）。タイル UI でどちらを採るかの判断:

| 選択肢                                | 判断                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リアルタイム反映（onChange 即時更新） | **採用**: タイルは「道具箱で素早く 1 機能を試す」場であり、最小操作で結果を見せることが visitor 価値の中核。CharCountTile / ByteCounterTile と同じパターンで体験の一貫性も保てる。decode の不正 `%XX` 入力時に「入力途中で瞬間的にエラー判定が出る」副作用については、エラー表示色を `--fg-soft` 等の控えめなトーンに統一し、`accent` 系の派手な色を避けることで視覚的チカチカを抑える。空入力時はエラーを出さず結果欄も空にする運用（T-3 注意事項に明記済）。 |
| ボタン押下式                          | 不採用: 詳細ページとの一貫性は得られるが、タイル UI でわざわざ「変換」ボタンを押す操作が発生すると「素早く片付ける」体験から離れる。「タイルで素早く試して、詳細が必要なら詳細ページへ」という階段が崩れる。詳細ページがボタン押下式なのは「変換以外にコピー・クリアなどの操作も並んでいて、入力中に結果が動くと却ってノイズになる」UI 文脈であり、タイルの簡素 UI とは前提が異なる。                                                                          |
| 双方サポート（onChange + 明示ボタン） | 不採用: 操作要素が増えるだけで、リアルタイムが効いている状況でボタンを押す意味がない。タイル枠 400×264px の限られた領域に明示ボタンを置く価値が薄い。                                                                                                                                                                                                                                                                                                          |

#### タイルの推奨サイズ

| 選択肢        | 判断                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cols=2 rows=2 | 不採用: 方向トグル + テキスト入力欄 + 結果欄を含めるには狭すぎる（`calcTilePixels(2, 2)` = 264×264px）。                                                                                                                                                                                                                                                              |
| cols=3 rows=2 | **採用**: char-count / byte-counter と同じサイズ。url-encode は出力が長く膨張する（日本語 30 文字 → 90 文字超）特性があるため、結果表示エリアは `overflow: auto` または `word-break: break-all` で枠内に収める運用とする。視覚 fit は T-1 baseline で取得した長文字列入力例と T-4 実機検証で確認する。Phase 10.x ダッシュボード設計時にサイズが揃っていることが重要。 |
| cols=4 rows=2 | 不採用: 表示内容に対して過大。長文字列 encode 結果の visual fit を `cols=3 rows=2` で `overflow: auto` で吸収できるため、サイズ拡大は不要。                                                                                                                                                                                                                           |

### 計画にあたって参考にした情報

- cycle-200（char-count）と cycle-201（byte-counter）の移行実装（標準パターンの実体）
  - `src/app/(new)/tools/char-count/page.tsx` / `page.module.css` — page.module.css ラッパーパターンと 1200px ハードコード
  - `src/tools/char-count/CharCountTile.tsx` / `src/tools/byte-counter/ByteCounterTile.tsx` — kind=widget タイルコンポーネント実装
  - `src/tools/_constants/tile-declarations.ts` — `TILE_DECLARATIONS` エントリ形式
- url-encode の現在のソースコード
  - `src/app/(legacy)/tools/url-encode/page.tsx`
  - `src/tools/url-encode/Component.tsx` + `Component.module.css` + `logic.ts` + `meta.ts` + `__tests__/logic.test.ts`
- 構造調査レポート: `tmp/research/2026-05-22-cycle-202-tool-migration-structure-research.md`（6 候補の比較表 + Top 3 推薦）
- GA4 PV 調査レポート: `tmp/research/2026-05-22-cycle-202-tool-migration-pv-data.md`（候補 6 件すべて直近 30 日 PV=0 の確認）
- `docs/design-migration-plan.md` — 移行アーキテクチャと Phase 定義
- `docs/anti-patterns/planning.md` — AP-P16（前提条件の実体確認）、AP-P20（過度に具体的な計画の回避）を確認

## レビュー結果

### 実装レビュー

**T-1 R1**: MINOR 1 件 → MINOR-1（長文字列 baseline が「未変換状態」のみで、計画書 L50 の「encode 結果が長く展開される入力例」の本来意図に未到達）→ 変換後の 1 枚を追加撮影 → **R2 Pass**。

**T-2 R1**: 指摘なしで **Pass**。全 10 観点（判定コマンド grep 0 / git mv 整合 / page.module.css 実体 / page.tsx ラッパー / トークン置換マッピング / 視覚回帰 / build 成功 / test 緑 / AP-I02 / AP-WF11）を充足。

**T-3 R1**: 指摘なしで **Pass**。UrlEncodeTile.tsx は kind=widget / 双方向トグル / リアルタイム反映 / mode=component 固定 / decode 控えめエラー（`--fg-soft`）/ インラインスタイル方式 / TILE_DECLARATIONS 登録の全仕様充足。テスト 8 件 / lint / format:check / test (4391件) / build (3895ページ) すべて PASS。

**T-4 R1**: MAJOR 1 件 / MINOR 3 件

- MAJOR-1: 長文字列 encode 時に textarea が約 12px に圧迫されて編集不能（CharCountTile/ByteCounterTile の `textarea flex: 1` パターンを url-encode（結果膨張型）に流用したことでの構造欠陥）→ textarea を `flexShrink: 0` + rows=2、結果欄を `flex: 1` + `overflowY: auto` に修正。3 ケース（短い encode / 長文字列 encode / decode）すべてで textarea 46px 維持を Playwright 計測で確認 → 修正済
- MINOR-1: 空入力 encode 状態スクショ追加 → 修正済
- MINOR-2: モバイル幅はみ出しは backlog 既存項目 B-434 で覆われているため対応不要（PM 確認済）
- MINOR-3: 詳細ページのダーク/モバイル/w1900 視覚回帰スクショを 5 枚追加 → 修正済

**T-4 R2**: 全修正確認 + 全体再見直し → **Pass**。MAJOR-1 解消、副作用なし、自動チェック全 PASS。**サイクル全タスク完了、cycle-completion へ移行可**。

### 計画レビュー

**R1**: 5 件の指摘（必須 2 / 推奨 3）

- MAJOR-1 タイル UI の双方向 / mode 扱いの再検討（必須）→ 採用案を「案 a: encode 単方向」→「案 b: encode／decode トグル + `component` 固定」に変更。新セクション「タイル UI の mode の扱い」追加。修正済
- MAJOR-2 T-2 完成条件の判定方法明示（必須）→ `grep -c -- "--color-" src/tools/url-encode/Component.module.css` の結果が `0` を判定コマンドとして追記。修正済
- MINOR-1 旧トークン対応表の SSoT 二重化（推奨）→ 計画書内の対応表を削除し、cycle-201 byte-counter 実装の git 履歴を SSoT 参照に集約。修正済
- MINOR-2 長い encode 結果の visual fit 検証（推奨）→ T-1 baseline 撮影、T-3 注意事項、T-4 検証項目の 3 箇所に「encode 結果が長く展開される入力例」「`overflow: auto` または `word-break: break-all`」を反映。修正済
- MINOR-3 T-1 完成条件のスクリーンショット枚数明示（推奨）→「計 6 枚（w1200 light/dark、w1900 light/dark、w375 light/dark）」に具体化。AP-WF05 再発防止注記も追加。修正済

**R2**: 5 件の指摘（必須 2 / 推奨 3）

- MAJOR-A タイル枠ピクセル数値の実体不一致（必須）→ 計画書 5 箇所の「400×272px」「256×272px」を実体（`calcTilePixels()` の戻り値）に合わせて「400×264px」「264×264px」に修正、SSoT 参照（`calcTilePixels()` 併記）を貫徹。AP-WF12 該当を反省。修正済
- MAJOR-B マークダウン表の `|` 区切り崩壊（必須）→ `[encode | decode]` の `|` を `／` に置換、区切り行も 2 カラム統一。修正済
- MINOR-α 詳細ページの既存トグルとの体験連続性（推奨）→ T-3 タイル UI の方針記述に「詳細ページ Component も既に encode/decode 方向トグル（`modeSwitch`）を実装済みのため、タイル側も双方向にすることで詳細ページとタイルの体験が一貫する」を追記。修正済
- MINOR-β 変換トリガ（リアルタイム vs ボタン押下）の設計判断（推奨）→ T-3 方針記述にリアルタイム反映採用を明記、新セクション「タイル UI の変換トリガ: リアルタイム反映 vs ボタン押下式」を追加し 3 案比較。decode 不正入力時の UX 緩和策（`--fg-soft` 控えめ表示、空入力時はエラー非表示）を T-3 注意事項に明記。修正済
- MINOR-γ mode 固定の根拠補強（推奨）→「タイル UI の mode」セクション末尾に「Phase 10.x で詳細ページの mode select 切替イベントを GA4 に送る計装を入れれば、次世代タイル設計で実測判断に切替可能」を追記。修正済

**R3**: 全修正確認 + 全体再レビュー → **Pass**（指摘なし）。実ファイルとの整合性・AP チェック（AP-P16/P17/P20/WF05/WF11/WF12）・完成条件の客観判定可能性・来訪者価値起点のすべての観点で問題なし。`/cycle-execution`（T-1 着手）に進んで差し支えない判定。

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
