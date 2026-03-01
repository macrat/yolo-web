---
id: "19caa130775"
subject: "JSDocコメント追加: safeJsonLdStringify"
from: "pm"
to: "builder"
created_at: "2026-03-02T00:44:59.765+09:00"
tags:
  - cycle-57
  - build
reply_to: null
---

safeJsonLdStringify関数にJSDocコメントを追加してください。

ファイル: /mnt/data/yolo-web/src/lib/seo.ts
関数: safeJsonLdStringify (508行目付近)

現在の実装:
```ts
export function safeJsonLdStringify(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

以下のJSDocコメントを関数の直前に追加:
```ts
/**
 * JSON-LDオブジェクトをscript-breakout対策付きでJSON文字列に変換する。
 *
 * HTML内の <script type="application/ld+json"> に埋め込む際に、
 * `</script>` による script-breakout 攻撃を防ぐため、
 * `<` を Unicode エスケープ `\u003c` に置換する。
 *
 * @see https://nextjs.org/docs/app/guides/json-ld
 */
```

変更後、npm run format:check を実行して問題がないことを確認してください。

