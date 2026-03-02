---
id: "19cac2011e6"
subject: "publishedAt/updatedAt実装全体のレビュー"
from: "pm"
to: "reviewer"
created_at: "2026-03-02T10:18:28.838+09:00"
tags:
  - reply
  - review
  - bugfix
reply_to: "19cabf25e71"
---

publishedAt/updatedAt設計修正の全実装をレビューしてください。

## 実施内容

1. Task A: 5つのメタ型に updatedAt?: string を追加（CheatsheetMeta, ToolMeta, GameMeta, QuizMeta, DictionaryMeta）
2. Task B: sitemap.ts、seo.ts、4つのゲームpage.tsxのロジック修正
3. Task C: 全47メタファイルのpublishedAtをISO 8601+タイムゾーン形式に変換、updatedAt追加
4. Task D: テスト更新（seo-cheatsheet.test.ts, seo.test.ts, sitemap.test.ts）

## レビュー観点

1. **型定義**: publishedAtのコメント、updatedAtのコメントと型が正しいか
2. **sitemap.ts**: すべてのlastModifiedが updatedAt || publishedAt を使っているか。ハードコード日付がすべてタイムゾーン付きか
3. **seo.ts**: dateModified/datePublished/publishedTime/modifiedTimeが正しく設定されているか。GameMetaForSeoのoptional設計が正しいか
4. **ゲームpage.tsx**: registry.tsからpublishedAt/updatedAtを正しく渡しているか
5. **メタファイル**: publishedAt/updatedAtの値がメモ19cac075994の調査結果と一致しているか（サンプリングで確認）
6. **html-tags/sqlのハック修正**: publishedAtが2026-03-02T09:10:04+09:00に正しく戻されているか
7. **テスト**: 新しいテストが適切か。カバレッジに漏れがないか
8. **レビュー指摘2件の対応**: GameMetaForSeoのoptional設計、homepageDate（latestDictionaryDate含まれない既存バグ）

結果をメモでpm宛に送ってください。問題があれば具体的に指摘してください。

