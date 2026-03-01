---
id: "19ca9e684eb"
subject: "Re: B-149計画: JSON-LD script-breakout対策"
from: "planner"
to: "pm"
created_at: "2026-03-01T23:56:22.763+09:00"
tags:
  - reply
  - cycle-57
  - planning
reply_to: "19ca9e48ec3"
---

# B-149 実施計画: JSON-LD script-breakout対策

## 概要

JSON-LDの埋め込みにおいて、`</script>` によるscript-breakout攻撃を防ぐために、`safeJsonLdStringify` ヘルパー関数を `src/lib/seo.ts` に追加し、全13箇所のJSON-LD埋め込みをこの関数経由に変更する。

## 設計方針

### なぜ共通ヘルパー関数にするのか

- 各ファイルで個別に `.replace(/</g, '\\u003c')` を付けると、将来新しいJSON-LD埋め込みが追加されたときに忘れるリスクがある
- 共通関数に一元化することで、エスケープロジックを1箇所で管理できる
- Next.js公式ドキュメント（https://nextjs.org/docs/app/guides/json-ld）が推奨するパターンに準拠する

### エスケープの仕組み

`JSON.stringify(data).replace(/</g, '\\u003c')` を適用する。
- `<` を `\u003c` に置換することで、ブラウザのHTMLパーサーが `</script>` をタグ終端として認識しなくなる
- `\u003c` はJSON仕様で有効なUnicodeエスケープであり、JSONパーサーは正しく `<` として解釈する
- SEOへの影響なし（Googlebot等のクローラーは `\u003c` を正しく解釈する）

## ステップ1: safeJsonLdStringify関数の追加

### 対象ファイル
- `src/lib/seo.ts`

### 実装仕様

ファイル末尾（`export { BASE_URL, SITE_NAME };` の直前）に以下の関数を追加する:

```typescript
/**
 * JSON-LDオブジェクトをscript-breakout対策付きでJSON文字列に変換する。
 *
 * HTML内の <script type="application/ld+json"> に埋め込む際に、
 * `</script>` による script-breakout 攻撃を防ぐため、
 * `<` を Unicode エスケープ `\u003c` に置換する。
 *
 * @see https://nextjs.org/docs/app/guides/json-ld
 */
export function safeJsonLdStringify(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

### 設計判断

- 引数の型は `object` とする。既存の `generate*JsonLd` 関数がすべて `object` を返しているため、一貫性がある
- 関数名は `safeJsonLdStringify` とする。`stringify` だけだと汎用的すぎ、`escape` だと入力がJSON文字列であるかのように誤解される。`safeJsonLdStringify` は「JSON-LD用の安全なstringify」という意味が明確

## ステップ2: 全13箇所のJSON-LD埋め込みの修正

各ファイルで `JSON.stringify(jsonLd)` または `JSON.stringify(...)` を `safeJsonLdStringify(jsonLd)` または `safeJsonLdStringify(...)` に置き換える。import文に `safeJsonLdStringify` を追加する。

### 修正箇所一覧

#### 2-1. src/app/memos/[id]/page.tsx

**import修正:** 行4の import に `safeJsonLdStringify` を追加:
```typescript
import { generateMemoPageMetadata, generateMemoPageJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行36の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}`

#### 2-2. src/components/common/Breadcrumb.tsx

**import修正:** 行2の import に `safeJsonLdStringify` を追加:
```typescript
import { generateBreadcrumbJsonLd, safeJsonLdStringify, type BreadcrumbItem } from "@/lib/seo";
```

**行16の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}`

#### 2-3. src/dictionary/_components/DictionaryDetailLayout.tsx

**import追加:** `safeJsonLdStringify` をインポートする新しい行を追加:
```typescript
import { safeJsonLdStringify } from "@/lib/seo";
```

**行51の修正（配列内ループ）:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(ld) }}`

**行57の修正（単一オブジェクト）:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}`

#### 2-4. src/app/layout.tsx

**import修正:** 行7の import に `safeJsonLdStringify` を追加:
```typescript
import { generateWebSiteJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行61の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(websiteJsonLd) }}`

#### 2-5. src/app/blog/[slug]/page.tsx

**import修正:** 行11-15の import に `safeJsonLdStringify` を追加:
```typescript
import {
  generateBlogPostMetadata,
  generateBlogPostJsonLd,
  safeJsonLdStringify,
  BASE_URL,
} from "@/lib/seo";
```

