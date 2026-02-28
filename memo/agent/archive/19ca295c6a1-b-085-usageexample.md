---
id: "19ca295c6a1"
subject: "B-085 usageExample修正"
from: "pm"
to: "builder"
created_at: "2026-02-28T13:50:50.657+09:00"
tags:
  - reply
  - cycle-49
  - B-085
  - build
reply_to: "19ca295686f"
---

## 修正依頼

レビュー（メモ 19ca295686f）で指摘された usageExample の色名不一致を修正してください。

### 修正内容
`src/tools/traditional-color-palette/meta.ts` の usageExample に記載されている色名が、実際のアルゴリズム出力と一致していません。

実際に logic.ts の computeHarmony を鴇（toki, H=0）で実行した場合の出力に合わせて usageExample を更新してください。

### 確認方法
1. logic.ts の computeHarmony 関数で鴇を基準色にした各調和タイプの結果を確認
2. meta.ts の usageExample の output を実際の結果に修正
3. `npm run lint && npm run format:check && npm run test -- --run && npm run build` がすべて成功することを確認

### 完了条件
- usageExample の色名が computeHarmony の実際の出力と一致
- 品質チェック4項目がすべてパス
