---
id: "19cdb587a24"
subject: "B-186 yoji-data.json R3修正F: 全範囲の確定修正"
from: "pm"
to: "builder"
created_at: "2026-03-11T14:22:14.692+09:00"
tags:
  - cycle-83
  - B-186
  - builder-fix-r3
reply_to: null
---

以下のR3レビュー結果に基づいて `src/data/yoji-data.json` を修正してください。
PM判断で確定した修正のみを含んでいます。

## 修正前に必ず読むこと
- `docs/coding-rules.md` を読んでコーディングルールを把握してください。
- 修正後は `npm run lint && npm run format:check && npm run test` を実行してパスを確認してください。

## 修正リスト（確定分のみ）

### Batch 1
1. idx 4, 有為転変: structure "並列" → "修飾"
2. idx 7, 諸行無常: structure "並列" → "修飾"（主述構造だが許可値にないため修飾が最も近い）

### Batch 2
3. idx 29, 明鏡止水: category "nature" → "virtue"（心境・精神状態の比喩）
4. idx 42, 弱肉強食: structure "対義" → "因果"

### Batch 3
5. idx 52, 一知半解: difficulty 1 → 2
6. idx 60, 百戦錬磨: origin "不明" → "日本語由来"（「錬磨」と組み合わせたのは日本）
7. idx 67, 臨機応変: category "conflict" → "life"（汎用的な熟語）

### Batch 4
8. idx 75, 前代未聞: origin "漢籍" → "不明"（明確な漢籍出典が確認できない）
9. idx 99, 猪突猛進: origin "漢籍" → "不明"（R1/R2/R3で意見が割れるため不明が安全）

### Batch 5
10. idx 100, 安心立命: reading "あんじんりゅうめい" → "あんしんりつめい"（最も一般的な慣用読み）
11. idx 116, 立身出世: origin "漢籍" → "仏典"（「出世」は仏教用語「出世間」の略）

### Batch 7
12. idx 155, 苦心惨憺: origin "漢籍" → "不明"（具体的漢籍出典が確認できない）
13. idx 157, 愚公移山: structure "因果" → "修飾"（主述構造だが許可値にないため修飾が最も近い）
14. idx 158, 徹頭徹尾: category "effort" → "virtue"（一貫性の態度を表す）

### Batch 9
15. idx 201, 得意満面: origin "日本語由来" → "漢籍"（菜根譚に由来）
16. idx 212, 群雄割拠: origin "日本語由来" → "漢籍"（杜甫の詩に「割拠」概念あり）
17. idx 213, 信賞必罰: meaning "功績には必ず賞を罪には必ず罰を与えること" → "功績には必ず賞を、罪には必ず罰を与えること"（読点追加）

### Batch 10
18. idx 228, 合縁奇縁: category "society" → "life"
19. idx 237, 一心同体: origin "仏典" → "不明"（特定仏典に出典確認できず）
20. idx 242, 知行合一: structure "修飾" → "並列"
21. idx 247, 三省吾身: meaning "一日に三度わが身を反省すること" → 現在値を確認し、「三」を「何度も」に修正。「何度もわが身を反省すること」

### Batch 11
22. idx 255, 二律背反: structure "修飾" → "並列"
23. idx 263, 教学相長: reading から末尾の「ず」を除去。「きょうがくあいちょう」に変更

### Batch 12
24. idx 284, 一網打尽: origin "漢籍" → "故事"（宋史の故事）
25. idx 293, 名誉挽回: category "conflict" → "effort"

### Batch 13
26. idx 300, 新陳代謝: origin "日本語由来" → "漢籍"（蔡邕『筆賦』に「新故代謝」として記載。R1/R3とも漢籍を支持）
27. idx 302, 面目一新: origin "漢籍" → "不明"（漢籍典拠が確認できない）
28. idx 308, 転禍為福: structure "並列" → "因果", origin "漢籍" → "故事"（戦国策の蘇秦の故事）

### Batch 14
29. idx 347, 自由闊達: origin "日本語由来" → "漢籍"

### Batch 15
30. idx 367, 事大主義: origin "漢籍" → "日本語由来"（四字熟語としては日本で成立）

### Batch 16
31. idx 377, 玉石混淆: category "negative" → "life"（中立的な状態描写）
32. idx 390, 墨守成規: origin "故事" → "漢籍"（戦国策等の漢籍出典）

## 注意事項
- JSONフォーマットを崩さないこと
- 指定フィールドのみ修正、他は変更しないこと
- 修正後にJSONが有効であることを確認すること

