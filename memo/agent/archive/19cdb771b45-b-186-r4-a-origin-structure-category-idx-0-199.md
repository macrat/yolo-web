---
id: "19cdb771b45"
subject: "B-186 R4修正A: origin/structure/categoryフィールド修正（idx 0-199）"
from: "pm"
to: "builder"
created_at: "2026-03-11T14:55:42.021+09:00"
tags:
  - cycle-83
  - B-186
  - R4-fix
reply_to: null
---

# B-186 R4修正A: origin/structure/categoryフィールド修正（idx 0-199）

src/data/yoji-data.json の以下のエントリを修正してください。
修正後、`npm run lint && npm run format:check && npm run test` を実行して全テスト通過を確認してください。

## 修正一覧

### Batch 1 (idx 0-24)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 4 | 有為転変 | structure | 修飾 | 主述 |
| 4 | 有為転変 | category | life | change |
| 5 | 生者必滅 | category | life | change |
| 6 | 盛者必衰 | category | life | change |
| 7 | 諸行無常 | category | life | change |
| 10 | 一念発起 | structure | 修飾 | 主述 |

※idx 26 雲散霧消のcategory変更（nature→change）は不採用。自然現象の比喩ではあるが、nature分類はユーザーがヒントとして使う場面で有用。

### Batch 2 (idx 25-49)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 34 | 感慨無量 | structure | 修飾 | 主述 |
| 42 | 弱肉強食 | structure | 因果 | 並列 |
| 45 | 呉越同舟 | structure | 修飾 | 主述 |

※idx 36 疑心暗鬼のstructure変更（主述→因果）は不採用。R3で主述に変更済み。「疑心が暗鬼を生む」は主述構造であり因果ではない。

### Batch 3 (idx 50-74)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 51 | 温故知新 | structure | 対義 | 並列 |
| 57 | 理路整然 | origin | 漢籍 | 日本語由来 |
| 59 | 古今東西 | origin | 漢籍 | 日本語由来 |
| 61 | 一騎当千 | origin | 漢籍 | 日本語由来 |
| 62 | 四面楚歌 | origin | 故事 | 漢籍 |
| 63 | 戦々恐々 | category | conflict | emotion |
| 69 | 日進月歩 | origin | 漢籍 | 日本語由来 |

### Batch 4 (idx 75-99)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 75 | 前代未聞 | origin | 不明 | 日本語由来 |
| 75 | 前代未聞 | category | change | knowledge |
| 77 | 一刀両断 | category | effort | life |
| 78 | 本末転倒 | structure | 対義 | 主述 |
| 85 | 言行一致 | structure | 修飾 | 主述 |
| 87 | 天真爛漫 | category | virtue | emotion |
| 93 | 優柔不断 | structure | 修飾 | 類義 |
| 97 | 朝三暮四 | origin | 故事 | 漢籍 |
| 99 | 猪突猛進 | origin | 不明 | 日本語由来 |

※idx 92 傲慢不遜のorigin変更は不採用。四字熟語としての漢籍出典が特定できないため現状の「不明」を維持。

### Batch 5 (idx 100-124)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 110 | 天下泰平 | structure | 修飾 | 主述 |
| 114 | 自給自足 | origin | 漢籍 | 日本語由来 |
| 115 | 波瀾万丈 | origin | 漢籍 | 日本語由来 |
| 116 | 立身出世 | origin | 仏典 | 日本語由来 |
| 117 | 独立独歩 | origin | 不明 | 日本語由来 |

### Batch 6 (idx 125-149)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 137 | 春風駘蕩 | category | life | nature |
| 141 | 孤軍奮闘 | origin | 漢籍 | 日本語由来 |
| 142 | 刻苦勉励 | origin | 漢籍 | 日本語由来 |
| 143 | 蛍雪之功 | origin | 故事 | 漢籍 |

### Batch 7 (idx 150-174)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 150 | 心機一転 | category | effort | change |
| 157 | 愚公移山 | origin | 故事 | 漢籍 |
| 167 | 光風霽月 | category | nature | virtue |
| 173 | 百花繚乱 | structure | 修飾 | 主述 |

### Batch 8 (idx 175-199)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 175 | 天地開闢 | structure | 修飾 | 主述 |
| 176 | 一天四海 | origin | 不明 | 仏典 |
| 178 | 三寒四温 | origin | 不明 | 故事 |
| 185 | 一衣帯水 | origin | 故事 | 漢籍 |
| 188 | 怒髪衝天 | origin | 故事 | 漢籍 |

