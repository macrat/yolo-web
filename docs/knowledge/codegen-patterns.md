# コード生成（codegen）パターンの知見

このプロジェクトで使用している prebuild 時コード生成パターンの技術的知見。

---

## 1. toolbox registry の自動生成（案 H: codegen 集約）

### 背景

ダッシュボードのタイル候補一覧（`Tileable[]`）を構築するため、全コンテンツ（tools/play/cheatsheets）を統合する indexer を実装した（cycle-175 Phase 2.2.2）。

初期実装は手書きの集中 registry（`src/tools/registry.ts` 等から直接 import）だったが、500 件スケールで「`meta.ts` を作っても登録忘れがあっても型チェック・テストで検出できない」問題があるため、codegen 方式に切り替えた。

### 仕組み

- `scripts/generate-toolbox-registry.ts` が prebuild/predev/pretest フックで実行される
- `fast-glob` で `src/tools/*/meta.ts`、`src/cheatsheets/*/meta.ts` を自動発見
- `src/lib/toolbox/generated/toolbox-registry.ts` を生成（git にコミット）
- play コンテンツは per-slug `meta.ts` 慣習がないため、既存の `src/play/registry.ts` を直接 import

### 生成ファイルの運用方針

- 生成ファイルは git にコミットする（prebuild なしで lint/typecheck が通るようにするため）
- 手動編集された場合: `npm run generate:toolbox-registry` を実行すれば復元できる
- `git diff` で意図しない編集を検出・revert することが基本の運用

### 既知の限界

この codegen が防ぐのは「toolbox 統合 indexer（ダッシュボード用）への未登録」のみ。

- 既存の `src/tools/registry.ts` / `src/cheatsheets/registry.ts` は依然として手書き管理
- ツール一覧ページ・サイトマップ等への掲載漏れは別問題として残る
- 後続サイクルで既存 registry を段階的に codegen へ統合予定

### テスト戦略

`buildRegistryContent(toolSlugs, cheatsheetSlugs, playCount)` を純粋関数として export することで、ファイルシステムを使わず in-memory でテスト可能にしている（`scripts/__tests__/generate-toolbox-registry.test.ts`）。

これにより「dummy slug を追加すれば生成コンテンツに含まれる / 削除すれば消える」が CI で自動回帰テストされる。

### 件数サニティチェック

glob の誤設定や予期しないディレクトリ構造変化で件数が激減した場合に早期エラーを出す（`assertMinCount`）。

> 注（cycle-243）: cheatsheet 機能の撤去に伴い、生成元から cheatsheet の発見・生成を削除した。現行の生成対象は tools のみ（`assertMinCount` も tools ≥ 10 のみ）。本 §1 の cheatsheet 関連記述（`src/cheatsheets/*/meta.ts` の発見・`cheatsheetSlugs` 引数等）は歴史的経緯として残すが、現状には存在しない。

---

## 2. 落とし穴: 機能撤去時、codegen が削除済みファイルを蘇生させる

prebuild/predev/pretest フックの codegen は、`src/` のソースを削除しただけでは止まらない。glob で発見した `meta.ts` を元に生成物を書き出すため、撤去した機能の生成物（registry 等）が prebuild のたびに再生成され、「削除済みモジュールを import する壊れたファイル」として蘇る。

- 機能を撤去するときは、`src/` 配下だけでなく、生成元スクリプト（`scripts/generate-*.ts`）側の発見・書き出しロジックも撤去範囲に含まれる。
- ツールチェーンの性質: 単独の `npx tsc --noEmit` は prebuild を回さないためこの再生成を検出できない。`.next` をクリーンした `next build`（prebuild → tsc を通す）でのみ型エラーとして顕在化する。
- cycle-243 で cheatsheet 撤去時に実際に発生（生成元から cheatsheet 生成を撤去して解消）。
