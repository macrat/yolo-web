# コーディングスタイル

## TypeScript規約

- 厳格モード（`strict: true`）を使用
- `any` の使用を避け、適切な型を定義する
- インターフェースよりも型エイリアスを優先（特に理由がなければ）
- 関数の戻り値の型を明示する（公開API）

## ESLint

ESLint 10 のフラットコンフィグ形式を使用。設定ファイルは `eslint.config.mjs`。

含まれるルールセット:

- `eslint-config-next/core-web-vitals` — Next.js + React + React Hooks + Core Web Vitals ルール
- `eslint-config-next/typescript` — TypeScript固有のルール（`@typescript-eslint/recommended`ベース）
- `eslint-config-prettier` — Prettierとの競合ルールを無効化

実行:

```bash
# チェックのみ
npm run lint

# 自動修正
npm run lint:fix
```

## Prettier

コードフォーマット設定（`.prettierrc`）:

| 設定            | 値                        |
| --------------- | ------------------------- |
| `semi`          | `true`（セミコロンあり）  |
| `singleQuote`   | `false`（ダブルクォート） |
| `tabWidth`      | `2`                       |
| `trailingComma` | `"all"`                   |
| `printWidth`    | `80`                      |

実行:

```bash
# フォーマット
npm run format

# チェックのみ
npm run format:check
```

## 一般原則

- 小さく焦点の合った関数/コンポーネントを書く
- マジックナンバーを避け、名前付き定数を使用する
- コメントは「なぜ」を説明する（「何を」はコードが説明する）
- 副作用を最小限に保つ
