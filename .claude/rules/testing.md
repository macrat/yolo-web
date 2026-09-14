---
paths:
  - src/**/*
  - vitest.config.mts
---

# テスト戦略

## テストフレームワーク

- **Vitest** — テストランナー
- **jsdom** — DOMシミュレーション環境
- **@testing-library/react** — Reactコンポーネントテストユーティリティ
- **@testing-library/jest-dom** — カスタムDOMマッチャー（`toBeInTheDocument()` など）

## 設定ファイル

- `vitest.config.mts` — Vitest設定（プロジェクトルート）。`unit` と `build` の2プロジェクトを定義する
- `src/test/setup.ts` — テストセットアップ（jest-domマッチャーの読み込み）
- `src/__tests__/build-output.ts` — ビルド生成物を読むテストの共通土台

## テストの実行

テストは2つのプロジェクトに分かれており、走らせるコマンドが異なる。

| プロジェクト | コマンド             | 対象                                 | 前提            |
| ------------ | -------------------- | ------------------------------------ | --------------- |
| `unit`       | `npm run test`       | ビルド生成物を読まないすべてのテスト | なし            |
| `build`      | `npm run test:build` | ビルド生成物（`.next/`）を読むテスト | `npm run build` |

- ローカルで `npm run test:build` を走らせる前に `npm run build` を実行する。生成物が無ければ失敗する
- `npm run test:watch` が監視するのは `unit` のみ
- CI（`.github/workflows/deploy.yml`）とpush前フック（`.claude/hooks/pre-push-check.sh`）は、`npm run test` → `npm run build` → `npm run test:build` の順で実行する

## ビルド生成物を読むテスト

サーバーレンダリング済みHTMLやバンドルのマニフェスト・チャンクなど、`.next/` の中身そのものを検査するテストは、ソースからは再現できない「出力そのもの」を対象とする。

- パス定数（`PROJECT_ROOT` / `NEXT_DIR` / `SERVER_APP_DIR`）と `requireBuildOutput()` は `src/__tests__/build-output.ts` から取る
- テストファイルの冒頭で `requireBuildOutput()` に必要な生成物のパスを渡す。揃っていなければ理由を添えてその場で失敗する。生成物の有無でスイートをスキップしてはならない（検査が走っていないことが誰にも伝わらなくなるため）
- **`vitest.config.mts` の `BUILD_OUTPUT_TESTS` にファイルパスを登録する。** ここに列挙したものだけが `build` プロジェクトに入り、`unit` から外れる
- 登録を忘れたテストは `unit` に残り、ビルド前に走る `npm run test` の中で `requireBuildOutput()` が失敗する。CIはまっさらなチェックアウトで走るため、登録漏れは必ず露見する

## テスト対象

以下のものがテストに値します：

- ユーティリティ関数とヘルパー
- コンポーネントのレンダリングと基本的な動作
- データ変換ロジック
- エッジケースとバウンダリ条件

## テストに含めないもの

- 外部サービスの統合（モックを使用）
- フレームワークの内部動作
- 純粋なスタイリング

## ファイル命名規約

- テストファイルはテスト対象ファイルと同じディレクトリ内の `__tests__/` フォルダに配置
- 命名パターン: `<filename>.test.ts` または `<filename>.test.tsx`
- 例: `src/app/__tests__/page.test.tsx` は `src/app/page.tsx` をテスト
