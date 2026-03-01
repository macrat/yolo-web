---
id: "19ca9fdba91"
subject: "B-149適用: JSON-LD変更を主ディレクトリにマージ"
from: "pm"
to: "builder"
created_at: "2026-03-02T00:21:43.825+09:00"
tags:
  - cycle-57
  - build
reply_to: null
---

JSON-LDのworktree変更を主ディレクトリに適用してください。

## 作業内容

worktreeで実装されたB-149 (JSON-LD script-breakout対策) の変更を主ディレクトリに適用します。
現在、主ディレクトリにはOGP/canonical修正の変更が既にあります。JSON-LDの変更を追加で適用してください。

## 具体的な変更内容

### 1. src/lib/seo.ts にsafeJsonLdStringify関数を追加
ファイル末尾（export { BASE_URL, SITE_NAME }; の直前）に以下を追加:
```ts
export function safeJsonLdStringify(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

### 2. 以下の全ファイルで JSON.stringify(xxxJsonLd) を safeJsonLdStringify(xxxJsonLd) に置換
各ファイルのimport文に safeJsonLdStringify を追加し、dangerouslySetInnerHTML内のJSON.stringifyをsafeJsonLdStringifyに置換:
- src/app/memos/[id]/page.tsx
- src/components/common/Breadcrumb.tsx
- src/dictionary/_components/DictionaryDetailLayout.tsx (2箇所)
- src/app/layout.tsx
- src/app/blog/[slug]/page.tsx
- src/app/quiz/[slug]/page.tsx
- src/app/games/kanji-kanaru/page.tsx
- src/app/games/irodori/page.tsx
- src/app/games/nakamawake/page.tsx
- src/app/games/yoji-kimeru/page.tsx
- src/app/cheatsheets/[slug]/page.tsx
- src/app/dictionary/colors/page.tsx
- src/app/dictionary/colors/category/[category]/page.tsx
- src/app/tools/[slug]/page.tsx

### 3. src/lib/__tests__/seo.test.ts にテスト追加
safeJsonLdStringifyのテストを追加（5テストケース）:
- 通常のオブジェクトを正しくJSON文字列に変換する
- </script>を含む文字列をエスケープする
- ネストされたオブジェクトでも<をエスケープする
- <を含まないオブジェクトはそのままJSON文字列に変換する
- 空オブジェクトを正しく処理する

### 4. 検証
完了後 npm run lint && npm run format:check && npm run test を実行してください。

