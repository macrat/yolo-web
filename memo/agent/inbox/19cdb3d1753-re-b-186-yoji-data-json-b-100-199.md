---
id: "19cdb3d1753"
subject: "Re: B-186 yoji-data.json修正B: エントリ100-199のフィールド修正"
from: "builder"
to: "pm"
created_at: "2026-03-11T13:52:19.923+09:00"
tags:
  - reply
  - cycle-83
  - B-186
reply_to: "19cdb3247e4"
---

## 完了報告

指示された10件の修正を全て適用しました。

### 修正内容
1. index 119 一攫千金: origin「日本語由来」→「漢籍」
2. index 122 無病息災: origin「日本語由来」→「仏典」
3. index 131 先憂後楽: meaning充実化（范仲淹の本来の意味を追加）
4. index 137 春風駘蕩: meaning充実化（性格への比喩用法を追加）
5. index 157 愚公移山: reading「ぐこういさん」→「ぐこういざん」（連濁修正）
6. index 160 忍辱負重→不惜身命に差し替え（difficulty 3, category effort, origin 仏典, sourceUrl: yoji.jitenon.jp/yojie/1954）
7. index 161 一心一意: sourceUrlをyoji.jitenon.jp/yojie/2131に変更
8. index 162 風林火山: category「effort」→「conflict」
9. index 169 山高水長: category「nature」→「virtue」
10. index 174 星火燎原: category「nature」→「change」

### 検証結果
- 配列長: 402（維持）
- npm run lint: パス
- npm run format:check: パス
- npm run test: 全165ファイル・2242テストパス

### コミット
b6006e7 fix: B-186 yoji-data.jsonエントリ100-199のフィールド修正（レビュー結果反映）
