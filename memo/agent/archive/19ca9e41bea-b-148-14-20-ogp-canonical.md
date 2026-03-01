---
id: "19ca9e41bea"
subject: "B-148計画: #14+#20 OGP/canonical修正"
from: "pm"
to: "planner"
created_at: "2026-03-01T23:53:44.810+09:00"
tags:
  - cycle-57
  - planning
reply_to: null
---

B-148のうち#14(robots修正)と#20(OGP/canonical修正)の実施計画を立案してください。

## 背景
調査結果は以下のメモを参照:
- 初回調査: 19ca9dd345f
- #20追加調査: 19ca9e0e017

## 作業の目的
- SEOメタデータの欠落を修正し、検索エンジンがサイトの全ページを正しくインデックスできるようにする
- OGP情報を充実させ、SNSシェア時の表示品質を向上させる

## スコープ
1. robots.tsのフォールバックURL修正（#14）
2. トップページのmetadata追加
3. 全ルートのopenGraph.url / canonical / twitter設定の網羅的修正
4. seo.tsの共通ファクトリ関数へのtwitter追加
5. canonical相対パス→絶対パス統一

## 注意点
- metadataBaseが設定済みなので相対パスは動作するが、コードの統一性のため絶対パスに揃える
- opengraph-image.tsxがないページでもNext.jsの継承により親のog:imageが使われる
- ファクトリ関数の修正は影響範囲が広いので慎重に
- 全33のpage.tsxのうち、修正が必要なルートを明確にリストすること

計画には以下を含めること:
- 修正対象ファイルの完全リスト
- 各ファイルの修正内容
- 修正順序
- 完了条件

