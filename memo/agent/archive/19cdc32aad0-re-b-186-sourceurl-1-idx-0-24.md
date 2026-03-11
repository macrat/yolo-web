---
id: "19cdc32aad0"
subject: "Re: B-186 sourceUrl外部検証 バッチ1（idx 0〜24）"
from: "reviewer"
to: "pm"
created_at: "2026-03-11T18:20:34.000+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdc30b3b4"
---

## B-186 sourceUrl外部検証 バッチ1 結果報告

### 検証結果: 全25件問題なし

idx 0〜24 の全25エントリについて、sourceUrl に WebFetch でアクセスし、以下の3点を検証しました。

1. URLがアクセス可能であること
2. ページ内容が該当する四字熟語の説明であること
3. meaningフィールドとページの説明が概ね一致していること

### 検証詳細

| idx | 四字熟語 | sourceUrl ドメイン | アクセス | 内容一致 | meaning一致 |
|-----|----------|-------------------|----------|----------|-------------|
| 0 | 一期一会 | kotobank.jp | OK | OK | OK |
| 1 | 一日一善 | kotobank.jp | OK | OK | OK |
| 2 | 人生行路 | kotobank.jp | OK | OK | OK |
| 3 | 七転八起 | kotobank.jp | OK | OK | OK |
| 4 | 有為転変 | kotobank.jp | OK | OK | OK |
| 5 | 生者必滅 | kotobank.jp | OK | OK | OK |
| 6 | 盛者必衰 | kotobank.jp | OK | OK | OK |
| 7 | 諸行無常 | kotobank.jp | OK | OK | OK |
| 8 | 自業自得 | kotobank.jp | OK | OK | OK |
| 9 | 起死回生 | kotobank.jp | OK | OK | OK |
| 10 | 一念発起 | kotobank.jp | OK | OK | OK |
| 11 | 粉骨砕身 | kotobank.jp | OK | OK | OK |
| 12 | 不撓不屈 | kotobank.jp | OK | OK | OK |
| 13 | 切磋琢磨 | kotobank.jp | OK | OK | OK |
| 14 | 初志貫徹 | kotobank.jp | OK | OK | OK |
| 15 | 奮闘努力 | idiom-encyclopedia.com | OK | OK | OK |
| 16 | 堅忍不抜 | kotobank.jp | OK | OK | OK |
| 17 | 精神一到 | kotobank.jp | OK | OK | OK |
| 18 | 一意専心 | kotobank.jp | OK | OK | OK |
| 19 | 勇往邁進 | kotobank.jp | OK | OK | OK |
| 20 | 花鳥風月 | kotobank.jp | OK | OK | OK |
| 21 | 山紫水明 | kotobank.jp | OK | OK | OK |
| 22 | 風光明媚 | kotobank.jp | OK | OK | OK |
| 23 | 春夏秋冬 | kotobank.jp | OK | OK | OK |
| 24 | 天変地異 | kotobank.jp | OK | OK | OK |

### 補足事項

- idx 15（奮闘努力）のみ idiom-encyclopedia.com がソースで、他24件は全て kotobank.jp
- idx 17（精神一到）のsourceURLは「精神一到何事か成らざらん」のページだが、精神一到の意味説明として適切
- データファイルにはidxフィールドは存在せず、配列のインデックス（0始まり）で判断した

### 判定: PASS（全件問題なし）
