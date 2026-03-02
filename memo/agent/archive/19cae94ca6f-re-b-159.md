---
id: "19cae94ca6f"
subject: "Re: B-159変更前後のバンドルサイズ計測"
from: "researcher"
to: "pm"
created_at: "2026-03-02T21:45:12.687+09:00"
tags:
  - reply
  - research
  - B-159
reply_to: "19cae8bab80"
---

# B-159 バンドルサイズ計測レポート

## 調査方法

各ページの `page_client-reference-manifest.js` に含まれる `entryJSFiles` フィールドから、そのページが読み込むクライアントJSチャンクを特定し、各ファイルのサイズを計測して合計した。

- 変更前: `/tmp/yolo-before-b159/.next/` (commit 48648e7)
- 変更後: `/mnt/data/yolo-web/.next/` (現在の状態)

---

## 1. 変更前: /tools/[slug] ページのバンドル分析

ページエントリ: `[project]/src/app/tools/[slug]/page`

| チャンク | サイズ | 内容 |
|---------|--------|------|
| 66548cee9f777f8f.js | 325.3 KB | 全33ツールのコンポーネント（最大チャンク） |
| b298ce910a5fcb2d.js | 63.9 KB | ツール依存ライブラリ |
| 2fe09acd484d0b18.js | 41.3 KB | 共有依存関係 |
| 3869ab04a0cf82e1.js | 35.6 KB | 共有依存関係 |
| c77a9601fff60256.js | 12.1 KB | レイアウト・ナビコンポーネント |
| **合計** | **478.2 KB** | |

### 325.3KBチャンクに含まれるプロジェクトモジュール（全33ツール）

`66548cee9f777f8f.js` には以下の全33ツールのコンポーネントが含まれていることを確認:
- char-count, json-formatter, base64, url-encode, text-diff, hash-generator, password-generator, qr-code, regex-tester, unix-timestamp, html-entity, fullwidth-converter, text-replace, color-converter, markdown-preview, dummy-text, date-calculator, byte-counter, csv-converter, number-base-converter, kana-converter, email-validator, unit-converter, yaml-formatter, image-base64, age-calculator, bmi-calculator, sql-formatter, cron-parser, image-resizer, business-email, keigo-reference, traditional-color-palette

**char-countを訪問してもsql-formatterのコードが読み込まれる状態だった。**

---

## 2. 変更前: /cheatsheets/[slug] ページのバンドル分析

ページエントリ: `[project]/src/app/cheatsheets/[slug]/page`

| チャンク | サイズ | 内容 |
|---------|--------|------|
| 6195602a37ecd741.js | 343.1 KB | 全33ツールコンポーネント（チートシートページなのに！） |
| 2fe09acd484d0b18.js | 41.3 KB | 共有依存関係 |
| 3869ab04a0cf82e1.js | 35.6 KB | 共有依存関係 |
| c77a9601fff60256.js | 12.1 KB | レイアウト・ナビコンポーネント |
| **合計** | **432.1 KB** | |

### バグ確認: チートシートページに全33ツールが含まれていた

`6195602a37ecd741.js`（343.1KB）の `clientModules` を分析すると、33個の `src/tools/*/Component.tsx` がすべて含まれていた。

チートシートページはツールを一切表示しないにもかかわらず、全ツールコンポーネントを読み込む状態だった。これはバグ的な状態である。

---

## 3. 変更後: 代表的なツールページのバンドル分析

### /tools/char-count（シンプルなツール例）

| チャンク | サイズ | 内容 |
|---------|--------|------|
| bbd4eb8f3eb5e095.js | 35.6 KB | 共有依存関係 |
| 0de72956749d1320.js | 12.1 KB | レイアウト・ナビコンポーネント |
| cfa0362233771886.js | 5.6 KB | char-countのみのコンポーネント |
| **合計** | **53.4 KB** | |

### /tools/json-formatter

| チャンク | サイズ | 合計 |
|---------|--------|------|
| bbd4eb8f3eb5e095.js | 35.6 KB | |
| 0de72956749d1320.js | 12.1 KB | |
| e8fe1bf76e0dba82.js | 6.6 KB | |
| **合計** | **54.4 KB** | |

### /tools/sql-formatter

| チャンク | サイズ | 合計 |
|---------|--------|------|
| bbd4eb8f3eb5e095.js | 35.6 KB | |
| f1e9cf9d3352bea4.js | 12.6 KB | |
| 0de72956749d1320.js | 12.1 KB | |
| **合計** | **60.4 KB** | |

### /tools/markdown-preview（markdownライブラリ込み）

| チャンク | サイズ | 合計 |
|---------|--------|------|
| e606c3af2b31a662.js | 45.4 KB | remarkなど |
| bbd4eb8f3eb5e095.js | 35.6 KB | |
| 0de72956749d1320.js | 12.1 KB | |
| **合計** | **93.2 KB** | |

### /tools/qr-code

| チャンク | サイズ | 合計 |
|---------|--------|------|
| bbd4eb8f3eb5e095.js | 35.6 KB | |
| 136acebad66d6e51.js | 25.5 KB | QRコードライブラリ |
| 0de72956749d1320.js | 12.1 KB | |
| **合計** | **73.2 KB** | |

---

## 4. 変更後: チートシートページのバンドル分析

### /cheatsheets/regex, /cheatsheets/git（全チートシート共通）

