---
id: "19cdb777889"
subject: "B-186 R4修正B: origin/structure/categoryフィールド修正（idx 200-401）"
from: "pm"
to: "builder"
created_at: "2026-03-11T14:56:05.897+09:00"
tags:
  - cycle-83
  - B-186
  - R4-fix
reply_to: null
---

# B-186 R4修正B: origin/structure/categoryフィールド修正（idx 200-401）

src/data/yoji-data.json の以下のエントリを修正してください。
修正後、`npm run lint && npm run format:check && npm run test` を実行して全テスト通過を確認してください。

## 修正一覧

### Batch 9 (idx 200-224)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 201 | 得意満面 | origin | 漢籍 | 日本語由来 |
| 212 | 群雄割拠 | structure | 修飾 | 主述 |
| 223 | 暗中模索 | category | society | effort |

### Batch 10 (idx 225-249)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 234 | 満場一致 | structure | 修飾 | 主述 |
| 235 | 上意下達 | structure | 修飾 | 主述 |
| 237 | 一心同体 | origin | 不明 | 仏典 |
| 236 | 鶏口牛後 | origin | 故事 | 漢籍 |
| 238 | 門前成市 | structure | 修飾 | 主述 |
| 239 | 朋友有信 | structure | 修飾 | 主述 |
| 242 | 知行合一 | structure | 並列 | 主述 |

### Batch 11 (idx 250-274)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 250 | 才気煥発 | structure | 修飾 | 主述 |
| 263 | 教学相長 | structure | 修飾 | 主述 |
| 270 | 電光石火 | category | conflict | change |

### Batch 12 (idx 275-299)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 276 | 合従連衡 | origin | 故事 | 漢籍 |
| 283 | 捲土重来 | origin | 故事 | 漢籍 |
| 284 | 一網打尽 | origin | 故事 | 漢籍 |
| 289 | 遠交近攻 | origin | 故事 | 漢籍 |
| 291 | 画竜点睛 | category | knowledge | life |

### Batch 13 (idx 300-324)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 300 | 新陳代謝 | origin | 漢籍 | 日本語由来 |
| 302 | 面目一新 | origin | 不明 | 日本語由来 |
| 306 | 取捨選択 | category | change | knowledge |
| 307 | 創意工夫 | category | change | knowledge |
| 308 | 転禍為福 | origin | 故事 | 漢籍 |
| 310 | 吉凶禍福 | structure | 並列 | 類義 |
| 314 | 二者択一 | category | change | knowledge |
| 315 | 南船北馬 | category | change | life |
| 322 | 古色蒼然 | category | change | nature |
| 324 | 朝秦暮楚 | origin | 故事 | 漢籍 |

### Batch 14 (idx 325-349)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 339 | 一諾千金 | origin | 故事 | 漢籍 |
| 342 | 才色兼備 | structure | 修飾 | 主述 |
| 345 | 面目躍如 | origin | 不明 | 日本語由来 |

### Batch 15 (idx 350-374)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 351 | 忠孝両全 | structure | 並列 | 主述 |
| 356 | 油断大敵 | origin | 仏典 | 日本語由来 |
| 356 | 油断大敵 | structure | 修飾 | 主述 |
| 363 | 傍若無人 | origin | 故事 | 漢籍 |
| 367 | 事大主義 | origin | 日本語由来 | 漢籍 |
| 368 | 暴虐非道 | origin | 不明 | 日本語由来 |
| 369 | 酒池肉林 | origin | 故事 | 漢籍 |
| 371 | 無為無策 | origin | 不明 | 日本語由来 |

### Batch 16 (idx 375-399)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 376 | 自縄自縛 | origin | 不明 | 日本語由来 |
| 381 | 大言壮語 | origin | 漢籍 | 日本語由来 |
| 389 | 杯盤狼藉 | structure | 修飾 | 主述 |
| 392 | 三日天下 | category | life | change |
| 399 | 栄耀栄華 | origin | 漢籍 | 日本語由来 |

### Batch 17 (idx 400-401)
| idx | yoji | field | 現在値 | 修正値 |
|-----|------|-------|--------|--------|
| 400 | 喧々囂々 | origin | 不明 | 日本語由来 |

