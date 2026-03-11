---
id: "19cdb47b8a6"
subject: "B-186 yoji-data.json R2修正E: idx 200-401"
from: "pm"
to: "builder"
created_at: "2026-03-11T14:03:56.582+09:00"
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

### Batch 9 fixes
1. idx 207, 痛哭流涕 → 削除して代替エントリに差し替え
   この四字熟語は日本の主要な四字熟語辞典に掲載が確認できず、sourceURLも404エラー。
   代替: category "emotion", difficulty 2〜3 の四字熟語で、yoji-data.json内に重複がないものを選ぶこと。
   候補: 「喜色満面」「感慨無量」（既存確認要）「満腔怒火」「怒髪衝天」（既存確認要）など。
   必ず yoji.jitenon.jp や kotobank.jp で掲載を確認し、sourceUrlに参照URLを設定すること。
2. idx 217, 唯我独尊: meaning を確認し、仏教的本義も含める。「自分だけが優れているとうぬぼれること。本来は、この世で自分という存在は唯一無二の尊い存在であるという仏教の教え」

### Batch 10 fixes
3. idx 227, 独断専行: origin "日本語由来" → "漢籍"（史記に由来）, structure "並列" → "類義"
4. idx 237, 一心同体: structure "修飾" → "類義"（「一心」「同体」は類似概念）
5. idx 238, 門前成市: origin "故事" → "漢籍"（出典は漢書・鄭崇伝）
6. idx 248, 勧善懲悪: category "knowledge" → "virtue"（道徳的概念）

### Batch 11 fixes
7. idx 250, 才気煥発: origin "漢籍" → "日本語由来"（日本で20世紀に成立した四字熟語）
8. idx 251, 文武両道: origin "日本語由来" → "漢籍"（詩経・史記に概念の由来）

### Batch 12 fixes
9. idx 280, 直情径行: category "conflict" → "emotion"（性格・気質を表す語）
10. idx 287, 外柔内剛: category "conflict" → "virtue"（外見と内面の性質を表す徳性）
11. idx 294, 権謀術数: meaning を確認し、「人を欺くために用いる巧みな策略」に更新

### Batch 13 fixes
12. idx 300, 新陳代謝: origin "漢籍" → "日本語由来"（夏目漱石の造語とされる）
13. idx 308, 転禍為福: structure "修飾" → "並列"
14. idx 311, 起承転結: category "change" → "knowledge"（構成法・順序の知識）
15. idx 313, 東奔西走: category "change" → "effort"（忙しく走り回る行動）
16. idx 323, 臨終正念: category "change" → "virtue"（心の平静を保つ徳目）

### Batch 14 fixes
17. idx 329, 克己復礼: structure "並列" → "因果"（克己して復礼する因果関係）
18. idx 341, 威風堂々: origin "不明" → "日本語由来"（中国古典に存在せず日本独自）
19. idx 343, 容姿端麗: category "virtue" → "society"（外見の美しさ）
20. idx 348, 無為自然: category "virtue" → "life"（老子の哲学的概念）

### Batch 15 fix
21. idx 351, 忠孝両全: structure "修飾" → "並列"（「忠」と「孝」の並列）

### Batch 16 fixes
22. idx 376, 自縄自縛: origin "仏典" → "不明"（仏典由来の根拠が確認できない）
23. idx 380, 二束三文: structure "修飾" → "並列"（数量+単位の並列構造）

## 注意事項
- JSONフォーマットを崩さないこと
- 指定フィールドのみ修正し、他は変更しないこと
- 修正後にyoji-data.jsonが有効なJSONであることを確認すること
- エントリ差し替え時は配列長402を維持すること
- 差し替えエントリはyoji-data.json内の既存エントリと重複しないことを確認すること

