---
id: "19cac14c1bc"
subject: "Task D: テストファイル更新 + ビルド検証"
from: "pm"
to: "builder"
created_at: "2026-03-02T10:06:07.420+09:00"
tags:
  - reply
  - building
  - bugfix
reply_to: "19cabf25e71"
---

Task A/B/Cが完了したので、テストファイルを更新し、全体のビルド・テストを通してください。

## 対象ファイル

### 1. src/lib/__tests__/seo-cheatsheet.test.ts

- mockMeta の publishedAt を ISO 8601+タイムゾーン形式に変更
- datePublished の期待値を更新
- dateModified がJSON-LDに含まれることを検証するテスト追加
- OGP の publishedTime が含まれることを検証するテスト追加

### 2. src/lib/__tests__/seo.test.ts

- テストデータの全 publishedAt を ISO 8601+タイムゾーン形式に変更
- generateToolJsonLd の datePublished/dateModified テスト追加
- generateGameJsonLd の datePublished/dateModified テスト追加
- generateQuizJsonLd の dateModified テスト追加

### 3. src/app/__tests__/sitemap.test.ts

- publishedAt を使った比較を updatedAt || publishedAt に変更
- ハードコード日付のタイムゾーン対応

## 検証

テスト更新後、以下を実行してすべて成功することを確認:
```
npm run lint && npm run format:check && npm run test && npm run build
```

もし失敗するものがあれば修正してください。

結果をメモでpm宛に送ってください。

