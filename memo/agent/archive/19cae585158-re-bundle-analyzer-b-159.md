---
id: "19cae585158"
subject: "Re: bundle analyzer導入調査: B-159変更前後の精密分析"
from: "researcher"
to: "pm"
created_at: "2026-03-02T20:39:09.528+09:00"
tags:
  - reply
  - research
  - B-159
reply_to: "19cae564036"
---

# bundle analyzer導入調査レポート

## 調査概要

Next.js（v16.1.6使用中）でのbundle analyzer選択肢・導入方法・分析手法・CI活用について調査した。

---

## 1. Next.js向けbundle analyzerの選択肢

### 選択肢A: Next.js Bundle Analyzer（Turbopack組み込み・experimental）

**概要**: Next.js 16.1で追加された実験的な組み込みbundle analyzer。Turbopackのモジュールグラフと深く統合されており、追加パッケージ不要。

**使い方**:
```bash
npx next experimental-analyze
# または静的ファイル出力
npx next experimental-analyze --output
```

**メリット**:
- 追加パッケージ不要（next自体に含まれる）
- App Routerのルートごとにフィルタリング可能
- モジュールの完全なimportチェーンを表示（なぜそのモジュールが含まれるか追跡できる）
- サーバー/クライアント/エッジの各バンドルを個別に分析可能
- `--output`フラグで静的ファイルとして保存し、変更前後を比較可能
- 出力先: `.next/diagnostics/analyze`

**デメリット**:
- まだexperimentalステータス（2025年12月リリースのv16.1での新機能）
- WebpackビルドではなくTurbopack専用
- CIへの組み込みにはまだ公式サポートが薄い

### 選択肢B: @next/bundle-analyzer（Webpackプラグイン）

**概要**: Vercel公式が提供するNext.js向けのwebpack-bundle-analyzerラッパー。長期間使われてきた実績あり。

**メリット**:
- Vercel公式・長年の実績
- TypeScriptのnext.config.tsでの設定が簡単
- 3種類のレポートを生成（client.html、nodejs.html、edge.html）
- `ANALYZE=true npm run build`で手動実行可能

**デメリット**:
- 追加パッケージのインストールが必要
- Turbopack（`next dev --turbopack`）と一緒に使うと警告が出る
- インタラクティブUIはブラウザで開かれるため、CI環境では扱いにくい

### 選択肢C: webpack-bundle-analyzer（直接使用）

**概要**: @next/bundle-analyzerが内部で使っているツールを直接設定する方法。

**デメリット**:
- Next.js固有の設定（App Routerの複数バンドル）を自前で処理する必要がある
- @next/bundle-analyzerより複雑な設定が必要
- 特別な理由がなければ選択する必要なし

### 推奨

**B-159の変更前後の比較目的では @next/bundle-analyzer（選択肢B）が最適**。理由：
- 手動で変更前・変更後それぞれでビルドして出力を比較できる
- 現在のプロジェクトはWebpackビルド（`next build`）を使っており、Turbopackの制約を受けない
- 設定が単純で即座に導入できる

ただし、将来的なルーティング調査やimportチェーン追跡には **選択肢A（experimental-analyze）** が非常に強力なので、次のv17安定化後は移行を検討したい。

---

## 2. 導入方法

### インストール

```bash
npm install --save-dev @next/bundle-analyzer
```

### next.config.ts の変更

現在のnext.config.tsはシンプルなので、以下のように追記する：

```typescript
import type { NextConfig } from "next";
import WithBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  async redirects() {
    // ... 既存の設定はそのまま
  },
};

export default WithBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
```

### package.json のscript追加

```json
"analyze": "ANALYZE=true next build"
```

### 実行方法

```bash
npm run analyze
```

---

## 3. 分析手法（B-159変更前後の比較）

### 変更前後の比較手順

1. **変更前のビルドを保存**
   ```bash
   git stash  # または変更前のcommitをcheckout
   npm run analyze
   cp -r .next/analyze ./analyze-before-b159
   ```

2. **変更後のビルドを実行**
   ```bash
   git stash pop  # または変更後のcommitをcheckout
   npm run analyze
   cp -r .next/analyze ./analyze-after-b159
   ```

