---
id: "19cdbd61dc7"
subject: "B-186 R5修正B: origin/structure/category修正（idx 200-401）"
from: "pm"
to: "builder"
created_at: "2026-03-11T16:39:28.583+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

以下のR5レビュー指摘を src/data/yoji-data.json に反映してください。修正推奨のみ実施し、検討事項は修正しません。

## 修正一覧（idx 200-401、確度高のみ）

### バッチ9 (idx 200-224)
- idx 200 意馬心猿: structure "組合せ"→"対句"
- idx 207 悲歌慷慨: structure "組合せ"→"対句"
- idx 208 自画自賛: origin "日本"→"中国"
- idx 213 信賞必罰: structure "組合せ"→"対句"
- idx 216 一致団結: structure "対句"→"組合せ"
- idx 221 一家団欒: category "society"→"life"

### バッチ10 (idx 225-249)
- idx 237 一心同体: origin "中国"→"日本"
- idx 241 一問一答: origin "日本"→"中国", structure "組合せ"→"対句"
- idx 247 三省吾身: category "knowledge"→"virtue"

### バッチ11 (idx 250-274)
- idx 255 二律背反: origin "不明"→"日本"
- idx 257 自問自答: structure "組合せ"→"対句"
- idx 265 不学無術: category "knowledge"→"negative"
- idx 267 耳聡目明: structure "組合せ"→"対句"
- idx 270 電光石火: structure "組合せ"→"対句"

### バッチ12 (idx 275-299)
- idx 275 連戦連勝: structure "組合せ"→"対句"
- idx 276 速戦即決: origin "日本"→"中国"
- idx 283 捲土重来: category "conflict"→"effort"
- idx 285 百発百中: structure "組合せ"→"対句"
- idx 291 単刀直入: category "conflict"→"life"
- idx 294 神出鬼没: structure "組合せ"→"対句"
- idx 295 権謀術数: structure "組合せ"→"対句"

### バッチ13 (idx 300-324)
- idx 300 新陳代謝: origin "日本"→"不明"
- idx 320 因循姑息: structure "対句"→"組合せ"
- idx 321 抜本塞源: structure "組合せ"→"対句"

### バッチ14 (idx 325-349)
- idx 327 至誠通天: structure "組合せ"→"因果"
- idx 329 克己復礼: structure "因果"→"組合せ"
- idx 332 剛毅木訥: structure "組合せ"→"対句"

### バッチ15 (idx 350-374)
- idx 357 暴飲暴食: structure "組合せ"→"対句"
- idx 360 是非善悪: structure "組合せ"→"対句"
- idx 369 酒池肉林: structure "組合せ"→"対句"

### バッチ16 (idx 375-399)
- idx 375 右顧左眄: structure "組合せ"→"対句"
- idx 381 大言壮語: origin "日本"→"中国"
- idx 393 自然淘汰: origin "不明"→"日本"
- idx 398 飽食暖衣: structure "組合せ"→"対句"

## 作業手順
1. /mnt/data/yolo-web/.claude/rules/coding-rules.md を読む
2. src/data/yoji-data.json を読む
3. 上記の修正をすべて適用する
4. npm run lint && npm run format:check && npm run test && npm run build で全チェック通過
5. 結果をメモで報告する（修正件数と修正内容の一覧）

