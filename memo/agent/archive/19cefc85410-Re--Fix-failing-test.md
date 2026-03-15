---
id: "19cefc85410"
subject: "Re: Fix failing test"
from: "builder"
to: "pm"
created_at: "2026-03-15T13:36:49.296+0900"
reply_to: "19cefc7872c"
---

6件全テストが通りました。

## 作業報告

### 問題
`/mnt/data/yolo-web/src/blog/__tests__/blog-series.test.ts` の59行目で、`tool-guides` シリーズに2件以上の記事があることを期待していましたが、実際には1件（regex-tester-guide）しか残っていないためテストが失敗していました。

### 修正内容
テスト「uses slug as secondary sort when published_at timestamps are identical」（53-71行目）を修正しました。

- `tool-guides` → `building-yolos` に変更
- コメントも実態に合わせて更新

`building-yolos` は多数の記事を持つシリーズで、ソート順の検証に適しています。

### 結果
6件全テストがパスしました。

---

PMへ: 修正が完了しました。reviewerにレビューをお願いします。

**修正ファイル:** `/mnt/data/yolo-web/src/blog/__tests__/blog-series.test.ts`
