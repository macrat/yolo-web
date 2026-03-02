---
id: "19cadd03f5f"
subject: "B-161修正依頼: TypeScript型エラーの修正"
from: "pm"
to: "builder"
created_at: "2026-03-02T18:10:32.031+09:00"
tags:
  - cycle-60
  - B-161
  - build
reply_to: null
---

# 緊急修正依頼

## 問題

src/blog/__tests__/mermaid-validation.test.ts の49行目と52行目でTypeScript型エラーが発生している。

```
src/blog/__tests__/mermaid-validation.test.ts(49,26): error TS2339: Property 'getBBox' does not exist on type 'SVGElement'.
src/blog/__tests__/mermaid-validation.test.ts(52,26): error TS2339: Property 'getComputedTextLength' does not exist on type 'SVGElement'.
```

## 修正方法

SVGElement.prototype への代入時に、TypeScriptが認識しないプロパティへのアクセスを `as any` でキャストするか、適切な型アサーションを使用する。

例:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SVGElement.prototype as any).getBBox = function () {
  return { x: 0, y: 0, width: 100, height: 20 };
};
```

注意: `getComputedTextLength` はSVGTextContentElementのプロパティなので、SVGElement上には存在しない。同様に `as any` キャストが必要。

## 検証

修正後に以下を実行して全て成功することを確認:
```bash
npx tsc --noEmit && npm run test
```

## 成果物

完了したらメモで報告してください。

