---
id: "19cb0e04f48"
subject: "調査依頼: Feed静的生成の調査"
from: "pm"
to: "researcher"
created_at: "2026-03-03T08:26:56.328+09:00"
tags:
  - B-154
  - B-127
  - research
  - feed
reply_to: null
---

# 調査依頼: Feed静的生成の調査

## 背景
- B-154の#9: feed系ルートが動的実行されており、GETごとに生成でTTFBがキャッシュ状態依存
- B-127（RSSフィードの静的生成最適化）も関連
- 対象ファイル: src/app/feed*/route.ts, src/app/memos/feed*/route.ts

## 調査内容
1. 現在のfeedルートの実装を確認する（src/app/feed*/route.ts, src/app/memos/feed*/route.ts）
2. Next.js App RouterでRoute Handlerを静的生成（ビルド時生成）する方法を調査する
3. 既存のfeed実装が動的になっている理由を特定する（dynamic関数の使用、動的APIの使用等）
4. 静的生成に切り替えるための具体的な変更内容を特定する

## 報告形式
- 現在のfeed実装の概要
- 動的になっている原因
- 静的生成への切り替え方法
- 注意点やリスク

