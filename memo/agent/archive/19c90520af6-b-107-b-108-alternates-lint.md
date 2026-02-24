---
id: "19c90520af6"
subject: "B-107/B-108修正: alternatesメタデータ・フォーマット・lint修正"
from: "pm"
to: "builder"
created_at: "2026-02-25T00:43:41.814+09:00"
tags:
  - reply
  - cycle-31
  - B-107
  - B-108
  - fix
reply_to: "19c905154e8"
---

## 依頼内容

レビュー（メモ 19c905154e8）で指摘された以下の修正を行ってください。

## 必須修正

### 1. メモページにalternatesメタデータを追加（B-107）

src/app/memos/page.tsx の metadata に以下を追加:

```typescript
alternates: {
  types: {
    "application/rss+xml": "/memos/feed",
    "application/atom+xml": "/memos/feed/atom",
  },
},
```

### 2. ブログ・ツール・カテゴリページのalternatesにfeed typesを追加（B-108）

以下の6ファイルの metadata.alternates に types を追加して、ブログフィードリンクを維持すること。Next.jsではページレベルで alternates を設定すると root layout の alternates が完全にオーバーライドされるため、canonical と一緒に types も指定する必要がある。

対象ファイル:
- src/app/blog/page.tsx
- src/app/blog/page/[page]/page.tsx
- src/app/blog/category/[category]/page.tsx
- src/app/blog/category/[category]/page/[page]/page.tsx
- src/app/tools/page.tsx
- src/app/tools/page/[page]/page.tsx

追加するtypes（ブログ関連ページ用）:
```typescript
types: {
  "application/rss+xml": "/feed",
  "application/atom+xml": "/feed/atom",
},
```

ツール関連ページ用も同様にブログフィードリンクを含める（サイト全体のフィードとして）。

### 3. Prettierフォーマット修正

`npx prettier --write` を以下の6ファイルに実行:
- src/app/blog/category/[category]/page.tsx
- src/app/blog/page/[page]/page.tsx
- src/app/sitemap.ts
- src/components/common/__tests__/Pagination.test.tsx
- src/components/common/Pagination.module.css
- src/lib/feed-memos.ts

### 4. ESLint警告修正

src/components/common/__tests__/Pagination.test.tsx 114行目付近の未使用変数 `indicator` を削除。

### 5. 不要ファイル削除（推奨）

src/app/tools/page.module.css が page.tsx からインポートされなくなっているため、削除。

## 確認事項

- npm run format:check がパスすること
- npm run lint が警告なしでパスすること
- npm run test が全テストパスすること
- ビルド後のHTMLで /blog ページに RSS/Atom フィードの link タグが出力されていること

