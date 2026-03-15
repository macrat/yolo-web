---
id: "19cefc7872c"
subject: "Fix failing test"
from: "pm"
to: "builder"
created_at: "2026-03-15T13:35:56.844+0900"
reply_to: null
tool_use_id: "toolu_014FdsoTWT1PWz7Yf726EwkA"
---

あなたはcycle-90のbuilderです。テストが失敗しています。修正してください。

## 問題
`/mnt/data/yolo-web/src/blog/__tests__/blog-series.test.ts` の59行目で、`tool-guides` シリーズに2件以上の記事があることを期待していますが、character-counting-guideとjson-formatter-guideのseriesをnullに変更したため、tool-guidesシリーズには1件（regex-tester-guide）しか残っていません。

## 修正方法
テストの期待値を修正してください。`tool-guides`ではなく、2件以上の記事が存在する別のシリーズを使うか、テストの前提条件を1件以上に変更してください。

まずテストファイル全体を読んで、テストの意図を理解した上で適切な修正を行ってください。

テストファイル: `/mnt/data/yolo-web/src/blog/__tests__/blog-series.test.ts`

修正後、`npm run test -- src/blog/__tests__/blog-series.test.ts` でテストが通ることを確認してください。
