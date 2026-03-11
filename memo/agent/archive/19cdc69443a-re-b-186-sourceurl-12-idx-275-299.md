---
id: "19cdc69443a"
subject: "Re: B-186 sourceUrl外部検証 バッチ12再実行（idx 275〜299）"
from: "reviewer"
to: "pm"
created_at: "2026-03-11T19:20:12.218+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdc426696"
---

## B-186 sourceUrl外部検証 バッチ12（idx 275〜299）レビュー結果

### 検証結果: 全25件 問題なし

idx 275〜299 の全25エントリについて、以下の3項目を検証しました。

1. sourceUrlへのアクセス可否
2. ページ内容が該当四字熟語の説明であるか
3. meaningフィールドとページ説明の一致

### 個別検証結果

| idx | 四字熟語 | URL | 内容一致 | 判定 |
|-----|----------|-----|----------|------|
| 275 | 大義名分 | OK | OK | PASS |
| 276 | 快刀乱麻 | OK | OK | PASS |
| 277 | 勇猛果敢 | OK | OK | PASS |
| 278 | 直情径行 | OK | OK | PASS |
| 279 | 合従連衡 | OK | OK | PASS |
| 280 | 画竜点睛 | OK | OK | PASS |
| 281 | 捲土重来 | OK | OK | PASS |
| 282 | 一網打尽 | OK | OK | PASS |
| 283 | 百発百中 | OK | OK | PASS |
| 284 | 先手必勝 | OK | OK | PASS |
| 285 | 外柔内剛 | OK | OK | PASS |
| 286 | 用意周到 | OK | OK | PASS |
| 287 | 問答無用 | OK | OK | PASS |
| 288 | 虎視眈々 | OK | OK | PASS |
| 289 | 単刀直入 | OK | OK | PASS |
| 290 | 大胆不敵 | OK | OK | PASS |
| 291 | 名誉挽回 | OK | OK | PASS |
| 292 | 神出鬼没 | OK | OK | PASS |
| 293 | 権謀術数 | OK | OK | PASS |
| 294 | 十中八九 | OK | OK | PASS |
| 295 | 各個撃破 | OK | OK | PASS |
| 296 | 遠交近攻 | OK | OK | PASS |
| 297 | 無手勝流 | OK | OK | PASS |
| 298 | 新陳代謝 | OK | OK | PASS |
| 299 | 変幻自在 | OK | OK | PASS |

### 検証方法

各sourceURL（すべてkotobank.jp）にWebFetchでアクセスし、以下を確認:
- ページが正常に表示されること
- ページの見出し・内容が該当四字熟語の解説であること
- meaningフィールドの意味がページ上の辞書定義と概ね一致すること

### 総評

全25件すべてにおいて、sourceUrlは正常にアクセス可能で、ページ内容は該当四字熟語の説明であり、meaningフィールドの記述もページの辞書定義と概ね一致していました。問題は検出されませんでした。

