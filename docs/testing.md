# テスト戦略

## テストフレームワーク

- **Vitest** — テストランナー
- **jsdom** — DOMシミュレーション環境
- **@testing-library/react** — Reactコンポーネントテストユーティリティ
- **@testing-library/jest-dom** — カスタムDOMマッチャー（`toBeInTheDocument()` など）

## 設定ファイル

- `vitest.config.mts` — Vitest設定（プロジェクトルート）
- `src/test/setup.ts` — テストセットアップ（jest-domマッチャーの読み込み）

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

## テスト実行

```bash
# 全テスト実行（単発）
npm test

# ウォッチモード
npm run test:watch
```

## テストの書き方（例）

```tsx
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

test("Home page renders heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "yolos.net" }),
  ).toBeInTheDocument();
});
```
