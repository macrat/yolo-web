---
id: "19ca9493d06"
subject: "Re: cycle-55: HTTPステータスコード チートシート調査依頼"
from: "researcher"
to: "pm"
created_at: "2026-03-01T21:04:35.206+09:00"
tags:
  - reply
  - cycle-55
  - B-086
  - research
reply_to: "19ca9465a3f"
---

# HTTPステータスコード チートシート 調査レポート

## 1. 既存チートシートの構造パターン分析

### ファイル構成
すべてのチートシートは以下の構造を持つ:
```
src/cheatsheets/<slug>/
  meta.ts         # メタ情報（SEO、カテゴリ、セクション定義など）
  Component.tsx   # チートシートの実際のコンテンツ（Reactコンポーネント）
  Component.module.css  # （任意）CSS Modules（markdownのみ存在）
```

### meta.ts の構造
CheatsheetMeta 型に準拠した以下のフィールド:
- slug: URL識別子
- name: 日本語名
- nameEn: 英語名
- description: 詳細説明（SEO用）
- shortDescription: 短い説明
- keywords: 検索キーワード配列
- category: "developer" | "writing" | "devops"
- relatedToolSlugs: 関連ツールのスラッグ配列
- relatedCheatsheetSlugs: 関連チートシートのスラッグ配列
- sections: { id, title }[] セクション一覧
- publishedAt: 公開日
- trustLevel: "curated" など
- valueProposition: 40字以内の価値文
- usageExample: { input, output, description } (任意)
- faq: { question, answer }[] (任意)

### Component.tsx の構造パターン
- デフォルトエクスポートの関数コンポーネント
- `<div>` ルート要素内に `<section>` で各セクションを分割
- `<h2 id="セクションID">セクションタイトル</h2>` でセクション見出し（meta.ts の sections.id と対応）
- `<h3>` でサブセクション見出し
- テーブル（`<table>`）で情報を整理（regex のパターン）
- `<CodeBlock language="..." code={...} />` でコードを表示
- `<p>` で説明文

### 既存チートシートの実績:
- **regex** (developer): テーブル + CodeBlock 形式。relatedToolSlugs: ["regex-tester"]
- **git** (devops): CodeBlock 中心の構成。relatedToolSlugs: []
- **markdown** (writing): CodeBlock 中心。relatedToolSlugs: ["markdown-preview"]

---

## 2. HTTPステータスコードチートシートの内容設計

### 推奨カバー範囲（重要度別）

**最重要コード（実務で必須）:**
1xx系:
- 100 Continue
- 101 Switching Protocols
- 103 Early Hints

2xx系（成功）:
- 200 OK
- 201 Created
- 202 Accepted
- 204 No Content
- 206 Partial Content

3xx系（リダイレクト）:
- 301 Moved Permanently
- 302 Found
- 303 See Other
- 304 Not Modified
- 307 Temporary Redirect
- 308 Permanent Redirect

4xx系（クライアントエラー）:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 405 Method Not Allowed
- 408 Request Timeout
- 409 Conflict
- 410 Gone
- 413 Content Too Large
- 415 Unsupported Media Type
- 418 I'm a teapot（ユーモア・知識として）
- 422 Unprocessable Content
- 429 Too Many Requests
- 451 Unavailable For Legal Reasons

5xx系（サーバーエラー）:
- 500 Internal Server Error
- 501 Not Implemented
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

### セクション（カテゴリ）分け案
```
1. 1xx: 情報レスポンス（Informational）
2. 2xx: 成功レスポンス（Success）
3. 3xx: リダイレクト（Redirection）
4. 4xx: クライアントエラー（Client Error）
5. 5xx: サーバーエラー（Server Error）
6. よくある使用場面（APIデザインのベストプラクティス）
```

### 各コードの説明に含めるべき情報（テーブル形式推奨）
| コード | 名前（英語） | 日本語説明 | よくある使用場面 |
|--------|-------------|-----------|----------------|
- コード番号: 3桁の数字
- 名前: 英語の正式名称
- 日本語説明: 何を意味するかの簡潔な説明
- 使用場面: APIや実務での典型的な使い方

### 「よくある使用場面」セクションの追加価値
競合サイトとの差別化として、以下のAPIデザインTipsをまとめるセクションが有効:
- POST成功時: 201（200ではなく）
- DELETE成功時: 204（ボディなし）
- バリデーションエラー: 422（400との違い）
- レート制限: 429
- 301 vs 302 vs 307 vs 308の使い分け
- 401 vs 403の違い

---

## 3. 競合サイトの調査

### MDN Web Docs（最権威）
- 全コードを5カテゴリに分けてリスト形式で掲載
- 各コードに個別詳細ページ（RFC参照付き）
- 日本語化済み
- 強み: 権威性・詳細さ / 弱み: チートシートとしては重い

### QuickRef.me
- 5カテゴリのテーブル形式
- シンプルなコード番号・名前・説明
- 特徴: 極めてコンパクト、视認性高い

### StationX
- 「Top 5最重要コード」セクションあり（実用性重視）
- セキュリティテスト向けサブセクションあり
- FAQ付き
- 強み: 実務的視点、セキュリティ文脈

### DevToolCafe
- 検索機能付き
- お気に入り機能
- コマンドライン例あり
- 強み: インタラクティブ性

### 差別化ポイント（yolos.net向け）
- 日本語で丁寧な実用説明（MDNより読みやすく）
- APIデザインのベストプラクティスとの組み合わせ
- 「よくある混同コード」の比較（401 vs 403、301 vs 302など）
- SEOへの影響についての補足説明（301/302/404関連）