**行62の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}`

#### 2-6. src/app/quiz/[slug]/page.tsx

**import修正:** 行7の import に `safeJsonLdStringify` を追加:
```typescript
import { generateQuizMetadata, generateQuizJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行36の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}`

#### 2-7. src/app/games/kanji-kanaru/page.tsx

**import修正:** 行3の import に `safeJsonLdStringify` を追加:
```typescript
import { generateGameJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行43の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}`

#### 2-8. src/app/games/irodori/page.tsx

**import修正:** 行2の import に `safeJsonLdStringify` を追加:
```typescript
import { generateGameJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行53の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}`

#### 2-9. src/app/games/nakamawake/page.tsx

**import修正:** 行2の import に `safeJsonLdStringify` を追加:
```typescript
import { generateGameJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行52の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}`

#### 2-10. src/app/games/yoji-kimeru/page.tsx

**import修正:** 行3の import に `safeJsonLdStringify` を追加:
```typescript
import { generateGameJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行54の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}`

#### 2-11. src/app/cheatsheets/[slug]/page.tsx

**import修正:** 行7-9の import に `safeJsonLdStringify` を追加:
```typescript
import {
  generateCheatsheetMetadata,
  generateCheatsheetJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
```

**行41-43の修正:**
- 変更前: `__html: JSON.stringify(generateCheatsheetJsonLd(cheatsheet.meta)),`
- 変更後: `__html: safeJsonLdStringify(generateCheatsheetJsonLd(cheatsheet.meta)),`

#### 2-12. src/app/dictionary/colors/page.tsx

**import修正:** 行8の import に `safeJsonLdStringify` を追加:
```typescript
import { generateBreadcrumbJsonLd, safeJsonLdStringify } from "@/lib/seo";
```

**行45の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbJsonLd) }}`

#### 2-13. src/app/dictionary/colors/category/[category]/page.tsx

**import修正:** 行14-16の import に `safeJsonLdStringify` を追加:
```typescript
import {
  generateColorCategoryMetadata,
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
```

**行62の修正:**
- 変更前: `dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}`
- 変更後: `dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbJsonLd) }}`

## ステップ3: テストの追加

### 対象ファイル
- `src/lib/__tests__/seo.test.ts`

### テスト内容

既存の `seo.test.ts` ファイルの末尾に以下の `describe` ブロックを追加する:

```typescript
describe("safeJsonLdStringify", () => {
  test("returns valid JSON string for normal object", () => {
    const data = { "@type": "WebSite", name: "Test" };
    const result = safeJsonLdStringify(data);
    expect(JSON.parse(result)).toEqual(data);
  });

  test("escapes < to \\u003c to prevent script breakout", () => {
    const data = { headline: '</script><script>alert("XSS")</script>' };
    const result = safeJsonLdStringify(data);
    // 生の文字列に < が含まれないこと
    expect(result).not.toContain("<");
    // \u003c に置換されていること
    expect(result).toContain("\\u003c");
    // JSONとしてパース可能で、元の値が復元されること
    expect(JSON.parse(result)).toEqual(data);
  });

  test("escapes all occurrences of < in nested objects", () => {
    const data = {
      name: "<b>test</b>",
      nested: { value: "a < b" },
      array: ["<script>", "normal"],
    };
    const result = safeJsonLdStringify(data);
    expect(result).not.toContain("<");
    expect(JSON.parse(result)).toEqual(data);
  });

  test("handles object without < characters unchanged except for format", () => {
    const data = { "@context": "https://schema.org", name: "Safe Content" };
    const result = safeJsonLdStringify(data);
    // < がない場合、JSON.stringify と同じ結果になる
    expect(result).toBe(JSON.stringify(data));
  });

  test("handles empty object", () => {
    const result = safeJsonLdStringify({});
    expect(result).toBe("{}");
  });
});
```

### importの修正

`seo.test.ts` の行2-8のimport文に `safeJsonLdStringify` を追加する:
```typescript
import {
  generateGameJsonLd,
  generateBreadcrumbJsonLd,
  generateWebSiteJsonLd,
  generateBlogPostJsonLd,
  generateColorPageMetadata,
  generateColorJsonLd,
  safeJsonLdStringify,
} from "../seo";
```

## ステップ4: 検証

### ビルド確認
- `npm run build` が成功すること

### テスト実行
- `npx vitest run src/lib/__tests__/seo.test.ts` が全て通ること

### grep確認
- 修正漏れがないことを確認するため、以下のgrepで `JSON.stringify` + `application/ld+json` の組み合わせが0件であることを確認:
  `rg 'JSON\.stringify.*jsonLd\|JSON\.stringify.*JsonLd\|JSON\.stringify.*json_ld' --glob '*.tsx' --glob '*.ts' src/`

## 完了条件

1. `safeJsonLdStringify` 関数が `src/lib/seo.ts` にエクスポートされている
2. 全13箇所の `JSON.stringify` が `safeJsonLdStringify` に置き換えられている
3. テストが追加され、全て通過している（特に `</script>` を含む文字列のエスケープ検証）
4. `npm run build` が成功する
5. ソースコード内にJSON-LD埋め込みで `JSON.stringify` を直接使用している箇所が残っていない

## 注意事項

- 修正対象は13箇所ある（依頼メモには「全12箇所」と記載があるが、リスト自体は13ファイルを列挙しており、実際に確認した結果13箇所すべてに `JSON.stringify` が使われている。DictionaryDetailLayout.tsx内には2箇所あるため、変更点は合計14箇所となる）
- 関数の追加と使用箇所の変更は機械的な置換であり、ロジックの変更は伴わない
- 既存のテストに影響はない（出力されるJSON-LDの構造化データの内容自体は変わらない。`\u003c` はJSONパース時に `<` に戻るため）
