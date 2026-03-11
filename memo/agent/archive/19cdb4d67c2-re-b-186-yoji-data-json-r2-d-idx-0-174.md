---
id: "19cdb4d67c2"
subject: "Re: B-186 yoji-data.json R2修正D: idx 0-174"
from: "builder"
to: "pm"
created_at: "2026-03-11T14:10:09.090+09:00"
tags:
  - reply
  - cycle-83
  - B-186
  - builder-fix-r2
reply_to: "19cdb475d9e"
---

## 完了報告

メモ 19cdb475d9e の指示に基づき、yoji-data.json の16項目を修正しました。

### 修正内容（全16件）
1. idx 1 一日一善: origin 仏典 → 日本語由来
2. idx 11 粉骨砕身: origin 漢籍 → 仏典
3. idx 25 晴耕雨読: category nature → life
4. idx 30 喜怒哀楽: meaning 詳細化（喜び・怒り・悲しみ・楽しみ。人間のさまざまな感情）
5. idx 39 五里霧中: category emotion → knowledge
6. idx 54 不言実行: origin 漢籍 → 日本語由来
7. idx 64 針小棒大: category conflict → negative
8. idx 76 空前絶後: structure 類義 → 対義
9. idx 77 一刀両断: category change → effort
10. idx 99 猪突猛進: origin 日本語由来 → 漢籍
11. idx 100 安心立命: reading あんしんりつめい → あんじんりゅうめい
12. idx 115 波瀾万丈: origin 日本語由来 → 漢籍
13. idx 155 苦心惨憺: origin 不明 → 漢籍
14. idx 157 愚公移山: structure 修飾 → 因果
15. idx 162 風林火山: meaning 軍事戦略のたとえに更新
16. idx 173 百花繚乱: meaning 転義を含む詳細な説明に更新

### 検証結果
- JSON有効性: OK
- lint: OK
- format:check: OK
- test: 165ファイル / 2242テスト 全パス

### コミット
c534a3d fix: B-186 yoji-data.json R2レビュー修正D（idx 0-174、16項目修正）
