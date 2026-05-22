---
id: 206
description: B-314 Phase 8.1 第 7 弾として fullwidth-converter（全角半角変換）のタイル化と (new)/tools/ 配下への詳細ページ移行を行う。cycle-205 で hash-generator が非同期パターン初挑戦を完了したため、本サイクルは標準パターン通常運用フェーズに復帰し、双方向 textarea×2 + 同期処理 + 結果膨張ゼロ型 + オプション複数（英数字 / カタカナ / 記号）という構造的差分を 7 回目の通常運用で確認する。
started_at: 2026-05-22T23:37:11+0900
completed_at: null
---

# サイクル-206

このサイクルでは、`B-314`（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8）の **第 7 弾**として `fullwidth-converter`（全角半角変換）を扱う。cycle-200〜205 で標準パターン（`kind=widget` / `page.module.css` 1200px / `/internal/tiles/preview/[domain]/[slug]` 検証ルート / AP-P21 役割分担 / AP-WF16 reviewer 独立再実行）が 6 回適用済み、AP-P21 両性質汎用性も実証成立しているため、本サイクルは **標準パターン通常運用フェーズの初回**として位置づける。

来訪者にとっての価値は「全角半角変換も新デザインで使え、ダッシュボードのタイルとしても並べられる」一点。実装上の構造的差分（オプションチェックボックス 3 種、半角カタカナ非対応の選択肢を含む 6 種の英数字 / カタカナ / 記号変換）を計画時点で SSoT として整理する。

## 実施する作業

- [ ] T-1: タイル定義の追加（`src/tools/fullwidth-converter/` 配下に `tile.tsx` / `FullwidthConverterTile.tsx` / `FullwidthConverterTile.module.css` などタイル UI 一式を作成、`kind=widget` / 推奨セル数 cols=3 rows=2 / セグメントコントロール 2 状態（半角 / 全角）+ オプション簡略表示）
- [ ] T-2: registry への組み込みと SSoT 整合性確認（`src/tools/registry.ts` などへの tile 登録、`scripts/generate-toolbox-registry.ts` 経由の自動生成物の差分確認、Discriminated Union 型契約の維持）
- [ ] T-3: 詳細ページの `(new)/tools/fullwidth-converter/` 配下への移行（`page.tsx` / `page.module.css` / `opengraph-image.tsx` / `twitter-image.tsx` / 必要なら `__tests__/page.test.tsx`、1200px max-width 標準パターン）
- [ ] T-4: Playwright 視覚回帰 + AP-P21 計測 + AP-WF16 reviewer 独立再実行（baseline 8 枚 / after 6 枚 / tiles-preview 4 枚 = 18 枚目安、textarea 高さ計測 4 ケース、`lint` / `format:check` / `test` / `build` の 4 コマンド全件 reviewer 独立再実行）

## 作業計画

このセクションは `/cycle-planning` フェーズで planner サブエージェントが詳細を記入する。本ファイル作成時点では、cycle-200〜205 で確立した標準パターンを 7 回目として fullwidth-converter に適用する方針と、以下の構造的差分の整理点だけをスタブとして残す。

### 目的

（`/cycle-planning` で記入）

### 作業内容

（`/cycle-planning` で記入）

#### 構造的差分の整理（planner への申し送り）

- **入力 / 出力構造**: 双方向 textarea×2、半角 ⇄ 全角の双方向トグル。base64 / html-entity / url-encode と同構造。
- **同期 / 非同期**: 同期処理（純粋な文字テーブル変換）。cycle-205 で確立した非同期パターン（`crypto.subtle` / `useEffect` cleanup / loading 非表示 / 日本語フォールバック）は本サイクル不要。
- **結果膨張性**: ゼロ（半角 1 文字 ↔ 全角 1 文字、半角カタカナ濁音などで稀に微増だが基本同長）。AP-P21 膨張ゼロ型サンプルとして cycle-205 hash-generator に続く 2 件目。
- **オプション複数**: 英数字 / カタカナ / 記号の 3 種チェックボックス。これまでの 6 ツールに無かった構造的差分。タイル UI の cols=3 rows=2 (400×264px) 内にどう収めるかが本サイクル最大の設計判断。
- **エラー処理**: 失敗パターン無し（不正な入力で例外を投げる経路がない）。base64 / hash-generator のような失敗 UI / 失敗テストは不要。

