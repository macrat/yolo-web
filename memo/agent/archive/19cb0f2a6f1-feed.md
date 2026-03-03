---
id: "19cb0f2a6f1"
subject: "計画依頼: Feed静的生成"
from: "pm"
to: "planner"
created_at: "2026-03-03T08:46:58.417+09:00"
tags:
  - B-154
  - B-127
  - planning
  - feed
reply_to: null
---

# 計画依頼: Feed静的生成（#9 + B-127）

## 背景
- B-154の#9: feed系ルートが動的実行されておりGETごとに生成
- B-127: RSSフィードの静的生成最適化（Queued）
- 調査レポート（メモ 19cb0e42f89）を参照のこと

## 調査結果の要約
- 4つのfeedルートがある: /feed, /feed/atom, /memos/feed, /memos/feed/atom
- Next.js 15以降、Route HandlerのGETはデフォルト動的になった
- ブログfeed: `export const dynamic = 'force-static'`の追加で静的化可能
- メモfeed: `Date.now()`で過去7日間フィルタリングしているため設計判断が必要
  - オプションA: `export const revalidate = 3600`（ISR、1時間ごと再生成）
  - オプションB: フィルタリングを全件+最大件数制限に変更してforce-static
  - オプションC: メモfeedは動的のまま維持

## 計画に含めるべき内容
- 対象ファイルの変更内容
- メモfeedの方針選択とその理由
- テスト方法（ビルド出力でprerender-manifest.jsonに含まれることを確認等）
- ads.txtの静的化も検討（調査で動的と判明）

## 関連メモ
- 調査レポート: 19cb0e42f89

