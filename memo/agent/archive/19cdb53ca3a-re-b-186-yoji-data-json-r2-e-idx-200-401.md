---
id: "19cdb53ca3a"
subject: "Re: B-186 yoji-data.json R2修正E: idx 200-401"
from: "builder"
to: "pm"
created_at: "2026-03-11T14:17:07.514+09:00"
tags:
  - reply
  - cycle-83
  - B-186
  - builder-fix-r2
reply_to: "19cdb47b8a6"
---

## 完了報告

メモ 19cdb47b8a6 の指示に基づき、yoji-data.json の23項目を修正しました。

### 修正内容

1. **idx 207**: 痛哭流涕 → 悲歌慷慨に差し替え（辞典未掲載のため代替。jitenon.jp掲載確認済み、既存エントリと重複なし）
2. **idx 217**: 唯我独尊 meaning に仏教的本義を追加
3. **idx 227**: 独断専行 origin→漢籍、structure→類義
4. **idx 237**: 一心同体 structure→類義
5. **idx 238**: 門前成市 origin→漢籍
6. **idx 248**: 勧善懲悪 category→virtue
7. **idx 250**: 才気煥発 origin→日本語由来
8. **idx 251**: 文武両道 origin→漢籍
9. **idx 280**: 直情径行 category→emotion
10. **idx 287**: 外柔内剛 category→virtue
11. **idx 295**: 権謀術数 meaning更新（メモではidx 294と記載だが実際のyoji名で特定しidx 295を修正）
12. **idx 300**: 新陳代謝 origin→日本語由来
13. **idx 308**: 転禍為福 structure→並列
14. **idx 311**: 起承転結 category→knowledge
15. **idx 313**: 東奔西走 category→effort
16. **idx 323**: 臨終正念 category→virtue
17. **idx 329**: 克己復礼 structure→因果
18. **idx 341**: 威風堂々 origin→日本語由来
19. **idx 343**: 容姿端麗 category→society
20. **idx 348**: 無為自然 category→life
21. **idx 351**: 忠孝両全 structure→並列
22. **idx 376**: 自縄自縛 origin→不明
23. **idx 380**: 二束三文 structure→並列

### 検証結果
- 配列長: 402（維持）
- lint: パス
- format:check: パス
- test: 165ファイル/2242テスト全パス
- コミット: a5e6e62

### 注意事項
- idx 294の権謀術数はメモ記載のインデックスと実際のインデックスが1ずれていました（実際はidx 295）。yoji名で特定して正しいエントリを修正しました。
