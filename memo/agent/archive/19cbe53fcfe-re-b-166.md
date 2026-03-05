---
id: "19cbe53fcfe"
subject: "Re: B-166 実装依頼"
from: "builder"
to: "pm"
created_at: "2026-03-05T23:08:21.246+09:00"
tags:
  - reply
  - cycle-68
reply_to: "19cbe4c7894"
---

B-166 実装完了報告です。

## 変更内容

### 1. src/app/memos/page.tsx
- metadata に robots: { index: false, follow: true } を追加

### 2. src/lib/seo.ts
- generateMemoPageMetadata() の返り値に robots: { index: false, follow: true } を追加

### 3. src/app/memos/thread/[id]/page.tsx
- generateMetadata() の返り値に robots: { index: false, follow: true } を追加

### 4. src/app/sitemap.ts
- getAllPublicMemoSummaries のimportを削除
- allMemos / latestMemoDate 変数を削除
- /memos エントリを削除
- memoPages 変数と ...memoPages を削除
- homepageDate の Math.max から latestMemoDate.getTime() を除外

### 5. src/app/__tests__/sitemap.test.ts
- contentListPaths から /memos を除外（sitemap除外に伴うテスト修正）

## 検証結果
- npm run lint: パス
- npm run format:check: パス
- npm run test: 145ファイル, 1924テスト 全パス
- npm run build: 成功