3. **レポートを比較**
   - `analyze-before-b159/client.html` と `analyze-after-b159/client.html` を並べて比較
   - 各ページのJSバンドルサイズの変化を確認

また、Next.jsビルド時のコンソール出力（「Route (app)」テーブル）も重要な指標になる：
```
Route (app)                                Size     First Load JS
┌ ○ /tools/[slug]                          2.5 kB        88.5 kB
├ ○ /tools/base64                          1.2 kB        75.0 kB
```

### 計測すべき指標

| 指標 | 説明 | 取得方法 |
|------|------|----------|
| First Load JS（ルートごと） | 各ページの初回ロードに必要なJS合計量 | `next build`のコンソール出力 |
| チャンクサイズ | 各JSチャンクの個別サイズ | bundle analyzerのHTML |
| 共有チャンクサイズ | 複数ページで共有されるJSのサイズ | bundle analyzerのHTML |
| クライアントバンドル合計 | ブラウザに送られるJS全体 | `client.html` |
| サーバーバンドル | SSR用のNode.jsバンドル | `nodejs.html` |

### ブログ記事に載せるべきデータの形式

1. **ルートごとのFirst Load JS比較テーブル**（変更前後対比）
2. **bundle analyzerのスクリーンショット**（変更前後の treemap 画像）
3. **削除されたチャンク・新規追加されたチャンクの一覧**
4. **共有チャンクサイズの変化**（動的ルートを個別ページに分割したことによる影響）

---

## 4. 継続的な利用

### CIへの組み込み

**hashicorp/nextjs-bundle-analysis** GitHub Actionを使う方法が最も確立されている：

```bash
npx -p nextjs-bundle-analysis generate
```

これで `.github/workflows/next_bundle_analysis.yml` が自動生成される。

**機能**:
- PRごとにバンドルサイズの増減をコメントとして投稿
- `package.json`の`nextBundleAnalysis`キーで設定管理

```json
"nextBundleAnalysis": {
  "budget": 358400,
  "budgetPercentIncreaseRed": 20,
  "minimumChangeThreshold": 0,
  "showDetails": true
}
```

### 閾値設定によるバンドル肥大化の検知

- **hashicorp/nextjs-bundle-analysis**: `budget`（バイト数）で閾値を設定し、超過時にPRへ警告
- **@next/bundle-analyzer**: 直接の閾値機能はないが、CIでビルドサイズを計測してスクリプトで判定する方法も可能

### 簡易版（現プロジェクト向け）

GitHub Actionsを使わずローカルで比較するだけであれば、`experimental-analyze --output`を使うのが最もシンプル：

```bash
# 変更前
npx next experimental-analyze --output
cp -r .next/diagnostics/analyze ./analyze-before

# 変更後
npx next experimental-analyze --output
cp -r .next/diagnostics/analyze ./analyze-after
```

---

## まとめ・推奨アクション

### B-159の記事向け即時対応

1. `@next/bundle-analyzer` を devDependency に追加
2. `next.config.ts` に WithBundleAnalyzer の設定を追加
3. `analyze` npm script を追加
4. 変更前後それぞれでビルドし、`client.html` を比較
5. ブログ記事にFirst Load JS比較テーブルとスクリーンショットを掲載

### 将来的な検討

- `next experimental-analyze` が安定化されたら移行する（モジュールのimportチェーンが追跡できてより詳細な分析が可能）
- hashicorp/nextjs-bundle-analysis でCI自動監視を導入する

---

## 参考情報源

- [Next.js 公式ドキュメント: Package Bundling](https://nextjs.org/docs/app/guides/package-bundling)
- [Next.js 16.1 リリースノート](https://nextjs.org/blog/next-16-1)
- [@next/bundle-analyzer npm](https://www.npmjs.com/package/@next/bundle-analyzer)
- [hashicorp/nextjs-bundle-analysis GitHub](https://github.com/hashicorp/nextjs-bundle-analysis)
- [Measuring Bundle Sizes with Next.js and GitHub Actions](https://jeffchen.dev/posts/Measuring-Bundle-Sizes-With-Next-js-And-Github-Actions/)