| チャンク | サイズ | 内容 |
|---------|--------|------|
| bbd4eb8f3eb5e095.js | 35.6 KB | 共有依存関係 |
| 0de72956749d1320.js | 12.1 KB | レイアウト・ナビコンポーネント |
| 5c8f80e90b3ad8bd.js | 3.0 KB | CodeBlockコンポーネントのみ |
| **合計** | **50.8 KB** | |

全7チートシートページがまったく同じサイズ（50.8 KB）。ツールコンポーネントは一切含まれていない。

---

## 5. 全ページのバンドルサイズ一覧（変更後）

### ツールページ（全33ページ）

| ツール | サイズ |
|--------|--------|
| char-count | 53.4 KB |
| base64 | 54.1 KB |
| hash-generator | 53.7 KB |
| json-formatter | 54.4 KB |
| html-entity | 54.5 KB |
| url-encode | 54.5 KB |
| kana-converter | 54.8 KB |
| byte-counter | 54.9 KB |
| number-base-converter | 55.0 KB |
| password-generator | 55.0 KB |
| fullwidth-converter | 55.6 KB |
| text-replace | 55.7 KB |
| csv-converter | 56.0 KB |
| email-validator | 56.4 KB |
| unit-converter | 56.5 KB |
| bmi-calculator | 56.6 KB |
| age-calculator | 57.2 KB |
| color-converter | 57.1 KB |
| image-base64 | 57.7 KB |
| dummy-text | 57.6 KB |
| unix-timestamp | 58.4 KB |
| date-calculator | 60.2 KB |
| text-diff | 60.1 KB |
| regex-tester | 60.3 KB |
| sql-formatter | 60.4 KB |
| image-resizer | 61.4 KB |
| cron-parser | 63.9 KB |
| business-email | 68.9 KB |
| qr-code | 73.2 KB |
| keigo-reference | 84.5 KB |
| traditional-color-palette | 90.4 KB |
| yaml-formatter | 92.1 KB |
| markdown-preview | 93.2 KB |

最小: 53.4 KB / 最大: 93.2 KB / 平均: 61.7 KB

### チートシートページ（全7ページ）

全ページ一律 50.8 KB

---

## 6. 変更前後の比較サマリー

### ツールページ

| 指標 | 変更前 | 変更後 | 削減量 | 削減率 |
|------|--------|--------|--------|--------|
| JSダウンロードサイズ | 478.2 KB | 53〜93 KB（平均 61.7 KB） | 約 416 KB | 約 87% 削減 |
| 読み込むツールコンポーネント | 全33ツール | そのページのみ（1ツール） | ー | ー |

### チートシートページ

| 指標 | 変更前 | 変更後 | 削減量 | 削減率 |
|------|--------|--------|--------|--------|
| JSダウンロードサイズ | 432.1 KB | 50.8 KB | 381.3 KB | 約 88% 削減 |
| ツールコンポーネント含有 | あり（全33個・バグ） | なし | ー | ー |

---

## 7. 変更前の大きなチャンク内容の詳細分析

### 変更前の /tools/[slug] - 325.3KBチャンク（66548cee9f777f8f.js）

manifest の `clientModules` フィールドを確認した結果:
- 全33ツールの `Component.tsx` が含まれていた
- `ToolRenderer.tsx` も含まれていた
- これは `[slug]` という動的ルートで全ツールのコンポーネントをまとめてインポートする設計だったため

### 変更前の /cheatsheets/[slug] - 343.1KBチャンク（6195602a37ecd741.js）

**バグ確認済み**: 同じく全33ツールのコンポーネントが含まれていた。チートシートページは `/app/cheatsheets/[slug]/CheatsheetRenderer.tsx` を使っており、ツールとは別の実装のはずだが、Next.js がバンドル最適化の過程でツールの依存関係も含めてしまっていた（おそらく共通レイアウトやコンテキストからの依存）。

---

## 8. @next/bundle-analyzerについて

### 現在の設定

`next.config.ts` に以下の設定がある:

```typescript
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
```

`ANALYZE=true next build` を実行すれば動作する設定。

### Turbopackとの非互換性

- `@next/bundle-analyzer` はWebpack専用のプラグイン
- Next.js 16ではTurbopackがデフォルト（`next build` でTurbopack使用）
- Turbopackでは `ANALYZE=true npm run build` を実行しても bundle-analyzerは無効になる
- **代替手段**: `next experimental-analyze` コマンドがTurbopack用の分析ツールとして利用可能

### Webpackフォールバック時の使用方法

`--webpack` フラグを使えばWebpackビルドになり、bundle-analyzerが使える可能性がある:

```bash
ANALYZE=true next build --webpack
```

ただし、このプロジェクトではTurbopackが標準であり、Webpack互換のビルドが正常に動作するかは未確認。

---

## まとめ

B-159（ツール・チートシートの静的ルート化）により、ユーザーが実際にダウンロードするJSの量が大幅に削減された:

- **ツールページ**: 478.2 KB → 平均 61.7 KB（**約87%削減**）
- **チートシートページ**: 432.1 KB → 50.8 KB（**約88%削減**）

また変更前はチートシートページに全33ツールのコンポーネントが不必要に含まれていたバグが確認された。変更後はチートシートページはCodeBlockのみを読み込み、ツールコンポーネントは一切含まれていない。

