---
id: 201
description: B-314 Phase 8.1 第 2 弾——byte-counter を cycle-200 標準パターンに沿って (new) 配下移行 + kind=widget タイル化。
started_at: 2026-05-21T22:47:13+0900
completed_at: null
---

<!-- このファイルはサイクルドキュメントのテンプレートです。`<>`で囲まれた部分を適切な内容に置き換えて使用してください。内容は作業が進むごとに都度更新してください。 -->

# サイクル-201

B-314 Phase 8.1 の第 2 弾。cycle-200 で char-count を皮切りに確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）を踏襲し、次のツール詳細ページの新デザイン移行 + タイル定義を実施する。着手対象は cycle-planning で GA4 PV・構造単純度・Phase 9 依存を踏まえて判断する。

## 実施する作業

- [x] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
- [x] cycle-execution で計画に沿った実装を行う
  - [x] T-1: 現状把握と移行前 baseline 取得（テスト 29 件 Pass、スクリーンショット 3 枚取得）
  - [x] T-2: 詳細ページの (new) 配下移行（git mv + page.module.css 新設 + トークン置換 + ビルド確認）
  - [x] T-3: タイル定義（ByteCounterTile.tsx 新規 + TILE_DECLARATIONS 追加 + codegen + テスト 6 件）
  - [x] T-4: 検証と統合確認（Playwright 実機検証 + lint/format/test(4383件)/build 全 Pass）
- [ ] cycle-completion でサイクルを完了させる

## 作業計画

### 目的

**誰のために**: M1a（初回来訪者）および M1b（リピーター）。テキストの UTF-8 バイト数を確認したい来訪者。

**何の価値**:

- デザインの統一感向上（新デザインシステムへの移行）
- 将来のダッシュボード機能（道具箱タイル表示）への準備
- リピーターが混乱しないよう URL と挙動は一切変えない

**背景**: B-314 Phase 8.1 の第 2 弾。cycle-200 で char-count を対象に確立した標準パターン（ToolLayout 外側 page 個別 CSS Module 1200px ハードコード / kind=widget タイル定義 / `/internal/tiles/preview/[domain]/[slug]` 検証ルート）に沿い、byte-counter の新デザイン移行とタイル化を実施する。

### 作業内容

#### T-1: 現状把握と移行前 baseline 取得

- byte-counter の現在のファイル構成・コード・CSS を確認する（実施済み: Component.tsx + Component.module.css + logic.ts + meta.ts + `__tests__/logic.test.ts`、page.tsx は `(legacy)` 配下）
- Playwright で移行前のスクリーンショットを取得する（デスクトップ w1200 / w1900、モバイル w375）
- 既存テストの実行確認（`npm run test` で logic.test.ts が通ること）

**完成条件**: 移行前の表示状態が画像として記録されている。テストが通っている。

#### T-2: 詳細ページの (new) 配下移行

cycle-200 char-count で確立した標準パターンを踏襲する:

- `src/app/(legacy)/tools/byte-counter/` を `src/app/(new)/tools/byte-counter/` に移動する
- page.module.css を新設し、1200px max-width をハードコードする（char-count と同一パターン）
- page.tsx に page.module.css の `.page` ラッパーを追加する
- Component.module.css 内の `--color-*` 系旧カラートークンを新デザイントークンに置換する
- w1900 での幅チェックを実施する（ToolLayout が 1200px に収まっていること）
- Playwright で移行後スクリーンショットを取得し、移行前と比較する

**注意事項**:

- ToolLayout 自体は touch しない
- 共通コンポーネント（ToolLayout / Breadcrumb / FaqSection 等）内の旧トークンは touch しない（B-431 で管理）。一方、byte-counter 固有の Component.module.css 内のトークン置換はこの移行タスクの範囲（cycle-200 char-count でも同様に実施した標準パターンの一部）
- trustLevel フィールドは削除しない（B-432 で一括削除）
- opengraph-image.tsx / twitter-image.tsx もそのまま移動する

**完成条件**: `/tools/byte-counter` が (new) 配下で正常表示される。旧 (legacy) パスにファイルが残っていない。w1200 / w1900 / w375 で表示崩れがない。Component.module.css 内に `--color-*` 系旧トークンが残存しないこと。

#### T-3: タイル定義（kind 判定 + タイル用コンポーネント実装）

- **kind 判定**: byte-counter の詳細ページ Component は textarea(200px) + primaryStat + 4 stat grid + 4 breakdown row で構成されている。タイルセル（128px ベース）に収まらないため **kind=widget** とする
- タイル用コンポーネント（ByteCounterTile.tsx）を `src/tools/byte-counter/` 配下に新規実装する
  - 詳細ページとは別の簡素な UI（char-count CharCountTile と同じインラインスタイル方式）
  - logic.ts のバイト数計算関数を再利用する
  - テキスト入力 + バイト数表示 + 詳細ページへのリンク
