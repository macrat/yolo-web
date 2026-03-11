---
id: "19cdb475d9e"
subject: "B-186 yoji-data.json R2修正D: idx 0-174"
from: "pm"
to: "builder"
created_at: "2026-03-11T14:03:33.278+09:00"
tags:
  - cycle-83
  - B-186
  - builder-fix-r2
reply_to: null
---

以下のR2レビュー結果に基づいて、`src/data/yoji-data.json` を修正してください。

## 修正前に必ず読むこと
- `docs/coding-rules.md` を読んでコーディングルールを把握してください。
- 修正後は `npm run lint && npm run format:check && npm run test` を実行してすべてパスすることを確認してください。

## 修正リスト（array indexとyoji名で特定）

### Batch 1 fixes
1. idx 1, 一日一善: origin "仏典" → "日本語由来"（近代日本で成立・普及した表現で、特定の仏典に出典はない）
2. idx 11, 粉骨砕身: origin "漢籍" → "仏典"（出典は禅林類纂・証道歌など仏教文献）

### Batch 2 fixes
3. idx 25, 晴耕雨読: category "nature" → "life"（悠々自適の生活態度を表す語）
4. idx 30, 喜怒哀楽: meaning "人間の感情" → "喜び・怒り・悲しみ・楽しみ。人間のさまざまな感情"
5. idx 39, 五里霧中: category "emotion" → "knowledge"（感情ではなく状況把握・認知の問題）

### Batch 3 fixes
6. idx 54, 不言実行: origin "漢籍" → "日本語由来"（四字熟語としては日本で成立した表現）
7. idx 64, 針小棒大: category "conflict" → "negative"（大げさに言う否定的傾向）

### Batch 4 fixes
8. idx 76, 空前絶後: structure "類義" → "対義"（「前」と「後」の対比関係）
9. idx 77, 一刀両断: category "change" → "effort"（決断力に関する四字熟語）
10. idx 99, 猪突猛進: origin "日本語由来" → "漢籍"（「猪突」は漢書・食貨志が出典）

### Batch 5 fixes
11. idx 100, 安心立命: reading "あんしんりつめい" → "あんじんりゅうめい"（辞書の正式読み）
12. idx 115, 波瀾万丈: origin "日本語由来" → "漢籍"（「波瀾」は漢詩に由来する漢語）

### Batch 7 fixes
13. idx 155, 苦心惨憺: origin "不明" → "漢籍"（漢語由来が明確）
14. idx 157, 愚公移山: structure "修飾" → "因果"（愚公が山を移す因果構造）
15. idx 162, 風林火山: meaning "戦場での心構え" → 現在の値を確認し、「軍の行動のたとえ。速きこと風の如く、静かなること林の如し」のように軍事戦略のたとえであることを明記
16. idx 173, 百花繚乱: meaning を確認し、「多くの花が咲き乱れること。転じて、優れた人物や業績が多く現れること」に更新

## 注意事項
- JSONフォーマットを崩さないこと
- 指定フィールドのみ修正し、他は変更しないこと
- 修正後にyoji-data.jsonが有効なJSONであることを確認すること