### 検討した他の選択肢と判断理由

#### 候補ツール比較（kickoff 時の絞り込み）

cycle-205 完了時点での残ツール約 28 件のうち、以下を比較した。

- **(b1) qr-code 生成**: 非同期パターン直接応用、出力が視覚（SVG/canvas）で構造的に大きく異なる。cycle-205 で確立した非同期パターン SSoT を 2 件目で検証する価値はあるが、視覚出力 UI の設計判断が増えるため本サイクル外。
- **(b2) image-base64 / image-resizer**: 入力が画像ファイル（FileReader 非同期 + Canvas）で、テキスト系 6 ツールとは入力構造が異なる。非同期パターンの 2 件目を別系統で扱うのは情報量過多のため後続サイクル。
- **(c1) fullwidth-converter（採択）**: 双方向 textarea×2 + 同期処理 + 結果膨張ゼロ + オプション 3 種という構造で、cycle-204 html-entity の派生として最も低リスク。**選定**。
- **(c2) kana-converter**: fullwidth-converter と構造類似。cycle-206 と並行して cycle-207 候補として残す。
- **(d) より単純な構造のツール（dummy-text 等）**: 単機能で構造的差分が少なく、cycle-200 char-count 直後と同等の情報量。標準パターン通常運用フェーズの初回検証としては差分が少なすぎるため後続サイクル。

#### 採択理由

1. **構造的差分の段階性**: オプション 3 種チェックボックスという「タイル UI の cols=3 rows=2 (400×264px) 内に複数 UI 要素を収める設計判断」が新しい。
2. **非同期パターン SSoT のクールダウン**: cycle-205 で確立直後の非同期パターンをいきなり 2 件目に適用すると、SSoT に未発見のバグが残っていた場合に 2 サイクル連続失敗のリスク。1 サイクル挟むことで cycle-205 成果物が安定運用に入ったかを別系統で確認できる。
3. **AP-P21 膨張ゼロ型サンプル増強**: cycle-205 hash-generator に続く 2 件目の膨張ゼロ型計測サンプルとして、textarea 4 ケース計測の比較ベースラインに追加できる。
4. **来訪者価値の確実性**: cycle-202〜204 で 3 回成功している「双方向 textarea×2 構造」の 4 回目で、失敗リスクが最も低い候補。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-200.md`〜`cycle-205.md`（標準パターン 6 回適用の累積知見）
- `docs/anti-patterns/planning.md` AP-P21（固定枠 UI における膨張側 / 操作側役割分担）
- `docs/anti-patterns/workflow.md` AP-WF16（builder 自動チェック報告の reviewer 独立再実行）
- `docs/design-migration-plan.md` Phase 8.1 のスコープ定義
- `src/tools/fullwidth-converter/Component.tsx` / `logic.ts` / `meta.ts`（実装対象の現状）

## レビュー結果

（`/cycle-planning` 以降で記入）

## キャリーオーバー

（サイクル進行中に随時記入。次サイクル以降への申し送りがあれば本欄と `docs/backlog.md` の両方に記載する。）

## 補足事項

- 本サイクルは **標準パターン通常運用フェーズの初回**である点を明示的に意識する。cycle-200〜205 のように「AP 新規起票」「事後検証 1 件目 / 2 件目」のような実証目的のメタ要素が薄い分、計画と実装が淡々と進む見通し。逆に「淡々と進むはず」という油断が AP-WF16 reviewer 独立再実行をスキップする誘因にならないよう、T-3 / T-4 で 4 コマンド全件 reviewer 独立再実行を本サイクルでも維持する。
- cycle-205 T-4 R1 で観測された「初回 reviewer の応答停止」は 1 件目の観察サンプルにとどまり AP 化見送り。本サイクルで再発したら `docs/anti-patterns/workflow.md` への AP 追加を検討する。

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