- `src/tools/_constants/tile-declarations.ts` の TILE_DECLARATIONS 配列末尾に byte-counter のエントリを追加する
- `npm run generate:tiles-registry` で codegen を実行する
- タイル用コンポーネントのテストを追加する

**注意事項**:

- タイル内の 8px padding/gap は TILE_GAP_PX（タイル間マージン）とは別概念
- CSS Module は使用しない（codegen が解釈できないため、インラインスタイル方式）
- デザイントークンは `--fg` / `--bg` / `--accent` / `--fg-soft` を使用する

**完成条件**: TILE_DECLARATIONS に byte-counter が追加されている。codegen が成功する。

#### T-4: 検証と統合確認

- `/internal/tiles/preview/tools/byte-counter` での単独レンダリング検証（Playwright）
- 移行後のスクリーンショット比較（デスクトップ w1200 / w1900、モバイル w375）
- `npm run lint && npm run format:check && npm run test && npm run build` の全パス確認
- 移行前後で URL が変わっていないことの確認（`/tools/byte-counter` でアクセス可能）

**完成条件**: 全検証項目をクリア。タイルプレビューでテキスト入力とバイト数表示が動作すること。lint / format / test / build が全パス。

### 検討した他の選択肢と判断理由

#### kind の判定: widget vs single vs multi

| 選択肢      | 説明                                        | 判断                                                                                                       |
| ----------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| kind=single | 詳細ページ Component をそのままタイルに使う | 不採用: textarea 200px + primaryStat + 4stat grid + 4breakdown = 高さが 128px ベースのタイルに収まらない   |
| kind=widget | 詳細ページとは別の簡素 UI をタイル用に実装  | **採用**: char-count と同系統のテキスト分析ツールであり、タイルには入力+主要結果のみを表示する簡素版が適切 |
| kind=multi  | 複数バリエーション                          | 不採用: byte-counter にバリエーション分岐する要素がない                                                    |

#### タイルの推奨サイズ

| 選択肢        | 説明                    | 判断                                                                                |
| ------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| cols=2 rows=2 | より小さいタイル        | 不採用: テキスト入力欄 + バイト数表示を含めるには狭すぎる                           |
| cols=3 rows=2 | char-count と同じサイズ | **採用**: 同系統ツールであり、同じ UI パターン（textarea + 結果表示）のため統一する |
| cols=4 rows=2 | より大きいタイル        | 不採用: 表示内容に対して過大                                                        |

### 計画にあたって参考にした情報

- cycle-200 の char-count 移行実装（標準パターンの実体）
  - `src/app/(new)/tools/char-count/page.tsx` — page.module.css ラッパーパターン
  - `src/app/(new)/tools/char-count/page.module.css` — 1200px ハードコード
  - `src/tools/char-count/CharCountTile.tsx` — kind=widget タイルコンポーネント実装
  - `src/tools/_constants/tile-declarations.ts` — TILE_DECLARATIONS エントリ形式
- byte-counter の現在のソースコード
  - `src/app/(legacy)/tools/byte-counter/page.tsx`
  - `src/tools/byte-counter/Component.tsx` + `Component.module.css` + `logic.ts` + `meta.ts`
- `docs/design-migration-plan.md` — 移行アーキテクチャと Phase 定義
- `docs/anti-patterns/planning.md` — AP-P16（前提条件の実体確認）、AP-P20（過度に具体的な計画の回避）を確認

## レビュー結果

### 計画レビュー

**R1**: 4 件の指摘（必須 2 / 推奨 2）

- T-2 完成条件に旧トークン残存チェック追加（必須）→ 修正済
- T-3 の関数名指定を抽象化（必須）→ 修正済
- T-4 完成条件にタイル動作検証追加（推奨）→ 修正済
- B-431 との境界明記（推奨）→ 修正済

**R2**: 全修正確認 + 全体再レビュー → **Pass**。実ファイルとの整合性・AP チェックともに問題なし。

### 実装レビュー

**R1**: 全 9 ファイルを実読み + Playwright 実機検証（4 viewport パターン）+ AP チェック（AP-I01/I02/I03/I08/I09）→ **Pass**。指摘事項なし。

## キャリーオーバー

- なし（すべてのタスクが完了）

## 補足事項

- byte-counter は char-count と構造が類似しており、標準パターンの 2 回目の適用として順調に完了した。3 回目以降（hash-generator、base64 等）も同じパターンで進められる見込み。
- タイルテスト（ByteCounterTile.test.tsx: 6 件）は char-count のテスト（4 件）より充実しており、CJK バイト数の検証も含む。後続サイクルのタイルテストの参考になる。

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
