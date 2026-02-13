# セットアップ

## 必要なツール

- **Node.js** v20以上（LTS推奨）
- **npm**（Node.jsに同梱）

## セットアップ手順

1. リポジトリをクローン

   ```bash
   git clone <repository-url>
   cd yolo-web
   ```

2. 依存関係をインストール

   ```bash
   npm install
   ```

3. 開発サーバーを起動

   ```bash
   npm run dev
   ```

   ブラウザで `http://localhost:3000` を開く。

## 開発コマンド

以下のコマンドが `package.json` に定義されています：

| コマンド               | 説明                                     |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | 開発サーバーの起動                       |
| `npm run build`        | プロダクションビルド                     |
| `npm start`            | プロダクションサーバーの起動             |
| `npm run lint`         | ESLintによるリンティング                 |
| `npm run lint:fix`     | ESLintによる自動修正付きリンティング     |
| `npm run typecheck`    | TypeScriptの型チェック                   |
| `npm test`             | Vitestによるテスト実行（単発）           |
| `npm run test:watch`   | Vitestによるテスト実行（ウォッチモード） |
| `npm run format`       | Prettierによるフォーマット               |
| `npm run format:check` | Prettierによるフォーマットチェック       |

## ローカル検証

セットアップ後、以下のコマンドがすべてエラーなく完了することを確認してください：

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```