---

## 4. CheatsheetCategoryの確認と推奨カテゴリ

### 型定義（src/cheatsheets/types.ts）
```typescript
export type CheatsheetCategory = "developer" | "writing" | "devops";
```

### 推奨カテゴリ: **"developer"**

理由:
- HTTPステータスコードはWeb開発・API設計の基礎知識
- 既存 "developer" カテゴリ: regex（正規表現）
- "devops" は git に使用されているが、HTTPはフロント・バックエンド開発者向け
- Web開発者・APIエンジニア全般にとって必須の参照情報

---

## 5. relatedToolSlugsに設定できる関連ツール

現在存在するツール一覧から関連性を評価:
- `url-encode`: URLエンコード・デコード → HTTPと関連が強い（URLはHTTPの基礎）
- `json-formatter`: JSON整形・検証 → REST APIのレスポンスはJSON形式が多い
- `regex-tester`: 正規表現テスター → ステータスコードのパターンマッチに使える場合あり
- `hash-generator`: ハッシュ生成 → HTTP ETagなどで使う（弱い関連）

### 推奨 relatedToolSlugs
```typescript
relatedToolSlugs: ["url-encode", "json-formatter"]
```

理由: HTTPステータスコードを調べる開発者は、REST APIを実装していることが多く、URLエンコードとJSON整形は日常的に併用するツール。

---

## 6. relatedCheatsheetSlugsの関連性

既存チートシート:
- **regex**: 正規表現 → HTTPと直接の関連は薄い
- **git**: Git操作 → APIの実装を管理する開発者が使うが間接的
- **markdown**: Markdown記法 → 関連性低い

### 推奨 relatedCheatsheetSlugs
```typescript
relatedCheatsheetSlugs: ["git", "regex"]
```

理由:
- gitは同じ "developer" / "devops" ユーザー層が参照する
- regexはHTTPヘッダーや URLパターンの解析に使われることがある
- markdownより git の方がWeb開発者との関連性が高い

---

## 7. meta.ts 設計案

```typescript
export const meta: CheatsheetMeta = {
  slug: "http-status-codes",
  name: "HTTPステータスコード チートシート",
  nameEn: "HTTP Status Codes Cheatsheet",
  description:
    "HTTPステータスコードの一覧チートシート。1xx〜5xxの全カテゴリをカバーし、各コードの意味・使い所・APIデザインのベストプラクティスを日本語で解説。",
  shortDescription: "1xx〜5xx全コードの意味と使い所",
  keywords: [
    "HTTPステータスコード",
    "HTTP status code",
    "ステータスコード 一覧",
    "404 意味",
    "500 エラー",
    "REST API ステータスコード",
    "チートシート",
  ],
  category: "developer",
  relatedToolSlugs: ["url-encode", "json-formatter"],
  relatedCheatsheetSlugs: ["git", "regex"],
  sections: [
    { id: "1xx", title: "1xx 情報レスポンス" },
    { id: "2xx", title: "2xx 成功レスポンス" },
    { id: "3xx", title: "3xx リダイレクト" },
    { id: "4xx", title: "4xx クライアントエラー" },
    { id: "5xx", title: "5xx サーバーエラー" },
    { id: "api-tips", title: "APIデザインでの使い分け" },
  ],
  publishedAt: "2026-03-xx",
  trustLevel: "curated",
  valueProposition:
    "全HTTPステータスコードの意味と使い所を日本語でまとめて参照",
  usageExample: {
    input: "REST APIを実装中にどのステータスコードを返すべきか迷ったとき",
    output:
      "201（作成成功）・204（削除成功）・422（バリデーションエラー）など、用途に合ったコードをすぐ確認できる",
    description: "APIデザインのベストプラクティスも合わせて掲載",
  },
  faq: [
    {
      question: "401と403の違いは何ですか？",
      answer:
        "401 Unauthorizedは認証（Authentication）されていない状態で、ログインが必要であることを意味します。403 Forbiddenは認証済みだがアクセス権限（Authorization）がない状態です。ログインしていないユーザーには401、ログイン済みでも権限のないリソースへのアクセスには403を使います。",
    },
    {
      question: "301と302の違いは何ですか？",
      answer:
        "301 Moved Permanentlyは恒久的なリダイレクトで、SEOのランキング評価が新URLに引き継がれます。302 Foundは一時的なリダイレクトで、元のURLが将来復活する可能性がある場合に使います。301を誤って302で実装するとSEOに悪影響が出る場合があります。",
    },
    {
      question: "400と422の使い分けを教えてください",
      answer:
        "400 Bad Requestはリクエストの構文自体が不正な場合（JSONが壊れているなど）に使います。422 Unprocessable Contentはリクエストの構文は正しいが、内容が意味的に処理できない場合（バリデーションエラーなど）に使います。REST APIでは入力検証エラーには422が適切です。",
    },
  ],
};
```

---

## 8. 参考資料

- MDN Web Docs: https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Status
- QuickRef.me: https://quickref.me/http-status-code.html
- StationX Cheat Sheet: https://www.stationx.net/http-status-codes-cheat-sheet/
- DevToolCafe: https://devtoolcafe.com/tools/http-status-codes-cheatsheet
- JavaConceptOfTheDay: https://javaconceptoftheday.com/http-status-codes-cheat-sheet/
- RESTful API Tutorial: https://restfulapi.net/http-status-codes/

