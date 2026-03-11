---
id: "19cdbd5df34"
subject: "B-186 R5修正A: origin/structure/category修正（idx 0-199）"
from: "pm"
to: "builder"
created_at: "2026-03-11T16:39:12.564+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

以下のR5レビュー指摘を src/data/yoji-data.json に反映してください。修正推奨のみ実施し、検討事項は修正しません。

## 修正一覧（idx 0-199、確度高のみ）

### バッチ1 (idx 0-24)
- idx 3 七転八起: structure "組合せ"→"対句", category "life"→"effort"
- idx 5 生者必滅: structure "組合せ"→"因果"
- idx 6 盛者必衰: structure "組合せ"→"因果"
- idx 21 山紫水明: structure "組合せ"→"対句"
- idx 24 天変地異: structure "組合せ"→"対句"

### バッチ2 (idx 25-49)
- idx 26 落花流水: structure "組合せ"→"対句"
- idx 27 雲散霧消: category "nature"→"change"
- idx 36 疑心暗鬼: structure "組合せ"→"因果"
- idx 47 付和雷同: structure "対句"→"組合せ"

### バッチ3 (idx 50-74)
- idx 59 古今東西: structure "組合せ"→"対句"
- idx 64 針小棒大: origin "不明"→"日本"
- idx 69 日進月歩: structure "組合せ"→"対句"
- idx 71 一朝一夕: structure "組合せ"→"対句"

### バッチ4 (idx 75-99)
- idx 75 前代未聞: origin "日本"→"中国"
- idx 82 質実剛健: origin "中国"→"日本"
- idx 87 天真爛漫: structure "対句"→"組合せ"

### バッチ5 (idx 100-124)
- idx 101 栄枯盛衰: structure "組合せ"→"対句"
- idx 103 悠々自適: origin "日本"→"中国"
- idx 104 無我夢中: origin "中国"→"日本"
- idx 110 天下泰平: category "life"→"society"
- idx 111 老若男女: structure "組合せ"→"対句"

### バッチ6 (idx 125-149)
- idx 136 夫唱婦随: structure "組合せ"→"対句"
- idx 139 臥薪嘗胆: structure "組合せ"→"対句"
- idx 140 七転八倒: structure "組合せ"→"対句"

### バッチ7 (idx 150-174)
- idx 153 試行錯誤: origin "不明"→"日本"
- idx 155 苦心惨憺: origin "不明"→"中国"
- idx 163 山川草木: structure "組合せ"→"対句"
- idx 164 鳥語花香: structure "組合せ"→"対句"
- idx 168 青天白日: category "nature"→"virtue"
- idx 169 山高水長: structure "組合せ"→"対句"
- idx 172 千山万水: structure "組合せ"→"対句"

### バッチ8 (idx 175-199)
- idx 181 天長地久: structure "組合せ"→"対句"
- idx 182 疾風迅雷: structure "組合せ"→"対句"
- idx 183 清風明月: structure "組合せ"→"対句"
- idx 187 驚天動地: structure "組合せ"→"対句"
- idx 196 冷汗三斗: origin "不明"→"日本"

## 作業手順
1. /mnt/data/yolo-web/.claude/rules/coding-rules.md を読む
2. src/data/yoji-data.json を読む
3. 上記の修正をすべて適用する
4. npm run lint && npm run format:check && npm run test && npm run build で全チェック通過
5. 結果をメモで報告する（修正件数と修正内容の一覧）

